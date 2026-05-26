import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  backendSuffix,
  loadConfig,
  main,
  matrixRows,
  normalizeVersion,
  parseFilter,
  runnerLabels,
  stableStringify,
  validate,
} from "../scripts/image-matrix.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = resolve(ROOT, "scripts/image-matrix.ts");
const CONFIG = resolve(ROOT, "packaging/images.json");
const IMAGE = "ghcr.io/mesh-llm/mesh-llm";

function cli(args: string[]) {
  return spawnSync(process.execPath, ["--experimental-strip-types", SCRIPT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function validConfig() {
  return {
    schema_version: 1,
    image: {
      default_name: IMAGE,
      source_repository: "Mesh-LLM/mesh-llm",
      ui_base_image: "node:24-bookworm-slim",
    },
    platform_arches: {
      "linux/amd64": "amd64",
      "linux/arm64": "arm64",
    },
    variants: [
      {
        id: "ubuntu-cpu",
        distro: "ubuntu",
        distro_version: "24.04",
        backend: "cpu",
        backend_version: "",
        build_base_image: "ubuntu:24.04",
        package_base_image: "ubuntu:24.04",
        package_format: "deb",
        runtime_base_image: "ubuntu:24.04",
        platforms: ["linux/amd64", "linux/arm64"],
        cuda_architectures: "",
        rocm_architectures: "",
      },
    ],
  };
}

function tempConfig(t: { after(callback: () => void): void }, config: object): string {
  const directory = mkdtempSync(resolve(tmpdir(), "image-matrix-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = resolve(directory, "images.json");
  writeFileSync(path, `${JSON.stringify(config)}\n`);
  return path;
}

test("repository config validates and emits representative matrix rows", () => {
  const config = loadConfig(CONFIG);
  assert.deepEqual(validate(config), []);

  const rows = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    new Set(),
    new Set(),
    "github",
    false,
  );

  assert.ok(rows.length > 0);
  assert.equal(rows.some((row) => row.variant_id.startsWith("alpine-cuda")), false);
  assert.equal(rows.some((row) => row.variant_id.startsWith("alpine-rocm")), false);
  assert.equal(rows.some((row) => row.backend === "vulkan"), false);

  const armRow = rows.find((row) => row.variant_id === "ubuntu-cpu" && row.arch === "arm64");
  assert.ok(armRow);
  assert.equal(armRow.runner_labels, '"blacksmith-4vcpu-ubuntu-2404-arm"');
  assert.equal(armRow.binary_artifact_name, "mesh-llm-binary-0.66.0-ubuntu-cpu-arm64");
  assert.equal(armRow.llama_artifact_name, "mesh-llm-llama-0.66.0-ubuntu-cpu-arm64");
  assert.equal(armRow.native_package_artifact_name, "mesh-llm-package-0.66.0-ubuntu-cpu-arm64");
  assert.equal(armRow.tags, `${IMAGE}:0.66.0-ubuntu-arm64-cpu,${IMAGE}:ubuntu-arm64-cpu`);

  const archCudaRow = rows.find((row) => row.variant_id === "arch-cuda-13.2");
  assert.ok(archCudaRow);
  assert.equal(archCudaRow.backend_version, "13.2");
  assert.equal(archCudaRow.build_base_image, "arch-toolchain-cuda-13-2");
  assert.equal(archCudaRow.package_format, "pkg.tar.zst");
  assert.equal(archCudaRow.runner_labels, '"blacksmith-4vcpu-ubuntu-2404"');

  const carrackRows = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    new Set(),
    new Set(),
    "carrack",
    false,
  );
  assert.ok(carrackRows.length > 0);
  assert.equal(carrackRows.every((row) => row.platform === "linux/amd64"), true);
  assert.equal(carrackRows.every((row) => row.runner_labels === '["self-hosted","Linux","X64"]'), true);
});

test("matrix filters match variants, artifact ids, platforms, arches, and runner pools", () => {
  const config = loadConfig(CONFIG);

  const byVariant = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    parseFilter("arch-cpu"),
    parseFilter("amd64"),
    "carrack",
    false,
  );
  assert.equal(byVariant.length, 1);
  assert.equal(byVariant[0].artifact_id, "arch-cpu-amd64");
  assert.equal(byVariant[0].runner_labels, '["self-hosted","Linux","X64"]');

  const carrackArm64 = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    parseFilter("ubuntu-cpu"),
    parseFilter("arm64"),
    "carrack",
    false,
  );
  assert.deepEqual(carrackArm64, []);

  const byArtifactAndPlatform = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    parseFilter(" alpine-vulkan-arm64, "),
    parseFilter(" linux/arm64, "),
    "github",
    false,
  );
  assert.deepEqual(byArtifactAndPlatform, []);

  const experimentalByArtifactAndPlatform = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    parseFilter(" alpine-vulkan-arm64, "),
    parseFilter(" linux/arm64, "),
    "github",
    true,
  );
  assert.equal(experimentalByArtifactAndPlatform.length, 1);
  assert.equal(experimentalByArtifactAndPlatform[0].variant_id, "alpine-vulkan");
  assert.equal(experimentalByArtifactAndPlatform[0].platform, "linux/arm64");
  assert.equal(experimentalByArtifactAndPlatform[0].support_level, "experimental");

  const noMatches = matrixRows(
    config,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    parseFilter("does-not-exist"),
    new Set(),
    "github",
    false,
  );
  assert.deepEqual(noMatches, []);
});

