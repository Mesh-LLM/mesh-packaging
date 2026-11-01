import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const smoke = resolve("scripts/node-sdk-runtime-smoke.cjs");
const nativeTarget = `${process.platform}-${process.arch}`;
// Allow both Node processes to start under host load before testing timeouts.
const fixtureTimeoutMs = 5000;
const fixtureProcessTimeoutMs = 10000;

type FixtureBehavior = "normal" | "leak" | "start-failure" | "start-hang" | "stop-hang" | "not-running";

type FixtureEvent = { event: string; smokeRoot?: string };

/** Create an SDK fixture that records lifecycle calls and can stall or reject them. */
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
      Node: { fromConfig(options) {
        if (options.mode !== 'client' || options.storage.isolated_config !== true) throw new Error('invalid isolation')
        if (options.network.auto_join !== false || options.network.publish !== false || !options.network.disable_iroh_relays) throw new Error('external discovery enabled')
        if (!options.network.mesh_name.startsWith('packaging-smoke-${nativeTarget}-')) throw new Error('mesh name is not unique')
        if (options.http.api_port < 1 || options.http.console_port < 1 || options.http.api_port === options.http.console_port) throw new Error('ports are not isolated')
        const path = require('node:path')
        const smokeRoot = path.dirname(options.admission.owner_key)
        for (const key of ['HOME', 'USERPROFILE', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'MESH_LLM_RUNTIME_ROOT', 'MESH_LLM_NATIVE_RUNTIME_CACHE_DIR']) {
          if (!process.env[key].startsWith(smokeRoot + path.sep)) throw new Error('environment is not isolated: ' + key)
        }
        append({ event: 'create', smokeRoot })
        return {
          async start() {
            append({ event: 'start' })
            ${behavior === "start-failure" ? "throw new Error('start partially initialized')" : ""}
            ${behavior === "start-hang" ? "await new Promise(() => {})" : ""}
          },
          async status() { append({ event: 'status' }); return { running: ${behavior !== "not-running"}, mode: 'client' } },
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
    "--target", nativeTarget,
    "--timeout-ms", String(fixtureTimeoutMs),
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
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
    "--target", nativeTarget,
    "--timeout-ms", String(fixtureTimeoutMs),
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
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
    "--target", nativeTarget,
    "--timeout-ms", String(fixtureTimeoutMs),
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /start partially initialized/);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke rejects an inactive node even when status returns an object", (t) => {
  const fixture = project(t, "not-running");
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root, "--expected-version", "1.2.3",
    "--target", nativeTarget, "--timeout-ms", String(fixtureTimeoutMs),
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must report a running client/);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), ["create", "start", "status", "stop"]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke handles SIGTERM by stopping a partially started Node and removing temp state", (t) => {
  const fixture = project(t, "start-hang");
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root,
    "--expected-version", "1.2.3",
    "--target", nativeTarget,
    "--timeout-ms", String(fixtureTimeoutMs),
    "--shutdown-grace-ms", "1500",
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
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
    "--target", nativeTarget,
    "--timeout-ms", String(fixtureTimeoutMs),
    "--shutdown-grace-ms", "200",
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  const elapsed = performance.now() - startedAt;
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not exit normally/);
  assert.ok(elapsed < fixtureProcessTimeoutMs, `forced cleanup took ${elapsed}ms`);
  assert.deepEqual(fixtureEvents(fixture.marker).map(({ event }) => event), [
    "create", "start", "status", "stop",
  ]);
  assertSmokeRootRemoved(fixture.marker);
});

test("runtime smoke validates required arguments", () => {
  const result = spawnSync(process.execPath, [smoke], { encoding: "utf8", timeout: fixtureProcessTimeoutMs });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--expected-version is required/);
});

test("runtime smoke refuses a foreign native target before loading the package", (t) => {
  const fixture = project(t);
  const wrongTarget = nativeTarget === "linux-x64" ? "darwin-arm64" : "linux-x64";
  writeFileSync(resolve(fixture.root, "node_modules/@mesh-llm/sdk/index.js"), `
    require('node:fs').writeFileSync(process.env.SMOKE_MARKER, 'package was loaded')
    throw new Error('native package must not load on a mismatched worker')
  `);
  const result = spawnSync(process.execPath, [smoke,
    "--package-root", fixture.root, "--expected-version", "1.2.3",
    "--target", wrongTarget, "--timeout-ms", String(fixtureTimeoutMs),
  ], { encoding: "utf8", timeout: fixtureProcessTimeoutMs, env: { ...process.env, SMOKE_MARKER: fixture.marker } });
  assert.notEqual(result.status, 0);
  assert.ok(result.stderr.includes(`Node SDK smoke target mismatch: expected ${wrongTarget}, running ${nativeTarget}`), result.stderr);
  assert.equal(existsSync(fixture.marker), false, "target admission must run before native loading or lifecycle calls");
});

test("runtime smoke supervises graceful termination before forced termination", () => {
  const source = readFileSync(smoke, "utf8");
  assert.match(source, /process\.once\('SIGTERM', terminate\)/);
  assert.ok(source.indexOf("child.kill('SIGTERM')") < source.indexOf("child.kill('SIGKILL')"));
});

test("release workflow consumes verified upstream addons and starts the assembled package", () => {
  const workflow = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
  assert.match(workflow, /name: Download, verify, and safely extract immutable addon/);
  assert.match(workflow, /NODE_SDK_TARGET: \$\{\{ matrix\.target \}\}/);
  assert.match(workflow, /scripts\/upstream-node-addon\.ts/);
  assert.doesNotMatch(workflow, /npm run build:native|cargo build/);
  assert.doesNotMatch(workflow, /run: scripts\/verify-sdk-console-assets\.sh/);
  assert.match(workflow, /scripts\/verify-node-sdk-source\.ts --source-root upstream-source/);
  assert.doesNotMatch(workflow, /--target linux-x64-assembled-package|\.targets \| index\("linux-x64"\)/);
  assert.match(workflow, /runs-on: \$\{\{ fromJSON\(matrix\.runner_labels\) \}\}/);
});
