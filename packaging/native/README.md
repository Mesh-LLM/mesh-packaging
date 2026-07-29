# Native package builder

`build-package.sh` accepts a verified upstream product-v2 bundle plus matrix
metadata and emits one `.deb`, `.apk`, or `.pkg.tar.zst`. The package owns both
`/usr/local/bin/mesh-llm` and the selected runtime under
`/usr/local/lib/mesh-llm/<version>/native-runtimes`. Active rows currently emit
Ubuntu `.deb` and Arch `.pkg.tar.zst`; APK is retained only for a future
upstream musl archive.

The final OCI target installs the exact emitted package through the distro
package manager. Do not add source compilation or direct binary/runtime copy
paths to the final image.
