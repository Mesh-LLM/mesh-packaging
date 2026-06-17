# Mesh LLM Agent Images

Canonical container and packaging scaffolding for [`mesh-llm`](https://github.com/Mesh-LLM/mesh-llm).

This repository builds release-grade Linux images from a released `mesh-llm` ref. The workflow resolves that ref once to an immutable commit SHA before any split artifacts are built, so the UI, llama.cpp ABI, binary, package artifact, and final runtime image all come from the same source commit. The `mesh-llm` source repository remains the source of truth for the Rust/Cargo workspace and llama.cpp build scripts; this repository owns image matrices, image tags, runtime packaging layout, and native package distribution scaffolding.

## Layout

```text
docker/                    Shared Dockerfile and install/entrypoint helpers
packaging/images.json      Single source of truth for image variants
packaging/native/          Native Linux package builders
packaging/homebrew/        macOS Homebrew formula scaffold
scripts/image-matrix.ts    Matrix, tag, and config validation helper
docs/                      Matrix, tagging, publishing, runbook, and package strategy
.github/workflows/         Precheck and release image publishing workflows
```

## Release trigger

GitHub Actions cannot directly subscribe to a release event in another repository. The image release workflow therefore listens for `repository_dispatch` events named `mesh-llm-release`. The `mesh-llm` release workflow should send that event after a release is published:

```yaml
- name: Trigger image release
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.MESH_AGENT_IMAGES_DISPATCH_TOKEN }}
    repository: Mesh-LLM/mesh-agent-images
    event-type: mesh-llm-release
    client-payload: |
      {
        "repository": "${{ github.repository }}",
        "ref": "${{ github.ref_name }}",
        "version": "${{ github.ref_name }}",
        "release_url": "${{ github.event.release.html_url }}"
      }
```

The receiver also supports manual `workflow_dispatch` for backfills and dry runs. Manual runs default to GitHub-hosted runners and can select Carrack self-hosted mode for trusted AMD64-only release-tag probes. GitHub-hosted Linux AMD64 rows use `ubuntu-24.04`; Linux ARM64 rows use `ubuntu-24.04-arm`. Carrack mode targets repository-visible self-hosted `Linux`/`X64` labels and is filtered to AMD64 rows because Carrack is an AMD64 host. Manual runs can narrow the matrix with `variant_filter` and `platform_filter` inputs for fast iteration. Publishing and Carrack self-hosted runs both require the canonical `Mesh-LLM/mesh-llm` source repository and a release tag/ref-version match; broader arbitrary-ref experiments should stay on dry-run GitHub-hosted runners.

## Image matrix

`packaging/images.json` defines the supported rows. Initial release families are:

- Ubuntu CPU
- Ubuntu Vulkan
- Ubuntu CUDA 12.9.2 and 13.1.2, aligned with upstream release lanes
- Ubuntu ROCm 7.0 as the upstream-mirrored ROCm lane, with ROCm 7.1/7.2 retained as downstream extensions
- Alpine CPU
- Alpine Vulkan
- Alpine CUDA/ROCm metadata scaffolds, not emitted into build matrices until a real Alpine GPU toolchain base is validated
- Dockerfile-local Alpine Vulkan/CUDA/ROCm toolchain stages for experimentation; CUDA runfiles must come from NVIDIA and match a pinned SHA-256 digest
- Arch CPU, Vulkan, CUDA, ROCm using Arch/glibc build-only toolchain stages and official Arch package/runtime bases

ROCm rows intentionally start on `linux/amd64`. CPU, Vulkan, and the upstream-mirrored Ubuntu CUDA 12.9.2 row include `linux/amd64` and `linux/arm64` where the distro/toolchain stack is expected to be available. Alpine CUDA/ROCm entries are marked experimental metadata and kept out of generated build matrices because those are not vendor-default GPU container stacks; promote them only after a real Alpine CUDA/ROCm toolchain base is validated. Arch rows intentionally use Arch/glibc build-only toolchain stages rather than Alpine/musl inputs, while package and runtime stages stay on official Arch bases.

GPU backend support is toolkit-window-specific. See `docs/matrix.md` for the CUDA SM, ROCm gfx, and Vulkan support tables that explain when to keep separate backend-version rows for architecture compatibility.

Each row can also declare a `release_track`. `upstream_mirrored` rows are meant to match current upstream `mesh-llm` release coverage, while `downstream_extension` rows are distro or toolkit experiments owned by this repository. The generated GitHub matrix exposes that field so release review can distinguish official upstream parity from downstream package/image expansion. Linux rows also expose their package-manager destination (`apt`, `apk`, or `pacman`) derived from the configured package format.

## Artifact pipeline

The release workflow avoids rebuilding platform-independent artifacts in every image row:

```text
resolve mesh-llm ref -> immutable source commit SHA shared by all artifact jobs
build-ui job       -> upload release-profile mesh-llm-ui-<version> once per mesh-llm release
build-llama jobs   -> upload one llama.cpp ABI artifact per distro/backend/platform for embedded/static fallback paths
build matrix jobs  -> download UI + optional llama ABI, run Cargo with dynamic-native-runtime by default, upload binary artifact
native package jobs -> download binary artifact, build .deb/.apk/.pkg.tar.zst package artifact
package jobs       -> install matching native package artifact into the runtime image, publish tags
```

The Dockerfile exposes matching targets: `ui-artifact`, `llama-artifact`, `binary-artifact`, `native-package-artifact`, and `runtime`. The UI target delegates to upstream `scripts/build-ui.sh` with `MESH_LLM_BUILD_PROFILE=release`. The binary target now builds with `dynamic-native-runtime` by default, `cargo build --release --locked`, and the same release version passed through `MESH_LLM_BUILD_VERSION`. It only validates and uses the restored llama ABI directory when `MESH_LLM_DYNAMIC_NATIVE_RUNTIME=0` requests an embedded/static fallback build.

Native runtime archives, `native-runtimes.json`, runtime cache contents, and runtime install/update policy remain owned by upstream `mesh-llm`. This repository packages the `mesh-llm` application for configured package-manager destinations and builds OCI images that install those same package artifacts. It should smoke the runtime command surface where practical, but it should not duplicate or republish native runtime bundles inside `.deb`, `.apk`, `.pkg.tar.zst`, Homebrew, or OCI artifacts.

Cargo registry/git caches, BuildKit cache mounts, and `sccache` speed up repeated Rust and native compilation, but only the UI dist, optional llama ABI directory, final binary, and native package are treated as correctness artifacts. The final runtime image installs the native package artifact so the image path exercises the same package users receive. The original release ref is retained for display/policy checks; the resolved commit SHA is what controls the source checkout and OCI revision label.

Release outputs include SHA256 manifests, SPDX JSON SBOMs, and GitHub artifact
attestations for binaries and native packages. Pushed images record registry
digests and get digest-based image attestations. GitHub Actions artifacts remain
short-lived CI validation outputs; published runs promote native package files,
checksums, SBOMs, image digest records, and attestation verification notes to the
matching GitHub Release as durable distribution assets. Published runs create or
reuse that release in this repository before uploading row assets, and record the
immutable upstream `mesh-llm` source commit in the release notes. See
`docs/native-packages.md`, `docs/publishing.md`, `docs/release-checklist.md`,
`docs/gpu-runbooks.md`, and `docs/runner-capacity.md` for validation,
publication, and operations details.

## Local validation

```bash
node --experimental-strip-types scripts/image-matrix.ts validate
node --experimental-strip-types --test --experimental-test-coverage --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 tests/image-matrix.test.ts
node --experimental-strip-types --test tests/homebrew-release.test.ts
node --experimental-strip-types scripts/image-matrix.ts github-matrix --version v0.66.0 --image ghcr.io/mesh-llm/mesh-llm
scripts/native-package-qa.sh --distro ubuntu --backend cpu --arch amd64 --version 0.66.0 --package-format deb --package-dir artifacts/native-package --expected-only
```

## Tag format

Tags are explicit and architecture-aware:

```text
<version>-<distro>-<arch>-<backend>[backend-version]
<distro>-<arch>-<backend>[backend-version]
```

Examples:

```text
ghcr.io/mesh-llm/mesh-llm:0.66.0-ubuntu-amd64-cuda12.9.2
ghcr.io/mesh-llm/mesh-llm:ubuntu-amd64-cuda12.9.2
ghcr.io/mesh-llm/mesh-llm:0.66.0-alpine-arm64-vulkan
```

Image versions accept release semver and prerelease suffixes, but not semver build metadata (`+...`) because Docker tags do not allow `+`.

See `docs/tagging.md` for details.
