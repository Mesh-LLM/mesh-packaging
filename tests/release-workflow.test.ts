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
  assert.match(packageJob, /outputs: type=local,dest=artifacts\/native-package/);
  assert.match(dry, /load: true/);
  assert.doesNotMatch(stage, /outputs: type=local|load: true/);
  assert.doesNotMatch(row, /cache-(?:from|to): type=gha/);
});

test("new reusable and image-index actions use immutable commits", () => {
  assert.doesNotMatch(row, /uses: [^\s]+@v\d+/);
  for (const action of [
    "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7",
    "actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8",
    "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7",
    pinnedDepotSetupAction.slice("uses: ".length),
    "docker/login-action@dbcb813823bdd20940b903addbd779551569679f # v4",
    pinnedDepotBuildPushAction.slice("uses: ".length),
  ]) {
    assert.ok(row.includes(action), `row workflow is missing immutable ${action}`);
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
