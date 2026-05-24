# Native package roadmap

This repository is the home for native Linux packages:

- Debian/Ubuntu: `.deb`
- Fedora/RHEL/openSUSE: `.rpm`
- Alpine: `.apk`
- Arch: `.pkg.tar.zst`

The packaging flow is:

1. Reuse the same release metadata from the `mesh-llm-release` dispatch payload.
2. Build `mesh-llm` once per distro/backend/platform target from restored UI and llama.cpp ABI artifacts.
3. Build a native package artifact from that binary and matrix metadata.
4. Assemble Docker runtime images by installing that native package artifact with the distro package manager.
5. Keep package names aligned with image tags: version, distro, arch, backend, and backend version must remain visible.

Implemented package formats:

| Distro | Package format | Builder path | Runtime install path |
|---|---|---|---|
| Ubuntu/Debian | `.deb` | `packaging/native/build-package.sh` | `apt-get install /packages/*.deb` |
| Alpine | `.apk` | `packaging/native/build-package.sh` | `apk add --allow-untrusted /packages/*.apk` |
| Arch | `.pkg.tar.zst` | `packaging/native/build-package.sh` | `pacman -U /packages/*.pkg.tar.zst` |

RPM support remains reserved for future RPM-family distro rows.

## macOS

macOS distribution is handled separately through Homebrew scaffolding in `packaging/homebrew/`. Do not model macOS GPU support as a Docker image path; Docker Desktop is not the macOS GPU runtime story for CUDA or ROCm.
