# Mesh LLM packaged distributions

This repository is the packaging and distribution control plane for published [`Mesh-LLM/mesh-llm`](https://github.com/Mesh-LLM/mesh-llm) releases. It verifies upstream release archives, creates native packages and OCI images, and assembles the npm package from verified upstream Node SDK addons.

## Release contract

```text
published upstream tag + immutable tag SHA
  -> verified host/runtime product bundles -> native packages -> OCI images
  -> npm addon lanes -> per-lane fresh install/start -> assembled @mesh-llm/sdk
     tarball -> clean install/start
```

Application packages and images consume verified backend-neutral hosts and
native runtimes from upstream product-v2 bundles. The upstream release also
builds and tests the platform-native Node addons. Packaging verifies those
archives, assembles `@mesh-llm/sdk`, and checks the assembled package's public
SDK lifecycle on Linux with isolated state and bounded shutdown. npm does not
publish the standalone `mesh-llm` CLI.

Before package fan-out, the release workflow byte-checks the product-v2 schema
against the immutable upstream source commit and requires one verified host
SHA-256 for every selected OS/architecture. Native packages, OCI images, and
the Homebrew formula then prove no-driver JSON client readiness and clean
SIGINT shutdown, not merely `--version`.

## Supported channels

- Ubuntu 24.04: CPU on amd64/arm64, Vulkan on amd64, CUDA 12 and 13 on amd64/arm64, ROCm 7 on amd64.
- Arch: CPU, Vulkan, and CUDA 13 packages/images on amd64 as downstream distribution extensions over the matching upstream glibc archives.
- Homebrew: Apple Silicon formula pointing directly at the upstream Metal archive.
- npm: `@mesh-llm/sdk` addons for macOS arm64/x64, Linux arm64/x64, and Windows x64.
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
- [npm](https://www.npmjs.com/package/@mesh-llm/sdk) receives the install-tested
  cross-platform SDK tarball when npm publication is enabled.

Native packages remain directly downloadable GitHub Release assets. The
rendered Homebrew formula is also published through the canonical
[`Mesh-LLM/tap`](https://github.com/Mesh-LLM/homebrew-tap) tap.

## Automation

`.github/workflows/images-release.yml` accepts the `mesh-llm-release` repository dispatch event and safe manual backfills. Every manual run defaults to `dry_run=true`. Dry-run mode forces every publication switch off while preserving the explicitly selected validation components.

Publishing uses separate switches for GHCR images, package release assets, and npm. All require `dry_run=false`; npm uses the `npm` environment and the other channels use `release`. Manual runs use typed `validate_native`, `validate_homebrew`, and `validate_npm` switches. `native_selector` and `npm_selector` accept only `all` or exact checked-in IDs; partial selections can validate but cannot publish.

Each native row resolves its package and runtime bases to immutable digests,
produces one native package, and builds one final image. Dry runs load and test
that exact local image without registry writes. Publishing runs push a
run-scoped staging image, test it by digest, assemble a canonical release
index, and promote the tested digest without rebuilding.

Native packaging and image assembly use Depot remote BuildKit. Stable tooling
and runtime dependencies have separate cached stages. The final image installs
its exact package through a temporary bind mount, and package timestamps come
from the immutable upstream commit. Publication consumes a small verified
handoff and the original row artifacts, without re-uploading a combined release
archive.

Trusted main runs can select Depot Registry mirrors with the checked gate.
Canonical upstream references and pull references retain the same digest and
are checked together before image promotion. Registry caching remains disabled
until its measurement gate passes. See [`docs/publishing.md`](docs/publishing.md).

[`docs/ci-metrics.md`](docs/ci-metrics.md) describes automatic historical
collection, persistent records, and comparisons that separate queue time from
execution time. Metrics report observations and never change runner placement.

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
node --experimental-strip-types --test --test-concurrency=1 tests/*.test.ts
shellcheck docker/*.sh packaging/native/*.sh scripts/*.sh
actionlint
docker buildx build --check --target native-package-artifact -f docker/Dockerfile.mesh-llm .
```

See `docs/matrix.md`, `docs/native-packages.md`, `docs/publishing.md`, and `docs/release-checklist.md` for policy and operations.
