#!/usr/bin/env -S node --experimental-strip-types
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { verifySbomSubject } from "./verify-sbom-subject.ts";

type Digest = { sha256?: unknown };
type StatementSubject = { name?: unknown; digest?: unknown };
type InTotoStatement = {
  _type?: unknown;
  subject?: unknown;
  predicateType?: unknown;
  predicate?: unknown;
};
type MatrixRow = {
  artifact_id?: unknown;
  package_file?: unknown;
};
type AggregatePackage = {
  artifact_id: string;
  buildkit_provenance: InTotoStatement;
};
type AggregatePredicate = {
  schema_version?: unknown;
  release?: unknown;
  packages?: unknown;
};
type ReleaseAsset = {
  name?: unknown;
  digest?: unknown;
};
type ReleaseRecord = {
  tag_name?: unknown;
  name?: unknown;
  body?: unknown;
  draft?: unknown;
  prerelease?: unknown;
  target_commitish?: unknown;
};

export type PackageSubject = {
  readonly name: string;
  readonly digest: { readonly sha256: string };
};

export type ReleaseIdentity = {
  readonly version: string;
  readonly mesh_ref: string;
  readonly mesh_sha: string;
  readonly packaging_sha: string;
};

export type AssemblyOptions = ReleaseIdentity & {
  readonly input: string;
  readonly homebrew: string;
  readonly matrix: string;
  readonly output: string;
  readonly metadata: string;
};

