# GPU packaging runbooks

This repository does not compile GPU backends. GPU failures fall into three boundaries: upstream archive availability, downstream runtime-base/package compatibility, or host device validation.

## Archive missing or checksum mismatch

Confirm the generated `upstream_flavor` matches an asset published by the exact upstream tag: `cuda-12`, `cuda-13`, `rocm`, or `vulkan`. Do not rename a runtime toolkit row into a different upstream ABI flavor. A checksum or layout failure is an upstream release-integrity failure and must stop every dependent package row.

## Package or image install failure

ROCm application archives use a major backend ABI while the ROCm image base uses a concrete toolkit version. Confirm the base still exists, its major matches the archive, and the package metadata names the corresponding vendor user-space packages. Use the lean ROCm development image plus the `hipblas` package unless the application demonstrates a dependency that only the multi-gigabyte `complete` image supplies; the complete image exceeds standard hosted-runner disk during extraction.

CUDA rows install no vendor user-space packages and build on the plain distro base, because the native runtime carries its own cudart, cuBLAS, cuBLASLt, and nvJitLink closure. A CUDA install failure that names a missing NVIDIA package means something reintroduced a toolkit dependency, not that the base image drifted. The row's `backend_version` now only labels the archive ABI the runtime was built against; nothing installs against it. The Arch rolling `cuda` package is no longer a row prerequisite either, so its major version drifting no longer forces the row off.

If a CUDA image starts up but finds no device, check `NVIDIA_VISIBLE_DEVICES` and `NVIDIA_DRIVER_CAPABILITIES` in `docker image inspect`. The `nvidia/cuda` base used to supply those and the plain base does not; the matrix derives them for NVIDIA rows and the runtime stage sets them. Empty values on a CUDA image mean the build args did not reach the image.

Vulkan images require the distro Vulkan loader. A loader package failure is downstream packaging; shader/compiler failures belong to upstream because the binary and runtime bundle are already built there.

## Device validation

GitHub-hosted runners validate archive integrity, package installation, and the
command surface without GPU devices or driver stubs. The host executable is
backend-neutral, so `--version`, `--help`, and `runtime list` must work for
CUDA, ROCm, Vulkan, and CPU images without device passthrough.
`docker/qa-runtime-image.sh` then requires `ldd` to report no unresolved
dependencies and rejects case-insensitive matches for `cuda`, `cublas`, `nccl`,
`hip`, `hsa`, `vulkan`, `ggml`, or `llama`. Unresolved imports or these
forbidden direct host dependencies are product failures. These checks do not
prove inference on NVIDIA, AMD, or Vulkan hardware. Hardware qualification
should consume the published candidate image on a controlled host and record
driver, device, runtime selection, and inference evidence. Do not add
self-hosted build runners to this packaging workflow merely to perform device
qualification.

If hardware validation fails, first reproduce with the exact versioned image tag and inspect `mesh-llm runtime list`. Retagging or rebuilding the package cannot repair a host-driver or upstream runtime-bundle defect.
