import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

test("package builder rejects a missing native runtime directory", (t) => {
  const directory = mkdtempSync(resolve(tmpdir(), "native-package-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bundle = resolve(directory, "bundle");
  mkdirSync(bundle);
  writeFileSync(resolve(bundle, "mesh-llm"), "binary\n");
  writeFileSync(resolve(bundle, "product-manifest.json"), "{}\n");
  writeFileSync(resolve(bundle, "host-imports.json"), "{}\n");

  const result = spawnSync("sh", [
    resolve("packaging/native/build-package.sh"),
    "ubuntu",
    "cpu",
    "",
    "amd64",
    "0.73.1",
    resolve(directory, "output"),
    bundle,
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /native runtime directory not found/);
  assert.doesNotMatch(result.stderr, /find:/);
});
