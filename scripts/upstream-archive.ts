#!/usr/bin/env -S node --experimental-strip-types
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, createReadStream, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  }
  const files = normalized.filter((entry) => !entry.endsWith("/"));
  if (files.length !== 1 || files[0] !== "mesh-bundle/mesh-llm") {
    throw new Error(`archive must contain only mesh-bundle/mesh-llm; found: ${files.join(", ") || "no files"}`);
  }
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
  mkdirSync(input.outputDir, { recursive: true });
  const temporary = mkdtempSync(resolve(tmpdir(), "mesh-llm-upstream-"));
  try {
    runTar(["-xzf", archive, "-C", temporary, "mesh-bundle/mesh-llm"]);
    const binary = resolve(input.outputDir, "mesh-llm");
    copyFileSync(resolve(temporary, "mesh-bundle/mesh-llm"), binary);
    chmodSync(binary, 0o755);
    const provenance = resolve(input.outputDir, "upstream-provenance.json");
    writeFileSync(provenance, `${JSON.stringify({
      archive: archiveName,
      flavor: input.flavor,
      sha256: actual,
      source_url: input.sourceUrl,
      version: input.version,
    }, null, 2)}\n`);
    return { binary, provenance, sha256: actual };
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
