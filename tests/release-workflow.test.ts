import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const release = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
const row = readFileSync(resolve(".github/workflows/package-image-row.yml"), "utf8");
const pinnedDepotSetupAction =
  "uses: depot/setup-action@15c09a5f77a0840ad4bce955686522a257853461 # v1";
const pinnedDepotBuildPushAction =
  "uses: depot/build-push-action@98e78adca7817480b8185f474a400b451d74e287 # v1";

function section(source: string, start: string, end?: string): string {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `missing section ${start}`);
  const to = end ? source.indexOf(end, from + start.length) : source.length;
  assert.notEqual(to, -1, `missing section boundary ${end}`);
  return source.slice(from, to);
}

test("manual dispatch uses typed components and exact selectors", () => {
  for (const input of [
    "validate_native:",
    "validate_homebrew:",
    "validate_npm:",
    "native_selector:",
    "npm_selector:",
  ]) {
    assert.ok(release.includes(input), `missing ${input}`);
  }
  assert.doesNotMatch(release, /variant_filter|platform_filter|npm_lane_filter/);
  assert.match(release, /scripts\/release-plan\.ts/);
});

test("each path builds once on Depot and QA binds the same identity", () => {
  const packageJob = section(row, "  package:", "  dry-image:");
  const dry = section(row, "  dry-image:", "  stage-image:");
  const stage = section(row, "  stage-image:");
  assert.equal(packageJob.split(pinnedDepotBuildPushAction).length - 1, 1);
  assert.equal(dry.split(pinnedDepotBuildPushAction).length - 1, 1);
  assert.equal(stage.split(pinnedDepotBuildPushAction).length - 1, 1);
  assert.match(dry, /target: runtime[\s\S]*load: true/);
  assert.match(dry, /docker image inspect --format '\{\{\.Id\}\}' "\$IMAGE_REF"/);
  assert.match(stage, /push: true[\s\S]*staging-\$\{\{ github\.run_id \}\}/);
  assert.match(stage, /IMAGE_REF: \$\{\{ inputs\.image_name \}\}@\$\{\{ steps\.stage\.outputs\.digest \}\}/);
  assert.equal((stage.match(/"\$IMAGE_REF" \/tmp\/qa-runtime-image\.sh/g) ?? []).length, 1);
  assert.match(stage, /qa:\{passed:true,image_digest:\$image_digest\}/);
  assert.doesNotMatch(row, /runtime-qa|type=cacheonly/);
});

