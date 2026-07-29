# Package signing policy

Unsigned native package files may be attached to GitHub Releases only when they
are accompanied by SHA256 manifests, SBOMs, GitHub artifact-attestation
verification notes, and composition provenance naming the immutable host and
runtime digests. Do not publish unsigned artifacts through apt, apk, pacman, or
Homebrew package repositories.

The SBOM is valid release evidence only when its SPDX file subject is the exact
native package basename and includes the package's verified SHA-256. Directory
inventory alone is insufficient. The canonical release `provenance.json` must
contain all 11 native package name/digest subjects and retain the corresponding
uniquely named per-row BuildKit statements. The GitHub artifact attestation is
generated once from the same 11-subject checksum list.

## Repository signing requirements

Before enabling distro package repositories, define and test the signing path for
each package format:

- `.deb`: sign repository metadata (`Release`/`InRelease`) with the apt archive
  signing key. Package-level signatures are optional, but repository metadata
  signing is mandatory for apt distribution.
- `.apk`: sign packages or repository indexes with an Alpine package signing key
  and publish the matching public key through documented trust-root bootstrap
  instructions.
- `.pkg.tar.zst`: sign packages or repository databases with the pacman package
  signing key and document the keyring import/trust flow.
- Homebrew: keep formula updates in the tap history and rely on tarball SHA256s;
  only add additional signature files if the tap policy requires them.

## Key operations

- Store private signing keys outside this repository and load them only through
  GitHub Actions environments or another audited secret-management system.
- Require manual environment approval before any job can access signing keys.
- Publish public keys, fingerprints, owner/contact, creation date, expiration
  date, and rotation schedule in release documentation before repository launch.
- Rotate keys on a documented cadence and immediately after any suspected secret
  exposure.
- Keep GitHub Release assets, host/runtime/product checksums, SBOMs,
  composition provenance, attestation references, image digests, and signatures
  for the full support window of each `mesh-llm` release.
- Never replace or clobber a versioned release asset. Treat an exact existing
  release as a no-op and any metadata or digest difference as a release incident
  requiring review and a new version.

## Release gate

A release may publish GitHub Release assets and GHCR images without repository
signing. A release must not publish apt/apk/pacman repositories until the
format-specific signing flow, trust-root documentation, and key-rotation runbook
have all passed a dry run.
