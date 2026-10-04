import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

test("CUDA packages declare no user-space CUDA dependency", (t) => {
  const directory = mkdtempSync(resolve(tmpdir(), "native-package-cuda-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bundle = resolve(directory, "bundle");
  mkdirSync(resolve(bundle, "native-runtimes/linux-cuda/lib"), { recursive: true });
  writeFileSync(resolve(bundle, "mesh-llm"), "binary\n");
  writeFileSync(resolve(bundle, "product-manifest.json"), "{}\n");
  writeFileSync(resolve(bundle, "host-imports.json"), "{}\n");
  writeFileSync(resolve(bundle, "native-runtimes/linux-cuda/manifest.json"), "{}\n");
  writeFileSync(resolve(bundle, "native-runtimes/linux-cuda/lib/libllama.so"), "runtime\n");

  // Capture the metadata the builder writes without needing distro tooling.
  const stubs = resolve(directory, "stubs");
  mkdirSync(stubs);
  const metadata = resolve(directory, "metadata.txt");
  // GNU-only invocations the builder makes; this test only cares about metadata.
  writeFileSync(resolve(stubs, "du"), "#!/bin/sh\nprintf '1024\\t.\\n'\n", { mode: 0o755 });
  writeFileSync(resolve(stubs, "touch"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  writeFileSync(resolve(stubs, "dpkg-deb"), `#!/bin/sh\ncat "$3/DEBIAN/control" >> ${metadata}\n:> "$4"\n`, { mode: 0o755 });
  writeFileSync(resolve(stubs, "tar"), `#!/bin/sh\nfor arg in "$@"; do case "$arg" in -C) next=root ;; *) [ "\${next:-}" = root ] && cat "$arg/.PKGINFO" >> ${metadata} && next= ;; esac; done\n:> "$2"\n`, { mode: 0o755 });

  for (const [distro, version] of [["ubuntu", "12.9.2"], ["arch", "13.3.1"]]) {
    writeFileSync(metadata, "");
    const result = spawnSync("sh", [
      resolve("packaging/native/build-package.sh"), distro, "cuda", version, "amd64", "0.73.1",
      resolve(directory, `out-${distro}`), bundle,
    ], { encoding: "utf8", env: { ...process.env, PATH: `${stubs}:${process.env.PATH}`, SOURCE_DATE_EPOCH: "1700000000" } });
    assert.equal(result.status, 0, result.stderr);
    const written = readFileSync(metadata, "utf8");
    assert.ok(written.length > 0, `${distro}: no package metadata captured`);
    // The versioned runtime tree this package installs already carries cudart,
    // cuBLAS, cuBLASLt, and nvJitLink. The driver is host-owned.
    assert.doesNotMatch(written, /cudart|cublas|nccl|depend = cuda$|Depends:.*\bcuda\b/im, `${distro}: ${written}`);
  }
});
