import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { test } from "node:test";
import {
  main,
  parseChecksum,
  productBackendForFlavor,
  sha256File,
  sha256Tree,
  validateArchiveEntries,
  validateArchiveEntryTypes,
  validateProductManifest,
  verifyAndExtract,
} from "../scripts/upstream-archive.ts";

test("maps versioned CUDA flavors to the product backend", () => {
  assert.equal(productBackendForFlavor("cuda-12"), "cuda");
  assert.equal(productBackendForFlavor("cuda-13"), "cuda");
  for (const flavor of ["cpu", "metal", "rocm", "vulkan"]) {
    assert.equal(productBackendForFlavor(flavor), flavor);
  }
});

function legacySha256Tree(root: string): string {
  const digest = createHash("sha256");
  const filesBelow = (current: string): string[] => readdirSync(current).flatMap((name) => {
    const path = resolve(current, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
  const files = filesBelow(root).sort();
  for (const path of files) {
    const relative = path.slice(root.length + 1).replaceAll("\\", "/");
    const encoded = Buffer.from(relative);
    const length = Buffer.alloc(8);
    length.writeBigUInt64BE(BigInt(encoded.length));
    digest.update(length);
    digest.update(encoded);
    digest.update(createHash("sha256").update(readFileSync(path)).digest());
  }
  return digest.digest("hex");
}

async function fixture(t: { after(callback: () => void): void }, prepare?: (bundle: string) => Promise<void>) {
  const directory = mkdtempSync(resolve(tmpdir(), "upstream-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bundle = resolve(directory, "stage/mesh-bundle");
  mkdirSync(bundle, { recursive: true });
  writeFileSync(resolve(bundle, "mesh-llm"), "#!/bin/sh\necho mesh-llm 0.73.1\n");
  chmodSync(resolve(bundle, "mesh-llm"), 0o755);
  writeFileSync(resolve(bundle, "host-imports.json"), "{}\n");
  const runtime = resolve(bundle, "native-runtimes/linux-cpu");
  mkdirSync(resolve(runtime, "lib"), { recursive: true });
  writeFileSync(resolve(runtime, "manifest.json"), "{}\n");
  writeFileSync(resolve(runtime, "README.md"), "runtime\n");
  writeFileSync(resolve(runtime, "lib/libllama.so"), "runtime\n");
  const hostSha256 = await sha256File(resolve(bundle, "mesh-llm"));
  const runtimeSha256 = sha256Tree(runtime);
  const runtimeManifestSha256 = await sha256File(resolve(runtime, "manifest.json"));
  writeFileSync(resolve(bundle, "product-manifest.json"), JSON.stringify({
    backend: "cpu",
    contract: "mesh-llm-product-v2",
    host: { path: "mesh-llm", sha256: hostSha256 },
    mesh_version: "0.73.1",
    runtime: {
      id: "linux-cpu",
      manifest_sha256: runtimeManifestSha256,
      path: "native-runtimes/linux-cpu",
      sha256: runtimeSha256,
    },
    schema_version: 2,
  }));
  if (prepare) await prepare(bundle);
  const archive = resolve(directory, "mesh-llm-v0.73.1-x86_64-unknown-linux-gnu.tar.gz");
  assert.equal(spawnSync("tar", ["-czf", archive, "-C", resolve(directory, "stage"), "mesh-bundle"]).status, 0);
  const checksum = `${archive}.sha256`;
  writeFileSync(checksum, `${await sha256File(archive)}  ${basename(archive)}\n`);
  return { directory, archive, checksum, hostSha256, runtimeSha256 };
}

test("verifies checksum, layout, extraction, and provenance", async (t) => {
  const data = await fixture(t);
  const outputDir = resolve(data.directory, "output");
  const result = await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "https://example.test/archive", version: "0.73.1", flavor: "cpu" });
  assert.match(readFileSync(result.binary, "utf8"), /mesh-llm/);
  assert.equal(existsSync(resolve(outputDir, "native-runtimes/linux-cpu/lib/libllama.so")), true);
  assert.deepEqual(JSON.parse(readFileSync(result.provenance, "utf8")), {
    archive: basename(data.archive),
    flavor: "cpu",
    host_sha256: data.hostSha256,
    runtime_id: "linux-cpu",
    runtime_sha256: data.runtimeSha256,
    sha256: result.sha256,
    source_url: "https://example.test/archive",
    version: "0.73.1",
  });
});

test("rejects unsafe runtime IDs before accepting runtime paths", () => {
  const sha256 = "a".repeat(64);
  assert.throws(() => validateProductManifest({
    backend: "cpu",
    contract: "mesh-llm-product-v2",
    host: { path: "mesh-llm", sha256 },
    mesh_version: "0.73.1",
    runtime: {
      id: "../linux-cpu",
      manifest_sha256: sha256,
      path: "native-runtimes/../linux-cpu",
      sha256,
    },
    schema_version: 2,
  }), /runtime id/);
  assert.throws(() => validateArchiveEntries([
    "mesh-bundle/mesh-llm",
    "mesh-bundle/product-manifest.json",
    "mesh-bundle/host-imports.json",
    "mesh-bundle/native-runtimes/linux cpu/manifest.json",
    "mesh-bundle/native-runtimes/linux cpu/README.md",
    "mesh-bundle/native-runtimes/linux cpu/lib/libllama.so",
  ]), /runtime id/);
});

test("accepts bundled native runtime license material", () => {
  assert.doesNotThrow(() => validateArchiveEntries([
    "mesh-bundle/mesh-llm",
    "mesh-bundle/product-manifest.json",
    "mesh-bundle/host-imports.json",
    "mesh-bundle/native-runtimes/linux-cuda/manifest.json",
    "mesh-bundle/native-runtimes/linux-cuda/README.md",
    "mesh-bundle/native-runtimes/linux-cuda/lib/libllama.so",
    "mesh-bundle/native-runtimes/linux-cuda/licenses/NVIDIA-CUDA-LICENSE.txt",
  ]));
});

test("keeps sha256Tree digest compatible with the original tree format", async (t) => {
  const data = await fixture(t);
  const runtime = resolve(data.directory, "stage/mesh-bundle/native-runtimes/linux-cpu");
  assert.equal(sha256Tree(runtime), legacySha256Tree(runtime));
});

test("removes stale output contents after successful extraction", async (t) => {
  const data = await fixture(t);
  const outputDir = resolve(data.directory, "stale-output");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(resolve(outputDir, "stale.txt"), "stale\n");
  await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "https://example.test/archive", version: "0.73.1", flavor: "cpu" });
  assert.equal(existsSync(resolve(outputDir, "stale.txt")), false);
  assert.equal(existsSync(resolve(outputDir, "mesh-llm")), true);
});

test("rejects malformed checksums and unsafe layouts", async (t) => {
  const data = await fixture(t);
  assert.equal(parseChecksum(`${"A".repeat(64)} *${basename(data.archive)}\n`, basename(data.archive)), "a".repeat(64));
  assert.throws(() => parseChecksum("", basename(data.archive)), /exactly one/);
  assert.throws(() => parseChecksum(`bad  ${basename(data.archive)}`, basename(data.archive)), /SHA256SUMS/);
  assert.throws(() => parseChecksum(`${"a".repeat(64)}  wrong`, basename(data.archive)), /names wrong/);
  assert.throws(() => parseChecksum(`${"a".repeat(64)}  x\n${"b".repeat(64)}  y`, basename(data.archive)), /exactly one/);
  assert.throws(() => validateArchiveEntries(["../bad"]), /unsafe/);
  assert.throws(() => validateArchiveEntries(["/bad"]), /unsafe/);
  assert.doesNotThrow(() => validateArchiveEntryTypes([
    "drwxr-xr-x  0 user group 0 Jan  1 00:00 mesh-bundle/",
    "-rwxr-xr-x  0 user group 1 Jan  1 00:00 mesh-bundle/mesh-llm",
  ]));
  assert.throws(
    () => validateArchiveEntryTypes([
      "lrwxr-xr-x  0 user group 0 Jan  1 00:00 mesh-bundle/link -> ../../outside",
    ]),
    /links and special files/,
  );
  assert.throws(() => validateArchiveEntries(["mesh-bundle/", "mesh-bundle/other"]), /missing required/);
  const required = [
    "mesh-bundle/mesh-llm",
    "mesh-bundle/product-manifest.json",
    "mesh-bundle/host-imports.json",
  ];
  assert.throws(() => validateArchiveEntries(required), /exactly one native runtime/);
  assert.throws(() => validateArchiveEntries([
    ...required,
    "mesh-bundle/native-runtimes/a/manifest.json",
    "mesh-bundle/native-runtimes/a/README.md",
    "mesh-bundle/native-runtimes/a/lib/a.so",
    "mesh-bundle/native-runtimes/b/manifest.json",
  ]), /exactly one native runtime/);
  assert.throws(() => validateArchiveEntries([
    ...required,
    "mesh-bundle/native-runtimes/a/manifest.json",
    "mesh-bundle/native-runtimes/a/README.md",
    "mesh-bundle/native-runtimes/a/lib/a.so",
    "mesh-bundle/extra",
  ]), /unexpected product/);
  writeFileSync(data.checksum, `${"0".repeat(64)}  ${basename(data.archive)}\n`);
  await assert.rejects(() => verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir: resolve(data.directory, "bad"), sourceUrl: "x", version: "x", flavor: "x" }), /mismatch/);
});

