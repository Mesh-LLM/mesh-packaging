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
  validateRuntimeIdentity,
  validateRuntimeMinGlibc,
  verifyAndExtract,
  verifyDeclaredRuntimeFiles,
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

function runtimeManifest() {
  return {
    schema_version: 2,
    runtime: {
      id: "linux-cpu", release_version: "1.2.0", skippy_abi: "7", backend: { kind: "cpu" },
      platform: { os: "linux", arch: "x86_64", target: "x86_64-unknown-linux-gnu" },
    },
  };
}

function productManifest() {
  return {
    schema_version: 2,
    contract: "mesh-llm-product-v2",
    mesh_version: "0.79.0",
    backend: "cpu",
    host: { path: "mesh-llm", sha256: "a".repeat(64), required_skippy_abi: "7" },
    runtime: {
      id: "linux-cpu", path: "native-runtimes/linux-cpu", sha256: "b".repeat(64),
      manifest_sha256: "c".repeat(64), release_version: "1.2.0", skippy_abi: "7",
    },
  };
}

type FixtureOptions = {
  runtimeOverride?: Record<string, unknown>;
  declaredFiles?: Record<string, string>;
  licenses?: { name: string; contents: string; declare?: boolean; digest?: string }[];
  plugins?: { name: string; contents: string }[];
};

