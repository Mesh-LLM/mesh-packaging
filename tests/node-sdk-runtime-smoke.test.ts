import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const smoke = resolve("scripts/node-sdk-runtime-smoke.cjs");

type FixtureBehavior = "normal" | "leak" | "start-failure" | "start-hang" | "stop-hang";

type FixtureEvent = { event: string; smokeRoot?: string };

function project(
  t: { after(callback: () => void): void },
  behavior: FixtureBehavior = "normal",
): { root: string; marker: string } {
  const root = mkdtempSync(resolve(tmpdir(), "node-sdk-runtime-smoke-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packageRoot = resolve(root, "node_modules/@mesh-llm/sdk");
  const marker = resolve(root, "events.jsonl");
  mkdirSync(packageRoot, { recursive: true });
  writeFileSync(resolve(root, "package.json"), '{"private":true}\n');
  writeFileSync(resolve(packageRoot, "package.json"), '{"name":"@mesh-llm/sdk","main":"index.js"}\n');
  writeFileSync(resolve(packageRoot, "index.js"), `
    const fs = require('node:fs')
    const append = (event) => fs.appendFileSync(process.env.SMOKE_MARKER, JSON.stringify(event) + '\\n')
    module.exports = {
      currentMeshVersion: () => '1.2.3',
      generateOwnerKeypairHex: () => 'owner-keypair',
      Node: { create(options) {
        if (!options.cacheDir || !options.runtimeDir || options.servingEnabled !== false) throw new Error('invalid isolation')
        if (!options.inviteToken.startsWith('packaging-smoke-test-target-')) throw new Error('invite token is not unique')
        append({ event: 'create', servingEnabled: options.servingEnabled, smokeRoot: require('node:path').dirname(options.cacheDir) })
        return {
          async start() {
            append({ event: 'start' })
            ${behavior === "start-failure" ? "throw new Error('start partially initialized')" : ""}
            ${behavior === "start-hang" ? "await new Promise(() => {})" : ""}
          },
          async status() { append({ event: 'status' }); return { connected: false, peerCount: 0 } },
          async stop() {
            append({ event: 'stop' })
            ${behavior === "leak" ? "setInterval(() => {}, 1000)" : ""}
            ${behavior === "stop-hang" ? "await new Promise(() => {})" : ""}
          }
        }
      } }
    }
  `);
  return { root, marker };
}

function fixtureEvents(marker: string): FixtureEvent[] {
  return readFileSync(marker, "utf8").trim().split("\n").map((line) => JSON.parse(line));
}

function assertSmokeRootRemoved(marker: string): void {
  const smokeRoot = fixtureEvents(marker)[0]?.smokeRoot;
  assert.equal(typeof smokeRoot, "string");
  assert.equal(existsSync(smokeRoot!), false, `smoke root still exists: ${smokeRoot}`);
}

test("runtime smoke starts, reads status, stops, and exits normally", (t) => {
  const fixture = project(t);
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root,
    "--expected-version", "1.2.3",
    "--target", "test-target",
    "--timeout-ms", "3000",
  ], { encoding: "utf8", timeout: 5000, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /runtime smoke passed/);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "status", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke fails a native addon that prevents normal process exit", (t) => {
  const fixture = project(t, "leak");
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root,
    "--expected-version", "1.2.3",
    "--target", "test-target",
    "--timeout-ms", "400",
  ], { encoding: "utf8", timeout: 3000, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not exit normally/);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "status", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke attempts stop when start partially initializes and rejects", (t) => {
  const fixture = project(t, "start-failure");
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root,
    "--expected-version", "1.2.3",
    "--target", "test-target",
    "--timeout-ms", "3000",
  ], { encoding: "utf8", timeout: 5000, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /start partially initialized/);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke handles SIGTERM by stopping a partially started Node and removing temp state", (t) => {
  const fixture = project(t, "start-hang");
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root,
    "--expected-version", "1.2.3",
    "--target", "test-target",
    "--timeout-ms", "400",
    "--shutdown-grace-ms", "1500",
  ], { encoding: "utf8", timeout: 3000, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not exit normally/);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke bounds SIGTERM cleanup before SIGKILL and parent temp cleanup", (t) => {
  const fixture = project(t, "stop-hang");
  const startedAt = performance.now();
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root,
    "--expected-version", "1.2.3",
    "--target", "test-target",
    "--timeout-ms", "400",
    "--shutdown-grace-ms", "200",
  ], { encoding: "utf8", timeout: 3000, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  const elapsed = performance.now() - startedAt;
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not exit normally/);
  assert.ok(elapsed < 2000, `forced cleanup took ${elapsed}ms`);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "status", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke validates required arguments", () => {
  const result = spawnSync(process.execPath, [smoke], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--expected-version is required/);
});

test("runtime smoke supervises graceful termination before forced termination", () => {
  const source = readFileSync(smoke, "utf8");
  assert.match(source, /process\.once\('SIGTERM', terminate\)/);
  assert.ok(source.indexOf("child.kill('SIGTERM')") < source.indexOf("child.kill('SIGKILL')"));
});

test("release workflow fresh-installs and starts every addon lane and the assembled package", () => {
  const workflow = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
  assert.match(workflow, /name: Pack, fresh-install, and start Node SDK addon/);
  assert.match(workflow, /NODE_SDK_TARGET: \$\{\{ matrix\.target \}\}/);
  assert.match(workflow, /npm install "\$tarball"/);
  assert.match(workflow, /node scripts\/node-sdk-runtime-smoke\.cjs/);
  assert.match(workflow, /--target "\$NODE_SDK_TARGET"/);
  assert.match(workflow, /--target linux-x64-assembled-package/);
});