test("release-disabled rows are only emitted when experimental rows are included", () => {
  const config = validConfig();
  config.variants.push({
    id: "ubuntu-vulkan-experimental",
    distro: "ubuntu",
    distro_version: "24.04",
    backend: "vulkan",
    backend_version: "",
    build_base_image: "ubuntu:24.04",
    package_base_image: "ubuntu:24.04",
    package_format: "deb",
    runtime_base_image: "ubuntu:24.04",
    platforms: ["linux/amd64"],
    cuda_architectures: "",
    rocm_architectures: "",
    support_level: "experimental",
    release_enabled: false,
    matrix_enabled: true,
  });

  assert.equal(
    matrixRows(config, IMAGE, "0.66.0", "v0.66.0", "Mesh-LLM/mesh-llm", new Set(), new Set(), "github", false)
      .some((row) => row.variant_id === "ubuntu-vulkan-experimental"),
    false,
  );
  assert.equal(
    matrixRows(config, IMAGE, "0.66.0", "v0.66.0", "Mesh-LLM/mesh-llm", new Set(), new Set(), "github", true)
      .some((row) => row.variant_id === "ubuntu-vulkan-experimental"),
    true,
  );

  config.variants.push({
    id: "ubuntu-cpu-disabled",
    distro: "ubuntu",
    distro_version: "24.04",
    backend: "cpu",
    backend_version: "",
    build_base_image: "ubuntu:24.04",
    package_base_image: "ubuntu:24.04",
    package_format: "deb",
    runtime_base_image: "ubuntu:24.04",
    platforms: ["linux/amd64"],
    cuda_architectures: "",
    rocm_architectures: "",
    matrix_enabled: false,
  });
  assert.equal(
    matrixRows(config, IMAGE, "0.66.0", "v0.66.0", "Mesh-LLM/mesh-llm", new Set(), new Set(), "github", true)
      .some((row) => row.variant_id === "ubuntu-cpu-disabled"),
    false,
  );
});

