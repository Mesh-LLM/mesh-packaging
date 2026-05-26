# GPU build failure runbooks

These runbooks cover common failure modes for CUDA, ROCm, Vulkan, and GPU runner
capacity during image releases.

## CUDA toolkit or SM mismatch

Symptoms:

- `nvcc` is missing in the build stage.
- CMake fails while configuring CUDA architectures.
- Runtime logs report missing support for a target SM.

Checks:

1. Confirm the matrix row's `backend_version` matches the CUDA image or Arch
   package version.
2. Confirm `cuda_architectures` in `packaging/images.json` only lists SM targets
   supported by that CUDA toolkit window.
3. Confirm the host driver on GPU runners is compatible with the selected CUDA
   toolkit.
4. For Arch, check whether rolling `cuda` drifted away from the row label; the
   Docker build should fail fast when this happens.

Resolution:

- Remove unsupported SMs from the affected row or add a separate CUDA row for the
  older/newer support window.
- Do not fold incompatible GPU architectures into the latest CUDA row by default.
- Keep CUDA 12.8 rows below Blackwell targets when `nvcc` translates `120` to
  `sm_120a` and fails in llama.cpp template compilation; use the CUDA 13.2 row
  for Blackwell-native validation.

## ROCm gfx target mismatch

Symptoms:

- `hipcc` is missing or fails to compile.
- Build logs mention unsupported `gfx*` targets.
- Runtime reports missing GPU binary support.

Checks:

1. Confirm ROCm version and target gfx list in `packaging/images.json`.
2. Confirm the host runner GPU is supported by the ROCm version and driver stack.
3. Confirm distro support: Ubuntu ROCm rows use AMD images; Arch ROCm is
   community-supported; Alpine ROCm remains experimental metadata.

Resolution:

- Split ROCm rows by version when a target only works in a specific ROCm window.
- Keep unsupported or unvalidated Alpine ROCm rows out of release matrices.

## Vulkan shader/compiler or loader mismatch

Symptoms:

- `glslc` is missing in build stages.
- The llama ABI artifact fails validation with
  `Vulkan llama artifact is missing generated shader definition`.
- Binary links fail with undefined `matmul_id_subgroup_*_data` or
  `matmul_id_subgroup_*_len` symbols from `libggml-vulkan.a`.
- Runtime image lacks Vulkan loader packages.
- Application starts but no host ICD is visible.

Checks:

1. Confirm distro helper scripts install `glslc`/shaderc or equivalent packages.
2. Confirm `libggml-vulkan.a` defines generated shader symbols, for example
   `matmul_id_subgroup_iq4_nl_f32_aligned_f16acc_cm1_data`; unresolved symbols
   in that archive indicate incomplete pinned llama.cpp shader generation.
3. Inspect shader generation logs around `Generate vulkan shaders for
   mul_mm.comp`; `Cannot allocate memory` or failed `glslc` subprocess forks are
   runner/toolchain capacity failures, not runtime ICD failures.
4. Confirm runtime packages include the Vulkan loader.
5. Confirm the host runner provides the required ICD/driver stack.

Resolution:

- Fix distro package lists in `docker/install-build-deps.sh` or
  `docker/install-runtime-deps.sh`.
- Keep Vulkan rows out of default release matrices until the ABI artifact passes
  generated shader symbol validation and a full phased package/image chain is
  green for that row.
- Treat host ICD/device configuration as runner setup, not an image rebuild issue.

## Runner capacity or missing GPU device/runtime

Symptoms:

- Jobs remain queued for self-hosted runners.
- GPU jobs run on CPU-only hosts.
- Docker cannot see CUDA/ROCm devices.

Checks:

1. Confirm the matrix row runner labels match available runners.
2. Confirm the runner has the relevant GPU devices, host drivers, and container
   runtime integration.
3. Confirm `runner_mode=carrack` is only used for canonical release tags.

Resolution:

- Narrow the matrix with manual filters for retries.
- Fix runner labels or host runtime setup before rerunning the full matrix.
- Do not mark GPU rows validated from Dockerfile `--check` alone.
