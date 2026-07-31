import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../scripts/image-matrix.ts";
import {
  type ReleasePlanInput,
  buildReleasePlan,
  exactSelection,
  main,
} from "../scripts/release-plan.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = resolve(ROOT, "packaging/images.json");
const SCRIPT = resolve(ROOT, "scripts/release-plan.ts");

function config() {
  return JSON.parse(JSON.stringify(loadConfig(CONFIG)));
}

function input(overrides: Partial<ReleasePlanInput> = {}): ReleasePlanInput {
  return {
    dry_run: true,
    native_selector: "all",
    npm_selector: "all",
    publish_images: false,
    publish_npm: false,
    publish_release_assets: false,
    validate_homebrew: false,
    validate_native: true,
    validate_npm: false,
    version: "v0.73.1",
    ...overrides,
  };
}

function cliArgs(overrides: Record<string, string> = {}): string[] {
  const values: Record<string, string> = {
    "dry-run": "true",
    "native-selector": "ubuntu-cpu-amd64",
    "npm-selector": "all",
    "publish-images": "false",
    "publish-npm": "false",
    "publish-release-assets": "false",
    "validate-homebrew": "false",
    "validate-native": "true",
    "validate-npm": "false",
    version: "0.73.1",
    ...overrides,
  };
  return Object.entries(values).flatMap(([name, value]) => [`--${name}`, value]);
}

function cli(args: string[]) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", SCRIPT, ...args],
    { cwd: ROOT, encoding: "utf8" },
  );
}

test("a selected native canary enables only its exact producer graph", () => {
  const plan = buildReleasePlan(config(), input({ native_selector: "ubuntu-cpu-amd64" }));
  assert.equal(plan.schema_version, 1);
  assert.equal(plan.native_enabled, true);
  assert.equal(plan.homebrew_enabled, false);
  assert.equal(plan.npm_enabled, false);
  assert.deepEqual(plan.package_matrix.include.map((row) => row.artifact_id), ["ubuntu-cpu-amd64"]);
  assert.equal(plan.upstream_matrix.include.length, 1);
  assert.deepEqual(plan.npm_matrix.include, []);
  assert.equal(plan.release_assembly_enabled, false);
});

test("Homebrew-only validation leaves native and npm matrices empty", () => {
  const plan = buildReleasePlan(config(), input({
    validate_homebrew: true,
    validate_native: false,
  }));
  assert.equal(plan.homebrew_enabled, true);
  assert.deepEqual(plan.package_matrix.include, []);
  assert.deepEqual(plan.upstream_matrix.include, []);
  assert.deepEqual(plan.npm_matrix.include, []);
  assert.equal(plan.homebrew_plan.target, "aarch64-apple-darwin");
});

test("an exact npm canary enables one lane without native or Homebrew", () => {
  const plan = buildReleasePlan(config(), input({
    npm_selector: "node-sdk-linux-x64",
    validate_native: false,
    validate_npm: true,
  }));
  assert.equal(plan.native_enabled, false);
  assert.equal(plan.homebrew_enabled, false);
  assert.equal(plan.npm_enabled, true);
  assert.deepEqual(plan.npm_matrix.include.map((row) => row.id), ["node-sdk-linux-x64"]);
  assert.deepEqual(plan.npm_plan.targets, ["linux-x64"]);
});

test("a full rehearsal deterministically includes every release row", () => {
  const value = input({
    image: "ghcr.io/mesh-llm/custom",
    mesh_ref: "refs/tags/v0.73.1",
    mesh_repository: "Mesh-LLM/mesh-llm",
    validate_homebrew: true,
    validate_npm: true,
  });
  const first = buildReleasePlan(config(), value);
  const second = buildReleasePlan(config(), value);
  assert.deepEqual(first, second);
  assert.equal(first.package_matrix.include.length, 11);
  assert.equal(first.upstream_matrix.include.length, 8);
  assert.equal(first.npm_matrix.include.length, 5);
  assert.equal(first.release_assembly_enabled, true);
  assert.deepEqual(first.native_selection.mode, "all");
  assert.deepEqual(first.npm_selection.mode, "all");
  const partial = buildReleasePlan(config(), input({
    native_selector: "ubuntu-cpu-amd64",
    validate_homebrew: true,
  }));
  assert.equal(partial.release_assembly_enabled, false);
});

test("selectors reject unknown IDs, aliases, empty tokens, duplicates, and mixed all", () => {
  const available = ["ubuntu-cpu-amd64", "ubuntu-cpu-arm64"];
  for (const value of [
    "missing",
    "ubuntu-cpu",
    "amd64",
    "linux/amd64",
    "",
    "ubuntu-cpu-amd64,",
    "ubuntu-cpu-amd64,,ubuntu-cpu-arm64",
    "ubuntu-cpu-amd64,ubuntu-cpu-amd64",
    "all,ubuntu-cpu-amd64",
  ]) {
    assert.throws(() => exactSelection(value, available, "native"));
  }
  assert.throws(() => buildReleasePlan(config(), input({
    npm_selector: "linux-x64",
    validate_native: false,
    validate_npm: true,
  })), /unknown exact id/);
  assert.deepEqual(
    exactSelection(" ubuntu-cpu-arm64 , ubuntu-cpu-amd64 ", available, "native"),
    { ids: ["ubuntu-cpu-arm64", "ubuntu-cpu-amd64"], mode: "selected" },
  );
});