async function fixture(t: { after(callback: () => void): void }, options: FixtureOptions = {}) {
  const directory = mkdtempSync(resolve(tmpdir(), "upstream-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bundle = resolve(directory, "stage/mesh-bundle");
  mkdirSync(bundle, { recursive: true });
  writeFileSync(resolve(bundle, "mesh-llm"), "#!/bin/sh\necho mesh-llm 0.73.1\n");
  chmodSync(resolve(bundle, "mesh-llm"), 0o755);
  writeFileSync(resolve(bundle, "host-imports.json"), "{}\n");
  for (const plugin of options.plugins ?? []) {
    mkdirSync(resolve(bundle, "plugins"), { recursive: true });
    writeFileSync(resolve(bundle, "plugins", plugin.name), plugin.contents);
  }
  const runtime = resolve(bundle, "native-runtimes/linux-cpu");
  mkdirSync(resolve(runtime, "lib"), { recursive: true });
  writeFileSync(resolve(runtime, "README.md"), "runtime\n");
  writeFileSync(resolve(runtime, "lib/libllama.so"), "runtime\n");
  const files: Record<string, string> = {
    "lib/libllama.so": await sha256File(resolve(runtime, "lib/libllama.so")), ...options.declaredFiles,
  };
  for (const license of options.licenses ?? []) {
    mkdirSync(resolve(runtime, "licenses"), { recursive: true });
    const relative = `licenses/${license.name}`;
    writeFileSync(resolve(runtime, relative), license.contents);
    if (license.declare !== false) files[relative] = license.digest ?? await sha256File(resolve(runtime, relative));
  }
  const native = runtimeManifest();
  writeFileSync(resolve(runtime, "manifest.json"), JSON.stringify({
    ...native, runtime: { ...native.runtime, files, libraries: ["lib/libllama.so"] }, ...options.runtimeOverride,
  }));
  const hostSha256 = await sha256File(resolve(bundle, "mesh-llm"));
  const runtimeSha256 = sha256Tree(runtime);
  const runtimeManifestSha256 = await sha256File(resolve(runtime, "manifest.json"));
  writeFileSync(resolve(bundle, "product-manifest.json"), JSON.stringify({
    backend: "cpu",
    contract: "mesh-llm-product-v2",
    host: { path: "mesh-llm", sha256: hostSha256, required_skippy_abi: "7" },
    mesh_version: "0.73.1",
    runtime: {
      id: "linux-cpu",
      manifest_sha256: runtimeManifestSha256,
      path: "native-runtimes/linux-cpu",
      sha256: runtimeSha256,
      release_version: "1.2.0",
      skippy_abi: "7",
    },
    schema_version: 2,
  }));
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
    runtime_min_glibc: null,
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
    host: { path: "mesh-llm", sha256, required_skippy_abi: "7" },
    mesh_version: "0.73.1",
    runtime: {
      id: "../linux-cpu",
      manifest_sha256: sha256,
      path: "native-runtimes/../linux-cpu",
      sha256,
      release_version: "1.2.0",
      skippy_abi: "7",
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

test("preserves producer-shaped bundled plugin archives without an invented manifest", async (t) => {
  const name = "mesh-tools-1.2.3-x86_64-unknown-linux-gnu.tar.gz";
  const data = await fixture(t, { plugins: [{ name, contents: "producer plugin archive bytes" }] });
  const outputDir = resolve(data.directory, "plugins-output");
  await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "x", version: "0.73.1", flavor: "cpu" });
  assert.equal(readFileSync(resolve(outputDir, "plugins", name), "utf8"), "producer plugin archive bytes");
  assert.equal(existsSync(resolve(outputDir, "plugins/manifest.json")), false);
  const invalid = await fixture(t, { plugins: [{ name, contents: "" }] });
  await assert.rejects(() => verifyAndExtract({ archive: invalid.archive, checksum: invalid.checksum, outputDir: resolve(invalid.directory, "output"), sourceUrl: "x", version: "0.73.1", flavor: "cpu" }), /nonempty regular archive/);
  const entries = [
    "mesh-bundle/mesh-llm", "mesh-bundle/product-manifest.json", "mesh-bundle/host-imports.json",
    "mesh-bundle/native-runtimes/linux-cpu/manifest.json", "mesh-bundle/native-runtimes/linux-cpu/README.md", "mesh-bundle/native-runtimes/linux-cpu/lib/libllama.so",
  ];
  for (const entry of ["manifest.json", `nested/${name}`, "not-an-archive.txt"]) {
    assert.throws(() => validateArchiveEntries([...entries, `mesh-bundle/plugins/${entry}`]), /unexpected product archive entry/);
  }
});

test("requires current product ABI fields while keeping runtime release independent", () => {
  const product = productManifest();
  assert.doesNotThrow(() => validateProductManifest(product));
  assert.notEqual(product.mesh_version, product.runtime.release_version);
  for (const field of ["required_skippy_abi"] as const) {
    const { [field]: omitted, ...legacyHost } = product.host;
    assert.throws(() => validateProductManifest({ ...product, host: legacyHost }), /unexpected or missing fields/);
    for (const value of [null, 7, "", " "]) {
      assert.throws(() => validateProductManifest({ ...product, host: { ...product.host, [field]: value } }), /non-empty string/);
    }
  }
  for (const field of ["release_version", "skippy_abi"] as const) {
    const { [field]: omitted, ...legacyRuntime } = product.runtime;
    assert.throws(() => validateProductManifest({ ...product, runtime: legacyRuntime }), /unexpected or missing fields/);
    for (const value of [null, 7, "", " "]) {
      assert.throws(() => validateProductManifest({ ...product, runtime: { ...product.runtime, [field]: value } }), /non-empty string/);
    }
  }
  assert.throws(() => validateProductManifest({ ...product, runtime: { ...product.runtime, skippy_abi: "8" } }), /host-required ABI/);
  assert.throws(() => validateProductManifest({ ...product, host: { ...product.host, ignored: true } }), /unexpected or missing fields/);
  assert.throws(() => validateProductManifest({ ...product, runtime: { ...product.runtime, mesh_version: product.mesh_version } }), /unexpected or missing fields/);
});

test("binds native schema, ABI, release, backend, and ID to the verified product", () => {
  const product = validateProductManifest(productManifest());
  const native = runtimeManifest();
  assert.doesNotThrow(() => validateRuntimeIdentity(native, product));
  for (const value of [null, [], "invalid"]) assert.throws(() => validateRuntimeIdentity(value, product), /must be an object/);
  for (const schema_version of [undefined, 1, "2"]) {
    assert.throws(() => validateRuntimeIdentity({ ...native, schema_version }, product), /requires schema_version 2/);
  }
  for (const runtime of [null, [], "invalid"]) assert.throws(() => validateRuntimeIdentity({ ...native, runtime }, product), /must be an object/);
  for (const field of ["id", "release_version", "skippy_abi"] as const) {
    assert.throws(() => validateRuntimeIdentity({ ...native, runtime: { ...native.runtime, [field]: "different" } }, product), /does not match/);
    assert.throws(() => validateRuntimeIdentity({ ...native, runtime: { ...native.runtime, [field]: "" } }, product), /non-empty string/);
  }
  assert.throws(() => validateRuntimeIdentity({ ...native, runtime: { ...native.runtime, mesh_version: "0.79.0" } }, product), /not mesh_version/);
  for (const backend of [null, [], "cpu", { kind: "cuda" }]) {
    assert.throws(() => validateRuntimeIdentity({ ...native, runtime: { ...native.runtime, backend } }, product), /backend does not match/);
  }
});

test("rejects a digest-consistent archive containing an incompatible native runtime", async (t) => {
  const native = runtimeManifest();
  const data = await fixture(t, { runtimeOverride: { runtime: { ...native.runtime, skippy_abi: "8" } } });
  await assert.rejects(() => verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir: resolve(data.directory, "incompatible"), sourceUrl: "x", version: "0.73.1", flavor: "cpu" }), /native runtime skippy_abi does not match/);
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

test("requires producer declarations and matching bytes for flat runtime licenses", async (t) => {
  const data = await fixture(t, { licenses: [{ name: "NVIDIA-CUDA-LICENSE.txt", contents: "EULA\n" }] });
  const outputDir = resolve(data.directory, "output");
  await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "x", version: "0.73.1", flavor: "cpu" });
  assert.deepEqual(await verifyDeclaredRuntimeFiles(resolve(outputDir, "native-runtimes/linux-cpu")), ["licenses/NVIDIA-CUDA-LICENSE.txt"]);
  for (const license of [
    { name: "UNDECLARED.txt", contents: "payload", declare: false },
    { name: "INCORRECT.txt", contents: "payload", digest: "b".repeat(64) },
    { name: "MALFORMED.txt", contents: "payload", digest: "not-a-digest" },
  ]) {
    const invalid = await fixture(t, { licenses: [license] });
    await assert.rejects(() => verifyAndExtract({ archive: invalid.archive, checksum: invalid.checksum, outputDir: resolve(invalid.directory, "output"), sourceUrl: "x", version: "0.73.1", flavor: "cpu" }), /does not declare runtime file|does not match its declared digest/);
  }
  for (const name of ["nested/EULA.txt", ".hidden", "-leading", "spaced name.txt"]) {
    assert.throws(() => validateArchiveEntries([
      "mesh-bundle/mesh-llm", "mesh-bundle/product-manifest.json", "mesh-bundle/host-imports.json",
      `mesh-bundle/native-runtimes/linux-cpu/licenses/${name}`,
    ]), /unexpected native runtime entry/);
  }
});

