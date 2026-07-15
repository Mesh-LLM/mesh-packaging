# Native packages

The package pipeline is deliberately binary-only:

```text
verified upstream mesh-bundle/mesh-llm -> native package -> install QA -> OCI image
```

`scripts/upstream-archive.ts` requires a matching one-line SHA256 sidecar, rejects unsafe or unexpected archive layouts, extracts only `mesh-bundle/mesh-llm`, and records source URL/digest/version/flavor provenance. `packaging/native/build-package.sh` stages that binary and produces exactly one package with version, distro, architecture, backend, and backend version in its filename.

Supported emitted formats are `.deb` for Ubuntu and `.pkg.tar.zst` for Arch. APK construction exists as a future format helper but no Alpine row is emitted until upstream provides musl binaries.

All variants use the package identity `mesh-llm`; backend/distro details belong in the immutable filename and description. This makes switching variants a package upgrade instead of allowing conflicting packages to own the same binary path.

`scripts/native-package-qa.sh` verifies the exact filename and single-package invariant, writes SHA256 manifests, inspects native metadata, installs through the distro package manager in the configured package-QA base, and runs `mesh-llm --version` plus `mesh-llm runtime list`. CPU, Vulkan, and ROCm use the final runtime base directly. CUDA uses the matching vendor development image so the commands can load the SDK-provided `libcuda` stub; the real `libcuda.so.1` remains a host-driver responsibility and is never packaged into the application or final image.

`scripts/runtime-image-qa.sh` then verifies the final image contains the native `mesh-llm` package. CPU, Vulkan, and ROCm images execute the command surface. CUDA images must resolve every shared library except `libcuda.so.1`, the one library injected by the NVIDIA container runtime on a GPU host. This separates offline packaging proof from hardware qualification without hiding an unexpected missing dependency.

Packages contain the application binary only. Native runtimes and `native-runtimes.json` remain owned and distributed by upstream MeshLLM.

Native package repositories are not a current release channel. GitHub Release assets may be published with checksums and SBOMs; apt/apk/pacman repositories remain blocked until the signing requirements in `package-signing.md` are implemented.
