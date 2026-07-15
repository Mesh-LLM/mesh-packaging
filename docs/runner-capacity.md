# Efficiency and runner capacity

All automation uses GitHub-hosted runners. Linux amd64 uses `ubuntu-24.04`, Linux arm64 uses `ubuntu-24.04-arm`, and Homebrew uses `macos-15`. No self-hosted or Blacksmith runner contract remains.

The full active matrix has 11 Linux package/image rows but only 8 unique Linux upstream archives. Archive verification is deduplicated before distro fan-out. Compilation, UI generation, and llama.cpp builds happen only in upstream MeshLLM, eliminating the largest former cost and drift source.

Use `variant_filter` and `platform_filter` for review iteration. A production dry run should still exercise every active row because rolling Arch dependencies and vendor runtime bases can drift independently even when the upstream binary is unchanged. BuildKit GitHub cache scopes are per artifact row to keep package and runtime layers reusable without cross-row contamination. Runtime dry runs target `runtime-qa` with `type=cacheonly`; exporting and importing an image tarball would duplicate large GPU layers and can exceed hosted-runner disk even when the publishable image itself is valid.

The expected cost order is CPU < Vulkan < ROCm < CUDA, driven here by QA/runtime base download and package installation rather than compilation. The ROCm row deliberately uses `rocm/dev-ubuntu-24.04:7.0`; its `complete` sibling is more than 5 GB compressed and exhausts a standard hosted runner during extraction. Record actual full-run duration and artifact sizes in release notes until enough history exists to establish budgets.
