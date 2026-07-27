#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type JsonObject = Record<string, unknown>;

export type UpstreamFlavor = "cpu" | "cuda-12" | "cuda-13" | "rocm" | "vulkan" | "metal";

type ImageConfig = {
  default_name?: string;
  source_repository?: string;
};

type HomebrewConfig = {
  arch?: string;
  runner?: string;
  target?: string;
  upstream_flavor?: UpstreamFlavor;
};

export type NpmLane = {
  id?: string;
  name?: string;
  runner?: string;
  backend?: string;
  target?: string;
  release_enabled?: boolean;
  matrix_enabled?: boolean;
};

type NpmConfig = {
  package_name?: string;
  source_directory?: string;
  registry?: string;
  lanes?: unknown;
};

export type Variant = {
  id?: string;
  distro?: string;
  distro_version?: string;
  backend?: string;
  backend_version?: string;
  upstream_flavor?: UpstreamFlavor;
  package_base_image?: string;
  package_manager?: string;
  package_format?: string;
  runtime_base_image?: string;
  platforms?: unknown;
  support_level?: string;
  release_track?: string;
  release_enabled?: boolean;
  matrix_enabled?: boolean;
};

export type Config = {
  schema_version?: number;
  image?: ImageConfig;
  homebrew?: HomebrewConfig;
  npm?: NpmConfig;
  platform_arches?: Record<string, string>;
  variants?: unknown;
};

export type MatrixRow = {
  artifact_id: string;
  upstream_artifact_id: string;
  upstream_asset_name: string;
  upstream_checksum_name: string;
  upstream_asset_url: string;
  upstream_checksum_url: string;
  native_package_artifact_name: string;
  variant_id: string;
  platform: string;
  arch: string;
  distro: string;
  distro_version: string;
  backend: string;
  backend_version: string;
  upstream_flavor: UpstreamFlavor;
  package_base_image: string;
  package_manager: string;
  package_format: string;
  runtime_base_image: string;
  mesh_ref: string;
  mesh_repository: string;
  mesh_version: string;
  support_level: string;
  release_track: string;
  runner_labels: string;
  tags: string;
};

export type UpstreamRow = Pick<
  MatrixRow,
  | "upstream_artifact_id"
  | "upstream_asset_name"
  | "upstream_checksum_name"
  | "upstream_asset_url"
  | "upstream_checksum_url"
  | "upstream_flavor"
  | "platform"
  | "arch"
  | "runner_labels"
  | "mesh_version"
>;

export type NpmMatrixRow = {
  artifact_name: string;
  backend: string;
  id: string;
  name: string;
  runner_labels: string;
  target: string;
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
const SUPPORTED_RELEASE_TRACKS = ["upstream_mirrored", "downstream_extension"];
const SUPPORTED_FLAVORS: UpstreamFlavor[] = ["cpu", "cuda-12", "cuda-13", "rocm", "vulkan", "metal"];
const SUPPORTED_NPM_TARGETS = [
  "darwin-arm64",
  "darwin-x64",
  "linux-arm64",
  "linux-x64",
  "win32-x64",
];
const PACKAGE_MANAGERS_BY_FORMAT: Record<string, string> = {
  deb: "apt",
  apk: "apk",
  "pkg.tar.zst": "pacman",
};
const DISTRO_PACKAGE_FORMATS: Record<string, string> = {
  ubuntu: "deb",
  alpine: "apk",
  arch: "pkg.tar.zst",
};

export function loadConfig(path: string): Config {
  return JSON.parse(readFileSync(path, "utf8")) as Config;
}

export function normalizeVersion(version: string): string {
  let normalized = version.trim();
  if (normalized.startsWith("refs/tags/")) normalized = normalized.slice("refs/tags/".length);
  if (normalized.startsWith("v")) normalized = normalized.slice(1);
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(normalized)) {
    throw new Error(`invalid mesh-llm version: ${version}`);
  }
  return normalized;
}

export function backendSuffix(backend: string, backendVersion = ""): string {
  if (backend === "cpu") return "cpu";
  return backendVersion ? `${backend}${backendVersion}` : backend;
}

export function targetTriple(platform: string): string {
  if (platform === "linux/amd64") return "x86_64-unknown-linux-gnu";
  if (platform === "linux/arm64") return "aarch64-unknown-linux-gnu";
  throw new Error(`unsupported upstream platform: ${platform}`);
}

