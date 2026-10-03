# CI timing history

315 recorded attempts. 2062 separate job cohorts. 10 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-0) | github-hosted | execution | 874s | 1074s | 22.9% | 5 / 5 |
| Mesh-LLM/mesh-llm / Quality / Quality / Select quality runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Console artifact / Select console artifact runner | github-hosted | execution | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Console artifact / Build immutable console UI | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Neutral Linux host / Select Linux host runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 158s | 194s | 22.8% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-2) | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / Quality / Quality / Rust Clippy (batch-0) | depot | execution | 125s | 154s | 23.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 940s | 1243s | 32.2% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Main · macOS | [36833239863/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36833239863/attempts/1) | success | 3480s | 10586s | unknown | 1519266204 |
| Mesh-LLM/mesh-llm / PR · Quality | [36835967792/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835967792/attempts/1) | cancelled | 38s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [36835968057/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835968057/attempts/1) | failure | 23s | 17s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36835968381/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835968381/attempts/1) | failure | 22s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36835969362/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835969362/attempts/1) | failure | 21s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36836993292/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993292/attempts/1) | failure | 20s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [36836993506/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993506/attempts/1) | failure | 22s | 17s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36836993634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993634/attempts/1) | failure | 19s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36836993660/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993660/attempts/1) | failure | 25s | 18s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37007056971/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007056971/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37007057272/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007057272/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37007057345/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007057345/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [37007057632/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007057632/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37007209804/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007209804/attempts/1) | cancelled | 18s | 15s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37007209827/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007209827/attempts/1) | failure | 19s | 13s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [37007210348/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007210348/attempts/1) | cancelled | 17s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37007210474/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007210474/attempts/1) | cancelled | 17s | 13s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37007237887/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007237887/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37007393304/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007393304/attempts/1) | cancelled | 19s | 13s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [37117136022/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117136022/attempts/1) | success | 2406s | 8364s | unknown | 554575804 |
| Mesh-LLM/mesh-llm / PR · macOS | [37117136168/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117136168/attempts/1) | success | 20s | 15s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37117171636/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171636/attempts/1) | success | 564s | 1608s | unknown | 1168 |
| Mesh-LLM/mesh-llm / PR · Windows | [37117171715/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171715/attempts/1) | cancelled | 813s | unknown | unknown | 8445246 |
| Mesh-LLM/mesh-llm / PR · macOS | [37117171829/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171829/attempts/1) | cancelled | 1595s | unknown | unknown | 123473221 |
| Mesh-LLM/mesh-llm / PR · Linux | [37117171895/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171895/attempts/1) | cancelled | 809s | unknown | unknown | 11873471 |
| Mesh-LLM/mesh-llm / PR · Quality | [37117240738/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117240738/attempts/1) | success | 617s | 1478s | unknown | 1237 |
| Mesh-LLM/mesh-llm / PR · Quality | [37118587783/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37118587783/attempts/1) | success | 573s | 1807s | unknown | 1168 |
| Mesh-LLM/mesh-llm / PR · macOS | [37118587898/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37118587898/attempts/1) | success | 1992s | 6145s | unknown | 318175050 |
| Mesh-LLM/mesh-llm / PR · Quality | [37120610189/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37120610189/attempts/1) | cancelled | 107s | unknown | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [37156713969/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/37156713969/attempts/1) | success | 125s | 122s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 36532910165/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36532910165/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36532910202/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36532910202/attempts/1): failure.
  - macOS / Metal product smoke / Laya smoke (macOS Metal): Run ./.github/actions/run-laya-product-smoke.
  - macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke: Run ./.github/actions/restore-smoke-inputs.
  - macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal): Run ./.github/actions/restore-smoke-inputs.
  - macOS / CI / macOS: Enforce macOS result.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 36536521774/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36536521774/attempts/1): failure.
  - Linux / Linux product smoke / Laya smoke (Linux Vulkan): Run ./.github/actions/run-laya-product-smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 36695081203/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695081203/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36695081810/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695081810/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36695081923/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695081923/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36695082206/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695082206/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36695177354/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695177354/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36835967792/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835967792/attempts/1): cancelled.
  - Plan quality: Build canonical plan.
- [Mesh-LLM/mesh-llm 36835968057/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835968057/attempts/1): failure.
  - Plan Windows: Build canonical plan.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 36835968381/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835968381/attempts/1): failure.
  - Plan Linux: Build canonical plan.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 36835969362/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835969362/attempts/1): failure.
  - Plan macOS: Build canonical plan.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 36836993292/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993292/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 36836993506/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993506/attempts/1): failure.
  - Plan Windows: Build canonical plan.
  - PR / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 36836993634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993634/attempts/1): failure.
  - Plan Linux: Build canonical plan.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 36836993660/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993660/attempts/1): failure.
  - Plan macOS: Build canonical plan.
  - PR / macOS: Enforce macOS result.
- [Mesh-LLM/mesh-llm 37007056971/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007056971/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37007057272/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007057272/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37007057345/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007057345/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37007057632/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007057632/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37007209804/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007209804/attempts/1): cancelled.
  - Plan Windows: Build canonical plan.
- [Mesh-LLM/mesh-llm 37007209827/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007209827/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 37007210348/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007210348/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 37007210474/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007210474/attempts/1): cancelled.
  - Plan macOS: Build canonical plan.
- [Mesh-LLM/mesh-llm 37007237887/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007237887/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37007393304/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37007393304/attempts/1): cancelled.
  - Plan quality: Build canonical plan.
- [Mesh-LLM/mesh-llm 37117171715/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171715/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 37117171829/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171829/attempts/1): cancelled.
  - macOS / macOS checks / Platform checks (macos-unit): Run macOS unit tests.
- [Mesh-LLM/mesh-llm 37117171895/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37117171895/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 37120610189/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37120610189/attempts/1): cancelled.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
