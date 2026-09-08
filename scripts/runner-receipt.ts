import { createHash } from "node:crypto";
import { canonicalJson, type Json } from "./ci-metrics-model.ts";

const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;
const INDEX = ["application/vnd.oci.image.index.v1+json", "application/vnd.docker.distribution.manifest.list.v2+json"];
const MANIFEST = ["application/vnd.oci.image.manifest.v1+json", "application/vnd.docker.distribution.manifest.v2+json"];
const CONFIG = ["application/vnd.oci.image.config.v1+json", "application/vnd.docker.container.image.v1+json"];
// Mirrored from runner-images measure-image-layers.py. Unknown media types remain unknown.
const COMPRESSION: Record<string, string> = {
  "application/vnd.oci.image.layer.v1.tar+gzip": "gzip",
  "application/vnd.oci.image.layer.nondistributable.v1.tar+gzip": "gzip",
  "application/vnd.docker.image.rootfs.diff.tar.gzip": "gzip",
  "application/vnd.docker.image.rootfs.foreign.diff.tar.gzip": "gzip",
  "application/vnd.oci.image.layer.v1.tar+zstd": "zstd",
  "application/vnd.oci.image.layer.nondistributable.v1.tar+zstd": "zstd",
  "application/vnd.oci.image.layer.v1.tar": "uncompressed",
  "application/vnd.oci.image.layer.nondistributable.v1.tar": "uncompressed",
  "application/vnd.docker.image.rootfs.diff.tar": "uncompressed",
};
function check(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(`Invalid runner receipt: ${message}`); }
function keys(value: any, expected: string[]) { check(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).sort().join() === [...expected].sort().join(), `expected keys ${expected.join(", ")}`); }
function string(value: any) { check(typeof value === "string" && value.length > 0 && value.length <= 256 && !/[\x00-\x1f\x7f-\x9f]/.test(value), "bounded string required"); }
function integer(value: any) { check(Number.isSafeInteger(value) && value >= 0, "nonnegative safe integer required"); }
function nullableInteger(value: any) { if (value !== null) integer(value); }
function sha(value: any, pattern = SHA) { check(typeof value === "string" && pattern.test(value), "invalid digest or revision"); }
const hash = (bytes: Buffer) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
export function parseJson(bytes: Buffer) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const result = JSON.parse(text);
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],:]/g) ?? [];
  let position = 0;
  function visit(depth: number) {
    check(depth <= 128, "JSON nesting exceeds 128 levels");
    const token = tokens[position++];
    if (token === "{") {
      const seen = new Set<string>();
      while (tokens[position] !== "}") {
        const key = JSON.parse(tokens[position++]); check(!seen.has(key), `duplicate JSON key: ${key}`); seen.add(key);
        position++; visit(depth + 1); if (tokens[position] === ",") position++;
      }
      position++;
    } else if (token === "[") {
      while (tokens[position] !== "]") { visit(depth + 1); if (tokens[position] === ",") position++; }
      position++;
    }
  }
  visit(0); return result;
}
const json = parseJson;
function equal(actual: any, expected: any, message: string) { check(canonicalJson(actual) === canonicalJson(expected), message); }
function descriptor(value: Json, types?: string[], layer = false) {
  keys(value, layer ? ["mediaType", "digest", "size", "compression"] : ["mediaType", "digest", "size"]);
  string(value.mediaType); sha(value.digest, DIGEST); integer(value.size);
  if (types) check(types.includes(value.mediaType) && value.size <= 16 * 1024 ** 2, "unsupported or oversized OCI metadata");
  if (layer) check(value.compression === (COMPRESSION[value.mediaType] ?? "unknown"), "compression disagrees with media type");
}
export function cacheEvidence(bytes: Buffer) {
  check(bytes.length <= 8 * 1024 ** 2, "cache evidence exceeds 8 MiB");
  const lines = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split(/\r\n|\r|\n/);
  if (lines.at(-1) === "") lines.pop();
  check(lines.length <= 100000, "cache evidence exceeds 100000 lines");
  let eventCount = 0; let vertexCount = 0; const cached = new Set<string>();
  for (const line of lines) {
    check(Buffer.byteLength(line) <= 65536, "cache event exceeds 64 KiB");
    if (!line.trim()) continue;
    const event = parseJson(Buffer.from(line));
    check(event && typeof event === "object" && !Array.isArray(event), "cache event must be an object");
    eventCount++;
    check(["vertexes", "statuses", "logs", "warnings"].some((key) => Object.hasOwn(event, key)), "unsupported rawjson envelope");
    for (const key of ["vertexes", "statuses", "logs", "warnings"]) if (Object.hasOwn(event, key)) check(Array.isArray(event[key]) && event[key].every((item: any) => item && typeof item === "object" && !Array.isArray(item)), "invalid rawjson envelope array");
    if (Object.hasOwn(event, "vertexes")) {
      check(Array.isArray(event.vertexes), "vertexes must be an array");
      for (const vertex of event.vertexes) {
        check(vertex && typeof vertex === "object" && !Array.isArray(vertex), "vertex must be an object");
        sha(vertex.digest, DIGEST); vertexCount++;
        if (Object.hasOwn(vertex, "cached")) check(typeof vertex.cached === "boolean", "cached must be boolean");
        if (vertex.cached === true) { sha(vertex.digest, DIGEST); cached.add(vertex.digest); }
      }
    }
  }
  check(vertexCount > 0, "rawjson evidence requires a vertex");
  return { format: "buildkit-rawjson-v1", sha256: hash(bytes), byte_count: bytes.length, event_count: eventCount, cached_vertex_digests: [...cached].sort() };
}

