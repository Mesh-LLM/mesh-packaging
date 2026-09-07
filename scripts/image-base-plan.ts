#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { type MatrixRow } from "./image-matrix.ts";
import { assembleReleaseIndex, type ImageRowResult, type ReleaseIdentity, type ReleasePlan } from "./release-index.ts";

export type BaseResolution = {
  artifact_id: string;
  package: { source: string; pull: string };
  runtime: { source: string; pull: string };
};
export type MirrorPolicy = { enabled: boolean; host: string };

function repository(ref: string): string {
  const name = ref.split("@")[0];
  return name.replace(/:[^/:]+$/, "");
}

function validateBase(
  base: { source: string; pull: string }, configured: string, mirrorRepository: string,
  policy: MirrorPolicy,
): void {
  if (!base || Object.keys(base).sort().join(",") !== "pull,source") throw new Error("invalid base resolution");
  const match = /^([^@]+)@(sha256:[0-9a-f]{64})$/.exec(base.source);
  if (!match || repository(base.source) !== repository(configured)
      || (configured.includes("@") && match[2] !== configured.split("@")[1])) throw new Error("base source does not match configured identity");
  if (base.pull === base.source) return;
  if (!policy.enabled || !/^[a-z0-9-]+\.registry\.depot\.dev$/.test(policy.host)
      || !/^[a-z0-9]+([._/-]?[a-z0-9]+)*$/.test(mirrorRepository)
      || mirrorRepository.includes("..")
      || base.pull !== `${policy.host}/${mirrorRepository}@${match[2]}`) {
    throw new Error("unconfigured mirror or mismatched base digest");
  }
}

export function bindImagePlan(
  matrix: { include: MatrixRow[] }, results: ImageRowResult[], resolutions: BaseResolution[],
  identity: ReleaseIdentity, imageName: string, policy: MirrorPolicy,
): ReleasePlan {
  if (!Array.isArray(matrix.include) || !matrix.include.length
      || results.length !== matrix.include.length || resolutions.length !== matrix.include.length) {
    throw new Error("matrix, results, and base resolutions must contain the same rows");
  }
  const plan: ReleasePlan = {
    schema_version: 1, identity, image_name: imageName,
    expected_rows: matrix.include.map((row) => {
      const matches = results.filter((result) => result.artifact_id === row.artifact_id);
      const bases = resolutions.filter((base) => base.artifact_id === row.artifact_id);
      if (matches.length !== 1 || bases.length !== 1) throw new Error(`missing or duplicate image row: ${row.artifact_id}`);
      const result = matches[0];
      const base = bases[0];
      if (Object.keys(base).sort().join(",") !== "artifact_id,package,runtime") throw new Error("unexpected base resolution fields");
      validateBase(base.package, row.package_base_image, row.package_base_cache_repository, policy);
      validateBase(base.runtime, row.runtime_base_image, row.runtime_base_cache_repository, policy);
      if (result.package_base_image !== base.package.pull || result.runtime_base_image !== base.runtime.pull) {
        throw new Error("image result does not match verified pull references");
      }
      return {
        artifact_id: row.artifact_id, platform: row.platform, arch: row.arch, backend: row.backend,
        backend_version: row.backend_version, package_file: row.package_file,
        package_base_image: base.package.pull, runtime_base_image: base.runtime.pull, tags: row.tags.split("\n"),
      };
    }),
  };
  // Keep the full existing result, identity, QA, and host-invariant checks.
  assembleReleaseIndex(plan, results);
  return plan;
}

function resultsBelow(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? resultsBelow(path) : name === "image-row-result.json" ? [path] : [];
  });
}

export function main(argv: string[]): number {
  try {
    const options = new Map<string, string>();
    for (let index = 0; index < argv.length; index += 2) {
      if (!argv[index]?.startsWith("--") || argv[index + 1] === undefined || options.has(argv[index])) throw new Error("invalid image-plan arguments");
      options.set(argv[index], argv[index + 1]);
    }
    const required = (name: string) => {
      const value = options.get(`--${name}`);
      if (value === undefined || (name !== "mirror-host" && value === "")) throw new Error(`--${name} is required`);
      return value;
    };
    const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
    const files = resultsBelow(required("results"));
    const enabled = required("mirror-enabled");
    if (enabled !== "true" && enabled !== "false") throw new Error("mirror-enabled must be boolean");
    const plan = bindImagePlan(json(required("matrix")), files.map(json), files.map((path) =>
      json(resolve(dirname(path), "image-base-resolution.json"))), {
        version: required("version"), mesh_ref: required("mesh-ref"), mesh_sha: required("mesh-sha"),
        packaging_sha: required("packaging-sha"),
      }, required("image-name"), { enabled: enabled === "true", host: required("mirror-host") });
    writeFileSync(required("output"), `${JSON.stringify(plan, null, 2)}\n`);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
