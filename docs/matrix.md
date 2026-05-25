# Image matrix

`packaging/images.json` is the only supported source of truth for image rows.

Each variant defines:

- `id`: stable row identifier
- `distro` and `distro_version`: runtime family
- `backend`: `cpu`, `cuda`, `rocm`, or `vulkan`
- `backend_version`: required for CUDA and ROCm
- `build_base_image`: compiler/toolkit base used by the builder stage
- `runtime_base_image`: final runtime base image
- `package_base_image`: native package builder base image
- `package_format`: native package artifact format
- `platforms`: target Docker platforms
- `cuda_architectures` / `rocm_architectures`: forwarded to the llama.cpp ABI build stage for CUDA/ROCm target selection

The shared UI builder base image lives at `image.ui_base_image`, because the UI is built once per release rather than once per matrix row.

Arch rows use Dockerfile-local, Arch/glibc build-only stages as `build_base_image` values. The package builder and final runtime still use official Arch images so the package-first path remains `binary artifact -> .pkg.tar.zst -> runtime image installs that package`. The Dockerfile also exposes standalone Alpine toolchain stages for Vulkan, CUDA, and ROCm experimentation, but those musl-based stages are not valid inputs for Arch rows. The Alpine CUDA stage requires an official NVIDIA runfile URL plus a pinned SHA-256 digest before it will execute the installer.

## Initial rows

| Variant | Platforms | Notes |
|---|---:|---|
| `ubuntu-cpu` | amd64, arm64 | Default Linux runtime family |
| `ubuntu-vulkan` | amd64, arm64 | Experimental manual row; excluded from default release matrices until Vulkan shader archive validation passes |
| `ubuntu-cuda-12.6` | amd64 | CUDA 12.6 build/runtime bases |
| `ubuntu-cuda-12.8` | amd64 | CUDA 12.8 build/runtime bases, Blackwell-capable arch list |
| `ubuntu-cuda-13.2` | amd64 | CUDA 13.2 build/runtime bases |
| `ubuntu-rocm-7.0` | amd64 | ROCm 7.0 dev image |
| `ubuntu-rocm-7.1` | amd64 | ROCm 7.1 dev image |
| `ubuntu-rocm-7.2` | amd64 | ROCm 7.2 dev image |
| `alpine-cpu` | amd64, arm64 | Minimal musl-based CPU build/runtime |
| `alpine-vulkan` | amd64, arm64 | Experimental manual row; excluded from default release matrices until Vulkan shader archive validation passes |
| `alpine-cuda-*` | amd64 metadata | Experimental scaffold rows; not emitted into build matrices until a real Alpine CUDA toolchain base is validated; the standalone Dockerfile stage requires an official NVIDIA runfile URL and pinned SHA-256 digest |
| `alpine-rocm-*` | amd64 metadata | Experimental scaffold rows; not emitted into build matrices until a real Alpine ROCm toolchain base is validated |
| `arch-cpu` | amd64 | Arch rolling CPU row using the `arch-toolchain-cpu` build stage and official Arch package/runtime bases. |
| `arch-vulkan` | amd64 | Experimental manual row using the `arch-toolchain-vulkan` build stage; excluded from default release matrices until Vulkan shader archive validation passes. |
| `arch-cuda-12.8` | amd64 | Arch/community CUDA row using the `arch-toolchain-cuda-12-8` build stage; the build fails if Arch's `cuda` package drifts away from 12.8. |
| `arch-rocm-7.1` | amd64 | Arch/community ROCm row using the `arch-toolchain-rocm-7-1` build stage; AMD does not list Arch as an official ROCm target. |

## GPU backend support windows

GPU rows are versioned by backend toolkit because accelerator support is not a single universal binary target. CUDA SM targets and ROCm gfx targets can move in and out of support as toolchains, drivers, framework packages, and base images change. When a GPU architecture requires an older or newer toolkit window, add or keep a distinct matrix row for that toolkit instead of folding every architecture into the newest CUDA or ROCm image.

The tables below document the current build targets from `packaging/images.json`. They are image build targets, not a guarantee that every host driver, board SKU, or framework package supports every listed architecture.

### CUDA

