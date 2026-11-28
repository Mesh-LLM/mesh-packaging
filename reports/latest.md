# CI timing history

933 recorded attempts. 5302 separate job cohorts. 33 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Plan Windows | github-hosted | execution | 12s | 23s | 91.7% | 7 / 7 |
| Mesh-LLM/mesh-llm / Quality / CI / Quality | github-hosted | execution | 10s | 15s | 50.0% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 26s | 34s | 30.8% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 13s | 102s | 684.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / Stage public cpu / Assemble public cpu index | github-hosted | execution | 24s | 33s | 37.5% | 5 / 5 |
| Mesh-LLM/mesh-llm / Plan Linux | github-hosted | execution | 14s | 23s | 64.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | execution | 9s | 18s | 105.9% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Model download smoke / HuggingFace download smoke | github-hosted | execution | 140s | 177s | 26.4% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 701s | 907s | 29.4% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / Stage self-hosted cuda13 / self-hosted cuda13 amd64 | github-hosted | execution | 268s | 339s | 26.5% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / Validate public browser / public browser amd64 | github-hosted | queue | 2s | 3s | 25.0% | 10 / 10 |
| Mesh-LLM/mesh-llm-runner-images / Stage public cuda13 / public cuda13 amd64 | github-hosted | execution | 269s | 337s | 25.3% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / Stage self-hosted cuda12 / self-hosted cuda12 amd64 | github-hosted | execution | 284s | 352s | 23.9% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 3s | 1503s | 60020.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 248s | 50.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / Windows products / Windows product (cuda) | github-hosted | execution | 129s | 163s | 26.4% | 6 / 6 |
| Mesh-LLM/mesh-llm-runner-images / Stage self-hosted vulkan / Assemble self-hosted vulkan index | github-hosted | execution | 19s | 35s | 84.2% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / Stage public cpu / public cpu amd64 | github-hosted | execution | 241s | 336s | 39.4% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / Validate public ui / public ui amd64 | github-hosted | execution | 23s | 29s | 23.9% | 10 / 10 |
| Mesh-LLM/mesh-llm-runner-images / Stage self-hosted cpu / self-hosted cpu amd64 | github-hosted | execution | 229s | 340s | 48.5% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 181s | 247s | 36.5% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 24s | 34s | 41.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 155s | 1437s | 827.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 849s | 1513s | 78.2% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 940s | 1328s | 41.3% | 7 / 7 |
| Mesh-LLM/mesh-llm-runner-images / Stage self-hosted cuda13 / Assemble self-hosted cuda13 index | github-hosted | execution | 26s | 34s | 30.8% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 9s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [45746116498/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45746116498/attempts/1) | cancelled | 117s | unknown | unknown | 541257 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45749988763/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45749988763/attempts/1) | success | 127s | 849s | unknown | 1284798 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45752261497/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45752261497/attempts/1) | success | 129s | 827s | unknown | 1284817 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45754802948/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45754802948/attempts/1) | success | 127s | 833s | unknown | 1284776 |
| Mesh-LLM/mesh-llm / PR · Quality | [45911234275/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911234275/attempts/1) | cancelled | 13s | 11s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [45911234371/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911234371/attempts/1) | success | 46s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [45911234375/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911234375/attempts/1) | failure | 1667s | 1653s | unknown | 693894 |
| Mesh-LLM/mesh-llm / PR · Linux | [45911234468/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911234468/attempts/1) | success | 2535s | 8566s | unknown | 573808508 |
| Mesh-LLM/mesh-llm / PR · Quality | [45911248890/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911248890/attempts/1) | success | 2504s | 4350s | unknown | 590763 |
| Mesh-LLM/mesh-llm / PR · Quality | [45916077669/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45916077669/attempts/1) | cancelled | 11s | 7s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [45916077697/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45916077697/attempts/1) | success | 2461s | 2444s | unknown | 693893 |
| Mesh-LLM/mesh-llm / PR · macOS | [45916077926/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45916077926/attempts/1) | success | 41s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [45916077976/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45916077976/attempts/1) | success | 2067s | 7792s | unknown | 573801992 |
| Mesh-LLM/mesh-llm / PR · Quality | [45916088586/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45916088586/attempts/1) | success | 2548s | 4311s | unknown | 590845 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45964104306/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45964104306/attempts/1) | success | 137s | 821s | unknown | 1284802 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45967250836/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45967250836/attempts/1) | success | 129s | 808s | unknown | 1284751 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45978518857/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45978518857/attempts/1) | success | 129s | 837s | unknown | 1284805 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45987682798/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45987682798/attempts/1) | cancelled | 112s | unknown | unknown | 1284031 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45987912387/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45987912387/attempts/1) | success | 149s | 768s | unknown | 1284794 |
| Mesh-LLM/mesh-llm / PR · Quality | [46000466483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46000466483/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [46046341332/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341332/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [46046341424/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341424/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [46046341505/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341505/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [46046341621/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341621/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [46087189180/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189180/attempts/1) | failure | 5790s | 8477s | unknown | 779216764 |
| Mesh-LLM/mesh-llm / PR · Quality | [46087189200/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189200/attempts/1) | cancelled | 93s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [46087189201/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189201/attempts/1) | success | 199s | 193s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [46087189343/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189343/attempts/1) | failure | 508s | 670s | unknown | 16270377 |
| Mesh-LLM/mesh-llm / PR · Quality | [46087297862/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087297862/attempts/1) | success | 2743s | 4098s | unknown | 591202 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [46102167582/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/46102167582/attempts/1) | success | 439s | 5971s | unknown | 1281903 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

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
- [Mesh-LLM/mesh-llm 45911234275/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911234275/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 45911234375/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45911234375/attempts/1): failure.
  - Windows / Windows checks / Platform checks (windows-unit): Run Windows unit tests.
  - Windows / CI / Windows: Enforce Windows result.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 45916077669/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45916077669/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 45987682798/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45987682798/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 46000466483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46000466483/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 46046341332/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341332/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 46046341424/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341424/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 46046341505/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341505/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 46046341621/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46046341621/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 46087189180/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189180/attempts/1): failure.
  - Windows / Windows products / Select Windows product runner: Select provider for the Windows product role.
  - Windows / CI / Windows: Enforce Windows result.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 46087189200/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189200/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 46087189343/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/46087189343/attempts/1): failure.
  - Linux / Native Linux cpu runtime / Select Linux native runner: Select provider for the native runtime role.
  - Linux / Neutral Linux host / Select Linux host runner: Select provider for the host role.
  - Linux / Static ABI / Select protected static ABI runner: Select provider for the static ABI role.
  - Linux / Native Linux cuda runtime / Select Linux native runner: Select provider for the native runtime role.
  - Linux / Native Linux rocm runtime / Select Linux native runner: Select provider for the native runtime role.
  - Linux / Native Linux vulkan runtime / Select Linux native runner: Select provider for the native runtime role.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
