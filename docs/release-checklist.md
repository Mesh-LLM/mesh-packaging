# Release checklist

## Upstream contract

- [ ] The upstream tag and non-draft GitHub Release exist and the tag resolves to one immutable SHA.
- [ ] Every generated archive and `.sha256` sidecar exists in that release.
- [ ] Archive verification accepts only the product-v2 host, host-import report,
  product manifest, and exactly one runtime tree. It verifies every recorded
  digest and rejects unexpected or traversal-prone entries.
- [ ] The full matrix matches the current release asset inventory. Unsupported channels remain disabled rather than inferred.

## Dry-run QA

- [ ] A full `dry_run=true` workflow succeeds with publish jobs skipped.
- [ ] The unfiltered dry run assembles exactly 11 package rows and 47 release
  assets. `SHA256SUMS` exactly covers every non-manifest asset, and the single
  aggregate `provenance.json` contains 11 unique package name/SHA-256 subjects.
- [ ] Every native package passes metadata inspection, exact filename/checksum
  checks, package-manager installation, `mesh-llm --version`, `--help`, and
  `mesh-llm runtime list` without GPU passthrough. The package owns the
  versioned runtime tree, and an empty user cache stays empty. The exact
  package-owned executable then reaches structured JSON client readiness while
  alive and stops cleanly on SIGINT within the bounded timeout.
- [ ] Every runtime image installs the matching package artifact. Every backend,
  including CUDA, passes the no-device command smoke and the neutral host has no
  backend runtime imports. The final entrypoint reaches structured JSON client
  readiness while the container remains alive, stops cleanly within the bounded
  timeout, and leaves no test container or listener behind.
- [ ] The arm64 Homebrew formula installs and tests the upstream Metal archive.
  The exact Cellar binary reaches structured JSON client readiness while alive
  and completes bounded clean shutdown with isolated runtime and cache state.
- [ ] Every enabled npm addon lane succeeds; the assembled tarball passes
  `npm publish --dry-run`, installs in a clean project, and completes public
  `Node.create`, `start`, `status`, and `finally`-guarded `stop` with normal
  process exit and verified temporary-state cleanup.
- [ ] The final readiness manifest reports success for plan, upstream, native
  packages, runtime images, Homebrew, and every enabled npm addon/preflight lane.

## Publication

- [ ] A reviewer confirms the selected publish switches and the `release` environment gate.
- [ ] GHCR tags match `docs/tagging.md`; pushed digests receive provenance attestations.
- [ ] Package release assets contain exact packages, SHA256 manifests, SPDX SBOMs, and the rendered formula.
- [ ] Every package SPDX document names the exact `.deb` or `.pkg.tar.zst`
  basename and its verified sidecar SHA-256. Every uniquely named per-row
  BuildKit statement names the same subject before aggregate assembly.
- [ ] No variant, platform, or npm lane filter is present on a publish run.
- [ ] A new `packaging-v<version>` release does not already exist. If it does,
  the workflow may no-op only when tag target, title, body, state, exact asset
  names, and GitHub asset digests all match; otherwise publication must fail.
- [ ] Release upload does not use `--clobber`, and the post-create API check
  proves the published asset set is byte-for-byte identical to the assembly.
- [ ] If `publish_npm=true`, npm provenance names `mesh-packaging` and the
  version has the expected `latest` or `next` dist-tag.
- [ ] No native runtime bundles or manifest are republished here.
- [ ] The release record names the upstream tag and immutable SHA.

## External automation

- [ ] Upstream has a fine-grained `MESH_AGENT_IMAGES_DISPATCH_TOKEN` or GitHub App installation with Contents write access scoped to this repository.
- [ ] Upstream sends `mesh-llm-release` only after its complete non-canary release is published, with each intended publication switch enabled.
- [ ] The dispatch explicitly sets `publish_npm`; omitted values do not publish.
- [ ] The first automated dispatch is observed end-to-end before enabling publication by dispatch payload.
- [ ] The existing `ghcr.io/mesh-llm/mesh-llm` package grants Actions write access to `Mesh-LLM/mesh-packaging`.
- [ ] The GHCR package visibility is intentionally selected; public visibility cannot be reverted to private.
