# Efficiency and runner capacity

All automation uses GitHub-hosted runners. Linux amd64 uses `ubuntu-24.04`, Linux arm64 uses `ubuntu-24.04-arm`, and Homebrew uses `macos-15`. No self-hosted or Blacksmith runner contract remains.

The full active matrix has 11 Linux package/image rows but only 8 unique Linux upstream archives. Archive verification is deduplicated before distro fan-out. Compilation, UI generation, and llama.cpp builds happen only in upstream MeshLLM, eliminating the largest former cost and drift source.

Use `variant_filter` and `platform_filter` for review iteration. A production dry run should still exercise every active row because rolling Arch dependencies and vendor runtime bases can drift independently even when the upstream binary is unchanged. BuildKit GitHub cache scopes are per package row to keep package layers reusable without cross-row contamination. Runtime dry runs target `runtime-qa` with `type=cacheonly` and deliberately do not export a GitHub Actions cache: exporting either an image tarball or multi-gigabyte Arch CUDA/ROCm cache layers costs more disk, bandwidth, and cache quota than rebuilding the vendor package layer in place.

The expected cost order is CPU < Vulkan < CUDA < ROCm, driven here by QA/runtime base download and package installation rather than compilation. The ROCm row deliberately uses `rocm/dev-ubuntu-24.04:7.0`; its `complete` sibling is more than 5 GB compressed and exhausts a standard hosted runner during extraction. The first complete v0.73.1 dry run after these optimizations finished all 35 jobs in 9m57s. Record subsequent full-run durations and artifact sizes in release notes until enough history exists to establish budgets.
