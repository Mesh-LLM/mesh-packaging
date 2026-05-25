# Release checklist

Use this checklist before turning a dry-run matrix into a publishing release.

## Source and matrix

- Confirm the `repository_dispatch` payload references the canonical
  `Mesh-LLM/mesh-llm` repository and a release tag.
- Verify `scripts/image-matrix.ts github-matrix` resolves the release ref to one
  immutable `mesh_source_sha`.
- Review the emitted rows for distro, backend, backend version, architecture,
  runner label, package format, and tag correctness.
- Run a filtered dry run for changed or risky rows before a full release.

## Build validation

- Build UI once and verify it is restored by every binary job.
- Build llama.cpp ABI artifacts for each enabled distro/backend/platform row.
- Build row-specific binaries from restored UI and llama artifacts.
- Build native packages from the produced binary artifacts only.
- Build runtime images by installing the matching native package artifact.

## Package and provenance validation

- Confirm native package QA passes exact filename validation and the
  format-specific checks:
  - `.deb`: `dpkg-deb --info`, optional `lintian`, install smoke test.
  - `.apk`: `apk manifest`, `apk verify`, install smoke test.
  - `.pkg.tar.zst`: `pacman -Qip`, `pacman -Qlp`, install smoke test.
- Confirm binaries and packages include `SHA256SUMS`, compatibility `.sha256`
  files, and SPDX JSON SBOMs.
- Confirm GitHub artifact attestations exist for binaries and native packages.
- Confirm pushed image digests are recorded, SBOMs are generated, and registry
  attestations exist for pushed images.
- Confirm the `ensure-github-release` job created or reused the matching release
  tag in this repository and that the release notes record the upstream
  `mesh_source_sha`.
- For public package distribution, confirm the `publish-release-assets` job
  promoted native packages, checksums, SBOMs, image digest records, and
  attestation reference files from short-lived Actions artifacts to durable
  GitHub Release assets.
- If publishing apt/apk/pacman repositories, confirm `docs/package-signing.md`
  has a completed dry run for the format-specific signing flow, trust-root
  documentation, and key-rotation runbook. Do not publish unsigned native
  package repositories.

## GPU-specific gates

- CUDA rows: confirm toolkit version, host driver compatibility, target SM list,
  and real GPU runner availability.
- ROCm rows: confirm ROCm version, host driver stack, target gfx list, and real
  GPU runner availability.
- Vulkan rows: confirm `glslc` availability, Vulkan loader/runtime packages, and
  host ICD/driver support.
- Arch rolling rows: confirm `cuda` and `rocm-core` package versions still match
  row labels before release.

## Rollback plan

- Record the exact release tag, `mesh_source_sha`, matrix artifact ids, package
  artifact names, and image digests for the release.
- If a row fails after publishing, stop promotion of that row, preserve logs and
  artifacts, and publish a corrected row under the same explicit versioned tag
  only after rebuilding from the same source SHA or a new upstream release tag.
- Do not retag GPU images silently. Prefer explicit versioned replacement notes
  in the release record.
