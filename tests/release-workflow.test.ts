import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const release = readFileSync(resolve(".github/workflows/images-release.yml"), "utf8");
const row = readFileSync(resolve(".github/workflows/package-image-row.yml"), "utf8");

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

test("each path builds one final image and QA binds the same identity", () => {
  const dry = section(row, "  dry-image:", "  stage-image:");
  const stage = section(row, "  stage-image:");
  assert.equal((dry.match(/uses: docker\/build-push-action@v7/g) ?? []).length, 1);
  assert.equal((stage.match(/uses: docker\/build-push-action@v7/g) ?? []).length, 1);
  assert.match(dry, /target: runtime[\s\S]*load: true/);
  assert.match(dry, /docker image inspect --format '\{\{\.Id\}\}' "\$IMAGE_REF"/);
  assert.match(stage, /push: true[\s\S]*staging-\$\{\{ github\.run_id \}\}/);
  assert.match(stage, /IMAGE_REF: \$\{\{ inputs\.image_name \}\}@\$\{\{ steps\.stage\.outputs\.digest \}\}/);
  assert.equal((stage.match(/"\$IMAGE_REF" \/tmp\/qa-runtime-image\.sh/g) ?? []).length, 1);
  assert.match(stage, /qa:\{passed:true,image_digest:\$image_digest\}/);
  assert.doesNotMatch(row, /runtime-qa|type=cacheonly/);
});

test("dry validation cannot write to a registry", () => {
  const caller = section(release, "  package-image:", "  homebrew:");
  assert.match(caller, /permissions:[\s\S]*packages: write[\s\S]*id-token: write[\s\S]*attestations: write/);
  assert.doesNotMatch(caller, /secrets:\s*inherit/);
  const packageJob = section(row, "  package:", "  dry-image:");
  const dry = section(row, "  dry-image:", "  stage-image:");
  assert.match(packageJob, /permissions:\s+contents: read/);
  assert.match(dry, /permissions:\s+contents: read/);
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

test("readiness requires only explicitly enabled or requested components", () => {
  const readiness = section(release, "  readiness:");
  assert.match(readiness, /if \[\[ "\$NATIVE_ENABLED" == true \]\]/);
  assert.match(readiness, /if \[\[ "\$HOMEBREW_ENABLED" == true \]\]/);
  assert.match(readiness, /if \[\[ "\$NPM_ENABLED" == true \]\]/);
  assert.match(readiness, /"\$IMAGE_INDEX" == success && "\$PROMOTE_IMAGES" == success/);
});
