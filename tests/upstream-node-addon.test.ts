import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { main, verifyAndExtract } from "../scripts/upstream-node-addon.ts";

function fixture(t: { after(callback: () => void): void }, mutate?: (root: string) => void) {
  const root = mkdtempSync(resolve(tmpdir(), "upstream-addon-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const target = "linux-x64";
  const version = "0.75.0";
  const source = resolve(root, "source", target);
  mkdirSync(source, { recursive: true });
  const addon = resolve(source, "mesh_llm_nodejs.node");
  writeFileSync(addon, "native-addon");
  const sha256 = createHash("sha256").update(readFileSync(addon)).digest("hex");
  writeFileSync(resolve(source, "manifest.json"), `${JSON.stringify({
    schema: "mesh-llm-node-sdk-addon-v1",
    version,
    target,
    file: "mesh_llm_nodejs.node",
    sha256,
  })}\n`);
  mutate?.(resolve(root, "source"));
  const archive = resolve(root, `mesh-llm-node-sdk-addon-${version}-${target}.tar.gz`);
  const packed = spawnSync("tar", ["-C", resolve(root, "source"), "-czf", archive, target]);
  assert.equal(packed.status, 0);
  const archiveSha = createHash("sha256").update(readFileSync(archive)).digest("hex");
  const checksum = `${archive}.sha256`;
  writeFileSync(checksum, `${archiveSha}  ${archive.split("/").at(-1)}\n`);
  return { archive, checksum, outputDir: resolve(root, "output"), target, version };
}

test("verifies and safely extracts an exact upstream addon", (t) => {
  const value = fixture(t);
  verifyAndExtract(value);
  assert.equal(
    readFileSync(resolve(value.outputDir, value.target, "mesh_llm_nodejs.node"), "utf8"),
    "native-addon",
  );
});

test("rejects checksum, manifest, and target drift", (t) => {
  const checksum = fixture(t);
  writeFileSync(checksum.checksum, `${"0".repeat(64)}  ${checksum.archive.split("/").at(-1)}\n`);
  assert.throws(() => verifyAndExtract(checksum), /checksum mismatch/);

  const manifest = fixture(t, (root) => {
    const path = resolve(root, "linux-x64", "manifest.json");
    const value = JSON.parse(readFileSync(path, "utf8"));
    value.version = "0.75.1";
    writeFileSync(path, JSON.stringify(value));
  });
  assert.throws(() => verifyAndExtract(manifest), /manifest does not bind/);
  assert.throws(() => verifyAndExtract({ ...fixture(t), target: "linux-x86" }), /unsupported/);
});

test("rejects extra paths and symbolic-link members before extraction", (t) => {
  const extra = fixture(t, (root) => {
    writeFileSync(resolve(root, "linux-x64", "extra"), "unexpected");
  });
  assert.throws(() => verifyAndExtract(extra), /exactly three expected entries/);

  const link = fixture(t, (root) => {
    rmSync(resolve(root, "linux-x64", "mesh_llm_nodejs.node"));
    symlinkSync("/tmp/outside", resolve(root, "linux-x64", "mesh_llm_nodejs.node"));
  });
  assert.throws(() => verifyAndExtract(link), /unsafe archive member type/);
});

test("CLI fails closed on malformed options", () => {
  assert.equal(main([]), 1);
  assert.equal(main(["--target", "linux-x64", "--target", "linux-x64"]), 1);
  assert.equal(main(["unexpected"]), 1);
});
