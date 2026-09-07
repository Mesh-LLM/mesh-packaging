#!/usr/bin/env -S node --experimental-strip-types
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export type ReleaseIdentity = {
  readonly version: string;
  readonly mesh_ref: string;
  readonly mesh_sha: string;
  readonly packaging_sha: string;
};

export type ExpectedImageRow = {
  readonly artifact_id: string;
  readonly platform: string;
  readonly arch: string;
  readonly backend: string;
  readonly backend_version: string;
  readonly package_file: string;
  readonly package_base_image: string;
  readonly runtime_base_image: string;
  readonly tags: readonly string[];
};

export type ReleasePlan = {
  readonly schema_version: 1;
  readonly identity: ReleaseIdentity;
  readonly image_name: string;
  readonly expected_rows: readonly ExpectedImageRow[];
};

export type ImageRowResult = ExpectedImageRow & {
  readonly schema_version: 1;
  readonly plan_identity: ReleaseIdentity;
  readonly package: {
    readonly name: string;
    readonly sha256: string;
  };
  readonly upstream: {
    readonly mesh_ref: string;
    readonly mesh_sha: string;
  };
  readonly product: {
    readonly host_sha256: string;
    readonly runtime_id: string;
    readonly runtime_sha256: string;
  };
  readonly base_image: {
    readonly ref: string;
  };
  readonly image: {
    readonly name: string;
    readonly digest: string;
  };
  readonly qa: {
    readonly passed: true;
    readonly image_digest: string;
  };
};

export type ReleaseIndex = {
  readonly schema_version: 1;
  readonly identity: ReleaseIdentity;
  readonly image_name: string;
  readonly rows: readonly ImageRowResult[];
};

const SHA256 = /^[0-9a-f]{64}$/;
const IMAGE_DIGEST = /^sha256:[0-9a-f]{64}$/;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PLATFORM = /^[a-z0-9]+\/[a-z0-9_]+$/;
const OCI_NAME = /^[a-z0-9][a-z0-9._:-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/;
const OCI_TAG = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;

function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${field} must be an object`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], field: string): void {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${field} must contain exactly: ${expected.join(", ")}`);
  }
}

function string(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
}

function matching(value: unknown, pattern: RegExp, field: string): string {
  const result = string(value, field);
  if (!pattern.test(result)) throw new Error(`${field} has an invalid value`);
  return result;
}

function sha256(value: unknown, field: string): string {
  const result = string(value, field);
  if (!SHA256.test(result)) throw new Error(`${field} must be a lowercase SHA-256 digest`);
  return result;
}

function imageDigest(value: unknown, field: string): string {
  const result = string(value, field);
  if (!IMAGE_DIGEST.test(result)) {
    throw new Error(`${field} must be a lowercase sha256:<digest>`);
  }
  return result;
}

function gitSha(value: unknown, field: string): string {
  return matching(value, /^[0-9a-f]{40}$/, field);
}

function ociName(value: unknown, field: string): string {
  return matching(value, OCI_NAME, field);
}

function digestQualifiedRef(value: unknown, field: string): string {
  const result = string(value, field);
  const separator = result.lastIndexOf("@sha256:");
  if (separator <= 0) throw new Error(`${field} must be digest-qualified`);
  ociName(result.slice(0, separator), `${field} name`);
  sha256(result.slice(separator + "@sha256:".length), `${field} digest`);
  return result;
}

function optionalSafeString(value: unknown, field: string): string {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  if (value && !/^[A-Za-z0-9.-]+$/.test(value)) throw new Error(`${field} has an invalid value`);
  return value;
}

function identity(value: unknown, field: string): ReleaseIdentity {
  const raw = object(value, field);
  exactKeys(raw, ["version", "mesh_ref", "mesh_sha", "packaging_sha"], field);
  const version = matching(
    raw.version,
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/,
    `${field}.version`,
  );
  const meshRef = string(raw.mesh_ref, `${field}.mesh_ref`);
  if (meshRef !== `v${version}`) throw new Error(`${field}.mesh_ref and version disagree`);
  return {
    version,
    mesh_ref: meshRef,
    mesh_sha: gitSha(raw.mesh_sha, `${field}.mesh_sha`),
    packaging_sha: gitSha(raw.packaging_sha, `${field}.packaging_sha`),
  };
}

