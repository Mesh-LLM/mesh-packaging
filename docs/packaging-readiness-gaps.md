# Remaining readiness work

The repository implementation is archive-first: it verifies already-built upstream release assets, packages them, and installs those packages into images. The former source/UI/llama compilation path and non-GitHub runner dependencies have been removed.

## Repository-complete work

- [x] Define current upstream archive-to-channel matrix. QA: schema validation emits 11 active Linux rows from 8 unique archives and one arm64 Homebrew plan.
- [x] Verify digest, exact sidecar filename, safe tar entries, expected bundle layout, extraction, and provenance. QA: `tests/upstream-archive.test.ts`.
- [x] Enforce package-first OCI construction with no direct runtime binary path. QA: Dockerfile target checks plus runtime workflow smoke.
- [x] Make dry-run execute all validation while forcibly skipping publication. QA: workflow policy and final readiness job.
- [x] Remove Blacksmith/self-hosted orchestration. QA: precheck scans workflow/Docker paths for legacy runner/source-build strings.
- [x] Correct channel claims: block Alpine/musl and Intel macOS; enable upstream Linux Vulkan and arm64 CUDA 13. QA: matrix tests.
- [ ] Re-certify GPU package and image QA against product-v2 bundles. QA:
  backend-neutral hosts pass `--version`, `--help`, and `runtime list` without
  devices or driver stubs; packages own versioned runtime trees; a new full dry
  run succeeds. The earlier static-host baseline is preserved in
  [run 29455769787](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/29455769787)
  for historical comparison only.

## Operational work outside this checkout

- [ ] Provision an upstream fine-grained dispatch credential or GitHub App with Contents write access to this repository. QA: a published upstream release creates one receiver run without a personal broad-scope token.
- [x] Run and observe a full v0.73.1 dry run from this branch. QA: [run 29455769787](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/29455769787) completed all 35 jobs in 9m57s with the readiness manifest successful and both publish jobs skipped.
- [x] Exercise the production `repository_dispatch` ingress against merged `main` with publication disabled. QA: [run 29512465086](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/29512465086) completed all 35 jobs successfully in 11m07s; the readiness manifest succeeded and both publish jobs were skipped.
- [x] Restrict the `release` environment to deployments from `main`. QA: GitHub environment branch policy reports only `main`.
- [ ] Add required reviewers to the `release` environment when the repository plan supports it. QA: a non-dry publish rehearsal pauses for approval before any write-capable job.
- [x] Make this repository the canonical GHCR producer and retire upstream tag publication. QA: `mesh-llm` keeps only manual non-publishing client-image validation and its successful full release dispatches this repository.
- [x] Grant this repository's Actions identity write access to the existing `ghcr.io/mesh-llm/mesh-llm` package, which is linked to `Mesh-LLM/mesh-llm`. QA: production [run 29852728714](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/29852728714) pushes the versioned matrix tags with `GITHUB_TOKEN` from `Mesh-LLM/mesh-packaging`.
- [x] Select public visibility for the GHCR package. QA: anonymous manifest inspection succeeds for every published image variant from production [run 29852728714](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/29852728714).
- [x] Create the canonical Homebrew tap with defined ownership and a
  secretless polling update workflow. QA: `Mesh-LLM/homebrew-tap` strictly
  audits, installs, and tests each package-release formula before committing it.
- [ ] Create native Linux package repositories only after signing/trust
  ownership exists. QA: format-specific signing dry run and documented key
  rotation.
