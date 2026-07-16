# Packaging matrix

`packaging/images.json` is the only target source of truth. Schema 2 separates the upstream compiled flavor from the downstream package/runtime presentation.

Each active row declares its distro, backend display version, `upstream_flavor`, package format/base, runtime base, platforms, support level, and release track. Matrix expansion derives the upstream archive/checksum URLs, deduplicated archive artifact ID, package artifact name, GitHub-hosted runner, and OCI tags.

## Active rows

| Variant | Platforms | Upstream archive flavor | Package | Track |
|---|---|---|---|---|
| `ubuntu-cpu` | amd64, arm64 | CPU | deb | upstream mirrored |
| `ubuntu-vulkan` | amd64 | Vulkan | deb | upstream mirrored |
| `ubuntu-cuda-12.9.2` | amd64, arm64 | CUDA 12 | deb | upstream mirrored |
| `ubuntu-cuda-13.1.2` | amd64, arm64 | CUDA 13 | deb | upstream mirrored |
| `ubuntu-rocm-7.0` | amd64 | ROCm | deb | upstream mirrored |
| `arch-cpu` | amd64 | CPU | pkg.tar.zst | downstream extension |
| `arch-vulkan` | amd64 | Vulkan | pkg.tar.zst | downstream extension |
| `arch-cuda-13.3.1` | amd64 | CUDA 13 | pkg.tar.zst | downstream extension |

The Ubuntu toolkit number describes the runtime base used by the image; the upstream archive ABI is major-versioned (`cuda-12` or `cuda-13`). Arch’s rolling CUDA version can change independently while continuing to consume the upstream CUDA 13 archive. Update the row and validate installation whenever the Arch package changes major version.

## Explicit exclusion

`alpine-cpu` remains in the data file with `support_level=blocked_upstream`, `release_enabled=false`, and `matrix_enabled=false`. A glibc archive is not a valid APK/musl application payload. Enable Alpine only after upstream publishes and tests an `*-unknown-linux-musl` archive contract.

Windows upstream archives are not repackaged because this repository has no Windows package channel defined. Homebrew is arm64-only because v0.73.1 has no Intel macOS release archive.

## Archive deduplication

Ubuntu and Arch rows with the same platform/flavor share one verified upstream artifact. A full matrix currently expands to 11 package rows from 8 Linux archives, plus one macOS archive for Homebrew. That is the main efficiency boundary: compilation happens once upstream, verification once here, and distro packaging fans out afterward.