test("package and image BuildKit work uses the Depot project cache", () => {
  const packageJob = section(row, "  package:", "  dry-image:");
  const dry = section(row, "  dry-image:", "  stage-image:");
  const stage = section(row, "  stage-image:");
  assert.match(row, /DEPOT_PROJECT_ID: mzm95zcv7p/);
  assert.equal(row.split(pinnedDepotSetupAction).length - 1, 3);
  for (const job of [packageJob, dry, stage]) {
    assert.match(job, new RegExp(pinnedDepotSetupAction.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(job, new RegExp(pinnedDepotBuildPushAction.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(job, /project: \$\{\{ env\.DEPOT_PROJECT_ID \}\}/);
    assert.doesNotMatch(job, /docker\/(?:setup-buildx-action|build-push-action)/);
  }
  assert.match(packageJob, /id: package[\s\S]*outputs: type=local,dest=artifacts\/native-package/);
  assert.match(packageJob, /provenance: mode=max/);
  assert.match(packageJob, /DEPOT_BUILD_ID: \$\{\{ steps\.package\.outputs\.build-id \}\}/);
  assert.match(packageJob, /DEPOT_PROJECT_ID: \$\{\{ steps\.package\.outputs\.project-id \}\}/);
  assert.match(packageJob, /https:\/\/meshllm\.cloud\/depot-build-receipt\/v1/);
  assert.match(dry, /load: true/);
  assert.doesNotMatch(stage, /outputs: type=local|load: true/);
  assert.match(stage, /push:\s+true/);
  assert.match(stage, /tags: \$\{\{ inputs\.image_name \}\}:staging-/);
  assert.match(stage, /IMAGE_REF: \$\{\{ inputs\.image_name \}\}@\$\{\{ steps\.stage\.outputs\.digest \}\}/);
  assert.doesNotMatch(row, /cache-(?:from|to): type=gha/);
});

test("pull-through bases are opt-in, trusted, digest-pinned, and short-lived", () => {
  const packageJob = section(row, "  package:", "  dry-image:");
  const dry = section(row, "  dry-image:", "  stage-image:");
  const stage = section(row, "  stage-image:");

  assert.match(packageJob, /CACHE_ENABLED: \$\{\{ vars\.DEPOT_REGISTRY_CACHE_ENABLED \}\}/);
  assert.match(packageJob, /DEPOT_REGISTRY_HOST: \$\{\{ vars\.DEPOT_REGISTRY_HOST \}\}/);
  assert.match(packageJob, /"\$REPOSITORY" == Mesh-LLM\/mesh-packaging/);
  assert.match(packageJob, /"\$WORKFLOW_SOURCE_REF" == refs\/heads\/main/);
  assert.match(packageJob, /images-release\.yml@refs\/heads\/main/);
  assert.match(packageJob, /repository_dispatch\|workflow_dispatch/);
  assert.match(packageJob, /package_base_image="\$DEPOT_REGISTRY_HOST\/\$PACKAGE_CACHE_REPOSITORY@\$\{package_base_image##\*@\}"/);
  assert.match(packageJob, /runtime_base_image="\$DEPOT_REGISTRY_HOST\/\$RUNTIME_CACHE_REPOSITORY@\$\{runtime_base_image##\*@\}"/);
  assert.match(packageJob, /Verify exact pull-through base manifests/);
  assert.match(packageJob, /pull-through bases require a pre-authenticated Depot runner/);

  for (const job of [packageJob, dry, stage]) {
    assert.match(job, /vars\.DEPOT_REGISTRY_CACHE_ENABLED == 'true'/);
    assert.match(job, /github\.repository == 'Mesh-LLM\/mesh-packaging'/);
    assert.match(job, /github\.ref == 'refs\/heads\/main'/);
    assert.match(job, /github\.workflow_ref == 'Mesh-LLM\/mesh-packaging\/\.github\/workflows\/images-release\.yml@refs\/heads\/main'/);
    assert.match(job, /github\.event_name == 'workflow_dispatch'/);
    assert.match(job, /github\.event_name == 'repository_dispatch'/);
    assert.match(job, /depot-ubuntu-24\.04/);
  }
  assert.doesNotMatch(row, /depot pull-token|docker login "\$DEPOT_REGISTRY_HOST"|DEPOT_REGISTRY_PULL_TOKEN|secrets\.DEPOT|DEPOT_TOKEN/);
  assert.match(dry, /RUNTIME_BASE_IMAGE=\$\{\{ needs\.package\.outputs\.runtime_base_image \}\}/);
  assert.match(stage, /RUNTIME_BASE_IMAGE=\$\{\{ needs\.package\.outputs\.runtime_base_image \}\}/);
});

test("each Depot phase emits bounded tuning evidence without claiming unavailable metrics", () => {
  const packageJob = section(row, "  package:", "  dry-image:");
  const dry = section(row, "  dry-image:", "  stage-image:");
  const stage = section(row, "  stage-image:");
  for (const job of [packageJob, dry, stage]) {
    assert.match(job, /Start Depot [^\n]+ measurement/);
    assert.match(job, /context_bytes/);
    assert.match(job, /action_seconds_json=null/);
    assert.match(job, /context_bytes_json=null/);
    assert.match(job, /DEPOT_BUILD_ID: \$\{\{ steps\.[a-z_]+\.outputs\.build-id \}\}/);
    assert.match(job, /DEPOT_PROJECT_OUTPUT: \$\{\{ steps\.[a-z_]+\.outputs\.project-id \}\}/);
    assert.match(job, /cache_state: \"unclassified\"/);
    for (const metric of [
      "cache_hit_rate",
      "context_upload_seconds",
      "cache_import_seconds",
      "cache_export_seconds",
      "cpu_utilization_percent",
      "cost_usd",
    ]) {
      assert.match(job, new RegExp(`${metric}: null`));
    }
    assert.match(job, /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7/);
    assert.match(job, /retention-days: 14/);
  }
  assert.match(packageJob, /phase native-package/);
  assert.match(dry, /phase runtime-image-dry/);
  assert.match(stage, /phase runtime-image-stage/);
});

test("new reusable and image-index actions use immutable commits", () => {
  const externalActionReferences = [...row.matchAll(
    /^\s*(?:-\s+)?uses:\s*([^@\s]+)@([^\s#]+)/gm,
  )];
  assert.ok(externalActionReferences.length > 0);
  for (const [, action, ref] of externalActionReferences) {
    assert.match(ref, /^[0-9a-f]{40}$/, `${action} must use an immutable commit SHA`);
  }
  const index = section(release, "  image-index:", "  promote-images:");
  for (const action of [
    "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7",
    "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7",
    "actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8",
    "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7",
  ]) {
    assert.ok(index.includes(action), `image index is missing immutable ${action}`);
  }
});

test("dry validation cannot write to a registry", () => {
  const caller = section(release, "  package-image:", "  homebrew:");
  assert.match(caller, /permissions:[\s\S]*packages: write[\s\S]*id-token: write[\s\S]*attestations: write/);
  assert.doesNotMatch(caller, /secrets:\s*inherit/);
  const packageJob = section(row, "  package:", "  dry-image:");
  const dry = section(row, "  dry-image:", "  stage-image:");
  assert.match(packageJob, /permissions:\s+contents: read\s+id-token: write/);
  assert.match(dry, /permissions:\s+contents: read\s+id-token: write/);
  assert.doesNotMatch(dry, /packages: write|docker\/login-action|push: true/);
  const stage = section(row, "  stage-image:");
  assert.match(stage, /environment: release/);
  assert.match(stage, /packages: write/);
});

test("promotion consumes the canonical tested index without rebuilding", () => {
  const index = section(release, "  image-index:", "  promote-images:");
  const promotion = section(release, "  promote-images:", "  release-assembly:");
  assert.match(index, /scripts\/release-index\.ts assemble/);
  assert.match(index, /scripts\/release-index\.ts verify/);
  assert.match(promotion, /image-index\/release-index\.json/);
  assert.match(promotion, /imagetools create --prefer-index=false/);
  assert.match(promotion, /immutable version tag/);
  assert.match(promotion, /rollback-ledger\.json/);
  assert.doesNotMatch(promotion, /build-push-action|Dockerfile|docker buildx build/);
});

test("Node packaging consumes safe upstream addon artifacts without compiling", () => {
  const addons = section(release, "  node-sdk-addon:", "  node-sdk-preflight:");
  assert.match(addons, /scripts\/upstream-node-addon\.ts/);
  assert.match(addons, /releases\/download\/\$MESH_REF/);
  assert.doesNotMatch(addons, /rust-toolchain|sccache|build:native|cargo/);
});

test("Node prerelease validation uses a non-latest npm dist-tag", () => {
  const preflight = section(release, "  node-sdk-preflight:", "  publish-node-sdk:");
  assert.match(preflight, /if \[\[ "\$MESH_VERSION" == \*-\* \]\]; then dist_tag=next; fi/);
  assert.match(preflight, /npm publish "\.\/\$tarball" --dry-run --access public --tag "\$dist_tag"/);
});

test("readiness requires only explicitly enabled or requested components", () => {
  const readiness = section(release, "  readiness:");
  assert.match(readiness, /if \[\[ "\$NATIVE_ENABLED" == true \]\]/);
  assert.match(readiness, /if \[\[ "\$HOMEBREW_ENABLED" == true \]\]/);
  assert.match(readiness, /if \[\[ "\$NPM_ENABLED" == true \]\]/);
  assert.match(readiness, /"\$IMAGE_INDEX" == success && "\$PROMOTE_IMAGES" == success/);
});
