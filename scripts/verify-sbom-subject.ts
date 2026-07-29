#!/usr/bin/env -S node --experimental-strip-types
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

type Checksum = {
  algorithm?: unknown;
  checksumValue?: unknown;
};

type SpdxFile = {
  fileName?: unknown;
  checksums?: unknown;
};

type SpdxDocument = {
  spdxVersion?: unknown;
  files?: unknown;
};

export type SbomSubject = {
  readonly name: string;
  readonly sha256: string;
};

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function parseSidecar(contents: string, expectedName: string): string {
  const lines = contents.trim().split(/\r?\n/);
  if (lines.length !== 1) throw new Error("checksum sidecar must contain exactly one line");
  const match = /^([0-9a-fA-F]{64}) [ *](.+)$/.exec(lines[0]);
  if (!match) throw new Error("checksum sidecar must use sha256sum format");
  if (match[2] !== expectedName) {
    throw new Error(`checksum sidecar names ${match[2]}, expected ${expectedName}`);
  }
  return match[1].toLowerCase();
}

function exactFileSubjects(document: SpdxDocument, expectedName: string): SpdxFile[] {
  if (document.spdxVersion !== "SPDX-2.3") throw new Error("SBOM must use SPDX-2.3");
  if (!Array.isArray(document.files)) throw new Error("SBOM does not contain a files array");
  return document.files.filter((entry): entry is SpdxFile => {
    if (!entry || typeof entry !== "object") return false;
    const fileName = (entry as SpdxFile).fileName;
    return typeof fileName === "string" && basename(fileName) === expectedName;
  });
}

function hasSha256(entry: SpdxFile, digest: string): boolean {
  if (!Array.isArray(entry.checksums)) return false;
  return entry.checksums.some((checksum: Checksum) => (
    checksum?.algorithm === "SHA256"
    && typeof checksum.checksumValue === "string"
    && checksum.checksumValue.toLowerCase() === digest
  ));
}

export function verifySbomSubject(
  packagePath: string,
  sidecarPath: string,
  sbomPath: string,
): SbomSubject {
  const name = basename(packagePath);
  const sidecarDigest = parseSidecar(readFileSync(sidecarPath, "utf8"), name);
  const packageDigest = sha256(packagePath);
  if (sidecarDigest !== packageDigest) {
    throw new Error(`package SHA-256 mismatch: sidecar=${sidecarDigest}, actual=${packageDigest}`);
  }
  const document = JSON.parse(readFileSync(sbomPath, "utf8")) as SpdxDocument;
  const subjects = exactFileSubjects(document, name);
  if (subjects.length !== 1) {
    throw new Error(`SBOM must contain exactly one file subject named ${name}, found ${subjects.length}`);
  }
  if (!hasSha256(subjects[0], packageDigest)) {
    throw new Error(`SBOM file subject ${name} does not contain SHA256 ${packageDigest}`);
  }
  return { name, sha256: packageDigest };
}

function parseArgs(argv: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`invalid argument near ${key ?? "end of input"}`);
    }
    values[key.slice(2)] = value;
  }
  return values;
}

function required(values: Record<string, string>, name: string): string {
  if (!values[name]) throw new Error(`--${name} is required`);
  return resolve(values[name]);
}

export function main(argv: string[]): number {
  try {
    const values = parseArgs(argv);
    const subject = verifySbomSubject(
      required(values, "package"),
      required(values, "sidecar"),
      required(values, "sbom"),
    );
    console.log(JSON.stringify(subject));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
