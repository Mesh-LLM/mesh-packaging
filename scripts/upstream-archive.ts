#!/usr/bin/env -S node --experimental-strip-types
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, closeSync, cpSync, createReadStream, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync, readSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

type Inputs = {
  archive: string;
  checksum: string;
  outputDir: string;
  sourceUrl: string;
  version: string;
  flavor: string;
};

const runtimeIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function productBackendForFlavor(flavor: string): string {
  if (flavor === "cuda-12" || flavor === "cuda-13") return "cuda";
  return flavor;
}

export function sha256File(path: string): Promise<string> {
  return new Promise((resolveDigest, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolveDigest(hash.digest("hex")));
  });
}

export function parseChecksum(contents: string, archiveName: string): string {
  const lines = contents.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length !== 1) throw new Error("checksum sidecar must contain exactly one non-empty line");
  const match = /^([0-9a-fA-F]{64})\s+\*?(.+)$/.exec(lines[0]);
  if (!match) throw new Error("checksum sidecar is not in SHA256SUMS format");
  if (match[2] !== archiveName) throw new Error(`checksum sidecar names ${match[2]}, expected ${archiveName}`);
  return match[1].toLowerCase();
}

export function validateArchiveEntries(entries: string[]): void {
  const normalized = entries.filter(Boolean).map((entry) => entry.replace(/^\.\//, ""));
  for (const entry of normalized) {
    if (entry.startsWith("/") || entry.split("/").includes("..")) {
      throw new Error(`unsafe archive entry: ${entry}`);
    }
    if (entry !== "mesh-bundle" && entry !== "mesh-bundle/" && !entry.startsWith("mesh-bundle/")) {
      throw new Error(`unexpected archive entry outside mesh-bundle: ${entry}`);
    }
  }
  const files = normalized.filter((entry) => !entry.endsWith("/"));
  const required = [
    "mesh-bundle/mesh-llm",
    "mesh-bundle/product-manifest.json",
    "mesh-bundle/host-imports.json",
  ];
  for (const path of required) {
    if (!files.includes(path)) throw new Error(`archive is missing required product file: ${path}`);
  }
  const runtimeIds = new Set<string>();
  for (const path of files) {
    if (required.includes(path)) continue;
    const match = /^mesh-bundle\/native-runtimes\/([^/]+)\/(.+)$/.exec(path);
    if (!match) throw new Error(`unexpected product archive entry: ${path}`);
    const [, runtimeId, relative] = match;
    if (!runtimeIdPattern.test(runtimeId)) throw new Error(`unsafe native runtime id: ${runtimeId}`);
    if (relative !== "manifest.json" && relative !== "README.md" && !relative.startsWith("lib/") && !relative.startsWith("tools/")) {
      throw new Error(`unexpected native runtime entry: ${path}`);
    }
    runtimeIds.add(runtimeId);
  }
  if (runtimeIds.size !== 1) {
    throw new Error(`archive must contain exactly one native runtime; found ${runtimeIds.size}`);
  }
  const runtimePrefix = `mesh-bundle/native-runtimes/${[...runtimeIds][0]}`;
  for (const path of [`${runtimePrefix}/manifest.json`, `${runtimePrefix}/README.md`]) {
    if (!files.includes(path)) throw new Error(`archive is missing required native runtime file: ${path}`);
  }
  if (!files.some((path) => path.startsWith(`${runtimePrefix}/lib/`))) {
    throw new Error(`native runtime must contain at least one library under ${runtimePrefix}/lib`);
  }
}

export function validateArchiveEntryTypes(entries: string[]): void {
  for (const entry of entries.filter(Boolean)) {
    const type = entry[0];
    if (type !== "-" && type !== "d") {
      throw new Error(`archive links and special files are not allowed: ${entry}`);
    }
  }
}

type ProductManifest = {
  schema_version: number;
  contract: string;
  mesh_version: string;
  backend: string;
  host: { path: string; sha256: string };
  runtime: { id: string; path: string; sha256: string; manifest_sha256: string };
};

function assertSha256(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${name} must be a lowercase SHA-256 digest`);
  }
}

function assertExactKeys(value: object, expected: string[], name: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${name} contains unexpected or missing fields: ${actual.join(", ")}`);
  }
}

export function validateProductManifest(value: unknown): ProductManifest {
  if (!value || typeof value !== "object") throw new Error("product manifest must be an object");
  const manifest = value as ProductManifest;
  assertExactKeys(manifest, ["schema_version", "contract", "mesh_version", "backend", "host", "runtime"], "product manifest");
  if (manifest.schema_version !== 2 || manifest.contract !== "mesh-llm-product-v2") {
    throw new Error("unsupported product manifest contract");
  }
  if (typeof manifest.mesh_version !== "string" || !manifest.mesh_version) throw new Error("product manifest mesh_version is required");
  if (typeof manifest.backend !== "string" || !manifest.backend) throw new Error("product manifest backend is required");
  if (!manifest.host || typeof manifest.host !== "object") throw new Error("product manifest host is required");
  assertExactKeys(manifest.host, ["path", "sha256"], "product host");
  if (manifest.host?.path !== "mesh-llm") throw new Error("product manifest host path must be mesh-llm");
  assertSha256(manifest.host?.sha256, "product host sha256");
  if (!manifest.runtime || typeof manifest.runtime !== "object") throw new Error("product manifest runtime is required");
  assertExactKeys(manifest.runtime, ["id", "path", "sha256", "manifest_sha256"], "product runtime");
  if (typeof manifest.runtime?.id !== "string" || !manifest.runtime.id) throw new Error("product runtime id is required");
  if (!runtimeIdPattern.test(manifest.runtime.id)) throw new Error("product runtime id contains unsafe characters");
  if (manifest.runtime.path !== `native-runtimes/${manifest.runtime.id}`) {
    throw new Error("product runtime path must match its runtime id");
  }
  assertSha256(manifest.runtime.sha256, "product runtime sha256");
  assertSha256(manifest.runtime.manifest_sha256, "product runtime manifest sha256");
  return manifest;
}

