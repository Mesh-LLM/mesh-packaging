import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { consoleReferences, main, resolveNodeSdkSource, verifyNodeSdkSource } from "../scripts/verify-node-sdk-source.ts";

function fixture(t: { after(callback: () => void): void }, directory = "mesh/sdk/node") {
  const root = mkdtempSync(join(tmpdir(), "node-sdk-source-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, directory);
  const consoleRoot = join(source, "console");
  mkdirSync(join(consoleRoot, "assets"), { recursive: true });
  writeFileSync(join(source, "package.json"), JSON.stringify({ files: ["index.js", "console/"] }));
  writeFileSync(join(consoleRoot, "index.html"), '<script type="module" src="/assets/main.js"></script><link href="/assets/main.css?v=1&amp;theme=dark">');
  writeFileSync(join(consoleRoot, "assets/main.js"), "console.log('fixture');\n");
  writeFileSync(join(consoleRoot, "assets/main.css"), "body {}\n");
  writeFileSync(join(consoleRoot, ".gitkeep"), "");
  writeFileSync(join(consoleRoot, "manifest.txt"), "assets/main.css\nassets/main.js\nindex.html\n");
  return { root, source, consoleRoot };
}

test("verifies tagged console assets in current and historical SDK layouts without executing upstream code", (t) => {
  for (const layout of ["mesh/sdk/node", "sdk/node"]) {
    const paths = fixture(t, layout);
    assert.equal(verifyNodeSdkSource(paths.root), paths.source);
    assert.equal(main(["--source-root", paths.root]), 0);
  }
  assert.equal(main([]), 1);
});

test("rejects ambiguous SDK layouts and sources without an SDK", (t) => {
  const paths = fixture(t);
  const legacy = join(paths.root, "sdk/node");
  mkdirSync(legacy, { recursive: true });
  writeFileSync(join(legacy, "package.json"), "{}");
  assert.throws(() => resolveNodeSdkSource(paths.root), /ambiguous upstream/);
  rmSync(paths.source, { recursive: true });
  assert.equal(resolveNodeSdkSource(paths.root), legacy);
  rmSync(legacy, { recursive: true });
  assert.throws(() => resolveNodeSdkSource(paths.root), /neither mesh\/sdk\/node nor sdk\/node/);
});

test("rejects omitted console files, missing assets, stale manifests, and unsafe paths", (t) => {
  const paths = fixture(t);
  const metadata = join(paths.source, "package.json");
  writeFileSync(metadata, '{"files":["index.js"]}');
  assert.throws(() => verifyNodeSdkSource(paths.root), /must include console/);
  writeFileSync(metadata, '{"files":["console/"]}');
  const manifest = join(paths.consoleRoot, "manifest.txt");
  const original = readFileSync(manifest, "utf8");
  for (const [contents, error] of [
    ["assets/main.js\n", /must include index/],
    [`${original}index.html\n`, /duplicate/],
    [`${original}missing.js\n`, /does not match/],
    [`${original}../outside\n`, /unsafe/],
    [`${original}/absolute\n`, /unsafe/],
    [`${original}assets\\bad\n`, /unsafe/],
  ] as const) {
    writeFileSync(manifest, contents);
    assert.throws(() => verifyNodeSdkSource(paths.root), error);
  }
  writeFileSync(manifest, original);
  writeFileSync(join(paths.consoleRoot, "assets/extra.js"), "extra");
  assert.throws(() => verifyNodeSdkSource(paths.root), /does not match/);
  rmSync(join(paths.consoleRoot, "assets/extra.js"));
  rmSync(join(paths.consoleRoot, "assets/main.js"));
  writeFileSync(manifest, "index.html\nassets/main.css\n");
  assert.throws(() => verifyNodeSdkSource(paths.root), /must include JavaScript/);
});

test("rejects symlink assets and missing references even when the manifest matches", (t) => {
  const paths = fixture(t);
  writeFileSync(join(paths.consoleRoot, "index.html"), '<script src="/assets/missing.js"></script>');
  assert.throws(() => verifyNodeSdkSource(paths.root), /references missing asset/);
  symlinkSync(join(paths.consoleRoot, "index.html"), join(paths.consoleRoot, "linked.html"));
  assert.throws(() => verifyNodeSdkSource(paths.root), /must be a regular file/);
});

test("rejects a symlink console root and includes nested hidden files like the producer", (t) => {
  const paths = fixture(t);
  writeFileSync(join(paths.consoleRoot, "assets/.nested"), "nested");
  assert.throws(() => verifyNodeSdkSource(paths.root), /does not match/);
  const manifest = join(paths.consoleRoot, "manifest.txt");
  writeFileSync(manifest, `${readFileSync(manifest, "utf8")}assets/.nested\n`);
  assert.equal(verifyNodeSdkSource(paths.root), paths.source);
  rmSync(paths.consoleRoot, { recursive: true });
  symlinkSync(paths.root, paths.consoleRoot, "dir");
  assert.throws(() => verifyNodeSdkSource(paths.root), /must be a real directory/);
});

test("reads generated HTML URLs without treating comments, scripts, or other attribute values as tags", () => {
  const html = `<!-- <script src="missing-comment.js"></script> -->
    <script>const text = '<img src="missing-inline.png">'</script>
    <style>body::after { content: '<img src="missing-style.png">'; }</style>
    <img alt='src="missing-attribute.png"' src='/assets/image.png#fragment'>
    <SCRIPT SRC=assets/main.js></SCRIPT>
    <link href="https://example.com/font.css"><link href="//example.com/font.css">
    <a href="#local">anchor</a><img src="data:image/png;base64,AA==">
    <link href="/assets/main.css?a=1&amp;b=2">`;
  assert.deepEqual(consoleReferences(html), ["assets/image.png", "assets/main.js", "assets/main.css"]);
  assert.deepEqual(consoleReferences('<script src="&#47;assets/main.js"></script>'), ["assets/main.js"]);
  assert.throws(() => consoleReferences('<script src="../outside.js"></script>'), /unsafe/);
  assert.throws(() => consoleReferences('<script src="/%2e%2e/outside.js"></script>'), /unsafe/);
  assert.throws(() => consoleReferences('<link href="&unknown;">'), /unsupported.*entity/);
  assert.throws(() => consoleReferences('<script src="assets/main.js">'), /unterminated/);
  assert.throws(() => consoleReferences('<script src="assets/main.js></script>'), /malformed/);
  assert.throws(() => consoleReferences('<script src="bad></script><link href="good.css">'), /malformed/);
});
