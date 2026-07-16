#!/usr/bin/env -S node --experimental-strip-types
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Input = { version: string; sha256: string; templatePath: string; formulaOutput: string };
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TEMPLATE = resolve(ROOT, "packaging/homebrew/Formula/mesh-llm.rb.template");

export function normalizeHomebrewVersion(version: string): string {
  let normalized = version.trim();
  if (normalized.startsWith("refs/tags/")) normalized = normalized.slice("refs/tags/".length);
  if (normalized.startsWith("v")) normalized = normalized.slice(1);
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(normalized)) throw new Error(`invalid mesh-llm version: ${version}`);
  return normalized;
}

export function validateSha256(value: string): string {
  const digest = value.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error("--sha256 must be a 64-character hexadecimal digest");
  return digest;
}

export function upstreamMacosAsset(versionInput: string): string {
  return `mesh-llm-v${normalizeHomebrewVersion(versionInput)}-aarch64-apple-darwin.tar.gz`;
}

export function renderFormula(template: string, versionInput: string, sha256Input: string): string {
  const version = normalizeHomebrewVersion(versionInput);
  return template
    .replaceAll("{{VERSION}}", version)
    .replaceAll("{{ASSET}}", upstreamMacosAsset(version))
    .replaceAll("{{MACOS_ARM64_SHA256}}", validateSha256(sha256Input));
}

export function writeFormula(input: Input) {
  mkdirSync(dirname(input.formulaOutput), { recursive: true });
  const formula = renderFormula(readFileSync(input.templatePath, "utf8"), input.version, input.sha256);
  writeFileSync(input.formulaOutput, formula);
  return { formula: input.formulaOutput, version: normalizeHomebrewVersion(input.version), asset: upstreamMacosAsset(input.version) };
}

function parseArgs(argv: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) throw new Error(`invalid argument near ${key ?? "end of input"}`);
    values[key.slice(2)] = value;
  }
  return values;
}

function required(values: Record<string, string>, name: string): string {
  if (!values[name]) throw new Error(`--${name} is required`);
  return values[name];
}

export function main(argv: string[]): number {
  try {
    const values = parseArgs(argv);
    const output = writeFormula({
      version: required(values, "version"),
      sha256: required(values, "sha256"),
      templatePath: resolve(values.template ?? DEFAULT_TEMPLATE),
      formulaOutput: resolve(required(values, "formula-output")),
    });
    console.log(JSON.stringify(output));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