function tags(value: unknown, imageName: string, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must be a non-empty array`);
  }
  const prefix = `${imageName}:`;
  const result = value.map((raw, index) => {
    const tag = string(raw, `${field}[${index}]`);
    if (!tag.startsWith(prefix) || !OCI_TAG.test(tag.slice(prefix.length))) {
      throw new Error(`${field}[${index}] must be a tag for ${imageName}`);
    }
    return tag;
  });
  if (new Set(result).size !== result.length) throw new Error(`${field} contains duplicate tags`);
  return result.sort();
}

function rowFields(
  value: Record<string, unknown>,
  imageName: string,
  field: string,
): ExpectedImageRow {
  return {
    artifact_id: matching(value.artifact_id, SAFE_ID, `${field}.artifact_id`),
    platform: matching(value.platform, PLATFORM, `${field}.platform`),
    arch: matching(value.arch, /^[a-z0-9_]+$/, `${field}.arch`),
    backend: matching(value.backend, SAFE_ID, `${field}.backend`),
    backend_version: optionalSafeString(value.backend_version, `${field}.backend_version`),
    package_file: matching(value.package_file, SAFE_ID, `${field}.package_file`),
    package_base_image: digestQualifiedRef(value.package_base_image, `${field}.package_base_image`),
    runtime_base_image: digestQualifiedRef(value.runtime_base_image, `${field}.runtime_base_image`),
    tags: tags(value.tags, imageName, `${field}.tags`),
  };
}

function expectedRow(value: unknown, imageName: string, field: string): ExpectedImageRow {
  const raw = object(value, field);
  exactKeys(raw, [
    "artifact_id",
    "platform",
    "arch",
    "backend",
    "backend_version",
    "package_file",
    "package_base_image",
    "runtime_base_image",
    "tags",
  ], field);
  return rowFields(raw, imageName, field);
}

function assertUniqueRows(rows: readonly ExpectedImageRow[], field: string): void {
  if (rows.length === 0) throw new Error(`${field} must not be empty`);
  for (const key of ["artifact_id", "package_file"] as const) {
    const values = rows.map((row) => row[key]);
    if (new Set(values).size !== values.length) throw new Error(`${field} contains duplicate ${key}`);
  }
  const allTags = rows.flatMap((row) => row.tags);
  if (new Set(allTags).size !== allTags.length) throw new Error(`${field} contains duplicate tags`);
}

export function parseReleasePlan(value: unknown): ReleasePlan {
  const raw = object(value, "plan");
  exactKeys(raw, ["schema_version", "identity", "image_name", "expected_rows"], "plan");
  if (raw.schema_version !== 1) throw new Error("plan.schema_version must be 1");
  const imageName = ociName(raw.image_name, "plan.image_name");
  if (!Array.isArray(raw.expected_rows)) throw new Error("plan.expected_rows must be an array");
  const rows = raw.expected_rows
    .map((row, index) => expectedRow(row, imageName, `plan.expected_rows[${index}]`))
    .sort((left, right) => left.artifact_id.localeCompare(right.artifact_id));
  assertUniqueRows(rows, "plan.expected_rows");
  return {
    schema_version: 1,
    identity: identity(raw.identity, "plan.identity"),
    image_name: imageName,
    expected_rows: rows,
  };
}

function packageRecord(value: unknown, expected: ExpectedImageRow, field: string) {
  const raw = object(value, field);
  exactKeys(raw, ["name", "sha256"], field);
  const name = string(raw.name, `${field}.name`);
  if (name !== expected.package_file) throw new Error(`${field}.name does not match the plan`);
  return { name, sha256: sha256(raw.sha256, `${field}.sha256`) };
}

function upstreamRecord(value: unknown, plan: ReleasePlan, field: string) {
  const raw = object(value, field);
  exactKeys(raw, ["mesh_ref", "mesh_sha"], field);
  const result = {
    mesh_ref: string(raw.mesh_ref, `${field}.mesh_ref`),
    mesh_sha: gitSha(raw.mesh_sha, `${field}.mesh_sha`),
  };
  if (result.mesh_ref !== plan.identity.mesh_ref || result.mesh_sha !== plan.identity.mesh_sha) {
    throw new Error(`${field} does not match the plan identity`);
  }
  return result;
}

function productRecord(value: unknown, field: string) {
  const raw = object(value, field);
  exactKeys(raw, ["host_sha256", "runtime_id", "runtime_sha256"], field);
  return {
    host_sha256: sha256(raw.host_sha256, `${field}.host_sha256`),
    runtime_id: matching(raw.runtime_id, SAFE_ID, `${field}.runtime_id`),
    runtime_sha256: sha256(raw.runtime_sha256, `${field}.runtime_sha256`),
  };
}

function baseRecord(value: unknown, expected: ExpectedImageRow, field: string) {
  const raw = object(value, field);
  exactKeys(raw, ["ref"], field);
  const ref = digestQualifiedRef(raw.ref, `${field}.ref`);
  if (ref !== expected.runtime_base_image) throw new Error(`${field}.ref does not match the plan`);
  return { ref };
}

function imageRecord(value: unknown, plan: ReleasePlan, field: string) {
  const raw = object(value, field);
  exactKeys(raw, ["name", "digest"], field);
  const name = ociName(raw.name, `${field}.name`);
  if (name !== plan.image_name) throw new Error(`${field}.name does not match the plan`);
  return { name, digest: imageDigest(raw.digest, `${field}.digest`) };
}

function qaRecord(value: unknown, digest: string, field: string) {
  const raw = object(value, field);
  exactKeys(raw, ["passed", "image_digest"], field);
  if (raw.passed !== true) throw new Error(`${field}.passed must be true`);
  const testedDigest = imageDigest(raw.image_digest, `${field}.image_digest`);
  if (testedDigest !== digest) throw new Error(`${field}.image_digest does not match the image`);
  return { passed: true as const, image_digest: testedDigest };
}

function sameExpectedRow(actual: ExpectedImageRow, expected: ExpectedImageRow, field: string): void {
  if (stableJson(actual) !== stableJson(expected)) throw new Error(`${field} does not exactly match the plan row`);
}

export function parseImageRowResult(
  value: unknown,
  plan: ReleasePlan,
  expected: ExpectedImageRow,
  field = "result",
): ImageRowResult {
  const raw = object(value, field);
  exactKeys(raw, [
    "schema_version",
    "plan_identity",
    "artifact_id",
    "platform",
    "arch",
    "backend",
    "backend_version",
    "package_file",
    "package_base_image",
    "runtime_base_image",
    "tags",
    "package",
    "upstream",
    "product",
    "base_image",
    "image",
    "qa",
  ], field);
  if (raw.schema_version !== 1) throw new Error(`${field}.schema_version must be 1`);
  const resultIdentity = identity(raw.plan_identity, `${field}.plan_identity`);
  if (stableJson(resultIdentity) !== stableJson(plan.identity)) {
    throw new Error(`${field}.plan_identity does not match the plan`);
  }
  const row = rowFields(raw, plan.image_name, field);
  sameExpectedRow(row, expected, field);
  const image = imageRecord(raw.image, plan, `${field}.image`);
  return {
    schema_version: 1,
    plan_identity: resultIdentity,
    ...row,
    package: packageRecord(raw.package, expected, `${field}.package`),
    upstream: upstreamRecord(raw.upstream, plan, `${field}.upstream`),
    product: productRecord(raw.product, `${field}.product`),
    base_image: baseRecord(raw.base_image, expected, `${field}.base_image`),
    image,
    qa: qaRecord(raw.qa, image.digest, `${field}.qa`),
  };
}

function verifyHostInvariant(rows: readonly ImageRowResult[]): void {
  const hosts = new Map<string, string>();
  for (const row of rows) {
    const key = `${row.platform}/${row.arch}`;
    const previous = hosts.get(key);
    if (previous && previous !== row.product.host_sha256) {
      throw new Error(`rows for ${key} contain different host SHA-256 values`);
    }
    hosts.set(key, row.product.host_sha256);
  }
}

export function assembleReleaseIndex(planValue: unknown, resultValues: readonly unknown[]): ReleaseIndex {
  const plan = parseReleasePlan(planValue);
  const expected = new Map(plan.expected_rows.map((row) => [row.artifact_id, row]));
  const rawByArtifact = new Map<string, unknown>();
  for (const [index, value] of resultValues.entries()) {
    const raw = object(value, `results[${index}]`);
    const artifactId = matching(raw.artifact_id, SAFE_ID, `results[${index}].artifact_id`);
    if (!expected.has(artifactId)) throw new Error(`unexpected result artifact_id: ${artifactId}`);
    if (rawByArtifact.has(artifactId)) throw new Error(`duplicate result artifact_id: ${artifactId}`);
    rawByArtifact.set(artifactId, value);
  }
  const missing = plan.expected_rows
    .map((row) => row.artifact_id)
    .filter((artifactId) => !rawByArtifact.has(artifactId));
  if (missing.length > 0) throw new Error(`missing result rows: ${missing.join(", ")}`);
  const rows = plan.expected_rows.map((row) => parseImageRowResult(
    rawByArtifact.get(row.artifact_id),
    plan,
    row,
    `result ${row.artifact_id}`,
  ));
  assertUniqueRows(rows, "results");
  verifyHostInvariant(rows);
  return {
    schema_version: 1,
    identity: plan.identity,
    image_name: plan.image_name,
    rows,
  };
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stable(nested)]),
    );
  }
  return value;
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function jsonFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (path: string) => {
    for (const name of readdirSync(path).sort()) {
      const child = resolve(path, name);
      if (statSync(child).isDirectory()) visit(child);
      else if (name.endsWith(".json") && name !== "image-base-resolution.json") files.push(child);
    }
  };
  visit(root);
  return files;
}

function inputs(planPath: string, resultsPath: string): [unknown, unknown[]] {
  const files = jsonFiles(resultsPath);
  if (files.length === 0) throw new Error("results directory contains no JSON records");
  return [
    JSON.parse(readFileSync(planPath, "utf8")),
    files.map((path) => JSON.parse(readFileSync(path, "utf8"))),
  ];
}

export function assembleReleaseIndexFiles(planPath: string, resultsPath: string, outputPath: string): ReleaseIndex {
  const [plan, results] = inputs(planPath, resultsPath);
  const index = assembleReleaseIndex(plan, results);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, stableJson(index));
  return index;
}

export function verifyReleaseIndexFiles(planPath: string, resultsPath: string, indexPath: string): ReleaseIndex {
  const [plan, results] = inputs(planPath, resultsPath);
  const expected = assembleReleaseIndex(plan, results);
  if (readFileSync(indexPath, "utf8") !== stableJson(expected)) {
    throw new Error("release index is not the canonical index for the supplied plan and results");
  }
  return expected;
}

function parseArgs(argv: string[]): { command: string; values: Record<string, string> } {
  const command = argv[0] ?? "";
  const values: Record<string, string> = {};
  for (let index = 1; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`invalid argument near ${key ?? "end of input"}`);
    }
    if (values[key.slice(2)]) throw new Error(`duplicate argument: ${key}`);
    values[key.slice(2)] = value;
  }
  return { command, values };
}

function required(values: Record<string, string>, name: string): string {
  if (!values[name]) throw new Error(`--${name} is required`);
  return resolve(values[name]);
}

export function main(argv: string[]): number {
  try {
    const { command, values } = parseArgs(argv);
    if (command === "assemble") {
      const index = assembleReleaseIndexFiles(
        required(values, "plan"),
        required(values, "results"),
        required(values, "output"),
      );
      console.log(JSON.stringify({ rows: index.rows.length }));
    } else if (command === "verify") {
      const index = verifyReleaseIndexFiles(
        required(values, "plan"),
        required(values, "results"),
        required(values, "index"),
      );
      console.log(JSON.stringify({ rows: index.rows.length }));
    } else {
      throw new Error("command must be assemble or verify");
    }
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
