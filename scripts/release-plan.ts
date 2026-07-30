#!/usr/bin/env -S node --experimental-strip-types
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  type Config,
  type MatrixRow,
  type NpmMatrixRow,
  type UpstreamRow,
  homebrewPlan,
  loadConfig,
  matrixRows,
  normalizeVersion,
  npmMatrixRows,
  npmPlan,
  stableStringify,
  upstreamRows,
  validate,
} from "./image-matrix.ts";

type JsonObject = Record<string, unknown>;

export type ReleasePlanInput = {
  dry_run: boolean;
  image?: string;
  mesh_ref?: string;
  mesh_repository?: string;
  native_selector: string;
  npm_selector: string;
  publish_images: boolean;
  publish_npm: boolean;
  publish_release_assets: boolean;
  validate_homebrew: boolean;
  validate_native: boolean;
  validate_npm: boolean;
  version: string;
};

export type ExactSelection = {
  ids: string[];
  mode: "all" | "selected";
};

export type ReleasePlan = {
  schema_version: 1;
  dry_run: boolean;
  homebrew_enabled: boolean;
  homebrew_plan: ReturnType<typeof homebrewPlan>;
  native_enabled: boolean;
  native_selection: ExactSelection;
  npm_enabled: boolean;
  npm_matrix: { include: NpmMatrixRow[] };
  npm_plan: ReturnType<typeof npmPlan>;
  npm_selection: ExactSelection;
  package_matrix: { include: MatrixRow[] };
  publish_images: boolean;
  publish_npm: boolean;
  publish_release_assets: boolean;
  release_assembly_enabled: boolean;
  upstream_matrix: { include: UpstreamRow[] };
};

