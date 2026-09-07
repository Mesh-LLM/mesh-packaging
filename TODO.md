# Production Readiness TODO

- [x] Keep stable package/runtime dependencies cached and omit temporary package
  archives from final image layers. QA: cold/warm Docker fixture builds prove
  dependency reuse across backend/version inputs, exact installed package bytes,
  and no retained package archive layer.
- [x] Reconstruct native packages deterministically from an immutable source
  epoch. QA: independent Debian and Arch fixture builds produce equal SHA-256
  values despite different build times; invalid epochs fail closed.
- [x] Replace the aggregate release archive handoff with a small digest-bound
  manifest and original immutable row artifacts. QA: valid reconstruction
  matches all approved release hashes; changed, missing, duplicate, and foreign
  inputs fail before publication; workflow regression forbids aggregate upload.
- [x] Validate canonical and mirrored base identities without weakening digest
  checks. QA: direct and configured-mirror fixtures pass; unconfigured mirrors,
  mismatched digests, and matrix drift fail; registry caching remains disabled.
- [x] Record actual runners and persist historical CI measurements with bounded
  automatic collection and comparable-cohort reports. QA: collector fixtures
  cover retries, failed/cancelled jobs, missing data, label/provider identity,
  duplicate collection, artifact expiry/deletion, and comparison eligibility; live read-only collection
  matches known GitHub job timestamps and artifact sizes.
- [x] Validate the integrated packaging changes and document the final flow.
  QA: matrix coverage gates, full TypeScript suite, actionlint, ShellCheck,
  representative matrix expansions, Docker target checks, and diff checks pass.
  Validation: 132 TypeScript tests passed, with the Docker fixture test skipped
  in the ordinary suite; the separate Docker-enabled suite passed all five
  tests. Matrix line, branch, and function coverage each passed at 100%.
- [ ] Exercise the final workflow with real release artifacts and establish its
  timing baseline. QA: the complete native/Homebrew dry run passes runtime
  readiness; a subsequent protected publication reconstructs every original
  artifact and verifies all published hashes; metrics records the exact run
  and attempts. Registry mirrors remain disabled until their measurement gate
  passes. Local fixture validation does not close this operational item.

- [x] Repair exact-image index assembly after the v0.75.0 publication failure.
  Final result: the release workflow uses jq's valid `all(generator; condition)`
  form and retains the selected matrix row as an explicit binding while matching
  every staged, digest-tested result. Manual recovery dispatches may additionally
  pin the expected immutable upstream tag SHA and fail before build fan-out if it
  is malformed or differs from the resolved tag.
  QA: the workflow regression executes the embedded jq filter against exact and
  mismatched fixtures, and directly exercises empty, matching, mismatching, and
  malformed expected SHA values; the full TypeScript suite, actionlint, release
  matrix consistency check, and `git diff --check` pass.

- [x] Add measured Depot Registry pull-through base-image support.
  Final result: trusted image rows may substitute configured Depot mirrors for
  Ubuntu, CUDA, ROCm, and Arch bases while retaining the original tag or digest;
  dry runs and untrusted contexts keep public upstream references, and OIDC
  creates only short-lived read-only pull credentials.
  QA: the matrix validation, 100%-coverage matrix suite, full 90-test TypeScript
  suite, representative Ubuntu/CUDA/ROCm/Arch expansions, actionlint,
  shellcheck, workflow policy scans, and `git diff --check` pass. The optional
  local Dockerfile check could not connect to Docker (`failed to build: EOF`).

- [x] Persist package-manager downloads independently of Docker layers.
  Final result: the native package stage uses locked, stable BuildKit cache IDs
  separated by distro and architecture. The runtime stage additionally
  separates cache IDs by backend and backend version.
  QA: validate the image matrix, run Dockerfile checks for Ubuntu, Alpine, and
  Arch inputs, and benchmark invalidated Ubuntu package-manager steps before
  and after the cache mounts. The ARM64 Ubuntu package target measured 17s and
  14s before versus 13s and 13s after. Comparing the second invalidated rebuild
  in each set, the warm cache-mount build was 7.1% faster (14s to 13s).

- [x] Replace widening workflow filters with a typed, fail-closed release plan.
  Final result: manual runs select native, Homebrew, and npm validation through
  typed booleans plus exact checked-in IDs or `all`; publication implications
  require the complete matching producer set, and readiness accepts skips only
  for disabled components.
  QA: planner tests cover native-only, Homebrew-only, npm-only, full release,
  exact selectors, invalid/duplicate selectors, publish implications, and
  readiness-required versus expected-skipped results; actionlint and the
  workflow provenance suite pass.

