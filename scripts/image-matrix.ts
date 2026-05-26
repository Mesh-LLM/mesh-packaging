#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type JsonObject = Record<string, unknown>;

type ImageConfig = {
  default_name?: string;
  source_repository?: string;
  ui_base_image?: string;
};

type Variant = {
  id?: string;
  distro?: string;
  distro_version?: string;
  backend?: string;
  backend_version?: string;
  build_base_image?: string;
  package_base_image?: string;
  package_format?: string;
  runtime_base_image?: string;
  platforms?: unknown;
  cuda_architectures?: string;
  rocm_architectures?: string;
  support_level?: string;
  release_enabled?: boolean;
  matrix_enabled?: boolean;
};

type Config = {
  schema_version?: number;
  image?: ImageConfig;
  platform_arches?: Record<string, string>;
  variants?: unknown;
};

type MatrixRow = {
  artifact_id: string;
  binary_artifact_name: string;
  llama_artifact_name: string;
  native_package_artifact_name: string;
  variant_id: string;
  platform: string;
  arch: string;
  distro: string;
  distro_version: string;
  backend: string;
  backend_version: string;
  build_base_image: string;
  package_base_image: string;
  package_format: string;
  runtime_base_image: string;
  cuda_architectures: string;
  rocm_architectures: string;
  mesh_ref: string;
  mesh_repository: string;
  mesh_version: string;
  support_level: string;
  runner_labels: string;
  tags: string;
};

type ArchVariantContract = {
  build_base_image: string;
  package_base_image: string;
  runtime_base_image: string;
  package_format: string;
  platforms: string[];
};

type ParsedArgs = {
  config: string;
  command?: string;
  options: Record<string, string | boolean>;
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CONFIG = resolve(ROOT, "packaging/images.json");
const SUPPORTED_BACKENDS = ["cpu", "cuda", "rocm", "vulkan"];
const SUPPORTED_DISTROS = ["alpine", "arch", "ubuntu"];
const SUPPORTED_PACKAGE_FORMATS = ["apk", "deb", "pkg.tar.zst"];
const DISTRO_PACKAGE_FORMATS: Record<string, string> = {
  ubuntu: "deb",
  alpine: "apk",
  arch: "pkg.tar.zst",
};
const ARCH_VARIANT_CONTRACTS: Record<string, ArchVariantContract> = {
  "arch-cpu": {
    build_base_image: "arch-toolchain-cpu",
    package_base_image: "archlinux:base-devel",
    runtime_base_image: "archlinux:base",
    package_format: "pkg.tar.zst",
    platforms: ["linux/amd64"],
  },
  "arch-vulkan": {
    build_base_image: "arch-toolchain-vulkan",
    package_base_image: "archlinux:base-devel",
    runtime_base_image: "archlinux:base",
    package_format: "pkg.tar.zst",
    platforms: ["linux/amd64"],
  },
  "arch-cuda-12.8": {
    build_base_image: "arch-toolchain-cuda-12-8",
    package_base_image: "archlinux:base-devel",
    runtime_base_image: "archlinux:base",
    package_format: "pkg.tar.zst",
    platforms: ["linux/amd64"],
  },
  "arch-rocm-7.1": {
    build_base_image: "arch-toolchain-rocm-7-1",
    package_base_image: "archlinux:base-devel",
    runtime_base_image: "archlinux:base",
    package_format: "pkg.tar.zst",
    platforms: ["linux/amd64"],
  },
};

export function loadConfig(path: string): Config {
  return JSON.parse(readFileSync(path, "utf8")) as Config;
}

export function normalizeVersion(version: string): string {
  let normalized = version.trim();
  if (normalized.startsWith("refs/tags/")) {
    normalized = normalized.slice("refs/tags/".length);
  }
  if (normalized.startsWith("v")) {
    normalized = normalized.slice(1);
  }
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(normalized)) {
    throw new Error(`invalid mesh-llm version: ${version}`);
  }
  return normalized;
}