test("matrix rows use defaults for optional row fields", () => {
  const config = {
    schema_version: 1,
    image: {
      default_name: IMAGE,
      source_repository: "Mesh-LLM/mesh-llm",
      ui_base_image: "node:24-bookworm-slim",
    },
    platform_arches: {
      "linux/amd64": "amd64",
    },
    variants: [
      {
        id: "ubuntu-vulkan-minimal",
        distro: "ubuntu",
        distro_version: "24.04",
        backend: "vulkan",
        build_base_image: "ubuntu:24.04",
        package_base_image: "ubuntu:24.04",
        package_format: "deb",
        runtime_base_image: "ubuntu:24.04",
        platforms: ["linux/amd64"],
      },
    ],
  };

  assert.deepEqual(validate(config), []);
  const [row] = matrixRows(config, IMAGE, "0.66.0", "v0.66.0", "Mesh-LLM/mesh-llm", new Set(), new Set(), "github", false);
  assert.equal(row.backend_version, "");
  assert.equal(row.cuda_architectures, "");
  assert.equal(row.rocm_architectures, "");
  assert.equal(row.support_level, "supported");
  assert.equal(row.tags, `${IMAGE}:0.66.0-ubuntu-amd64-vulkan,${IMAGE}:ubuntu-amd64-vulkan`);

  const invalidRawConfig = {
    ...config,
    platform_arches: undefined,
    variants: [
      {
        id: "raw-missing-fields",
        distro_version: "24.04",
        package_format: "deb",
        build_base_image: "ubuntu:24.04",
        package_base_image: "ubuntu:24.04",
        runtime_base_image: "ubuntu:24.04",
        platforms: ["linux/amd64"],
      },
    ],
  };
  const [rawRow] = matrixRows(
    invalidRawConfig,
    IMAGE,
    "0.66.0",
    "v0.66.0",
    "Mesh-LLM/mesh-llm",
    new Set(),
    new Set(),
    "github",
    false,
  );
  assert.equal(rawRow.arch, undefined);
  assert.equal(rawRow.distro, "");
  assert.equal(rawRow.backend, "");
  assert.equal(rawRow.artifact_id, "raw-missing-fields-undefined");
});

test("helper functions normalize versions, suffixes, runner labels, filters, and stable JSON", () => {
  assert.equal(normalizeVersion(" refs/tags/v1.2.3-beta.1 "), "1.2.3-beta.1");
  assert.equal(normalizeVersion("refs/tags/1.2.3"), "1.2.3");
  assert.equal(normalizeVersion("v1.2.3"), "1.2.3");
  assert.equal(normalizeVersion("1.2.3"), "1.2.3");
  assert.throws(() => normalizeVersion("1.2"), /invalid mesh-llm version: 1\.2/);

  assert.equal(backendSuffix("cpu", "12.8"), "cpu");
  assert.equal(backendSuffix("cuda", "12.8"), "cuda12.8");
  assert.equal(backendSuffix("vulkan"), "vulkan");

  assert.deepEqual([...parseFilter(" amd64,linux/arm64,,amd64 ")], ["amd64", "linux/arm64"]);
  assert.equal(runnerLabels("linux/amd64", "github"), '"blacksmith-4vcpu-ubuntu-2404"');
  assert.equal(runnerLabels("linux/arm64", "github"), '"blacksmith-4vcpu-ubuntu-2404-arm"');
  assert.equal(runnerLabels("linux/amd64", "carrack"), '["self-hosted","Linux","X64"]');
  assert.equal(stableStringify({ b: 1, a: { d: 2, c: 3 } }), '{"a":{"c":3,"d":2},"b":1}');
  assert.equal(stableStringify([{ b: null, a: 1 }]), '[{"a":1,"b":null}]');
});

