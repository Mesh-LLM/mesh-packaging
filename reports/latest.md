# CI timing history

633 recorded attempts. 3615 separate job cohorts. 22 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Quality / CI / Quality | github-hosted | execution | 11s | 14s | 28.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 11s | 102s | 827.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | execution | 9s | 13s | 47.1% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Model download smoke / HuggingFace download smoke | github-hosted | execution | 140s | 177s | 26.4% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 565s | 1296s | 129.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 2s | 1453s | 72525.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 10s | 66.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 248s | 50.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Select platform-check runner | github-hosted | execution | 7s | 9s | 21.4% | 6 / 6 |
| Mesh-LLM/mesh-llm-runner-images / Workflow and candidate policy | github-hosted | execution | 40s | 56s | 40.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 160s | 241s | 50.6% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 22s | 31s | 40.9% | 5 / 5 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 1054s | 1513s | 43.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 963s | 1447s | 50.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [41348004448/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41348004448/attempts/1) | success | 134s | 132s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [41350422401/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41350422401/attempts/1) | success | 147s | 145s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [41351467704/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41351467704/attempts/1) | success | 142s | 140s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [41351796526/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41351796526/attempts/1) | success | 154s | 151s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [41352136143/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41352136143/attempts/1) | success | 149s | 146s | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41446571963/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41446571963/attempts/1) | success | 1119s | 10905s | unknown | 1315950 |
| Mesh-LLM/mesh-llm / PR · macOS | [41473137409/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41473137409/attempts/1) | success | 32s | 26s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41476557704/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41476557704/attempts/1) | success | 887s | 806s | unknown | 14828032 |
| Mesh-LLM/mesh-llm / PR · Quality | [41476557736/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41476557736/attempts/1) | cancelled | 236s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41476557846/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41476557846/attempts/1) | success | 36s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41478876944/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478876944/attempts/1) | cancelled | 38s | 33s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41478877187/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478877187/attempts/1) | success | 43s | 34s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41478887821/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478887821/attempts/1) | success | 63s | 29s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41478888167/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478888167/attempts/1) | success | 59s | 33s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41478889450/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478889450/attempts/1) | cancelled | 51s | 26s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41478967773/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478967773/attempts/1) | success | 70s | 33s | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41540639852/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41540639852/attempts/1) | success | 423s | 5532s | unknown | 890386 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41541864277/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41541864277/attempts/1) | failure | 718s | 6900s | unknown | 1483258 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41541864277/2](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41541864277/attempts/2) | failure | 18s | 13s | 1742s | 1483258 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41541864277/3](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41541864277/attempts/3) | success | 652s | 5846s | 266s | 1483258 |
| Mesh-LLM/mesh-llm / PR · Quality | [41598833602/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41598833602/attempts/1) | failure | 6944s | 1790s | unknown | 11192011 |
| Mesh-LLM/mesh-llm / PR · Quality | [41602059625/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41602059625/attempts/1) | failure | 2300s | 23s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41614397782/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614397782/attempts/1) | cancelled | 2696s | unknown | unknown | 847925730 |
| Mesh-LLM/mesh-llm / PR · macOS | [41614397975/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614397975/attempts/1) | cancelled | 2614s | unknown | unknown | 55356828 |
| Mesh-LLM/mesh-llm / PR · Quality | [41614397984/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614397984/attempts/1) | failure | 2582s | 2894s | unknown | 11192010 |
| Mesh-LLM/mesh-llm / PR · Linux | [41614398004/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614398004/attempts/1) | cancelled | 2647s | unknown | unknown | 320258626 |
| Mesh-LLM/mesh-llm / PR · Quality | [41619588497/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588497/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41619588554/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588554/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [41619588581/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588581/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41619588718/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588718/attempts/1) | action_required | unknown | unknown | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm-runner-images 41120362847/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41120362847/attempts/1): failure.
  - Validate public cpu / public cpu amd64: Build platform image once.
  - Validate public rocm72 / public rocm72 amd64: Build platform image once.
  - Validate self-hosted cpu / self-hosted cpu arm64: Build platform image once.
  - Validate public cuda13 / public cuda13 amd64: Build platform image once.
  - Validate public web / public web amd64: Build platform image once.
  - Validate self-hosted cuda12 / self-hosted cuda12 amd64: Build platform image once.
  - Validate self-hosted cuda12 / self-hosted cuda12 arm64: Build platform image once.
  - Validate public rocm70 / public rocm70 amd64: Build platform image once.
  - Validate self-hosted vulkan / self-hosted vulkan amd64: Build platform image once.
  - Validate self-hosted cuda13 / self-hosted cuda13 arm64: Build platform image once.
  - Validate self-hosted cuda13 / self-hosted cuda13 amd64: Build platform image once.
  - Validate public cuda13 / public cuda13 arm64: Build platform image once.
  - Validate self-hosted rocm70 / self-hosted rocm70 amd64: Build platform image once.
  - Validate self-hosted cpu / self-hosted cpu amd64: Build platform image once.
  - Validate self-hosted rocm72 / self-hosted rocm72 amd64: Build platform image once.
  - Validate public ui / public ui amd64: Build platform image once.
  - Validate public cuda12 / public cuda12 amd64: Build platform image once.
  - Validate self-hosted vulkan / self-hosted vulkan arm64: Build platform image once.
  - Validate public vulkan / public vulkan amd64: Build platform image once.
  - Validate public cpu / public cpu arm64: Build platform image once.
  - Validate public vulkan / public vulkan arm64: Build platform image once.
  - Validate public cuda12 / public cuda12 arm64: Build platform image once.
  - Validate public browser / public browser amd64: Build platform image once.
