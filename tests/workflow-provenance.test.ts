import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

const workflow = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
const productInputSteps = [...workflow.matchAll(
  /      - name: Read immutable product inputs\n        id: product\n        shell: bash\n        run: \|\n((?:          .*\n)+?)(?=      - )/g,
)].map((match) => match[1].replace(/^          /gm, ""));

function runStep(script: string, provenance: readonly object[]): {
  readonly outputContents: string;
  readonly status: number | null;
  readonly stderr: string;
} {
  const directory = mkdtempSync(resolve(tmpdir(), "workflow-provenance-test-"));
  const artifactDirectory = resolve(directory, "artifacts/native-package");
  mkdirSync(artifactDirectory, { recursive: true });
  provenance.forEach((value, index) => {
    writeFileSync(resolve(artifactDirectory, `${index}.upstream-provenance.json`), `${JSON.stringify(value)}\n`);
  });
  const output = resolve(directory, "github-output");
  const result = spawnSync("bash", ["-c", script], {
    cwd: directory,
    encoding: "utf8",
    env: { ...process.env, GITHUB_OUTPUT: output },
  });
  const contents = result.status === 0 ? readFileSync(output, "utf8") : "";
  rmSync(directory, { recursive: true, force: true });
  return { outputContents: contents, status: result.status, stderr: result.stderr };
}

test("both product input steps emit validated provenance", () => {
  assert.equal(productInputSteps.length, 2);
  const provenance = {
    host_sha256: "a".repeat(64),
    runtime_id: "linux-cpu",
    runtime_sha256: "b".repeat(64),
  };
  for (const script of productInputSteps) {
    const result = runStep(script, [provenance]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.outputContents, `host_sha=${provenance.host_sha256}\nruntime_id=linux-cpu\nruntime_sha=${provenance.runtime_sha256}\n`);
  }
});

test("both product input steps reject ambiguous or invalid provenance", () => {
  assert.equal(productInputSteps.length, 2);
  const valid = {
    host_sha256: "a".repeat(64),
    runtime_id: "linux-cpu",
    runtime_sha256: "b".repeat(64),
  };
  const invalidCases: readonly (readonly object[])[] = [
    [],
    [valid, valid],
    [{ ...valid, host_sha256: "invalid" }],
    [{ ...valid, runtime_sha256: "B".repeat(64) }],
    [{ ...valid, runtime_id: "" }],
    [{ ...valid, runtime_id: "linux-cpu\nMESH_LLM_HOST_SHA=forged" }],
    [{ ...valid, runtime_id: "linux/cpu" }],
  ];
  for (const script of productInputSteps) {
    for (const provenance of invalidCases) {
      assert.notEqual(runStep(script, provenance).status, 0);
    }
  }
});