type ParsedArgs = {
  config: string;
  options: Record<string, string>;
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CONFIG = resolve(ROOT, "packaging/images.json");
const BOOLEAN_OPTIONS = [
  "dry-run",
  "publish-images",
  "publish-npm",
  "publish-release-assets",
  "validate-homebrew",
  "validate-native",
  "validate-npm",
] as const;

export function exactSelection(
  value: string,
  availableIds: readonly string[],
  label: string,
): ExactSelection {
  const tokens = value.split(",").map((token) => token.trim());
  if (tokens.some((token) => token.length === 0)) {
    throw new Error(`${label} selector contains an empty token`);
  }
  const duplicates = tokens.filter((token, index) => tokens.indexOf(token) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${label} selector contains duplicate id: ${duplicates[0]}`);
  }
  if (tokens.includes("all")) {
    if (tokens.length !== 1) throw new Error(`${label} selector must use all by itself`);
    return { ids: [...availableIds], mode: "all" };
  }
  const available = new Set(availableIds);
  const unknown = tokens.find((token) => !available.has(token));
  if (unknown) throw new Error(`${label} selector contains unknown exact id: ${unknown}`);
  return { ids: tokens, mode: "selected" };
}

export function buildReleasePlan(config: Config, input: ReleasePlanInput): ReleasePlan {
  const errors = validate(config);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  validateInputBooleans(input);
  if (!input.validate_native && !input.validate_homebrew && !input.validate_npm) {
    throw new Error("at least one validation component must be enabled");
  }

  const version = normalizeVersion(input.version);
  const image = input.image ?? config.image!.default_name!;
  const repository = input.mesh_repository
    ?? config.image!.source_repository!;
  const meshRef = input.mesh_ref ?? `v${version}`;
  const allNativeRows = matrixRows(
    config,
    image,
    version,
    meshRef,
    repository,
    new Set(),
    new Set(),
    false,
  );
  const allNpmRows = npmMatrixRows(config, version, new Set(), false);
  const nativeSelection = exactSelection(
    input.native_selector,
    allNativeRows.map((row) => row.artifact_id),
    "native",
  );
  const npmSelection = exactSelection(
    input.npm_selector,
    allNpmRows.map((row) => row.id),
    "npm",
  );
  requireDisabledSelectorIsAll(input.validate_native, nativeSelection, "native");
  requireDisabledSelectorIsAll(input.validate_npm, npmSelection, "npm");

  const nativeRows = input.validate_native
    ? selectNativeRows(config, image, version, meshRef, repository, nativeSelection)
    : [];
  const npmRows = input.validate_npm
    ? selectNpmRows(config, version, npmSelection)
    : [];
  const publication = normalizedPublication(input);
  enforcePublicationImplications(input, nativeSelection, npmSelection, publication);

  return {
    schema_version: 1,
    dry_run: input.dry_run,
    homebrew_enabled: input.validate_homebrew,
    homebrew_plan: homebrewPlan(config, version),
    native_enabled: input.validate_native,
    native_selection: nativeSelection,
    npm_enabled: input.validate_npm,
    npm_matrix: { include: npmRows },
    npm_plan: npmPlan(config, npmRows),
    npm_selection: npmSelection,
    package_matrix: { include: nativeRows },
    publish_images: publication.publish_images,
    publish_npm: publication.publish_npm,
    publish_release_assets: publication.publish_release_assets,
    release_assembly_enabled: input.validate_native
      && input.validate_homebrew
      && nativeSelection.mode === "all",
    upstream_matrix: { include: upstreamRows(nativeRows) },
  };
}

function selectNativeRows(
  config: Config,
  image: string,
  version: string,
  meshRef: string,
  repository: string,
  selection: ExactSelection,
): MatrixRow[] {
  if (selection.mode === "all") {
    return matrixRows(config, image, version, meshRef, repository, new Set(), new Set(), false);
  }
  return matrixRows(
    config,
    image,
    version,
    meshRef,
    repository,
    new Set(selection.ids),
    new Set(),
    false,
  );
}

function selectNpmRows(
  config: Config,
  version: string,
  selection: ExactSelection,
): NpmMatrixRow[] {
  return npmMatrixRows(
    config,
    version,
    selection.mode === "all" ? new Set() : new Set(selection.ids),
    false,
  );
}

function requireDisabledSelectorIsAll(
  enabled: boolean,
  selection: ExactSelection,
  label: string,
): void {
  if (!enabled && selection.mode !== "all") {
    throw new Error(`${label} selector must be all when ${label} validation is disabled`);
  }
}

function normalizedPublication(input: ReleasePlanInput) {
  if (input.dry_run) {
    return {
      publish_images: false,
      publish_npm: false,
      publish_release_assets: false,
    };
  }
  return {
    publish_images: input.publish_images,
    publish_npm: input.publish_npm,
    publish_release_assets: input.publish_release_assets,
  };
}

function enforcePublicationImplications(
  input: ReleasePlanInput,
  nativeSelection: ExactSelection,
  npmSelection: ExactSelection,
  publication: ReturnType<typeof normalizedPublication>,
): void {
  if (publication.publish_images
    && (!input.validate_native || nativeSelection.mode !== "all")) {
    throw new Error("publishing images requires complete native validation");
  }
  if (publication.publish_release_assets
    && (!input.validate_native
      || !input.validate_homebrew
      || nativeSelection.mode !== "all")) {
    throw new Error("publishing release assets requires complete native and Homebrew validation");
  }
  if (publication.publish_npm
    && (!input.validate_npm || npmSelection.mode !== "all")) {
    throw new Error("publishing npm requires complete npm validation");
  }
}

function validateInputBooleans(input: ReleasePlanInput): void {
  for (const [name, value] of [
    ["dry_run", input.dry_run],
    ["publish_images", input.publish_images],
    ["publish_npm", input.publish_npm],
    ["publish_release_assets", input.publish_release_assets],
    ["validate_homebrew", input.validate_homebrew],
    ["validate_native", input.validate_native],
    ["validate_npm", input.validate_npm],
  ] as const) {
    if (typeof value !== "boolean") throw new Error(`${name} must be boolean`);
  }
}

function parseBoolean(value: string, name: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`--${name} must be true or false`);
}

function requiredOption(options: Record<string, string>, name: string): string {
  const value = options[name];
  if (value === undefined) throw new Error(`--${name} is required`);
  return value;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { config: DEFAULT_CONFIG, options: {} };
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!name.startsWith("--")) throw new Error(`unexpected argument: ${name}`);
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`${name} requires a value`);
    }
    const key = name.slice(2);
    if (key === "config") {
      parsed.config = resolve(process.cwd(), value);
    } else {
      if (parsed.options[key] !== undefined) throw new Error(`duplicate option: ${name}`);
      parsed.options[key] = value;
    }
  }
  return parsed;
}

function inputFromOptions(options: Record<string, string>): ReleasePlanInput {
  const boolean = (name: typeof BOOLEAN_OPTIONS[number]) =>
    parseBoolean(requiredOption(options, name), name);
  const knownOptions = new Set<string>([
    ...BOOLEAN_OPTIONS,
    "image",
    "mesh-ref",
    "mesh-repository",
    "native-selector",
    "npm-selector",
    "version",
  ]);
  const unknown = Object.keys(options).find((name) => !knownOptions.has(name));
  if (unknown) throw new Error(`unknown option: --${unknown}`);
  return {
    dry_run: boolean("dry-run"),
    image: options.image,
    mesh_ref: options["mesh-ref"],
    mesh_repository: options["mesh-repository"],
    native_selector: requiredOption(options, "native-selector"),
    npm_selector: requiredOption(options, "npm-selector"),
    publish_images: boolean("publish-images"),
    publish_npm: boolean("publish-npm"),
    publish_release_assets: boolean("publish-release-assets"),
    validate_homebrew: boolean("validate-homebrew"),
    validate_native: boolean("validate-native"),
    validate_npm: boolean("validate-npm"),
    version: requiredOption(options, "version"),
  };
}

export function main(argv: string[]): number {
  try {
    const args = parseArgs(argv);
    const plan = buildReleasePlan(loadConfig(args.config), inputFromOptions(args.options));
    console.log(stableStringify(plan));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
