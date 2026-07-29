# Packaging readiness scorecard

Readiness is evidence-based, not a static percentage. A release is ready only when every required job in `images-release.yml` succeeds in dry-run mode and the final readiness manifest is green.

| Area | Implemented gate | Remaining operational proof |
|---|---|---|
| Upstream accuracy | Published tag/release, exact product names/checksums, strict product-v2 layout, host/runtime digest verification | Run against each new release |
| Matrix coverage | Schema validation and explicit active/blocked rows | Review when upstream asset inventory changes |
| Package correctness | Native metadata, checksum, host/runtime ownership, no-device version/help/runtime-list smoke | Full dry-run evidence |
| OCI correctness | Image installs the exact package, labels both input digests, and repeats no-device smoke | Full dry-run evidence plus separate hardware qualification |
| Homebrew | Direct upstream arm64 product, formula-owned runtime, strict audit/install/test, canonical tap sync | Validate each release before tap update |
| Efficiency | One host per OS/architecture is composed with 8 verified runtimes and fans out to 11 package rows; no source builds | Record duration, artifact sizes, and cache behavior |
| Publish safety | Dry-run override, job-local write permissions, release environment | Configure/approve environment and observe first publish rehearsal |
| Automation | Repository dispatch receiver | Provision upstream fine-grained dispatch credential/App |

Alpine and Intel macOS are correctly represented as unsupported, not partial
successes. Native Linux package repositories remain deliberately blocked by
signing and ownership work; Homebrew uses the upstream archive digest and tap
history as its trust and rollback record.
