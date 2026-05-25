# Production Readiness TODO

The current packaging and image pipeline is functional, but production readiness
requires broader validation, supply-chain hardening, and a final publishing
strategy.

## Highest Priority

- [ ] Run the full release matrix on real runners.
  - Validate every enabled row, not only `ubuntu-cpu-amd64`.
  - Prioritize Ubuntu CUDA/ROCm, Ubuntu/Alpine Vulkan, and Arch CPU/Vulkan/CUDA/ROCm.
  - Use real GPU-capable runners for CUDA and ROCm; Dockerfile checks are not sufficient.
  - ARM64 CPU/Vulkan rows should use GitHub-hosted `ubuntu-24.04-arm` builders;
    Carrack mode is AMD64-only and filters out `linux/arm64` rows.

- [x] Harden native package quality checks.
  - `.deb`: run `dpkg-deb --info` and `lintian` where available.
  - `.apk`: run `apk verify`, `apk manifest`, and install tests.
  - `.pkg.tar.zst`: run `pacman -Qip` and install tests.
  - Verify exact expected package filenames, not only file extensions.
  - Final result: `scripts/native-package-qa.sh` now enforces exact native
    package names, emits `SHA256SUMS` plus per-package `.sha256` files, and is
    wired into `images-release.yml` with distro-native metadata and install
    smoke tests for `.deb`, `.apk`, and `.pkg.tar.zst` artifacts.

- [x] Add supply-chain provenance.
  - Generate SHA256 checksums for binaries, packages, and images.
  - Generate SBOMs.
  - Add GitHub artifact attestations or SLSA-style provenance.
  - Consider pinning GitHub Actions by SHA for stricter supply-chain posture.
  - Final result: binary and package jobs publish `SHA256SUMS`, compatibility
    `.sha256` files, SPDX JSON SBOMs, and GitHub artifact attestations using
    `actions/attest@v4`; pushed images record digest artifacts and receive
    digest-based provenance/SBOM attestations. The newly introduced Anchore/Syft
    SBOM action is pinned by commit SHA; broad pinning of existing first-party
    and Docker actions remains a future hardening pass if required by release
    policy.

## Platform Validation

- [x] Promote or remove Alpine CUDA/ROCm scaffolds.
  - Current state: metadata-only, `matrix_enabled=false`.
  - Final result from ARCH toolchain buildout: Dockerfile-local Alpine toolchain
    stages now exist for Vulkan, CUDA, and ROCm experimentation, but they are
    not wired into Arch rows because Alpine/musl toolchains are not safe Arch/glibc
    build inputs.
  - `alpine-toolchain-vulkan` installs Alpine Vulkan packages directly.
  - `alpine-toolchain-cuda` requires an official NVIDIA `CUDA_TOOLKIT_RUNFILE_URL`
    plus `CUDA_TOOLKIT_RUNFILE_SHA256`; the build verifies the digest and rejects
    non-NVIDIA download hosts before executing the runfile because NVIDIA does
    not publish a supported Alpine `apk` CUDA toolchain.
  - `alpine-toolchain-rocm` uses Alpine edge/testing `rocm-core` and `rocm-cmake`,
    which is partial ROCm metadata rather than a complete HIP compiler stack.
  - Production options:
    - find or build validated Alpine CUDA/ROCm toolchain bases and enable rows, or
    - keep Alpine CUDA/ROCm documented as unsupported/experimental and out of release matrices.
  - Final result: Alpine CUDA/ROCm scaffolds remain available for controlled
    experimentation only. They stay disabled in release matrices and documented
    as unsupported until a complete musl-based CUDA/HIP toolchain and runtime
    stack passes real-runner validation.

- [ ] Validate Arch toolchain stages on real runners.
  - Current state: Arch rows now use build-only Dockerfile stages:
    `arch-toolchain-cpu`, `arch-toolchain-vulkan`, `arch-toolchain-cuda-12-8`,
    and `arch-toolchain-rocm-7-1`.
  - Package and runtime stages remain official Arch bases so the package-first
    `.pkg.tar.zst` flow is preserved.
  - Real-runner validation still needs Arch CPU/Vulkan/CUDA/ROCm llama, binary,
    native package, and runtime image builds.
  - Confirm Arch rolling `cuda` and `rocm-core` package versions still match the
    row labels before release; the Docker build now fails fast on drift.

