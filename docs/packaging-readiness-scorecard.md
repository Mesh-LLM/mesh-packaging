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

Current overall readiness: **70 / 100**

This is a control-plane score, not a product-quality score for upstream
`mesh-llm`. The repo now has a coherent package-first image path, GitHub-hosted
CI runners, matrix validation, Homebrew staging, release asset scaffolding,
split publish toggles, Linux package install QA, dry-run image smoke tests, and
recorded GitHub evidence for the Ubuntu CPU package-to-image lane, and green
Homebrew tarball/formula staging and install validation. The score is held down
by missing full default-row evidence, upstream release-archive consumption, real
package-manager repository dry-runs, signing, and incomplete GPU/runtime smoke
tests.

| Aspect | Score | Benchmark | Status | Evidence | Main gap |
| --- | ---: | ---: | --- | --- | --- |
| Runtime ownership boundary | 84 | 90 | On track | Docs and package builders keep native runtime archives, `native-runtimes.json`, and runtime cache contents upstream-owned; Linux package QA now verifies the installed `mesh-llm` command surface. | More runtime-command smoke is still needed for GPU rows and Homebrew installs. |
| Matrix and release-lane modeling | 80 | 85 | On track | `packaging/images.json` validates 18 rows, exposes `release_track`, and separates upstream-mirrored CUDA/ROCm lanes from downstream extensions. | Vulkan, Alpine GPU, Windows, and full default-row CI evidence remain incomplete. |
| CI runner and orchestration safety | 84 | 85 | On track | GitHub run `27774625573` passed precheck; dry-run `27774625556` proved GitHub-hosted Ubuntu CPU binary, package, runtime-image, macOS binary, and Homebrew validation lanes. | Full default-row CI evidence remains incomplete. |
| Publish dry-run controls | 88 | 95 | Improving | `images-release.yml` has `dry_run`, `publish_images`, `publish_release_assets`, and `publish_homebrew_assets`; dry-run forces all publish toggles off, and run `27774625556` skipped GitHub Release creation, release-asset promotion, GHCR login, image attestations, and release upload surfaces observed so far. | The new dry-run safety report job still needs a green GitHub run, and package-source repository dry-runs are intentionally absent until signing exists. |
| Linux native packages | 70 | 85 | Partial | `.deb`, `.apk`, and `.pkg.tar.zst` builders exist; Ubuntu CPU run `27774625556` built and installed the native package before assembling the runtime image. | Packages are still built from local source-build binary artifacts, not upstream release archives; GPU dependency modeling and all-format install evidence are incomplete. |
| Docker and GHCR images | 72 | 85 | Partial | Runtime images install native package artifacts; Ubuntu CPU dry-run `27774625556` built the package-backed image and recorded the digest without logging in to GHCR. | Full-row image smoke tests and one safe non-production GHCR push remain missing. |
| Homebrew and macOS | 72 | 85 | Partial | Run `27774625556` passed macOS llama ABI builds, macOS arm64/amd64 binaries, Homebrew tarball/formula staging, strict formula audit, and local formula install/smoke tests on arm64 and Intel macOS runners. | No tap process, bottle flow, signing/notarization decision, or upstream macOS release-archive consumption exists. |
| Upstream release-archive consumption | 45 | 90 | Blocking | Source-build paths now follow upstream UI build/profile/version/dynamic-runtime defaults more closely. | Official package-manager outputs still do not consume upstream release archives by default. |
| Provenance, SBOM, and attestations | 72 | 90 | Partial | Binary/package SBOMs are generated; attestations are wired behind publish toggles; image digest attestations are wired for pushed images. | Release-asset verifier and upstream executable attestation preservation are missing. |
| Package-source publication and signing | 34 | 90 | Blocking | Policy blocks apt/apk/pacman repository publication until signing is ready, and dry-run workflow controls prevent accidental GitHub Release/Homebrew/OCI publication. | No package repositories, signing keys, trust-root docs, key rotation, or repository dry-run publication verifier exist. |
| Runtime and image smoke testing | 62 | 85 | Blocking | Native package QA installs packages and checks `mesh-llm --help`; loaded Linux AMD64 runtime images are smoke-tested in dry runs; Homebrew install smoke passed on both macOS architectures in run `27774625556`. | GPU device/runtime checks, non-AMD64 image smoke, and a fresh run proving the new Linux loaded-image smoke step remain incomplete. |
| Documentation and release operator guidance | 80 | 85 | Improving | Gap analysis, matrix docs, publishing policy, release checklist, package signing policy, runbooks, and this evidence scorecard are present and tied to current GitHub run IDs. | Docs need generated readiness manifests and the full default-row release record. |

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

1. Prove the new `mesh-llm-dry-run-safety-<version>` artifact and loaded-image
   smoke test in a fresh GitHub dry-run.
2. Decide the safe GHCR test target/tag strategy and run one Docker publish test.
3. Convert the Ubuntu CPU package path to consume the upstream release archive
   or a documented upstream release-script equivalent.
4. Add or dispatch full default-row dry-runs for the remaining enabled package
   formats and backends.
5. Re-score after each green run and commit the evidence update.
