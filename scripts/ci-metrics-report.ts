import { canonicalJson, digest, type Json } from "./ci-metrics-model.ts";

type Options = { minSamples: number; window: number; regressionPercent: number };

export function statistics(values: (number | null)[]) {
  const known = values.filter((value): value is number => value !== null && Number.isFinite(value)).sort((a, b) => a - b);
  if (!known.length) return { count: 0, median: null, p95: null };
  const middle = Math.floor(known.length / 2);
  return { count: known.length, median: known.length % 2 ? known[middle] : (known[middle - 1] + known[middle]) / 2, p95: known[Math.ceil(known.length * 0.95) - 1] };
}

function normalizedJobName(name: string) {
  // Release versions do not identify different work. Toolkit versions and matrix rows do.
  return name.replace(/mesh-llm-v\d+\.\d+\.\d+(?:-[a-z]+\.\d+)?/g, "mesh-llm-<release>");
}

export function cohortIdentity(record: Json, job: Json) {
  return {
    repository: record.repository,
    workflow: record.workflow.path,
    event: record.event,
    branch: record.branch,
    job: normalizedJobName(job.name ?? ""),
    backend: job.dimensions.backend,
    backend_version: job.dimensions.backend_version,
    arch: job.dimensions.arch,
    row_id: job.dimensions.row_id,
    provider: job.runner.provider,
    runner_labels: job.runner.labels,
    runner_group: job.runner.group,
    conclusion: job.conclusion,
    attempt_kind: record.run_attempt > 1 ? "rerun" : "first_attempt",
  };
}

function compareMetric(baseline: (number | null)[], candidate: (number | null)[], options: Options) {
  const before = statistics(baseline);
  const after = statistics(candidate);
  const enough = before.count >= options.minSamples && after.count >= options.minSamples;
  const change = enough && before.median !== null && before.median > 0 && after.median !== null ? (after.median / before.median - 1) * 100 : null;
  return { baseline: before, candidate: after, change_percent: change, status: !enough ? "insufficient_samples" : change === null ? "no_nonzero_baseline" : change >= options.regressionPercent ? "regression_signal" : "within_threshold" };
}

