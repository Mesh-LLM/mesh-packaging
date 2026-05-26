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
};

type ReleaseInput = {
  version: string;
  arm64Binary: string;
  amd64Binary: string;
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

export function renderFormula(template: string, version: string, arm64Sha256: string, amd64Sha256: string): string {
  return template
    .replaceAll("{{VERSION}}", version)
    .replaceAll("{{MACOS_ARM64_SHA256}}", arm64Sha256)
    .replaceAll("{{MACOS_AMD64_SHA256}}", amd64Sha256);
}

export function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function stageMacosRelease(input: ReleaseInput): ReleaseOutput {
  const version = normalizeHomebrewVersion(input.version);
  const binaries: Record<Arch, string> = {
    arm64: input.arm64Binary,
    amd64: input.amd64Binary,
  };

  mkdirSync(input.outputDir, { recursive: true });
  mkdirSync(dirname(input.formulaOutput), { recursive: true });

  const tarballs = ARCHES.map((arch) => createTarball(version, arch, binaries[arch], input.outputDir));
  const checksums = writeChecksums(input.outputDir, tarballs);
  const arm64 = tarballs.find((entry) => entry.arch === "arm64");
  const amd64 = tarballs.find((entry) => entry.arch === "amd64");
  if (!arm64 || !amd64) {
    throw new Error("internal error: missing macOS tarball output");
  }

  const template = readFileSync(input.templatePath, "utf8");
  const formula = renderFormula(template, version, arm64.sha256, amd64.sha256);
  writeFileSync(input.formulaOutput, formula);

  return {
    version,
    formula: input.formulaOutput,
    checksums,
    tarballs,
  };
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
    options[key] = value;
    index += 1;
  }
  return { options };
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
  const arm64Binary = requiredOption(args, "arm64-binary");
  const amd64Binary = requiredOption(args, "amd64-binary");
  const outputDir = resolve(process.cwd(), requiredOption(args, "output-dir"));
  return {
    version,
    arm64Binary,
    amd64Binary,
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
    "usage: homebrew-release.ts --version VERSION --arm64-binary PATH --amd64-binary PATH --output-dir DIR [--template PATH] [--formula-output PATH]",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
