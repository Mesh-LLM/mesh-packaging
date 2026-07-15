# Native package builder

`build-package.sh` accepts a verified upstream `mesh-llm` binary plus matrix metadata and emits one `.deb`, `.apk`, or `.pkg.tar.zst`. Active rows currently emit Ubuntu `.deb` and Arch `.pkg.tar.zst`; APK is retained only for a future upstream musl archive.

The final OCI target installs the exact emitted package through the distro package manager. Do not add source compilation, direct binary-copy runtime paths, native runtime archives, or `native-runtimes.json` here.