export function plainCacheEvidence(bytes: Buffer) {
  check(bytes.length <= 8 * 1024 ** 2, "cache evidence exceeds 8 MiB");
  const lines = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split(/\r\n|\r|\n/);
  if (lines.at(-1) === "") lines.pop();
  check(lines.length <= 100000, "cache evidence exceeds 100000 lines");
  let events = 0; let builders = 0;
  const definitions = new Map<number, string>(); const terminals = new Set<number>(); const cached = new Set<number>();
  for (const line of lines) {
    check(Buffer.byteLength(line) <= 65536, "cache event exceeds 64 KiB");
    if (!line.trim()) continue;
    events++;
    if (/^#0 building\b/.test(line)) check(++builders <= 1, "multiple build streams");
    const definition = /^#([1-9][0-9]*) (\[[^\]\r\n]+\] (?:RUN|COPY|ADD) .+)$/.exec(line);
    if (definition) {
      const id = Number(definition[1]); integer(id); check(id > 0, "positive operation ID required");
      check(!definitions.has(id) || definitions.get(id) === definition[2], "conflicting operation definition");
      check(!terminals.has(id) || definitions.has(id), "operation definition after terminal");
      definitions.set(id, definition[2]);
    }
    const terminal = /^#([1-9][0-9]*) (CACHED|DONE(?: [0-9]+(?:\.[0-9]+)?s)?|ERROR: .+)$/.exec(line);
    if (terminal) {
      const id = Number(terminal[1]); integer(id); check(id > 0, "positive operation ID required");
      if (definitions.has(id)) check(!terminals.has(id), "duplicate or conflicting terminal"); terminals.add(id);
      if (terminal[2] === "CACHED" && definitions.has(id)) cached.add(id);
    }
  }
  check(events > 0, "empty cache evidence");
  return { format: "buildkit-plain-v1", sha256: hash(bytes), byte_count: bytes.length, event_count: events, cached_operations: [...cached].sort((a, b) => a - b) };
}

/** With no sidecars, validate persisted structure and recorded bindings only. */
export function validateReceipt(receipt: Json, sidecars?: Record<string, Buffer>) {
  keys(receipt, ["schema", "type", "identity", "role", "outcome", "depot", "wrapper_elapsed_seconds", "context", "verification", "cache_evidence"]);
  check(receipt.schema === 1 && receipt.type === "mesh-llm-runner-build-metrics", "unsupported schema");
  const i = receipt.identity;
  keys(i, ["repository", "workflow_path", "run_id", "run_attempt", "head_sha", "runner_images_sha", "mesh_llm_sha", "environment", "backend_id", "platform"]);
  for (const name of ["repository", "workflow_path", "environment", "backend_id", "platform"]) string(i[name]);
  check(i.repository === "Mesh-LLM/mesh-llm-runner-images" && i.workflow_path === ".github/workflows/build-and-push.yml", "unsupported repository/workflow");
  for (const name of ["run_id", "run_attempt"]) { integer(i[name]); check(i[name] > 0, "positive run identity required"); }
  for (const name of ["head_sha", "runner_images_sha", "mesh_llm_sha"]) sha(i[name]);
  check(/^[a-z][a-z0-9-]*$/.test(i.environment) && /^[a-z][a-z0-9]*$/.test(i.backend_id), "invalid family identifier");
  check(["linux/amd64", "linux/arm64"].includes(i.platform), "unsupported platform");
  check(["production", "verification"].includes(receipt.role), "unsupported role");
  check(["success", "failure", "cancelled", "skipped", "unknown"].includes(receipt.outcome), "unsupported outcome");
  keys(receipt.depot, ["build_id", "project_id", "execution_seconds"]);
  for (const name of ["build_id", "project_id"]) if (receipt.depot[name] !== null) string(receipt.depot[name]);
  check(receipt.depot.execution_seconds === null, "Depot execution time is unmeasured");
  if (receipt.depot.project_id !== null) check(receipt.depot.project_id === "mzm95zcv7p", "Depot project differs from workflow configuration");
  if (receipt.outcome === "success") check(receipt.depot.build_id !== null && receipt.depot.project_id !== null, "successful invocation requires actual IDs");
  const elapsed = receipt.wrapper_elapsed_seconds;
  check(elapsed === null || typeof elapsed === "number" && Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= Number.MAX_SAFE_INTEGER, "invalid wrapper elapsed");
  keys(receipt.context, ["content_bytes", "file_count", "transfer_seconds"]);
  nullableInteger(receipt.context.content_bytes); nullableInteger(receipt.context.file_count);
  check((receipt.context.content_bytes === null) === (receipt.context.file_count === null) && receipt.context.transfer_seconds === null, "context measurements must be paired and transfer unknown");
  if (receipt.outcome === "skipped") check(receipt.depot.build_id === null && receipt.depot.project_id === null && elapsed === null && (receipt.role === "production" || receipt.context.content_bytes === null && receipt.context.file_count === null) && receipt.verification === null && receipt.cache_evidence === null, "skipped invocation IDs, timing, binding and cache must be null; verification context must be null");
  const v = receipt.verification;
  if (v !== null) {
    check(receipt.role === "verification" && receipt.outcome === "success", "production cannot contain verification");
    keys(v, ["verifier_sha", "identity_receipt_sha256", "oci", "layers", "totals"]);
    sha(v.verifier_sha); sha(v.identity_receipt_sha256, DIGEST);
    keys(v.oci, ["root", "manifest", "config"]);
    descriptor(v.oci.root, [...INDEX, ...MANIFEST]); descriptor(v.oci.manifest, MANIFEST); descriptor(v.oci.config, CONFIG);
    check(Array.isArray(v.layers) && v.layers.length > 0 && v.layers.length <= 4096, "invalid bounded layers");
    let total = 0; let compressed = 0; const seen = new Map<string, string>();
    for (const layer of v.layers) {
      descriptor(layer, undefined, true);
      const identity = `${layer.size}/${layer.mediaType}`;
      check(!seen.has(layer.digest) || seen.get(layer.digest) === identity, "inconsistent repeated layer descriptor");
      seen.set(layer.digest, identity); total += layer.size;
      if (["gzip", "zstd"].includes(layer.compression)) compressed += layer.size;
      integer(total); integer(compressed);
    }
    keys(v.totals, ["layer_descriptor_bytes", "compressed_layer_descriptor_bytes", "distinct_layer_digests"]);
    equal(v.totals, { layer_descriptor_bytes: total, compressed_layer_descriptor_bytes: compressed, distinct_layer_digests: [...seen.keys()].sort() }, "layer totals mismatch");
    if (sidecars) {
      const bytes = sidecars["identity.json"];
      check(bytes && bytes.length <= 16 * 1024 ** 2 && hash(bytes) === v.identity_receipt_sha256, "missing or mismatched identity sidecar hash");
      const identity = json(bytes);
      keys(identity, ["schema", "type", "image", "platform", "backend_id", "oci", "runtime", "layers", "scope"]);
      check(identity.schema === 1 && identity.type === "mesh-llm-runner-image-identity" && identity.backend_id === i.backend_id && identity.image === "ghcr.io/mesh-llm/mesh-llm-cuda-runner", "identity sidecar schema/platform/backend mismatch");
      const platform = { os: "linux", architecture: i.platform.split("/")[1] };
      equal(identity.platform, platform, "identity platform mismatch");
      equal(identity.oci, v.oci, "identity OCI mismatch"); equal(identity.layers, v.layers, "identity layers mismatch");
      const runtime = identity.runtime;
      check(runtime?.schema === 1 && runtime.type === "mesh-llm-runner-runtime-identity" && runtime.family?.environment === i.environment, "runtime identity mismatch");
      equal(runtime.platform, platform, "runtime platform mismatch");
      equal(runtime.source, { mesh_revision: i.mesh_llm_sha, runner_images_revision: i.runner_images_sha }, "runtime source mismatch");
      check(runtime.verification?.verifier_revision === v.verifier_sha, "verifier source mismatch");
      keys(runtime.family, ["environment", "backend", "cuda_series", "rocm_version"]);
      for (const key of ["cuda_series", "rocm_version"]) if (runtime.family[key] !== null) string(runtime.family[key]);
      const backend = i.backend_id.startsWith("cuda") ? "cuda" : i.backend_id.startsWith("rocm") ? "rocm" : i.backend_id;
      check(runtime.family?.backend === backend, "runtime backend mismatch");
      check((runtime.family.cuda_series !== null) === (backend === "cuda") && (runtime.family.rocm_version !== null) === (backend === "rocm"), "runtime toolkit fields disagree with backend");
    }
  } else if (sidecars) check(!sidecars["identity.json"], "unexpected identity sidecar");
  const c = receipt.cache_evidence;
  if (c !== null) {
    const plain = c.format === "buildkit-plain-v1";
    const field = plain ? "cached_operations" : "cached_vertex_digests";
    keys(c, ["format", "sha256", "byte_count", "event_count", field]);
    check(["buildkit-rawjson-v1", "buildkit-plain-v1"].includes(c.format) && receipt.depot.build_id !== null && receipt.depot.project_id !== null, "cache evidence requires invocation IDs and supported format");
    sha(c.sha256, DIGEST); integer(c.byte_count); integer(c.event_count);
    check(c.byte_count <= 8 * 1024 ** 2 && c.event_count <= 100000 && Array.isArray(c[field]) && c[field].length <= 100000, "invalid cache evidence bounds");
    c[field].forEach((value: any) => { if (plain) { integer(value); check(value > 0, "positive operation ID required"); } else sha(value, DIGEST); });
    equal(c[field], [...new Set(c[field])].sort(plain ? (a: any, b: any) => a - b : undefined), "cache observations must be sorted and unique");
    if (sidecars) {
      const filename = plain ? "cache.log" : "cache.jsonl";
      check(sidecars[filename] && !sidecars[plain ? "cache.jsonl" : "cache.log"], "missing or unexpected cache sidecar");
      equal(c, plain ? plainCacheEvidence(sidecars[filename]) : cacheEvidence(sidecars[filename]), "cache sidecar mismatch");
    }
  } else if (sidecars) check(!sidecars["cache.jsonl"] && !sidecars["cache.log"], "unexpected cache sidecar");
}
