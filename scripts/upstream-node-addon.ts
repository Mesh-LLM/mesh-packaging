#!/usr/bin/env -S node --experimental-strip-types
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Options = {
  archive: string;
  checksum: string;
  outputDir: string;
  target: string;
  version: string;
};

const TARGETS = new Set([
  "darwin-arm64",
  "darwin-x64",
  "linux-arm64",
  "linux-x64",
  "win32-x64",
]);
const SHA256 = /^[0-9a-f]{64}$/;

function parseArgs(argv: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!name?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`invalid argument pair at ${name ?? "<end>"}`);
    }
    if (values.has(name)) throw new Error(`duplicate option: ${name}`);
    values.set(name, value);
  }
  const required = (name: string): string => {
    const value = values.get(name);
    if (!value) throw new Error(`${name} is required`);
    return value;
  };
  const known = new Set(["--archive", "--checksum", "--output-dir", "--target", "--version"]);
  const unknown = [...values.keys()].find((name) => !known.has(name));
  if (unknown) throw new Error(`unknown option: ${unknown}`);
  return {
    archive: resolve(required("--archive")),
    checksum: resolve(required("--checksum")),
    outputDir: resolve(required("--output-dir")),
    target: required("--target"),
    version: required("--version"),
  };
}

function digest(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function command(args: string[]): string {
  const result = spawnSync("tar", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`tar ${args[0]} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

function verifyChecksum(options: Options): void {
  const line = readFileSync(options.checksum, "utf8").trim();
  const match = /^([0-9a-f]{64})  ([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(line);
  if (!match || match[2] !== basename(options.archive)) {
    throw new Error("checksum sidecar must bind exactly one expected archive filename");
  }
  if (digest(options.archive) !== match[1]) throw new Error("archive checksum mismatch");
}

function verifyMembers(options: Options): void {
  const root = `${options.target}/`;
  const expected = new Map([
    [root, "d"],
    [`${root}manifest.json`, "-"],
    [`${root}mesh_llm_nodejs.node`, "-"],
  ]);
  const names = command([
    "--list",
    "--gzip",
    "--file",
    options.archive,
  ]).trimEnd().split("\n");
  if (
    names.length !== expected.size
    || new Set(names).size !== expected.size
    || names.some((name) => !expected.has(name))
  ) {
    throw new Error("addon archive must contain exactly three expected entries");
  }
  const listing = command([
    "--list",
    "--verbose",
    "--gzip",
    "--file",
    options.archive,
  ]).trimEnd().split("\n");
  if (listing.length !== expected.size) throw new Error("addon archive must contain exactly three entries");
  const seen = new Set<string>();
  for (const line of listing) {
    const member = [...expected.keys()].find(
      (name) => line.endsWith(` ${name}`) || line.includes(` ${name} -> `),
    );
    if (!member || seen.has(member)) throw new Error("addon archive contains an unexpected or duplicate path");
    if (line[0] !== expected.get(member)) throw new Error(`unsafe archive member type: ${member}`);
    seen.add(member);
  }
}

function verifyExtracted(options: Options): void {
  const targetRoot = resolve(options.outputDir, options.target);
  const outputRoot = `${realpathSync(options.outputDir)}/`;
  const exactRoot = `${realpathSync(targetRoot)}/`;
  if (!exactRoot.startsWith(outputRoot)) throw new Error("extracted target escaped output directory");
  const addon = resolve(targetRoot, "mesh_llm_nodejs.node");
  const manifestPath = resolve(targetRoot, "manifest.json");
  for (const path of [targetRoot, addon, manifestPath]) {
    if (lstatSync(path).isSymbolicLink()) throw new Error("extracted addon contains a symbolic link");
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
  const keys = Object.keys(manifest).sort();
  const expectedKeys = ["file", "schema", "sha256", "target", "version"];
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    throw new Error("addon manifest has unexpected fields");
  }
  if (
    manifest.schema !== "mesh-llm-node-sdk-addon-v1"
    || manifest.version !== options.version
    || manifest.target !== options.target
    || manifest.file !== "mesh_llm_nodejs.node"
    || typeof manifest.sha256 !== "string"
    || !SHA256.test(manifest.sha256)
    || digest(addon) !== manifest.sha256
  ) {
    throw new Error("addon manifest does not bind the expected file, target, version, and digest");
  }
}

export function verifyAndExtract(options: Options): void {
  if (!TARGETS.has(options.target)) throw new Error(`unsupported Node addon target: ${options.target}`);
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(options.version)) {
    throw new Error(`invalid version: ${options.version}`);
  }
  verifyChecksum(options);
  verifyMembers(options);
  mkdirSync(options.outputDir, { recursive: true });
  command([
    "--extract",
    "--gzip",
    "--no-same-owner",
    "--no-same-permissions",
    "--directory",
    options.outputDir,
    "--file",
    options.archive,
  ]);
  verifyExtracted(options);
}

export function main(argv: string[]): number {
  try {
    verifyAndExtract(parseArgs(argv));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
