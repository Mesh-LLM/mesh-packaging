import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { verifyHostInvariant } from "../scripts/verify-host-invariant.ts";
import { verifyProductSchema } from "../scripts/verify-product-schema.ts";

const sha = (character: string) => character.repeat(64);

test("product schema verifier accepts exact bytes and rejects schema drift", () => {
  const schema = Buffer.from('{"schema_version":2}\n');
  assert.deepEqual(verifyProductSchema(schema, Buffer.from(schema)), {
    sha256: "f3d8a19f6b3bc52dbb1fb06e455e04c1a252308544786a30a6d21df70a476ddc",
  });
  assert.throws(() => verifyProductSchema(schema, Buffer.from('{"schema_version":3}\n')), /schema drift/);
  assert.throws(() => verifyProductSchema(Buffer.from("not json"), schema), /Unexpected token/);
});

test("host invariant rejects backend products with different hosts for one platform", () => {
  assert.doesNotThrow(() => verifyHostInvariant([
    { platform: "linux/amd64", arch: "amd64", host_sha256: sha("a") },
    { platform: "linux/amd64", arch: "amd64", host_sha256: sha("a") },
    { platform: "linux/arm64", arch: "arm64", host_sha256: sha("b") },
  ]));
  assert.throws(() => verifyHostInvariant([
    { platform: "linux/amd64", arch: "amd64", host_sha256: sha("a") },
    { platform: "linux/amd64", arch: "amd64", host_sha256: sha("b") },
  ]), /different host SHA-256/);
  assert.throws(() => verifyHostInvariant([{ platform: "linux/amd64", arch: "amd64", host_sha256: "bad" }]), /invalid host/);
});

test("release workflow verifies the producer schema and gates package rows on host identity", () => {
  const contents = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
  assert.match(contents, /Verify producer product-v2 schema/);
  assert.match(contents, /verify-product-schema\.ts/);
  assert.match(contents, /upstream-host-invariant:/);
  assert.match(contents, /needs: \[plan, upstream, upstream-host-invariant\]/);
});

test("schema verifier CLI reports mismatched producer bytes", (t) => {
  const directory = mkdtempSync(resolve(tmpdir(), "product-contract-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const producer = resolve(directory, "producer.json");
  const consumer = resolve(directory, "consumer.json");
  writeFileSync(producer, "{}\n");
  writeFileSync(consumer, "{}\n");
  assert.equal(spawnSync("node", ["--experimental-strip-types", "scripts/verify-product-schema.ts", "--producer-schema", producer, "--consumer-schema", consumer], { encoding: "utf8" }).status, 0);
  writeFileSync(consumer, "{ }\n");
  assert.notEqual(spawnSync("node", ["--experimental-strip-types", "scripts/verify-product-schema.ts", "--producer-schema", producer, "--consumer-schema", consumer], { encoding: "utf8" }).status, 0);
});

test("host invariant CLI rejects invalid provenance", (t) => {
  const directory = mkdtempSync(resolve(tmpdir(), "host-invariant-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const first = resolve(directory, "first.json");
  const second = resolve(directory, "second.json");
  writeFileSync(first, JSON.stringify({ platform: "linux/amd64", arch: "amd64", host_sha256: sha("a") }));
  writeFileSync(second, JSON.stringify({ platform: "linux/amd64", arch: "amd64", host_sha256: sha("b") }));
  assert.notEqual(spawnSync("node", ["--experimental-strip-types", "scripts/verify-host-invariant.ts", first, second], { encoding: "utf8" }).status, 0);
  assert.notEqual(spawnSync("node", ["--experimental-strip-types", "scripts/verify-host-invariant.ts"], { encoding: "utf8" }).status, 0);
});
