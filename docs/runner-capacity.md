# Efficiency and runner capacity

All automation uses GitHub-hosted runners. Linux amd64 uses `ubuntu-24.04`, Linux arm64 uses `ubuntu-24.04-arm`, and Homebrew uses `macos-15`. No legacy external or self-hosted runner contract remains.

The full active matrix has 11 Linux package/image rows but only 8 unique Linux
product archives. Archive, host digest, runtime digest, and product-manifest
verification are deduplicated before distro fan-out. Host compilation, UI
generation, and native-runtime builds happen only in upstream MeshLLM,
eliminating the largest former cost and drift source.

Use `native_selector` with exact artifact IDs for review iteration. A production
dry run should still exercise every active row because rolling Arch dependencies
and vendor runtime bases can drift independently even when the upstream binary
is unchanged. BuildKit GitHub cache scopes are per row. Dry runs build and load
one final image for external QA without registry writes; publishing runs push
one staging image and reuse its exact tested digest during promotion.

The expected cost order is CPU < Vulkan < CUDA < ROCm, driven here by
QA/runtime-base download and package installation rather than compilation. All
rows run neutral-host command smoke without a device; optional hardware
qualification belongs on controlled GPU runners and does not replace the
hosted no-device gate. The ROCm row deliberately uses
`rocm/dev-ubuntu-24.04:7.0`; its `complete` sibling is more than 5 GB compressed
and exhausts a standard hosted runner during extraction. The first complete
v0.73.1 static-host dry run finished all 35 jobs in 9m57s; keep it as historical
data and record a new product-v2 baseline before setting current budgets.
