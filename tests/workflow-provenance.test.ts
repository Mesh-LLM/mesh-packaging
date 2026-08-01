import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

const workflow = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
const rowWorkflow = readFileSync(resolve(".github/workflows/package-image-row.yml"), "utf8");
const productInputSteps = [...rowWorkflow.matchAll(
  /      - name: Read immutable product inputs\n        id: product\n        shell: bash\n        run: \|\n((?:          .*\n)+?)(?=      - )/g,
)].map((match) => match[1].replace(/^          /gm, ""));
const packageProvenanceStep = rowWorkflow.slice(
  rowWorkflow.indexOf("      - name: Namespace exact package build provenance"),
  rowWorkflow.indexOf("      - name: Verify and install package"),
);
const packageProvenanceScript = packageProvenanceStep
  .slice(packageProvenanceStep.indexOf("        run: |\n") + "        run: |\n".length)
  .replace(/^          /gm, "");

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

function runPackageProvenanceStep(
  script: string,
  options: {
    readonly depotBuildId?: string;
    readonly depotProjectId?: string;
    readonly exporterProvenance?: object;
  } = {},
): {
  readonly statement: object | undefined;
  readonly status: number | null;
  readonly stderr: string;
} {
  const directory = mkdtempSync(resolve(tmpdir(), "package-provenance-test-"));
  const artifactDirectory = resolve(directory, "artifacts/native-package");
  const packageName = "mesh-llm.deb";
  const packageContents = "native package bytes";
  mkdirSync(artifactDirectory, { recursive: true });
  writeFileSync(resolve(artifactDirectory, packageName), packageContents);
  if (options.exporterProvenance) {
    writeFileSync(
      resolve(artifactDirectory, "provenance.json"),
      JSON.stringify(options.exporterProvenance) + "\n",
    );
  }
  const result = spawnSync("bash", ["-c", script], {
    cwd: directory,
    encoding: "utf8",
    env: {
      ...process.env,
      ARTIFACT_ID: "ubuntu-cpu-amd64",
      DEPOT_BUILD_ID: options.depotBuildId ?? "k9f43vh0xp",
      DEPOT_PROJECT_ID: options.depotProjectId ?? "mzm95zcv7p",
      PACKAGE_FILE: packageName,
    },
  });
  const namespaced = resolve(artifactDirectory, "ubuntu-cpu-amd64.buildkit-provenance.json");
  const statement =
    result.status === 0 && existsSync(namespaced)
      ? (JSON.parse(readFileSync(namespaced, "utf8")) as object)
      : undefined;
  rmSync(directory, { recursive: true, force: true });
  return { statement, status: result.status, stderr: result.stderr };
}

test("both final-image paths emit validated provenance", () => {
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

test("both final-image paths reject ambiguous or invalid provenance", () => {
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

test("Depot package receipts bind local exports to their remote build", () => {
  const packageSha256 = createHash("sha256").update("native package bytes").digest("hex");
  const result = runPackageProvenanceStep(packageProvenanceScript);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.statement, {
    _type: "https://in-toto.io/Statement/v1",
    subject: [{ name: "mesh-llm.deb", digest: { sha256: packageSha256 } }],
    predicateType: "https://meshllm.cloud/depot-build-receipt/v1",
    predicate: {
      builder: {
        id: "https://depot.dev/projects/mzm95zcv7p/builds/k9f43vh0xp",
      },
      build: { project_id: "mzm95zcv7p", build_id: "k9f43vh0xp" },
    },
  });
});

test("Depot package receipts reject a malformed remote identity", () => {
  for (const options of [
    { depotBuildId: "" },
    { depotBuildId: "build/id" },
    { depotProjectId: "project_id" },
  ]) {
    assert.notEqual(runPackageProvenanceStep(packageProvenanceScript, options).status, 0);
  }
});

test("package provenance preserves an exporter statement when one is available", () => {
  const packageSha256 = createHash("sha256").update("native package bytes").digest("hex");
  const exporterProvenance = {
    _type: "https://in-toto.io/Statement/v1",
    subject: [{ name: "mesh-llm.deb", digest: { sha256: packageSha256 } }],
    predicateType: "https://slsa.dev/provenance/v1",
    predicate: { buildType: "https://mobyproject.org/buildkit@v1" },
  };
  const result = runPackageProvenanceStep(packageProvenanceScript, { exporterProvenance });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.statement, exporterProvenance);
});

test("native package evidence is exact, namespaced, and assembled before publication", () => {
  for (const snippet of [
    "release-assembly:",
    "scripts/release-evidence.ts assemble",
    "subject-checksums: assembled/release-metadata/package-subjects.sha256",
    "steps.preflight.outputs.mode == 'create'",
    "(.include | length * 4) + 3",
  ]) {
    assert.ok(workflow.includes(snippet), `workflow is missing ${snippet}`);
  }
  for (const snippet of [
    "fromJSON(inputs.row_json).package_file",
    "$ARTIFACT_ID.buildkit-provenance.json",
    "file: artifacts/native-package/${{ fromJSON(inputs.row_json).package_file }}",
    "scripts/verify-sbom-subject.ts",
    ".subject[0].name == $name",
  ]) {
    assert.ok(rowWorkflow.includes(snippet), `row workflow is missing ${snippet}`);
  }
  assert.doesNotMatch(workflow, /gh release upload[\s\S]*--clobber/);
  const releaseAssembly = workflow.slice(
    workflow.indexOf("  release-assembly:"),
    workflow.indexOf("  publish-release-assets:"),
  );
  assert.doesNotMatch(releaseAssembly, /merge-multiple: true/);
});
