# GPU packaging runbooks

This repository does not compile GPU backends. GPU failures fall into three boundaries: upstream archive availability, downstream runtime-base/package compatibility, or host device validation.

## Archive missing or checksum mismatch

Confirm the generated `upstream_flavor` matches an asset published by the exact upstream tag: `cuda-12`, `cuda-13`, `rocm`, or `vulkan`. Do not rename a runtime toolkit row into a different upstream ABI flavor. A checksum or layout failure is an upstream release-integrity failure and must stop every dependent package row.

## Package or image install failure

CUDA and ROCm application archives use a major backend ABI while image bases use concrete toolkit versions. Confirm the runtime bases still exist, their major matches the archive, and the native package metadata names the corresponding vendor user-space packages. Use the lean ROCm development image plus the `hipblas` package unless the application demonstrates a dependency that only the multi-gigabyte `complete` image supplies; the complete image exceeds standard hosted-runner disk during extraction. For Arch, confirm the rolling `cuda` package remains CUDA 13; if it advances to a new major, disable the row until upstream publishes a compatible archive.

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