export function upstreamAssetName(versionInput: string, target: string, flavor: UpstreamFlavor): string {
  const version = normalizeVersion(versionInput);
  const suffix = flavor === "cpu" || flavor === "metal" ? "" : `-${flavor}`;
  return `mesh-llm-v${version}-${target}${suffix}.${target.includes("windows") ? "zip" : "tar.gz"}`;
}

function releaseAssetUrl(repository: string, version: string, asset: string): string {
  return `https://github.com/${repository}/releases/download/v${version}/${asset}`;
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

function upstreamArtifactId(asset: string): string {
  return asset.replace(/^mesh-llm-v/, "mesh-llm-upstream-").replace(/\.(?:tar\.gz|zip)$/, "");
}

function nativePackageArtifactName(version: string, variant: Variant, arch: string): string {
  return `mesh-llm-package-${version}-${artifactId(variant, arch)}`;
}

function expectedFlavor(backend: string, backendVersion: string): UpstreamFlavor | "" {
  if (backend === "cpu" || backend === "rocm" || backend === "vulkan") return backend;
  if (backend === "cuda") {
    const major = backendVersion.split(".")[0];
    return major === "12" || major === "13" ? `cuda-${major}` as UpstreamFlavor : "";
  }
  return "";
}

export function validate(config: Config): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const platforms = config.platform_arches ?? {};

  if (config.schema_version !== 2) errors.push("schema_version must be 2");
  if (!config.image?.default_name) errors.push("image.default_name is required");
  if (!config.image?.source_repository) errors.push("image.source_repository is required");
  if (!config.homebrew?.arch || !config.homebrew.runner || !config.homebrew.target || config.homebrew.upstream_flavor !== "metal") {
    errors.push("homebrew must define arch, runner, target, and upstream_flavor=metal");
  }
  validateNpmConfig(config.npm, errors);

  const variants = config.variants;
  if (!Array.isArray(variants) || variants.length === 0) {
    errors.push("variants must be a non-empty list");
    return errors;
  }

  variants.forEach((rawVariant, index) => {
    const variant = rawVariant as Variant;
    const prefix = `variants[${index}]`;
    const variantId = variant.id;
    if (!variantId) errors.push(`${prefix}.id is required`);
    else if (seenIds.has(variantId)) errors.push(`duplicate variant id: ${variantId}`);
    else seenIds.add(variantId);

    const distro = variant.distro ?? "";
    const backend = variant.backend ?? "";
    const backendVersion = variant.backend_version ?? "";
    const flavor = variant.upstream_flavor;
    if (!SUPPORTED_DISTROS.includes(distro)) errors.push(`${prefix}.distro must be one of ${pythonList(SUPPORTED_DISTROS)}`);
    if (!SUPPORTED_BACKENDS.includes(backend)) errors.push(`${prefix}.backend must be one of ${pythonList(SUPPORTED_BACKENDS)}`);
    if ((backend === "cuda" || backend === "rocm") && !backendVersion) errors.push(`${prefix}.backend_version is required for ${backend}`);
    if (!flavor || !SUPPORTED_FLAVORS.includes(flavor)) errors.push(`${prefix}.upstream_flavor must be one of ${pythonList(SUPPORTED_FLAVORS)}`);
    else if (flavor !== expectedFlavor(backend, backendVersion)) errors.push(`${prefix}.upstream_flavor does not match ${backend}${backendVersion}`);
    if (variant.release_track && !SUPPORTED_RELEASE_TRACKS.includes(variant.release_track)) {
      errors.push(`${prefix}.release_track must be one of ${pythonList(SUPPORTED_RELEASE_TRACKS)}`);
    }

    for (const key of ["package_base_image", "runtime_base_image"] as const) {
      if (!variant[key]) errors.push(`${prefix}.${key} is required`);
    }
    const packageFormat = variant.package_format ?? "";
    if (!SUPPORTED_PACKAGE_FORMATS.includes(packageFormat)) {
      errors.push(`${prefix}.package_format must be one of ${pythonList(SUPPORTED_PACKAGE_FORMATS)}`);
    } else if (DISTRO_PACKAGE_FORMATS[distro] && packageFormat !== DISTRO_PACKAGE_FORMATS[distro]) {
      errors.push(`${prefix}.package_format must be ${DISTRO_PACKAGE_FORMATS[distro]} for ${distro}`);
    }
    const expectedPackageManager = PACKAGE_MANAGERS_BY_FORMAT[packageFormat];
    if (variant.package_manager && variant.package_manager !== expectedPackageManager) {
      errors.push(`${prefix}.package_manager must be ${expectedPackageManager} for ${packageFormat}`);
    }

    if (distro === "alpine") {
      if (variant.support_level !== "blocked_upstream") errors.push(`${prefix} Alpine rows must be support_level=blocked_upstream`);
      if (variant.release_enabled !== false) errors.push(`${prefix} Alpine rows must be release_enabled=false`);
      if (variant.matrix_enabled !== false) errors.push(`${prefix} Alpine rows must be matrix_enabled=false until upstream publishes musl assets`);
    }

    const variantPlatforms = variant.platforms;
    if (!Array.isArray(variantPlatforms) || variantPlatforms.length === 0) {
      errors.push(`${prefix}.platforms must be a non-empty list`);
      return;
    }
    for (const platform of variantPlatforms) {
      if (typeof platform !== "string" || !Object.hasOwn(platforms, platform)) {
        errors.push(`${prefix}.platforms contains unknown platform: ${String(platform)}`);
        continue;
      }
      if (distro === "arch" && platform !== "linux/amd64") errors.push(`${prefix}.platforms contains unsupported Arch platform: ${platform}`);
      if ((flavor === "rocm" || flavor === "vulkan") && platform !== "linux/amd64") {
        errors.push(`${prefix}.${flavor} upstream archives only support linux/amd64`);
      }
    }
  });

  return errors;
}

