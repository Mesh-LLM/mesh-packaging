#!/usr/bin/env -S node --experimental-strip-types
import { basename, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fileDigest } from "./file-digest.ts";
import { pathToFileURL } from "node:url";

type Checksum = {
  algorithm?: unknown;
  checksumValue?: unknown;
};

type SpdxFile = {
  SPDXID?: unknown;
  fileName?: unknown;
  checksums?: unknown;
};

type SpdxPackage = {
  SPDXID?: unknown;
  name?: unknown;
  primaryPackagePurpose?: unknown;
  checksums?: unknown;
};

type SpdxRelationship = {
  spdxElementId?: unknown;
  relatedSpdxElement?: unknown;
  relationshipType?: unknown;
};

type SpdxDocument = {
  spdxVersion?: unknown;
  files?: unknown;
  packages?: unknown;
  relationships?: unknown;
};

export type SbomSubject = {
  readonly name: string;
  readonly sha256: string;
};

function sha256(path: string): string {
  return fileDigest(path);
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

type SpdxSubject = SpdxFile | SpdxPackage;
type ExactSubjects = {
  files: SpdxFile[];
  packages: SpdxPackage[];
};

function describedPackageIds(document: SpdxDocument): Set<string> {
  if (!Array.isArray(document.relationships)) return new Set();
  return new Set(document.relationships.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const relationship = entry as SpdxRelationship;
    if (
      relationship.spdxElementId !== "SPDXRef-DOCUMENT"
      || relationship.relationshipType !== "DESCRIBES"
      || typeof relationship.relatedSpdxElement !== "string"
    ) return [];
    return [relationship.relatedSpdxElement];
  }));
}

function exactFileSubjects(document: SpdxDocument, expectedName: string): ExactSubjects {
  if (document.spdxVersion !== "SPDX-2.3") throw new Error("SBOM must use SPDX-2.3");
  const files = Array.isArray(document.files) ? document.files : [];
  const fileSubjects = files.filter((entry): entry is SpdxFile => {
    if (!entry || typeof entry !== "object") return false;
    const fileName = (entry as SpdxFile).fileName;
    return typeof fileName === "string" && basename(fileName) === expectedName;
  });
  const describedIds = describedPackageIds(document);
  const packages = Array.isArray(document.packages) ? document.packages : [];
  const packageSubjects = packages.filter((entry): entry is SpdxPackage => {
    if (!entry || typeof entry !== "object") return false;
    const subject = entry as SpdxPackage;
    return subject.name === expectedName
      && subject.primaryPackagePurpose === "FILE"
      && typeof subject.SPDXID === "string"
      && describedIds.has(subject.SPDXID);
  });
  return { files: fileSubjects, packages: packageSubjects };
}

function hasSha256(entry: SpdxSubject, digest: string): boolean {
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
  const { files, packages } = exactFileSubjects(document, name);
  if (files.length > 1 || packages.length > 1 || files.length + packages.length === 0) {
    throw new Error(
      `SBOM must contain one logical file subject named ${name}; `
      + `found ${files.length} file entries and ${packages.length} described package entries`,
    );
  }
  for (const subject of [...files, ...packages]) {
    if (!hasSha256(subject, packageDigest)) {
      throw new Error(`SBOM file subject ${name} does not contain SHA256 ${packageDigest}`);
    }
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
