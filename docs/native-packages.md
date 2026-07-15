# Native packages

The package pipeline is deliberately binary-only:

```text
verified upstream mesh-bundle/mesh-llm -> native package -> install QA -> OCI image
```

`scripts/upstream-archive.ts` requires a matching one-line SHA256 sidecar, rejects unsafe or unexpected archive layouts, extracts only `mesh-bundle/mesh-llm`, and records source URL/digest/version/flavor provenance. `packaging/native/build-package.sh` stages that binary and produces exactly one package with version, distro, architecture, backend, and backend version in its filename.

Supported emitted formats are `.deb` for Ubuntu and `.pkg.tar.zst` for Arch. APK construction exists as a future format helper but no Alpine row is emitted until upstream provides musl binaries.

All variants use the package identity `mesh-llm`; backend/distro details belong in the immutable filename and description. This makes switching variants a package upgrade instead of allowing conflicting packages to own the same binary path.

Native metadata declares the user-space loader dependencies needed by the selected backend. Ubuntu CUDA packages depend on the matching toolkit-series CUDA runtime, cuBLAS, and NCCL packages; Ubuntu ROCm depends on hipBLAS, which pulls its ROCm BLAS/runtime closure. The GPU vendor repository is therefore a prerequisite for installing those packages outside the configured vendor base. Host driver libraries and devices are intentionally not package dependencies.

`scripts/native-package-qa.sh` verifies the exact filename and single-package invariant, writes SHA256 manifests, inspects native metadata, installs through the distro package manager in the configured runtime base, and runs `mesh-llm --version` plus `mesh-llm runtime list`. CUDA QA temporarily installs the matching small `cuda-driver-dev` package so the commands can load its vendor-provided `libcuda` stub; the real `libcuda.so.1` remains a host-driver responsibility and is never packaged into the application or final image.

The Dockerfile's `runtime-qa` stage extends the exact final runtime stage and verifies that it contains the native `mesh-llm` package. CPU, Vulkan, and ROCm execute the command surface. CUDA must resolve every shared library except `libcuda.so.1`, the one library injected by the NVIDIA container runtime on a GPU host. Dry runs emit this stage as BuildKit cache only instead of exporting and loading a duplicate image tarball. This separates offline packaging proof from hardware qualification without hiding an unexpected missing dependency.

Packages contain the application binary only. Native runtimes and `native-runtimes.json` remain owned and distributed by upstream MeshLLM.

Native package repositories are not a current release channel. GitHub Release assets may be published with checksums and SBOMs; apt/apk/pacman repositories remain blocked until the signing requirements in `package-signing.md` are implemented.
