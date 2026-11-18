import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

test("runtime smoke requires the installed runtime identity and path", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "runtime-discovery-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const runtime = resolve(root, "runtime", "test-cpu");
  mkdirSync(runtime, { recursive: true });
  writeFileSync(resolve(runtime, "manifest.json"), "{}\n");
  const binary = resolve(root, "mesh-llm");
  writeFileSync(binary, '#!/bin/sh\ntest -z "${MESH_LLM_NATIVE_RUNTIME_BUNDLE_DIR:-}" || exit 10\ntest -n "$MESH_LLM_NATIVE_RUNTIME_CACHE_DIR" || exit 11\ncat "$LISTING"\n', { mode: 0o755 });
  const listing = resolve(root, "listing.json");
  const run = (value: object | string) => {
    writeFileSync(listing, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
    return spawnSync("sh", [resolve("scripts/runtime-discovery-smoke.sh"), resolve(root, "runtime")], {
      encoding: "utf8", env: { ...process.env, PATH: `${root}:${process.env.PATH}`, LISTING: listing, MESH_LLM_NATIVE_RUNTIME_BUNDLE_DIR: "/incorrect" },
    });
  };
  assert.equal(run([{ native_runtime_id: "test-cpu", path: runtime }]).status, 0);
  assert.equal(run([{ path: runtime, native_runtime_id: "test-cpu" }]).status, 0);
  for (const value of ["not JSON\n", "[\n  {\n    \"native_runtime_id\": \"test-cpu\",\n", [], [{ native_runtime_id: "wrong", path: runtime }], [{ native_runtime_id: "test-cpu", path: "/wrong" }], [{ native_runtime_id: "test-cpu", path: "/wrong" }, { native_runtime_id: "wrong", path: runtime }]]) {
    assert.notEqual(run(value).status, 0);
  }
});

test("runtime smoke rejects an installed tool without its executable bit", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "runtime-tools-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const runtime = resolve(root, "runtime", "test-cpu");
  mkdirSync(resolve(runtime, "tools"), { recursive: true });
  writeFileSync(resolve(runtime, "manifest.json"), "{}\n");
  const tool = resolve(runtime, "tools", "skippy-package-builder");
  writeFileSync(tool, "#!/bin/sh\n");
  chmodSync(tool, 0o755);
  writeFileSync(resolve(root, "mesh-llm"), '#!/bin/sh\ncat "$LISTING"\n', { mode: 0o755 });
  const listing = resolve(root, "listing.json");
  writeFileSync(listing, `${JSON.stringify([{ native_runtime_id: "test-cpu", path: runtime }], null, 2)}\n`);
  const run = () => spawnSync("sh", [resolve("scripts/runtime-discovery-smoke.sh"), resolve(root, "runtime")], {
    encoding: "utf8", env: { ...process.env, PATH: `${root}:${process.env.PATH}`, LISTING: listing },
  });
  assert.equal(run().status, 0);
  chmodSync(tool, 0o644);
  const rejected = run();
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /not executable:\n.*tools\/skippy-package-builder/);
});

test("package and both image QA paths provide the discovery check", () => {
  const workflow = readFileSync(resolve(".github/workflows/package-image-row.yml"), "utf8");
  const packageQa = readFileSync(resolve("scripts/native-package-qa.sh"), "utf8");
  const imageQa = readFileSync(resolve("docker/qa-runtime-image.sh"), "utf8");
  assert.equal((workflow.match(/scripts\/runtime-discovery-smoke\.sh:\/tmp\/runtime-discovery-smoke\.sh:ro/g) ?? []).length, 2);
  assert.match(packageQa, /runtime-discovery-smoke\.sh:\/tmp\/runtime-discovery-smoke\.sh:ro/);
  assert.match(packageQa, /sh \/tmp\/runtime-discovery-smoke\.sh/);
  assert.match(imageQa, /sh \/tmp\/runtime-discovery-smoke\.sh/);
});
