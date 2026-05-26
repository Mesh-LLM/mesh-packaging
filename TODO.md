# Production Readiness TODO

The current packaging and image pipeline is functional, but production readiness
requires broader validation, supply-chain hardening, and a final publishing
strategy.

## Highest Priority

- [ ] Run the full release matrix on real runners.
  - Current proven baseline:
    - `ubuntu-cpu-amd64` passed the phased
      ABI/binary/native-package/runtime-image chain on pushed SHA `b2892ff`.
    - `alpine-cpu-amd64` passed the phased
      ABI/binary/native-package/runtime-image chain on pushed SHA `b2892ff`.
    - `arch-cpu-amd64` passed the phased
      ABI/binary/native-package/runtime-image chain in the same phased workflow.
    - `ubuntu-cpu` and `alpine-cpu` `amd64`/`arm64` ABI phases passed under the
      30 minute slice budget.
  - Remaining default matrix coverage to close this item:
    - Run `ubuntu-cuda-12.6`, `ubuntu-cuda-12.8`, `ubuntu-cuda-13.2`,
      `ubuntu-rocm-7.0`, `ubuntu-rocm-7.1`, and `ubuntu-rocm-7.2` as one-row
      phased dry runs on real GPU-capable runners. Each backend/version needs
      ABI, binary, native-package, and runtime-image phases.
    - Run `arch-cuda-13.2` and `arch-rocm-7.2` as one-row phased dry runs on
      real GPU-capable runners.
    - Complete CPU `arm64` binary/native-package/runtime-image proof for
      `ubuntu-cpu-arm64` and `alpine-cpu-arm64` on a runner class that can keep
      each phase below 30 minutes.
  - Best known way forward:
    - Keep using `workflow_phase=abi`, then `binary`, then `native-package`, then
      `runtime-image` with `reuse_artifacts_run_id` from the prior phase.
    - Keep `push=false` until every row has a dry-run green chain.
    - Use `runner=carrack` for supported AMD64 CPU-heavy phases; Carrack is
      AMD64-only and filters out `linux/arm64` rows.
    - Use GitHub-hosted `ubuntu-24.04-arm` for ARM64 ABI probes, but only treat
      ARM64 package/image rows as release-ready after the binary/package/runtime
      phases are proven under the same budget.
    - Use real CUDA/ROCm GPU runners before enabling publish validation for GPU
      rows; Dockerfile `--check` and CPU-only hosted runners are not sufficient.
  - Vulkan rows are temporarily experimental/manual-only: ABI probes for
    Ubuntu, Alpine, and Arch at `v0.66.0` produced `libggml-vulkan.a` artifacts
    missing generated `matmul_id_subgroup_*` shader symbols, and Arch logs also
    showed `vulkan-shaders-gen` `glslc` fork/OOM failures during `mul_mm.comp`.
    Re-enable each Vulkan row only after filtered ABI validation proves the
    required generated symbol exists and that row completes the phased
    ABI/binary/native-package/runtime-image chain.
  - Use real GPU-capable runners for CUDA and ROCm; Dockerfile checks are not sufficient.
  - ARM64 CPU rows should use GitHub-hosted `ubuntu-24.04-arm` builders;
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
    `arch-toolchain-cpu`, `arch-toolchain-vulkan`, `arch-toolchain-cuda-13-2`,
    and `arch-toolchain-rocm-7-2`.
  - Package and runtime stages remain official Arch bases so the package-first
    `.pkg.tar.zst` flow is preserved.
  - Current proven baseline: `arch-cpu-amd64` passed the phased
    ABI/binary/native-package/runtime-image chain.
  - Real-runner validation still needs Arch CUDA/ROCm llama, binary, native
    package, and runtime image builds on GPU-capable runners.
  - Arch Vulkan remains experimental/manual-only until the pinned llama.cpp
    Vulkan shader generator produces a complete `libggml-vulkan.a` on the chosen
    runner/toolchain.
  - Confirm Arch rolling `cuda` and `rocm-core` package versions still match the
    row labels before release; the Docker build now fails fast on drift.
  - Best known way forward:
    - Run `arch-cuda-13.2` and `arch-rocm-7.2` as isolated phased dry runs with
      `push=false` on a GPU-capable Arch-compatible runner.
    - Start with `workflow_phase=abi`; only continue to `binary`,
      `native-package`, and `runtime-image` if the ABI artifact passes package
      metadata/version checks.
    - Treat package-version drift as a matrix metadata update, not as a runtime
      workaround: update `packaging/images.json`, docs, and tests together.

- [ ] Exercise package-first images for more rows.
  - Current proven baseline:
    - `ubuntu-cpu-amd64` package-installed runtime image passed.
    - `alpine-cpu-amd64` package-installed runtime image passed.
    - `arch-cpu-amd64` package-installed runtime image passed.
  - Remaining package-first coverage:
    - CPU ARM64 runtime images for Ubuntu and Alpine.
    - CUDA and ROCm runtime images for Ubuntu and Arch on real GPU-capable
      runners.
    - Vulkan runtime images only after each Vulkan row is re-enabled from
      experimental/manual-only status.
  - Best known way forward:
    - Continue proving rows through the phased chain. The `runtime-image` phase
      must reuse the native-package phase run ID so Docker images install the
      same package artifact users receive.
    - For GPU rows, add a runtime smoke check that confirms the native package
      dependency set is installed and the expected GPU runtime libraries are
      present before declaring the image production-ready.

- [x] Finish macOS distribution.
  - Final result: `images-release.yml` now builds per-architecture macOS llama ABI
    artifacts on native GitHub-hosted macOS runners, restores those artifacts plus
    the shared UI artifact into real macOS `arm64` and `amd64` `mesh-llm` binary
    builds, stages the binaries as `mesh-llm-macos-<version>-<arch>` artifacts,
    and smoke-tests each binary with `mesh-llm --help` before upload.
  - `scripts/homebrew-release.ts` packages those binaries into versioned
    `macos-arm64`/`macos-amd64` tarballs, writes per-tarball `.sha256` files plus
    `SHA256SUMS`, and renders `Formula/mesh-llm.rb` from the template.
  - The release workflow now stages Homebrew tarballs, checksums, and the rendered
    formula as `mesh-llm-homebrew-<version>` artifacts, validates the formula with
    `brew audit --strict`, and install-smokes local tarball rewrites on both
    macOS runner architectures before published runs upload the same assets to
    the matching GitHub Release.
  - Tap decision: the first production macOS channel is GitHub Release tarballs
    plus the rendered formula asset. A dedicated Homebrew tap is deferred until a
    tap repository and audited formula update process exist; the release checklist
    now includes that gate for any future tap publication.

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

- [x] Update the self-hosted runner version.
  - GitHub warned the current runner will soon be unsupported.
  - Completed: Carrack self-hosted runner has been upgraded by the operator.
  - Best known way forward:
    - Confirm the runner reports labels `self-hosted`, `Linux`, and `X64`; the
      workflow now targets those labels explicitly for `runner=carrack`.
    - After upgrade, run a cheap Carrack smoke slice first, then repeat one known
      green phased row such as `ubuntu-cpu-amd64` or `alpine-cpu-amd64` before
      relying on Carrack for longer GPU/CPU validation.
