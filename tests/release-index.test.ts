import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import {
  assembleReleaseIndex,
  assembleReleaseIndexFiles,
  main,
  parseImageRowResult,
  parseReleasePlan,
  stableJson,
  verifyReleaseIndexFiles,
  type ExpectedImageRow,
  type ImageRowResult,
  type ReleaseIdentity,
  type ReleasePlan,
} from "../scripts/release-index.ts";

const sha = (character: string): string => character.repeat(64);
const imageDigest = (character: string): string => `sha256:${sha(character)}`;
const identity: ReleaseIdentity = {
  version: "0.75.0-rc.1",
  mesh_ref: "v0.75.0-rc.1",
  mesh_sha: "a".repeat(40),
  packaging_sha: "b".repeat(40),
};
const imageName = "ghcr.io/mesh-llm/mesh-llm";

function expectedRow(
  artifactId: string,
  backend: string,
  arch = "amd64",
): ExpectedImageRow {
  return {
    artifact_id: artifactId,
    platform: `linux/${arch}`,
    arch,
    backend,
    backend_version: backend === "cpu" ? "" : "13.1.2",
    package_file: `mesh-llm-0.75.0-${artifactId}.deb`,
    package_base_image: `registry.example/package/base@${imageDigest("a")}`,
    runtime_base_image: `registry.example/base/${backend}@${imageDigest("c")}`,
    tags: [
      `${imageName}:0.75.0-${artifactId}`,
      `${imageName}:${artifactId}`,
    ],
  };
}

function plan(rows = [
  expectedRow("ubuntu-cpu-amd64", "cpu"),
  expectedRow("ubuntu-cuda-amd64", "cuda"),
  expectedRow("ubuntu-cpu-arm64", "cpu", "arm64"),
]): ReleasePlan {
  return {
    schema_version: 1,
    identity,
    image_name: imageName,
    expected_rows: rows,
  };
}

function result(
  row: ExpectedImageRow,
  digestCharacter: string,
  hostCharacter = row.arch === "arm64" ? "e" : "d",
): ImageRowResult {
  const digest = imageDigest(digestCharacter);
  return {
    schema_version: 1,
    plan_identity: identity,
    ...row,
    package: { name: row.package_file, sha256: sha("f") },
    upstream: { mesh_ref: identity.mesh_ref, mesh_sha: identity.mesh_sha },
    product: {
      host_sha256: sha(hostCharacter),
      runtime_id: `linux-${row.backend}-${row.arch}`,
      runtime_sha256: sha("1"),
    },
    base_image: { ref: row.runtime_base_image },
    image: { name: imageName, digest },
    qa: { passed: true, image_digest: digest },
  };
}

