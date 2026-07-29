# Packaging readiness scorecard

Readiness is evidence-based, not a static percentage. A release is ready only when every required job in `images-release.yml` succeeds in dry-run mode and the final readiness manifest is green.

| Area | Implemented gate | Remaining operational proof |
|---|---|---|
| Upstream accuracy | Published tag/release, exact product names/checksums, strict product-v2 layout, host/runtime digest verification | Run against each new release |
| Matrix coverage | Schema validation and explicit active/blocked rows | Review when upstream asset inventory changes |
| Package correctness | Native metadata, checksum, host/runtime ownership, version/runtime-list checks, and no-device client readiness with bounded shutdown | Full dry-run evidence |
| OCI correctness | Image installs the exact package, labels both input digests, checks the final entrypoint, and reaches client readiness without a device | Full dry-run evidence plus separate hardware qualification |
| Homebrew | Direct upstream arm64 product, formula-owned runtime, strict audit/install/test, and no-device client readiness | Validate each release before tap update |
| npm SDK | Every addon lane is packed into a fresh project and must complete public `Node` start/status/finally-stop with normal process exit; the assembled package repeats the host-lane proof | Validate the exact public package separately during distribution certification |
| Efficiency | One host per OS/architecture is composed with 8 verified runtimes and fans out to 11 package rows; no source builds | Record duration, artifact sizes, and cache behavior |
| Publish safety | Dry-run override, job-local write permissions, release environment | Configure/approve environment and observe first publish rehearsal |
| Automation | Repository dispatch receiver | Provision upstream fine-grained dispatch credential/App |

Alpine and Intel macOS are correctly represented as unsupported, not partial
successes. Native Linux package repositories remain deliberately blocked by
signing and ownership work; Homebrew uses the upstream archive digest and tap
history as its trust and rollback record.
