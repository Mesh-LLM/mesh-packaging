import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { canonicalJson, normalizeAttempt, phaseName, type Json } from "../scripts/ci-metrics-model.ts";
import { bytesHash, enrich, validateEnrichment } from "../scripts/ci-metrics-enrichment.ts";
import { cacheEvidence, plainCacheEvidence, parseJson, validateReceipt } from "../scripts/runner-receipt.ts";
import { collectRun, main } from "../scripts/ci-metrics.ts";
import { buildReport, renderReport } from "../scripts/ci-metrics-report.ts";

const repository = "Mesh-LLM/mesh-llm-runner-images";
const run = { id: 42, run_attempt: 1, workflow_id: 7, path: ".github/workflows/build-and-push.yml", head_sha: "a".repeat(40), status: "completed", conclusion: "success", created_at: "2026-08-01T00:00:00Z", run_started_at: "2026-08-01T00:00:00Z" };
const jobs = ["Build platform image once", "Verify exact staged platform digest"].map((name, index) => ({ id: index + 1, name: `Stage public cpu / linux/amd64 ${index}`, started_at: run.created_at, completed_at: "2026-08-01T00:01:00Z", conclusion: "success", labels: ["ubuntu-24.04"], steps: [{ name, started_at: run.created_at, conclusion: "success" }] }));
function receipt(role = "production"): Json { return { schema: 1, type: "mesh-llm-runner-build-metrics", identity: { repository, workflow_path: run.path, run_id: 42, run_attempt: 1, head_sha: run.head_sha, runner_images_sha: "b".repeat(40), mesh_llm_sha: "c".repeat(40), environment: "public", backend_id: "cpu", platform: "linux/amd64" }, role, outcome: "success", depot: { build_id: "build", project_id: "mzm95zcv7p", execution_seconds: null }, wrapper_elapsed_seconds: 0, context: { content_bytes: 0, file_count: 0, transfer_seconds: null }, verification: null, cache_evidence: null }; }
function setup(t: any) {
  const root = mkdtempSync(resolve(tmpdir(), "runner-enrich-")); t.after(() => rmSync(root, { recursive: true, force: true }));
  const output = resolve(root, "history"), bundles = resolve(root, "bundles"), path = resolve(output, "records", "runner", "2026-08", "42-1.json");
  mkdirSync(resolve(output, "records", "runner", "2026-08"), { recursive: true }); mkdirSync(bundles);
  const record: Json = normalizeAttempt(repository, run, jobs, []); writeFileSync(path, canonicalJson(record));
  function bundle(value = receipt(), name = "production", sidecars: Record<string, Buffer> = {}) { const dir = resolve(bundles, name); mkdirSync(dir, { recursive: true }); writeFileSync(resolve(dir, "receipt.json"), canonicalJson(value)); for (const [file, bytes] of Object.entries(sidecars)) writeFileSync(resolve(dir, file), bytes); }
  const read = () => JSON.parse(readFileSync(path, "utf8"));
  return { root, output, bundles, path, record, bundle, read };
}
test("offline exact joins import both roles, preserve raw timing, and no-op identically", async (t) => {
  const f = setup(t); f.bundle(); f.bundle(receipt("verification"), "verification");
  assert.deepEqual(await main(["enrich", "--output", f.output, "--receipts", f.bundles], async () => { throw Error("network forbidden"); }), { receipts: 2, attempts_written: 1 });
  assert.deepEqual(f.read().timing, f.record.timing); assert.equal(enrich(f.output, f.bundles).attempts_written, 0);
  const report = buildReport([f.read()]); assert.equal(report.runner_image_evidence.receipt_count, 2); assert.match(renderReport(report), /not authenticated provenance/); assert.equal(report.runner_image_evidence.receipts[0].wrapper_elapsed_seconds, 0);
});
for (const [field, value] of [["head_sha", "d".repeat(40)], ["run_attempt", 2], ["workflow_path", ".github/workflows/other.yml"], ["environment", "self-hosted"], ["backend_id", "vulkan"], ["platform", "linux/arm64"]]) test(`reject incorrect ${field}`, (t) => { const f = setup(t), r = receipt(); r.identity[field] = value; f.bundle(r); const before = readFileSync(f.path); assert.throws(() => enrich(f.output, f.bundles)); assert.deepEqual(readFileSync(f.path), before); });
for (const problem of ["reused", "ambiguous", "skipped", "unexecuted", "wrong-phase"]) test(`reject ${problem} job`, (t) => {
  const f = setup(t); f.bundle(); const record = f.read();
  if (problem === "reused") record.jobs[0].reused_from_previous_attempt = true;
  if (problem === "ambiguous") record.jobs.push(record.jobs[0]);
  if (problem === "skipped") record.jobs[0].conclusion = "skipped";
  if (problem === "unexecuted") record.jobs[0].steps[0].started_at = null;
  if (problem === "wrong-phase") record.jobs[0].steps[0].phase = "artifact_upload";
  writeFileSync(f.path, canonicalJson(record)); assert.throws(() => enrich(f.output, f.bundles), /exactly one executed/);
});
test("cross-role source conflicts and changed immutable receipts fail before writes", (t) => {
  const f = setup(t); f.bundle(); enrich(f.output, f.bundles); const before = readFileSync(f.path);
  const changed = receipt(); changed.wrapper_elapsed_seconds = 12; f.bundle(changed); assert.throws(() => enrich(f.output, f.bundles), /Immutable/); assert.deepEqual(readFileSync(f.path), before);
  f.bundle(); const verification = receipt("verification"); verification.identity.runner_images_sha = "e".repeat(40); f.bundle(verification, "verification"); assert.throws(() => enrich(f.output, f.bundles), /Cross-role/); assert.deepEqual(readFileSync(f.path), before);
});
test("invalid final bundle and duplicate invocation leave entire batch unchanged", (t) => {
  const f = setup(t); f.bundle(); const before = readFileSync(f.path); f.bundle(receipt(), "z"); assert.throws(() => enrich(f.output, f.bundles), /Duplicate/); assert.deepEqual(readFileSync(f.path), before);
  writeFileSync(resolve(f.bundles, "z", "receipt.json"), "{"); assert.throws(() => enrich(f.output, f.bundles)); assert.deepEqual(readFileSync(f.path), before);
});
test("schema and measurement bounds reject fabricated timing and unknown keys", () => {
  validateReceipt(receipt()); const unknown = receipt(); unknown.wrapper_elapsed_seconds = null; unknown.context = { content_bytes: null, file_count: null, transfer_seconds: null }; validateReceipt(unknown);
  for (const mutate of [(r: Json) => r.extra = true, (r: Json) => r.depot.execution_seconds = 3, (r: Json) => r.context.transfer_seconds = 4, (r: Json) => r.depot.project_id = "wrong", (r: Json) => r.depot.build_id = null, (r: Json) => r.wrapper_elapsed_seconds = Infinity, (r: Json) => r.context.file_count = null, (r: Json) => r.identity.run_id = true]) { const r = receipt(); mutate(r); assert.throws(() => validateReceipt(r)); }
  assert.throws(() => parseJson(Buffer.from('{"x":1,"x":2}')), /duplicate/);
  assert.throws(() => parseJson(Buffer.from('{"nested":[{"x":1,"x":2}]}')), /duplicate/);
});
test("rawjson and plain cache proofs are invocation-scoped and bounded", (t) => {
  const f = setup(t); const digest = `sha256:${"e".repeat(64)}`;
  const raw = Buffer.from(JSON.stringify({ vertexes: [{ digest, cached: true }, { digest, cached: false }] }) + '\n' + JSON.stringify({ statuses: [{}] }) + '\n');
  const proof = cacheEvidence(raw); assert.deepEqual(proof.cached_vertex_digests, [digest]); assert.equal(proof.event_count, 2);
  const r = receipt(); r.cache_evidence = proof; f.bundle(r, "production", { "cache.jsonl": raw }); enrich(f.output, f.bundles);
  writeFileSync(resolve(f.bundles, "production", "cache.jsonl"), "{}"); assert.throws(() => enrich(f.output, f.bundles), /unsupported|mismatch/);
  for (const invalid of ['{"id":"x","cached":true}', '{"vertexes":[{"digest":"x","cached":true}]}', '{"vertexes":[{"digest":"'+digest+'","cached":"yes"}]}', '{"statuses":{}}', '{']) assert.throws(() => cacheEvidence(Buffer.from(invalid)));
  assert.throws(() => cacheEvidence(Buffer.alloc(8 * 1024 ** 2 + 1)), /8 MiB/);
  const plain = Buffer.from('#0 building with builder\n#3 [internal] load metadata\n#3 CACHED\n#4 [stage 1/1] COPY x y\n#4 CACHED\n');
  assert.deepEqual(plainCacheEvidence(plain).cached_operations, [4]);
  assert.throws(() => plainCacheEvidence(Buffer.from('#4 [stage] RUN x\n#4 CACHED\n#4 DONE 0s\n')), /terminal/);
  assert.throws(() => plainCacheEvidence(Buffer.from('#0 building a\n#0 building b\n')), /multiple/);
});
test("symlinks, unknown bundle files and missing required evidence fail closed", (t) => {
  const f = setup(t); f.bundle(); writeFileSync(resolve(f.bundles, "production", "extra"), "x"); assert.throws(() => enrich(f.output, f.bundles), /files/); rmSync(resolve(f.bundles, "production", "extra"));
  symlinkSync(f.path, resolve(f.bundles, "production", "identity.json")); assert.throws(() => enrich(f.output, f.bundles), /regular/);
});
test("refresh preserves validated exact-attempt enrichment without sidecars or downloads", async (t) => {
  const f = setup(t); const g = golden("verification"); g.receipt.identity.run_id = 42;
  const { "receipt.json": ignored, ...proof } = g.sidecars; f.bundle(g.receipt, "verification", proof);
  enrich(f.output, f.bundles); const stored = f.read(); rmSync(f.bundles, { recursive: true });
  // Collector uses canonical repository layout.
  const target = resolve(f.output, "records", repository.replace("/", "__"), "2026-08", "42-1.json"); mkdirSync(resolve(target, ".."), { recursive: true }); writeFileSync(target, canonicalJson(stored)); rmSync(f.path);
  const calls: string[] = []; const prefix = `repos/${repository}/actions/runs/42`;
  const api = async (path: string) => { calls.push(path); if (path === prefix || path === `${prefix}/attempts/1`) return run; if (path === `${prefix}/artifacts?per_page=100&page=1`) return { total_count: 0, artifacts: [] }; if (path === `${prefix}/attempts/1/jobs?per_page=100&page=1`) return { total_count: jobs.length, jobs }; throw Error(`Forbidden request: ${path}`); };
  await collectRun(api, repository, 42, f.output); assert.deepEqual(JSON.parse(readFileSync(target, "utf8")).enrichment, stored.enrichment); assert.equal(calls.length, 4);
  stored.enrichment.runner_images.receipts[0].receipt.context.transfer_seconds = 1; writeFileSync(target, canonicalJson(stored)); assert.throws(() => validateEnrichment(stored)); await assert.rejects(collectRun(api, repository, 42, f.output), /transfer/);
});
test("exact new phase names keep near misses raw and combined publication distinct", () => {
  for (const name of ["Retain staged cohort for exact-attempt promotion", "Retain admitted data in this promotion attempt", "Retain latest reconciliation and origin manifests"]) { assert.equal(phaseName(name), "artifact_upload"); assert.equal(phaseName(`${name} extra`), null); }
  assert.equal(phaseName("Publish versioned tags and capture previous latest cohort"), "image_publication_and_snapshot");
});
test("report preserves explicit regression threshold after enrich option addition", async (t) => {
  const f = setup(t); await main(["report", "--output", f.output, "--regression-percent", "37"]);
  assert.equal(JSON.parse(readFileSync(resolve(f.output, "reports", "latest.json"), "utf8")).options.regressionPercent, 37);
});
test("plain internal terminals remain uninterpreted and cannot define later executors", () => {
  const raw = Buffer.from('#1 [internal] load frontend\n#1 DONE 0.1s\n#1 CACHED\n#4 [stage] RUN x\n#4 CACHED\n');
  assert.deepEqual(plainCacheEvidence(raw).cached_operations, [4]);
  assert.throws(() => plainCacheEvidence(Buffer.from('#4 CACHED\n#4 [stage] RUN x\n')), /after terminal/);
});
function golden(role: string) {
  const directory = resolve(import.meta.dirname, "fixtures", "runner-metrics", role);
  const sidecars: Record<string, Buffer> = { "receipt.json": readFileSync(resolve(directory, "receipt.json")) };
  if (role === "verification") for (const name of ["identity.json", "cache.log"]) sidecars[name] = readFileSync(resolve(directory, name));
  return { receipt: parseJson(sidecars["receipt.json"]), sidecars };
}
test("producer CLI golden bundles bind real identity objects and import both roles", (t) => {
  const f = setup(t); const production = golden("production"), verification = golden("verification");
  const record = normalizeAttempt(repository, { ...run, id: 123 }, jobs, []);
  rmSync(f.path); const path = resolve(f.path, "..", "123-1.json"); writeFileSync(path, canonicalJson(record));
  f.bundle(production.receipt, "production", production.sidecars); f.bundle(verification.receipt, "verification", verification.sidecars);
  assert.equal(enrich(f.output, f.bundles).attempts_written, 1);
  const stored = JSON.parse(readFileSync(path, "utf8")); assert.equal(stored.enrichment.runner_images.receipts.length, 2);
  assert.deepEqual(stored.enrichment.runner_images.receipts[1].receipt.cache_evidence.cached_operations, [4]);
  rmSync(f.bundles, { recursive: true }); validateEnrichment(stored);
});
test("bound identity must agree on source, platform, image, OCI and exact sidecar hash", () => {
  const { receipt: r, sidecars } = golden("verification"); validateReceipt(r, sidecars);
  const identity = parseJson(sidecars["identity.json"]);
  for (const mutate of [(v: Json) => v.runtime.source.mesh_revision = "f".repeat(40), (v: Json) => v.platform.architecture = "arm64", (v: Json) => v.image = "ghcr.io/other/image", (v: Json) => v.oci.config.size++, (v: Json) => v.runtime.family.backend = "cuda", (v: Json) => v.runtime.family.cuda_series = 12, (v: Json) => v.runtime.family.cuda_series = "bogus", (v: Json) => v.runtime.family.rocm_version = "bogus"]) {
    const changed = structuredClone(identity); mutate(changed); const bytes = Buffer.from(canonicalJson(changed)); const receipt = structuredClone(r); receipt.verification.identity_receipt_sha256 = bytesHash(bytes);
    assert.throws(() => validateReceipt(receipt, { ...sidecars, "identity.json": bytes }));
  }
  assert.throws(() => validateReceipt(r, { ...sidecars, "identity.json": Buffer.from(canonicalJson(identity) + " ") }), /hash/);
  assert.throws(() => validateReceipt(r, {}), /identity/);
});
test("layer accounting preserves occurrences, rejects overflow, compression lies and unsafe metadata", () => {
  const { receipt: r } = golden("verification"); const layer = r.verification.layers[0];
  r.verification.layers = [layer, structuredClone(layer)]; r.verification.totals = { layer_descriptor_bytes: 2 * layer.size, compressed_layer_descriptor_bytes: 2 * layer.size, distinct_layer_digests: [layer.digest] }; validateReceipt(r);
  for (const mutate of [(v: Json) => v.verification.layers[1].size++, (v: Json) => v.verification.layers[1].compression = "unknown", (v: Json) => v.verification.totals.layer_descriptor_bytes--, (v: Json) => v.verification.oci.root.size = 16 * 1024 ** 2 + 1, (v: Json) => v.outcome = "failure", (v: Json) => { v.verification.layers.forEach((layer: Json) => layer.size = Number.MAX_SAFE_INTEGER); }]) { const changed = structuredClone(r); mutate(changed); assert.throws(() => validateReceipt(changed)); }
});
test("import avoids parsing unrelated history while detecting duplicate attempt locations", (t) => {
  const f = setup(t); f.bundle(); writeFileSync(resolve(f.path, "..", "999-1.json"), "unrelated legacy data"); assert.equal(enrich(f.output, f.bundles).attempts_written, 1);
  mkdirSync(resolve(f.output, "records", "duplicate")); writeFileSync(resolve(f.output, "records", "duplicate", "42-1.json"), canonicalJson(f.record)); assert.throws(() => enrich(f.output, f.bundles), /ambiguous/);
});
test("bounded bundles, receipt bytes, line count and individual cache lines fail closed", (t) => {
  const f = setup(t); for (let i = 0; i < 257; i++) mkdirSync(resolve(f.bundles, String(i))); assert.throws(() => enrich(f.output, f.bundles), /256/);
  rmSync(f.bundles, { recursive: true }); mkdirSync(f.bundles); f.bundle(); writeFileSync(resolve(f.bundles, "production", "receipt.json"), Buffer.alloc(1024 ** 2 + 1)); assert.throws(() => enrich(f.output, f.bundles), /bounded/);
  assert.throws(() => plainCacheEvidence(Buffer.from("x".repeat(65537))), /64 KiB/);
  assert.throws(() => plainCacheEvidence(Buffer.from("\n".repeat(100001))), /100000/);
  assert.throws(() => cacheEvidence(Buffer.from("\n".repeat(100001))), /100000/);
});
test("enrichment never transfers to a later attempt during collector refresh", async (t) => {
  const f = setup(t); f.bundle(); enrich(f.output, f.bundles);
  const target = resolve(f.output, "records", repository.replace("/", "__"), "2026-08", "42-1.json"); mkdirSync(resolve(target, ".."), { recursive: true }); writeFileSync(target, canonicalJson(f.read())); rmSync(f.path);
  const second = { ...run, run_attempt: 2, run_started_at: "2026-08-01T01:00:00Z" }; const prefix = `repos/${repository}/actions/runs/42`;
  const api = async (path: string) => {
    if (path === prefix || path === `${prefix}/attempts/2`) return second;
    if (path === `${prefix}/attempts/1`) return run;
    if (path === `${prefix}/artifacts?per_page=100&page=1`) return { total_count: 0, artifacts: [] };
    if (/\/attempts\/[12]\/jobs\?/.test(path)) return { total_count: jobs.length, jobs };
    throw Error(`Unexpected network operation: ${path}`);
  };
  await collectRun(api, repository, 42, f.output);
  assert.ok(JSON.parse(readFileSync(target, "utf8")).enrichment);
  assert.equal(JSON.parse(readFileSync(resolve(target, "..", "42-2.json"), "utf8")).enrichment, undefined);
});
test("cache parsers agree on LF, CRLF and CR evidence line boundaries", () => {
  const plainLines = ['#0 building with builder', '#4 [stage 1/1] COPY x y', '#4 CACHED'];
  const digest = `sha256:${"e".repeat(64)}`;
  const rawLines = [JSON.stringify({ vertexes: [{ digest, cached: true }] }), JSON.stringify({ statuses: [{}] })];
  for (const delimiter of ["\n", "\r\n", "\r"]) {
    const plain = plainCacheEvidence(Buffer.from(plainLines.join(delimiter) + delimiter));
    assert.deepEqual(plain.cached_operations, [4]); assert.equal(plain.event_count, 3);
    const raw = cacheEvidence(Buffer.from(rawLines.join(delimiter) + delimiter));
    assert.deepEqual(raw.cached_vertex_digests, [digest]); assert.equal(raw.event_count, 2);
    assert.doesNotThrow(() => plainCacheEvidence(Buffer.from("x".repeat(65536) + delimiter)));
  }
});
test("validate-mode skipped producer receipt joins a skipped role step on an executed job", (t) => {
  const f = setup(t);
  const r = parseJson(readFileSync(resolve(import.meta.dirname, "fixtures", "runner-metrics", "verification-skipped", "receipt.json")));
  const validateJob = { ...jobs[0], name: "Validate public cpu / public cpu amd64", steps: [jobs[0].steps[0], { name: "Verify exact staged platform digest", conclusion: "skipped", started_at: null, completed_at: null }] };
  const validateRun = { ...run, id: r.identity.run_id, event: "pull_request", head_sha: r.identity.head_sha };
  const record = normalizeAttempt(repository, validateRun, [validateJob], []);
  rmSync(f.path); const path = resolve(f.path, "..", `${validateRun.id}-1.json`); writeFileSync(path, canonicalJson(record));
  f.bundle(r, "verification"); assert.equal(enrich(f.output, f.bundles).attempts_written, 1);
  const stored = JSON.parse(readFileSync(path, "utf8")); validateEnrichment(stored);
  assert.equal(stored.enrichment.runner_images.receipts[0].receipt.outcome, "skipped");
  for (const mutate of [(value: Json) => value.jobs[0].steps[1].conclusion = "success", (value: Json) => value.jobs[0].reused_from_previous_attempt = true, (value: Json) => value.jobs[0].started_at = null, (value: Json) => value.head_sha = "f".repeat(40)]) { const changed = structuredClone(stored); mutate(changed); assert.throws(() => validateEnrichment(changed)); }
  for (const outcome of ["success", "failure", "unknown", "cancelled"]) { const changed = structuredClone(stored); const receipt = changed.enrichment.runner_images.receipts[0].receipt; receipt.outcome = outcome; if (outcome === "success") { receipt.depot.build_id = "build"; receipt.depot.project_id = "mzm95zcv7p"; } assert.throws(() => validateEnrichment(changed), /exactly one executed/); }
});
test("skipped invocation rejects populated IDs, timing, context or evidence", () => {
  const r = parseJson(readFileSync(resolve(import.meta.dirname, "fixtures", "runner-metrics", "verification-skipped", "receipt.json")));
  validateReceipt(r);
  for (const mutate of [(v: Json) => v.depot.build_id = "build", (v: Json) => v.depot.project_id = "mzm95zcv7p", (v: Json) => v.wrapper_elapsed_seconds = 0, (v: Json) => v.context = { content_bytes: 0, file_count: 0, transfer_seconds: null }, (v: Json) => v.verification = {}, (v: Json) => v.cache_evidence = {}]) { const changed = structuredClone(r); mutate(changed); assert.throws(() => validateReceipt(changed), /skipped/); }
});
test("skipped production may retain independently enumerated context only", () => {
  const r = parseJson(readFileSync(resolve(import.meta.dirname, "fixtures", "runner-metrics", "verification-skipped", "receipt.json")));
  r.role = "production"; r.context = { content_bytes: 10, file_count: 2, transfer_seconds: null }; validateReceipt(r);
  r.wrapper_elapsed_seconds = 0; assert.throws(() => validateReceipt(r), /skipped/);
});

test("retained-cohort exact download labels classify without broad near matches", () => {
  for (const name of ["Download staged candidates without merging filenames", "Download staged identity evidence without merging filenames", "Download admitted cohort by immutable artifact ID", "Download verified platform candidates for catalog sources"]) {
    assert.equal(phaseName(name), "artifact_download");
    assert.equal(phaseName(`${name} extra`), null);
  }
});
