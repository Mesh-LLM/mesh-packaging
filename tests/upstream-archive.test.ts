import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { test } from "node:test";
import { main, parseChecksum, sha256File, validateArchiveEntries, verifyAndExtract } from "../scripts/upstream-archive.ts";

async function fixture(t: { after(callback: () => void): void }) {
  const directory = mkdtempSync(resolve(tmpdir(), "upstream-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bundle = resolve(directory, "stage/mesh-bundle");
  mkdirSync(bundle, { recursive: true });
  writeFileSync(resolve(bundle, "mesh-llm"), "#!/bin/sh\necho mesh-llm 0.73.1\n");
  chmodSync(resolve(bundle, "mesh-llm"), 0o755);
  const archive = resolve(directory, "mesh-llm-v0.73.1-x86_64-unknown-linux-gnu.tar.gz");
  assert.equal(spawnSync("tar", ["-czf", archive, "-C", resolve(directory, "stage"), "mesh-bundle"]).status, 0);
  const checksum = `${archive}.sha256`;
  writeFileSync(checksum, `${await sha256File(archive)}  ${basename(archive)}\n`);
  return { directory, archive, checksum };
}

test("verifies checksum, layout, extraction, and provenance", async (t) => {
  const data = await fixture(t);
  const outputDir = resolve(data.directory, "output");
  const result = await verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir, sourceUrl: "https://example.test/archive", version: "0.73.1", flavor: "cpu" });
  assert.match(readFileSync(result.binary, "utf8"), /mesh-llm/);
  assert.deepEqual(JSON.parse(readFileSync(result.provenance, "utf8")), { archive: basename(data.archive), flavor: "cpu", sha256: result.sha256, source_url: "https://example.test/archive", version: "0.73.1" });
});

test("rejects malformed checksums and unsafe layouts", async (t) => {
  const data = await fixture(t);
  assert.equal(parseChecksum(`${"A".repeat(64)} *${basename(data.archive)}\n`, basename(data.archive)), "a".repeat(64));
  assert.throws(() => parseChecksum("", basename(data.archive)), /exactly one/);
  assert.throws(() => parseChecksum(`bad  ${basename(data.archive)}`, basename(data.archive)), /SHA256SUMS/);
  assert.throws(() => parseChecksum(`${"a".repeat(64)}  wrong`, basename(data.archive)), /names wrong/);
  assert.throws(() => parseChecksum(`${"a".repeat(64)}  x\n${"b".repeat(64)}  y`, basename(data.archive)), /exactly one/);
  assert.throws(() => validateArchiveEntries(["../bad"]), /unsafe/);
  assert.throws(() => validateArchiveEntries(["/bad"]), /unsafe/);
  assert.throws(() => validateArchiveEntries(["mesh-bundle/", "mesh-bundle/other"]), /must contain only/);
  writeFileSync(data.checksum, `${"0".repeat(64)}  ${basename(data.archive)}\n`);
  await assert.rejects(() => verifyAndExtract({ archive: data.archive, checksum: data.checksum, outputDir: resolve(data.directory, "bad"), sourceUrl: "x", version: "x", flavor: "x" }), /mismatch/);
});

test("CLI rejects missing options and extracts valid input", async (t) => {
  const data = await fixture(t);
  assert.equal(await main([]), 1);
  assert.equal(await main(["bad"]), 1);
  assert.equal(await main(["--archive", data.archive, "--checksum", data.checksum, "--output-dir", resolve(data.directory, "cli"), "--source-url", "x", "--version", "0.73.1", "--flavor", "cpu"]), 0);
});
