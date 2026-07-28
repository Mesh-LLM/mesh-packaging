import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import {
  assembleNodeSdk,
  main,
  parseArgs,
  stagePackageMetadata,
  validatePackageMetadata,
} from "../scripts/node-sdk-package.ts";

function fixture(t: { after(callback: () => void): void }) {
  const root = mkdtempSync(resolve(tmpdir(), "node-sdk-package-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const sourceRoot = join(root, "source");
  const sourceDir = join(sourceRoot, "sdk", "node");
  const addonRoot = join(root, "addons");
  const outputDir = join(root, "output");
  mkdirSync(join(sourceDir, "native", "old"), { recursive: true });
  mkdirSync(join(sourceDir, "node_modules", "ignored"), { recursive: true });
  writeFileSync(join(sourceRoot, "LICENSE"), "fixture license\n");
  writeFileSync(join(sourceDir, "index.js"), "module.exports = { fixture: true }\n");
  writeFileSync(join(sourceDir, "native", "old", "mesh_llm_nodejs.node"), "old");
  writeFileSync(join(sourceDir, "node_modules", "ignored", "index.js"), "ignored");
  writeFileSync(join(sourceDir, "package.json"), JSON.stringify({
    name: "@mesh-llm/sdk",
    version: "1.2.3",
    main: "index.js",
    files: ["index.js", "native/", "LICENSE"],
    repository: {
      type: "git",
      url: "git+https://github.com/Mesh-LLM/mesh-packaging.git",
    },
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
  }));
  for (const target of ["darwin-arm64", "linux-x64"]) {
    mkdirSync(join(addonRoot, target), { recursive: true });
    writeFileSync(join(addonRoot, target, "mesh_llm_nodejs.node"), `fixture:${target}`);
  }
  return { addonRoot, outputDir, root, sourceRoot };
}

test("assembles exactly the selected npm targets into a packable package", (t) => {
  const paths = fixture(t);
  assembleNodeSdk({
    addonRoot: paths.addonRoot,
    expectedVersion: "1.2.3",
    outputDir: paths.outputDir,
    sourceRoot: paths.sourceRoot,
    targets: ["darwin-arm64", "linux-x64"],
  });
  assert.equal(readFileSync(join(paths.outputDir, "LICENSE"), "utf8"), "fixture license\n");
  assert.equal(existsSync(join(paths.outputDir, "native", "old")), false);
  assert.equal(existsSync(join(paths.outputDir, "node_modules")), false);
  const packed = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: paths.outputDir,
    encoding: "utf8",
  });
  assert.equal(packed.status, 0, packed.stderr);
  const files = new Set(JSON.parse(packed.stdout)[0].files.map((entry: { path: string }) => entry.path));
  assert.equal(files.has("native/darwin-arm64/mesh_llm_nodejs.node"), true);
  assert.equal(files.has("native/linux-x64/mesh_llm_nodejs.node"), true);
});

test("stages canonical publish metadata for immutable upstream packages", (t) => {
  const paths = fixture(t);
  const sourcePackagePath = join(paths.sourceRoot, "sdk", "node", "package.json");
  const sourcePackage = JSON.parse(readFileSync(sourcePackagePath, "utf8"));
  sourcePackage.name = "@meshllm/sdk";
  sourcePackage.version = "0.74.0";
  delete sourcePackage.repository;
  delete sourcePackage.publishConfig;
  writeFileSync(sourcePackagePath, JSON.stringify(sourcePackage));

  assembleNodeSdk({
    addonRoot: paths.addonRoot,
    expectedVersion: "0.74.0",
    outputDir: paths.outputDir,
    sourceRoot: paths.sourceRoot,
    targets: ["linux-x64"],
  });

  const stagedPackage = JSON.parse(readFileSync(join(paths.outputDir, "package.json"), "utf8"));
  assert.equal(stagedPackage.name, "@mesh-llm/sdk");
  assert.deepEqual(stagedPackage.repository, {
    type: "git",
    url: "git+https://github.com/Mesh-LLM/mesh-packaging.git",
  });
  assert.deepEqual(stagedPackage.publishConfig, {
    access: "public",
    registry: "https://registry.npmjs.org/",
  });
  const unchangedSourcePackage = JSON.parse(readFileSync(sourcePackagePath, "utf8"));
  assert.equal(unchangedSourcePackage.name, "@meshllm/sdk");
  assert.equal(unchangedSourcePackage.repository, undefined);
  assert.equal(unchangedSourcePackage.publishConfig, undefined);
});

