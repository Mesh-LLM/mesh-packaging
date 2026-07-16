# Publishing policy

The release workflow has three states:

1. `dry_run=true`: all required archive, package, image, and Homebrew validation runs; publication is forcibly disabled.
2. `dry_run=false,publish_images=true`: validated OCI images are pushed to GHCR and receive build-provenance attestations.
3. `dry_run=false,publish_release_assets=true`: native packages, checksums, SPDX SBOMs, and the rendered Homebrew formula are attached to a `packaging-v<version>` release in this repository.

Publish jobs use the `release` GitHub environment, whose deployment policy accepts only `main`, and have job-local write permissions. All build and validation jobs are read-only. Add required reviewers when the repository plan supports environment reviewers. The upstream tag must already have a non-draft GitHub Release, the repository must be exactly `Mesh-LLM/mesh-llm`, the ref and version must match, and the tag is resolved to an immutable commit SHA for provenance labels.

GitHub Release assets and GHCR are the only enabled public channels. Do not create apt, apk, pacman, or Homebrew tap publication until signing/trust-root ownership and rollback procedures exist. Homebrew currently publishes a formula that references the immutable upstream macOS archive and its upstream-verified SHA256; it does not repackage that binary.

Moving convenience OCI tags are published alongside immutable version tags. Rollback must never mutate the versioned tag silently: stop the affected row, preserve evidence, and publish a new upstream version or explicit correction record.

This repository is the sole GHCR producer. A successful non-canary
`Mesh-LLM/mesh-llm` release with the complete GPU bundle set dispatches
`mesh-llm-release` only after the upstream GitHub Release is published. The
production payload sets `dry_run=false`, `publish_images=true`, and
`publish_release_assets=true`. Upstream's client Docker workflow remains
available only as manual, non-publishing validation.
