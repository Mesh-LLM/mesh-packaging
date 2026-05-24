# Publishing strategy

The initial supported publication channels are GitHub Actions artifacts for
intermediate binaries/packages and GHCR for final runtime images. Durable GitHub
Release asset publication for native packages is the next required step before
public package distribution. Native package repositories are intentionally
deferred until package signing and repository key rotation are in place.

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

Artifacts are attested with GitHub artifact attestations. Pushed container images
are attested against their digest and pushed to the registry.

GitHub Actions artifacts are short-lived validation outputs. They are not a
durable package distribution channel by themselves.

## Native package repository policy

Until signing is implemented, native packages should not be published to
apt/apk/pacman repositories. The durable unsigned distribution path, once added,
should attach the exact package files, checksums, SBOMs, and attestation records
to the matching GitHub Release.

When repository publication is added, use this order:

1. Add a release-asset promotion step that attaches native packages, checksums,
   SBOMs, image digest records, and attestation links to the matching GitHub
   Release.
2. Keep GitHub Release assets as the immutable source of record.
3. Sign each native package format with format-appropriate keys before
   publishing distro repositories.
4. Publish distro repositories only after documenting trust roots and key
   rotation.
5. Keep package names versioned by distro, architecture, backend, and backend
   version; do not overwrite package files in place.
6. Retain checksums, SBOMs, attestations, and image digest records alongside the
   public release.

## Retention policy

GitHub Actions intermediate artifacts are short-lived CI outputs. Published
GitHub Release assets, SBOMs, checksums, attestations, and GHCR image digests
should be retained for the full support window of the corresponding `mesh-llm`
release once release-asset promotion is implemented.

## Upgrade behavior

Package upgrades should follow normal distro package-manager semantics once
repositories exist. After release-asset promotion is implemented, users install
exact package files from the corresponding GitHub Release; automated upgrades are
not promised until package repositories exist.
