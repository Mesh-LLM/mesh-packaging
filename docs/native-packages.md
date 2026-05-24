# Native package roadmap

This repository is also the future home for native Linux packages:

- Debian/Ubuntu: `.deb`
- Fedora/RHEL/openSUSE: `.rpm`
- Alpine: `.apk`
- Arch: `.pkg.tar.zst`

The intended packaging flow is:

1. Reuse the same release metadata from the `mesh-llm-release` dispatch payload.
2. Build `mesh-llm` once per distro/backend/platform target.
3. Stage a normalized filesystem tree under `packaging/native/stage/<target>/`.
4. Emit native packages from that tree with distro-specific metadata.
5. Keep package names aligned with image tags: version, distro, arch, backend, and backend version must remain visible.

No native package builders are implemented yet; this document reserves the structure so the image work does not need to be reorganized later.