export function backendSuffix(backend: string, backendVersion = ""): string {
  if (backend === "cpu") {
    return "cpu";
  }
  if (backendVersion) {
    return `${backend}${backendVersion}`;
  }
  return backend;
}

function tagComponent(variant: Variant, arch: string): string {
  return [
    requiredString(variant.distro),
    arch,
    backendSuffix(requiredString(variant.backend), variant.backend_version ?? ""),
  ].join("-");
}

function tagsFor(image: string, version: string, variant: Variant, arch: string): string[] {
  const component = tagComponent(variant, arch);
  return [`${image}:${version}-${component}`, `${image}:${component}`];
}

function artifactId(variant: Variant, arch: string): string {
  return `${requiredString(variant.id)}-${arch}`;
}

function binaryArtifactName(version: string, variant: Variant, arch: string): string {
  return `mesh-llm-binary-${version}-${artifactId(variant, arch)}`;
}

function llamaArtifactName(version: string, variant: Variant, arch: string): string {
  return `mesh-llm-llama-${version}-${artifactId(variant, arch)}`;
}

function nativePackageArtifactName(version: string, variant: Variant, arch: string): string {
  return `mesh-llm-package-${version}-${artifactId(variant, arch)}`;
}

export function validate(config: Config): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const platforms = config.platform_arches ?? {};

  if (config.schema_version !== 1) {
    errors.push("schema_version must be 1");
  }

  const variants = config.variants;
  const imageConfig = config.image ?? {};
  if (!Array.isArray(variants) || variants.length === 0) {
    errors.push("variants must be a non-empty list");
    return errors;
  }

  if (!imageConfig.ui_base_image) {
    errors.push("image.ui_base_image is required");
  }

  variants.forEach((rawVariant, index) => {
    const variant = rawVariant as Variant;
    const prefix = `variants[${index}]`;
    const variantId = variant.id;

    if (!variantId) {
      errors.push(`${prefix}.id is required`);
    } else if (seenIds.has(variantId)) {
      errors.push(`duplicate variant id: ${variantId}`);
    } else {
      seenIds.add(variantId);
    }

    const distro = variant.distro;
    if (!distro || !SUPPORTED_DISTROS.includes(distro)) {
      errors.push(`${prefix}.distro must be one of ${pythonList(SUPPORTED_DISTROS)}`);
    }

    const backend = variant.backend;
    if (!backend || !SUPPORTED_BACKENDS.includes(backend)) {
      errors.push(`${prefix}.backend must be one of ${pythonList(SUPPORTED_BACKENDS)}`);
    }

    if ((backend === "cuda" || backend === "rocm") && !variant.backend_version) {
      errors.push(`${prefix}.backend_version is required for ${backend}`);
    }

    for (const key of ["build_base_image", "package_base_image", "runtime_base_image"] as const) {
      if (!variant[key]) {
        errors.push(`${prefix}.${key} is required`);
      }
    }

    const packageFormat = variant.package_format;
    if (!packageFormat || !SUPPORTED_PACKAGE_FORMATS.includes(packageFormat)) {
      errors.push(`${prefix}.package_format must be one of ${pythonList(SUPPORTED_PACKAGE_FORMATS)}`);
    } else if (distro && DISTRO_PACKAGE_FORMATS[distro] && packageFormat !== DISTRO_PACKAGE_FORMATS[distro]) {
      errors.push(`${prefix}.package_format must be ${DISTRO_PACKAGE_FORMATS[distro]} for ${distro}`);
    }

    if (distro === "alpine" && (backend === "cuda" || backend === "rocm")) {
      if (variant.support_level !== "experimental") {
        errors.push(`${prefix} Alpine ${backend} rows must be support_level=experimental`);
      }
      if (variant.release_enabled !== false) {
        errors.push(`${prefix} Alpine ${backend} rows must be release_enabled=false`);
      }
      if (variant.matrix_enabled !== false) {
        errors.push(`${prefix} Alpine ${backend} rows must stay matrix_enabled=false until a real Alpine GPU toolchain image is validated`);
      }
    }

    if (distro === "arch" && String(variant.build_base_image ?? "").startsWith("alpine:")) {
      errors.push(`${prefix}.build_base_image must not use an Alpine base for Arch rows`);
    }

    const archContract = variantId ? ARCH_VARIANT_CONTRACTS[variantId] : undefined;
    if (archContract) {
      for (const key of ["build_base_image", "package_base_image", "runtime_base_image", "package_format"] as const) {
        const expectedValue = archContract[key];
        if (variant[key] !== expectedValue) {
          errors.push(`${prefix}.${key} must be ${expectedValue} for ${variantId}`);
        }
      }
    }

    const variantPlatforms = variant.platforms;
    if (!Array.isArray(variantPlatforms) || variantPlatforms.length === 0) {
      errors.push(`${prefix}.platforms must be a non-empty list`);
      return;
    }
    if (archContract && !sameStringArray(variantPlatforms, archContract.platforms)) {
      errors.push(`${prefix}.platforms must be ${pythonList(archContract.platforms)} for ${variantId}`);
    }
    for (const platform of variantPlatforms) {
      if (typeof platform !== "string" || !Object.hasOwn(platforms, platform)) {
        errors.push(`${prefix}.platforms contains unknown platform: ${String(platform)}`);
      }
      if (distro === "arch" && platform !== "linux/amd64") {
        errors.push(`${prefix}.platforms contains unsupported Arch platform: ${String(platform)}`);
      }
    }
  });

  return errors;
}