test("validation reports schema, variant, package, platform, Alpine, and Arch contract errors", () => {
  const config = validConfig();
  config.schema_version = 2;
  config.image.ui_base_image = "";
  config.variants = [
    {
      id: "dup",
      distro: "ubuntu",
      distro_version: "24.04",
      backend: "cpu",
      backend_version: "",
      build_base_image: "ubuntu:24.04",
      package_base_image: "ubuntu:24.04",
      package_format: "deb",
      runtime_base_image: "ubuntu:24.04",
      platforms: ["linux/amd64"],
      cuda_architectures: "",
      rocm_architectures: "",
    },
    {
      id: "dup",
      distro: "debian",
      distro_version: "12",
      backend: "metal",
      backend_version: "",
      build_base_image: "",
      package_base_image: "",
      package_format: "rpm",
      runtime_base_image: "",
      platforms: ["linux/s390x"],
      cuda_architectures: "",
      rocm_architectures: "",
    },
    {
      id: "ubuntu-cuda-no-version",
      distro: "ubuntu",
      distro_version: "24.04",
      backend: "cuda",
      backend_version: "",
      build_base_image: "ubuntu:24.04",
      package_base_image: "ubuntu:24.04",
      package_format: "apk",
      runtime_base_image: "ubuntu:24.04",
      platforms: ["linux/amd64"],
      cuda_architectures: "75",
      rocm_architectures: "",
    },
    {
      id: "alpine-cuda-12.8",
      distro: "alpine",
      distro_version: "3.21",
      backend: "cuda",
      backend_version: "12.8",
      build_base_image: "alpine:3.21",
      package_base_image: "alpine:3.21",
      package_format: "apk",
      runtime_base_image: "alpine:3.21",
      platforms: ["linux/amd64"],
      cuda_architectures: "75",
      rocm_architectures: "",
      support_level: "supported",
      release_enabled: true,
      matrix_enabled: true,
    },
    {
      id: "alpine-rocm-7.1",
      distro: "alpine",
      distro_version: "edge",
      backend: "rocm",
      backend_version: "7.1",
      build_base_image: "alpine:edge",
      package_base_image: "alpine:edge",
      package_format: "apk",
      runtime_base_image: "alpine:edge",
      platforms: ["linux/amd64"],
      cuda_architectures: "",
      rocm_architectures: "gfx1100",
      support_level: "supported",
      release_enabled: true,
      matrix_enabled: true,
    },
    {
      id: "arch-cpu",
      distro: "arch",
      distro_version: "rolling",
      backend: "cpu",
      backend_version: "",
      build_base_image: "alpine:3.21",
      package_base_image: "archlinux:base",
      package_format: "deb",
      runtime_base_image: "ubuntu:24.04",
      platforms: ["linux/arm64"],
      cuda_architectures: "",
      rocm_architectures: "",
    },
    {
      id: "arch-cpu",
      distro: "arch",
      distro_version: "rolling",
      backend: "cpu",
      backend_version: "",
      build_base_image: "arch-toolchain-cpu",
      package_base_image: "archlinux:base-devel",
      package_format: "pkg.tar.zst",
      runtime_base_image: "archlinux:base",
      platforms: ["linux/amd64", "linux/arm64"],
      cuda_architectures: "",
      rocm_architectures: "",
    },
    {
      id: "missing-fields",
      distro_version: "24.04",
      backend_version: "",
      build_base_image: "ubuntu:24.04",
      package_base_image: "ubuntu:24.04",
      runtime_base_image: "ubuntu:24.04",
      platforms: ["linux/amd64"],
      cuda_architectures: "",
      rocm_architectures: "",
    },
    {
      distro: "ubuntu",
      distro_version: "24.04",
      backend: "cpu",
      backend_version: "",
      build_base_image: "ubuntu:24.04",
      package_base_image: "ubuntu:24.04",
      package_format: "deb",
      runtime_base_image: "ubuntu:24.04",
      platforms: [],
      cuda_architectures: "",
      rocm_architectures: "",
    },
  ];

  assert.deepEqual(validate({ schema_version: 1, image: {}, variants: [] }), ["variants must be a non-empty list"]);

  const errors = validate(config);
  assert.ok(errors.includes("schema_version must be 1"));
  assert.ok(errors.includes("image.ui_base_image is required"));
  assert.ok(errors.includes("duplicate variant id: dup"));
  assert.ok(errors.includes("variants[1].distro must be one of ['alpine', 'arch', 'ubuntu']"));
  assert.ok(errors.includes("variants[1].backend must be one of ['cpu', 'cuda', 'rocm', 'vulkan']"));
  assert.ok(errors.includes("variants[1].build_base_image is required"));
  assert.ok(errors.includes("variants[1].package_base_image is required"));
  assert.ok(errors.includes("variants[1].runtime_base_image is required"));
  assert.ok(errors.includes("variants[1].package_format must be one of ['apk', 'deb', 'pkg.tar.zst']"));
  assert.ok(errors.includes("variants[1].platforms contains unknown platform: linux/s390x"));
  assert.ok(errors.includes("variants[2].backend_version is required for cuda"));
  assert.ok(errors.includes("variants[2].package_format must be deb for ubuntu"));
  assert.ok(errors.includes("variants[3] Alpine cuda rows must be support_level=experimental"));
  assert.ok(errors.includes("variants[3] Alpine cuda rows must be release_enabled=false"));
  assert.ok(errors.includes("variants[3] Alpine cuda rows must stay matrix_enabled=false until a real Alpine GPU toolchain image is validated"));
  assert.ok(errors.includes("variants[4] Alpine rocm rows must be support_level=experimental"));
  assert.ok(errors.includes("variants[4] Alpine rocm rows must be release_enabled=false"));
  assert.ok(errors.includes("variants[4] Alpine rocm rows must stay matrix_enabled=false until a real Alpine GPU toolchain image is validated"));
  assert.ok(errors.includes("variants[5].package_format must be pkg.tar.zst for arch"));
  assert.ok(errors.includes("variants[5].build_base_image must not use an Alpine base for Arch rows"));
  assert.ok(errors.includes("variants[5].build_base_image must be arch-toolchain-cpu for arch-cpu"));
  assert.ok(errors.includes("variants[5].package_base_image must be archlinux:base-devel for arch-cpu"));
  assert.ok(errors.includes("variants[5].runtime_base_image must be archlinux:base for arch-cpu"));
  assert.ok(errors.includes("variants[5].package_format must be pkg.tar.zst for arch-cpu"));
  assert.ok(errors.includes("variants[5].platforms must be ['linux/amd64'] for arch-cpu"));
  assert.ok(errors.includes("variants[5].platforms contains unsupported Arch platform: linux/arm64"));
  assert.ok(errors.includes("variants[6].platforms must be ['linux/amd64'] for arch-cpu"));
  assert.ok(errors.includes("variants[6].platforms contains unsupported Arch platform: linux/arm64"));
  assert.ok(errors.includes("variants[7].distro must be one of ['alpine', 'arch', 'ubuntu']"));
  assert.ok(errors.includes("variants[7].backend must be one of ['cpu', 'cuda', 'rocm', 'vulkan']"));
  assert.ok(errors.includes("variants[7].package_format must be one of ['apk', 'deb', 'pkg.tar.zst']"));
  assert.ok(errors.includes("variants[8].id is required"));
  assert.ok(errors.includes("variants[8].platforms must be a non-empty list"));
});

