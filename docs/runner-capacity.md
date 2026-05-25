# Matrix cost controls and runner capacity

The release matrix can be expensive because each enabled distro/backend/platform
row produces llama.cpp ABI artifacts, a final binary, a native package, and a
runtime image.

## Cost controls

- Use `workflow_dispatch` dry runs with `push=false` for iteration.
- Narrow runs with `variant_filter` and `platform_filter` before expanding to the
  full matrix.
- Validate changed families first:
  - package script changes: one Ubuntu, one Alpine, and one Arch row.
  - CUDA changes: at least one CUDA row on a real NVIDIA runner.
  - ROCm changes: at least one ROCm row on a real AMD runner.
  - Vulkan changes: one Ubuntu/Alpine/Arch Vulkan row as applicable.
- Keep Dockerfile `--check` coverage in precheck, but do not treat it as a
  replacement for real package/image builds.

## Runner labels

The matrix emits `runner_labels` from `scripts/image-matrix.ts`. GitHub-hosted
rows should remain the default for normal dry runs. Linux ARM64 rows use the
GitHub-hosted `ubuntu-24.04-arm` runner so CPU and Vulkan arm64 artifacts are
built on an ARM64 builder rather than emulated on an AMD64 host.

Carrack self-hosted mode is reserved for canonical release tags and is currently
AMD64-only. Its generated matrix is filtered to `linux/amd64` rows and targets
the repository-visible `self-hosted`, `Linux`, and `X64` labels managed in
GitHub organization settings. If Carrack gains ARM64 hardware later, add a new
runner mode or label contract instead of reusing the AMD64 Carrack mode for
arm64 rows.

Recommended GPU runner capabilities:

- CUDA: NVIDIA driver compatible with selected CUDA rows and container runtime
  support for GPU devices.
- ROCm: AMD GPU and host ROCm driver stack compatible with selected ROCm rows.
- Vulkan: host driver/ICD stack visible to the runtime validation step.

## Expected duration guidance

Actual duration depends on cache warmth and runner hardware. Use these planning
bands until enough release history exists for precise numbers:

| Row family | Relative cost | Notes |
|---|---:|---|
| CPU | Low | Fastest rows; good smoke-test candidates. |
| Vulkan | Medium | Adds shader/compiler/runtime package coverage. |
| CUDA | High | Requires GPU-aware runner validation and larger toolchains. |
| ROCm | High | Requires GPU-aware runner validation and larger toolchains. |
| Arch rolling | Medium/High | Adds package-version drift risk from rolling repos. |

Record observed build times after each full release and update this table when
the variance is understood.
