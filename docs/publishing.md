# Publishing policy

The release workflow has four publication states:

1. `dry_run=true`: all required archive, package, image, and Homebrew validation
   runs; publication is forcibly disabled. An unfiltered dry run also assembles
   and verifies the exact release asset set and aggregate package provenance.
2. `dry_run=false,publish_images=true`: validated OCI images are pushed to GHCR and receive build-provenance attestations.
3. `dry_run=false,publish_release_assets=true`: native packages, checksums, SPDX SBOMs, and the rendered Homebrew formula are attached to a `packaging-v<version>` release in this repository.
4. `dry_run=false,publish_npm=true`: the install-tested `@mesh-llm/sdk`
   tarball is published with provenance; stable versions use `latest` and
   prereleases use `next`.

Non-npm publish jobs use the `release` GitHub environment, whose deployment policy accepts only `main`, while npm publishing uses the separate `npm` environment described below. Publish jobs have job-local write permissions, and all build and validation jobs are read-only. Add required reviewers when the repository plan supports environment reviewers. The upstream tag must already have a non-draft GitHub Release, the repository must be exactly `Mesh-LLM/mesh-llm`, the ref and version must match, and the tag is resolved to an immutable commit SHA for provenance labels.

Filtered runs are validation-only. If any native variant, platform, or npm lane
filter is present while a publication switch is enabled, planning fails before
build or publication. Native release publication therefore always represents
the checked-in complete 11-row package matrix.

Every enabled native package row preserves its BuildKit statement under an
artifact-specific filename, scans the exact package file into SPDX, and verifies
that the SPDX file subject names and hashes that same package. The current
11-row release matrix contains `.deb` and `.pkg.tar.zst` packages only; the same
exact-subject rule applies to `.apk` if an Alpine row becomes release-enabled.
The release assembler rejects missing, duplicate, or mismatched inputs, then
emits one `provenance.json` in-toto statement with all 11 package
name/SHA-256 subjects and the 11 per-row BuildKit statements. It also emits one
aggregate `SHA256SUMS`; neither aggregate hashes itself.

Versioned package releases are immutable. A publish run either creates the
release once, without `--clobber`, or does nothing when an existing release has
the exact expected tag target, title, body, non-draft/non-prerelease state,
asset-name set, and GitHub-computed asset SHA-256 values. Missing or extra
assets, absent digests, changed bytes, metadata drift, API errors, or tag drift
fail the job. Do not repair a partial or mismatched release in-place; preserve
it as evidence and publish a corrected upstream/package version after review.

GitHub Release assets, GHCR, npm, and the
[`Mesh-LLM/tap`](https://github.com/Mesh-LLM/homebrew-tap) Homebrew tap are the
enabled public channels. Do not create apt, apk, or pacman repositories until
signing/trust-root ownership and rollback procedures exist. Homebrew publishes
a formula that references the immutable upstream macOS product archive and its
upstream-verified SHA256. The formula installs the host in `bin`, the selected
runtime under formula-owned `libexec/native-runtimes`, and the product/import
manifests in `libexec`; it does not rebuild either input. The tap polls this
repository's latest non-prerelease packaging release, validates and installs
the attached `mesh-llm.rb`, and commits it only when it changes.

npm publishing uses the `npm` environment and OIDC trusted publishing for
`Mesh-LLM/mesh-packaging`, workflow `images-release.yml`. The published package
metadata identifies `Mesh-LLM/mesh-packaging` so npm can verify the repository
claim in GitHub's OIDC identity. The publish job must not depend on a stored npm
credential.

The assembler accepts the legacy `@meshllm/sdk` name only as immutable upstream
input from the `v0.74.0` bootstrap release and normalizes the assembled package
to `@mesh-llm/sdk`. All other package names are rejected, and subsequent
upstream releases declare the canonical name directly.

Moving convenience OCI tags are published alongside immutable version tags.
Rollback must never mutate a versioned host, runtime, product, package, or image
silently: stop the affected row, preserve both input digests as evidence, and
publish a new upstream version or explicit correction record.

This repository is the sole GHCR producer. A successful non-canary
`Mesh-LLM/mesh-llm` release with the complete GPU bundle set dispatches
`mesh-llm-release` only after the upstream GitHub Release is published. The
production payload sets `dry_run=false`, `publish_images=true`, and
`publish_release_assets=true`. Upstream's client Docker workflow remains
available only as manual, non-publishing validation. npm publication is
independently controlled by `publish_npm`.
