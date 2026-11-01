import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test, type TestContext } from "node:test";
import { isBundledPluginArchiveName, validateBundledPlugins } from "../scripts/bundled-plugins.ts";

const archive = "capsules-0.1.4-x86_64-unknown-linux-gnu.tar.gz";

function fixture(t: TestContext): string {
  const bundle = mkdtempSync(resolve(tmpdir(), "bundled-plugins-"));
  t.after(() => rmSync(bundle, { recursive: true, force: true }));
  return bundle;
}

test("accepts the producer's flat plugin archives without a plugin manifest", (t) => {
  const bundle = fixture(t);
  assert.doesNotThrow(() => validateBundledPlugins(bundle));
  mkdirSync(resolve(bundle, "plugins"));
  writeFileSync(resolve(bundle, "plugins", archive), "verified upstream archive bytes");
  assert.doesNotThrow(() => validateBundledPlugins(bundle));
});

test("refuses paths and unpacked plugin content at the archive listing gate", () => {
  assert.equal(isBundledPluginArchiveName(archive), true);
  assert.equal(isBundledPluginArchiveName("capsules-0.1.4-rc.1+a-aarch64-apple-darwin.tar.gz"), true);
  for (const name of ["manifest.json", "../other.tar.gz", "/other.tar.gz", "nested/other.tar.gz", ".hidden.tar.gz", "capsules", "capsules.zip", "space name.tar.gz"]) {
    assert.equal(isBundledPluginArchiveName(name), false, name);
  }
});

test("refuses empty plugin directories and unexpected files", (t) => {
  const bundle = fixture(t);
  const directory = resolve(bundle, "plugins");
  mkdirSync(directory);
  assert.throws(() => validateBundledPlugins(bundle), /must contain release archives/);
  writeFileSync(resolve(directory, "manifest.json"), "{}");
  assert.throws(() => validateBundledPlugins(bundle), /unexpected bundled plugin entry/);
});

test("refuses directories, empty files, and links masquerading as plugin archives", (t) => {
  const bundle = fixture(t);
  const path = resolve(bundle, "plugins", archive);
  mkdirSync(path, { recursive: true });
  assert.throws(() => validateBundledPlugins(bundle), /nonempty regular archive/);
  rmSync(path, { recursive: true });
  writeFileSync(path, "");
  assert.throws(() => validateBundledPlugins(bundle), /nonempty regular archive/);
  rmSync(path);
  writeFileSync(resolve(bundle, "external"), "not bundled");
  symlinkSync(resolve(bundle, "external"), path);
  assert.throws(() => validateBundledPlugins(bundle), /nonempty regular archive/);
});

test("refuses a linked or non-directory plugins root", (t) => {
  const bundle = fixture(t);
  const path = resolve(bundle, "plugins");
  writeFileSync(path, "not a directory");
  assert.throws(() => validateBundledPlugins(bundle), /regular directory/);
  rmSync(path);
  mkdirSync(resolve(bundle, "external"));
  symlinkSync(resolve(bundle, "external"), path, "dir");
  assert.throws(() => validateBundledPlugins(bundle), /regular directory/);
});