- [ ] Exercise package-first images for more rows.
  - The package-first flow has passed for `ubuntu-cpu-amd64`.
  - Still validate Alpine package-installed images.
  - Still validate Arch package-installed images.
  - Confirm GPU runtime images install the correct native package dependencies.

- [ ] Finish macOS distribution.
  - Build real macOS `arm64` and `amd64` artifacts.
  - Generate tarballs and SHA256s.
  - Render the Homebrew formula from the template.
  - Decide whether to publish to a dedicated Homebrew tap.
  - Current local result: `scripts/homebrew-release.ts` now packages supplied
    real macOS `mesh-llm` binaries into `macos-arm64`/`macos-amd64` tarballs,
    computes SHA256s, and renders `Formula/mesh-llm.rb` from the template.
    Remaining release work is upstream macOS binary production and the tap
    publication decision.

## Publishing Strategy

- [x] Define native package repository and publishing strategy.
  - Decide whether packages are published through:
    - GitHub Releases only,
    - apt/apk/pacman repositories,
    - a Homebrew tap for macOS.
  - Define retention policy.
  - Define checksum and provenance publication.
  - Define package upgrade behavior.
  - Final result: `docs/publishing.md` defines GitHub release artifacts plus
    GHCR as the target durable publication model. Published workflow runs create
    or reuse the matching release in this repository before promoting native
    package/provenance outputs from short-lived Actions artifacts. It defers
    apt/apk/pacman repositories until package signing/key rotation exist, and
    records retention, checksum, provenance, and upgrade behavior.

- [x] Publish durable GitHub Release assets for packages and provenance outputs.
  - Current state: the workflow uploads native packages, checksums, SBOMs, and
    image digest records as GitHub Actions artifacts for CI validation.
  - Add a release-asset promotion step before public package distribution so the
    exact packages, `SHA256SUMS`, `.sha256` files, SBOMs, image digest records,
    and attestation references are retained for the release support window.
  - Final result: `images-release.yml` now adds publish-only
    `ensure-github-release` and `publish-release-assets` jobs for `push=true`
    runs. The release job creates or reuses the matching GitHub Release in this
    repository and records the upstream `mesh_source_sha`; the promotion job
    downloads the row's native package and image digest artifacts, stages unique
    release asset names for package manifests/SBOMs and image SBOMs, writes
    row-specific attestation verification notes, and uploads everything with
    `gh release upload --clobber` using job-scoped `contents: write`.

- [x] Consider package signing before public distribution.
  - Sign `.deb`, `.apk`, and `.pkg.tar.zst` artifacts if distributing outside GitHub Releases.
  - Document trust roots and key rotation.
  - Final result: `docs/package-signing.md` defines GitHub Release assets as the
    only acceptable unsigned native package distribution path, blocks
    apt/apk/pacman repository publication until format-specific signing,
    trust-root documentation, and key-rotation dry runs exist, and links the gate
    from publishing, native package, and release checklist docs.

## Operations

- [x] Add failure docs and runbooks for common GPU build failures.
  - CUDA toolkit or SM support mismatch.
  - ROCm gfx target support mismatch.
  - Vulkan `glslc` or driver/header mismatch.
  - Runner capacity or missing GPU device/runtime.
  - Final result: `docs/gpu-runbooks.md` documents symptoms, checks, and
    resolutions for CUDA, ROCm, Vulkan, and runner/device failures.

- [x] Add a release checklist.
  - Source SHA resolution.
  - Matrix generation review.
  - Artifact/package/image validation.
  - Provenance/checksum publication.
  - Rollback plan.
  - Final result: `docs/release-checklist.md` covers source/matrix review,
    artifact flow validation, package/provenance checks, GPU gates, and rollback
    records.

- [x] Add matrix cost controls and runner capacity guidance.
  - Document expected build duration per backend/distro.
  - Document recommended runner labels and hardware.
  - Define when to use filtered manual runs before full release runs.
  - Final result: `docs/runner-capacity.md` documents filtered dry-run strategy,
    runner label expectations, GPU hardware requirements, and initial duration
    bands to refine after full release history exists.

- [ ] Update the self-hosted runner version.
  - GitHub warned the current runner will soon be unsupported.
  - Upgrade before relying on Carrack for production release validation.
