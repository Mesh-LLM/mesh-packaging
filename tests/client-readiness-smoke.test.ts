import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const smoke = resolve("scripts/client-readiness-smoke.sh");

function fakeExecutable(
  t: { after(callback: () => void): void },
  body: string,
): { executable: string; marker: string } {
  const directory = mkdtempSync(resolve(tmpdir(), "client-readiness-smoke-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const executable = resolve(directory, "mesh-llm");
  const marker = resolve(directory, "events");
  writeFileSync(executable, `#!/bin/sh\nset -eu\n${body}`);
  chmodSync(executable, 0o755);
  return { executable, marker };
}

function fakeNodeExecutable(
  t: { after(callback: () => void): void },
  body: string,
): { executable: string; marker: string } {
  const directory = mkdtempSync(resolve(tmpdir(), "client-readiness-smoke-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const executable = resolve(directory, "mesh-llm");
  const marker = resolve(directory, "events");
  writeFileSync(executable, `#!/usr/bin/env node\n${body}`);
  chmodSync(executable, 0o755);
  return { executable, marker };
}

function runSmoke(executable: string, marker: string, readyTimeout = "3", shutdownTimeout = "3") {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync("sh", [smoke], {
    encoding: "utf8",
    timeout: 15_000,
    env: {
      ...env,
      MESH_LLM_SMOKE_BIN: executable,
      MESH_LLM_SMOKE_READY_TIMEOUT_SECONDS: readyTimeout,
      MESH_LLM_SMOKE_SHUTDOWN_TIMEOUT_SECONDS: shutdownTimeout,
      SMOKE_MARKER: marker,
    },
  });
}

function markerPids(marker: string): number[] {
  return readFileSync(marker, "utf8").trim().split("\n").map((line) => Number(line.split(":")[1]));
}

function assertProcessAbsent(pid: number): void {
  assert.throws(() => process.kill(pid, 0), (error: NodeJS.ErrnoException) => error.code === "ESRCH");
}

test("client readiness smoke requires JSON readiness, a live process, and clean SIGINT", { concurrency: false }, (t) => {
  const fixture = fakeNodeExecutable(t, `
const fs = require('node:fs')
fs.writeFileSync(process.env.SMOKE_MARKER, \`start:\${process.pid}\\n\`)
process.on('SIGINT', () => {
  fs.appendFileSync(process.env.SMOKE_MARKER, \`int:\${process.pid}\\n\`)
  process.exit(0)
})
console.log('{"role":"client","status":"ready","message":"Client daemon ready; local model loading is disabled","event":"passive_mode"}')
setInterval(() => {}, 1000)
`);
  const result = runSmoke(fixture.executable, fixture.marker);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /client readiness smoke passed/);
  const pids = markerPids(fixture.marker);
  assert.deepEqual(pids, [pids[0], pids[0]], "the exec-owned runtime PID must receive SIGINT");
  assertProcessAbsent(pids[0]);
});

test("client readiness smoke fails an executable that exits before ready", { concurrency: false }, (t) => {
  const fixture = fakeExecutable(t, `
printf 'start:%s\\n' "$$" > "$SMOKE_MARKER"
exit 42
`);
  const startedAt = performance.now();
  const result = runSmoke(fixture.executable, fixture.marker);
  const elapsed = performance.now() - startedAt;
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /exited before readiness with exit code 42/);
  assert.ok(elapsed < 2_500, `early exit took ${elapsed}ms to detect`);
  assertProcessAbsent(markerPids(fixture.marker)[0]);
});

test("client readiness smoke requires structured fields on one JSONL record", { concurrency: false }, (t) => {
  const fixture = fakeNodeExecutable(t, `
const fs = require('node:fs')
fs.writeFileSync(process.env.SMOKE_MARKER, \`start:\${process.pid}\\n\`)
process.on('SIGINT', () => {
  fs.appendFileSync(process.env.SMOKE_MARKER, \`int:\${process.pid}\\n\`)
  process.exit(0)
})
console.log('{"event":"passive_mode","status":"starting","role":"server"}')
console.log('{"event":"unrelated","status":"ready","role":"server"}')
console.log('{"event":"unrelated","status":"starting","role":"client"}')
setInterval(() => {}, 1000)
`);
  const result = runSmoke(fixture.executable, fixture.marker, "1", "3");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not reach structured readiness/);
  assertProcessAbsent(markerPids(fixture.marker)[0]);
});

test("client readiness smoke bounds SIGINT and force-cleans an unresponsive runtime", { concurrency: false }, (t) => {
  const fixture = fakeNodeExecutable(t, `
const fs = require('node:fs')
fs.writeFileSync(process.env.SMOKE_MARKER, \`start:\${process.pid}\\n\`)
process.on('SIGINT', () => {})
process.on('SIGTERM', () => {})
console.log('{"message":"Client ready"}')
setInterval(() => {}, 1000)
`);
  const result = runSmoke(fixture.executable, fixture.marker, "3", "1");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /did not stop after SIGINT within 1s/);
  assertProcessAbsent(markerPids(fixture.marker)[0]);
});

test("client readiness smoke polls readiness without shell-signal wakeups", { concurrency: false }, () => {
  const source = readFileSync(smoke, "utf8");
  assert.match(source, /readiness_reached=false/);
  assert.match(source, /readiness_in_log/);
  assert.match(source, /if ! kill -0 "\$pid" 2>\/dev\/null; then/);
  assert.doesNotMatch(source, /grep -E '"event"/);
  assert.doesNotMatch(source, /USR[12]/);
  assert.doesNotMatch(source, /watcher_pid/);
});

test("runtime image QA covers both direct binary and final entrypoint command paths", { concurrency: false }, () => {
  const dockerfile = readFileSync(resolve("docker/Dockerfile.mesh-llm"), "utf8");
  const imageQa = readFileSync(resolve("docker/qa-runtime-image.sh"), "utf8");
  assert.match(dockerfile, /MESH_LLM_SMOKE_BIN=\/usr\/local\/bin\/mesh-llm-entrypoint sh \/usr\/local\/bin\/client-readiness-smoke/);
  assert.match(imageQa, /\/usr\/local\/bin\/mesh-llm --version/);
  assert.match(imageQa, /\/usr\/local\/bin\/mesh-llm-entrypoint --version/);
  assert.ok(imageQa.includes('if ! ldd_output="$(ldd /usr/local/bin/mesh-llm 2>&1)"; then'));
  assert.match(imageQa, /ldd failed to inspect the mesh-llm host/);
  assert.equal((imageQa.match(/ldd \/usr\/local\/bin\/mesh-llm/g) ?? []).length, 1);
  assert.match(imageQa, /printf '%s\\n' "\$ldd_output" \| awk/);
  assert.match(imageQa, /printf '%s\\n' "\$ldd_output" \| grep/);
});
