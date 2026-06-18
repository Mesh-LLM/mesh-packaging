# Packaging readiness scorecard

Audit date: 2026-06-18

This scorecard turns the readiness gaps in
`docs/packaging-readiness-gaps.md` into an explicit release benchmark. Scores
are evidence-weighted, not effort-weighted: a surface only scores highly after
the relevant package, image, or publication path has been proven on the runner
and destination that would be used for release.

## Benchmark

The packaging program is ready for a public non-prerelease distribution only
when it reaches:

- Overall readiness: **85 / 100**
- No release-blocking aspect below **80 / 100**
- Publish-safety controls at **95 / 100** or higher
- A recorded green GitHub Actions run for every enabled default release row
- No formal package-source publication until the matching dry-run verifier
  exists for that package manager destination

Docker/GHCR is the exception: image publication can be tested on GitHub after
the run is limited to an explicit test image/tag or an otherwise approved
non-production publication target.

## Current score

Current overall readiness: **62 / 100**

This is a control-plane score, not a product-quality score for upstream
`mesh-llm`. The repo now has a coherent package-first image path, GitHub-hosted
CI runners, matrix validation, Homebrew staging, release asset scaffolding, and
split publish toggles. The score is held down by missing full-run evidence,
upstream release-archive consumption, real package-manager repository dry-runs,
signing, and runtime/image smoke tests.

| Aspect | Score | Benchmark | Status | Evidence | Main gap |
| --- | ---: | ---: | --- | --- | --- |
| Runtime ownership boundary | 82 | 90 | On track | Docs and package builders keep native runtime archives, `native-runtimes.json`, and runtime cache contents upstream-owned. | One end-to-end dry-run still needs to prove package outputs exclude upstream runtime assets while the runtime command surface remains usable. |
| Matrix and release-lane modeling | 78 | 85 | On track | `packaging/images.json` validates 18 rows, exposes `release_track`, and separates upstream-mirrored CUDA/ROCm lanes from downstream extensions. | Vulkan, Alpine GPU, Windows, and full default-row CI evidence remain incomplete. |
| CI runner and orchestration safety | 76 | 85 | Improving | Workflows use GitHub-hosted runners for CI/release lanes and retain Carrack only as a trusted manual AMD64 probe. | GitHub Actions dry-runs have not yet been recorded for the current HEAD. |
| Publish dry-run controls | 80 | 95 | Improving | `images-release.yml` has `dry_run`, `publish_images`, `publish_release_assets`, and `publish_homebrew_assets`; dry-run forces all publish toggles off. | Needs remote workflow proof that no release, attestation, GHCR, or Homebrew upload jobs run in dry-run mode. |
| Linux native packages | 62 | 85 | Partial | `.deb`, `.apk`, and `.pkg.tar.zst` builders exist and runtime images install matching package artifacts. | Packages are still built from local source-build binary artifacts, not upstream release archives; direct install QA and GPU dependency modeling are incomplete. |
| Docker and GHCR images | 64 | 85 | Partial | Runtime images install native package artifacts and publication can produce digests, SBOMs, and attestations when enabled. | Final image smoke tests and full-row GHCR evidence are missing; test publication needs a safe test target/tag plan before pushing. |
| Homebrew and macOS | 56 | 85 | Partial | MacOS lanes, tarball staging, formula rendering, and Homebrew helper tests exist. | No tap process, bottle flow, signing/notarization decision, or upstream macOS release-archive consumption. |
| Upstream release-archive consumption | 45 | 90 | Blocking | Source-build paths now follow upstream UI build/profile/version/dynamic-runtime defaults more closely. | Official package-manager outputs still do not consume upstream release archives by default. |
| Provenance, SBOM, and attestations | 70 | 90 | Partial | Binary/package SBOMs and attestations are wired; image digest attestations are wired for pushed images. | Release-asset verifier and upstream executable attestation preservation are missing. |
| Package-source publication and signing | 32 | 90 | Blocking | Policy blocks apt/apk/pacman repository publication until signing is ready. | No package repositories, signing keys, trust-root docs, key rotation, or dry-run publication verifier exist. |
| Runtime and image smoke testing | 44 | 85 | Blocking | Native package QA checks metadata and expected filenames; macOS binary jobs run `--help`. | Linux package installs, image `mesh-llm --help`, runtime command smoke, and GPU device/runtime checks are not complete. |
| Documentation and release operator guidance | 74 | 85 | Improving | Gap analysis, matrix docs, publishing policy, release checklist, package signing policy, and runbooks exist. | Docs need to stay tied to actual GitHub run IDs and generated readiness manifests. |

## Release-blocking requirements

These must be true before claiming the benchmark is met:

- Every default matrix row has a green GitHub Actions dry-run on the candidate
  branch or release commit.
- Dry-run mode proves `ensure-github-release`, `publish-release-assets`,
  `publish-homebrew-release`, registry login, image push, release upload, and
  attestation-publish steps are skipped unless their explicit publish toggle is
  enabled.
- Official native package and Homebrew outputs consume upstream release archives
  or a documented upstream release-script equivalent.
- Linux package QA installs each package format in a clean target environment
  and verifies `mesh-llm --version` plus the runtime command surface.
- Runtime images are smoke-tested after package installation.
- Package-source publication remains disabled until signing, key publication,
  key rotation, and repository dry-run verification are implemented.
- Any Docker/GHCR publication test uses an explicit non-production target or
  tag strategy and records the image digest/SBOM/attestation evidence.

## Immediate improvement path

1. Run the current branch through `images-precheck.yml` on GitHub and record the
   run ID.
2. Run a filtered `images-release.yml` dry-run for `ubuntu-cpu` `amd64` with all
   publish toggles false and record the skipped publish jobs.
3. Add image/package smoke tests for the Linux CPU row, then repeat the dry-run.
4. Decide the safe GHCR test target/tag strategy and run one Docker publish test.
5. Convert the Ubuntu CPU package path to consume the upstream release archive
   or a documented upstream release-script equivalent.
6. Re-score after each green run and commit the evidence update.
