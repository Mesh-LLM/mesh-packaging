# Homebrew packaging

macOS GPU distribution is not modeled as a Docker image path. Docker Desktop does not provide the Linux GPU container story needed for CUDA or ROCm on macOS, so macOS distribution should use Homebrew packages and document backend limitations separately from Linux images.

This directory contains the Homebrew tap scaffold for `mesh-llm`:

- `Formula/mesh-llm.rb.template`: release formula template for prebuilt macOS CLI archives.
- `scripts/homebrew-release.ts`: release helper that packages real macOS CLI
  binaries into tarballs, computes SHA256s, and renders the formula.

The expected release flow is:

```text
mesh-llm macOS arm64/amd64 binary artifacts from the release workflow
  <- restored shared UI artifact + native macOS llama ABI artifacts
  -> macOS tarballs with mesh-llm
  -> render Formula/mesh-llm.rb from template with version + SHA256 values
  -> audit formula and install-smoke local tarball rewrites on arm64 + Intel
  -> publish tarballs, checksums, and rendered formula to the GitHub Release
```

The production workflow builds real `arm64` and `amd64` binaries on native macOS
runners, runs this helper against those binaries, validates the rendered formula
with `brew audit --strict`, install-smokes local tarball rewrites on both macOS
runner architectures, and only then uploads the tarballs/formula to the matching
GitHub Release.

For local validation, render release assets after you have one real `mesh-llm`
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
- per-tarball `.sha256` files plus `SHA256SUMS`
- `Formula/mesh-llm.rb` rendered from the template with both SHA256 values.

The first production channel is GitHub Release tarballs plus the rendered formula
asset. A dedicated Homebrew tap is intentionally deferred until a tap repository
and formula update process are created; at that point the release checklist must
gate publication on a tap PR or equivalent audited update.

Prefer bottles or prebuilt tarballs for release distribution. Use source builds only after the macOS build prerequisites, UI build, and native backend limitations are documented and tested.
