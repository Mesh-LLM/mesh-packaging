#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileDigest } from "./file-digest.ts";
import { assembleReleaseEvidence, verifyReleaseEvidence, type ReleaseIdentity } from "./release-evidence.ts";

export type HandoffIdentity = ReleaseIdentity & { repository: string; run_id: number };
type Artifact = { id: number; name: string; digest: string; expired: boolean;
  workflow_run: { id: number; head_sha: string } };
type SourceArtifact = Pick<Artifact, "id" | "name" | "digest">;
type Asset = { name: string; sha256: string };
export type Handoff = {
  schema_version: 1;
  identity: HandoffIdentity;
  matrix_sha256: string;
  artifacts: SourceArtifact[];
  assets: Asset[];
};
const SHA256 = /^[0-9a-f]{64}$/;
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function exactKeys(value: unknown, keys: string[], label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).sort().join(",") !== [...keys].sort().join(",")) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function validateIdentity(identity: HandoffIdentity): void {
  exactKeys(identity, ["repository", "run_id", "version", "mesh_ref", "mesh_sha", "packaging_sha"], "identity");
  if (identity.repository !== "Mesh-LLM/mesh-packaging"
      || !Number.isSafeInteger(identity.run_id) || identity.run_id < 1
      || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(identity.version)
      || identity.mesh_ref !== `v${identity.version}`
      || !/^[0-9a-f]{40}$/.test(identity.mesh_sha)
      || !/^[0-9a-f]{40}$/.test(identity.packaging_sha)) {
    throw new Error("invalid release handoff identity");
  }
}

function expectedArtifacts(matrixPath: string, version: string): string[] {
  const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
  if (!Array.isArray(matrix.include) || matrix.include.length === 0) throw new Error("empty package matrix");
  const names = matrix.include.map((row: { native_package_artifact_name: string }) => row.native_package_artifact_name);
  names.push(`mesh-llm-homebrew-${version}`);
  if (names.some((name: unknown) => typeof name !== "string" || !SAFE_NAME.test(name))
      || new Set(names).size !== names.length) throw new Error("invalid or duplicate source artifact names");
  return names.sort();
}

function assetDigests(output: string): Asset[] {
  return readdirSync(output).sort().map((name) => ({ name, sha256: fileDigest(resolve(output, name)) }));
}

export function createHandoff(
  output: string, matrix: string, identity: HandoffIdentity, inventory: Artifact[],
): Handoff {
  validateIdentity(identity);
  verifyReleaseEvidence(output, matrix, identity);
  const artifacts = expectedArtifacts(matrix, identity.version).map((name) => {
    const matches = inventory.filter((artifact) => artifact.name === name);
    if (matches.length !== 1) throw new Error(`expected exactly one original artifact: ${name}`);
    const artifact = matches[0];
    if (artifact.expired !== false || artifact.workflow_run?.id !== identity.run_id
        || artifact.workflow_run?.head_sha !== identity.packaging_sha) {
      throw new Error(`source artifact is expired or belongs to another run/revision: ${name}`);
    }
    return { id: artifact.id, name, digest: artifact.digest };
  });
  const handoff: Handoff = {
    schema_version: 1, identity, matrix_sha256: fileDigest(matrix), artifacts, assets: assetDigests(output),
  };
  validateHandoff(handoff, matrix, identity);
  return handoff;
}