test("rejects declared license files missing from a digest-consistent archive", async (t) => {
  for (const licenses of [undefined, [{ name: "PRESENT.txt", contents: "license\n" }]]) {
    const data = await fixture(t, { licenses, declaredFiles: { "licenses/EULA.txt": "a".repeat(64) } });
    if (!licenses) assert.equal(existsSync(resolve(data.directory, "stage/mesh-bundle/native-runtimes/linux-cpu/licenses")), false);
    await assert.rejects(() => verifyAndExtract({
      archive: data.archive, checksum: data.checksum, outputDir: resolve(data.directory, "output"),
      sourceUrl: "x", version: "0.73.1", flavor: "cpu",
    }), /declared native runtime file is missing: licenses\/EULA\.txt/);
  }
});

test("rejects unsafe or non-flat declared license paths even without extracted licenses", async (t) => {
  for (const relative of [
    "licenses/../EULA.txt", "../licenses/EULA.txt", "lib/../licenses/EULA.txt", "/licenses/EULA.txt",
    "licenses\\EULA.txt", "C:/licenses/EULA.txt", "licenses//EULA.txt", "licenses/./EULA.txt",
    "licenses/nested/EULA.txt", "licenses/.hidden", "licenses/-leading", "licenses/spaced name.txt",
  ]) {
    const data = await fixture(t, { declaredFiles: { [relative]: "a".repeat(64) } });
    await assert.rejects(() => verifyAndExtract({
      archive: data.archive, checksum: data.checksum, outputDir: resolve(data.directory, "output"),
      sourceUrl: "x", version: "0.73.1", flavor: "cpu",
    }), /unsafe declared native runtime path|unexpected native runtime entry/);
  }
});

test("admits a runtime with no declared or extracted license files", async (t) => {
  const data = await fixture(t);
  const runtimeDir = resolve(data.directory, "stage/mesh-bundle/native-runtimes/linux-cpu");
  assert.equal(existsSync(resolve(runtimeDir, "licenses")), false);
  assert.deepEqual(await verifyDeclaredRuntimeFiles(runtimeDir), []);
});

test("validates Linux glibc declarations with the native u32 bounds and records the floor", async (t) => {
  const native = runtimeManifest();
  const data = await fixture(t, { runtimeOverride: { runtime: { ...native.runtime, platform: { os: "linux", min_glibc: "2.35" } } } });
  const outputDir = resolve(data.directory, "output");
  const result = await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "x", version: "0.73.1", flavor: "cpu" });
  assert.equal(JSON.parse(readFileSync(result.provenance, "utf8")).runtime_min_glibc, "2.35");
  const runtimeDir = resolve(data.directory, "stage/mesh-bundle/native-runtimes/linux-cpu");
  const check = (min_glibc: unknown, os = "linux") => {
    writeFileSync(resolve(runtimeDir, "manifest.json"), JSON.stringify({ ...native, runtime: { ...native.runtime, platform: { os, min_glibc } } }));
    return validateRuntimeMinGlibc(runtimeDir);
  };
  for (const floor of [undefined, null]) assert.equal(check(floor), null);
  assert.equal(check("4294967295.4294967295"), "4294967295.4294967295");
  for (const floor of ["4294967296.0", "2.4294967296", "999999999999999999999.0", "2.35.1", "2", "", "two.35", 2.35, true]) {
    assert.throws(() => check(floor), /min_glibc must be a major.minor version/);
  }
  assert.throws(() => check("2.35", "macos"), /only meaningful on linux/);
  const invalid = await fixture(t, { runtimeOverride: { runtime: { ...native.runtime, platform: { os: "linux", min_glibc: "2.4294967296" } } } });
  await assert.rejects(() => verifyAndExtract({ archive: invalid.archive, checksum: invalid.checksum, outputDir: resolve(invalid.directory, "output"), sourceUrl: "x", version: "0.73.1", flavor: "cpu" }), /min_glibc must be/);
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