function validateNpmConfig(npm: NpmConfig | undefined, errors: string[]): void {
  if (npm?.package_name !== "@meshllm/sdk") errors.push("npm.package_name must be @meshllm/sdk");
  if (npm?.source_directory !== "sdk/node") errors.push("npm.source_directory must be sdk/node");
  if (npm?.registry !== "https://registry.npmjs.org/") errors.push("npm.registry must be the public npm registry");
  if (!Array.isArray(npm?.lanes) || npm.lanes.length === 0) {
    errors.push("npm.lanes must be a non-empty list");
    return;
  }

  const seenIds = new Set<string>();
  const seenTargets = new Set<string>();
  npm.lanes.forEach((rawLane, index) => {
    const lane = rawLane as NpmLane;
    const prefix = `npm.lanes[${index}]`;
    for (const key of ["id", "name", "runner", "backend", "target"] as const) {
      if (!lane[key]) errors.push(`${prefix}.${key} is required`);
    }
    if (lane.id && seenIds.has(lane.id)) errors.push(`duplicate npm lane id: ${lane.id}`);
    if (lane.id) seenIds.add(lane.id);
    if (lane.target && seenTargets.has(lane.target)) errors.push(`duplicate npm target: ${lane.target}`);
    if (lane.target) seenTargets.add(lane.target);
    if (lane.target && !SUPPORTED_NPM_TARGETS.includes(lane.target)) {
      errors.push(`${prefix}.target must be one of ${pythonList(SUPPORTED_NPM_TARGETS)}`);
    }
    const expectedBackend = lane.target?.startsWith("darwin-") ? "metal" : "cpu";
    if (lane.backend && lane.backend !== expectedBackend) {
      errors.push(`${prefix}.backend must be ${expectedBackend} for ${lane.target}`);
    }
    if (lane.matrix_enabled === false && lane.release_enabled !== false) {
      errors.push(`${prefix}.release_enabled must be false when matrix_enabled is false`);
    }
  });
  for (const target of SUPPORTED_NPM_TARGETS) {
    if (!seenTargets.has(target)) errors.push(`npm.lanes must declare target ${target}`);
  }
}

export function parseFilter(value: string): Set<string> {
  return new Set(value.split(",").map((item) => item.trim()).filter(Boolean));
}

export function runnerLabels(platform: string): string {
  return JSON.stringify(platform === "linux/arm64" ? "ubuntu-24.04-arm" : "ubuntu-24.04");
}

export function npmMatrixRows(
  config: Config,
  versionInput: string,
  laneFilter: Set<string>,
  includeExperimental: boolean,
): NpmMatrixRow[] {
  const version = normalizeVersion(versionInput);
  const lanes = config.npm?.lanes as NpmLane[];
  const rows: NpmMatrixRow[] = [];
  for (const lane of lanes) {
    if (lane.matrix_enabled === false) continue;
    if (lane.release_enabled === false && !includeExperimental) continue;
    const id = requiredString(lane.id);
    const target = requiredString(lane.target);
    if (laneFilter.size > 0 && !laneFilter.has(id) && !laneFilter.has(target)) continue;
    rows.push({
      artifact_name: `mesh-llm-node-sdk-addon-${version}-${target}`,
      backend: requiredString(lane.backend),
      id,
      name: requiredString(lane.name),
      runner_labels: JSON.stringify(requiredString(lane.runner)),
      target,
    });
  }
  return rows;
}

