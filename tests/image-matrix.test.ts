import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  backendSuffix, homebrewPlan, loadConfig, main, matrixRows, normalizeVersion, parseFilter,
  npmMatrixRows, npmPlan, runnerLabels, stableStringify, targetTriple, upstreamAssetName,
  upstreamRows, validate,
} from "../scripts/image-matrix.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = resolve(ROOT, "scripts/image-matrix.ts");
const CONFIG = resolve(ROOT, "packaging/images.json");
const IMAGE = "ghcr.io/mesh-llm/mesh-llm";

function cli(args: string[]) {
  return spawnSync(process.execPath, ["--experimental-strip-types", SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" });
}

function config() {
  return JSON.parse(JSON.stringify(loadConfig(CONFIG)));
}

function tempConfig(t: { after(callback: () => void): void }, value: object): string {
  const directory = mkdtempSync(resolve(tmpdir(), "matrix-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = resolve(directory, "images.json");
  writeFileSync(path, JSON.stringify(value));
  return path;
}

test("repository config models the supported upstream archive and packaging contract", () => {
  const value = config();
  assert.deepEqual(validate(value), []);
  const rows = matrixRows(value, IMAGE, "refs/tags/v0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", new Set(), new Set(), false);
  assert.equal(rows.length, 11);
  assert.equal(upstreamRows(rows).length, 8);
  assert.equal(rows.some((row) => row.distro === "alpine"), false);
  const cpu = rows.find((row) => row.artifact_id === "ubuntu-cpu-amd64")!;
  assert.equal(cpu.upstream_asset_name, "mesh-llm-v0.73.1-x86_64-unknown-linux-gnu.tar.gz");
  assert.equal(cpu.package_file, "mesh-llm-0.73.1-ubuntu-amd64-cpu.deb");
  assert.equal(cpu.tags, `${IMAGE}:0.73.1-ubuntu-amd64-cpu\n${IMAGE}:ubuntu-amd64-cpu`);
  const armCuda = rows.find((row) => row.artifact_id === "ubuntu-cuda-13.1.2-arm64")!;
  assert.equal(armCuda.runner_labels, '"ubuntu-24.04-arm"');
  assert.equal(armCuda.upstream_flavor, "cuda-13");
  const arch = rows.find((row) => row.artifact_id === "arch-cuda-13.3.1-amd64")!;
  assert.equal(arch.package_file, "mesh-llm-0.73.1-arch-amd64-cuda13.3.1.pkg.tar.zst");
  assert.equal(arch.release_track, "downstream_extension");
  assert.equal(arch.package_manager, "pacman");
});

test("filters and disabled rows are deterministic", () => {
  const value = config();
  let rows = matrixRows(value, IMAGE, "0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", parseFilter(" ubuntu-cpu-arm64, "), parseFilter("linux/arm64"), false);
  assert.deepEqual(rows.map((row) => row.artifact_id), ["ubuntu-cpu-arm64"]);
  rows = matrixRows(value, IMAGE, "0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", parseFilter("ubuntu-cpu"), parseFilter("amd64"), false);
  assert.deepEqual(rows.map((row) => row.artifact_id), ["ubuntu-cpu-amd64"]);
  const alpine = value.variants.find((variant: { id: string }) => variant.id === "alpine-cpu");
  alpine.matrix_enabled = true;
  assert.equal(matrixRows(value, IMAGE, "0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", new Set(), new Set(), false).some((row) => row.distro === "alpine"), false);
  assert.equal(matrixRows(value, IMAGE, "0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", new Set(), new Set(), true).some((row) => row.distro === "alpine"), true);
});

test("npm lanes expand and toggle independently", () => {
  const value = config();
  let rows = npmMatrixRows(value, "v0.73.1", new Set(), false);
  assert.deepEqual(rows.map((row) => row.target), [
    "darwin-arm64", "darwin-x64", "linux-arm64", "linux-x64", "win32-x64",
  ]);
  assert.equal(rows[2].runner_labels, '"ubuntu-24.04-arm"');
  assert.equal(rows[4].artifact_name, "mesh-llm-node-sdk-addon-0.73.1-win32-x64");
  assert.deepEqual(npmPlan(value, rows), {
    enabled: true,
    package_name: "@mesh-llm/sdk",
    registry: "https://registry.npmjs.org/",
    source_directory: "sdk/node",
    targets: ["darwin-arm64", "darwin-x64", "linux-arm64", "linux-x64", "win32-x64"],
  });

  const linuxArm = value.npm.lanes.find((lane: { target: string }) => lane.target === "linux-arm64");
  linuxArm.release_enabled = false;
  rows = npmMatrixRows(value, "0.73.1", parseFilter("node-sdk-linux-arm64"), false);
  assert.deepEqual(rows, []);
  rows = npmMatrixRows(value, "0.73.1", parseFilter("linux-arm64"), true);
  assert.deepEqual(rows.map((row) => row.id), ["node-sdk-linux-arm64"]);
  linuxArm.matrix_enabled = false;
  assert.deepEqual(validate(value), []);
  assert.deepEqual(npmMatrixRows(value, "0.73.1", new Set(), true).map((row) => row.target), [
    "darwin-arm64", "darwin-x64", "linux-x64", "win32-x64",
  ]);
  assert.deepEqual(npmPlan(value, []), {
    enabled: false,
    package_name: "@mesh-llm/sdk",
    registry: "https://registry.npmjs.org/",
    source_directory: "sdk/node",
    targets: [],
  });
});

test("matrix defaults remain deterministic for partially specified validated fields", () => {
  const value = config();
  const variant = value.variants[0];
  delete variant.backend_version;
  delete variant.release_track;
  variant.package_manager = "apt";
  let rows = matrixRows(value, IMAGE, "0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", parseFilter("ubuntu-cpu"), parseFilter("amd64"), false);
  assert.equal(rows[0].backend_version, "");
  assert.equal(rows[0].release_track, "upstream_mirrored");
  assert.equal(rows[0].package_manager, "apt");

  const partial = {
    variants: [{ id: "partial", upstream_flavor: "cpu", runtime_base_image: "x", package_base_image: "x", platforms: ["linux/amd64"] }],
  };
  rows = matrixRows(partial, IMAGE, "0.73.1", "v0.73.1", "Mesh-LLM/mesh-llm", new Set(), new Set(), false);
  assert.equal(rows[0].arch, undefined);
  assert.equal(rows[0].distro, "");
  assert.equal(rows[0].backend, "");
  assert.equal(rows[0].package_manager, "");
});

test("naming helpers preserve the upstream release ABI", () => {
  assert.equal(normalizeVersion(" v1.2.3-rc.1 "), "1.2.3-rc.1");
  assert.throws(() => normalizeVersion("main"), /invalid/);
  assert.equal(backendSuffix("cpu"), "cpu");
  assert.equal(backendSuffix("vulkan"), "vulkan");
  assert.equal(backendSuffix("cuda", "13.1"), "cuda13.1");
  assert.equal(targetTriple("linux/amd64"), "x86_64-unknown-linux-gnu");
  assert.equal(targetTriple("linux/arm64"), "aarch64-unknown-linux-gnu");
  assert.throws(() => targetTriple("darwin/amd64"), /unsupported/);
  assert.equal(upstreamAssetName("1.2.3", "aarch64-apple-darwin", "metal"), "mesh-llm-v1.2.3-aarch64-apple-darwin.tar.gz");
  assert.equal(upstreamAssetName("1.2.3", "x86_64-pc-windows-msvc", "cuda-13"), "mesh-llm-v1.2.3-x86_64-pc-windows-msvc-cuda-13.zip");
  assert.equal(runnerLabels("linux/arm64"), '"ubuntu-24.04-arm"');
  assert.equal(runnerLabels("linux/amd64"), '"ubuntu-24.04"');
  assert.equal(stableStringify({ z: 1, a: [{ y: 2, x: 1 }], n: null }), '{"a":[{"x":1,"y":2}],"n":null,"z":1}');
});

test("Homebrew points directly at the upstream arm64 Metal archive", () => {
  const plan = homebrewPlan(config(), "v0.73.1");
  assert.equal(plan.runner, "macos-15");
  assert.equal(plan.upstream_asset_name, "mesh-llm-v0.73.1-aarch64-apple-darwin.tar.gz");
  assert.match(plan.upstream_asset_url, /Mesh-LLM\/mesh-llm\/releases\/download\/v0\.73\.1/);
});

test("validation reports every contract category", () => {
  const value = config();
  value.schema_version = 1;
  value.image = {};
  value.homebrew = {};
  value.variants = [
    { id: "duplicate", distro: "nope", backend: "cuda", backend_version: "", upstream_flavor: "cpu", package_format: "rpm", package_manager: "bad", platforms: [] },
    { id: "duplicate", distro: "ubuntu", backend: "rocm", backend_version: "", upstream_flavor: "metal", package_base_image: "x", runtime_base_image: "y", package_format: "deb", package_manager: "apk", release_track: "bad", platforms: ["unknown"] },
    { id: "alpine", distro: "alpine", backend: "cpu", upstream_flavor: "cpu", package_base_image: "x", runtime_base_image: "y", package_format: "deb", platforms: ["linux/amd64"] },
    { id: "arch", distro: "arch", backend: "vulkan", upstream_flavor: "vulkan", package_base_image: "x", runtime_base_image: "y", package_format: "pkg.tar.zst", platforms: ["linux/arm64"] },
    { distro: "ubuntu", backend: "unknown", upstream_flavor: "cpu", package_base_image: "x", runtime_base_image: "y", package_format: "deb", platforms: ["linux/amd64"] },
    { id: "missing", package_base_image: "x", runtime_base_image: "y", platforms: ["linux/amd64"] },
    { id: "bad-flavor", distro: "ubuntu", backend: "cpu", upstream_flavor: "invalid", package_base_image: "x", runtime_base_image: "y", package_format: "deb", platforms: ["linux/amd64"] },
  ];
  const errors = validate(value).join("\n");
  for (const message of ["schema_version", "image.default_name", "homebrew", "duplicate variant", "backend_version", "upstream_flavor", "package_base_image", "package_format", "package_manager", "release_track", "Alpine", "unknown platform", "unsupported Arch", "id is required"]) assert.match(errors, new RegExp(message));
  const badNpm = config();
  badNpm.npm = {
    package_name: "bad",
    source_directory: "bad",
    registry: "bad",
    lanes: [
      { id: "duplicate", name: "", runner: "", backend: "cpu", target: "darwin-arm64" },
      { id: "duplicate", name: "bad", runner: "bad", backend: "metal", target: "darwin-arm64", matrix_enabled: false },
      { id: "unknown", name: "bad", runner: "bad", backend: "cpu", target: "other" },
      {},
    ],
  };
  const npmErrors = validate(badNpm).join("\n");
  for (const message of ["npm.package_name", "npm.source_directory", "npm.registry", "name is required", "runner is required", "duplicate npm lane", "duplicate npm target", "backend must be metal", "release_enabled must be false", "target must be one of", "must declare target win32-x64"]) {
    assert.match(npmErrors, new RegExp(message));
  }
  const missingNpmErrors = validate({ schema_version: 2, variants: [] });
  assert.match(missingNpmErrors.join("\n"), /npm\.lanes must be a non-empty list/);
  assert.match(missingNpmErrors.join("\n"), /variants must be a non-empty list/);
  const emptyNpm = config();
  emptyNpm.npm.lanes = [];
  assert.match(validate(emptyNpm).join("\n"), /npm\.lanes must be a non-empty list/);
});

test("CLI emits JSON and rejects invalid invocations", (t) => {
  assert.equal(cli(["validate"]).status, 0);
  assert.equal(cli(["github-matrix", "--version", "0.73.1", "--variant-filter", "ubuntu-cpu", "--platform-filter", "amd64"]).status, 0);
  assert.equal(cli(["upstream-matrix", "--version", "0.73.1"]).status, 0);
  assert.equal(cli(["homebrew-plan", "--version", "0.73.1"]).status, 0);
  assert.equal(cli(["npm-matrix", "--version", "0.73.1"]).status, 0);
  assert.equal(cli(["npm-plan", "--version", "0.73.1", "--lane-filter", "linux-x64"]).status, 0);
  assert.equal(cli([]).status, 1);
  assert.equal(cli(["unknown"]).status, 1);
  assert.equal(cli(["validate", "surprise"]).status, 1);
  assert.equal(cli(["github-matrix", "--version"]).status, 1);
  assert.equal(cli(["github-matrix"]).status, 1);
  assert.equal(cli(["github-matrix", "--include-experimental", "--version", "0.73.1", "--variant-filter", "missing"]).status, 1);
  assert.equal(cli(["npm-matrix"]).status, 1);
  assert.equal(cli(["npm-matrix", "--version", "0.73.1", "--lane-filter", "missing"]).status, 1);
  assert.equal(cli(["--config"]).status, 1);
  const path = tempConfig(t, { ...config(), schema_version: 1 });
  assert.equal(cli(["--config", path, "validate"]).status, 1);
  assert.equal(cli(["--config", path, "github-matrix", "--version", "0.73.1"]).status, 1);
  assert.equal(cli(["--config", path, "homebrew-plan", "--version", "0.73.1"]).status, 1);
  assert.equal(cli(["--config", path, "npm-matrix", "--version", "0.73.1"]).status, 1);
  assert.equal(main(["homebrew-plan"]), 1);
  const originalLog = console.log;
  console.log = () => { throw "non-error"; };
  try {
    assert.equal(main(["validate"]), 1);
  } finally {
    console.log = originalLog;
  }
});
