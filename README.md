# Mesh LLM packaged distributions

This repository is the packaging and OCI distribution control plane for published [`Mesh-LLM/mesh-llm`](https://github.com/Mesh-LLM/mesh-llm) releases. Upstream owns compilation and native-runtime bundles. This repository verifies upstream release archives, converts the contained application binary into native packages, tests those packages, and installs the same packages into OCI images.

## Release contract

```text
published upstream tag + immutable tag SHA
  -> versioned upstream archive + matching .sha256 sidecar
  -> verified mesh-bundle/mesh-llm binary (once per target/flavor)
  -> .deb or .pkg.tar.zst package (once per distro/backend/architecture row)
  -> install and command smoke tests
  -> OCI runtime image installs that exact package
```

There is no source checkout or compilation path in this repository. `native-runtimes.json` and native runtime archives remain upstream assets and are not copied into packages or images.

## Supported channels

- Ubuntu 24.04: CPU on amd64/arm64, Vulkan on amd64, CUDA 12 and 13 on amd64/arm64, ROCm 7 on amd64.
- Arch: CPU, Vulkan, and CUDA 13 packages/images on amd64 as downstream distribution extensions over the matching upstream glibc archives.
- Homebrew: Apple Silicon formula pointing directly at the upstream Metal archive.
- Alpine: declared but disabled. Upstream currently publishes glibc Linux archives, not musl archives, so emitting APKs would be inaccurate.

The exact rows live in `packaging/images.json`; `scripts/image-matrix.ts validate` enforces the archive/package relationship.

## Automation

`.github/workflows/images-release.yml` accepts the `mesh-llm-release` repository dispatch event and safe manual backfills. Every manual run defaults to `dry_run=true`. Dry-run mode forces both publish switches off while still downloading, checksumming, packaging, installing, image-building, and Homebrew-testing the selected rows.

Publishing uses separate switches for GHCR images and package release assets. Both require `dry_run=false` and the GitHub `release` environment. No package-manager repository is published; repository signing and trust-root work must be completed first.

The upstream release repository must send this payload after its GitHub Release is published:

```json
{"repository":"Mesh-LLM/mesh-llm","ref":"v0.73.1","version":"0.73.1"}
```

Cross-repository dispatch requires a fine-grained token or GitHub App with Actions access to this repository. Store it upstream as `MESH_AGENT_IMAGES_DISPATCH_TOKEN`; never use a broad personal token.

## Local validation

```bash
node --experimental-strip-types scripts/image-matrix.ts validate
node --experimental-strip-types scripts/image-matrix.ts upstream-matrix --version v0.73.1
node --experimental-strip-types --test tests/*.test.ts
shellcheck docker/*.sh packaging/native/*.sh scripts/*.sh
actionlint
docker buildx build --check --target native-package-artifact -f docker/Dockerfile.mesh-llm .
```

See `docs/matrix.md`, `docs/native-packages.md`, `docs/publishing.md`, and `docs/release-checklist.md` for policy and operations.
