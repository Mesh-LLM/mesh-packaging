import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test, type TestContext } from "node:test";

const repository = process.cwd();
const dockerfile = readFileSync(resolve(repository, "docker/Dockerfile.mesh-llm"), "utf8");
const dockerEnabled = process.env.MESH_PACKAGING_DOCKER_TESTS === "1";

function fixture(t: TestContext): string {
  const directory = mkdtempSync(resolve(tmpdir(), "mesh-package-efficiency-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function bundle(directory: string): void {
  mkdirSync(resolve(directory, "native-runtimes/cpu"), { recursive: true });
  writeFileSync(resolve(directory, "mesh-llm"), "#!/bin/sh\nprintf 'mesh-llm 0.75.0\\n'\n", { mode: 0o755 });
  writeFileSync(resolve(directory, "product-manifest.json"), "{}\n");
  writeFileSync(resolve(directory, "host-imports.json"), "{}\n");
  writeFileSync(resolve(directory, "native-runtimes/cpu/manifest.json"), "{}\n");
  writeFileSync(resolve(directory, "native-runtimes/cpu/libfixture.so"), "fixture runtime bytes\n");
}

function command(executable: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): string {
  const result = spawnSync(executable, args, {
    ...options, encoding: "utf8", timeout: 15 * 60_000, maxBuffer: 16 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${executable} ${args.join(" ")}\n${result.error ?? ""}\n${result.stdout}\n${result.stderr}`);
  return result.stdout + result.stderr;
}

function assertCachedStep(log: string, step: string): void {
  const line = log.split("\n").find((line) => line.includes(step));
  assert.ok(line, `missing BuildKit step ${step}\n${log}`);
  const id = line.match(/^#\d+/)?.[0];
  assert.ok(id, `missing BuildKit step ID: ${line}`);
  assert.ok(log.split("\n").includes(`${id} CACHED`), `BuildKit step was not cached: ${line}\n${log}`);
}

test("release-specific inputs do not invalidate shared dependency stages", () => {
  const tooling = dockerfile.split("FROM native-package-deps AS native-package-builder")[0];
  assert.doesNotMatch(tooling, /^ARG (?:BACKEND|BACKEND_VERSION|MESH_LLM_VERSION|SOURCE_DATE_EPOCH)\b/m);
  const runtimeDependencies = dockerfile.split("FROM ${RUNTIME_BASE_IMAGE} AS runtime-deps")[1].split("FROM runtime-deps AS runtime")[0];
  assert.doesNotMatch(runtimeDependencies, /^ARG (?:PACKAGE_FILE|MESH_LLM_|SOURCE_DATE_EPOCH)/m);
  assert.match(tooling, /sharing=locked/);
  assert.match(runtimeDependencies, /sharing=locked/);
  assert.doesNotMatch(dockerfile, /^COPY artifacts\/native-package/m);
  assert.match(dockerfile, /source=artifacts\/native-package\/\$\{PACKAGE_FILE\},target=\/packages\/\$\{PACKAGE_FILE\},readonly/);
});

test("active package formats reject an absent or invalid reproducibility epoch", (t) => {
  const directory = fixture(t);
  bundle(resolve(directory, "bundle"));
  for (const distro of ["ubuntu", "arch"]) {
    for (const epoch of ["", "-1", "not-a-timestamp", "1.5"]) {
      const result = spawnSync("sh", [
        resolve(repository, "packaging/native/build-package.sh"), distro, "cpu", "", "amd64", "0.75.0",
        resolve(directory, "packages"), resolve(directory, "bundle"),
      ], { encoding: "utf8", env: { ...process.env, SOURCE_DATE_EPOCH: epoch } });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /SOURCE_DATE_EPOCH is required and must be a nonnegative integer/);
    }
  }
});

function mockedCommands(t: TestContext): { directory: string; env: NodeJS.ProcessEnv; log: string } {
  const directory = fixture(t);
  const log = resolve(directory, "commands.log");
  for (const executable of ["apt-get", "dpkg", "ldconfig", "apk", "pacman", "pacman-key", "rm", "grep"]) {
    writeFileSync(resolve(directory, executable), `#!/bin/sh\nprintf '%s' '${executable}' >> "$COMMAND_LOG"\nprintf ' %s' "$@" >> "$COMMAND_LOG"\nprintf '\\n' >> "$COMMAND_LOG"\n`, { mode: 0o755 });
  }
  writeFileSync(resolve(directory, "find"), "#!/bin/sh\nprintf '/packages/mesh-llm-0.75.0.fixture\\n'\n", { mode: 0o755 });
  writeFileSync(resolve(directory, "dpkg-query"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  return { directory, log, env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, COMMAND_LOG: log } };
}

test("runtime dependencies use one refresh and include declared backend prerequisites", (t) => {
  const mocked = mockedCommands(t);
  for (const [distro, backend, version, expected] of [
    ["ubuntu", "cpu", "", "ca-certificates libdbus-1-3 libgomp1"],
    ["ubuntu", "vulkan", "", "libvulkan1"],
    ["ubuntu", "cuda", "12.9.2", "cuda-cudart-12-9 libcublas-12-9 libnccl2"],
    ["ubuntu", "rocm", "7.0", "hipblas"],
    ["alpine", "cpu", "", "libstdc++ openssl"],
    ["alpine", "vulkan", "", "vulkan-loader"],
    ["arch", "cpu", "", "ca-certificates dbus gcc-libs openssl"],
    ["arch", "vulkan", "", "vulkan-icd-loader"],
    ["arch", "cuda", "13.3.1", "cuda"],
    ["arch", "rocm", "7.0", "hip-runtime-amd rocm-core"],
  ]) {
    writeFileSync(mocked.log, "");
    command("sh", [resolve(repository, "docker/install-runtime-deps.sh"), distro, backend, version], { env: mocked.env });
    const log = readFileSync(mocked.log, "utf8");
    assert.ok(log.includes(expected), `${distro}/${backend}: ${log}`);
    assert.equal((log.match(/^apt-get update$/gm) ?? []).length, distro === "ubuntu" ? 1 : 0);
    assert.equal((log.match(/^pacman -Syu /gm) ?? []).length, distro === "arch" ? 1 : 0);
    assert.equal((log.match(/^(?:apt-get install|apk add|pacman -Syu) /gm) ?? []).length, 1);
  }
});

test("CUDA dependencies preserve installed NCCL and install it when absent", (t) => {
  const mocked = mockedCommands(t);
  for (const [state, expected] of [
    ["installed 2.27.3-1+cuda12.9", "libnccl2=2.27.3-1+cuda12.9"],
    ["config-files 2.27.3-1+cuda12.9", "libnccl2"],
    ["", "libnccl2"],
  ]) {
    writeFileSync(mocked.log, "");
    writeFileSync(resolve(mocked.directory, "dpkg-query"), `#!/bin/sh\nprintf '%s' '${state}'\n`, { mode: 0o755 });
    command("sh", [resolve(repository, "docker/install-runtime-deps.sh"), "ubuntu", "cuda", "12.9.2"], { env: mocked.env });
    const log = readFileSync(mocked.log, "utf8");
    assert.ok(log.includes(`libcublas-12-9 ${expected}\n`), log);
    assert.doesNotMatch(log, /allow-change-held-packages|apt-mark unhold/);
    assert.equal((log.match(/^apt-get install /gm) ?? []).length, 1);
  }
});

test("prepared package installation preserves dependency checks without refreshing repositories", (t) => {
  const mocked = mockedCommands(t);
  for (const distro of ["ubuntu", "arch", "alpine"]) {
    writeFileSync(mocked.log, "");
    command("sh", [resolve(repository, "docker/install-native-package.sh"), distro, "--dependencies-prepared"], { env: mocked.env });
    const log = readFileSync(mocked.log, "utf8");
    assert.doesNotMatch(log, /apt-get update|pacman -Syu|--nodeps|--force-depends/);
    if (distro === "ubuntu") assert.match(log, /dpkg --install \/packages\/mesh-llm-0.75.0.fixture/);
    if (distro === "arch") assert.match(log, /pacman -U --noconfirm --needed/);
    if (distro === "alpine") assert.match(log, /apk add --cache-dir \/var\/cache\/apk --allow-untrusted/);
  }
  writeFileSync(resolve(mocked.directory, "dpkg"), "#!/bin/sh\necho 'dependency problems prevent configuration' >&2\nexit 1\n", { mode: 0o755 });
  const failure = spawnSync("sh", [resolve(repository, "docker/install-native-package.sh"), "ubuntu", "--dependencies-prepared"], { env: mocked.env, encoding: "utf8" });
  assert.notEqual(failure.status, 0);
  assert.match(failure.stderr, /dependency problems prevent configuration/);
});

test("Docker cold package builds reproduce bytes and runtime images omit the package archive", {
  skip: !dockerEnabled && "set MESH_PACKAGING_DOCKER_TESTS=1 to run real Docker fixture builds",
  timeout: 30 * 60_000,
}, (t) => {
  const directory = fixture(t);
  const context = resolve(directory, "context");
  mkdirSync(context);
  for (const file of [
    "docker/Dockerfile.mesh-llm", "docker/install-package-build-deps.sh", "docker/install-runtime-deps.sh",
    "docker/install-native-package.sh", "docker/entrypoint.sh", "packaging/native/build-package.sh",
  ]) {
    const target = resolve(context, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repository, file), target);
  }
  const bundlePath = resolve(context, "artifacts/upstream");
  bundle(bundlePath);
  const bases = new Map<string, string>();
  const pinnedBase = (reference: string): string => {
    if (!bases.has(reference)) {
      const digest = command("docker", ["buildx", "imagetools", "inspect", reference, "--format", "{{.Manifest.Digest}}"]).trim();
      assert.match(digest, /^sha256:[0-9a-f]{64}$/);
      bases.set(reference, `${reference}@${digest}`);
    }
    return bases.get(reference)!;
  };
  for (const [distro, base, extension] of [["ubuntu", "ubuntu:24.04", "deb"], ["arch", "archlinux:base-devel", "pkg.tar.zst"]]) {
    const packageFile = `mesh-llm-0.75.0-${distro}-amd64-cpu.${extension}`;
    const outputs: string[] = [];
    for (const attempt of [1, 2]) {
      const output = resolve(directory, `${distro}-${attempt}`);
      // Different extraction timestamps must not affect package bytes.
      utimesSync(resolve(bundlePath, "mesh-llm"), 1_700_000_000 + attempt, 1_700_000_000 + attempt);
      utimesSync(resolve(bundlePath, "native-runtimes/cpu/libfixture.so"), 1_700_000_100 + attempt, 1_700_000_100 + attempt);
      const log = command("docker", [
        "buildx", "build", "--progress=plain", "--platform=linux/amd64", "--target=native-package-artifact",
        "--no-cache-filter=native-package-builder", "--build-arg", `PACKAGE_BASE_IMAGE=${pinnedBase(base)}`,
        "--build-arg", `DISTRO=${distro}`, "--build-arg", "TARGET_ARCH=amd64",
        "--build-arg", "MESH_LLM_VERSION=0.75.0", "--build-arg", "SOURCE_DATE_EPOCH=1700000000",
        "--output", `type=local,dest=${output}`, "-f", "docker/Dockerfile.mesh-llm", ".",
      ], { cwd: context });
      if (attempt === 2) assertCachedStep(log, "RUN --mount=type=cache,id=mesh-packaging-" + distro + "-amd64-package-manager-packages");
      outputs.push(resolve(output, packageFile));
    }
    const hash = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
    assert.equal(hash(outputs[0]), hash(outputs[1]), `${distro} cold package bytes differ`);
    t.diagnostic(`${distro} independent package builds match SHA-256 ${hash(outputs[0])}`);
    const sharedToolingLog = command("docker", [
      "buildx", "build", "--progress=plain", "--platform=linux/amd64", "--target=native-package-deps",
      "--output=type=cacheonly", "--build-arg", `PACKAGE_BASE_IMAGE=${pinnedBase(base)}`,
      "--build-arg", `DISTRO=${distro}`, "--build-arg", "TARGET_ARCH=amd64", "--build-arg", "BACKEND=cuda",
      "--build-arg", "BACKEND_VERSION=12.9.2", "--build-arg", "MESH_LLM_VERSION=0.76.0",
      "--build-arg", "SOURCE_DATE_EPOCH=1800000000", "-f", "docker/Dockerfile.mesh-llm", ".",
    ], { cwd: context });
    assertCachedStep(sharedToolingLog, "RUN --mount=type=cache,id=mesh-packaging-" + distro + "-amd64-package-manager-packages");
    const packageDirectory = resolve(context, "artifacts/native-package");
    mkdirSync(packageDirectory, { recursive: true });
    cpSync(outputs[0], resolve(packageDirectory, packageFile));
    const tag = `mesh-package-efficiency-${process.pid}:${distro}`;
    const runtimeBase = distro === "ubuntu" ? "ubuntu:24.04" : "archlinux:base";
    const buildArgs = [
      "buildx", "build", "--progress=plain", "--platform=linux/amd64", "--target=runtime", "--load", "--tag", tag,
      "--build-arg", `RUNTIME_BASE_IMAGE=${pinnedBase(runtimeBase)}`, "--build-arg", `DISTRO=${distro}`,
      "--build-arg", `PACKAGE_FILE=${packageFile}`, "--build-arg", "MESH_LLM_VERSION=0.75.0",
      "--build-arg", "SOURCE_DATE_EPOCH=1700000000", "-f", "docker/Dockerfile.mesh-llm", ".",
    ];
    command("docker", buildArgs, { cwd: context });
    t.after(() => command("docker", ["image", "rm", tag]));
    command("docker", ["run", "--rm", "--platform=linux/amd64", "--entrypoint=sh", tag, "-eu", "-c",
      `test ! -e /packages/${packageFile}; /usr/local/bin/mesh-llm --version; ${distro === "ubuntu" ? "dpkg-query -W mesh-llm" : "pacman -Q mesh-llm"}`]);
    const archive = resolve(directory, `${distro}-image.tar`);
    command("docker", ["image", "save", "--output", archive, tag]);
    const manifests = JSON.parse(command("tar", ["-xOf", archive, "manifest.json"]));
    for (const layer of manifests[0].Layers) {
      const files = command("sh", ["-c", 'tar -xOf "$1" "$2" | tar -tf -', "inspect-layer", archive, layer]);
      assert.doesNotMatch(files, /(?:^|\/)packages\/.*(?:\.deb|\.pkg\.tar\.zst)$/m);
    }
    // Sidecar content is deliberately outside the package bind mount cache key.
    writeFileSync(resolve(packageDirectory, "fixture.spdx.json"), '{"changed":true}\n');
    const cachedLog = command("docker", buildArgs, { cwd: context });
    assertCachedStep(cachedLog, "RUN --mount=type=bind,source=artifacts/native-package/" + packageFile);
  }
});
