# Publishing policy

The release workflow has four publication states:

1. `dry_run=true`: all required archive, package, image, and Homebrew validation runs; publication is forcibly disabled.
2. `dry_run=false,publish_images=true`: validated OCI images are pushed to GHCR and receive build-provenance attestations.
3. `dry_run=false,publish_release_assets=true`: native packages, checksums, SPDX SBOMs, and the rendered Homebrew formula are attached to a `packaging-v<version>` release in this repository.
4. `dry_run=false,publish_npm=true`: the install-tested `@mesh-llm/sdk`
   tarball is published with provenance; stable versions use `latest` and
   prereleases use `next`.

Non-npm publish jobs use the `release` GitHub environment, whose deployment policy accepts only `main`, while npm publishing uses the separate `npm` environment described below. Publish jobs have job-local write permissions, and all build and validation jobs are read-only. Add required reviewers when the repository plan supports environment reviewers. The upstream tag must already have a non-draft GitHub Release, the repository must be exactly `Mesh-LLM/mesh-llm`, the ref and version must match, and the tag is resolved to an immutable commit SHA for provenance labels.

GitHub Release assets, GHCR, and npm are the enabled public channels. Do not create apt, apk, pacman, or Homebrew tap publication until signing/trust-root ownership and rollback procedures exist. Homebrew currently publishes a formula that references the immutable upstream macOS archive and its upstream-verified SHA256; it does not repackage that binary.

npm publishing uses the `npm` environment and OIDC trusted publishing for
`Mesh-LLM/mesh-packaging`, workflow `images-release.yml`. The published package
metadata identifies `Mesh-LLM/mesh-packaging` so npm can verify the repository
claim in GitHub's OIDC identity. The publish job must not depend on a stored npm
credential.

The assembler accepts the legacy `@meshllm/sdk` name only as immutable upstream
input from the `v0.74.0` bootstrap release and normalizes the assembled package
to `@mesh-llm/sdk`. All other package names are rejected, and subsequent
upstream releases declare the canonical name directly.

Moving convenience OCI tags are published alongside immutable version tags. Rollback must never mutate the versioned tag silently: stop the affected row, preserve evidence, and publish a new upstream version or explicit correction record.

This repository is the sole GHCR producer. A successful non-canary
`Mesh-LLM/mesh-llm` release with the complete GPU bundle set dispatches
`mesh-llm-release` only after the upstream GitHub Release is published. The
production payload sets `dry_run=false`, `publish_images=true`, and
`publish_release_assets=true`. Upstream's client Docker workflow remains
available only as manual, non-publishing validation. npm publication is
independently controlled by `publish_npm`.
