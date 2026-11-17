# CI timing history

786 recorded attempts. 4643 separate job cohorts. 23 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Plan Windows | github-hosted | execution | 12s | 22s | 83.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Quality / CI / Quality | github-hosted | execution | 10s | 15s | 50.0% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 11s | 102s | 827.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Plan Linux | github-hosted | execution | 14s | 23s | 64.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | execution | 9s | 13s | 47.1% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Model download smoke / HuggingFace download smoke | github-hosted | execution | 140s | 177s | 26.4% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 565s | 1296s | 129.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 2s | 1453s | 72525.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 10s | 66.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 248s | 50.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Select platform-check runner | github-hosted | execution | 7s | 9s | 21.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 160s | 241s | 50.6% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 23s | 32s | 39.1% | 6 / 6 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 1054s | 1513s | 43.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 940s | 1328s | 41.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · macOS | [43645229811/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43645229811/attempts/1) | success | 39s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [43645229830/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43645229830/attempts/1) | success | 1239s | 1224s | unknown | 695294 |
| Mesh-LLM/mesh-llm / PR · Linux | [43645229992/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43645229992/attempts/1) | success | 1517s | 4857s | unknown | 598640592 |
| Mesh-LLM/mesh-llm / PR · Windows | [43680417966/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43680417966/attempts/1) | success | 43s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43680417985/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43680417985/attempts/1) | success | 37s | 33s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43680418023/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43680418023/attempts/1) | failure | 559s | 1421s | unknown | 542531 |
| Mesh-LLM/mesh-llm / PR · Linux | [43680418149/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43680418149/attempts/1) | cancelled | 279s | 276s | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [43805057516/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/43805057516/attempts/1) | failure | 348s | 4747s | unknown | 1444285 |
| Mesh-LLM/mesh-packaging / Packaging · mesh-43780544230-recovery-20261116 | [43814937562/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43814937562/attempts/1) | success | 1350s | 5469s | unknown | 13567611147 |
| Mesh-LLM/mesh-llm / PR · Windows | [43815021706/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021706/attempts/1) | cancelled | 1712s | 4708s | unknown | 832613556 |
| Mesh-LLM/mesh-llm / PR · Quality | [43815021724/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021724/attempts/1) | cancelled | 309s | unknown | unknown | 541303 |
| Mesh-LLM/mesh-llm / PR · macOS | [43815021819/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021819/attempts/1) | cancelled | 1720s | 5731s | unknown | 65430569 |
| Mesh-LLM/mesh-llm / PR · Linux | [43815021885/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021885/attempts/1) | cancelled | 1702s | unknown | unknown | 487700048 |
| Mesh-LLM/mesh-llm / PR · Quality | [43815563375/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815563375/attempts/1) | failure | 837s | 1527s | unknown | 541697 |
| Mesh-LLM/mesh-llm / PR · Quality | [43817331824/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817331824/attempts/1) | failure | 41s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43817331851/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817331851/attempts/1) | failure | 35s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [43817331878/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817331878/attempts/1) | failure | 45s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [43817332025/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817332025/attempts/1) | failure | 45s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43818233813/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43818233813/attempts/1) | cancelled | 147s | 283s | unknown | 541303 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [43946622437/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43946622437/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / Main · Linux | [44025943830/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44025943830/attempts/1) | success | 2541s | 11703s | unknown | 2261584664 |
| Mesh-LLM/mesh-llm / PR · Quality | [44026599064/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599064/attempts/1) | cancelled | 287s | unknown | unknown | 541281 |
| Mesh-LLM/mesh-llm / PR · macOS | [44026599089/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599089/attempts/1) | success | 2339s | 6962s | unknown | 391807529 |
| Mesh-LLM/mesh-llm / PR · Windows | [44026599162/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599162/attempts/1) | cancelled | 2625s | unknown | unknown | 84932737 |
| Mesh-LLM/mesh-llm / PR · Linux | [44026599438/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599438/attempts/1) | cancelled | 2610s | unknown | unknown | 1531341753 |
| Mesh-LLM/mesh-llm / PR · Quality | [44027115785/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44027115785/attempts/1) | cancelled | 2339s | 3769s | unknown | 542519 |
| Mesh-LLM/mesh-llm / PR · Quality | [44028715981/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028715981/attempts/1) | failure | 49s | 44s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44028716065/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028716065/attempts/1) | failure | 45s | 40s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [44028716230/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028716230/attempts/1) | failure | 53s | 48s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [44028716297/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028716297/attempts/1) | failure | 35s | 30s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 43562417414/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43562417414/attempts/1): cancelled.
  - Linux / Rust tests / Rust tests (batch-3): Run isolated Cargo tests for the batch.
  - Linux / Linux cpu product smoke / KV caching smoke (dense + recurrent) / Scripted Binary Smoke: Run scripted smoke.
- [Mesh-LLM/mesh-llm 43562635204/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43562635204/attempts/1): failure.
  - macOS / Swift SDK input / Swift SDK input (host-only): Verify committed Swift binding source is current.
  - macOS / CI / macOS: Enforce macOS result.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 43562635222/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43562635222/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43562635327/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43562635327/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43562635442/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43562635442/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43562648170/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43562648170/attempts/1): failure.
  - Quality / Quality / CI contracts: Test CI, packaging, and SDK contracts.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 43565919414/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43565919414/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43640488709/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43640488709/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43680418023/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43680418023/attempts/1): failure.
  - Quality / Candidate source consistency: Check CI crate-list drift.
  - Quality / Quality / CI contracts: Test CI, packaging, and SDK contracts.
  - Quality / Quality / Rust Clippy (batch-1): Run one Clippy invocation for the batch.
  - Quality / Quality / Rust Clippy (batch-0): Run one Clippy invocation for the batch.
  - Quality / Quality / Rust Clippy (batch-2): Run one Clippy invocation for the batch.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 43680418149/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43680418149/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 43805057516/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/43805057516/attempts/1): failure.
  - Stage public vulkan / Assemble public vulkan index: Attest verified family candidate digest.
  - Stage self-hosted rocm70 / Assemble self-hosted rocm70 index: Attest verified family candidate digest.
- [Mesh-LLM/mesh-llm 43815021706/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021706/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43815021724/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021724/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43815021819/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021819/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43815021885/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815021885/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43815563375/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43815563375/attempts/1): failure.
  - Quality / Quality / CI contracts: Test CI, packaging, and SDK contracts.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 43817331824/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817331824/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 43817331851/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817331851/attempts/1): failure.
  - Plan macOS: Build canonical plan.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 43817331878/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817331878/attempts/1): failure.
  - Plan Windows: Build canonical plan.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 43817332025/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43817332025/attempts/1): failure.
  - Plan Linux: Build canonical plan.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 43818233813/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43818233813/attempts/1): cancelled.
- [Mesh-LLM/mesh-packaging 43946622437/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43946622437/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44026599064/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599064/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44026599162/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599162/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44026599438/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44026599438/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44027115785/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44027115785/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44028715981/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028715981/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 44028716065/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028716065/attempts/1): failure.
  - Plan macOS: Build canonical plan.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 44028716230/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028716230/attempts/1): failure.
  - Plan Windows: Build canonical plan.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 44028716297/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44028716297/attempts/1): failure.
  - Plan Linux: Build canonical plan.
  - PR / Linux: Enforce Linux result.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