const STATEMENT_TYPE = "https://in-toto.io/Statement/v1";
const AGGREGATE_PREDICATE_TYPE = "https://meshllm.cloud/distribution-provenance/v1";

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sha256Line(path: string): string {
  return `${sha256(path)}  ${basename(path)}`;
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

function stableJson(value: unknown): string {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${field} must be a non-empty string`);
  return value;
}

function requireSha256(value: unknown, field: string): string {
  const digest = requireString(value, field).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error(`${field} must be a SHA-256 digest`);
  return digest;
}

function requireGitSha(value: string, field: string): string {
  if (!/^[0-9a-f]{40}$/.test(value)) throw new Error(`${field} must be a 40-character Git SHA`);
  return value;
}

function filesBelow(root: string): string[] {
  if (!existsSync(root)) throw new Error(`input directory does not exist: ${root}`);
  const output: string[] = [];
  const visit = (directory: string) => {
    for (const name of readdirSync(directory).sort()) {
      const path = resolve(directory, name);
      const stat = statSync(path);
      if (stat.isDirectory()) visit(path);
      else if (stat.isFile()) output.push(path);
    }
  };
  visit(root);
  return output;
}

function findUnique(files: readonly string[], name: string): string {
  const matches = files.filter((path) => basename(path) === name);
  if (matches.length !== 1) throw new Error(`expected exactly one ${name}, found ${matches.length}`);
  return matches[0];
}

function requireEmptyDirectory(path: string): void {
  if (existsSync(path) && readdirSync(path).length > 0) {
    throw new Error(`output directory must be empty: ${path}`);
  }
  mkdirSync(path, { recursive: true });
}

function matrixRows(path: string): { artifact_id: string; package_file: string }[] {
  const document = JSON.parse(readFileSync(path, "utf8")) as { include?: unknown };
  if (!Array.isArray(document.include)) throw new Error("matrix must contain an include array");
  const rows = document.include.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`matrix row ${index} must be an object`);
    const row = raw as MatrixRow;
    return {
      artifact_id: requireString(row.artifact_id, `matrix row ${index}.artifact_id`),
      package_file: requireString(row.package_file, `matrix row ${index}.package_file`),
    };
  }).sort((left, right) => left.package_file.localeCompare(right.package_file));
  if (rows.length === 0) throw new Error("release assembly matrix must not be empty");
  for (const field of ["artifact_id", "package_file"] as const) {
    const values = rows.map((row) => row[field]);
    if (new Set(values).size !== values.length) throw new Error(`matrix contains duplicate ${field}`);
  }
  return rows;
}

function statementSubject(statement: InTotoStatement, name: string, digest: string): void {
  if (statement._type !== STATEMENT_TYPE) throw new Error(`${name} provenance has an invalid statement type`);
  if (!Array.isArray(statement.subject) || statement.subject.length !== 1) {
    throw new Error(`${name} provenance must contain exactly one subject`);
  }
  const subject = statement.subject[0] as StatementSubject;
  const subjectName = requireString(subject?.name, `${name} provenance subject name`);
  const subjectDigest = requireSha256((subject?.digest as Digest | undefined)?.sha256, `${name} provenance subject digest`);
  if (subjectName !== name || subjectDigest !== digest) {
    throw new Error(`${name} provenance subject does not match the package name and SHA-256`);
  }
}

function copyUnique(source: string, output: string): void {
  const destination = resolve(output, basename(source));
  if (existsSync(destination)) throw new Error(`duplicate release asset: ${basename(source)}`);
  copyFileSync(source, destination);
}

function validateIdentity(identity: ReleaseIdentity): void {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(identity.version)) {
    throw new Error("version must be semver without a v prefix");
  }
  if (identity.mesh_ref !== `v${identity.version}`) throw new Error("mesh_ref and version disagree");
  requireGitSha(identity.mesh_sha, "mesh_sha");
  requireGitSha(identity.packaging_sha, "packaging_sha");
}

export function assembleReleaseEvidence(options: AssemblyOptions): PackageSubject[] {
  validateIdentity(options);
  requireEmptyDirectory(options.output);
  requireEmptyDirectory(options.metadata);
  const files = filesBelow(options.input);
  const subjects: PackageSubject[] = [];
  const packages: AggregatePackage[] = [];

  for (const row of matrixRows(options.matrix)) {
    const packagePath = findUnique(files, row.package_file);
    const sidecarPath = findUnique(files, `${row.package_file}.sha256`);
    const sbomPath = findUnique(files, `${row.artifact_id}.spdx.json`);
    const upstreamPath = findUnique(files, `${row.artifact_id}.upstream-provenance.json`);
    const buildkitPath = findUnique(files, `${row.artifact_id}.buildkit-provenance.json`);
    const subject = verifySbomSubject(packagePath, sidecarPath, sbomPath);
    const buildkit = JSON.parse(readFileSync(buildkitPath, "utf8")) as InTotoStatement;
    statementSubject(buildkit, subject.name, subject.sha256);
    subjects.push({ name: subject.name, digest: { sha256: subject.sha256 } });
    packages.push({ artifact_id: row.artifact_id, buildkit_provenance: buildkit });
    for (const source of [packagePath, sidecarPath, sbomPath, upstreamPath]) {
      copyUnique(source, options.output);
    }
  }

  const formula = findUnique(filesBelow(options.homebrew), "mesh-llm.rb");
  copyUnique(formula, options.output);
  const provenance = {
    _type: STATEMENT_TYPE,
    subject: subjects,
    predicateType: AGGREGATE_PREDICATE_TYPE,
    predicate: {
      schema_version: 1,
      release: {
        version: options.version,
        mesh_ref: options.mesh_ref,
        mesh_sha: options.mesh_sha,
        packaging_sha: options.packaging_sha,
      },
      packages,
    },
  };
  writeFileSync(resolve(options.output, "provenance.json"), stableJson(provenance));
  writeFileSync(
    resolve(options.metadata, "package-subjects.sha256"),
    `${subjects.map((subject) => `${subject.digest.sha256}  ${subject.name}`).join("\n")}\n`,
  );
  const releaseFiles = filesBelow(options.output).sort((left, right) => basename(left).localeCompare(basename(right)));
  writeFileSync(resolve(options.output, "SHA256SUMS"), `${releaseFiles.map(sha256Line).join("\n")}\n`);
  verifyReleaseEvidence(options.output, options.matrix, options);
  return subjects;
}

function expectedAssetNames(matrixPath: string): string[] {
  const names = matrixRows(matrixPath).flatMap((row) => [
    row.package_file,
    `${row.package_file}.sha256`,
    `${row.artifact_id}.spdx.json`,
    `${row.artifact_id}.upstream-provenance.json`,
  ]);
  return [...names, "mesh-llm.rb", "provenance.json", "SHA256SUMS"].sort();
}

function aggregateSubjects(document: InTotoStatement): PackageSubject[] {
  if (document._type !== STATEMENT_TYPE || document.predicateType !== AGGREGATE_PREDICATE_TYPE) {
    throw new Error("aggregate provenance has an invalid statement or predicate type");
  }
  if (!Array.isArray(document.subject)) throw new Error("aggregate provenance subjects are missing");
  return document.subject.map((raw, index) => {
    const subject = raw as StatementSubject;
    return {
      name: requireString(subject?.name, `aggregate subject ${index} name`),
      digest: { sha256: requireSha256((subject?.digest as Digest | undefined)?.sha256, `aggregate subject ${index} digest`) },
    };
  });
}

export function verifyReleaseEvidence(
  output: string,
  matrixPath: string,
  expectedIdentity?: ReleaseIdentity,
): PackageSubject[] {
  const files = filesBelow(output);
  const actualNames = files.map((path) => basename(path)).sort();
  const expectedNames = expectedAssetNames(matrixPath);
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error(`release asset set mismatch: expected ${expectedNames.join(",")}; got ${actualNames.join(",")}`);
  }
  const checksumPath = findUnique(files, "SHA256SUMS");
  const checksumLines = readFileSync(checksumPath, "utf8").trim().split(/\r?\n/);
  const expectedChecksumLines = files
    .filter((path) => basename(path) !== "SHA256SUMS")
    .sort((left, right) => basename(left).localeCompare(basename(right)))
    .map(sha256Line);
  if (JSON.stringify(checksumLines) !== JSON.stringify(expectedChecksumLines)) {
    throw new Error("SHA256SUMS does not exactly match the release asset set");
  }
  const provenance = JSON.parse(readFileSync(findUnique(files, "provenance.json"), "utf8")) as InTotoStatement;
  const subjects = aggregateSubjects(provenance);
  const rows = matrixRows(matrixPath);
  if (subjects.length !== rows.length) throw new Error(`aggregate provenance must contain ${rows.length} subjects`);
  const subjectMap = new Map(subjects.map((subject) => [subject.name, subject.digest.sha256]));
  if (subjectMap.size !== subjects.length) throw new Error("aggregate provenance contains duplicate subjects");
  for (const row of rows) {
    const packagePath = findUnique(files, row.package_file);
    const sidecarPath = findUnique(files, `${row.package_file}.sha256`);
    const sbomPath = findUnique(files, `${row.artifact_id}.spdx.json`);
    const verified = verifySbomSubject(packagePath, sidecarPath, sbomPath);
    if (subjectMap.get(row.package_file) !== verified.sha256) {
      throw new Error(`aggregate provenance does not match ${row.package_file}`);
    }
  }
  const predicate = provenance.predicate as AggregatePredicate;
  if (predicate?.schema_version !== 1 || !Array.isArray(predicate.packages) || predicate.packages.length !== rows.length) {
    throw new Error("aggregate provenance predicate does not contain all package statements");
  }
  const rowByArtifact = new Map(rows.map((row) => [row.artifact_id, row]));
  const seenArtifacts = new Set<string>();
  for (const raw of predicate.packages) {
    if (!raw || typeof raw !== "object") throw new Error("aggregate package provenance must be an object");
    const entry = raw as AggregatePackage;
    const artifactId = requireString(entry.artifact_id, "aggregate package artifact_id");
    const row = rowByArtifact.get(artifactId);
    if (!row || seenArtifacts.has(artifactId)) {
      throw new Error(`aggregate package provenance has unknown or duplicate artifact ${artifactId}`);
    }
    seenArtifacts.add(artifactId);
    statementSubject(entry.buildkit_provenance, row.package_file, requireSha256(
      subjectMap.get(row.package_file),
      `${row.package_file} aggregate digest`,
    ));
  }
  if (expectedIdentity) {
    validateIdentity(expectedIdentity);
    const releaseIdentity: ReleaseIdentity = {
      version: expectedIdentity.version,
      mesh_ref: expectedIdentity.mesh_ref,
      mesh_sha: expectedIdentity.mesh_sha,
      packaging_sha: expectedIdentity.packaging_sha,
    };
    if (JSON.stringify(stable(predicate.release)) !== JSON.stringify(stable(releaseIdentity))) {
      throw new Error("aggregate provenance release identity does not match");
    }
  }
  return subjects;
}

export type ReleaseComparison = {
  readonly release: string;
  readonly assets: string;
  readonly output: string;
  readonly tag: string;
  readonly title: string;
  readonly body: string;
  readonly targetSha: string;
};

export function compareExistingRelease(options: ReleaseComparison): void {
  const record = JSON.parse(readFileSync(options.release, "utf8")) as ReleaseRecord;
  const assets = JSON.parse(readFileSync(options.assets, "utf8")) as ReleaseAsset[];
  const checks: [unknown, unknown, string][] = [
    [record.tag_name, options.tag, "tag"],
    [record.name, options.title, "title"],
    [record.body, options.body, "body"],
    [record.target_commitish, options.targetSha, "target commit"],
    [record.draft, false, "draft state"],
    [record.prerelease, false, "prerelease state"],
  ];
  for (const [actual, expected, field] of checks) {
    if (actual !== expected) throw new Error(`existing release ${field} does not match`);
  }
  const local = new Map(filesBelow(options.output).map((path) => [basename(path), `sha256:${sha256(path)}`]));
  const remote = new Map<string, string>();
  for (const asset of assets) {
    const name = requireString(asset.name, "release asset name");
    const digest = requireString(asset.digest, `release asset ${name} digest`);
    if (remote.has(name)) throw new Error(`existing release contains duplicate asset ${name}`);
    remote.set(name, digest);
  }
  if (local.size !== remote.size) throw new Error("existing release asset count does not match");
  for (const [name, digest] of local) {
    if (remote.get(name) !== digest) throw new Error(`existing release asset ${name} does not match`);
  }
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
    values[key.slice(2)] = value;
  }
  return { command, values };
}

function required(values: Record<string, string>, name: string): string {
  if (!values[name]) throw new Error(`--${name} is required`);
  return values[name];
}

function resolved(values: Record<string, string>, name: string): string {
  return resolve(required(values, name));
}

export function main(argv: string[]): number {
  try {
    const { command, values } = parseArgs(argv);
    if (command === "assemble") {
      const subjects = assembleReleaseEvidence({
        input: resolved(values, "input"),
        homebrew: resolved(values, "homebrew"),
        matrix: resolved(values, "matrix"),
        output: resolved(values, "output"),
        metadata: resolved(values, "metadata"),
        version: required(values, "version"),
        mesh_ref: required(values, "mesh-ref"),
        mesh_sha: required(values, "mesh-sha"),
        packaging_sha: required(values, "packaging-sha"),
      });
      console.log(JSON.stringify({ subjects: subjects.length }));
    } else if (command === "verify") {
      const subjects = verifyReleaseEvidence(resolved(values, "output"), resolved(values, "matrix"), {
        version: required(values, "version"),
        mesh_ref: required(values, "mesh-ref"),
        mesh_sha: required(values, "mesh-sha"),
        packaging_sha: required(values, "packaging-sha"),
      });
      console.log(JSON.stringify({ subjects: subjects.length }));
    } else if (command === "compare-release") {
      compareExistingRelease({
        release: resolved(values, "release"),
        assets: resolved(values, "assets"),
        output: resolved(values, "output"),
        tag: required(values, "tag"),
        title: required(values, "title"),
        body: readFileSync(resolved(values, "body-file"), "utf8"),
        targetSha: required(values, "target-sha"),
      });
      console.log(JSON.stringify({ identical: true }));
    } else {
      throw new Error("command must be assemble, verify, or compare-release");
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
