import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  main,
  normalizeHomebrewVersion,
  renderFormula,
  sha256File,
  stageMacosRelease,
  tarballName,
} from "../scripts/homebrew-release.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = resolve(ROOT, "scripts/homebrew-release.ts");
const TEMPLATE = resolve(ROOT, "packaging/homebrew/Formula/mesh-llm.rb.template");

function tempDir(t: { after(callback: () => void): void }): string {
  const directory = mkdtempSync(resolve(tmpdir(), "homebrew-release-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function writeBinary(path: string, label: string): void {
  writeFileSync(path, `#!/bin/sh\necho ${label}\n`);
}

test("normalizes versions and renders formula placeholders", () => {
  assert.equal(normalizeHomebrewVersion(" refs/tags/v1.2.3-beta.1 "), "1.2.3-beta.1");
  assert.equal(normalizeHomebrewVersion("v1.2.3"), "1.2.3");
  assert.throws(() => normalizeHomebrewVersion("1.2"), /invalid mesh-llm version: 1\.2/);
  assert.equal(tarballName("1.2.3", "arm64"), "mesh-llm-1.2.3-macos-arm64.tar.gz");

  assert.equal(
    renderFormula("{{VERSION}}\n{{MACOS_DOWNLOAD_BLOCKS}}", "1.2.3", [
      {
        arch: "arm64",
        tarball: "/tmp/mesh-llm-1.2.3-macos-arm64.tar.gz",
        sha256: "arm",
      },
      {
        arch: "amd64",
        tarball: "/tmp/mesh-llm-1.2.3-macos-amd64.tar.gz",
        sha256: "amd",
      },
    ]),
    [
      "1.2.3",
      "  on_arm do",
      '    url "https://github.com/Mesh-LLM/mesh-agent-images/releases/download/v1.2.3/mesh-llm-1.2.3-macos-arm64.tar.gz"',
      '    sha256 "arm"',
      "  end",
      "",
      "  on_intel do",
      '    url "https://github.com/Mesh-LLM/mesh-agent-images/releases/download/v1.2.3/mesh-llm-1.2.3-macos-amd64.tar.gz"',
      '    sha256 "amd"',
      "  end",
    ].join("\n"),
  );
});

test("stages macOS tarballs and rendered Homebrew formula", (t) => {
  const directory = tempDir(t);
  const arm64Binary = resolve(directory, "mesh-llm-arm64");
  const amd64Binary = resolve(directory, "mesh-llm-amd64");
  const outputDir = resolve(directory, "dist");
  const formulaOutput = resolve(directory, "Formula/mesh-llm.rb");
  writeBinary(arm64Binary, "arm64");
  writeBinary(amd64Binary, "amd64");

  const output = stageMacosRelease({
    version: "v1.2.3",
    binaries: [
      { arch: "arm64", path: arm64Binary },
      { arch: "amd64", path: amd64Binary },
    ],
    outputDir,
    templatePath: TEMPLATE,
    formulaOutput,
  });

  assert.equal(output.version, "1.2.3");
  assert.equal(output.formula, formulaOutput);
  assert.equal(existsSync(output.checksums), true);
  assert.equal(output.tarballs.length, 2);
  for (const tarball of output.tarballs) {
    assert.equal(existsSync(tarball.tarball), true);
    assert.equal(tarball.sha256, sha256File(tarball.tarball));
    const checksumLine = `${tarball.sha256}  ${basename(tarball.tarball)}\n`;
    assert.equal(readFileSync(`${tarball.tarball}.sha256`, "utf8"), checksumLine);
    assert.equal(readFileSync(output.checksums, "utf8").includes(checksumLine), true);
    const listing = execFileSync("tar", ["-tzf", tarball.tarball], { encoding: "utf8" });
    assert.equal(listing.trim(), "mesh-llm");
  }

  const formula = readFileSync(formulaOutput, "utf8");
  assert.match(
    formula,
    /https:\/\/github\.com\/Mesh-LLM\/mesh-agent-images\/releases\/download\/v1\.2\.3\/mesh-llm-1\.2\.3-macos-arm64\.tar\.gz/,
  );
  assert.match(
    formula,
    /https:\/\/github\.com\/Mesh-LLM\/mesh-agent-images\/releases\/download\/v1\.2\.3\/mesh-llm-1\.2\.3-macos-amd64\.tar\.gz/,
  );
  assert.match(formula, /mesh-llm-1\.2\.3-macos-arm64\.tar\.gz/);
  assert.match(formula, /mesh-llm-1\.2\.3-macos-amd64\.tar\.gz/);
  assert.match(formula, /on_arm do/);
  assert.match(formula, /on_intel do/);
  assert.doesNotMatch(formula, /{{/);
});

test("stages an arm64-only macOS Homebrew release", (t) => {
  const directory = tempDir(t);
  const arm64Binary = resolve(directory, "mesh-llm-arm64");
  const outputDir = resolve(directory, "dist");
  const formulaOutput = resolve(directory, "Formula/mesh-llm.rb");
  writeBinary(arm64Binary, "arm64");

  const output = stageMacosRelease({
    version: "v1.2.3",
    binaries: [{ arch: "arm64", path: arm64Binary }],
    outputDir,
    templatePath: TEMPLATE,
    formulaOutput,
  });

  assert.equal(output.tarballs.length, 1);
  assert.equal(output.tarballs[0].arch, "arm64");
  const formula = readFileSync(formulaOutput, "utf8");
  assert.match(formula, /on_arm do/);
  assert.doesNotMatch(formula, /on_intel do/);
  assert.match(formula, /mesh-llm-1\.2\.3-macos-arm64\.tar\.gz/);
  assert.doesNotMatch(formula, /mesh-llm-1\.2\.3-macos-amd64\.tar\.gz/);
});

test("CLI writes JSON output and reports validation errors", (t) => {
  const directory = tempDir(t);
  const arm64Binary = resolve(directory, "arm64");
  const amd64Binary = resolve(directory, "amd64");
  writeBinary(arm64Binary, "arm64");
  writeBinary(amd64Binary, "amd64");

  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      SCRIPT,
      "--version",
      "v1.2.3",
      "--binary",
      `arm64=${arm64Binary}`,
      "--binary",
      `amd64=${amd64Binary}`,
      "--output-dir",
      resolve(directory, "dist"),
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.version, "1.2.3");
  assert.equal(output.tarballs.length, 2);

  const missingOption = spawnSync(
    process.execPath,
    ["--experimental-strip-types", SCRIPT, "--version", "v1.2.3", "--output-dir", resolve(directory, "missing-dist")],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
  assert.equal(missingOption.status, 1);
  assert.match(missingOption.stderr, /at least one --binary arch=path entry is required/);

  const legacyResult = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      SCRIPT,
      "--version",
      "v1.2.3",
      "--arm64-binary",
      arm64Binary,
      "--amd64-binary",
      amd64Binary,
      "--output-dir",
      resolve(directory, "legacy-dist"),
    ],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(legacyResult.status, 0, legacyResult.stderr);
  assert.equal(JSON.parse(legacyResult.stdout).tarballs.length, 2);
});

test("main returns nonzero for parser errors without exiting", () => {
  const messages: string[] = [];
  const originalError = console.error;
  console.error = (message?: unknown, ...optionalParams: unknown[]) => {
    messages.push([message, ...optionalParams].map(String).join(" "));
  };
  try {
    assert.equal(main(["unexpected"]), 1);
  } finally {
    console.error = originalError;
  }
  assert.match(messages.join("\n"), /unexpected argument: unexpected/);
});