export function validateHandoff(value: unknown, matrix: string, identity: HandoffIdentity): Handoff {
  validateIdentity(identity);
  exactKeys(value, ["schema_version", "identity", "matrix_sha256", "artifacts", "assets"], "handoff");
  const handoff = value as unknown as Handoff;
  validateIdentity(handoff.identity);
  if (handoff.schema_version !== 1 || Object.entries(identity).some(([key, entry]) =>
    handoff.identity[key as keyof HandoffIdentity] !== entry)) throw new Error("release handoff identity mismatch");
  if (handoff.matrix_sha256 !== fileDigest(matrix)) throw new Error("release handoff matrix mismatch");
  if (!Array.isArray(handoff.artifacts)) throw new Error("handoff artifacts must be an array");
  const ids = new Set<number>();
  for (const artifact of handoff.artifacts) {
    exactKeys(artifact, ["id", "name", "digest"], "artifact");
    if (!Number.isSafeInteger(artifact.id) || artifact.id < 1 || ids.has(artifact.id)
        || typeof artifact.digest !== "string" || !/^sha256:[0-9a-f]{64}$/.test(artifact.digest)) {
      throw new Error("invalid or duplicate immutable artifact identity");
    }
    ids.add(artifact.id);
  }
  if (JSON.stringify(handoff.artifacts.map((artifact) => artifact.name).sort())
      !== JSON.stringify(expectedArtifacts(matrix, identity.version))) throw new Error("handoff source artifact set mismatch");
  if (!Array.isArray(handoff.assets) || handoff.assets.length === 0) throw new Error("missing handoff asset digests");
  const names = new Set<string>();
  for (const asset of handoff.assets) {
    exactKeys(asset, ["name", "sha256"], "asset");
    if (typeof asset.name !== "string" || !SAFE_NAME.test(asset.name) || names.has(asset.name)
        || typeof asset.sha256 !== "string" || !SHA256.test(asset.sha256)) throw new Error("invalid handoff asset digest");
    names.add(asset.name);
  }
  return handoff;
}

export function reconstructRelease(
  handoff: Handoff, matrix: string, identity: HandoffIdentity, input: string, output: string, metadata: string,
): void {
  validateHandoff(handoff, matrix, identity);
  const expected = handoff.artifacts.map((artifact) => artifact.name).sort();
  if (JSON.stringify(readdirSync(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("downloaded original artifact set mismatch");
  }
  assembleReleaseEvidence({
    ...identity, matrix, input, output, metadata,
    homebrew: resolve(input, `mesh-llm-homebrew-${identity.version}`),
  });
  const assets = [...handoff.assets].sort((a, b) => a.name.localeCompare(b.name, "en"));
  const actual = assetDigests(output).sort((a, b) => a.name.localeCompare(b.name, "en"));
  if (JSON.stringify(actual) !== JSON.stringify(assets)) throw new Error("reconstructed release differs from verified handoff");
}

export function main(argv: string[]): number {
  try {
    const [command, ...args] = argv;
    const options = new Map<string, string>();
    for (let index = 0; index < args.length; index += 2) {
      if (!args[index]?.startsWith("--") || !args[index + 1] || options.has(args[index])) throw new Error("invalid handoff arguments");
      options.set(args[index], args[index + 1]);
    }
    const required = (name: string) => {
      const value = options.get(`--${name}`);
      if (!value) throw new Error(`--${name} is required`);
      return value;
    };
    const identity: HandoffIdentity = {
      repository: required("repository"), run_id: Number(required("run-id")), version: required("version"),
      mesh_ref: required("mesh-ref"), mesh_sha: required("mesh-sha"), packaging_sha: required("packaging-sha"),
    };
    const matrix = required("matrix");
    const manifest = required("manifest");
    if (command === "create") {
      const result = createHandoff(required("output"), matrix, identity, JSON.parse(readFileSync(required("inventory"), "utf8")));
      writeFileSync(manifest, `${JSON.stringify(result, null, 2)}\n`);
    } else {
      const handoff = validateHandoff(JSON.parse(readFileSync(manifest, "utf8")), matrix, identity);
      if (command === "prepare") console.log(handoff.artifacts.map((artifact) => artifact.id).join(","));
      else if (command === "reconstruct") reconstructRelease(handoff, matrix, identity, required("input"), required("output"), required("metadata"));
      else throw new Error("command must be create, prepare, or reconstruct");
    }
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