- [x] Stage each runtime image once, test its exact registry digest, and promote
  only that tested digest without another Docker build.
  Final result: each row resolves immutable bases and produces one package plus
  one final image; dry runs test a locally loaded image without registry writes,
  while publish runs test a run-scoped staging digest, assemble a canonical
  index, and retag only that digest with immutable-tag guards and a rollback
  ledger.
  QA: workflow tests prove one image build per publishing row, digest-bound QA,
  immutable version-tag conflict rejection, convenience-tag rollback evidence,
  zero Docker builds in promotion, and a complete deterministic release index.

- [ ] Route package and image BuildKit execution through Depot remote builders.
  Final result: native package, dry-image, and staging-image builds use the
  MeshLLM Depot project and its persistent cache; package bytes return only for
  required package QA/upload, dry images load only for runner-side QA, and
  staging images push directly from Depot before digest-bound QA and promotion.
  Operational prerequisite: configure a GitHub Actions OIDC trust relationship
  for GitHub organization `Mesh-LLM` and repository `mesh-packaging` in the
  Depot project; do not replace OIDC with a long-lived repository token.
  QA: release-workflow tests reject hosted Buildx and `type=gha` cache use in
  these paths; matrix validation, YAML/actionlint checks, Dockerfile checks,
  and the relevant GitHub Actions workflow pass.

- [x] Consume upstream-produced Node addon artifacts instead of compiling addon
  source in mesh-packaging.
  Final result: the upstream release owns five platform-native addon producers;
  packaging downloads their versioned archives and checksum sidecars, rejects
  unsafe layouts or manifest/digest drift, and assembles npm without Cargo or a
  native source build.
  QA: upstream release tests prove all five target artifacts are checksummed and
  published; packaging tests reject unsafe, missing, or digest-mismatched addons
  and the workflow contains no downstream native compilation path.

- [x] Make native release evidence exact and publication immutable.
  Final result: every package row preserves a uniquely named BuildKit statement,
  scans only the exact package file into SPDX, verifies the package basename and
  SHA-256 subject, and participates in one deterministic 11-subject aggregate
  provenance statement during full dry runs. Publication rejects filters and
  any existing release drift; an exactly identical release is a no-op, while a
  new release is created once without asset clobbering.
  QA: focused SBOM/release-evidence fixtures cover both native formats and
  reject generic, stale, duplicate, incomplete, or mismatched evidence; the
  full TypeScript suite, matrix coverage, shellcheck, actionlint, Dockerfile
  checks, workflow policy scans, and `git diff --check` pass.

- [x] Harden composed-runtime certification teardown and dependency inspection.
  QA: shell syntax accepts `docker/qa-runtime-image.sh`; focused client-readiness
  and Node SDK smoke tests prove fail-closed captured `ldd` output, SIGTERM-first
  Node stop/temp cleanup, bounded SIGKILL fallback, and the updated release
  checklist requires real runtime readiness and clean shutdown.

- [x] Model npm addon builds as independently toggleable packaging lanes.
  QA: configuration validation and 100% coverage matrix tests prove enabled,
  disabled, filtered, and empty npm matrix behavior.

- [x] Assemble, preflight, and publish the canonical `@mesh-llm/sdk` tarball.
  QA: local fixture dry runs produce the expected cross-platform tarball,
  every addon lane packs and installs into a clean consumer project, and its
  public `Node` API completes bounded start/status/finally-stop with normal
  process exit. The assembled host package repeats the lifecycle proof before
  `npm publish --dry-run`; workflow lint proves CI can schedule every lane.

- [x] Document npm packaging and hand ownership off from `mesh-llm`.
  QA: documentation scans find the canonical repository and workflow, the
  packaging PR is open with @ndizazzo requested, required upstream
  documentation changes are verified in a separate tagged PR, and the
  superseded mesh-llm PR references the replacement before closing.

- [x] Replace former `Mesh-LLM/mesh-agent-images` repository references after
  the repository rename. QA: `rg -n 'mesh-agent-images' --glob '!TODO.md' .`
  returns no matches, `scripts/image-matrix.ts validate` passes, and all 12
  TypeScript tests pass locally.

- [x] Publish a flat, self-consistent aggregate checksum manifest. QA: the
  release staging simulation rejects basename collisions and its generated
  `SHA256SUMS` passes `sha256sum -c`; the live `packaging-v0.73.1` manifest
  exactly matches all 46 non-manifest GitHub asset digests, does not hash
  itself, and workflow lint passes locally.

- [x] Keep the rendered Homebrew formula acceptable to Homebrew's style and
  install checks. QA: Homebrew release unit tests pass, `brew style` accepts the
  rendered formula, and the formula installs and tests on Apple Silicon.

