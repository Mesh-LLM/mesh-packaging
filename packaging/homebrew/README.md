# Homebrew packaging

The Homebrew formula directly consumes the signed-by-digest upstream Apple Silicon archive:

```text
mesh-llm-v<version>-aarch64-apple-darwin.tar.gz
  -> verify upstream .sha256 sidecar and archive layout
  -> render Formula/mesh-llm.rb with the exact digest
  -> brew install and brew test on macos-15
```

Homebrew strips the archive's single `mesh-bundle/` top-level directory before the formula installs `mesh-llm`; this repository does not rebuild or re-tar the binary. Intel is intentionally unsupported until upstream publishes an x86_64 macOS archive. A dedicated tap remains out of scope until its ownership and update workflow are defined; the rendered formula can be attached to this repository's package release.

Render locally with:

```bash
node --experimental-strip-types scripts/homebrew-release.ts \
  --version v0.73.1 \
  --sha256 <upstream-archive-digest> \
  --formula-output artifacts/homebrew/Formula/mesh-llm.rb
```
