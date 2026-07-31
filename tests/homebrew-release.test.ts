import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";
import { main, normalizeHomebrewVersion, renderFormula, upstreamMacosAsset, validateSha256, writeFormula } from "../scripts/homebrew-release.ts";

const digest = "a".repeat(64);
test("renders an arm64-only formula against the upstream archive", (t) => {
  const directory = mkdtempSync(resolve(tmpdir(), "homebrew-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const template = resolve(directory, "template.rb");
  const output = resolve(directory, "Formula/mesh-llm.rb");
  writeFileSync(template, "{{VERSION}} {{ASSET}} {{MACOS_ARM64_SHA256}}");
  const result = writeFormula({ version: "refs/tags/v0.73.1", sha256: digest.toUpperCase(), templatePath: template, formulaOutput: output });
  assert.equal(result.asset, "mesh-llm-v0.73.1-aarch64-apple-darwin.tar.gz");
  assert.equal(readFileSync(output, "utf8"), `0.73.1 ${result.asset} ${digest}`);
});

test("validates inputs and CLI", (t) => {
  assert.equal(normalizeHomebrewVersion("v1.2.3-rc.1"), "1.2.3-rc.1");
  assert.throws(() => normalizeHomebrewVersion("main"), /invalid/);
  assert.equal(validateSha256(` ${digest} `), digest);
  assert.throws(() => validateSha256("bad"), /64-character/);
  assert.equal(upstreamMacosAsset("1.2.3"), "mesh-llm-v1.2.3-aarch64-apple-darwin.tar.gz");
  assert.equal(renderFormula("{{VERSION}} {{ASSET}} {{MACOS_ARM64_SHA256}}", "1.2.3", digest), `1.2.3 mesh-llm-v1.2.3-aarch64-apple-darwin.tar.gz ${digest}`);
  const directory = mkdtempSync(resolve(tmpdir(), "homebrew-cli-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const output = resolve(directory, "mesh-llm.rb");
  assert.equal(main(["--version", "0.73.1", "--sha256", digest, "--formula-output", output]), 0);
  assert.equal(main(["unexpected"]), 1);
  assert.equal(main(["--version", "0.73.1"]), 1);
});

test("formula test certifies isolated no-driver client readiness", () => {
  const template = readFileSync("packaging/homebrew/Formula/mesh-llm.rb.template", "utf8");
  for (const snippet of [
    "MESH_LLM_NATIVE_RUNTIME_CACHE_DIR",
    "MESH_LLM_RUNTIME_ROOT",
    '"--log-format", "json"',
    '"--no-console", "client"',
    "Client ready",
    'Process.kill("INT", pid)',
    "Timeout.timeout(10)",
  ]) assert.match(template, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(template, /"client", "--auto"/);
  assert.match(template, /assert_path_exists libexec\/"product-manifest\.json"/);
  assert.doesNotMatch(template, /rescue nil/);
});
