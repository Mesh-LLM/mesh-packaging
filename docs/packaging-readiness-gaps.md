# Remaining readiness work

The repository implementation is archive-first: it verifies already-built upstream release assets, packages them, and installs those packages into images. The former source/UI/llama compilation path and non-GitHub runner dependencies have been removed.

## Repository-complete work

- [x] Define current upstream archive-to-channel matrix. QA: schema validation emits 11 active Linux rows from 8 unique archives and one arm64 Homebrew plan.
- [x] Verify digest, exact sidecar filename, safe tar entries, expected bundle layout, extraction, and provenance. QA: `tests/upstream-archive.test.ts`.
- [x] Enforce package-first OCI construction with no direct runtime binary path. QA: Dockerfile target checks plus runtime workflow smoke.
- [x] Make dry-run execute all validation while forcibly skipping publication. QA: workflow policy and final readiness job.
- [x] Remove Blacksmith/self-hosted orchestration. QA: precheck scans workflow/Docker paths for legacy runner/source-build strings.
- [x] Correct channel claims: block Alpine/musl and Intel macOS; enable upstream Linux Vulkan and arm64 CUDA 13. QA: matrix tests.
- [x] Make GPU package and image QA accurate on GitHub-hosted runners. QA: CUDA package startup uses the vendor SDK driver stub, final CUDA images report only `libcuda.so.1` as host-injected, the lean ROCm 7.0 image stays within hosted disk, and full dry run [29455769787](https://github.com/Mesh-LLM/mesh-agent-images/actions/runs/29455769787) succeeds.

## Operational work outside this checkout

- [ ] Provision an upstream fine-grained dispatch credential or GitHub App. QA: a published upstream release creates one receiver run without a personal broad-scope token.
- [x] Run and observe a full v0.73.1 dry run from this branch. QA: [run 29455769787](https://github.com/Mesh-LLM/mesh-agent-images/actions/runs/29455769787) completed all 35 jobs in 9m57s with the readiness manifest successful and both publish jobs skipped.
- [x] Restrict the `release` environment to deployments from `main`. QA: GitHub environment branch policy reports only `main`.
- [ ] Add required reviewers to the `release` environment when the repository plan supports it. QA: a non-dry publish rehearsal pauses for approval before any write-capable job.
- [ ] Decide whether GHCR ownership stays here or upstream's existing Docker workflow is retired/redirected. QA: one documented canonical producer per public tag namespace.
- [ ] Create package repositories or a Homebrew tap only after signing/trust ownership exists. QA: format-specific signing dry run and documented key rotation.
