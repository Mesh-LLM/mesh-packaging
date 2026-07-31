import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import { test } from "node:test";
import { main, parseSidecar, verifySbomSubject } from "../scripts/verify-sbom-subject.ts";

function fixture(
  t: { after(callback: () => void): void },
  name: string,
  representation: "file" | "described-package" = "file",
) {
  const directory = mkdtempSync(resolve(tmpdir(), "sbom-subject-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const packagePath = resolve(directory, name);
  const sidecarPath = `${packagePath}.sha256`;
  const sbomPath = resolve(directory, "package.spdx.json");
  writeFileSync(packagePath, `package bytes for ${name}\n`);
  const digest = createHash("sha256").update(readFileSync(packagePath)).digest("hex");
  writeFileSync(sidecarPath, `${digest}  ${name}\n`);
  const subject = {
    SPDXID: "SPDXRef-DocumentRoot-File-package",
    checksums: [{ algorithm: "SHA256", checksumValue: digest }],
  };
  writeFileSync(sbomPath, JSON.stringify(representation === "file" ? {
    spdxVersion: "SPDX-2.3",
    files: [{
      ...subject,
      SPDXID: "SPDXRef-File-package",
      fileName: name,
    }],
  } : {
    spdxVersion: "SPDX-2.3",
    packages: [{
      ...subject,
      name,
      primaryPackagePurpose: "FILE",
    }],
    relationships: [{
      spdxElementId: "SPDXRef-DOCUMENT",
      relatedSpdxElement: subject.SPDXID,
      relationshipType: "DESCRIBES",
    }],
  }));
  return { directory, packagePath, sidecarPath, sbomPath, digest, name };
}

for (const name of [
  "mesh-llm-0.74.0-ubuntu-arm64-cpu.deb",
  "mesh-llm-0.74.0-arch-amd64-cpu.pkg.tar.zst",
]) {
  test(`verifies the exact ${name.split(".").at(-1)} package subject`, (t) => {
    const representation = name.endsWith(".pkg.tar.zst") ? "described-package" : "file";
    const value = fixture(t, name, representation);
    assert.deepEqual(verifySbomSubject(value.packagePath, value.sidecarPath, value.sbomPath), {
      name,
      sha256: value.digest,
    });
    assert.equal(main([
      "--package", value.packagePath,
      "--sidecar", value.sidecarPath,
      "--sbom", value.sbomPath,
    ]), 0);
  });
}

test("rejects generic, ambiguous, stale, and malformed package identity", (t) => {
  const value = fixture(t, "mesh-llm-0.74.0-arch-amd64-cuda13.3.1.pkg.tar.zst");
  const valid = JSON.parse(readFileSync(value.sbomPath, "utf8"));
  const invalidDocuments = [
    { spdxVersion: "SPDX-2.3", files: [] },
    { ...valid, spdxVersion: "SPDX-2.2" },
    { ...valid, files: [{ ...valid.files[0], fileName: "artifacts/native-package" }] },
    { ...valid, files: [valid.files[0], valid.files[0]] },
    { ...valid, files: [{ ...valid.files[0], checksums: [{ algorithm: "SHA1", checksumValue: value.digest }] }] },
    { ...valid, files: [{ ...valid.files[0], checksums: [{ algorithm: "SHA256", checksumValue: "0".repeat(64) }] }] },
  ];
  for (const document of invalidDocuments) {
    writeFileSync(value.sbomPath, JSON.stringify(document));
    assert.throws(
      () => verifySbomSubject(value.packagePath, value.sidecarPath, value.sbomPath),
      /SBOM/,
    );
  }

  writeFileSync(value.sbomPath, JSON.stringify(valid));
  writeFileSync(value.packagePath, "mutated package\n");
  assert.throws(
    () => verifySbomSubject(value.packagePath, value.sidecarPath, value.sbomPath),
    /package SHA-256 mismatch/,
  );
  assert.equal(main([]), 1);
  assert.throws(() => parseSidecar(`${value.digest}  wrong.deb\n`, basename(value.packagePath)), /names/);
  assert.throws(() => parseSidecar("not-a-checksum", basename(value.packagePath)), /sha256sum/);
  assert.throws(
    () => parseSidecar(`${value.digest}  ${basename(value.packagePath)}\n${value.digest}  extra\n`, basename(value.packagePath)),
    /exactly one/,
  );
});

test("requires package-form file subjects to be the exact document-described root", (t) => {
  const value = fixture(t, "mesh-llm-0.74.0-arch-amd64-cpu.pkg.tar.zst", "described-package");
  const valid = JSON.parse(readFileSync(value.sbomPath, "utf8"));
  const invalidDocuments = [
    { ...valid, relationships: [] },
    { ...valid, relationships: [{ ...valid.relationships[0], relationshipType: "CONTAINS" }] },
    { ...valid, packages: [{ ...valid.packages[0], primaryPackagePurpose: "APPLICATION" }] },
    { ...valid, packages: [{ ...valid.packages[0], name: "wrong.pkg.tar.zst" }] },
  ];
  for (const document of invalidDocuments) {
    writeFileSync(value.sbomPath, JSON.stringify(document));
    assert.throws(
      () => verifySbomSubject(value.packagePath, value.sidecarPath, value.sbomPath),
      /SBOM/,
    );
  }
});

test("accepts Syft's dual file and described-package representation as one logical subject", (t) => {
  const value = fixture(t, "mesh-llm-0.74.0-ubuntu-amd64-cpu.deb", "described-package");
  const valid = JSON.parse(readFileSync(value.sbomPath, "utf8"));
  valid.files = [{
    SPDXID: "SPDXRef-File-package",
    fileName: value.name,
    checksums: [{ algorithm: "SHA256", checksumValue: value.digest }],
  }];
  writeFileSync(value.sbomPath, JSON.stringify(valid));
  assert.deepEqual(verifySbomSubject(value.packagePath, value.sidecarPath, value.sbomPath), {
    name: value.name,
    sha256: value.digest,
  });

  valid.files.push(valid.files[0]);
  writeFileSync(value.sbomPath, JSON.stringify(valid));
  assert.throws(
    () => verifySbomSubject(value.packagePath, value.sidecarPath, value.sbomPath),
    /one logical file subject/,
  );
});
