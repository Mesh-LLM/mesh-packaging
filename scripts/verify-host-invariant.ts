#!/usr/bin/env -S node --experimental-strip-types
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

type Provenance = { arch: string; host_sha256: string; platform: string };
const SHA256 = /^[0-9a-f]{64}$/;

export function verifyHostInvariant(records: readonly Provenance[]): void {
  if (records.length === 0) throw new Error("no verified upstream provenance records were supplied");
  const byPlatform = new Map<string, Set<string>>();
  for (const record of records) {
    if (typeof record.platform !== "string" || !/^[a-z0-9]+\/[a-z0-9_]+$/.test(record.platform)) {
      throw new Error(`invalid provenance platform: ${String(record.platform)}`);
    }
    if (typeof record.arch !== "string" || !/^[a-z0-9_]+$/.test(record.arch)) {
      throw new Error(`invalid provenance architecture: ${String(record.arch)}`);
    }
    if (typeof record.host_sha256 !== "string" || !SHA256.test(record.host_sha256)) {
      throw new Error(`invalid host SHA-256 for ${record.platform}/${record.arch}`);
    }
    const key = `${record.platform}/${record.arch}`;
    const digests = byPlatform.get(key) ?? new Set<string>();
    digests.add(record.host_sha256);
    byPlatform.set(key, digests);
  }
  for (const [platform, digests] of byPlatform) {
    if (digests.size !== 1) {
      throw new Error(`backend product rows for ${platform} contain different host SHA-256 values: ${[...digests].sort().join(", ")}`);
    }
  }
}

export function main(argv: string[]): number {
  try {
    if (argv.length === 0) throw new Error("at least one provenance JSON path is required");
    verifyHostInvariant(argv.map((path) => JSON.parse(readFileSync(path, "utf8")) as Provenance));
    console.log(`verified one host SHA-256 per platform/architecture across ${argv.length} product rows`);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
