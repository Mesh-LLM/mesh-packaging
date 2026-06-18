# Native package roadmap

This repository is the home for native Linux packages:

- Debian/Ubuntu: `.deb`
- Fedora/RHEL/openSUSE: `.rpm`
- Alpine: `.apk`
- Arch: `.pkg.tar.zst`

The packaging flow is:

1. Reuse the same release metadata from the `mesh-llm-release` dispatch payload.
2. Build `mesh-llm` once per distro/backend/platform target from the release-profile UI artifact, using `dynamic-native-runtime` by default.
3. Build a native package artifact from that application binary and matrix metadata.
4. Assemble Docker runtime images by installing that native package artifact with the distro package manager.
5. Keep package names aligned with image tags: version, distro, arch, backend, and backend version must remain visible.

Native package artifacts are application packages only. They must not bundle
native runtime archives, `native-runtimes.json`, or runtime cache contents.
Those artifacts stay in the upstream `mesh-llm` release flow and are installed
or inspected through `mesh-llm runtime install`, `mesh-llm runtime list`, and
related commands. Package-manager QA should prove the CLI installs cleanly and
that the runtime command surface is present where the built binary can start on
the target runner; it should not require bundled runtimes.

Implemented package formats:

| Distro | Package format | Builder path | Runtime install path |
|---|---|---|---|
| Ubuntu/Debian | `.deb` | `packaging/native/build-package.sh` | `apt-get install /packages/*.deb` |
| Alpine | `.apk` | `packaging/native/build-package.sh` | `apk add --allow-untrusted /packages/*.apk` |
| Arch | `.pkg.tar.zst` | `packaging/native/build-package.sh` | `pacman -U /packages/*.pkg.tar.zst` |

RPM support remains reserved for future RPM-family distro rows.

## Package QA and provenance

`scripts/native-package-qa.sh` is the release workflow gate for native package
quality. It enforces the exact expected package filename, verifies that only one
package of the requested format exists in the artifact directory, writes
`SHA256SUMS` plus a per-package `.sha256` file, and runs package-manager-native
checks for each configured destination:

- `.deb`: `dpkg-deb --info`, optional `lintian`, and an install smoke test with
  `apt-get install /packages/<package>.deb`.
- `.apk`: `apk manifest`, `apk verify`, and an install smoke test with
  `apk add --allow-untrusted /packages/<package>.apk`.
- `.pkg.tar.zst`: `pacman -Qip`, `pacman -Qlp`, and an install smoke test with
  `pacman -U /packages/<package>.pkg.tar.zst` after Arch keyring bootstrap when
  needed.

The release workflow publishes checksums and SPDX JSON SBOMs for binaries and
native packages, and records image digests plus image SBOMs for pushed runtime
images. GitHub artifact attestations cover binaries and packages via
`SHA256SUMS`; pushed images are attested by registry digest. When
`publish_release_assets=true` and `dry_run=false`, the `publish-release-assets`
job promotes the exact native package, package checksums, package SBOM, image
digest record, image SBOM, and row-specific attestation verification notes to
durable GitHub Release assets.

Package repository publication requires the signing gates in
`docs/package-signing.md`. Unsigned `.deb`, `.apk`, and `.pkg.tar.zst` files may
be retained as GitHub Release assets, but they must not be published through
apt/apk/pacman repositories.

## Arch toolchain bases

Arch build rows use Dockerfile-local Arch/glibc toolchain stages, such as
`arch-toolchain-cpu`, `arch-toolchain-vulkan`, `arch-toolchain-cuda-12-8`, and
`arch-toolchain-rocm-7-1`. Those stages install the minimal Arch image's missing
build tools and backend SDK packages before the generic `build-base` stage runs.
They are build-only inputs: package assembly still happens in `archlinux:base-devel`,
and final runtime images still start from `archlinux:base` and install the produced
`.pkg.tar.zst` with `pacman -U`.

Standalone Alpine toolchain stages exist for Vulkan/CUDA/ROCm experimentation, but
they must not be used as Arch row build bases because Alpine is musl-based while
Arch is glibc-based. The Alpine CUDA stage only accepts official NVIDIA CUDA
download URLs and requires a pinned `CUDA_TOOLKIT_RUNFILE_SHA256` before the
runfile executes. Alpine CUDA/ROCm remain unsupported until independently
validated as full toolchain and runtime stacks.

## macOS

macOS distribution is handled separately through Homebrew scaffolding in
`packaging/homebrew/`. Do not model macOS GPU support as a Docker image path;
Docker Desktop is not the macOS GPU runtime story for CUDA or ROCm. The release
workflow builds per-architecture macOS llama ABI artifacts on native macOS
runners, restores those artifacts plus the shared UI artifact into the macOS
`arm64` and `amd64` binary builds, then `scripts/homebrew-release.ts` packages
the binaries as versioned tarballs, writes per-tarball SHA256 files plus
`SHA256SUMS`, and renders `Formula/mesh-llm.rb` from the checked-in template.

The initial macOS publication channel is the matching GitHub Release: it receives
the tarballs, checksums, and rendered formula. A dedicated Homebrew tap is not a
release requirement until a tap repository and audited formula update process are
created.
