import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { canonicalJson, dimensions, elapsed, normalizeAttempt, phaseName, repositoryName, runnerProvider, timestamp, type Json } from "../scripts/ci-metrics-model.ts";
import { collectRun, discoverRuns, main, pages, readRecords, writeJson, type Api } from "../scripts/ci-metrics.ts";
import { buildReport, renderReport, statistics } from "../scripts/ci-metrics-report.ts";

const repository = "Mesh-LLM/mesh-packaging";
const run = { id: 42, run_attempt: 1, name: "Mesh LLM Packaging Release", workflow_id: 3, path: ".github/workflows/images-release.yml", event: "repository_dispatch", head_branch: "main", head_sha: "a".repeat(40), status: "completed", conclusion: "success", created_at: "2026-08-01T00:00:00Z", run_started_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:01:00Z" };
const job = { id: 101, name: "Package and image ubuntu-cuda-13.1.2-amd64 / Produce native package", status: "completed", conclusion: "success", created_at: "2026-08-01T00:00:01Z", started_at: "2026-08-01T00:00:11Z", completed_at: "2026-08-01T00:00:51Z", labels: ["ubuntu-24.04"], runner_name: "GitHub Actions 123", steps: [{ number: 1, name: "Run actions/download-artifact@v8", conclusion: "success", started_at: "2026-08-01T00:00:11Z", completed_at: "2026-08-01T00:00:31Z" }] };

function directory(t: { after(fn: () => void): void }) {
  const root = mkdtempSync(resolve(tmpdir(), "ci-metrics-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function fixtureApi(overrides: Record<string, Json> = {}): Api {
  const prefix = `repos/${repository}/actions/runs/42`;
  const responses = {
    [prefix]: run,
    [`${prefix}/attempts/1`]: run,
    [`${prefix}/artifacts?per_page=100&page=1`]: { total_count: 1, artifacts: [{ id: 1, name: "package", size_in_bytes: 100, expired: true }] },
    [`${prefix}/attempts/1/jobs?per_page=100&page=1`]: { total_count: 1, jobs: [job] },
    ...overrides,
  };
  return async (path) => {
    assert.ok(Object.hasOwn(responses, path), `Unexpected API path: ${path}`);
    return responses[path];
  };
}

test("queue, execution, artifact and phase facts remain distinct", () => {
  const record = normalizeAttempt(repository, run, [job], [{ id: 1, size_in_bytes: 100, expired: true }]);
  assert.equal(record.jobs[0].queue_seconds, 10);
  assert.equal(record.jobs[0].execution_seconds, 40);
  assert.equal(record.jobs[0].steps[0].execution_seconds, 20);
  assert.equal(record.jobs[0].steps[0].phase, "artifact_download");
  assert.equal(record.timing.attempt_elapsed_seconds, 51);
  assert.equal(record.timing.job_execution_seconds, 40);
  assert.equal(record.artifacts.bytes, 100);
  assert.equal(record.artifacts.scope, "run_not_attempt");
  assert.equal(record.jobs[0].runner.provider, "github-hosted");
  assert.equal(record.jobs[0].dimensions.backend_version, "13.1.2");
});

test("rerun reused jobs cannot inflate execution, queue or comparisons", () => {
  const rerun = { ...run, run_attempt: 2, run_started_at: "2026-08-01T01:00:00Z", updated_at: "2026-08-01T01:02:00Z" };
  const reused = { ...job, created_at: "2026-08-01T01:00:02Z" };
  const executed = { ...job, id: 102, created_at: "2026-08-01T01:00:02Z", started_at: "2026-08-01T01:00:12Z", completed_at: "2026-08-01T01:01:12Z" };
  const record = normalizeAttempt(repository, rerun, [reused, executed], [], run);
  assert.equal(record.jobs[0].reused_from_previous_attempt, true);
  assert.equal(record.jobs[0].queue_seconds, null);
  assert.equal(record.jobs[0].execution_seconds, null);
  assert.equal(record.jobs[0].steps[0].execution_seconds, null);
  assert.equal(record.timing.job_execution_seconds, 60);
  assert.equal(record.timing.rerun_delay_seconds, 3540);
  assert.equal(record.timing.attempt_elapsed_seconds, 72);
  assert.equal(buildReport([record]).cohorts[0].total_samples, 1);
});

test("unknown and impossible measurements stay null", () => {
  assert.equal(elapsed(undefined, run.updated_at), null);
  assert.equal(elapsed(run.updated_at, run.created_at), null);
  assert.equal(timestamp("not-a-date"), null);
  const record = normalizeAttempt(repository, run, [{ ...job, created_at: null }, { ...job, id: 102, completed_at: null }], [{ id: 1 }]);
  assert.equal(record.jobs[0].queue_seconds, null);
  assert.equal(record.jobs[1].execution_seconds, null);
  assert.equal(record.timing.job_execution_seconds, null);
  assert.equal(record.artifacts.bytes, null);
  assert.equal(normalizeAttempt(repository, run, [], null).artifacts.bytes, null);
  assert.equal(normalizeAttempt(repository, run, [], []).timing.attempt_elapsed_seconds, null);
  assert.equal(normalizeAttempt(repository, run, [{ ...job, conclusion: "skipped" }], []).jobs[0].execution_seconds, null);
  assert.throws(() => normalizeAttempt(repository, { ...run, id: -1 }, [], []), /positive integers/);
});

test("provider classification preserves self-hosted and unavailable labels", () => {
  assert.equal(runnerProvider(["depot-ubuntu-24.04-4"]), "depot");
  assert.equal(runnerProvider(["self-hosted", "ubuntu-24.04", "gpu-nvidia"]), "self-hosted");
  assert.equal(runnerProvider(["macos-15"]), "github-hosted");
  assert.equal(runnerProvider([]), null);
  assert.equal(dimensions("Build native runtime Linux aarch64 CUDA (12)", []).arch, "arm64");
  assert.equal(dimensions("Compose ROCm", []).backend, "rocm");
  assert.equal(dimensions("Compose Vulkan", []).backend, "vulkan");
  assert.equal(dimensions("macOS Metal", []).backend, "metal");
  assert.equal(dimensions("CPU product", []).backend, "cpu");
  assert.equal(dimensions("Resolve metadata", []).backend, null);
});

test("phase names distinguish transfer, build and QA", () => {
  const names = ["Upload native runtime", "Pull and test the exact staged digest", "Verify and install package", "Build and push one run-scoped staging image", "Build native package from verified upstream product bundle", "Initialize containers", "Compose CUDA product", "Set up job"];
  assert.deepEqual(names.map(phaseName), ["artifact_upload", "image_pull_and_qa", "package_qa", "image_build", "package_build", "container_setup", "compose", null]);
});

test("runner image families preserve environment and compact ID without inventing toolkit versions", () => {
  const repository = "Mesh-LLM/mesh-llm-runner-images";
  for (const [id, backend] of [["cuda12", "cuda"], ["cuda13", "cuda"], ["rocm70", "rocm"], ["rocm72", "rocm"], ["web", "web"], ["cpu", "cpu"], ["vulkan", "vulkan"]]) {
    const name = `Stage public ${id} / public ${id} amd64`;
    const record = normalizeAttempt(repository, run, [{ ...job, name }], []);
    const facts = record.jobs[0].dimensions;
    assert.equal(facts.backend, backend);
    assert.equal(facts.backend_version, null);
    assert.equal(facts.image_backend_id, id);
    assert.equal(facts.image_environment, "public");
    assert.equal(facts.arch, "amd64");
    assert.equal(record.jobs[0].runner.provider, "github-hosted");
  }
  const facts = dimensions("Validate self-hosted cuda12 / self-hosted cuda12 arm64", ["depot-ubuntu-24.04-4"], repository);
  assert.equal(facts.image_environment, "self-hosted");
  assert.equal(facts.arch, "arm64");
  assert.equal(dimensions("public cuda12", [], "Mesh-LLM/mesh-packaging").image_backend_id, null);
  assert.equal(dimensions("Stage public cuda12 / public cuda13 amd64", [], repository).image_backend_id, null);
});

test("runner image phases classify observed steps and keep post actions out of build time", () => {
  const phases = new Map([
    ["Build platform image once", "image_build"],
    ["Verify exact staged platform digest", "image_verification"],
    ["Assemble and validate immutable family index", "image_index_and_qa"],
    ["Assemble and validate compatibility index", "image_index_and_qa"],
    ["Promote verified versioned tags", "image_promotion"],
    ["Upload verified family candidate", "artifact_upload"],
    ["Upload manifest bundles", "artifact_upload"],
    ["Download CUDA 12 AMD64 platform candidate", "artifact_download"],
    ["Download verified platform candidates", "artifact_download"],
    ["Download complete verified candidate cohort", "artifact_download"],
  ]);
  for (const [name, phase] of phases) assert.equal(phaseName(name), phase, name);
  for (const name of ["Post Build platform image once", "Post Run actions/upload-artifact@v7", "Record Depot build metrics", "Validate Depot remote builder configuration"]) assert.equal(phaseName(name), null, name);
});

test("collector persists deterministic per-attempt records without artifacts", async (t) => {
  const root = directory(t);
  const files = await collectRun(fixtureApi(), repository, 42, root);
  assert.equal(files.length, 1);
  const before = readFileSync(files[0], "utf8");
  await collectRun(fixtureApi(), repository, 42, root);
  assert.equal(readFileSync(files[0], "utf8"), before);
  assert.equal(readRecords(root)[0].artifacts.items[0].expired, true);
  assert.deepEqual(readdirSync(root), ["records"]);
});

test("refresh preserves deleted artifact metadata and remains idempotent", async (t) => {
  const root = directory(t);
  const files = await collectRun(fixtureApi(), repository, 42, root);
  const empty = fixtureApi({ [`repos/${repository}/actions/runs/42/artifacts?per_page=100&page=1`]: { total_count: 0, artifacts: [] } });
  await collectRun(empty, repository, 42, root);
  const record = readRecords(root)[0];
  assert.equal(record.artifacts.bytes, 100);
  assert.equal(record.artifacts.currently_listed_bytes, 0);
  assert.deepEqual(record.artifacts.items.map((artifact: Json) => ({ id: artifact.id, name: artifact.name, listed: artifact.listed_in_latest_response })), [{ id: 1, name: "package", listed: false }]);
  const before = readFileSync(files[0], "utf8");
  await collectRun(empty, repository, 42, root);
  assert.equal(readFileSync(files[0], "utf8"), before);
});

test("expired refresh retains known immutable size and never turns unknown history into zero", async (t) => {
  const root = directory(t);
  const endpoint = `repos/${repository}/actions/runs/42/artifacts?per_page=100&page=1`;
  await collectRun(fixtureApi({ [endpoint]: { total_count: 1, artifacts: [{ id: 1, name: "package", size_in_bytes: 100, expired: false }] } }), repository, 42, root);
  await collectRun(fixtureApi({ [endpoint]: { total_count: 1, artifacts: [{ id: 1, expired: true }] } }), repository, 42, root);
  let record = readRecords(root)[0];
  assert.equal(record.artifacts.bytes, 100);
  assert.equal(record.artifacts.currently_listed_bytes, null);
  assert.equal(record.artifacts.items[0].expired, true);
  assert.equal(record.artifacts.items[0].listed_in_latest_response, true);
  await collectRun(fixtureApi({ [endpoint]: { total_count: 1, artifacts: [{ id: 2, name: "unknown-size" }] } }), repository, 42, root);
  await collectRun(fixtureApi({ [endpoint]: { total_count: 0, artifacts: [] } }), repository, 42, root);
  record = readRecords(root)[0];
  assert.equal(record.artifacts.items.length, 2);
  assert.equal(record.artifacts.bytes, null);
  assert.equal(record.artifacts.items[0].size_in_bytes, 100);
  assert.equal(record.artifacts.items[1].size_in_bytes, null);
});

test("artifact history cannot cross source identity or immutable ID conflicts", async (t) => {
  const root = directory(t);
  const files = await collectRun(fixtureApi(), repository, 42, root);
  const original = JSON.parse(readFileSync(files[0], "utf8"));
  for (const replacement of [{ head_sha: "b".repeat(40) }, { run_id: 43 }, { repository: "Mesh-LLM/mesh-llm" }, { workflow: { ...original.workflow, id: 4 } }]) {
    writeJson(files[0], { ...original, ...replacement });
    await assert.rejects(collectRun(fixtureApi(), repository, 42, root), /Stored metrics identity/);
  }
  writeJson(files[0], original);
  const endpoint = `repos/${repository}/actions/runs/42/artifacts?per_page=100&page=1`;
  await assert.rejects(collectRun(fixtureApi({ [endpoint]: { total_count: 1, artifacts: [{ id: 1, name: "package", size_in_bytes: 200 }] } }), repository, 42, root), /Conflicting metadata/);
});

test("collector requests every exact attempt and records failed predecessor", async (t) => {
  const root = directory(t);
  const prefix = `repos/${repository}/actions/runs/42`;
  const failed = { ...run, conclusion: "failure" };
  const second = { ...run, run_attempt: 2, created_at: "2026-09-01T01:00:02Z", run_started_at: "2026-09-01T01:00:00Z" };
  const latest = { ...second, created_at: run.created_at };
  const api = fixtureApi({ [prefix]: latest, [`${prefix}/attempts/1`]: failed, [`${prefix}/attempts/2`]: second, [`${prefix}/attempts/2/jobs?per_page=100&page=1`]: { total_count: 1, jobs: [job] } });
  assert.equal((await collectRun(api, repository, 42, root)).length, 2);
  const records = readRecords(root);
  assert.equal(records[0].conclusion, "failure");
  assert.equal(records[1].run_attempt, 2);
  assert.equal(records[1].jobs[0].reused_from_previous_attempt, true);
  const empty = fixtureApi({ [prefix]: latest, [`${prefix}/attempts/1`]: failed, [`${prefix}/attempts/2`]: second, [`${prefix}/attempts/2/jobs?per_page=100&page=1`]: { total_count: 1, jobs: [job] }, [`${prefix}/artifacts?per_page=100&page=1`]: { total_count: 0, artifacts: [] } });
  await collectRun(empty, repository, 42, root);
  for (const stored of readRecords(root)) {
    assert.equal(stored.artifacts.bytes, 100);
    assert.equal(stored.artifacts.items.length, 1);
  }
});

test("collection rejects untrusted workflows, identities and excessive attempts", async (t) => {
  const root = directory(t);
  const prefix = `repos/${repository}/actions/runs/42`;
  assert.throws(() => repositoryName("other/repo"), /not allowed/);
  assert.equal(repositoryName("mesh-llm/MESH-packaging"), repository);
  await assert.rejects(collectRun(fixtureApi(), repository, -1, root), /positive/);
  await assert.rejects(collectRun(fixtureApi({ [prefix]: { ...run, path: ".github/workflows/untrusted.yml" } }), repository, 42, root), /not allowed/);
  await assert.rejects(collectRun(fixtureApi({ [prefix]: { ...run, run_attempt: 21 } }), repository, 42, root), /bound/);
  await assert.rejects(collectRun(fixtureApi({ [`${prefix}/attempts/1`]: { ...run, run_attempt: 2 } }), repository, 42, root), /mismatched/);
  assert.deepEqual(await collectRun(fixtureApi({ [`${prefix}/attempts/1`]: { ...run, status: "in_progress" } }), repository, 42, root), []);
});

test("pagination never reports a truncated aggregate as complete", async () => {
  let calls = 0;
  assert.equal((await pages(async () => ({ total_count: 2, jobs: [{ id: ++calls }] }), "jobs", "jobs")).length, 2);
  await assert.rejects(pages(async () => ({ total_count: 2, jobs: [{ id: 1 }] }), "jobs", "jobs", 1), /bound/);
  await assert.rejects(pages(async () => ({ total_count: 2, jobs: [] }), "jobs", "jobs"), /Incomplete/);
  await assert.rejects(pages(async () => ({}), "jobs", "jobs"), /Invalid/);
});

test("reconciliation prioritizes missing runs over refreshing newest stored runs", async () => {
  const api: Api = async () => ({ workflow_runs: [{ id: 43, run_attempt: 1, created_at: "2026-08-02" }, { id: 42, run_attempt: 1, created_at: "2026-08-01" }] });
  assert.deepEqual(await discoverRuns(api, repository, "2026-08-01", "2026-08-02", 1), [43]);
  assert.deepEqual(await discoverRuns(api, repository, "2026-08-01", "2026-08-02", 1, [{ repository, run_id: 43, run_attempt: 1 }]), [42]);
});

function observations(count: number, labels = ["ubuntu-24.04"]): Json[] {
  return Array.from({ length: count }, (_, index) => {
    const record = normalizeAttempt(repository, { ...run, id: index + 1 }, [{ ...job, labels }], []);
    record.jobs[0].queue_seconds = index < count / 2 ? 10 : 1000;
    record.jobs[0].execution_seconds = 40;
    return record;
  });
}

test("queue incidents cannot be mislabeled as execution regressions", () => {
  const report = buildReport(observations(10));
  assert.equal(report.cohorts[0].queue.status, "regression_signal");
  assert.equal(report.cohorts[0].execution.status, "within_threshold");
  assert.equal(report.cohorts[0].queue.baseline.count, 5);
  assert.equal(report.cohorts[0].queue.candidate.count, 5);
  assert.match(renderReport(report), /not proof of a cause/);
});

test("minimum samples and provider, branch, outcome, toolkit and attempt cohorts stay separate", () => {
  assert.equal(buildReport(observations(9)).cohorts[0].queue.status, "insufficient_samples");
  const records = observations(10);
  records[0].jobs[0].runner.provider = "depot";
  records[1].branch = "feature";
  records[2].jobs[0].conclusion = "failure";
  records[3].run_attempt = 2;
  records[4].jobs[0].dimensions.backend_version = "12.9.2";
  const report = buildReport(records);
  assert.equal(report.cohorts.length, 6);
  assert.ok(report.cohorts.every((cohort) => cohort.queue.status === "insufficient_samples"));
  assert.throws(() => buildReport(records, { minSamples: 5, window: 4, regressionPercent: 20 }), /window/);
});

test("unknown provider and ambiguous same-name matrix jobs cannot support comparisons", () => {
  const unknown = buildReport(observations(10, []));
  assert.equal(unknown.cohorts[0].comparison_eligible, false);
  assert.equal(unknown.cohorts[0].queue.status, "insufficient_samples");
  const duplicateJobs = observations(10).map((record) => ({ ...record, jobs: [record.jobs[0], { ...record.jobs[0], id: 102 }] }));
  const ambiguous = buildReport(duplicateJobs).cohorts[0];
  assert.equal(ambiguous.total_samples, 0);
  assert.equal(ambiguous.excluded_ambiguous_samples, 20);
  assert.equal(ambiguous.queue.status, "insufficient_samples");
});

test("reruns do not supply independent samples for one source run", () => {
  const records = observations(10).map((record, index) => ({ ...record, run_id: 42, run_attempt: index + 2 }));
  const cohort = buildReport(records).cohorts[0];
  assert.equal(cohort.total_samples, 1);
  assert.equal(cohort.queue.status, "insufficient_samples");
});

test("missing metrics and zero baseline do not produce spurious changes", () => {
  assert.deepEqual(statistics([null]), { count: 0, median: null, p95: null });
  assert.deepEqual(statistics([10, 30, 20]), { count: 3, median: 20, p95: 30 });
  const records = observations(10);
  for (const record of records) record.jobs[0].queue_seconds = 0;
  assert.equal(buildReport(records).cohorts[0].queue.status, "no_nonzero_baseline");
});

test("reports retain failure steps and sanitize untrusted job text", () => {
  const record = normalizeAttempt(repository, { ...run, conclusion: "failure" }, [{ ...job, name: "bad|name\n<script>", conclusion: "failure", steps: [{ name: "fail|here", conclusion: "failure" }] }], []);
  const report = buildReport([record]);
  assert.equal(report.failures[0].failed_jobs[0].failed_steps[0], "fail|here");
  assert.doesNotMatch(renderReport(report), /<script>|fail\|here/);
});

test("CLI collects and reports with strict numeric/date arguments", async (t) => {
  const root = directory(t);
  await main(["collect", "--output", root, "--run-id", "42"], fixtureApi());
  assert.deepEqual(await main(["report", "--output", root]), { attempts: 1, cohorts: 1 });
  assert.match(readFileSync(resolve(root, "reports/latest.md"), "utf8"), /CI timing history/);
  await assert.rejects(main(["collect", "--output", root, "--since", "2026-02-30"], fixtureApi()), /Invalid date/);
  await assert.rejects(main(["collect", "--output", root, "--max-runs", "0"], fixtureApi()), /integer/);
  await assert.rejects(main(["collect", "--output", root, "--since", "2026-09-01", "--until", "2026-08-01"], fixtureApi()), /after/);
  await assert.rejects(main(["collect", "--output", root, "--run-id", "$(bad)"], fixtureApi()), /integer/);
  await assert.rejects(main(["report", "--output", root, "--output", root]), /duplicate/);
  await assert.rejects(main(["report"]), /required/);
  await assert.rejects(main(["unknown"]), /Usage/);
});

test("stored record validation rejects unexpected repositories and schema", (t) => {
  const root = directory(t);
  writeJson(resolve(root, "records/record.json"), { schema_version: 99 });
  assert.throws(() => readRecords(root), /Invalid metrics record/);
  writeJson(resolve(root, "records/record.json"), { ...normalizeAttempt(repository, run, [job], []), repository: "other/repo" });
  assert.throws(() => readRecords(root), /not allowed/);
  assert.equal(canonicalJson({ z: 1, a: { c: 3, b: 2 } }), canonicalJson({ a: { b: 2, c: 3 }, z: 1 }));
});

test("workflow uses trusted code and data-only persistence without source artifacts", () => {
  const workflow = readFileSync(new URL("../.github/workflows/ci-metrics.yml", import.meta.url), "utf8");
  assert.match(workflow, /ref: \$\{\{ github.event.repository.default_branch \}\}/);
  assert.match(workflow, /github.ref == format/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /git push origin "\$metrics_commit:refs\/heads\/ci-metrics"/);
  assert.doesNotMatch(workflow, /download-artifact|workflow run|--force|pull_request_target|git checkout.*head_sha/);
});

test("workflow persistence creates and updates a separate data branch with no force push", (t) => {
  const root = directory(t);
  const origin = resolve(root, "origin.git");
  const source = resolve(root, "source");
  const runnerTemp = resolve(root, "runner-temp");
  const store = resolve(runnerTemp, "ci-metrics-history");
  mkdirSync(source);
  mkdirSync(runnerTemp);
  const git = (args: string[], cwd = source) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git(["init", "--bare", "--initial-branch=main", origin]);
  git(["init", "--initial-branch=main"]);
  git(["config", "user.name", "Metrics test"]);
  git(["config", "user.email", "metrics@example.invalid"]);
  writeFileSync(resolve(source, "source.txt"), "trusted source\n");
  git(["add", "source.txt"]);
  git(["commit", "-m", "source"]);
  const mainSha = git(["rev-parse", "HEAD"]);
  git(["remote", "add", "origin", origin]);
  git(["push", "origin", "HEAD:main"]);
  const workflow = readFileSync(new URL("../.github/workflows/ci-metrics.yml", import.meta.url), "utf8");
  const script = (name: string) => {
    const block = workflow.split(`- name: ${name}\n`)[1];
    assert.ok(block, `Missing workflow step ${name}`);
    const lines = block.split("run: |\n")[1].split("\n");
    const result: string[] = [];
    for (const line of lines) {
      if (line.trim() && !line.startsWith("          ")) break;
      result.push(line.slice(10));
    }
    return result.join("\n");
  };
  const bash = (name: string) => execFileSync("bash", ["-c", script(name)], { cwd: source, env: { ...process.env, RUNNER_TEMP: runnerTemp, METRICS_STORE: store, GITHUB_ENV: resolve(root, "env") }, stdio: ["ignore", "pipe", "pipe"] });
  bash("Read persistent data branch");
  writeJson(resolve(store, "records/first.json"), { value: 1 });
  writeJson(resolve(store, "reports/latest.json"), { samples: 1 });
  bash("Persist records and report");
  const first = git(["rev-parse", "refs/heads/ci-metrics"], origin);
  assert.equal(git(["rev-parse", "refs/heads/main"], origin), mainSha);
  assert.equal(git(["show", "ci-metrics:records/first.json"], origin), canonicalJson({ value: 1 }).trim());
  rmSync(store, { recursive: true, force: true });
  bash("Read persistent data branch");
  writeJson(resolve(store, "records/second.json"), { value: 2 });
  bash("Persist records and report");
  assert.equal(git(["rev-parse", "ci-metrics^"], origin), first);
  assert.equal(git(["rev-parse", "refs/heads/main"], origin), mainSha);
  assert.equal(git(["ls-tree", "--name-only", "ci-metrics"], origin), "records\nreports");
});
