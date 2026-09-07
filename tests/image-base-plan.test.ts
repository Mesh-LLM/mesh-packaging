import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { bindImagePlan, main, type BaseResolution } from "../scripts/image-base-plan.ts";
import { loadConfig, matrixRows } from "../scripts/image-matrix.ts";
import { assembleReleaseIndexFiles, type ImageRowResult } from "../scripts/release-index.ts";

function fixture(mirror = false) {
  const matrix = { include: matrixRows(loadConfig("packaging/images.json"), "ghcr.io/mesh-llm/mesh-llm", "0.75.1",
    "v0.75.1", "Mesh-LLM/mesh-llm", new Set(["ubuntu-cpu-amd64"]), new Set(), false) };
  const row = matrix.include[0];
  const identity = { version: "0.75.1", mesh_ref: "v0.75.1", mesh_sha: "a".repeat(40), packaging_sha: "b".repeat(40) };
  const digest = `sha256:${"c".repeat(64)}`;
  const source = `ubuntu@${digest}`;
  const policy = { enabled: mirror, host: "example.registry.depot.dev" };
  const pull = mirror ? `${policy.host}/${row.package_base_cache_repository}@${digest}` : source;
  const base: BaseResolution = { artifact_id: row.artifact_id, package: { source, pull }, runtime: { source, pull } };
  const result: ImageRowResult = {
    schema_version: 1, plan_identity: identity, artifact_id: row.artifact_id, platform: row.platform,
    arch: row.arch, backend: row.backend, backend_version: row.backend_version, package_file: row.package_file,
    package_base_image: pull, runtime_base_image: pull, tags: row.tags.split("\n"),
    package: { name: row.package_file, sha256: "d".repeat(64) },
    upstream: { mesh_ref: identity.mesh_ref, mesh_sha: identity.mesh_sha },
    product: { host_sha256: "e".repeat(64), runtime_id: "linux-cpu", runtime_sha256: "f".repeat(64) },
    base_image: { ref: pull }, image: { name: "ghcr.io/mesh-llm/mesh-llm", digest },
    qa: { passed: true, image_digest: digest },
  };
  const bind = () => bindImagePlan(matrix, [result], [base], identity, result.image.name, policy);
  return { matrix, identity, policy, base, result, bind };
}

test("direct and explicitly configured mirror references preserve the same immutable base identity", () => {
  for (const mirror of [false, true]) {
    const value = fixture(mirror);
    assert.equal(value.bind().expected_rows[0].runtime_base_image, value.base.runtime.pull);
  }
});

test("base binding rejects disabled/unknown mirrors and altered source or pull digests", () => {
  const changes = [
    (v: ReturnType<typeof fixture>) => { v.policy.enabled = false; },
    (v: ReturnType<typeof fixture>) => { v.policy.host = "foreign.registry.depot.dev"; },
    (v: ReturnType<typeof fixture>) => { v.base.package.source = v.base.package.source.replace("ubuntu@", "unconfigured@"); },
    (v: ReturnType<typeof fixture>) => { v.base.runtime.pull = v.base.runtime.pull.replace(/c/g, "d"); },
    (v: ReturnType<typeof fixture>) => { v.base.package.pull = v.base.package.pull.replace("dockerhub-ubuntu", "other"); },
    (v: ReturnType<typeof fixture>) => { v.result.runtime_base_image = v.base.runtime.source; },
    (v: ReturnType<typeof fixture>) => { v.matrix.include[0].package_base_image = `ubuntu@sha256:${"d".repeat(64)}`; },
  ];
  for (const change of changes) { const value = fixture(true); change(value); assert.throws(value.bind); }
});

test("tagged digest pins retain canonical repository and exact digest checks", () => {
  for (const mirror of [false, true]) {
    const value = fixture(mirror);
    for (const kind of ["package", "runtime"] as const) {
      value.matrix.include[0][`${kind}_base_image`] = value.base[kind].source.replace("ubuntu@", "ubuntu:24.04@");
      value.base[kind].source = value.matrix.include[0][`${kind}_base_image`];
      if (!mirror) {
        value.base[kind].pull = value.base[kind].source;
        value.result[`${kind}_base_image`] = value.base[kind].pull;
      }
    }
    value.result.base_image.ref = value.result.runtime_base_image;
    assert.doesNotThrow(value.bind);
    value.matrix.include[0].package_base_image = `ubuntu:24.04@sha256:${"d".repeat(64)}`;
    assert.throws(value.bind, /base source does not match configured identity/);
  }
});

test("base binding retains exact matrix, QA, source revision, and row completeness checks", () => {
  for (const change of [
    (v: ReturnType<typeof fixture>) => { v.result.backend = "vulkan"; },
    (v: ReturnType<typeof fixture>) => { v.result.qa.image_digest = `sha256:${"d".repeat(64)}`; },
    (v: ReturnType<typeof fixture>) => { v.result.plan_identity = { ...v.identity, packaging_sha: "c".repeat(40) }; },
    (v: ReturnType<typeof fixture>) => { v.matrix.include.push(v.matrix.include[0]); },
    (v: ReturnType<typeof fixture>) => { v.base.artifact_id = "foreign"; },
  ]) { const value = fixture(); change(value); assert.throws(value.bind); }
});

test("workflow CLI binds direct and mirrored results before ordinary index assembly", (t) => {
  for (const mirror of [false, true]) {
    const value = fixture(mirror);
    const root = mkdtempSync(resolve(tmpdir(), "image-base-plan-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const matrix = resolve(root, "matrix.txt");
    const output = resolve(root, "plan.txt");
    writeFileSync(matrix, JSON.stringify(value.matrix));
    writeFileSync(resolve(root, "image-row-result.json"), JSON.stringify(value.result));
    writeFileSync(resolve(root, "image-base-resolution.json"), JSON.stringify(value.base));
    assert.equal(main(["--matrix", matrix, "--results", root, "--output", output,
      "--version", value.identity.version, "--mesh-ref", value.identity.mesh_ref,
      "--mesh-sha", value.identity.mesh_sha, "--packaging-sha", value.identity.packaging_sha,
      "--image-name", value.result.image.name, "--mirror-enabled", String(mirror), "--mirror-host", mirror ? value.policy.host : ""]), 0);
    assert.equal(assembleReleaseIndexFiles(output, root, resolve(root, "index.txt")).rows.length, 1);
  }
});
