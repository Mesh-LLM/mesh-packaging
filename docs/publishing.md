# Publishing strategy

The initial supported publication channels are short-lived GitHub Actions
artifacts for intermediate validation, durable GitHub Release assets for native
packages and provenance records, and GHCR for final runtime images. Native
package repositories are intentionally deferred until package signing and
repository key rotation are in place; see `docs/package-signing.md` for the
release gate.

## Current release outputs

The image release workflow currently produces these CI artifacts per matrix row:

- `mesh-llm-binary-<version>-<variant>-<arch>`: row-specific `mesh-llm` binary,
  `SHA256SUMS`, a compatibility `.sha256` file, and SPDX JSON SBOM.
- `mesh-llm-package-<version>-<variant>-<arch>`: exact native package artifact
  (`.deb`, `.apk`, or `.pkg.tar.zst`), `SHA256SUMS`, per-package `.sha256`, and
  SPDX JSON SBOM.
- `mesh-llm-image-digest-<version>-<variant>-<arch>`: pushed image digest record
  and image SPDX JSON SBOM when publishing is enabled.
- GHCR images tagged as documented in `docs/tagging.md`.
- GitHub Release assets for each published matrix row, promoted by the
  `publish-release-assets` job when `push=true`:
  - the exact native package file (`.deb`, `.apk`, or `.pkg.tar.zst`),
  - the package `SHA256SUMS` manifest and compatibility `.sha256` file,
  - the native package SPDX JSON SBOM,
  - the pushed image digest record and image SPDX JSON SBOM,
  - a row-specific attestation reference file with verification commands.

Publishing runs first create or reuse the matching release tag in this
repository through `ensure-github-release`, then each matrix row uploads its
release assets to that release. The tag points at the `mesh-agent-images` commit
that ran the packaging workflow; the release notes record the immutable upstream
`mesh-llm` source commit used for the build.

Artifacts are attested with GitHub artifact attestations. Pushed container images
are attested against their digest and pushed to the registry.

GitHub Actions artifacts are short-lived validation outputs. The matching GitHub
Release assets are the durable package/provenance distribution record.

## Native package repository policy

Until signing is implemented, native packages should not be published to
apt/apk/pacman repositories. The durable unsigned distribution path attaches the
exact package files, checksums, SBOMs, image digest records, and attestation
references to the matching GitHub Release. Unsigned GitHub Release assets are
acceptable only as direct release downloads, not as package repository inputs.

When repository publication is added, use this order:

1. Keep GitHub Release assets as the immutable source of record.
2. Sign each native package format with format-appropriate keys before
   publishing distro repositories.
3. Publish distro repositories only after documenting trust roots and key
   rotation as described in `docs/package-signing.md`.
4. Keep package names versioned by distro, architecture, backend, and backend
   version; do not overwrite package files in place.
5. Retain checksums, SBOMs, attestations, and image digest records alongside the
   public release.

## Retention policy

GitHub Actions intermediate artifacts are short-lived CI outputs. Published
GitHub Release assets, SBOMs, checksums, attestation references, and GHCR image
digests should be retained for the full support window of the corresponding
`mesh-llm` release.

## Upgrade behavior

Package upgrades should follow normal distro package-manager semantics once
repositories exist. Until then, users install exact package files from the
corresponding GitHub Release; automated upgrades are not promised until package
repositories exist.