export function npmPlan(config: Config, rows: NpmMatrixRow[]) {
  return {
    enabled: rows.length > 0,
    package_name: requiredString(config.npm?.package_name),
    registry: requiredString(config.npm?.registry),
    source_directory: requiredString(config.npm?.source_directory),
    targets: rows.map((row) => row.target),
  };
}

export function matrixRows(
  config: Config,
  image: string,
  versionInput: string,
  meshRef: string,
  meshRepository: string,
  variantFilter: Set<string>,
  platformFilter: Set<string>,
  includeExperimental: boolean,
): MatrixRow[] {
  const version = normalizeVersion(versionInput);
  const rows: MatrixRow[] = [];
  const platformArches = config.platform_arches ?? {};
  const variants = config.variants as Variant[];

  for (const variant of variants) {
    if (variant.matrix_enabled === false) continue;
    if (variant.release_enabled === false && !includeExperimental) continue;
    for (const platform of variant.platforms as string[]) {
      const arch = platformArches[platform];
      const rowArtifactId = artifactId(variant, arch);
      if (variantFilter.size > 0 && !variantFilter.has(requiredString(variant.id)) && !variantFilter.has(rowArtifactId)) continue;
      if (platformFilter.size > 0 && !platformFilter.has(platform) && !platformFilter.has(arch)) continue;

      const flavor = variant.upstream_flavor as UpstreamFlavor;
      const asset = upstreamAssetName(version, targetTriple(platform), flavor);
      rows.push({
        artifact_id: rowArtifactId,
        upstream_artifact_id: upstreamArtifactId(asset),
        upstream_asset_name: asset,
        upstream_checksum_name: `${asset}.sha256`,
        upstream_asset_url: releaseAssetUrl(meshRepository, version, asset),
        upstream_checksum_url: releaseAssetUrl(meshRepository, version, `${asset}.sha256`),
        native_package_artifact_name: nativePackageArtifactName(version, variant, arch),
        variant_id: requiredString(variant.id),
        platform,
        arch,
        distro: requiredString(variant.distro),
        distro_version: requiredString(variant.distro_version),
        backend: requiredString(variant.backend),
        backend_version: variant.backend_version ?? "",
        upstream_flavor: flavor,
        package_base_image: requiredString(variant.package_base_image),
        package_manager: variant.package_manager ?? PACKAGE_MANAGERS_BY_FORMAT[requiredString(variant.package_format)] ?? "",
        package_format: requiredString(variant.package_format),
        runtime_base_image: requiredString(variant.runtime_base_image),
        mesh_ref: meshRef,
        mesh_repository: meshRepository,
        mesh_version: version,
        support_level: variant.support_level ?? "supported",
        release_track: variant.release_track ?? "upstream_mirrored",
        runner_labels: runnerLabels(platform),
        tags: tagsFor(image, version, variant, arch).join("\n"),
      });
    }
  }
  return rows;
}

export function upstreamRows(rows: MatrixRow[]): UpstreamRow[] {
  const unique = new Map<string, UpstreamRow>();
  for (const row of rows) {
    if (!unique.has(row.upstream_artifact_id)) {
      unique.set(row.upstream_artifact_id, {
        upstream_artifact_id: row.upstream_artifact_id,
        upstream_asset_name: row.upstream_asset_name,
        upstream_checksum_name: row.upstream_checksum_name,
        upstream_asset_url: row.upstream_asset_url,
        upstream_checksum_url: row.upstream_checksum_url,
        upstream_flavor: row.upstream_flavor,
        platform: row.platform,
        arch: row.arch,
        runner_labels: row.runner_labels,
        mesh_version: row.mesh_version,
      });
    }
  }
  return [...unique.values()];
}

export function homebrewPlan(config: Config, versionInput: string) {
  const version = normalizeVersion(versionInput);
  const homebrew = config.homebrew as Required<HomebrewConfig>;
  const repository = requiredString(config.image?.source_repository);
  const asset = upstreamAssetName(version, homebrew.target, homebrew.upstream_flavor);
  return {
    arch: homebrew.arch,
    runner: homebrew.runner,
    target: homebrew.target,
    upstream_flavor: homebrew.upstream_flavor,
    upstream_asset_name: asset,
    upstream_checksum_name: `${asset}.sha256`,
    upstream_asset_url: releaseAssetUrl(repository, version, asset),
    upstream_checksum_url: releaseAssetUrl(repository, version, `${asset}.sha256`),
    mesh_version: version,
  };
}