- [Mesh-LLM/mesh-llm-runner-images 41123271184/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/1): failure.
  - Validate self-hosted cpu / self-hosted cpu arm64: Download manifest bundles.
  - Validate self-hosted cpu / self-hosted cpu amd64: Download manifest bundles.
  - Validate self-hosted cuda13 / self-hosted cuda13 amd64: Download manifest bundles.
  - Validate public ui / public ui amd64: Download manifest bundles.
  - Validate self-hosted rocm70 / self-hosted rocm70 amd64: Download manifest bundles.
- [Mesh-LLM/mesh-llm-runner-images 41123271184/2](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/2): cancelled.
  - Validate self-hosted rocm70 / self-hosted rocm70 amd64: Download manifest bundles.
- [Mesh-LLM/mesh-llm 41202703393/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703393/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703398/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703398/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703453/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703453/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703552/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703552/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703559/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703559/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703606/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703606/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703627/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703631/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703631/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41302882532/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41302882532/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41304966188/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41304966188/attempts/1): failure.
  - Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests: Dense OpenAI client compatibility smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - Main / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 41311215061/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41311215061/attempts/1): cancelled.
- [Mesh-LLM/mesh-packaging 41339711692/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41339711692/attempts/1): failure.
  - Verify Homebrew formula from upstream macOS archive: Download, verify, and render formula.
  - Assemble and install-test Node SDK npm package: Test, pack, install, and dry-run publish.
  - Packaging readiness manifest: Enforce packaging readiness.
- [Mesh-LLM/mesh-llm 41476557736/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41476557736/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41478876944/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478876944/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41478889450/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41478889450/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 41541864277/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41541864277/attempts/1): failure.
  - Stage public web / public web amd64: Log in to GHCR for candidate staging.
- [Mesh-LLM/mesh-llm-runner-images 41541864277/2](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41541864277/attempts/2): failure.
  - Stage public web / public web amd64: Download manifest bundles.
- [Mesh-LLM/mesh-llm 41598833602/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41598833602/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Test CI, packaging, and SDK contracts.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41602059625/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41602059625/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41614397782/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614397782/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41614397975/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614397975/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41614397984/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614397984/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Check CI crate-list drift.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41614398004/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41614398004/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41619588497/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588497/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41619588554/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588554/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41619588581/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588581/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41619588718/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41619588718/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