test("CLI rejects missing options and extracts valid input", async (t) => {
  const data = await fixture(t);
  assert.equal(await main([]), 1);
  assert.equal(await main(["bad"]), 1);
  assert.equal(await main(["--archive", data.archive, "--checksum", data.checksum, "--output-dir", resolve(data.directory, "cli"), "--source-url", "x", "--version", "0.73.1", "--flavor", "cpu"]), 0);
});

// A release archive as the release pipeline writes it: plugins/ holds a
// plugin's own release archive (itself a .tar.gz) and plugins/manifest.json.
async function withBundledPlugin(bundle: string, mode: "ok" | "changed" | "unlisted" | "missing" | "stray") {
  const plugins = resolve(bundle, "plugins");
  const source = resolve(bundle, "..", "plugin-src");
  mkdirSync(resolve(source, "capsules"), { recursive: true });
  writeFileSync(resolve(source, "capsules/plugin.toml"), "name = \"capsules\"\n");
  writeFileSync(resolve(source, "capsules/capsules"), "#!/bin/sh\n");
  mkdirSync(plugins);
  const archiveName = "capsules-0.1.3-x86_64-unknown-linux-gnu.tar.gz";
  const pluginArchive = resolve(plugins, archiveName);
  assert.equal(spawnSync("tar", ["-czf", pluginArchive, "-C", source, "capsules"]).status, 0);
  rmSync(source, { recursive: true, force: true });
  const digest = await sha256File(pluginArchive);
  writeFileSync(resolve(plugins, "manifest.json"), JSON.stringify({
    schema_version: 1,
    target: "x86_64-unknown-linux-gnu",
    plugins: [{ name: "capsules", version: "0.1.3", archive: archiveName, sha256: digest }],
    absent: [],
  }));
  if (mode === "changed") writeFileSync(pluginArchive, "not the bundled archive\n");
  if (mode === "unlisted") writeFileSync(resolve(plugins, "other-1.0.0-x86_64-unknown-linux-gnu.tar.gz"), "x\n");
  if (mode === "missing") rmSync(pluginArchive);
  if (mode === "stray") {
    mkdirSync(resolve(plugins, "capsules"));
    writeFileSync(resolve(plugins, "capsules/capsules"), "unpacked\n");
  }
}

