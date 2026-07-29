#!/usr/bin/env -S node --experimental-strip-types
import { createHash, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function sha256(contents: Buffer): string {
  return createHash("sha256").update(contents).digest("hex");
}

export function verifyProductSchema(producer: Buffer, consumer: Buffer): { sha256: string } {
  JSON.parse(producer.toString("utf8"));
  JSON.parse(consumer.toString("utf8"));
  if (producer.length !== consumer.length || !timingSafeEqual(producer, consumer)) {
    throw new Error(`product-v2 schema drift: producer=${sha256(producer)} consumer=${sha256(consumer)}`);
  }
  return { sha256: sha256(consumer) };
}

function requiredOption(argv: string[], name: string): string {
  const index = argv.indexOf(name);
  const value = index >= 0 ? argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`${name} is required`);
  return value;
}

export function main(argv: string[]): number {
  try {
    const producer = readFileSync(requiredOption(argv, "--producer-schema"));
    const consumer = readFileSync(requiredOption(argv, "--consumer-schema"));
    console.log(JSON.stringify(verifyProductSchema(producer, consumer)));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