function validResults(value = plan()): ImageRowResult[] {
  return value.expected_rows.map((row, index) => result(row, String(index + 2)));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function fixture(t: { after(callback: () => void): void }) {
  const root = mkdtempSync(resolve(tmpdir(), "release-index-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const planPath = resolve(root, "plan.json");
  const resultsPath = resolve(root, "results");
  const outputPath = resolve(root, "output", "release-index.json");
  mkdirSync(resultsPath);
  const releasePlan = plan();
  const results = validResults(releasePlan).reverse();
  writeFileSync(planPath, JSON.stringify(releasePlan));
  results.forEach((row, index) => {
    const directory = resolve(resultsPath, `artifact-${index}`);
    mkdirSync(directory);
    writeFileSync(resolve(directory, "result.json"), JSON.stringify(row));
  });
  return { root, planPath, resultsPath, outputPath, releasePlan, results };
}

test("assembles a canonical, deterministically ordered exact release index", () => {
  const releasePlan = plan().expected_rows.slice().reverse();
  const unsortedPlan = plan(releasePlan);
  const results = validResults(unsortedPlan).reverse();
  const index = assembleReleaseIndex(unsortedPlan, results);
  assert.deepEqual(index.rows.map((row) => row.artifact_id), [
    "ubuntu-cpu-amd64",
    "ubuntu-cpu-arm64",
    "ubuntu-cuda-amd64",
  ]);
  assert.deepEqual(index.rows[0].tags, [...index.rows[0].tags].sort());
  assert.equal(index.identity.mesh_sha, identity.mesh_sha);
  assert.equal(index.rows.every((row) => row.qa.image_digest === row.image.digest), true);
  assert.equal(stableJson({ z: 1, a: { y: 2, x: 1 } }), '{\n  "a": {\n    "x": 1,\n    "y": 2\n  },\n  "z": 1\n}\n');
  assert.equal(stableJson(index), stableJson(assembleReleaseIndex(clone(unsortedPlan), clone(results))));
});

test("parses exact plans and rejects invalid identities, bases, rows, and tags", () => {
  assert.deepEqual(parseReleasePlan(plan()), parseReleasePlan(clone(plan())));
  const invalid: [string, (value: Record<string, unknown>) => void, RegExp][] = [
    ["schema", (value) => { value.schema_version = 2; }, /schema_version/],
    ["extra", (value) => { value.extra = true; }, /contain exactly/],
    ["image", (value) => { value.image_name = "GHCR.IO/Mesh/image"; }, /invalid/],
    ["identity", (value) => { (value.identity as Record<string, unknown>).mesh_ref = "v0.75.1"; }, /disagree/],
    ["mesh sha", (value) => { (value.identity as Record<string, unknown>).mesh_sha = "A".repeat(40); }, /invalid/],
    ["empty image", (value) => { value.image_name = ""; }, /non-empty/],
    ["base", (value) => { ((value.expected_rows as Record<string, unknown>[])[0]).runtime_base_image = "ubuntu:24.04"; }, /digest-qualified/],
    ["uppercase digest", (value) => { ((value.expected_rows as Record<string, unknown>[])[0]).runtime_base_image = `ubuntu@sha256:${"A".repeat(64)}`; }, /lowercase/],
    ["tag scalar", (value) => { (value.expected_rows as Record<string, unknown>[])[0].tags = "tag"; }, /non-empty array/],
    ["backend version type", (value) => { (value.expected_rows as Record<string, unknown>[])[0].backend_version = 1; }, /must be a string/],
    ["backend version content", (value) => { (value.expected_rows as Record<string, unknown>[])[0].backend_version = "bad/value"; }, /invalid/],
    ["empty", (value) => { value.expected_rows = []; }, /must not be empty/],
    ["duplicate row", (value) => { (value.expected_rows as unknown[]).push(clone((value.expected_rows as unknown[])[0])); }, /duplicate artifact_id/],
    ["duplicate package", (value) => { (value.expected_rows as Record<string, unknown>[])[1].package_file = (value.expected_rows as Record<string, unknown>[])[0].package_file; }, /duplicate package_file/],
    ["foreign tag", (value) => { (value.expected_rows as Record<string, unknown>[])[0].tags = ["ghcr.io/other/image:tag"]; }, /must be a tag/],
    ["duplicate tag in row", (value) => { const row = (value.expected_rows as Record<string, unknown>[])[0]; row.tags = [((row.tags as string[])[0]), ((row.tags as string[])[0])]; }, /duplicate tags/],
    ["duplicate global tag", (value) => { (value.expected_rows as Record<string, unknown>[])[1].tags = clone((value.expected_rows as Record<string, unknown>[])[0].tags); }, /duplicate tags/],
  ];
  for (const [, mutate, message] of invalid) {
    const value = clone(plan()) as unknown as Record<string, unknown>;
    mutate(value);
    assert.throws(() => parseReleasePlan(value), message);
  }
  assert.throws(() => parseReleasePlan(null), /must be an object/);
  assert.throws(() => parseReleasePlan({ ...plan(), expected_rows: "bad" }), /must be an array/);
});

test("rejects missing, extra, duplicate, non-exact, or unbound row results", () => {
  const releasePlan = plan();
  const results = validResults(releasePlan);
  assert.throws(() => assembleReleaseIndex(releasePlan, results.slice(1)), /missing result rows/);
  assert.throws(() => assembleReleaseIndex(releasePlan, [...results, results[0]]), /duplicate result artifact_id/);
  assert.throws(
    () => assembleReleaseIndex(releasePlan, [...results, { ...results[0], artifact_id: "unexpected" }]),
    /unexpected result artifact_id/,
  );
  const cases: [(value: ImageRowResult) => void, RegExp][] = [
    [(value) => { (value as unknown as Record<string, unknown>).extra = true; }, /contain exactly/],
    [(value) => { (value as unknown as { schema_version: number }).schema_version = 2; }, /schema_version/],
    [(value) => { (value.plan_identity as unknown as { packaging_sha: string }).packaging_sha = "c".repeat(40); }, /plan_identity/],
    [(value) => { (value as unknown as { backend: string }).backend = "rocm"; }, /exactly match/],
    [(value) => { (value.package as unknown as { name: string }).name = "other.deb"; }, /package.name/],
    [(value) => { (value.package as unknown as { sha256: string }).sha256 = "F".repeat(64); }, /lowercase/],
    [(value) => { (value.upstream as unknown as { mesh_sha: string }).mesh_sha = "c".repeat(40); }, /upstream/],
    [(value) => { (value.product as unknown as { runtime_id: string }).runtime_id = "bad/runtime"; }, /invalid/],
    [(value) => { (value.base_image as unknown as { ref: string }).ref = `other/base@${imageDigest("c")}`; }, /base_image.ref/],
    [(value) => { (value.image as unknown as { name: string }).name = "ghcr.io/other/image"; }, /image.name/],
    [(value) => { (value.image as unknown as { digest: string }).digest = `sha256:${"A".repeat(64)}`; }, /lowercase/],
    [(value) => { (value.qa as unknown as { passed: boolean }).passed = false; }, /passed/],
    [(value) => { (value.qa as unknown as { image_digest: string }).image_digest = imageDigest("9"); }, /does not match/],
  ];
  for (const [mutate, message] of cases) {
    const changed = clone(results[0]);
    mutate(changed);
    assert.throws(
      () => parseImageRowResult(changed, parseReleasePlan(releasePlan), releasePlan.expected_rows[0]),
      message,
    );
  }
});

test("enforces host identity per platform while allowing content-identical rows", () => {
  const releasePlan = plan();
  const results = validResults(releasePlan);
  results[1] = {
    ...results[1],
    image: { ...results[1].image, digest: results[0].image.digest },
    qa: { passed: true, image_digest: results[0].image.digest },
  };
  assert.equal(assembleReleaseIndex(releasePlan, results).rows.length, 3);
  const hostMismatch = validResults(releasePlan);
  hostMismatch[1] = {
    ...hostMismatch[1],
    product: { ...hostMismatch[1].product, host_sha256: sha("9") },
  };
  assert.throws(() => assembleReleaseIndex(releasePlan, hostMismatch), /different host SHA-256/);
});

test("file API and CLI assemble and verify only canonical complete indexes", (t) => {
  const value = fixture(t);
  const index = assembleReleaseIndexFiles(value.planPath, value.resultsPath, value.outputPath);
  assert.equal(index.rows.length, 3);
  assert.equal(readFileSync(value.outputPath, "utf8"), stableJson(index));
  assert.equal(verifyReleaseIndexFiles(value.planPath, value.resultsPath, value.outputPath).rows.length, 3);
  const cliOutput = resolve(value.root, "cli", "release-index.json");
  const script = resolve("scripts/release-index.ts");
  const assembled = spawnSync(process.execPath, [
    "--experimental-strip-types",
    script,
    "assemble",
    "--plan", value.planPath,
    "--results", value.resultsPath,
    "--output", cliOutput,
  ], { encoding: "utf8" });
  assert.equal(assembled.status, 0, assembled.stderr);
  assert.equal(readFileSync(cliOutput, "utf8"), stableJson(index));
  const verified = spawnSync(process.execPath, [
    "--experimental-strip-types",
    script,
    "verify",
    "--plan", value.planPath,
    "--results", value.resultsPath,
    "--index", cliOutput,
  ], { encoding: "utf8" });
  assert.equal(verified.status, 0, verified.stderr);
  assert.equal(main([
    "verify",
    "--plan", value.planPath,
    "--results", value.resultsPath,
    "--index", value.outputPath,
  ]), 0);
  writeFileSync(value.outputPath, JSON.stringify(index));
  assert.throws(
    () => verifyReleaseIndexFiles(value.planPath, value.resultsPath, value.outputPath),
    /not the canonical index/,
  );
  assert.equal(main(["unknown"]), 1);
  assert.equal(main(["assemble", "--plan", value.planPath]), 1);
  assert.equal(main(["verify", "--plan", value.planPath, "--plan", value.planPath]), 1);
  assert.equal(main(["assemble", "not-an-option"]), 1);

  const empty = resolve(value.root, "empty");
  mkdirSync(empty);
  assert.throws(
    () => assembleReleaseIndexFiles(value.planPath, empty, value.outputPath),
    /no JSON records/,
  );
});