test("disabled components require all selectors and at least one component", () => {
  assert.throws(() => buildReleasePlan(config(), input({
    native_selector: "ubuntu-cpu-amd64",
    validate_native: false,
    validate_homebrew: true,
  })), /native selector must be all/);
  assert.throws(() => buildReleasePlan(config(), input({
    npm_selector: "node-sdk-linux-x64",
  })), /npm selector must be all/);
  assert.throws(() => buildReleasePlan(config(), input({
    validate_native: false,
  })), /at least one validation component/);
});

test("image publication requires the complete native producer set", () => {
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    native_selector: "ubuntu-cpu-amd64",
    publish_images: true,
  })), /complete native validation/);
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    publish_images: true,
    validate_homebrew: true,
    validate_native: false,
  })), /complete native validation/);
});

test("release asset publication requires complete native and Homebrew validation", () => {
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    publish_release_assets: true,
    validate_homebrew: true,
    validate_native: false,
  })), /complete native and Homebrew validation/);
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    publish_release_assets: true,
  })), /complete native and Homebrew validation/);
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    native_selector: "ubuntu-cpu-amd64",
    publish_release_assets: true,
    validate_homebrew: true,
  })), /complete native and Homebrew validation/);
});

test("npm publication requires every upstream addon lane", () => {
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    publish_npm: true,
  })), /complete npm validation/);
  assert.throws(() => buildReleasePlan(config(), input({
    dry_run: false,
    npm_selector: "node-sdk-linux-x64",
    publish_npm: true,
    validate_native: false,
    validate_npm: true,
  })), /complete npm validation/);
});

test("dry run forces publication off without changing selected validation", () => {
  const plan = buildReleasePlan(config(), input({
    native_selector: "ubuntu-cpu-amd64",
    publish_images: true,
    publish_npm: true,
    publish_release_assets: true,
  }));
  assert.equal(plan.publish_images, false);
  assert.equal(plan.publish_npm, false);
  assert.equal(plan.publish_release_assets, false);
  assert.equal(plan.package_matrix.include.length, 1);
});

test("a production dispatch plan enables all required publication inputs", () => {
  const plan = buildReleasePlan(config(), input({
    dry_run: false,
    publish_images: true,
    publish_npm: true,
    publish_release_assets: true,
    validate_homebrew: true,
    validate_npm: true,
  }));
  assert.equal(plan.publish_images, true);
  assert.equal(plan.publish_npm, true);
  assert.equal(plan.publish_release_assets, true);
  assert.equal(plan.release_assembly_enabled, true);
  const withoutNpm = buildReleasePlan(config(), input({
    dry_run: false,
    publish_images: true,
    publish_npm: false,
    publish_release_assets: true,
    validate_homebrew: true,
  }));
  assert.equal(withoutNpm.npm_enabled, false);
  assert.equal(withoutNpm.publish_npm, false);
});

test("invalid configuration and runtime boolean types fail closed", () => {
  const invalid = config();
  invalid.schema_version = 0;
  assert.throws(() => buildReleasePlan(invalid, input()), /schema_version/);
  for (const name of [
    "dry_run",
    "publish_images",
    "publish_npm",
    "publish_release_assets",
    "validate_homebrew",
    "validate_native",
    "validate_npm",
  ] as const) {
    assert.throws(() => buildReleasePlan(config(), {
      ...input(),
      [name]: "true" as unknown as boolean,
    }), new RegExp(`${name} must be boolean`));
  }
});

test("CLI emits deterministic schema JSON and rejects malformed options", () => {
  const result = cli([
    "--config",
    CONFIG,
    ...cliArgs({
      image: "ghcr.io/mesh-llm/custom",
      "mesh-ref": "v0.73.1",
      "mesh-repository": "Mesh-LLM/mesh-llm",
    }),
  ]);
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.schema_version, 1);
  assert.deepEqual(Object.keys(plan), [...Object.keys(plan)].sort());
  assert.equal(main(cliArgs()), 0);

  const invalidArguments = [
    cliArgs({ "dry-run": "yes" }),
    cliArgs({ unknown: "value" }),
    ["value"],
    ["--version"],
    ["--version", "--dry-run"],
    [...cliArgs(), "--version", "0.73.1"],
    cliArgs({ "native-selector": "" }),
  ];
  for (const args of invalidArguments) {
    assert.notEqual(cli(args).status, 0);
  }
  const originalError = console.error;
  console.error = () => {};
  try {
    for (const args of invalidArguments) assert.equal(main(args), 1);
    assert.equal(main([
      "--config",
      CONFIG,
      ...cliArgs({
        image: "ghcr.io/mesh-llm/custom",
        "mesh-ref": "v0.73.1",
        "mesh-repository": "Mesh-LLM/mesh-llm",
      }),
    ]), 0);
  } finally {
    console.error = originalError;
  }
  const originalLog = console.log;
  console.log = () => { throw "non-error"; };
  try {
    assert.equal(main(cliArgs()), 1);
  } finally {
    console.log = originalLog;
  }
});
