#!/usr/bin/env -S node --experimental-strip-types
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { canonicalJson, normalizeAttempt, repositoryName, REPOSITORIES, timestamp, type Json } from "./ci-metrics-model.ts";
import { buildReport, renderReport } from "./ci-metrics-report.ts";

export type Api = (path: string) => Promise<Json>;

export function githubApi(maxRequests = 300): Api {
  let requests = 0;
  return async (path) => {
    if (++requests > maxRequests) throw new Error(`GitHub request budget exhausted (${maxRequests}); narrow the collection window`);
    const output = execFileSync("gh", ["api", "--method", "GET", "--hostname", "github.com", path], { encoding: "utf8", timeout: 60_000, maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
    return JSON.parse(output);
  };
}

export async function pages(api: Api, path: string, field: string, maxPages = 10): Promise<Json[]> {
  const items: Json[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const response = await api(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    if (!Array.isArray(response[field]) || !Number.isSafeInteger(response.total_count)) throw new Error(`Invalid ${field} API response`);
    items.push(...response[field]);
    if (items.length >= response.total_count) return items;
    if (response[field].length === 0) throw new Error(`Incomplete ${field} API pagination`);
  }
  throw new Error(`${field} exceeds the ${maxPages * 100} item collection bound`);
}

export function writeJson(path: string, value: unknown) {
  const contents = canonicalJson(value);
  if (existsSync(path) && readFileSync(path, "utf8") === contents) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

export async function collectRun(api: Api, repository: string, runId: number, output: string, maxAttempts = 20): Promise<string[]> {
  const repo = repositoryName(repository);
  if (!Number.isSafeInteger(runId) || runId <= 0) throw new Error("Run ID must be a positive integer");
  const prefix = `repos/${repo}/actions/runs/${runId}`;
  const latest = await api(prefix);
  const workflowPath = String(latest.path ?? "").split("@")[0].split("/").at(-1);
  if (!REPOSITORIES[repo].includes(workflowPath!)) throw new Error(`Workflow is not allowed: ${latest.path}`);
  if (!Number.isSafeInteger(latest.run_attempt) || latest.run_attempt < 1 || latest.run_attempt > maxAttempts) throw new Error(`Run attempt exceeds collection bound: ${latest.run_attempt}`);
  const recordPath = (run: Json) => {
    const month = timestamp(run.created_at)?.slice(0, 7);
    if (!month) throw new Error("Attempt creation timestamp is required for storage");
    return resolve(output, "records", repo.replace("/", "__"), month, `${runId}-${run.run_attempt}.json`);
  };
  const attempts: Json[] = [];
  const historicalArtifacts: Json[] = [];
  for (let attempt = 1; attempt <= latest.run_attempt; attempt++) {
    const run = await api(`${prefix}/attempts/${attempt}`);
    if (run.id !== runId || run.run_attempt !== attempt || run.head_sha !== latest.head_sha || run.workflow_id !== latest.workflow_id || run.path !== latest.path) throw new Error("GitHub returned mismatched run attempt identity");
    attempts.push(run);
    const path = recordPath(run);
    if (!existsSync(path)) continue;
    const stored = JSON.parse(readFileSync(path, "utf8"));
    if (stored.schema_version !== 1 || stored.repository !== repo || stored.run_id !== runId || stored.run_attempt !== attempt || stored.head_sha !== run.head_sha || stored.workflow?.id !== run.workflow_id || stored.workflow?.path !== run.path || stored.created_at !== timestamp(run.created_at)) throw new Error(`Stored metrics identity does not match source run: ${path}`);
    if (stored.artifacts?.items != null && !Array.isArray(stored.artifacts.items)) throw new Error(`Invalid stored artifact history: ${path}`);
    historicalArtifacts.push(...(stored.artifacts?.items ?? []));
  }
  const artifacts = await pages(api, `${prefix}/artifacts`, "artifacts");
  const files: string[] = [];
  let previous: Json | null = null;
  for (const run of attempts) {
    if (run.status !== "completed") continue;
    const jobs = await pages(api, `${prefix}/attempts/${run.run_attempt}/jobs`, "jobs");
    const record = normalizeAttempt(repo, run, jobs, artifacts, previous, historicalArtifacts);
    const path = recordPath(run);
    writeJson(path, record);
    files.push(path);
    previous = run;
  }
  return files;
}

export async function discoverRuns(api: Api, repository: string, since: string, until: string, maxRuns: number, known: Json[] = []): Promise<number[]> {
  const repo = repositoryName(repository);
  const runs = new Map<number, Json>();
  for (const workflow of REPOSITORIES[repo]) {
    const created = encodeURIComponent(`${since}..${until}`);
    const result = await api(`repos/${repo}/actions/workflows/${workflow}/runs?status=completed&created=${created}&per_page=100&page=1`);
    if (!Array.isArray(result.workflow_runs)) throw new Error("Invalid workflow run listing");
    for (const run of result.workflow_runs) runs.set(run.id, run);
  }
  const stored = new Set(known.filter((record) => record.repository === repo).map((record) => `${record.run_id}/${record.run_attempt}`));
  return [...runs.values()].sort((a, b) => Number(stored.has(`${a.id}/${a.run_attempt}`)) - Number(stored.has(`${b.id}/${b.run_attempt}`)) || String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id).slice(0, maxRuns).map((run) => run.id);
}

export function readRecords(root: string): Json[] {
  const records: Json[] = [];
  function walk(directory: string) {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith(".json")) {
        const record = JSON.parse(readFileSync(path, "utf8"));
        if (record.schema_version !== 1 || !Number.isSafeInteger(record.run_id) || !Number.isSafeInteger(record.run_attempt) || !Array.isArray(record.jobs)) throw new Error(`Invalid metrics record: ${path}`);
        repositoryName(record.repository);
        records.push(record);
      }
    }
  }
  walk(resolve(root, "records"));
  return records;
}

function integer(value: string | undefined, fallback: number, max: number): number {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) throw new Error(`Expected integer between 1 and ${max}`);
  return parsed;
}

function date(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`Invalid date: ${value}`);
  return value;
}