test("keeps a release archive's bundled plugins through verification and extraction", async (t) => {
  const data = await fixture(t, (bundle) => withBundledPlugin(bundle, "ok"));
  const outputDir = resolve(data.directory, "output");
  await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "https://example.test/archive", version: "0.73.1", flavor: "cpu" });
  assert.equal(existsSync(resolve(outputDir, "plugins/capsules-0.1.3-x86_64-unknown-linux-gnu.tar.gz")), true);
  assert.equal(existsSync(resolve(outputDir, "plugins/manifest.json")), true);
});

test("refuses bundled plugins that do not match their manifest", async (t) => {
  const cases: [Parameters<typeof withBundledPlugin>[1], RegExp][] = [
    ["changed", /does not match its digest/],
    ["unlisted", /is not listed/],
    ["missing", /listed but missing/],
    ["stray", /unexpected bundled plugin entry/],
  ];
  for (const [mode, error] of cases) {
    const data = await fixture(t, (bundle) => withBundledPlugin(bundle, mode));
    await assert.rejects(
      verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir: resolve(data.directory, "output"), sourceUrl: "https://example.test/archive", version: "0.73.1", flavor: "cpu" }),
      error,
      mode,
    );
  }
});

test("validates bundled plugin entries by name", () => {
  const product = [
    "mesh-bundle/mesh-llm",
    "mesh-bundle/product-manifest.json",
    "mesh-bundle/host-imports.json",
    "mesh-bundle/native-runtimes/linux-cpu/manifest.json",
    "mesh-bundle/native-runtimes/linux-cpu/README.md",
    "mesh-bundle/native-runtimes/linux-cpu/lib/libllama.so",
  ];
  assert.doesNotThrow(() => validateArchiveEntries([...product, "mesh-bundle/plugins/", "mesh-bundle/plugins/manifest.json", "mesh-bundle/plugins/capsules-0.1.3-x86_64-unknown-linux-gnu.tar.gz"]));
  assert.throws(() => validateArchiveEntries([...product, "mesh-bundle/plugins/capsules-0.1.3-x86_64-unknown-linux-gnu.tar.gz"]), /plugins\/manifest\.json/);
  assert.throws(() => validateArchiveEntries([...product, "mesh-bundle/plugins/manifest.json", "mesh-bundle/plugins/capsules"]), /unexpected bundled plugin entry/);
  assert.throws(() => validateArchiveEntries([...product, "mesh-bundle/plugins/manifest.json", "mesh-bundle/plugins/../evil.tar.gz"]), /unsafe/);
});