export function parseFilter(value: string): Set<string> {
  return new Set(value.split(",").map((item) => item.trim()).filter(Boolean));
}

export function runnerLabels(platform: string, runner: string): string {
  if (runner === "carrack") {
    return JSON.stringify(["self-hosted", "Linux", "X64"]);
  }
  if (platform === "linux/arm64") {
    return JSON.stringify("blacksmith-4vcpu-ubuntu-2404-arm");
  }
  return JSON.stringify("blacksmith-4vcpu-ubuntu-2404");
}

export function matrixRows(
  config: Config,
  image: string,
  version: string,
  meshRef: string,
  meshRepository: string,
  variantFilter: Set<string>,
  platformFilter: Set<string>,
  runner: string,
  includeExperimental: boolean,
): MatrixRow[] {
  const rows: MatrixRow[] = [];
  const platformArches = config.platform_arches ?? {};
  const variants = config.variants as Variant[];

  for (const variant of variants) {
    if (variant.matrix_enabled === false) {
      continue;
    }
    if (variant.release_enabled === false && !includeExperimental) {
      continue;
    }

    for (const platform of variant.platforms as string[]) {
      if (runner === "carrack" && platform !== "linux/amd64") {
        continue;
      }
      const arch = platformArches[platform];
      const rowArtifactId = artifactId(variant, arch);
      if (variantFilter.size > 0 && !variantFilter.has(requiredString(variant.id)) && !variantFilter.has(rowArtifactId)) {
        continue;
      }
      if (platformFilter.size > 0 && !platformFilter.has(platform) && !platformFilter.has(arch)) {
        continue;
      }
      rows.push({
        artifact_id: rowArtifactId,
        binary_artifact_name: binaryArtifactName(version, variant, arch),
        llama_artifact_name: llamaArtifactName(version, variant, arch),
        native_package_artifact_name: nativePackageArtifactName(version, variant, arch),
        variant_id: requiredString(variant.id),
        platform,
        arch,
        distro: requiredString(variant.distro),
        distro_version: requiredString(variant.distro_version),
        backend: requiredString(variant.backend),
        backend_version: variant.backend_version ?? "",
        build_base_image: requiredString(variant.build_base_image),
        package_base_image: requiredString(variant.package_base_image),
        package_format: requiredString(variant.package_format),
        runtime_base_image: requiredString(variant.runtime_base_image),
        cuda_architectures: variant.cuda_architectures ?? "",
        rocm_architectures: variant.rocm_architectures ?? "",
        mesh_ref: meshRef,
        mesh_repository: meshRepository,
        mesh_version: version,
        support_level: variant.support_level ?? "supported",
        runner_labels: runnerLabels(platform, runner),
        tags: tagsFor(image, version, variant, arch).join(","),
      });
    }
  }

  return rows;
}

