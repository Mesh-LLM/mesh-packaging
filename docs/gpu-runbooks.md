# GPU packaging runbooks

This repository does not compile GPU backends. GPU failures fall into three boundaries: upstream archive availability, downstream runtime-base/package compatibility, or host device validation.

## Archive missing or checksum mismatch

Confirm the generated `upstream_flavor` matches an asset published by the exact upstream tag: `cuda-12`, `cuda-13`, `rocm`, or `vulkan`. Do not rename a runtime toolkit row into a different upstream ABI flavor. A checksum or layout failure is an upstream release-integrity failure and must stop every dependent package row.

## Package or image install failure

CUDA and ROCm application archives use a major backend ABI while image bases use concrete toolkit versions. Confirm the runtime base still exists and its major matches the archive. For Arch, confirm the rolling `cuda` package remains CUDA 13; if it advances to a new major, disable the row until upstream publishes a compatible archive.

Vulkan images require the distro Vulkan loader. A loader package failure is downstream packaging; shader/compiler failures belong to upstream because the binary and runtime bundle are already built there.

## Device validation

GitHub-hosted runners validate archive integrity, package installation, binary startup, and the runtime command surface without GPU devices. They do not prove inference on NVIDIA, AMD, or Vulkan hardware. Hardware qualification should consume the published candidate image on a controlled host and record driver, device, runtime installation, and inference evidence. Do not add self-hosted build runners to this packaging workflow merely to perform device qualification.

If hardware validation fails, first reproduce with the exact versioned image tag and inspect `mesh-llm runtime list`. Retagging or rebuilding the package cannot repair a host-driver or upstream runtime-bundle defect.
