# Packaging readiness scorecard

Readiness is evidence-based, not a static percentage. A release is ready only when every required job in `images-release.yml` succeeds in dry-run mode and the final readiness manifest is green.

| Area | Implemented gate | Remaining operational proof |
|---|---|---|
| Upstream accuracy | Published tag, release, exact archive names, checksums, safe layout, version smoke | Run against each new release |
| Matrix coverage | Schema validation and explicit active/blocked rows | Review when upstream asset inventory changes |
| Package correctness | Native metadata, checksum, install, version/runtime command smoke | Full dry-run evidence |
| OCI correctness | Image installs the exact package and repeats command smoke | Full dry-run evidence |
| Homebrew | Direct upstream arm64 archive, digest, install and test | Full dry-run evidence |
| Efficiency | 8 verified archives fan out to 11 package rows; no source builds | Record duration and cache behavior |
| Publish safety | Dry-run override, job-local write permissions, release environment | Configure/approve environment and observe first publish rehearsal |
| Automation | Repository dispatch receiver | Provision upstream fine-grained dispatch credential/App |

Alpine and Intel macOS are correctly represented as unsupported, not partial successes. Native package repositories and a Homebrew tap remain deliberately blocked by signing and ownership work.