| Variant | CUDA image/toolkit | Platforms | Target SMs passed to CMake | Support-window policy |
|---|---|---|---|---|
| `ubuntu-cuda-12.6` | `nvidia/cuda:12.6.3-*-ubuntu24.04` | amd64 | `75;80;86;87;89;90` | Kept as the older CUDA 12.x window for GPUs or dependencies that should not move to newer CUDA rows. |
| `ubuntu-cuda-12.8` | `nvidia/cuda:12.8.1-*-ubuntu24.04` | amd64 | `75;80;86;87;89;90;100;120` | CUDA 12.x row with newer architecture coverage; use this style of row when a target SM is better served by CUDA 12.x than CUDA 13.x. |
| `ubuntu-cuda-13.2` | `nvidia/cuda:13.2.0-*-ubuntu24.04` | amd64 | `75;80;86;87;89;90;100;120` | Latest CUDA row in this matrix; remove or split SMs here if NVIDIA/toolchain/package support drops a target. |
| `alpine-cuda-12.6` | Alpine experimental metadata | amd64 | `75;80;86;87;89;90` | Metadata scaffold only; NVIDIA's default container/toolkit path is not Alpine. Keep `matrix_enabled=false` until a real custom Alpine CUDA stack is validated. |
| `alpine-cuda-12.8` | Alpine experimental metadata | amd64 | `75;80;86;87;89;90;100;120` | Metadata scaffold only; kept out of generated build matrices until the CUDA toolchain/runtime path is proven. |
| `alpine-cuda-13.2` | Alpine experimental metadata | amd64 | `75;80;86;87;89;90;100;120` | Metadata scaffold only; keep out of release dispatch fan-out and manual matrices until validated. |
| `arch-cuda-12.8` | `arch-toolchain-cuda-12-8` build stage using Arch `cuda` packages | amd64 | `75;80;86;87;89;90;100;120` | Arch/community package row with host NVIDIA runtime caveats. The build stage asserts the installed Arch package still matches the row's CUDA 12.8 support window. |

CUDA support must be checked against NVIDIA's CUDA toolkit, driver, and architecture compatibility documentation for the specific release. Newer CUDA major versions can remove support for older SM targets; if that happens, keep a CUDA 12.x row such as `ubuntu-cuda-12.8` for the affected SM instead of relying on a CUDA 13.x build.

### ROCm

| Variant | ROCm image/toolkit | Platforms | Target gfx names passed to CMake | Support-window policy |
|---|---|---|---|---|
| `ubuntu-rocm-7.0` | `rocm/dev-ubuntu-24.04:7.0-complete` | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | ROCm 7.0 build window; keep or split when a gfx target is validated only on this ROCm line. |
| `ubuntu-rocm-7.1` | `rocm/dev-ubuntu-24.04:7.1-complete` | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | ROCm 7.1 build window; do not assume it supports every target that another ROCm version supports. |
| `ubuntu-rocm-7.2` | `rocm/dev-ubuntu-24.04:7.2-complete` | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | Latest ROCm row in this matrix; remove or split gfx targets here if AMD/toolchain/package support changes. |
| `alpine-rocm-7.0` | Alpine experimental metadata | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | Metadata scaffold only; AMD's ROCm support matrix does not list Alpine. Keep `matrix_enabled=false` until a real Alpine ROCm stack is validated. |
| `alpine-rocm-7.1` | Alpine experimental metadata | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | Metadata scaffold only; kept out of generated build matrices until a real Alpine ROCm toolchain is validated. |
| `alpine-rocm-7.2` | Alpine experimental metadata | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | Metadata scaffold only; not emitted into release or manual matrices yet. |
| `arch-rocm-7.1` | `arch-toolchain-rocm-7-1` build stage using Arch ROCm packages | amd64 | `gfx90a;gfx942;gfx1100;gfx1101;gfx1102;gfx1200;gfx1201` | Arch/community package row; AMD does not list Arch as an official ROCm OS target. The build stage asserts the installed Arch package still matches the row's ROCm 7.1 support window. |

ROCm support is validated by ROCm version, OS, host driver stack, framework package, and LLVM gfx target. If a target would otherwise fail with a missing GPU binary error, create a separate ROCm row with the compatible `backend_version` and `rocm_architectures` list rather than assuming another ROCm image covers it.

### Vulkan