test("validation handles absent optional config containers", () => {
  assert.deepEqual(validate({}), ["schema_version must be 1", "variants must be a non-empty list"]);

  const noImageConfig = validConfig();
  delete noImageConfig.image;
  assert.deepEqual(validate(noImageConfig), ["image.ui_base_image is required"]);

  const config = validConfig();
  delete config.platform_arches;
  assert.deepEqual(validate(config), ["variants[0].platforms contains unknown platform: linux/amd64", "variants[0].platforms contains unknown platform: linux/arm64"]);

  const nonArrayPlatforms = validConfig();
  nonArrayPlatforms.variants[0].platforms = "linux/amd64";
  assert.deepEqual(validate(nonArrayPlatforms), ["variants[0].platforms must be a non-empty list"]);

  const nonStringPlatform = validConfig();
  nonStringPlatform.variants[0].platforms = [42];
  assert.deepEqual(validate(nonStringPlatform), ["variants[0].platforms contains unknown platform: 42"]);

  const invalidDistroWithKnownPackageFormat = validConfig();
  invalidDistroWithKnownPackageFormat.variants[0].distro = "debian";
  assert.deepEqual(validate(invalidDistroWithKnownPackageFormat), ["variants[0].distro must be one of ['alpine', 'arch', 'ubuntu']"]);
});

