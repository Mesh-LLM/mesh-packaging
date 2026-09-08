import { createHash, randomUUID } from "node:crypto";
import { lstatSync, realpathSync, readFileSync, readdirSync, renameSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { canonicalJson, type Json } from "./ci-metrics-model.ts";
import { parseJson, validateReceipt } from "./runner-receipt.ts";

export const bytesHash = (bytes: Buffer) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const key = (r: Json) => [r.identity.environment, r.identity.backend_id, r.identity.platform, r.role].join("/");
function requireValue(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }

export function joinReceipt(record: Json, receipt: Json) {
  const i = receipt.identity;
  requireValue(record.schema_version === 1 && record.repository === i.repository && record.run_id === i.run_id && record.run_attempt === i.run_attempt && record.head_sha === i.head_sha && record.workflow?.path === i.workflow_path, "Receipt does not match exact history attempt identity");
  requireValue(Array.isArray(record.jobs), "Invalid history jobs");
  const phase = receipt.role === "production" ? "image_build" : "image_verification";
  const matches = record.jobs.filter((job: Json) => !job.reused_from_previous_attempt && job.started_at != null && job.conclusion !== "skipped" && job.dimensions?.image_environment === i.environment && job.dimensions?.image_backend_id === i.backend_id && job.dimensions?.arch === i.platform.split("/")[1] && Array.isArray(job.steps) && job.steps.some((step: Json) => step.phase === phase && (receipt.outcome === "skipped" ? step.conclusion === "skipped" : step.started_at != null && step.conclusion !== "skipped")));
  requireValue(matches.length === 1, `Receipt ${key(receipt)} requires exactly one executed, non-reused ${phase} job; found ${matches.length}`);
}

export function validateEnrichment(record: Json): void {
  if (record.enrichment === undefined) return;
  requireValue(record.enrichment && Object.keys(record.enrichment).join() === "runner_images", "Invalid enrichment keys");
  const enrichment = record.enrichment.runner_images;
  requireValue(enrichment && Object.keys(enrichment).sort().join() === "receipts,schema" && enrichment.schema === 1 && Array.isArray(enrichment.receipts) && enrichment.receipts.length <= 256, "Invalid runner image enrichment");
  const seen = new Set<string>();
  const identities = new Map<string, string>();
  let previous = "";
  for (const entry of enrichment.receipts) {
    requireValue(entry && Object.keys(entry).sort().join() === "receipt,sha256" && typeof entry.sha256 === "string" && /^sha256:[a-f0-9]{64}$/.test(entry.sha256), "Invalid stored receipt reference");
    validateReceipt(entry.receipt);
    joinReceipt(record, entry.receipt);
    const k = key(entry.receipt);
    requireValue(!seen.has(k) && k >= previous, "Duplicate or unsorted stored receipts");
    previous = k; seen.add(k);
    const family = k.slice(0, k.lastIndexOf("/"));
    const identity = canonicalJson(entry.receipt.identity);
    requireValue(!identities.has(family) || identities.get(family) === identity, "Cross-role source identity mismatch");
    identities.set(family, identity);
  }
}

function regular(path: string, maximum: number): Buffer {
  const stat = lstatSync(path);
  requireValue(stat.isFile() && !stat.isSymbolicLink() && stat.size <= maximum, `Expected regular bounded file: ${path}`);
  return readFileSync(path);
}
function directory(path: string) {
  const stat = lstatSync(path);
  requireValue(stat.isDirectory() && !stat.isSymbolicLink(), `Expected directory without symlinks: ${path}`);
}
export function enrich(output: string, receiptsDirectory: string) {
  directory(receiptsDirectory); directory(output);
  receiptsDirectory = realpathSync(receiptsDirectory); output = realpathSync(output);
  const bundles = readdirSync(receiptsDirectory).sort();
  requireValue(bundles.length <= 256, "Receipt directory exceeds 256 bundles; split the import");
  let aggregate = 0;
  const entries: Json[] = [];
  for (const name of bundles) {
    const path = resolve(receiptsDirectory, name); directory(path);
    const files = readdirSync(path).sort();
    requireValue(files.includes("receipt.json") && files.every((file) => ["receipt.json", "identity.json", "cache.jsonl", "cache.log"].includes(file)), `Invalid bundle files: ${name}`);
    const sidecars: Record<string, Buffer> = {};
    for (const file of files) {
      sidecars[file] = regular(resolve(path, file), file === "receipt.json" ? 1024 ** 2 : file.startsWith("cache.") ? 8 * 1024 ** 2 : 16 * 1024 ** 2);
      aggregate += sidecars[file].length;
      requireValue(aggregate <= 64 * 1024 ** 2, "Receipt input exceeds 64 MiB; split the import");
    }
    const receipt = parseJson(sidecars["receipt.json"]);
    validateReceipt(receipt, sidecars);
    entries.push({ sha256: bytesHash(sidecars["receipt.json"]), receipt });
  }
  const records = new Map<string, { path: string; record: Json }[]>();
  const filenames = new Set(entries.map(({ receipt }) => `${receipt.identity.run_id}-${receipt.identity.run_attempt}.json`));
  function walk(path: string) {
    directory(path);
    for (const name of readdirSync(path).sort()) {
      const next = resolve(path, name); const stat = lstatSync(next);
      requireValue(!stat.isSymbolicLink(), `Symlink is not allowed: ${next}`);
      if (stat.isDirectory()) walk(next);
      else if (stat.isFile() && filenames.has(name)) {
        const record = parseJson(regular(next, 64 * 1024 ** 2));
        const identity = `${record.repository}/${record.run_id}/${record.run_attempt}`;
        records.set(identity, [...(records.get(identity) ?? []), { path: next, record }]);
      }
    }
  }
  walk(resolve(output, "records"));
  const pending = new Map<string, Json>(); const seen = new Set<string>();
  for (const entry of entries) {
    const i = entry.receipt.identity;
    const invocation = `${i.repository}/${i.run_id}/${i.run_attempt}/${key(entry.receipt)}`;
    requireValue(!seen.has(invocation), `Duplicate invocation: ${invocation}`); seen.add(invocation);
    const matching = records.get(`${i.repository}/${i.run_id}/${i.run_attempt}`) ?? [];
    requireValue(matching.length === 1, `Missing or ambiguous history attempt: ${invocation}`);
    const { path, record: stored } = matching[0];
    validateEnrichment(stored);
    const record = pending.get(path) ?? structuredClone(stored);
    joinReceipt(record, entry.receipt);
    record.enrichment ??= { runner_images: { schema: 1, receipts: [] } };
    const receipts = record.enrichment.runner_images.receipts;
    const existing = receipts.find((item: Json) => key(item.receipt) === key(entry.receipt));
    requireValue(!existing || existing.sha256 === entry.sha256 && canonicalJson(existing.receipt) === canonicalJson(entry.receipt), `Immutable receipt conflict: ${invocation}`);
    if (!existing) receipts.push(entry);
    receipts.sort((a: Json, b: Json) => key(a.receipt) < key(b.receipt) ? -1 : key(a.receipt) > key(b.receipt) ? 1 : 0);
    validateEnrichment(record); pending.set(path, record);
  }
  let written = 0;
  // Validate every bundle and affected record before any replacement. Each file is atomic, not the whole batch.
  for (const [path, record] of pending) {
    const content = canonicalJson(record);
    if (readFileSync(path, "utf8") === content) continue;
    const temporary = `${path}.${randomUUID()}.tmp`;
    try { writeFileSync(temporary, content, { flag: "wx" }); renameSync(temporary, path); written++; }
    finally { try { unlinkSync(temporary); } catch (error: any) { if (error.code !== "ENOENT") throw error; } }
  }
  return { receipts: entries.length, attempts_written: written };
}
