#!/usr/bin/env -S node --experimental-strip-types
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Arch = "arm64" | "amd64";

type ParsedArgs = {
  options: Record<string, string>;
  binaries: ReleaseBinary[];
};

type ReleaseBinary = {
  arch: Arch;
  path: string;
};

type ReleaseInput = {
  version: string;
  binaries: ReleaseBinary[];
  outputDir: string;
  templatePath: string;
  formulaOutput: string;
};

type ArchOutput = {
  arch: Arch;
  tarball: string;
  sha256: string;
};

type ReleaseOutput = {
  version: string;
  formula: string;
  checksums: string;
  tarballs: ArchOutput[];
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TEMPLATE = resolve(ROOT, "packaging/homebrew/Formula/mesh-llm.rb.template");
const ARCHES: readonly Arch[] = ["arm64", "amd64"];
const ARCH_CONDITIONS: Record<Arch, string> = {
  arm64: "on_arm",
  amd64: "on_intel",
};

export function normalizeHomebrewVersion(version: string): string {
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

export function tarballName(version: string, arch: Arch): string {
  return `mesh-llm-${version}-macos-${arch}.tar.gz`;
}

export function renderFormula(template: string, version: string, tarballs: ArchOutput[]): string {
  const blocks = tarballs.map((entry) => {
    const tarball = basename(entry.tarball);
    return [
      `  ${ARCH_CONDITIONS[entry.arch]} do`,
      `    url "https://github.com/Mesh-LLM/mesh-agent-images/releases/download/v${version}/${tarball}"`,
      `    sha256 "${entry.sha256}"`,
      "  end",
    ].join("\n");
  });

  return template
    .replaceAll("{{VERSION}}", version)
    .replaceAll("{{MACOS_DOWNLOAD_BLOCKS}}", blocks.join("\n\n"));
}

export function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function stageMacosRelease(input: ReleaseInput): ReleaseOutput {
  const version = normalizeHomebrewVersion(input.version);
  const binaries = normalizeBinaries(input.binaries);

  mkdirSync(input.outputDir, { recursive: true });
  mkdirSync(dirname(input.formulaOutput), { recursive: true });

  const tarballs = binaries.map((binary) => createTarball(version, binary.arch, binary.path, input.outputDir));
  const checksums = writeChecksums(input.outputDir, tarballs);

  const template = readFileSync(input.templatePath, "utf8");
  const formula = renderFormula(template, version, tarballs);
  writeFileSync(input.formulaOutput, formula);

  return {
    version,
    formula: input.formulaOutput,
    checksums,
    tarballs,
  };
}

function normalizeBinaries(binaries: ReleaseBinary[]): ReleaseBinary[] {
  if (binaries.length === 0) {
    throw new Error("at least one --binary arch=path entry is required");
  }

  const byArch = new Map<Arch, string>();
  for (const binary of binaries) {
    if (byArch.has(binary.arch)) {
      throw new Error(`duplicate macOS ${binary.arch} binary`);
    }
    byArch.set(binary.arch, binary.path);
  }

  return ARCHES.filter((arch) => byArch.has(arch)).map((arch) => ({
    arch,
    path: byArch.get(arch) as string,
  }));
}

function writeChecksums(outputDir: string, tarballs: ArchOutput[]): string {
  const lines = tarballs.map((entry) => `${entry.sha256}  ${basename(entry.tarball)}`);
  for (const line of lines) {
    const [, file] = line.split("  ");
    writeFileSync(resolve(outputDir, `${file}.sha256`), `${line}\n`);
  }
  const checksums = resolve(outputDir, "SHA256SUMS");
  writeFileSync(checksums, `${lines.join("\n")}\n`);
  return checksums;
}

function createTarball(version: string, arch: Arch, binaryPath: string, outputDir: string): ArchOutput {
  const binary = resolve(process.cwd(), binaryPath);
  const stat = statSync(binary);
  if (!stat.isFile()) {
    throw new Error(`macOS ${arch} binary must be a file: ${binaryPath}`);
  }

  const stageDir = mkdtempSync(resolve(tmpdir(), `mesh-llm-${arch}-`));
  try {
    const stagedBinary = resolve(stageDir, "mesh-llm");
    copyFileSync(binary, stagedBinary);
    chmodSync(stagedBinary, 0o755);

    const tarball = resolve(outputDir, tarballName(version, arch));
    const tar = spawnSync("tar", ["-czf", tarball, "-C", stageDir, "mesh-llm"], {
      encoding: "utf8",
    });
    if (tar.status !== 0) {
      throw new Error(`tar failed for macOS ${arch}: ${tar.stderr.trim()}`);
    }

    return {
      arch,
      tarball,
      sha256: sha256File(tarball),
    };
  } finally {
    rmSync(stageDir, { recursive: true, force: true });
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const options: Record<string, string> = {};
  const binaries: ReleaseBinary[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${token} requires a value`);
    }
    if (key === "binary") {
      binaries.push(parseBinary(value));
      index += 1;
      continue;
    }
    options[key] = value;
    index += 1;
  }
  return { options, binaries };
}

function parseBinary(value: string): ReleaseBinary {
  const separator = value.indexOf("=");
  if (separator <= 0 || separator === value.length - 1) {
    throw new Error(`--binary must be arch=path, got: ${value}`);
  }
  const arch = value.slice(0, separator);
  if (!ARCHES.includes(arch as Arch)) {
    throw new Error(`unsupported macOS arch for --binary: ${arch}`);
  }
  return {
    arch: arch as Arch,
    path: value.slice(separator + 1),
  };
}

function requiredOption(args: ParsedArgs, name: string): string {
  const value = args.options[name];
  if (!value) {
    throw new Error(`--${name} is required`);
  }
  return value;
}

function inputFromArgs(args: ParsedArgs): ReleaseInput {
  const version = requiredOption(args, "version");
  const binaries = [...args.binaries];
  if (args.options["arm64-binary"]) {
    binaries.push({ arch: "arm64", path: args.options["arm64-binary"] });
  }
  if (args.options["amd64-binary"]) {
    binaries.push({ arch: "amd64", path: args.options["amd64-binary"] });
  }
  const outputDir = resolve(process.cwd(), requiredOption(args, "output-dir"));
  return {
    version,
    binaries,
    outputDir,
    templatePath: resolve(process.cwd(), args.options.template ?? DEFAULT_TEMPLATE),
    formulaOutput: resolve(process.cwd(), args.options["formula-output"] ?? resolve(outputDir, "Formula/mesh-llm.rb")),
  };
}

export function main(argv: string[]): number {
  try {
    const output = stageMacosRelease(inputFromArgs(parseArgs(argv)));
    console.log(JSON.stringify(output, null, 2));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    printUsage();
    return 1;
  }
}

function printUsage(): void {
  console.error(
    "usage: homebrew-release.ts --version VERSION --binary ARCH=PATH [--binary ARCH=PATH ...] --output-dir DIR [--template PATH] [--formula-output PATH]",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
