# Homebrew packaging

macOS GPU distribution is not modeled as a Docker image path. Docker Desktop does not provide the Linux GPU container story needed for CUDA or ROCm on macOS, so macOS distribution should use Homebrew packages and document backend limitations separately from Linux images.

This directory contains the Homebrew tap scaffold for `mesh-llm`:

- `Formula/mesh-llm.rb.template`: release formula template for prebuilt macOS CLI archives.

The expected release flow is:

```text
mesh-llm macOS binary artifact
  -> macOS tarball with mesh-llm
  -> render Formula/mesh-llm.rb from template with version + SHA256 values
  -> publish/update Homebrew tap
```

Prefer bottles or prebuilt tarballs for release distribution. Use source builds only after the macOS build prerequisites, UI build, and native backend limitations are documented and tested.