export async function main(argv: string[], api?: Api) {
  const [command, ...args] = argv;
  const options: Record<string, string> = {};
  const allowed = new Set(["repository", "run-id", "output", "since", "until", "max-runs", "max-requests", "min-samples", "window", "regression-percent"]);
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]?.replace(/^--/, "");
    if (!args[index]?.startsWith("--") || !allowed.has(flag) || args[index + 1] === undefined || options[flag] !== undefined) throw new Error(`Invalid or duplicate option: ${args[index]}`);
    options[flag] = args[index + 1];
  }
  if (!["collect", "report"].includes(command)) throw new Error("Usage: ci-metrics.ts collect|report --output DIRECTORY [--repository Mesh-LLM/mesh-packaging --run-id ID | --since YYYY-MM-DD --until YYYY-MM-DD --max-runs 10]");
  if (!options.output) throw new Error("--output is required; use a separate metrics directory");
  const output = resolve(options.output);
  if (command === "collect") {
    const repo = repositoryName(options.repository ?? "Mesh-LLM/mesh-packaging");
    const github = api ?? githubApi(integer(options["max-requests"], 300, 1000));
    let runs: number[];
    if (options["run-id"]) {
      runs = [integer(options["run-id"], 1, Number.MAX_SAFE_INTEGER)];
    } else {
      const until = date(options.until ?? new Date().toISOString().slice(0, 10));
      const since = date(options.since ?? new Date(Date.parse(until) - 14 * 86400_000).toISOString().slice(0, 10));
      if (since > until) throw new Error("--since must not be after --until");
      runs = await discoverRuns(github, repo, since, until, integer(options["max-runs"], 10, 100), readRecords(output));
    }
    let count = 0;
    for (const run of runs) count += (await collectRun(github, repo, run, output)).length;
    return { repository: repo, runs: runs.length, attempts_written: count };
  }
  const report = buildReport(readRecords(output), { minSamples: integer(options["min-samples"], 5, 100), window: integer(options.window, 10, 100), regressionPercent: integer(options["regression-percent"], 20, 1000) });
  writeJson(resolve(output, "reports", "latest.json"), report);
  mkdirSync(resolve(output, "reports"), { recursive: true });
  writeFileSync(resolve(output, "reports", "latest.md"), renderReport(report));
  return { attempts: report.attempts, cohorts: report.cohorts.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then((result) => process.stdout.write(`${JSON.stringify(result)}\n`)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
