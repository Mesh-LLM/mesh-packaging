# CI timing history

823 recorded attempts. 4983 separate job cohorts. 23 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / PR · Quality | [44217439276/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44217439276/attempts/1) | cancelled | 1279s | unknown | unknown | 542517 |
| Mesh-LLM/mesh-llm / PR · macOS | [44217439470/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44217439470/attempts/1) | success | 53s | 48s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [44217439501/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44217439501/attempts/1) | success | 929s | 914s | unknown | 693328 |
| Mesh-LLM/mesh-llm / PR · Linux | [44217439553/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44217439553/attempts/1) | cancelled | 1266s | unknown | unknown | 54803088 |
| Mesh-LLM/mesh-llm / PR · Quality | [44220011931/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44220011931/attempts/1) | cancelled | 201s | unknown | unknown | 541281 |
| Mesh-LLM/mesh-llm / PR · macOS | [44220012047/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44220012047/attempts/1) | success | 40s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [44220012063/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44220012063/attempts/1) | success | 960s | 945s | unknown | 693330 |
| Mesh-LLM/mesh-llm / PR · Linux | [44220012355/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44220012355/attempts/1) | success | 2578s | 8229s | unknown | 571414112 |
| Mesh-LLM/mesh-llm / PR · Quality | [44220413129/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44220413129/attempts/1) | success | 2722s | 4877s | unknown | 590880 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [44289642109/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/44289642109/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44453741822/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44453741822/attempts/1) | cancelled | 623s | 2335s | unknown | 25552264 |
| Mesh-LLM/mesh-llm / PR · Linux | [44453742077/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44453742077/attempts/1) | cancelled | 606s | unknown | unknown | 16268392 |
| Mesh-LLM/mesh-llm / PR · Quality | [44459012592/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012592/attempts/1) | cancelled | 2169s | unknown | unknown | 542450 |
| Mesh-LLM/mesh-llm / PR · macOS | [44459012607/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012607/attempts/1) | cancelled | 2187s | unknown | unknown | 395522783 |
| Mesh-LLM/mesh-llm / PR · Windows | [44459012702/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012702/attempts/1) | cancelled | 2184s | unknown | unknown | 40923209 |
| Mesh-LLM/mesh-llm / PR · Linux | [44459012845/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012845/attempts/1) | failure | 2825s | 14158s | unknown | 2279937258 |
| Mesh-LLM/mesh-llm / PR · macOS | [44465847521/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847521/attempts/1) | success | 1960s | 5977s | unknown | 395530597 |
| Mesh-LLM/mesh-llm / PR · Windows | [44465847539/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847539/attempts/1) | cancelled | 2101s | 9645s | unknown | 40923049 |
| Mesh-LLM/mesh-llm / PR · Quality | [44465847570/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847570/attempts/1) | cancelled | 2083s | 3364s | unknown | 542450 |
| Mesh-LLM/mesh-llm / PR · Linux | [44465847732/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847732/attempts/1) | failure | 2528s | 13954s | unknown | 2422650701 |
| Mesh-LLM/mesh-llm / PR · macOS | [44676257048/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44676257048/attempts/1) | success | 35s | 31s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [44676257062/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44676257062/attempts/1) | success | 4795s | 9639s | unknown | 222585778 |
| Mesh-LLM/mesh-llm / PR · Quality | [44676257068/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44676257068/attempts/1) | success | 1792s | 2903s | unknown | 590877 |
| Mesh-LLM/mesh-llm / PR · Linux | [44676257295/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44676257295/attempts/1) | success | 1847s | 7248s | unknown | 573067207 |
| Mesh-LLM/mesh-llm / PR · Quality | [44685047426/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685047426/attempts/1) | cancelled | 452s | 1441s | unknown | 541273 |
| Mesh-LLM/mesh-llm / PR · Quality | [44685048001/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685048001/attempts/1) | failure | 978s | 2680s | unknown | 542442 |
| Mesh-LLM/mesh-llm / PR · Quality | [44685889808/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685889808/attempts/1) | cancelled | 283s | unknown | unknown | 541273 |
| Mesh-LLM/mesh-llm / PR · macOS | [44685889877/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685889877/attempts/1) | success | 49s | 43s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44687458619/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44687458619/attempts/1) | success | 50s | 46s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44687458627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44687458627/attempts/1) | cancelled | 136s | 183s | unknown | 541273 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

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
- [Mesh-LLM/mesh-packaging 44070066691/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/44070066691/attempts/1): action_required.
- [Mesh-LLM/mesh-packaging 44083093155/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/44083093155/attempts/1): action_required.
- [Mesh-LLM/mesh-packaging 44110991074/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/44110991074/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44217439276/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44217439276/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44217439553/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44217439553/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44220011931/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44220011931/attempts/1): cancelled.
- [Mesh-LLM/mesh-packaging 44289642109/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/44289642109/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44453741822/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44453741822/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44453742077/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44453742077/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44459012592/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012592/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44459012607/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012607/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44459012702/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012702/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44459012845/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44459012845/attempts/1): failure.
  - Linux / Linux kotlin SDK smoke / Kotlin SDK smoke / kotlin SDK Smoke: Kotlin SDK smoke test.
  - Linux / Linux cpu product smoke / KV caching smoke (dense + recurrent) / Scripted Binary Smoke: Run scripted smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 44465847539/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847539/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44465847570/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847570/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44465847732/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44465847732/attempts/1): failure.
  - Linux / Linux kotlin SDK smoke / Kotlin SDK smoke / kotlin SDK Smoke: Kotlin SDK smoke test.
  - Linux / Linux cpu product smoke / KV caching smoke (dense + recurrent) / Scripted Binary Smoke: Run scripted smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 44685047426/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685047426/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44685048001/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685048001/attempts/1): failure.
  - Quality / Candidate source consistency: Check release targets and embedded client dependency purity.
  - Quality / Quality / Rust format: Check formatting.
  - Quality / Quality / Rust Clippy (batch-2): Run one Clippy invocation for the batch.
  - Quality / Quality / CI contracts: Test CI, packaging, and SDK contracts.
  - Quality / Quality / Rust Clippy (batch-1): Run one Clippy invocation for the batch.
  - Quality / Quality / Rust Clippy (batch-0): Run one Clippy invocation for the batch.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 44685889808/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685889808/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44687458627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44687458627/attempts/1): cancelled.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
