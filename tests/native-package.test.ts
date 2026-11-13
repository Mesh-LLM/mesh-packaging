import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test, type TestContext } from "node:test";

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

const pluginArchive = "capsules-0.1.4-x86_64-unknown-linux-gnu.tar.gz";
const pluginBytes = Buffer.from("unchanged plugin archive bytes\n");

function syntheticBundle(directory: string, plugins: boolean): string {
  const bundle = resolve(directory, "bundle");
  const runtime = resolve(bundle, "native-runtimes", "linux-cuda");
  mkdirSync(resolve(runtime, "lib"), { recursive: true });
  writeFileSync(resolve(bundle, "mesh-llm"), "binary\n");
  writeFileSync(resolve(bundle, "product-manifest.json"), "{}\n");
  writeFileSync(resolve(bundle, "host-imports.json"), "{}\n");
  writeFileSync(resolve(runtime, "manifest.json"), "{}\n");
  writeFileSync(resolve(runtime, "lib/libllama.so"), "runtime\n");
  if (plugins) {
    mkdirSync(resolve(bundle, "plugins"));
    writeFileSync(resolve(bundle, "plugins", pluginArchive), pluginBytes);
  }
  return bundle;
}

function temporaryDirectory(t: TestContext): string {
  const directory = mkdtempSync(resolve(tmpdir(), "native-package-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test("CUDA packages require a backend version before staging any distro output", (t) => {
  const directory = temporaryDirectory(t);
  const bundle = syntheticBundle(directory, false);
  for (const distro of ["ubuntu", "arch", "alpine"]) {
    const output = resolve(directory, `out-${distro}`);
    const result = spawnSync("sh", [
      resolve("packaging/native/build-package.sh"), distro, "cuda", "", "amd64", "0.79.0", output, bundle,
    ], { encoding: "utf8", env: { ...process.env, SOURCE_DATE_EPOCH: "1700000000" } });
    assert.equal(result.status, 1, `${distro}: ${result.stderr}`);
    assert.match(result.stderr, /CUDA package requires a backend version/, distro);
    assert.equal(result.stdout, "", distro);
    assert.equal(existsSync(output), false, `${distro}: invalid input must not stage a package`);
  }
});

test("CUDA packages declare no user-space CUDA dependency", (t) => {
  const directory = temporaryDirectory(t);
  const bundle = syntheticBundle(directory, false);
  const stubs = resolve(directory, "stubs");
  mkdirSync(stubs);
  const metadata = resolve(directory, "metadata.txt");
  writeFileSync(resolve(stubs, "du"), "#!/bin/sh\nprintf '1024\\t.\\n'\n", { mode: 0o755 });
  writeFileSync(resolve(stubs, "touch"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  writeFileSync(resolve(stubs, "dpkg-deb"), '#!/bin/sh\nset -eu\ncat "$3/DEBIAN/control" >> "$METADATA_FILE"\n: > "$4"\n', { mode: 0o755 });
  // Consume the actual -cf output argument, not an unrelated positional flag.
  writeFileSync(resolve(stubs, "tar"), `#!/bin/sh
set -eu
while [ "$#" -gt 0 ]; do
  case "$1" in
    -C) shift; cat "$1/.PKGINFO" >> "$METADATA_FILE" ;;
    -cf) shift; : > "$1" ;;
  esac
  shift
done
`, { mode: 0o755 });
  for (const [distro, backendVersion, extension] of [["ubuntu", "12.9.2", "deb"], ["arch", "13.3.1", "pkg.tar.zst"]]) {
    writeFileSync(metadata, "");
    const output = resolve(directory, `out-${distro}`);
    const result = spawnSync("sh", [
      resolve("packaging/native/build-package.sh"), distro, "cuda", backendVersion, "amd64", "0.79.0", output, bundle,
    ], { encoding: "utf8", cwd: directory, env: { ...process.env, PATH: `${stubs}:${process.env.PATH}`, METADATA_FILE: metadata, SOURCE_DATE_EPOCH: "1700000000" } });
    assert.equal(result.status, 0, result.stderr);
    const written = readFileSync(metadata, "utf8");
    assert.ok(written.length > 0, `${distro}: no package metadata captured`);
    assert.doesNotMatch(written, /cudart|cublas|nccl|depend = cuda$|Depends:.*\bcuda\b/im, `${distro}: ${written}`);
    assert.ok(existsSync(resolve(output, `mesh-llm-0.79.0-${distro}-amd64-cuda${backendVersion}.${extension}`)));
    assert.equal(existsSync(resolve(directory, "--mtime=@1700000000")), false);
  }
});

for (const distro of ["ubuntu", "arch"]) {
  for (const plugins of [true, false]) {
    test(`${distro} package preserves the producer's ${plugins ? "bundled plugin bytes" : "absence of plugins"}`, (t) => {
      if (process.platform !== "linux") return t.skip("native package build requires Linux tools");
      const needed = distro === "ubuntu" ? "dpkg-deb" : "zstd";
      if (spawnSync(needed, ["--version"]).status !== 0) return t.skip(`${needed} is not installed`);
      const directory = temporaryDirectory(t);
      const output = resolve(directory, "output");
      const bundle = syntheticBundle(directory, plugins);
      const result = spawnSync("sh", [
        resolve("packaging/native/build-package.sh"), distro, "cpu", "", "amd64", "0.79.0", output, bundle,
      ], { encoding: "utf8", env: { ...process.env, SOURCE_DATE_EPOCH: "1700000000" } });
      assert.equal(result.status, 0, result.stderr);
      const extension = distro === "ubuntu" ? "deb" : "pkg.tar.zst";
      const packageFile = resolve(output, `mesh-llm-0.79.0-${distro}-amd64-cpu.${extension}`);
      const extracted = resolve(directory, "extracted");
      mkdirSync(extracted);
      const extract = distro === "ubuntu"
        ? spawnSync("dpkg-deb", ["-x", packageFile, extracted], { encoding: "utf8" })
        : spawnSync("tar", ["--zstd", "-xf", packageFile, "-C", extracted], { encoding: "utf8" });
      assert.equal(extract.status, 0, extract.stderr);
      assert.equal(readlinkSync(resolve(extracted, "usr/local/lib/mesh-llm/native-runtimes")), "0.79.0/native-runtimes");
      const installed = resolve(extracted, "usr/local/lib/mesh-llm/0.79.0/plugins");
      assert.equal(existsSync(installed), plugins);
      if (plugins) assert.deepEqual(readFileSync(resolve(installed, pluginArchive)), pluginBytes);
    });
  }
}
