# CI timing history

897 recorded attempts. 5209 separate job cohorts. 22 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Plan Windows | github-hosted | execution | 12s | 23s | 91.7% | 7 / 7 |
| Mesh-LLM/mesh-llm / Quality / CI / Quality | github-hosted | execution | 10s | 15s | 50.0% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 13s | 102s | 684.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Plan Linux | github-hosted | execution | 14s | 23s | 64.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | execution | 9s | 18s | 105.9% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Model download smoke / HuggingFace download smoke | github-hosted | execution | 140s | 177s | 26.4% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 701s | 907s | 29.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 3s | 1503s | 60020.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 248s | 50.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / Windows products / Windows product (cuda) | github-hosted | execution | 129s | 163s | 26.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 181s | 247s | 36.5% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 24s | 34s | 41.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 155s | 1437s | 827.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 849s | 1513s | 78.2% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 940s | 1328s | 41.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 9s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [45526818246/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45526818246/attempts/1) | cancelled | 1822s | unknown | unknown | 542497 |
| Mesh-LLM/mesh-llm / PR · Windows | [45530441062/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530441062/attempts/1) | success | 2768s | 2744s | unknown | 693896 |
| Mesh-LLM/mesh-llm / PR · Quality | [45530441114/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530441114/attempts/1) | cancelled | 26s | 20s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [45530441219/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530441219/attempts/1) | success | 36s | 31s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [45530441408/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530441408/attempts/1) | success | 1791s | 5320s | unknown | 573774916 |
| Mesh-LLM/mesh-llm / PR · Quality | [45530464153/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530464153/attempts/1) | cancelled | 115s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45530657322/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530657322/attempts/1) | cancelled | 1640s | 2782s | unknown | 542497 |
| Mesh-LLM/mesh-llm / PR · Quality | [45533933783/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45533933783/attempts/1) | cancelled | 23s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45533952507/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45533952507/attempts/1) | cancelled | 2145s | unknown | unknown | 542497 |
| Mesh-LLM/mesh-llm / PR · Quality | [45538101675/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45538101675/attempts/1) | success | 2585s | 3725s | unknown | 590926 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45695638481/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45695638481/attempts/1) | success | 158s | 866s | unknown | 1284657 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45698086290/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45698086290/attempts/1) | success | 133s | 878s | unknown | 1284767 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45699901525/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45699901525/attempts/1) | success | 134s | 891s | unknown | 1284772 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45700536661/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45700536661/attempts/1) | success | 137s | 892s | unknown | 1284719 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45718804840/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45718804840/attempts/1) | success | 142s | 887s | unknown | 1284762 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45719200119/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45719200119/attempts/1) | success | 136s | 887s | unknown | 1284801 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45721340515/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45721340515/attempts/1) | success | 124s | 858s | unknown | 1284836 |
| Mesh-LLM/mesh-llm / PR · macOS | [45745427554/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745427554/attempts/1) | success | 35s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [45745427863/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745427863/attempts/1) | failure | 328s | 423s | unknown | 26734779 |
| Mesh-LLM/mesh-llm / PR · Quality | [45745588433/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745588433/attempts/1) | cancelled | 94s | 118s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45745893599/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745893599/attempts/1) | cancelled | 92s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45746015545/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746015545/attempts/1) | cancelled | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [45746015556/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746015556/attempts/1) | success | 37s | 32s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [45746015569/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746015569/attempts/1) | success | 40s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [45746015665/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746015665/attempts/1) | failure | 287s | 386s | unknown | 26734780 |
| Mesh-LLM/mesh-llm / PR · Quality | [45746024946/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746024946/attempts/1) | cancelled | 50s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45746116498/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746116498/attempts/1) | cancelled | 117s | unknown | unknown | 541257 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45749988763/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45749988763/attempts/1) | success | 127s | 849s | unknown | 1284798 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45752261497/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45752261497/attempts/1) | success | 129s | 827s | unknown | 1284817 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45754802948/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45754802948/attempts/1) | success | 127s | 833s | unknown | 1284776 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 45085858983/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858983/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45085858996/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858996/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45085859177/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085859177/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086222074/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086222074/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086450447/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450447/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086450519/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450519/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086450678/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450678/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45087807005/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45087807005/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45114290335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45114290335/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 45317038564/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317038564/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317038620/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317038620/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317038835/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317038835/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317039169/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317039169/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317878788/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317878788/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317878879/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317878879/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317878893/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317878893/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45317879096/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45317879096/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45526818246/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45526818246/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45530441114/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530441114/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45530464153/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530464153/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45530657322/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45530657322/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45533933783/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45533933783/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45533952507/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45533952507/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45745427863/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745427863/attempts/1): failure.
  - Linux / Static ABI / Static ABI input (x86_64-unknown-linux-gnu, cpu): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture static ABI sccache evidence.
  - Linux / Console artifact / Build immutable console UI: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 45745588433/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745588433/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45745893599/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45745893599/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45746015545/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746015545/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45746015665/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746015665/attempts/1): failure.
  - Linux / Console artifact / Build immutable console UI: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Linux / Static ABI / Static ABI input (x86_64-unknown-linux-gnu, cpu): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture static ABI sccache evidence.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 45746024946/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746024946/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45746116498/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746116498/attempts/1): cancelled.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
