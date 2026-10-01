# CI timing history

294 recorded attempts. 1932 separate job cohorts. 10 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / PR · Linux | [36532910165/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36532910165/attempts/1) | cancelled | 1784s | unknown | unknown | 242485526 |
| Mesh-LLM/mesh-llm / PR · macOS | [36532910202/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36532910202/attempts/1) | failure | 1756s | 5558s | unknown | 302423568 |
| Mesh-LLM/mesh-llm / PR · Linux | [36534697406/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36534697406/attempts/1) | success | 27s | 21s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36534697444/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36534697444/attempts/1) | success | 23s | 17s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36535907372/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36535907372/attempts/1) | success | 22s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36535907430/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36535907430/attempts/1) | success | 20s | 15s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36536357145/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36536357145/attempts/1) | success | 26s | 21s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36536357340/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36536357340/attempts/1) | success | 26s | 20s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36536521707/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36536521707/attempts/1) | success | 2333s | 5989s | unknown | 302418947 |
| Mesh-LLM/mesh-llm / PR · Linux | [36536521774/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36536521774/attempts/1) | failure | 3238s | 15608s | unknown | 2644909258 |
| Mesh-LLM/mesh-llm / Main · Linux | [36692916611/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36692916611/attempts/1) | success | 1488s | 9034s | unknown | 2637295467 |
| Mesh-LLM/mesh-llm / PR · Quality | [36695081203/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695081203/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [36695081810/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695081810/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36695081923/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695081923/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36695082206/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695082206/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36695177354/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36695177354/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36697190019/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36697190019/attempts/1) | success | 20s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [36697190189/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36697190189/attempts/1) | success | 58s | 17s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36697190331/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36697190331/attempts/1) | success | 552s | 547s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36697191225/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36697191225/attempts/1) | success | 30s | 23s | unknown | 0 |
| Mesh-LLM/mesh-llm / Main · Linux | [36833239777/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36833239777/attempts/1) | success | 1766s | 9047s | unknown | 2638889569 |
| Mesh-LLM/mesh-llm / Main · macOS | [36833239863/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36833239863/attempts/1) | success | 3480s | 10586s | unknown | 1519266204 |
| Mesh-LLM/mesh-llm / PR · Quality | [36835967792/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835967792/attempts/1) | cancelled | 38s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [36835968057/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835968057/attempts/1) | failure | 23s | 17s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36835968381/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835968381/attempts/1) | failure | 22s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36835969362/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36835969362/attempts/1) | failure | 21s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36836993292/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993292/attempts/1) | failure | 20s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [36836993506/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993506/attempts/1) | failure | 22s | 17s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36836993634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993634/attempts/1) | failure | 19s | 14s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36836993660/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36836993660/attempts/1) | failure | 25s | 18s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 36236105284/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36236105284/attempts/1): failure.
  - Linux / Linux product smoke / KV caching smoke (dense + recurrent) / Scripted Binary Smoke: Run scripted smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 36236486152/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36236486152/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36236486313/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36236486313/attempts/1): failure.
  - Linux / Linux product smoke / KV caching smoke (dense + recurrent) / Scripted Binary Smoke: Run scripted smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 36236552729/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36236552729/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36316999527/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36316999527/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36317497323/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36317497323/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36317805713/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36317805713/attempts/1): cancelled.
- [Mesh-LLM/mesh-packaging 36406788739/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/36406788739/attempts/1): failure.
  - Verify upstream Node SDK addon macOS x64: Download, verify, and safely extract immutable addon.
  - Packaging readiness manifest: Record and enforce required results.
- [Mesh-LLM/mesh-llm 36432712797/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36432712797/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36433601041/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433601041/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36433601375/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433601375/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36433601632/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433601632/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36433602117/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433602117/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 36433921230/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433921230/attempts/1): action_required.
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

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
