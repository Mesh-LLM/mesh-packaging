# CI timing history

495 recorded attempts. 2799 separate job cohorts. 17 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Quality / Quality / Select quality runner | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 11s | 102s | 827.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 565s | 1296s | 129.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 2s | 1467s | 73250.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 10s | 66.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 246s | 48.8% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 160s | 241s | 50.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 21.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 954s | 1336s | 40.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 936s | 1286s | 37.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [39577681101/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39577681101/attempts/1) | cancelled | 1s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39577681249/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39577681249/attempts/1) | success | 42s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39577681321/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39577681321/attempts/1) | success | 610s | 604s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39577681390/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39577681390/attempts/1) | success | 49s | 42s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39577688940/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39577688940/attempts/1) | success | 40s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39579090906/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579090906/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39579091061/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579091061/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39579091208/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579091208/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39579091235/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579091235/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39579340469/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579340469/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39764788245/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39764788245/attempts/1) | success | 43s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39764788312/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39764788312/attempts/1) | success | 2515s | 2499s | unknown | 14405802 |
| Mesh-LLM/mesh-llm / PR · Linux | [39764788559/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39764788559/attempts/1) | success | 2412s | 4222s | unknown | 599073980 |
| Mesh-LLM/mesh-llm / PR · Quality | [39765179774/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39765179774/attempts/1) | success | 2646s | 3577s | unknown | 10867057 |
| Mesh-LLM/mesh-llm / PR · Quality | [39767002828/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002828/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39767002880/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002880/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39767002909/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002909/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39767002949/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002949/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39767224627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767224627/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39769419130/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39769419130/attempts/1) | success | 2455s | 2733s | unknown | 10866656 |
| Mesh-LLM/mesh-llm / PR · macOS | [39943813595/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943813595/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39943813634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943813634/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39943887254/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887254/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39943887335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887335/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39943887396/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887396/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39943887408/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887408/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39943895866/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943895866/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39943895979/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943895979/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39943896111/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943896111/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39943896166/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943896166/attempts/1) | action_required | unknown | unknown | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 39389357684/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39389357684/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39389357908/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39389357908/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39389357959/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39389357959/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39389484860/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39389484860/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Test CI, packaging, and SDK contracts.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 39414109461/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39414109461/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 39414109515/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39414109515/attempts/1): failure.
  - Plan macOS: Build canonical plan.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 39414109581/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39414109581/attempts/1): failure.
  - Plan Windows: Build canonical plan.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 39414109653/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39414109653/attempts/1): failure.
  - Plan Linux: Build canonical plan.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 39414323119/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39414323119/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39577681101/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39577681101/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39579090906/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579090906/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39579091061/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579091061/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39579091208/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579091208/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39579091235/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579091235/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39579340469/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39579340469/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39767002828/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002828/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39767002880/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002880/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39767002909/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002909/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39767002949/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767002949/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39767224627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767224627/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943813595/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943813595/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943813634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943813634/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887254/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887254/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887335/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887396/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887396/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887408/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887408/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943895866/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943895866/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943895979/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943895979/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943896111/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943896111/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943896166/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943896166/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
