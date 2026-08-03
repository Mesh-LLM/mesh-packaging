# Packaging matrix

`packaging/images.json` is the only target source of truth. Schema 2 separates
the selected upstream runtime flavor from the downstream package/image
presentation. Every upstream row is a product-v2 archive containing the
backend-neutral host for its specific OS/architecture plus exactly one runtime.

Each active row declares its distro, backend display version, `upstream_flavor`, package format/base, runtime base, platforms, support level, and release track. Matrix expansion derives the upstream archive/checksum URLs, deduplicated archive artifact ID, package artifact name, GitHub-hosted runner, and OCI tags.

`depot_registry.repositories` also maps each canonical public base repository
to its independently configured Depot pull-through repository. Validation
requires mappings for both base images of every declared row, including rows
that are currently disabled, so a newly enabled target cannot silently select
an undefined mirror.

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

## npm lanes

The `npm.lanes` entries use the same `matrix_enabled` and `release_enabled`
controls as package rows. Upstream builds and smoke-tests checksummed addon
archives for macOS arm64/x64, Linux arm64/x64, and Windows x64. Packaging safely
extracts those immutable release assets and assembles `@mesh-llm/sdk` without
Cargo or native source compilation. `npm_selector` accepts exact lane IDs.

## Archive deduplication

Ubuntu and Arch rows with the same platform/flavor share one verified composed
product. A full matrix currently expands to 11 package rows from 8 Linux
products, plus one macOS product for Homebrew. Host compilation happens once
per OS/architecture upstream; runtime compilation happens once per runtime
row; this repository verifies composition once and fans out distro packaging
without rebuilding either layer. Before fan-out, the release workflow groups
verified upstream provenance by platform/architecture and rejects any group
with more than one host SHA-256.

## Execution and tuning boundary

The active matrix remains 11 package/image rows backed by 8 unique Linux
products. A package row consumes an immutable upstream archive, creates the
native package, builds exactly one runtime image from that package, and either
loads it for QA or pushes it for staging. No source compilation is introduced
in this repository. `native_selector` remains the exact selector for collecting
comparable rows during a review iteration.

The release fan-out remains fail-fast disabled and has no speculative
`max-parallel` cap. The packaging evidence available for Depot is one row on
each side of a comparison, with different commits and no cache-state labels;
there is no measured full-matrix completion time or per-architecture/backend
variance from which to change concurrency or allocate native versus assembly
jobs. The runner-images warm-pair experiment is documented in
`docs/runner-capacity.md` and does not transfer its runner-size decision to
this archive assembly matrix.

## macOS runtime boundary

macOS GPU and runtime builds are not part of this Linux container packaging
flow. macOS support uses its native release/archive path and does not consume
these Linux package or image records; this repository does not provide a
macOS GPU qualification lane.

All rows continue to use the existing Depot project boundary
(`mzm95zcv7p`). The project is not a per-row cache namespace, but there is no
evidence here of cross-family cache contamination or a cost/hit-rate benefit
from inventing separate identities. The new per-phase Depot records distinguish
native package, dry image, and staged image for later analysis only; they do not
alter selectors, artifact names, provenance, or release promotion behavior.
