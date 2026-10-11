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

function syntheticBundle(directory: string, plugins: boolean): string {
  const bundle = resolve(directory, "bundle");
  const runtime = resolve(bundle, "native-runtimes", "meshllm-native-runtime-linux-x86_64-cpu");
  mkdirSync(runtime, { recursive: true });
  writeFileSync(resolve(bundle, "mesh-llm"), "binary\n");
  writeFileSync(resolve(bundle, "product-manifest.json"), "{}\n");
  writeFileSync(resolve(bundle, "host-imports.json"), "{}\n");
  writeFileSync(resolve(runtime, "manifest.json"), "{}\n");
  if (plugins) {
    mkdirSync(resolve(bundle, "plugins"));
    writeFileSync(resolve(bundle, "plugins", "example-1.2.3-x86_64-unknown-linux-gnu.tar.gz"), "plugin archive\n");
    writeFileSync(resolve(bundle, "plugins", "manifest.json"), "{\"schema_version\":1}\n");
  }
  return bundle;
}

function debContents(t: { skip: (reason: string) => void }, plugins: boolean): string[] | undefined {
  if (spawnSync("dpkg-deb", ["--version"]).status !== 0) {
    t.skip("dpkg-deb is not installed");
    return undefined;
  }
  const directory = mkdtempSync(resolve(tmpdir(), "native-package-plugins-"));
  try {
    const output = resolve(directory, "output");
    const result = spawnSync("sh", [
      resolve("packaging/native/build-package.sh"),
      "ubuntu", "cpu", "", "amd64", "0.79.0", output, syntheticBundle(directory, plugins),
    ], { encoding: "utf8", env: { ...process.env, SOURCE_DATE_EPOCH: "0" } });
    assert.equal(result.status, 0, result.stderr);
    const deb = spawnSync("sh", ["-c", `dpkg-deb -c "${output}"/*.deb`], { encoding: "utf8" });
    assert.equal(deb.status, 0, deb.stderr);
    return deb.stdout.split("\n").map((line) => line.split(/\s+/).pop() ?? "").filter(Boolean);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("package builder keeps the product's bundled plugins unchanged", (t) => {
  const files = debContents(t, true);
  if (!files) return;
  assert.ok(files.includes("./usr/local/lib/mesh-llm/0.79.0/plugins/example-1.2.3-x86_64-unknown-linux-gnu.tar.gz"), files.join("\n"));
  assert.ok(files.includes("./usr/local/lib/mesh-llm/0.79.0/plugins/manifest.json"), files.join("\n"));
});

test("package builder adds no plugins directory for a product without one", (t) => {
  const files = debContents(t, false);
  if (!files) return;
  assert.ok(files.includes("./usr/local/lib/mesh-llm/0.79.0/product-manifest.json"), files.join("\n"));
  assert.ok(!files.some((file) => file.includes("/plugins")), files.join("\n"));
});