function commandContext(args: ParsedArgs) {
  const config = loadConfig(args.config);
  const errors = validate(config);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const versionOption = stringOption(args, "version");
  if (!versionOption) throw new Error("--version is required");
  const version = normalizeVersion(versionOption);
  const image = stringOption(args, "image") || requiredString(config.image?.default_name);
  const meshRepository = stringOption(args, "mesh-repository") || requiredString(config.image?.source_repository);
  const meshRef = stringOption(args, "mesh-ref") || `v${version}`;
  const rows = matrixRows(
    config,
    image,
    version,
    meshRef,
    meshRepository,
    parseFilter(stringOption(args, "variant-filter") ?? ""),
    parseFilter(stringOption(args, "platform-filter") ?? ""),
    Boolean(args.options["include-experimental"]),
  );
  if (rows.length === 0) throw new Error("matrix filters matched no rows");
  return { config, rows, version };
}

function npmCommandContext(args: ParsedArgs) {
  const config = loadConfig(args.config);
  const errors = validate(config);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const versionOption = stringOption(args, "version");
  if (!versionOption) throw new Error("--version is required");
  const laneFilter = parseFilter(stringOption(args, "lane-filter") ?? "");
  const rows = npmMatrixRows(config, versionOption, laneFilter, Boolean(args.options["include-experimental"]));
  if (rows.length === 0 && laneFilter.size > 0) throw new Error("npm lane filter matched no rows");
  return { config, rows };
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = { config: DEFAULT_CONFIG, options: {} };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--config") {
      const value = argv[++index];
      if (!value) throw new Error("--config requires a value");
      args.config = resolve(process.cwd(), value);
    } else if (!args.command && !token.startsWith("--")) {
      args.command = token;
    } else if (token === "--include-experimental") {
      args.options["include-experimental"] = true;
    } else if (token.startsWith("--")) {
      const value = argv[++index];
      if (!value || value.startsWith("--")) throw new Error(`${token} requires a value`);
      args.options[token.slice(2)] = value;
    } else {
      throw new Error(`unexpected argument: ${token}`);
    }
  }
  return args;
}

export function main(argv: string[]): number {
  try {
    const args = parseArgs(argv);
    if (args.command === "validate") {
      const config = loadConfig(args.config);
      const errors = validate(config);
      if (errors.length > 0) throw new Error(errors.join("\n"));
      console.log(`validated ${(config.variants as unknown[]).length} packaging variants and ${(config.npm?.lanes as unknown[]).length} npm lanes`);
      return 0;
    }
    if (args.command === "github-matrix") {
      console.log(stableStringify({ include: commandContext(args).rows }));
      return 0;
    }
    if (args.command === "upstream-matrix") {
      console.log(stableStringify({ include: upstreamRows(commandContext(args).rows) }));
      return 0;
    }
    if (args.command === "homebrew-plan") {
      const config = loadConfig(args.config);
      const errors = validate(config);
      if (errors.length > 0) throw new Error(errors.join("\n"));
      const version = stringOption(args, "version");
      if (!version) throw new Error("--version is required");
      console.log(stableStringify(homebrewPlan(config, version)));
      return 0;
    }
    if (args.command === "npm-matrix") {
      console.log(stableStringify({ include: npmCommandContext(args).rows }));
      return 0;
    }
    if (args.command === "npm-plan") {
      const context = npmCommandContext(args);
      console.log(stableStringify(npmPlan(context.config, context.rows)));
      return 0;
    }
    throw new Error(args.command ? `unknown command: ${args.command}` : "a command is required");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    printUsage();
    return 1;
  }
}

function requiredString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringOption(args: ParsedArgs, name: string): string | undefined {
  const value = args.options[name];
  return typeof value === "string" ? value : undefined;
}

function pythonList(values: readonly string[]): string {
  return `[${values.map((value) => `'${value}'`).join(", ")}]`;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    const sorted: JsonObject = {};
    for (const key of Object.keys(value as JsonObject).sort()) sorted[key] = sortJson((value as JsonObject)[key]);
    return sorted;
  }
  return value;
}

function printUsage(): void {
  console.error("usage: image-matrix.ts [--config PATH] {validate,github-matrix,upstream-matrix,homebrew-plan,npm-matrix,npm-plan} [...]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
