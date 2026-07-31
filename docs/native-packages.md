# Native packages

The package pipeline is deliberately composition-only:

```text
verified upstream host + runtime bundle -> native package -> install QA -> OCI image
```

`scripts/upstream-archive.ts` requires a matching one-line SHA256 sidecar,
enforces `schemas/product-v2.schema.json` semantics and a strict archive
allowlist, verifies the host/runtime digests, extracts the complete product
bundle, and records both immutable inputs in provenance.
The producer repository carries an identical product-v2 schema. The release
plan downloads that schema at the immutable upstream source SHA and byte-checks
it against this checkout before any archive, package, or image job starts.
Contract changes update both copies in the same cross-repository change; a
release must not proceed with unexplained schema drift.
`packaging/native/build-package.sh` stages that verified bundle and produces
exactly one package with version, distro, architecture, backend, and backend
version in its filename.

Supported emitted formats are `.deb` for Ubuntu and `.pkg.tar.zst` for Arch. APK construction exists as a future format helper but no Alpine row is emitted until upstream provides musl binaries.

All variants use the package identity `mesh-llm`; backend/distro details belong in the immutable filename and description. This makes switching variants a package upgrade instead of allowing conflicting packages to own the same binary path.

Native metadata declares the user-space loader dependencies needed by the selected backend. Ubuntu CUDA packages depend on the matching toolkit-series CUDA runtime, cuBLAS, and NCCL packages; Ubuntu ROCm depends on hipBLAS, which pulls its ROCm BLAS/runtime closure. The GPU vendor repository is therefore a prerequisite for installing those packages outside the configured vendor base. Host driver libraries and devices are intentionally not package dependencies.

`scripts/native-package-qa.sh` verifies the exact filename and single-package
invariant, writes SHA256 manifests, inspects native metadata, installs through
the distro package manager, proves ownership of the host plus the versioned
runtime directory, and runs `mesh-llm --version` plus `mesh-llm runtime list`
without a GPU device or driver. It then uses the shared readiness helper with
unique API/console ports and cache/runtime roots to start
`--log-format json --no-console client` without public discovery, require either the JSON
`Client ready` message or the structured
`passive_mode`/`status=ready`/`role=client` event while the process is alive,
and require bounded SIGINT shutdown.

The per-row workflow builds the Dockerfile's final `runtime` target once, then
runs external QA against that exact image. It verifies package ownership,
rejects backend imports or unresolved libraries from the host executable, and
runs the same no-driver client readiness smoke without device access.
Publishing QA pulls the run-scoped staging image by digest; promotion retags
that tested digest without rebuilding. Backend libraries may reference their
driver interface only from inside the native runtime. Hardware-qualified
serving is separate additive coverage.

Packages install the host at `/usr/local/bin/mesh-llm` and the selected runtime
at `/usr/local/lib/mesh-llm/<version>/native-runtimes/<runtime-id>`, alongside
the product manifest and host import report.

Native package repositories are not a current release channel. GitHub Release assets may be published with checksums and SBOMs; apt/apk/pacman repositories remain blocked until the signing requirements in `package-signing.md` are implemented.