function filesBelow(root: string, current = root): string[] {
  return readdirSync(current).flatMap((name) => {
    const path = resolve(current, name);
    return statSync(path).isDirectory() ? filesBelow(root, path) : [path];
  });
}

export function sha256Tree(root: string): string {
  const digest = createHash("sha256");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  for (const path of filesBelow(root).sort()) {
    const relative = path.slice(root.length + 1).replaceAll("\\", "/");
    const encoded = Buffer.from(relative);
    const length = Buffer.alloc(8);
    const fileDigest = createHash("sha256");
    const file = openSync(path, "r");
    try {
      let bytesRead = readSync(file, buffer, 0, buffer.length, null);
      while (bytesRead > 0) {
        fileDigest.update(buffer.subarray(0, bytesRead));
        bytesRead = readSync(file, buffer, 0, buffer.length, null);
      }
    } finally {
      closeSync(file);
    }
    length.writeBigUInt64BE(BigInt(encoded.length));
    digest.update(length);
    digest.update(encoded);
    digest.update(fileDigest.digest());
  }
  return digest.digest("hex");
}

function runTar(args: string[]): string {
  const result = spawnSync("tar", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`tar ${args[0]} failed: ${result.stderr.trim()}`);
  return result.stdout;
}

export async function verifyAndExtract(input: Inputs) {
  const archive = resolve(input.archive);
  const checksum = resolve(input.checksum);
  const archiveName = basename(archive);
  const expected = parseChecksum(readFileSync(checksum, "utf8"), archiveName);
  const actual = await sha256File(archive);
  if (actual !== expected) throw new Error(`SHA-256 mismatch for ${archiveName}: expected ${expected}, got ${actual}`);

  validateArchiveEntries(runTar(["-tzf", archive]).split(/\r?\n/));
  validateArchiveEntryTypes(runTar(["-tvzf", archive]).split(/\r?\n/));
  const temporary = mkdtempSync(resolve(tmpdir(), "mesh-llm-upstream-"));
  try {
    runTar(["-xzf", archive, "-C", temporary, "mesh-bundle"]);
    rmSync(input.outputDir, { recursive: true, force: true });
    mkdirSync(input.outputDir, { recursive: true });
    cpSync(resolve(temporary, "mesh-bundle"), input.outputDir, { recursive: true });
    const binary = resolve(input.outputDir, "mesh-llm");
    chmodSync(binary, 0o755);
    const productManifest = validateProductManifest(JSON.parse(readFileSync(resolve(input.outputDir, "product-manifest.json"), "utf8")));
    if (productManifest.mesh_version !== input.version.replace(/^v/, "")) throw new Error("product manifest version does not match requested upstream version");
    if (productManifest.backend !== productBackendForFlavor(input.flavor)) {
      throw new Error("product manifest backend does not match requested upstream flavor");
    }
    const hostSha256 = await sha256File(binary);
    if (hostSha256 !== productManifest.host.sha256) throw new Error("product host digest does not match extracted mesh-llm");
    const runtime = resolve(input.outputDir, productManifest.runtime.path);
    const runtimeSha256 = sha256Tree(runtime);
    if (runtimeSha256 !== productManifest.runtime.sha256) throw new Error("product runtime digest does not match extracted runtime tree");
    const runtimeManifestSha256 = await sha256File(resolve(runtime, "manifest.json"));
    if (runtimeManifestSha256 !== productManifest.runtime.manifest_sha256) throw new Error("product runtime manifest digest does not match");
    const provenance = resolve(input.outputDir, "upstream-provenance.json");
    writeFileSync(provenance, `${JSON.stringify({
      archive: archiveName,
      flavor: input.flavor,
      host_sha256: productManifest.host?.sha256,
      runtime_id: productManifest.runtime?.id,
      runtime_sha256: productManifest.runtime?.sha256,
      sha256: actual,
      source_url: input.sourceUrl,
      version: input.version,
    }, null, 2)}\n`);
    return { binary, bundle: resolve(input.outputDir), provenance, sha256: actual };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

function options(argv: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) throw new Error(`invalid argument near ${key ?? "end of input"}`);
    parsed[key.slice(2)] = value;
  }
  return parsed;
}

function required(values: Record<string, string>, name: string): string {
  if (!values[name]) throw new Error(`--${name} is required`);
  return values[name];
}

export async function main(argv: string[]): Promise<number> {
  try {
    const values = options(argv);
    const result = await verifyAndExtract({
      archive: required(values, "archive"),
      checksum: required(values, "checksum"),
      outputDir: resolve(required(values, "output-dir")),
      sourceUrl: required(values, "source-url"),
      version: required(values, "version"),
      flavor: required(values, "flavor"),
    });
    console.log(JSON.stringify(result));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
