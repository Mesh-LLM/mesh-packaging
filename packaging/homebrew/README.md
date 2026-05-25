# Homebrew packaging

macOS GPU distribution is not modeled as a Docker image path. Docker Desktop does not provide the Linux GPU container story needed for CUDA or ROCm on macOS, so macOS distribution should use Homebrew packages and document backend limitations separately from Linux images.

This directory contains the Homebrew tap scaffold for `mesh-llm`:

- `Formula/mesh-llm.rb.template`: release formula template for prebuilt macOS CLI archives.
- `scripts/homebrew-release.ts`: release helper that packages real macOS CLI
  binaries into tarballs, computes SHA256s, and renders the formula.

The expected release flow is:

```text
mesh-llm macOS binary artifact
  -> macOS tarball with mesh-llm
  -> render Formula/mesh-llm.rb from template with version + SHA256 values
  -> publish/update Homebrew tap
```

Render release assets after the upstream macOS builds produce one `mesh-llm`
binary per architecture:

```bash
node --experimental-strip-types scripts/homebrew-release.ts \
  --version v0.66.0 \
  --arm64-binary artifacts/macos-arm64/mesh-llm \
  --amd64-binary artifacts/macos-amd64/mesh-llm \
  --output-dir artifacts/homebrew-release
```

The output directory contains:

- `mesh-llm-<version>-macos-arm64.tar.gz`
- `mesh-llm-<version>-macos-amd64.tar.gz`
- `Formula/mesh-llm.rb` rendered from the template with both SHA256 values.

Prefer bottles or prebuilt tarballs for release distribution. Use source builds only after the macOS build prerequisites, UI build, and native backend limitations are documented and tested.