function cmdValidate(args: ParsedArgs): number {
  const config = loadConfig(args.config);
  const errors = validate(config);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    return 1;
  }
  console.log(`validated ${(config.variants as unknown[]).length} image variants`);
  return 0;
}

function cmdGithubMatrix(args: ParsedArgs): number {
  const config = loadConfig(args.config);
  const errors = validate(config);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    return 1;
  }

  const versionOption = stringOption(args, "version");
  if (!versionOption) {
    console.error("--version is required");
    return 1;
  }

  let version: string;
  try {
    version = normalizeVersion(versionOption);
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }

  const imageConfig = config.image as ImageConfig;
  const image = stringOption(args, "image") || requiredString(imageConfig.default_name);
  const meshRepository = stringOption(args, "mesh-repository") || requiredString(imageConfig.source_repository);
  const meshRef = stringOption(args, "mesh-ref") || `v${version}`;
  const runner = stringOption(args, "runner") || "github";
  if (runner !== "github" && runner !== "carrack") {
    console.error(`invalid runner: ${runner}`);
    return 1;
  }

  const rows = matrixRows(
    config,
    image,
    version,
    meshRef,
    meshRepository,
    parseFilter(stringOption(args, "variant-filter") ?? ""),
    parseFilter(stringOption(args, "platform-filter") ?? ""),
    runner,
    Boolean(args.options["include-experimental"]),
  );

  if (rows.length === 0) {
    console.error("matrix filters matched no rows");
    return 1;
  }

  console.log(stableStringify({ include: rows }));
  return 0;
}

function cmdUiBaseImage(args: ParsedArgs): number {
  const config = loadConfig(args.config);
  if (!config.image?.ui_base_image) {
    console.error("image.ui_base_image is required");
    return 1;
  }
  console.log(config.image.ui_base_image);
  return 0;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {
    config: DEFAULT_CONFIG,
    options: {},
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--config") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--config requires a value");
      }
      args.config = resolve(process.cwd(), value);
      index += 1;
      continue;
    }
    if (!args.command && !token.startsWith("--")) {
      args.command = token;
      continue;
    }
    if (token === "--include-experimental") {
      args.options["include-experimental"] = true;
      continue;
    }
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${token} requires a value`);
      }
      args.options[key] = value;
      index += 1;
      continue;
    }
    throw new Error(`unexpected argument: ${token}`);
  }

  return args;
}

export function main(argv: string[]): number {
  let args: ParsedArgs;
  try {
    args = parseArgs(argv);
  } catch (error) {
    console.error((error as Error).message);
    printUsage();
    return 2;
  }

  switch (args.command) {
    case "validate":
      return cmdValidate(args);
    case "github-matrix":
      return cmdGithubMatrix(args);
    case "ui-base-image":
      return cmdUiBaseImage(args);
    default:
      console.error(args.command ? `unknown command: ${args.command}` : "a command is required");
      printUsage();
      return 2;
  }
}

function requiredString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringOption(args: ParsedArgs, name: string): string | undefined {
  const value = args.options[name];
  return typeof value === "string" ? value : undefined;
}

function pythonList(values: string[]): string {
  return `[${values.map((value) => `'${value}'`).join(", ")}]`;
}

function sameStringArray(left: unknown[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }
  if (value && typeof value === "object") {
    const sorted: JsonObject = {};
    for (const key of Object.keys(value as JsonObject).sort()) {
      sorted[key] = sortJson((value as JsonObject)[key]);
    }
    return sorted;
  }
  return value;
}

function printUsage(): void {
  console.error("usage: image-matrix.ts [--config PATH] {validate,github-matrix,ui-base-image} [...]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
