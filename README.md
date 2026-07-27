# Mesh LLM packaged distributions

This repository is the packaging and distribution control plane for published [`Mesh-LLM/mesh-llm`](https://github.com/Mesh-LLM/mesh-llm) releases. It verifies upstream release archives, creates native packages and OCI images, and builds the release-tagged Node SDK addons used by the npm package.

## Release contract

```text
published upstream tag + immutable tag SHA
  -> verified release archives -> native packages -> OCI images
  -> npm addon lanes -> assembled @meshllm/sdk tarball -> clean install test
```

Application packages and images never rebuild `mesh-llm`; they consume verified upstream binaries. The npm lanes are the sole exception: they check out the immutable release SHA to compile the SDK's N-API addons. `native-runtimes.json` and native runtime archives remain upstream assets.

## Supported channels

- Ubuntu 24.04: CPU on amd64/arm64, Vulkan on amd64, CUDA 12 and 13 on amd64/arm64, ROCm 7 on amd64.
- Arch: CPU, Vulkan, and CUDA 13 packages/images on amd64 as downstream distribution extensions over the matching upstream glibc archives.
- Homebrew: Apple Silicon formula pointing directly at the upstream Metal archive.
- npm: `@meshllm/sdk` addons for macOS arm64/x64, Linux arm64/x64, and Windows x64.
- Alpine: declared but disabled. Upstream currently publishes glibc Linux archives, not musl archives, so emitting APKs would be inaccurate.

The exact rows live in `packaging/images.json`; `scripts/image-matrix.ts validate` enforces the archive/package relationship.

## Published artifacts

- [Packaging releases](https://github.com/Mesh-LLM/mesh-packaging/releases/latest)
  contain the versioned `.deb` and `.pkg.tar.zst` files, checksum sidecars,
  aggregate `SHA256SUMS`, SPDX SBOMs, provenance records, and the Apple Silicon
  Homebrew formula.
- [GHCR](https://github.com/orgs/Mesh-LLM/packages/container/package/mesh-llm)
  contains public CPU, Vulkan, CUDA, and ROCm runtime images. See
  [`docs/tagging.md`](docs/tagging.md) for immutable and moving tag names.
- [npm](https://www.npmjs.com/package/@meshllm/sdk) receives the install-tested
  cross-platform SDK tarball when npm publication is enabled.

Package-manager repositories and a public Homebrew tap are not published. The
native packages and formula are directly downloadable GitHub Release assets.

## Automation

`.github/workflows/images-release.yml` accepts the `mesh-llm-release` repository dispatch event and safe manual backfills. Every manual run defaults to `dry_run=true`. Dry-run mode forces both publish switches off while still downloading, checksumming, packaging, installing, image-building, and Homebrew-testing the selected rows.

Publishing uses separate switches for GHCR images, package release assets, and npm. All require `dry_run=false`; npm uses the `npm` environment and the other channels use `release`. `npm_lane_filter` can schedule one or more addon lanes independently and always disables npm publication for that run.

The upstream release repository must send this payload after its GitHub Release is published:

```json
{"repository":"Mesh-LLM/mesh-llm","ref":"v0.73.1","version":"0.73.1","dry_run":false,"publish_images":true,"publish_release_assets":true,"publish_npm":true}
```

Cross-repository dispatch requires a fine-grained token or GitHub App with Actions access to this repository. Store it upstream as `MESH_AGENT_IMAGES_DISPATCH_TOKEN`; never use a broad personal token.

## Local validation

```bash
node --experimental-strip-types scripts/image-matrix.ts validate
node --experimental-strip-types scripts/image-matrix.ts upstream-matrix --version v0.73.1
node --experimental-strip-types scripts/image-matrix.ts npm-matrix --version v0.73.1
node --experimental-strip-types --test tests/*.test.ts
shellcheck docker/*.sh packaging/native/*.sh scripts/*.sh
actionlint
docker buildx build --check --target native-package-artifact -f docker/Dockerfile.mesh-llm .
```

See `docs/matrix.md`, `docs/native-packages.md`, `docs/publishing.md`, and `docs/release-checklist.md` for policy and operations.
