import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
    '"--auto", "--disable-iroh-relays"',
    '"--nostr-relay", "ws://127.0.0.1:1/"',
    "90.times do",
    "Client ready",
    'Process.kill("INT", pid)',
    "Timeout.timeout(30)",
  ]) assert.match(template, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(template, /assert_path_exists libexec\/"product-manifest\.json"/);
  assert.doesNotMatch(template, /rescue nil/);
});

test("formula preserves bundled plugin archives for the host's pinned defaults", () => {
  const template = readFileSync("packaging/homebrew/Formula/mesh-llm.rb.template", "utf8");
  assert.match(template, /libexec\.install "plugins" if File\.directory\?\("plugins"\)/);
});

test("formula rejects installed host bytes that differ from the product manifest", () => {
  const template = readFileSync("packaging/homebrew/Formula/mesh-llm.rb.template", "utf8");
  const checksum = template.indexOf('assert_equal manifest.fetch("host").fetch("sha256"), Digest::SHA256.file(bin/"mesh-llm").hexdigest');
  const startup = template.indexOf('shell_output("#{bin}/mesh-llm --version")');
  assert.ok(checksum >= 0 && checksum < startup);
});

test("formula cleanup kills and reaps a child that ignores TERM within bounded waits", () => {
  const template = readFileSync("packaging/homebrew/Formula/mesh-llm.rb.template", "utf8");
  const method = template.match(/^  def terminate_test_process\(pid\)\n[\s\S]*?^  end$/m)?.[0];
  assert.ok(method, "formula must provide bounded forced cleanup");
  const result = spawnSync("ruby", ["-e", `
require "timeout"
${method}
module Timeout
  class << self
    alias original_timeout timeout
    def timeout(seconds, &block)
      raise "unbounded cleanup wait" unless seconds == 5
      original_timeout(0.1, &block)
    end
  end
end
reader, writer = IO.pipe
pid = fork do
  reader.close
  Signal.trap("TERM", "IGNORE")
  writer.write("ready")
  writer.close
  loop { sleep 1 }
end
writer.close
begin
  raise "child not ready" unless reader.read == "ready"
  Timeout.original_timeout(2) { terminate_test_process(pid) }
  begin
    Process.wait(pid, Process::WNOHANG)
    raise "child was not reaped"
  rescue Errno::ECHILD
  end
  terminate_test_process(pid)
ensure
  reader.close
  begin
    Process.kill("KILL", pid)
    Process.wait(pid)
  rescue Errno::ESRCH, Errno::ECHILD
  end
end
`], { encoding: "utf8", timeout: 5_000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

test("Homebrew validation trusts only its generated formula before loading it", () => {
  const workflow = readFileSync(".github/workflows/images-release.yml", "utf8");
  const copy = workflow.indexOf('cp artifacts/homebrew/Formula/mesh-llm.rb "$tap_formula"');
  const trust = workflow.indexOf("brew trust --formula mesh-llm/packaging-validation/mesh-llm");
  const audit = workflow.indexOf("brew audit --strict --online mesh-llm/packaging-validation/mesh-llm");
  assert.ok(copy >= 0 && copy < trust && trust < audit);
  assert.doesNotMatch(workflow, /brew trust --tap|HOMEBREW_REQUIRE_TAP_TRUST/);
});

test("formula ships the native runtime past keg relocation and proves it loads", () => {
  const template = readFileSync("packaging/homebrew/Formula/mesh-llm.rb.template", "utf8");
  // Keg relocation rewrites install names and re-signs every Mach-O file, which
  // invalidates the runtime manifest's per-file digests. The runtime must be
  // staged as an archive and unpacked after relocation, not installed directly.
  assert.doesNotMatch(template, /libexec\.install "native-runtimes"/);
  assert.match(template, /tar", "czf", libexec\/"native-runtime\.tar\.gz", "native-runtimes"/);
  assert.match(template, /post_install_steps do/);
  assert.match(template, /"xzf", "\{\{libexec\}\}\/native-runtime\.tar\.gz"/);
  // `runtime list` exits 0 and still prints a warning naming any rejected
  // runtime, so asserting on "native runtime" alone passes on a broken install.
  assert.doesNotMatch(template, /assert_match "native runtime"/);
  assert.match(template, /assert_match "meshllm-native-runtime-darwin-aarch64-metal", runtimes/);
  assert.match(template, /refute_match "malformed native runtime", runtimes/);
  assert.match(template, /refute_match "No local native runtimes found", runtimes/);
});