The current packaging and image pipeline is functional, but production readiness
requires broader validation, supply-chain hardening, and a final publishing
strategy.

## Highest Priority

- [ ] Run the full release matrix on real runners.
  - Validate every enabled row, not only `ubuntu-cpu-amd64`.
  - Prioritize Ubuntu CUDA/ROCm and Arch CPU/CUDA/ROCm.
  - Vulkan rows are temporarily experimental/manual-only: ABI probes for
    Ubuntu, Alpine, and Arch at `v0.66.0` produced `libggml-vulkan.a` artifacts
    missing generated `matmul_id_subgroup_*` shader symbols, and Arch logs also
    showed `vulkan-shaders-gen` `glslc` fork/OOM failures during `mul_mm.comp`.
    Re-enable each Vulkan row only after filtered ABI validation proves the
    required generated symbol exists and that row completes the phased
    ABI/binary/native-package/runtime-image chain.
  - Use real GPU-capable runners for CUDA and ROCm; Dockerfile checks are not sufficient.
  - ARM64 CPU/CUDA rows should use GitHub-hosted `ubuntu-24.04-arm` builders;
    Carrack mode is AMD64-only and filters out `linux/arm64` rows.

- [x] Return CI workflows to GitHub-hosted runners.
  - Final result: Linux jobs now use `ubuntu-24.04` and generated ARM64 rows use
    `ubuntu-24.04-arm`; macOS arm64 jobs use `macos-15`; workflow Docker builds
    use `docker/setup-buildx-action@v3` and `docker/build-push-action@v6`.
  - QA: run matrix validation, image-matrix tests, YAML parse checks, and
    `actionlint` on both workflows.

- [x] Align matrix rows with the upstream CUDA/ROCm release contract.
  - Final result: Ubuntu CUDA release rows now use 12.9.2 and 13.1.2, CUDA
    12.9.2 includes Linux ARM64, and matrix rows expose `release_track` so
    upstream-mirrored rows can be reviewed separately from downstream extensions.
  - QA: run `scripts/image-matrix.ts validate`, representative `github-matrix`
    filters for `ubuntu-cuda-12.9.2` on amd64/arm64 and `ubuntu-cuda-13.1.2` on
    amd64, and the image-matrix test suite.

- [ ] Compose package-manager outputs from upstream contract-v2 products.
  - Final result: archive verification enforces the product schema, checks both
    immutable digests, and stages the backend-neutral host plus selected runtime
    into Debian/Arch, Homebrew, and OCI outputs without rebuilding either input.
  - QA: run upstream archive/schema tests (including byte-identical schema
    verification at the immutable producer SHA), matrix validation, Homebrew
    rendering tests, shell syntax checks, Dockerfile checks, and no-driver
    package/image/Homebrew client-readiness smokes proving ownership of the
    versioned runtime directory, a live structured client-ready event, and
    bounded SIGINT.

- [ ] Convert official release packaging to consume upstream release archives.
  - Official package-manager publication starts from upstream composed
    `package-release` outputs. Source compilation is not a package/image lane.
  - QA: package one Ubuntu CPU `.deb`, one Homebrew formula, and one OCI image
    from upstream inputs without rebuilding the host or native runtime.

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
    digest-based provenance/SBOM attestations. Native package SPDX scans now
    use the exact package file and are verified against the sidecar; full
    release assembly combines all 11 uniquely named per-row BuildKit statements
    into one aggregate statement. The Anchore/Syft SBOM action is pinned by
    commit SHA; broad pinning of existing first-party
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
  - Real-runner validation still needs Arch CPU/CUDA/ROCm llama, binary,
    native package, and runtime image builds.
  - Arch Vulkan remains experimental/manual-only until the pinned llama.cpp
    Vulkan shader generator produces a complete `libggml-vulkan.a` on the chosen
    runner/toolchain.
  - Confirm Arch rolling `cuda` and `rocm-core` package versions still match the
    row labels before release; the Docker build now fails fast on drift.

- [ ] Exercise package-first images for more rows.
  - The package-first flow has passed for `ubuntu-cpu-amd64`.
  - Still validate Alpine package-installed images.
  - Still validate Arch package-installed images.
  - Confirm GPU runtime images install the correct native package dependencies.

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
  - Final result: `images-release.yml` assembles the complete native release
    during unfiltered dry runs as well as publish runs. Publication creates a
    new immutable release without clobbering assets, or treats a pre-existing
    release as a no-op only after its tag target, title, body, draft state, exact
    asset names, and GitHub-computed asset digests match the local assembly.
    Any mismatch fails closed.

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