| Variant | Vulkan build/runtime base | Platforms | Compile-time GPU arch list | Support-window policy |
|---|---|---|---|---|
| `ubuntu-vulkan` | `ubuntu:24.04` plus Vulkan SDK/dev and runtime packages from helpers | amd64, arm64 | None | Experimental/manual only. CI evidence for v0.66.0 shows the pinned llama.cpp Vulkan shader generation can leave `libggml-vulkan.a` missing generated `matmul_id_subgroup_*` symbols, so this row is excluded from default release matrices until ABI validation and a full phased chain pass. |
| `alpine-vulkan` | `alpine:3.21` plus Vulkan packages from helpers | amd64, arm64 | None | Experimental/manual only. Keep filtered `workflow_phase=abi` dry-runs with `include_experimental=true` until the generated shader symbol validation passes. |
| `arch-vulkan` | `arch-toolchain-vulkan` / `archlinux:base` plus Arch Vulkan packages | amd64 | None | Experimental/manual only. Arch CI additionally showed `vulkan-shaders-gen` `glslc` subprocess fork/OOM failures while generating `mul_mm.comp` on GitHub-hosted runners. |

Vulkan rows are platform and driver compatibility targets, not CUDA/ROCm-style architecture windows. A host with a Vulkan driver can still be unsupported if it lacks required Vulkan features/extensions or relies on a portability layer with only a subset of Vulkan capabilities. Current Vulkan rows stay `matrix_enabled=true` for explicit `--include-experimental` investigation, but `release_enabled=false` keeps them out of default dry-runs, repository dispatches, and publish fan-out until `libggml-vulkan.a` defines the required generated shader symbols and the row completes `abi -> binary -> native-package -> runtime-image` under the CI slice budget.

## Cross-repository release trigger

This repository receives release information through `repository_dispatch` because GitHub Actions cannot directly subscribe to another repository's `release` event. The payload must include:

```json
{
  "repository": "Mesh-LLM/mesh-llm",
  "ref": "v0.66.0",
  "version": "v0.66.0",
  "release_url": "https://github.com/Mesh-LLM/mesh-llm/releases/tag/v0.66.0"
}
```

The workflow validates `repository` and `ref`, fetches that ref once in the matrix job, and exports the resolved commit SHA as `mesh_source_sha`. Every later artifact-producing Docker build receives the same original ref plus the same resolved SHA; the Docker source stage checks out the SHA so moving branch refs cannot produce mixed-source UI, llama, and binary artifacts.

Manual `workflow_dispatch` runs are intended for backfills and safe CI iteration. They default to dry-run packaging (`push=false`), can choose the `github` runner mode or the `carrack` self-hosted runner mode, and can narrow the matrix with comma-separated filters. GitHub runner mode sends Linux ARM64 rows to the GitHub-hosted `ubuntu-24.04-arm` builder. Carrack mode targets repository-visible self-hosted `Linux`/`X64` labels, filters the generated matrix to `linux/amd64`, and is restricted to the canonical `Mesh-LLM/mesh-llm` source repository and release tags resolved as `refs/tags/<mesh_ref>` so untrusted refs are not executed on self-hosted infrastructure. Runner group membership is managed in GitHub organization settings.

- `variant_filter`: matches variant ids such as `ubuntu-cpu` or concrete artifact ids such as `alpine-cpu-arm64`.
- `platform_filter`: matches Docker platforms such as `linux/arm64` or short arches such as `amd64`.
- `include_experimental`: includes future experimental rows that are matrix-enabled; release publishing and Carrack self-hosted runs force this back to `false`. Alpine CUDA/ROCm entries currently remain metadata-only with `matrix_enabled=false` until a real Alpine GPU toolchain base is validated.
- `workflow_phase`: defaults to `all`. Manual dry-runs can split a row into
  `abi`, `binary`, `native-package`, and `runtime-image` phases when the full
  chain would exceed the CI wall-clock budget.
- `reuse_artifacts_run_id`: required for `binary`, `native-package`, and
  `runtime-image` phases. The workflow downloads a manifest from that previous
  run and verifies the same `mesh_repository`, `mesh_ref`, `mesh_version`,
  `mesh_source_sha`, workflow repository SHA, and requested artifact ids before
  consuming cross-run artifacts.

`repository_dispatch` release builds ignore those manual iteration controls, force `push=true`, and use the normal GitHub-hosted runner selection. Any manual `push=true` run also uses GitHub-hosted runners and resolves the source only from `refs/tags/<mesh_ref>` so official image tags cannot be published from a branch that merely looks like a release tag.

