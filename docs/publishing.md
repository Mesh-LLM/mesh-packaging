# Publishing policy

The release workflow has four publication states:

1. `dry_run=true`: publication is forcibly disabled while the explicitly
   enabled native, Homebrew, and npm validation components run.
2. `dry_run=false,publish_images=true`: every final OCI image is pushed once to
   a run-scoped staging tag, tested by immutable digest, attested, indexed, and
   promoted without another build.
3. `dry_run=false,publish_release_assets=true`: native packages, checksums, SPDX SBOMs, and the rendered Homebrew formula are attached to a `packaging-v<version>` release in this repository.
4. `dry_run=false,publish_npm=true`: the install-tested `@mesh-llm/sdk`
   tarball is published with provenance; stable versions use `latest` and
   prereleases use `next`.

Non-npm publish jobs use the `release` GitHub environment, whose deployment policy accepts only `main`, while npm publishing uses the separate `npm` environment described below. Publish jobs have job-local write permissions, and all build and validation jobs are read-only. Add required reviewers when the repository plan supports environment reviewers. The upstream tag must already have a non-draft GitHub Release, the repository must be exactly `Mesh-LLM/mesh-llm`, the ref and version must match, and the tag is resolved to an immutable commit SHA for provenance labels.

Planning is typed and fail-closed. Native and npm selectors accept only `all` or
exact checked-in artifact/lane IDs; aliases, empty tokens, duplicates, and
unknown IDs fail before scheduling. Publication requires the complete matching
producer set: images require all native rows, package release assets require all
native rows plus Homebrew, and npm requires all addon lanes.

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
The canonical image release index binds the upstream and packaging SHAs,
digest-qualified runtime bases, package/product hashes, exact QA-tested image
digests, and destination tags. Promotion rejects a conflicting version tag and
records each convenience tag's previous digest in a rollback ledger. Promotion
contains no Docker build. Rollback must never mutate a versioned host, runtime,
product, package, or image silently.

This repository is the sole GHCR producer. A successful non-canary
`Mesh-LLM/mesh-llm` release with the complete GPU bundle set dispatches
`mesh-llm-release` only after the upstream GitHub Release is published. The
production payload sets `dry_run=false`, `publish_images=true`, and
`publish_release_assets=true`. Upstream's client Docker workflow remains
available only as manual, non-publishing validation. npm publication is
independently controlled by `publish_npm`.

## Depot Registry pull-through cache

Pull-through caching is an optional base-image optimization, not a release
requirement. Before enabling it, use the `mesh-llm` Depot Registry canary to
compare at least five upstream and five mirrored pulls of the same digest on
fresh runners. Adopt a mapping only when the mirror median saves both at least
20 percent and 10 seconds, with every sample resolving to the upstream digest.

Create one Depot Registry pull-through repository for each upstream path. For
the Docker Hub upstream `https://registry-1.docker.io`, the checked-in mapping
in `packaging/images.json` expects:

- `library/ubuntu` -> `dockerhub-ubuntu`
- `nvidia/cuda` -> `dockerhub-nvidia-cuda`
- `rocm/dev-ubuntu-24.04` -> `dockerhub-rocm-dev-ubuntu-24-04`
- `library/archlinux` -> `dockerhub-archlinux`
- `library/alpine` -> `dockerhub-alpine` (reserved for the disabled Alpine row)

After every enabled mapping meets the threshold, set
`DEPOT_REGISTRY_HOST` to the organization host ending in
`.registry.depot.dev`, then set `DEPOT_REGISTRY_CACHE_ENABLED=true`. The reusable
row workflow selects mirrors only for exact `main` executions of the canonical
release caller and routes those jobs to Depot Actions runners. Depot
pre-authenticates each runner to pull organization Registry images with a
short-lived job credential; no long-lived registry secret is required. The
workflow verifies the injected Depot organization identity, resolves public
references first, retains their exact digest in the Depot reference, and
verifies the mirrored manifest before building.

This cache can reduce cold base pulls and public-registry rate-limit delays. It
does not accelerate apt, Cargo, pnpm/npm, native compilation, or Docker layer
export. Keep the existing BuildKit and package-manager caches as the primary
optimizations. To roll back immediately, set
`DEPOT_REGISTRY_CACHE_ENABLED=false`; the workflow returns to the original
public references without changing the matrix.

The first valid cohorts ran on 2026-08-02. All samples resolved to their exact
input digest, but no enabled mapping met the adoption gate:

| Base | Run | Upstream median | Depot median | Result |
| --- | --- | ---: | ---: | --- |
| Ubuntu 24.04 | [30776128516](https://github.com/Mesh-LLM/mesh-llm/actions/runs/30776128516) | 1.452s | 1.363s | Fail; 89ms (6.1%) faster |
| CUDA 12.9.2 | [30776197769](https://github.com/Mesh-LLM/mesh-llm/actions/runs/30776197769) | 38.661s | 79.495s | Fail; 40.834s slower |
| CUDA 13.1.2 | [30776298367](https://github.com/Mesh-LLM/mesh-llm/actions/runs/30776298367) | 21.537s | 43.256s | Fail; 21.719s slower |
| ROCm 7.0 | [30776371194](https://github.com/Mesh-LLM/mesh-llm/actions/runs/30776371194) | 27.349s | 45.253s | Fail; 17.904s slower |
| Arch `base-devel` | [30776449087](https://github.com/Mesh-LLM/mesh-llm/actions/runs/30776449087) | 7.691s | 13.071s | Fail; 5.380s slower |
| Arch `base` | [30776499761](https://github.com/Mesh-LLM/mesh-llm/actions/runs/30776499761) | 4.637s | 6.440s | Fail; 1.803s slower |

`DEPOT_REGISTRY_CACHE_ENABLED` therefore remains `false`. Alpine was not
measured because its release and matrix rows are both disabled.
