# Native packages

This directory contains Linux native package builders and staging helpers. The image matrix in `../images.json` remains the shared source of target truth.

Current package formats:

- Ubuntu/Debian rows: `.deb`
- Alpine rows: `.apk`
- Arch rows: `.pkg.tar.zst`

`build-package.sh` consumes a completed `mesh-llm` application binary artifact plus matrix metadata and writes the native package into the requested output directory. The release workflow uploads that package artifact and final Docker images install it with the distro package manager instead of copying the binary directly.

Do not add native runtime archives, `native-runtimes.json`, or runtime cache contents here. The runtime engine and native runtime release assets stay in upstream `mesh-llm`; these package builders only distribute the CLI/application artifact for the configured package-manager destination.

Keep any future `.rpm` support under this directory as a new package format and add corresponding distro rows in `../images.json`.