export function buildReport(records: Json[], options: Options = { minSamples: 5, window: 10, regressionPercent: 20 }) {
  if (options.minSamples < 2 || options.window < options.minSamples) throw new Error("Comparison window must be at least min-samples, and min-samples must be at least 2");
  const unique = new Map<string, Json>();
  for (const record of records) unique.set(`${record.repository}/${record.run_id}/${record.run_attempt}`, record);
  const sorted = [...unique.values()].sort((a, b) => String(a.attempt_started_at).localeCompare(String(b.attempt_started_at)) || a.run_id - b.run_id || a.run_attempt - b.run_attempt);
  const grouped = new Map<string, { identity: Json; samples: Json[] }>();
  for (const record of sorted) {
    for (const job of record.jobs) {
      if (job.reused_from_previous_attempt || job.conclusion === "skipped") continue;
      const identity = cohortIdentity(record, job);
      const key = canonicalJson(identity);
      if (!grouped.has(key)) grouped.set(key, { identity, samples: [] });
      grouped.get(key)!.samples.push({ run_id: record.run_id, run_attempt: record.run_attempt, url: record.url, job_id: job.id, observed_at: record.attempt_started_at, queue_seconds: job.queue_seconds, execution_seconds: job.execution_seconds });
    }
  }
  const cohorts = [...grouped.values()].map(({ identity, samples }) => {
    const perAttemptCounts = new Map<string, number>();
    for (const sample of samples) {
      const key = `${sample.run_id}/${sample.run_attempt}`;
      perAttemptCounts.set(key, (perAttemptCounts.get(key) ?? 0) + 1);
    }
    const unambiguous = samples.filter((sample) => sample.observed_at !== null && perAttemptCounts.get(`${sample.run_id}/${sample.run_attempt}`) === 1);
    // Retries of one run do not supply independent observations for the sample gate.
    const perRun = new Map<number, Json>();
    for (const sample of unambiguous) perRun.set(sample.run_id, sample);
    const selected = [...perRun.values()].slice(-2 * options.window);
    // Split smaller cohorts evenly so five + five can compare before twenty exist.
    const count = Math.min(options.window, Math.floor(selected.length / 2));
    const baseline = count ? selected.slice(-2 * count, -count) : [];
    const candidate = count ? selected.slice(-count) : selected;
    const comparable = identity.provider !== null && identity.runner_labels.length > 0 && identity.workflow !== null && identity.job !== "";
    return {
      id: digest(identity).slice(0, 16), identity, total_samples: perRun.size,
      comparison_eligible: comparable,
      excluded_ambiguous_samples: samples.length - unambiguous.length,
      baseline_samples: baseline, candidate_samples: candidate,
      queue: compareMetric(comparable ? baseline.map((sample) => sample.queue_seconds) : [], comparable ? candidate.map((sample) => sample.queue_seconds) : [], options),
      execution: compareMetric(comparable ? baseline.map((sample) => sample.execution_seconds) : [], comparable ? candidate.map((sample) => sample.execution_seconds) : [], options),
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
  const failures = sorted.filter((record) => record.conclusion && record.conclusion !== "success").map((record) => ({ repository: record.repository, run_id: record.run_id, run_attempt: record.run_attempt, conclusion: record.conclusion, url: record.url, failed_jobs: record.jobs.filter((job: Json) => job.conclusion === "failure" && !job.reused_from_previous_attempt).map((job: Json) => ({ name: job.name, id: job.id, failed_steps: job.steps.filter((step: Json) => step.conclusion === "failure").map((step: Json) => step.name) })) }));
  const latest = sorted.slice(-30).map((record) => ({ repository: record.repository, run_id: record.run_id, run_attempt: record.run_attempt, workflow: record.workflow.name, conclusion: record.conclusion, url: record.url, ...record.timing, observed_artifact_bytes_run_scope: record.artifacts.bytes }));
  return { schema_version: 1, attempts: sorted.length, first_attempt_at: sorted[0]?.attempt_started_at ?? null, last_attempt_at: sorted.at(-1)?.attempt_started_at ?? null, options, cohorts, recent_attempts: latest, failures: failures.slice(-30) };
}

function safe(value: unknown): string {
  return String(value ?? "unknown").replace(/[\r\n|<>]/g, " ").replace(/`/g, "'");
}

function duration(value: number | null): string {
  return value === null ? "unknown" : `${Math.round(value)}s`;
}

export function renderReport(report: ReturnType<typeof buildReport>): string {
  const signals = report.cohorts.filter((cohort) => cohort.queue.status === "regression_signal" || cohort.execution.status === "regression_signal");
  const lines = [
    "# CI timing history", "",
    `${report.attempts} recorded attempts. ${report.cohorts.length} separate job cohorts. ${signals.length} cohorts have a regression signal.`, "",
    `Signals require at least ${report.options.minSamples} known samples in each window and a ${report.options.regressionPercent}% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.`, "",
    "Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.", "",
    "## Regression signals", "",
    "| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: |",
  ];
  for (const cohort of signals) {
    for (const metric of ["queue", "execution"] as const) {
      const value = cohort[metric];
      if (value.status !== "regression_signal") continue;
      lines.push(`| ${safe(cohort.identity.repository)} / ${safe(cohort.identity.job)} | ${safe(cohort.identity.provider)} | ${metric} | ${duration(value.baseline.median)} | ${duration(value.candidate.median)} | ${value.change_percent!.toFixed(1)}% | ${value.baseline.count} / ${value.candidate.count} |`);
    }
  }
  if (!signals.length) lines.push("", "No supported regression signal. Cohorts with insufficient samples are still listed in reports/latest.json.");
  lines.push("", "## Recent attempts", "", "| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |", "| --- | --- | --- | ---: | ---: | ---: | ---: |");
  for (const record of report.recent_attempts) lines.push(`| ${safe(record.repository)} / ${safe(record.workflow)} | [${record.run_id}/${record.run_attempt}](${record.url}) | ${safe(record.conclusion)} | ${duration(record.attempt_elapsed_seconds)} | ${duration(record.job_execution_seconds)} | ${duration(record.rerun_delay_seconds)} | ${record.observed_artifact_bytes_run_scope ?? "unknown"} |`);
  lines.push("", "Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.", "", "## Recent failures and cancellations", "");
  for (const record of report.failures) {
    lines.push(`- [${safe(record.repository)} ${record.run_id}/${record.run_attempt}](${record.url}): ${safe(record.conclusion)}.`);
    for (const job of record.failed_jobs) lines.push(`  - ${safe(job.name)}: ${job.failed_steps.map(safe).join(", ") || "failed step unavailable"}.`);
  }
  if (!report.failures.length) lines.push("No non-success attempts in the recorded history.");
  return `${lines.join("\n")}\n`;
}
