import { createHash } from "node:crypto";

export type Json = Record<string, any>;
export type MetricRecord = ReturnType<typeof normalizeAttempt>;

export const REPOSITORIES: Record<string, readonly string[]> = {
  "Mesh-LLM/mesh-packaging": ["images-release.yml", "images-precheck.yml"],
  "Mesh-LLM/mesh-llm": ["release.yml", "ci-linux-lane.yml", "ci-macos-lane.yml", "ci-windows-lane.yml", "ci-quality-lane.yml", "main_linux.yml", "main_macos.yml", "main_windows.yml", "main_quality.yml", "pr_linux.yml", "pr_macos.yml", "pr_windows.yml", "pr_quality.yml"],
  "Mesh-LLM/mesh-llm-runner-images": ["build-and-push.yml"],
};

export function repositoryName(value: string): string {
  const repository = Object.keys(REPOSITORIES).find((name) => name.toLowerCase() === value.toLowerCase());
  if (!repository) throw new Error(`Repository is not allowed: ${value}`);
  return repository;
}

export function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function timestamp(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function elapsed(start: unknown, end: unknown): number | null {
  const first = timestamp(start);
  const last = timestamp(end);
  if (!first || !last) return null;
  const seconds = (Date.parse(last) - Date.parse(first)) / 1000;
  return seconds >= 0 ? seconds : null;
}

export function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export function runnerProvider(labels: string[]): string | null {
  if (labels.some((label) => /^depot-/.test(label))) return "depot";
  if (labels.some((label) => label.toLowerCase() === "self-hosted")) return "self-hosted";
  if (labels.some((label) => /^(ubuntu|windows|macos)-/.test(label))) return "github-hosted";
  return null;
}

export function dimensions(name: string, labels: string[], repository?: string) {
  const text = `${name} ${labels.join(" ")}`.toLowerCase();
  const arch = /\b(arm64|aarch64)\b/.test(text) ? "arm64" : /\b(amd64|x86_64|x64)\b/.test(text) ? "amd64" : null;
  const families = repository === "Mesh-LLM/mesh-llm-runner-images"
    ? [...name.matchAll(/\b(public|self-hosted) (cpu|web|ui|browser|vulkan|cuda\d+|rocm\d+)\b/g)] : [];
  const identities = new Set(families.map((match) => `${match[1]}/${match[2]}`));
  const family = identities.size === 1 ? families[0] : null;
  const imageBackend = family?.[2] ?? null;
  const backend = imageBackend?.startsWith("cuda") ? "cuda" : imageBackend?.startsWith("rocm") ? "rocm"
    : imageBackend ?? (/\bcuda\b/.test(text) ? "cuda" : /\brocm\b/.test(text) ? "rocm" : /\bvulkan\b/.test(text) ? "vulkan" : /\bmetal\b/.test(text) ? "metal" : /\bcpu\b/.test(text) ? "cpu" : null);
  const row = /^Package and image ([^/]+) \/ /.exec(name)?.[1].trim() ?? null;
  const backendVersion = /(?:cuda|rocm)[ -](\d+(?:\.\d+)*)/i.exec(name)?.[1] ?? /CUDA \((\d+(?:\.\d+)*)\)/i.exec(name)?.[1] ?? null;
  // Compact family IDs are not full toolkit versions (rocm72 can mean 7.2.3).
  return { arch, backend, backend_version: backendVersion, row_id: row,
    image_environment: family?.[1] ?? null, image_backend_id: imageBackend,
    source: "job_name_and_runner_labels" };
}

export function phaseName(name: string): string | null {
  if (/^Post /i.test(name)) return null;
  if (/^Build platform image once$/i.test(name)) return "image_build";
  if (/^Verify exact staged platform digest$/i.test(name)) return "image_verification";
  if (/^Assemble and validate (?:immutable family|compatibility) index$/i.test(name)) return "image_index_and_qa";
  if (/^Promote verified versioned tags$/i.test(name)) return "image_promotion";
  if (/^Upload (?:manifest bundles|Depot build record|verified (?:platform|family|compatibility) candidate|latest cohort reconciliation manifest)$/i.test(name)) return "artifact_upload";
  if (/^Download (?:manifest bundles|(?:verified|CPU ARM64|CUDA 12 AMD64) platform candidates?|complete verified candidate cohort|latest cohort reconciliation manifest|verified candidate descriptor)$/i.test(name)) return "artifact_download";
  if (/upload-artifact|upload .*input|upload native runtime/i.test(name)) return "artifact_upload";
  if (/download-artifact|download immutable|download archive/i.test(name)) return "artifact_download";
  if (/pull and test|pull.*digest/i.test(name)) return "image_pull_and_qa";
  if (/verify and install package|package.*qa|install.*test/i.test(name)) return "package_qa";
  if (/build and push|build.*final image/i.test(name)) return "image_build";
  if (/build native package/i.test(name)) return "package_build";
  if (/initialize containers/i.test(name)) return "container_setup";
  if (/compose/i.test(name)) return "compose";
  return null;
}

function normalizeJob(job: Json, attempt: number, attemptStarted: string | null, repository: string) {
  const labels = Array.isArray(job.labels) ? job.labels.filter((label: unknown) => typeof label === "string").sort() : [];
  const started = timestamp(job.started_at);
  const completed = timestamp(job.completed_at);
  // GitHub repeats successful jobs in a rerun with new IDs/created_at but old execution timestamps.
  const reused = attempt > 1 && started !== null && attemptStarted !== null && started < attemptStarted;
  const skipped = job.conclusion === "skipped";
  return {
    id: numberOrNull(job.id),
    name: stringOrNull(job.name),
    status: stringOrNull(job.status),
    conclusion: stringOrNull(job.conclusion),
    created_at: timestamp(job.created_at),
    started_at: started,
    completed_at: completed,
    reused_from_previous_attempt: reused,
    queue_seconds: reused || skipped ? null : elapsed(job.created_at, job.started_at),
    execution_seconds: reused || skipped ? null : elapsed(job.started_at, job.completed_at),
    runner: { labels, name: stringOrNull(job.runner_name), group: stringOrNull(job.runner_group_name), provider: runnerProvider(labels), provider_source: "runner_labels" },
    dimensions: dimensions(job.name ?? "", labels, repository),
    steps: (Array.isArray(job.steps) ? job.steps : []).map((step: Json) => ({
      number: numberOrNull(step.number),
      name: stringOrNull(step.name),
      phase: phaseName(step.name ?? ""),
      conclusion: stringOrNull(step.conclusion),
      started_at: timestamp(step.started_at),
      completed_at: timestamp(step.completed_at),
      execution_seconds: reused || step.conclusion === "skipped" ? null : elapsed(step.started_at, step.completed_at),
    })),
  };
}

function normalizeArtifact(artifact: Json) {
  if (!Number.isSafeInteger(artifact.id) || artifact.id <= 0) throw new Error("Artifact ID must be a positive integer");
  return {
    id: artifact.id as number,
    name: stringOrNull(artifact.name),
    size_in_bytes: numberOrNull(artifact.size_in_bytes),
    expired: typeof artifact.expired === "boolean" ? artifact.expired : null,
    created_at: timestamp(artifact.created_at),
    expires_at: timestamp(artifact.expires_at),
    listed_in_latest_response: false as boolean | null,
  };
}

export function artifactHistory(artifacts: Json[] | null, historical: Json[] = []) {
  const observed = new Map<number, ReturnType<typeof normalizeArtifact>>();
  const remember = (artifact: Json, listed: boolean | null) => {
    const next = normalizeArtifact(artifact);
    const old = observed.get(next.id);
    // Artifact IDs are immutable. Do not silently carry facts across an identity mismatch.
    for (const key of ["name", "size_in_bytes", "created_at"] as const) {
      if (old?.[key] != null && next[key] !== null && old[key] !== next[key]) throw new Error(`Conflicting metadata for artifact ${next.id}: ${key}`);
    }
    observed.set(next.id, {
      ...next,
      name: next.name ?? old?.name ?? null,
      size_in_bytes: next.size_in_bytes ?? old?.size_in_bytes ?? null,
      created_at: next.created_at ?? old?.created_at ?? null,
      expires_at: next.expires_at ?? old?.expires_at ?? null,
      expired: next.expired ?? old?.expired ?? null,
      listed_in_latest_response: listed,
    });
  };
  for (const artifact of historical) remember(artifact, artifacts === null ? null : false);
  for (const artifact of artifacts ?? []) remember(artifact, true);
  const items = artifacts === null && observed.size === 0 ? null : [...observed.values()].sort((a, b) => a.id - b.id);
  const total = (values: Json[] | null) => values?.every((artifact) => numberOrNull(artifact.size_in_bytes) !== null) ? values.reduce((sum, artifact) => sum + artifact.size_in_bytes, 0) : null;
  return {
    scope: "run_not_attempt",
    aggregation: "cumulative_observed_artifact_ids",
    items,
    bytes: total(items),
    currently_listed_bytes: total(artifacts),
  };
}

export function normalizeAttempt(repository: string, run: Json, rawJobs: Json[], artifacts: Json[] | null, previous: Json | null = null, historicalArtifacts: Json[] = []) {
  repositoryName(repository);
  if (!Number.isSafeInteger(run.id) || run.id <= 0 || !Number.isSafeInteger(run.run_attempt) || run.run_attempt <= 0) throw new Error("Run ID and attempt must be positive integers");
  const attemptStarted = timestamp(run.run_started_at);
  const jobs = rawJobs.map((job) => normalizeJob(job, run.run_attempt, attemptStarted, repository)).sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  const executed = jobs.filter((job) => !job.reused_from_previous_attempt && job.conclusion !== "skipped");
  const starts = executed.map((job) => job.started_at).filter((value): value is string => value !== null).sort();
  const ends = executed.map((job) => job.completed_at).filter((value): value is string => value !== null).sort();
  const knownExecution = executed.filter((job) => job.execution_seconds !== null);
  return {
    schema_version: 1,
    repository,
    run_id: run.id,
    run_attempt: run.run_attempt,
    workflow: { id: run.workflow_id ?? null, name: stringOrNull(run.name), path: stringOrNull(run.path) },
    event: stringOrNull(run.event),
    branch: stringOrNull(run.head_branch),
    head_sha: stringOrNull(run.head_sha),
    status: stringOrNull(run.status),
    conclusion: stringOrNull(run.conclusion),
    url: `https://github.com/${repository}/actions/runs/${run.id}/attempts/${run.run_attempt}`,
    created_at: timestamp(run.created_at),
    attempt_started_at: attemptStarted,
    updated_at: timestamp(run.updated_at),
    timing: {
      attempt_elapsed_seconds: elapsed(attemptStarted, ends.at(-1)),
      execution_span_seconds: elapsed(starts[0], ends.at(-1)),
      first_job_delay_seconds: elapsed(attemptStarted, starts[0]),
      job_execution_seconds: knownExecution.length > 0 && knownExecution.length === executed.length ? knownExecution.reduce((sum, job) => sum + job.execution_seconds!, 0) : null,
      rerun_delay_seconds: run.run_attempt > 1 && previous ? elapsed(previous.updated_at, attemptStarted) : null,
    },
    jobs,
    artifacts: artifactHistory(artifacts, historicalArtifacts),
  };
}

export function canonicalJson(value: unknown): string {
  const stable = (input: any): any => Array.isArray(input) ? input.map(stable) : input && typeof input === "object" ? Object.fromEntries(Object.keys(input).sort().map((key) => [key, stable(input[key])])) : input;
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

export function digest(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