test("argument and artifact validation rejects incomplete packages", (t) => {
  const paths = fixture(t);
  const options = parseArgs([
    "--source-root", paths.sourceRoot,
    "--addon-root", paths.addonRoot,
    "--output-dir", paths.outputDir,
    "--expected-version", "1.2.3",
    "--targets", "linux-x64,darwin-arm64",
  ]);
  assert.deepEqual(options.targets, ["linux-x64", "darwin-arm64"]);
  assert.throws(() => parseArgs(["--source-root"]), /invalid argument/);
  assert.throws(() => parseArgs(["--targets", ","]), /unique comma-separated/);
  assert.throws(() => parseArgs(["--targets", "linux-x64,linux-x64"]), /unique comma-separated/);

  writeFileSync(join(paths.outputDir), "");
  assert.equal(main([]), 1);
});

test("assembly validates output, targets, addons, and package metadata", (t) => {
  const paths = fixture(t);
  const valid = {
    name: "@mesh-llm/sdk",
    version: "1.2.3",
    main: "index.js",
    files: ["index.js", "native/", "LICENSE"],
    repository: {
      type: "git",
      url: "git+https://github.com/Mesh-LLM/mesh-packaging.git",
    },
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
  };
  assert.deepEqual(stagePackageMetadata({ ...valid, repository: undefined }).repository, valid.repository);
  assert.equal(stagePackageMetadata({
    ...valid,
    name: "@meshllm/sdk",
    version: "0.74.0",
  }).name, "@mesh-llm/sdk");
  assert.throws(() => stagePackageMetadata({ ...valid, name: "@meshllm/sdk" }), /unexpected/);
  assert.throws(() => stagePackageMetadata({ ...valid, name: "@other/sdk" }), /unexpected/);
  assert.throws(() => stagePackageMetadata({
    ...valid,
    repository: {
      ...valid.repository,
      url: "git+https://github.com/Mesh-LLM/mesh-llm.git",
    },
  }), /repository metadata/);
  assert.throws(() => stagePackageMetadata({
    ...valid,
    publishConfig: {
      ...valid.publishConfig,
      registry: "https://npm.pkg.github.com/",
    },
  }), /publishConfig/);
  assert.doesNotThrow(() => validatePackageMetadata(valid, "1.2.3"));
  assert.throws(() => validatePackageMetadata({
    ...valid,
    repository: {
      ...valid.repository,
      url: "git+https://github.com/Mesh-LLM/mesh-llm.git",
    },
  }, "1.2.3"), /repository metadata/);
  assert.throws(() => validatePackageMetadata({
    ...valid,
    repository: {
      type: "git",
      url: "git+https://github.com/Mesh-LLM/mesh-packaging.git",
      directory: "sdk/node",
    },
  }, "1.2.3"), /repository metadata/);
  assert.throws(() => validatePackageMetadata({
    ...valid,
    repository: {
      ...valid.repository,
      directory: "sdk/node",
    },
  }, "1.2.3"), /repository metadata/);

  const base = {
    addonRoot: paths.addonRoot,
    expectedVersion: "1.2.3",
    sourceRoot: paths.sourceRoot,
  };
  assert.throws(() => assembleNodeSdk({
    ...base,
    outputDir: join(paths.root, "missing-output"),
    targets: ["linux-arm64"],
  }), /missing non-empty/);
  assert.throws(() => assembleNodeSdk({
    ...base,
    outputDir: join(paths.root, "invalid-output"),
    targets: ["other-x64"],
  }), /invalid Node SDK target/);
  mkdirSync(paths.outputDir);
  writeFileSync(join(paths.outputDir, "occupied"), "x");
  assert.throws(() => assembleNodeSdk({
    ...base,
    outputDir: paths.outputDir,
    targets: ["linux-x64"],
  }), /must be empty/);

  assert.throws(() => validatePackageMetadata({ ...valid, name: "bad" }, "1.2.3"), /unexpected/);
  assert.throws(() => validatePackageMetadata({ ...valid, version: "1.2.4" }, "1.2.3"), /version mismatch/);
  assert.throws(() => validatePackageMetadata({ ...valid, publishConfig: {} }, "1.2.3"), /publishConfig/);
});