test("CLI validates, emits JSON, reports expected failures, and handles config overrides", (t) => {
  const validateResult = cli(["validate"]);
  assert.equal(validateResult.status, 0, validateResult.stderr);
  assert.match(validateResult.stdout, /validated 20 image variants/);

  const matrixResult = cli([
    "github-matrix",
    "--version",
    "refs/tags/v0.66.0",
    "--image",
    IMAGE,
    "--mesh-ref",
    "custom-ref",
    "--mesh-repository",
    "custom/repo",
    "--variant-filter",
    "ubuntu-cpu",
    "--platform-filter",
    "amd64",
  ]);
  assert.equal(matrixResult.status, 0, matrixResult.stderr);
  const matrix = JSON.parse(matrixResult.stdout);
  assert.equal(matrix.include.length, 1);
  assert.equal(matrix.include[0].mesh_version, "0.66.0");
  assert.equal(matrix.include[0].mesh_ref, "custom-ref");
  assert.equal(matrix.include[0].mesh_repository, "custom/repo");

  const defaultOptionMatrixResult = cli(["github-matrix", "--version", "v0.66.0", "--variant-filter", "arch-cpu"]);
  assert.equal(defaultOptionMatrixResult.status, 0, defaultOptionMatrixResult.stderr);
  const defaultOptionMatrix = JSON.parse(defaultOptionMatrixResult.stdout);
  assert.equal(defaultOptionMatrix.include[0].mesh_ref, "v0.66.0");
  assert.equal(defaultOptionMatrix.include[0].mesh_repository, "Mesh-LLM/mesh-llm");
  assert.match(defaultOptionMatrix.include[0].tags, /^ghcr\.io\/mesh-llm\/mesh-llm:/);

  const unfilteredMatrixResult = cli(["github-matrix", "--version", "v0.66.0"]);
  assert.equal(unfilteredMatrixResult.status, 0, unfilteredMatrixResult.stderr);
  assert.ok(JSON.parse(unfilteredMatrixResult.stdout).include.length > 1);

  const uiBaseImageResult = cli(["ui-base-image"]);
  assert.equal(uiBaseImageResult.status, 0, uiBaseImageResult.stderr);
  assert.equal(uiBaseImageResult.stdout.trim(), "node:24-bookworm-slim");

  const badVersionResult = cli(["github-matrix", "--version", "bad"]);
  assert.equal(badVersionResult.status, 1);
  assert.match(badVersionResult.stderr, /invalid mesh-llm version: bad/);

  const missingVersionResult = cli(["github-matrix"]);
  assert.equal(missingVersionResult.status, 1);
  assert.match(missingVersionResult.stderr, /--version is required/);

  const badRunnerResult = cli(["github-matrix", "--version", "v0.66.0", "--runner", "local"]);
  assert.equal(badRunnerResult.status, 1);
  assert.match(badRunnerResult.stderr, /invalid runner: local/);

  const emptyMatrixResult = cli([
    "github-matrix",
    "--version",
    "v0.66.0",
    "--variant-filter",
    "alpine-rocm-7.1",
    "--platform-filter",
    "amd64",
    "--include-experimental",
  ]);
  assert.equal(emptyMatrixResult.status, 1);
  assert.match(emptyMatrixResult.stderr, /matrix filters matched no rows/);

  const defaultVulkanMatrixResult = cli(["github-matrix", "--version", "v0.66.0", "--variant-filter", "ubuntu-vulkan"]);
  assert.equal(defaultVulkanMatrixResult.status, 1);
  assert.match(defaultVulkanMatrixResult.stderr, /matrix filters matched no rows/);

  const experimentalVulkanMatrixResult = cli([
    "github-matrix",
    "--version",
    "v0.66.0",
    "--variant-filter",
    "ubuntu-vulkan",
    "--include-experimental",
  ]);
  assert.equal(experimentalVulkanMatrixResult.status, 0, experimentalVulkanMatrixResult.stderr);
  assert.equal(JSON.parse(experimentalVulkanMatrixResult.stdout).include.length, 2);

  const unknownCommandResult = cli(["not-a-command"]);
  assert.equal(unknownCommandResult.status, 2);
  assert.match(unknownCommandResult.stderr, /unknown command: not-a-command/);

  const missingArgValueResult = cli(["--config"]);
  assert.equal(missingArgValueResult.status, 2);
  assert.match(missingArgValueResult.stderr, /--config requires a value/);

  const missingOptionValueResult = cli(["github-matrix", "--version"]);
  assert.equal(missingOptionValueResult.status, 2);
  assert.match(missingOptionValueResult.stderr, /--version requires a value/);

  const missingOptionValueBeforeFlagResult = cli(["github-matrix", "--version", "--image", IMAGE]);
  assert.equal(missingOptionValueBeforeFlagResult.status, 2);
  assert.match(missingOptionValueBeforeFlagResult.stderr, /--version requires a value/);

  const unexpectedArgumentResult = cli(["validate", "unexpected"]);
  assert.equal(unexpectedArgumentResult.status, 2);
  assert.match(unexpectedArgumentResult.stderr, /unexpected argument: unexpected/);

  const emptyConfigValueResult = cli(["--config", ""]);
  assert.equal(emptyConfigValueResult.status, 2);
  assert.match(emptyConfigValueResult.stderr, /--config requires a value/);

  const invalidConfig = validConfig();
  invalidConfig.schema_version = 2;
  const invalidConfigPath = tempConfig(t, invalidConfig);

  const invalidValidateResult = cli(["--config", invalidConfigPath, "validate"]);
  assert.equal(invalidValidateResult.status, 1);
  assert.match(invalidValidateResult.stderr, /schema_version must be 1/);

  const invalidMatrixResult = cli(["--config", invalidConfigPath, "github-matrix", "--version", "v0.66.0"]);
  assert.equal(invalidMatrixResult.status, 1);
  assert.match(invalidMatrixResult.stderr, /schema_version must be 1/);

  const invalidUiConfig = validConfig();
  invalidUiConfig.image.ui_base_image = "";
  const invalidUiConfigPath = tempConfig(t, invalidUiConfig);
  const uiBaseImageFailure = cli(["--config", invalidUiConfigPath, "ui-base-image"]);
  assert.equal(uiBaseImageFailure.status, 1);
  assert.match(uiBaseImageFailure.stderr, /image\.ui_base_image is required/);
});

test("main returns parser and command exit codes without exiting the test process", (t) => {
  const configPath = tempConfig(t, validConfig());
  const originalLog = console.log;
  const originalError = console.error;
  const logs: string[] = [];
  const errors: string[] = [];
  console.log = (message?: unknown) => {
    logs.push(String(message));
  };
  console.error = (message?: unknown) => {
    errors.push(String(message));
  };
  t.after(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  assert.equal(main(["--config", configPath, "validate"]), 0);
  assert.equal(main(["github-matrix", "--version", "bad"]), 1);
  assert.equal(main(["--config"]), 2);
  assert.equal(main([]), 2);

  assert.ok(logs.includes("validated 1 image variants"));
  assert.ok(errors.includes("invalid mesh-llm version: bad"));
  assert.ok(errors.includes("--config requires a value"));
  assert.ok(errors.includes("a command is required"));
});

test("module import guard skips CLI execution when argv[1] is absent", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "--eval",
      "process.argv[1] = ''; await import('./scripts/image-matrix.ts');",
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});
