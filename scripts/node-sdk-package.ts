#!/usr/bin/env -S node --experimental-strip-types
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Options = {
  addonRoot: string;
  expectedVersion: string;
  outputDir: string;
  sourceRoot: string;
  targets: string[];
};

type PackageMetadata = {
  name?: unknown;
  version?: unknown;
  repository?: {
    url?: unknown;
    directory?: unknown;
  };
  publishConfig?: {
    access?: unknown;
    registry?: unknown;
  };
};

const CANONICAL_PACKAGE_NAME = "@mesh-llm/sdk";
const LEGACY_PACKAGE_NAME = "@meshllm/sdk";

const CANONICAL_REPOSITORY = {
  type: "git",
  url: "git+https://github.com/Mesh-LLM/mesh-packaging.git",
} as const;

const CANONICAL_PUBLISH_CONFIG = {
  access: "public",
  registry: "https://registry.npmjs.org/",
} as const;

export function parseArgs(argv: string[]): Options {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!name?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`invalid argument near ${name ?? "<end>"}`);
    }
    values.set(name.slice(2), value);
  }
  const required = (name: string) => {
    const value = values.get(name);
    if (!value) throw new Error(`--${name} is required`);
    return value;
  };
  const targets = required("targets").split(",").map((target) => target.trim()).filter(Boolean);
  if (targets.length === 0 || new Set(targets).size !== targets.length) {
    throw new Error("--targets must contain unique comma-separated targets");
  }
  return {
    addonRoot: resolve(required("addon-root")),
    expectedVersion: required("expected-version"),
    outputDir: resolve(required("output-dir")),
    sourceRoot: resolve(required("source-root")),
    targets,
  };
}

export function assembleNodeSdk(options: Options): void {
  const sourceDir = join(options.sourceRoot, "sdk", "node");
  const sourceNativeDir = join(sourceDir, "native");
  const sourceModulesDir = join(sourceDir, "node_modules");
  if (existsSync(options.outputDir) && readdirSync(options.outputDir).length > 0) {
    throw new Error(`output directory must be empty: ${options.outputDir}`);
  }

  const packageJson = stagePackageMetadata(
    JSON.parse(readFileSync(join(sourceDir, "package.json"), "utf8")),
  );
  validatePackageMetadata(packageJson, options.expectedVersion);

  mkdirSync(options.outputDir, { recursive: true });
  cpSync(sourceDir, options.outputDir, {
    recursive: true,
    filter: (source) => ![sourceNativeDir, sourceModulesDir].includes(resolve(source)),
  });
  writeFileSync(
    join(options.outputDir, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  copyFileSync(join(options.sourceRoot, "LICENSE"), join(options.outputDir, "LICENSE"));

  for (const target of options.targets) {
    if (!/^(darwin|linux|win32)-(arm64|x64)$/.test(target)) {
      throw new Error(`invalid Node SDK target: ${target}`);
    }
    const source = join(options.addonRoot, target, "mesh_llm_nodejs.node");
    if (!existsSync(source) || statSync(source).size === 0) {
      throw new Error(`missing non-empty Node SDK addon: ${source}`);
    }
    const destination = join(options.outputDir, "native", target, basename(source));
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }

  console.log(`prepared ${packageJson.name}@${packageJson.version} in ${options.outputDir}`);
  console.log(`included native addons: ${options.targets.join(", ")}`);
}

export function stagePackageMetadata(packageJson: PackageMetadata): PackageMetadata {
  const isBootstrapPackage =
    packageJson.name === LEGACY_PACKAGE_NAME && packageJson.version === "0.74.0";
  if (packageJson.name !== CANONICAL_PACKAGE_NAME && !isBootstrapPackage) {
    throw new Error(`unexpected Node SDK package name: ${packageJson.name}`);
  }
  if (packageJson.repository !== undefined &&
      (packageJson.repository?.url !== CANONICAL_REPOSITORY.url ||
       packageJson.repository?.directory !== undefined)) {
    throw new Error("Node SDK repository metadata must identify Mesh-LLM/mesh-packaging");
  }
  if (packageJson.publishConfig !== undefined &&
      (packageJson.publishConfig?.access !== CANONICAL_PUBLISH_CONFIG.access ||
       packageJson.publishConfig?.registry !== CANONICAL_PUBLISH_CONFIG.registry)) {
    throw new Error("Node SDK publishConfig must target the public npm registry");
  }
  return {
    ...packageJson,
    name: CANONICAL_PACKAGE_NAME,
    repository: { ...CANONICAL_REPOSITORY },
    publishConfig: { ...CANONICAL_PUBLISH_CONFIG },
  };
}

export function validatePackageMetadata(packageJson: PackageMetadata, expectedVersion: string): void {
  if (packageJson.name !== CANONICAL_PACKAGE_NAME) {
    throw new Error(`unexpected Node SDK package name: ${packageJson.name}`);
  }
  if (packageJson.version !== expectedVersion || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
    throw new Error(`Node SDK version mismatch: expected ${expectedVersion}, got ${packageJson.version}`);
  }
  if (packageJson.repository?.url !== "git+https://github.com/Mesh-LLM/mesh-packaging.git" ||
      packageJson.repository?.directory !== undefined) {
    throw new Error("Node SDK repository metadata must identify Mesh-LLM/mesh-packaging");
  }
  if (packageJson.publishConfig?.access !== "public" ||
      packageJson.publishConfig?.registry !== "https://registry.npmjs.org/") {
    throw new Error("Node SDK publishConfig must target the public npm registry");
  }
}

export function main(argv: string[]): number {
  try {
    assembleNodeSdk(parseArgs(argv));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
