import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { test } from "node:test";
import {
  assembleReleaseEvidence,
  compareExistingRelease,
  main,
  verifyReleaseEvidence,
  type AssemblyOptions,
} from "../scripts/release-evidence.ts";

const meshSha = "a".repeat(40);
const packagingSha = "b".repeat(40);

function digest(contents: string | Buffer): string {
  return createHash("sha256").update(contents).digest("hex");
}

function fixture(t: { after(callback: () => void): void }) {
  const root = mkdtempSync(resolve(tmpdir(), "release-evidence-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const input = resolve(root, "native");
  const homebrew = resolve(root, "homebrew");
  const output = resolve(root, "output");
  const metadata = resolve(root, "metadata");
  const matrix = resolve(root, "matrix.json");
  mkdirSync(input, { recursive: true });
  mkdirSync(homebrew, { recursive: true });
  const rows = Array.from({ length: 11 }, (_, index) => {
    const artifact_id = `row-${index.toString().padStart(2, "0")}`;
    const extension = index < 8 ? "deb" : "pkg.tar.zst";
    const package_file = `mesh-llm-0.74.0-test-amd64-backend${index}.${extension}`;
    const directory = resolve(input, artifact_id);
    mkdirSync(directory);
    const contents = `package ${index}\n`;
    const sha256 = digest(contents);
    writeFileSync(resolve(directory, package_file), contents);
    writeFileSync(resolve(directory, `${package_file}.sha256`), `${sha256}  ${package_file}\n`);
    writeFileSync(resolve(directory, `${artifact_id}.spdx.json`), JSON.stringify({
      spdxVersion: "SPDX-2.3",
      files: [{
        SPDXID: `SPDXRef-File-${index}`,
        fileName: package_file,
        checksums: [{ algorithm: "SHA256", checksumValue: sha256 }],
      }],
    }));
    writeFileSync(resolve(directory, `${artifact_id}.upstream-provenance.json`), JSON.stringify({
      host_sha256: "c".repeat(64),
      runtime_id: artifact_id,
      runtime_sha256: "d".repeat(64),
    }));
    writeFileSync(resolve(directory, `${artifact_id}.buildkit-provenance.json`), JSON.stringify({
      _type: "https://in-toto.io/Statement/v1",
      subject: [{ name: package_file, digest: { sha256 } }],
      predicateType: "https://slsa.dev/provenance/v1",
      predicate: { buildType: "https://mobyproject.org/buildkit@v1" },
    }));
    return { artifact_id, package_file };
  });
  writeFileSync(matrix, JSON.stringify({ include: rows }));
  writeFileSync(resolve(homebrew, "mesh-llm.rb"), "class MeshLlm < Formula\nend\n");
  const options: AssemblyOptions = {
    input,
    homebrew,
    output,
    metadata,
    matrix,
    version: "0.74.0",
    mesh_ref: "v0.74.0",
    mesh_sha: meshSha,
    packaging_sha: packagingSha,
  };
  return { root, rows, options };
}

function localAssets(output: string) {
  return readdirSync(output).sort().map((name) => ({
    name,
    digest: `sha256:${digest(readFileSync(resolve(output, name)))}`,
  }));
}

test("assembles and re-verifies one deterministic 11-subject release", (t) => {
  const value = fixture(t);
  const subjects = assembleReleaseEvidence(value.options);
  assert.equal(subjects.length, 11);
  assert.equal(readdirSync(value.options.output).length, 47);
  assert.equal(verifyReleaseEvidence(
    value.options.output,
    value.options.matrix,
    value.options,
  ).length, 11);
  const provenance = JSON.parse(readFileSync(resolve(value.options.output, "provenance.json"), "utf8"));
  assert.equal(provenance._type, "https://in-toto.io/Statement/v1");
  assert.equal(provenance.predicateType, "https://meshllm.cloud/distribution-provenance/v1");
  assert.equal(provenance.subject.length, 11);
  assert.equal(provenance.predicate.packages.length, 11);
  assert.deepEqual(
    provenance.subject.map((subject: { name: string }) => subject.name),
    [...value.rows].map((row) => row.package_file).sort(),
  );
  assert.equal(
    readFileSync(resolve(value.options.metadata, "package-subjects.sha256"), "utf8").trim().split("\n").length,
    11,
  );
  const checksumNames = readFileSync(resolve(value.options.output, "SHA256SUMS"), "utf8")
    .trim().split("\n").map((line) => line.slice(66));
  assert.equal(checksumNames.includes("SHA256SUMS"), false);
  assert.equal(checksumNames.length, 46);
});

test("identical releases are no-ops and any metadata or asset drift fails closed", (t) => {
  const value = fixture(t);
  assembleReleaseEvidence(value.options);
  const release = resolve(value.root, "release.json");
  const assets = resolve(value.root, "assets.json");
  const body = "Packages derived from verified Mesh-LLM/mesh-llm v0.74.0 at immutable-sha.\n";
  const record = {
    tag_name: "packaging-v0.74.0",
    name: "mesh-llm 0.74.0 packages",
    body,
    draft: false,
    prerelease: false,
    target_commitish: packagingSha,
  };
  writeFileSync(release, JSON.stringify(record));
  writeFileSync(assets, JSON.stringify(localAssets(value.options.output)));
  const comparison = {
    release,
    assets,
    output: value.options.output,
    tag: record.tag_name,
    title: record.name,
    body,
    targetSha: packagingSha,
  };
  assert.doesNotThrow(() => compareExistingRelease(comparison));
  for (const changed of [
    { ...record, tag_name: "packaging-v0.74.1" },
    { ...record, name: "wrong title" },
    { ...record, body: "wrong body\n" },
    { ...record, target_commitish: meshSha },
    { ...record, draft: true },
    { ...record, prerelease: true },
  ]) {
    writeFileSync(release, JSON.stringify(changed));
    assert.throws(() => compareExistingRelease(comparison), /does not match/);
  }
  writeFileSync(release, JSON.stringify(record));
  const changedAssets = localAssets(value.options.output);
  changedAssets[0] = { ...changedAssets[0], digest: `sha256:${"0".repeat(64)}` };
  writeFileSync(assets, JSON.stringify(changedAssets));
  assert.throws(() => compareExistingRelease(comparison), /does not match/);
  writeFileSync(assets, JSON.stringify(changedAssets.slice(1)));
  assert.throws(() => compareExistingRelease(comparison), /count/);
  writeFileSync(assets, JSON.stringify([...localAssets(value.options.output), localAssets(value.options.output)[0]]));
  assert.throws(() => compareExistingRelease(comparison), /duplicate/);
});

test("assembly rejects colliding, incomplete, or mismatched per-row evidence", (t) => {
  const duplicate = fixture(t);
  const duplicateDirectory = resolve(duplicate.options.input, "duplicate");
  mkdirSync(duplicateDirectory);
  const first = duplicate.rows[0].package_file;
  writeFileSync(resolve(duplicateDirectory, first), "collision\n");
  assert.throws(() => assembleReleaseEvidence(duplicate.options), /expected exactly one/);

  const mismatch = fixture(t);
  const row = mismatch.rows[0];
  const provenance = resolve(
    mismatch.options.input,
    row.artifact_id,
    `${row.artifact_id}.buildkit-provenance.json`,
  );
  const document = JSON.parse(readFileSync(provenance, "utf8"));
  document.subject[0].digest.sha256 = "0".repeat(64);
  writeFileSync(provenance, JSON.stringify(document));
  assert.throws(() => assembleReleaseEvidence(mismatch.options), /does not match/);

  const partial = fixture(t);
  const matrix = JSON.parse(readFileSync(partial.options.matrix, "utf8"));
  matrix.include.pop();
  writeFileSync(partial.options.matrix, JSON.stringify(matrix));
  assert.throws(() => assembleReleaseEvidence(partial.options), /complete 11-row matrix/);
});

test("release evidence CLI validates required modes and identities", (t) => {
  const value = fixture(t);
  assert.equal(main([
    "assemble",
    "--input", value.options.input,
    "--homebrew", value.options.homebrew,
    "--matrix", value.options.matrix,
    "--output", value.options.output,
    "--metadata", value.options.metadata,
    "--version", value.options.version,
    "--mesh-ref", value.options.mesh_ref,
    "--mesh-sha", value.options.mesh_sha,
    "--packaging-sha", value.options.packaging_sha,
  ]), 0);
  assert.equal(main(["unknown"]), 1);
  assert.equal(main(["verify"]), 1);
  const extra = resolve(value.options.output, "unexpected.txt");
  writeFileSync(extra, "unexpected\n");
  assert.throws(
    () => verifyReleaseEvidence(value.options.output, value.options.matrix, value.options),
    /asset set mismatch/,
  );
  assert.equal(basename(extra), "unexpected.txt");
});