## Artifact-oriented build flow

The image workflow models build outputs explicitly instead of rebuilding everything in each final image job:

```text
mesh-llm release ref
  -> resolve once to mesh_source_sha
     -> pass the same source SHA to every Docker build

mesh_source_sha
  -> build-ui job
     -> Docker target ui-artifact
     -> upload mesh-llm-ui-<version>

matrix row: distro/backend/platform
  -> build-llama job
     -> Docker target llama-artifact
     -> upload mesh-llm-llama-<version>-<variant>-<arch>

matrix row: distro/backend/platform
  -> build job
     -> download mesh-llm-ui-<version>
     -> download mesh-llm-llama-<version>-<variant>-<arch>
      -> Docker target binary-artifact
      -> upload mesh-llm-binary-<version>-<variant>-<arch>

same matrix row
  -> build-native-package job
      -> download mesh-llm-binary-<version>-<variant>-<arch>
      -> Docker target native-package-artifact
      -> upload mesh-llm-package-<version>-<variant>-<arch>

same matrix row
  -> package job
      -> download mesh-llm-package-<version>-<variant>-<arch>
      -> Docker target runtime
      -> install native package artifact in the runtime image
      -> publish <version>-<distro>-<arch>-<backend>[backend-version]
```

The UI dist is built once because it is platform-independent. The llama.cpp ABI directory is built once per matrix row because it is sensitive to distro, architecture, backend, CUDA architecture list, and ROCm target list. The final `mesh-llm` binary is still linked once per matrix row so Cargo build scripts and linker arguments see the exact restored llama ABI directory. The original ref remains useful for release policy checks and display labels, but `mesh_source_sha` is the correctness input that pins all split artifacts to one source commit.

For long-running dry-runs, the same artifact boundaries can be exercised across
multiple manual workflow runs. An `abi` run uploads the UI and llama artifacts
plus a run manifest. Later `binary`, `native-package`, and `runtime-image`
phases must provide that run ID in `reuse_artifacts_run_id`; those phases are
dry-run only, never publish-capable, and validate the manifest before download
so artifact names alone are not trusted as a correctness boundary.

## Rust and native build caching

The workflow treats artifacts and caches differently:

- `mesh-llm-ui-<version>` is a correctness artifact shared by all rows.
- `mesh-llm-llama-<version>-<variant>-<arch>` is a correctness artifact containing the full restored llama.cpp build directory, including `.mesh-llm-build-stamp`, `CMakeCache.txt`, and static archives.
- `mesh-llm-binary-<version>-<variant>-<arch>` is the final row-specific binary artifact.
- `mesh-llm-package-<version>-<variant>-<arch>` is the native package artifact consumed by the final image stage.
- Cargo registry/git caches, BuildKit cache mounts, and `sccache` are performance accelerators only. They must not be treated as portable correctness artifacts across OS/libc, architecture, CUDA, ROCm, or Vulkan rows.

The GitHub Actions BuildKit cache scopes are deliberately tied to the immutable
inputs they accelerate:

- The UI cache is keyed by `mesh_source_sha`, not the display release version, so
  repeated release/backfill runs for the same upstream source commit can reuse the
  platform-independent UI dependency and build layers.
- Llama and binary caches remain row-specific by `artifact_id`, because distro,
  architecture, backend, CUDA SM list, and ROCm target list change compiled
  outputs.
- The binary build also imports the matching row's `llama-*` cache scope. That
  lets the binary job reuse shared `source` and `build-base` Docker layers
  produced by the llama job while still consuming the llama ABI directory through
  the explicit artifact boundary.
- Native package and runtime image caches remain row-specific because package
  metadata, package format, runtime base image, and install smoke checks are row
  outputs rather than shared build inputs.

The Docker build restores llama artifacts to `.deps/llama-build/restored-llama` in both the llama build stage and the later binary build stage. The binary stage validates the restored stamp, `CMakeCache.txt`, and required static archives, then runs Cargo directly with `LLAMA_STAGE_BUILD_DIR` / `SKIPPY_LLAMA_BUILD_DIR` pointed at that directory. It does not call the full `build-linux.sh` helper, because that helper always prepares and invokes `build-llama.sh`; skipping it is what prevents the downloaded llama ABI artifact from being rebuilt during the Rust link step.
