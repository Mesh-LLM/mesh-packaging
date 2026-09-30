# CI timing history

284 recorded attempts. 1922 separate job cohorts. 2 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Quality / Quality / Select quality runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Quality / Quality / Rust Clippy (batch-0) | depot | execution | 125s | 154s | 23.2% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Main · Quality | [36432562058/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36432562058/attempts/1) | success | 343s | 797s | unknown | 1170 |
| Mesh-LLM/mesh-llm / PR · Windows | [36432712705/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36432712705/attempts/1) | success | 205s | 45s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36432712797/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36432712797/attempts/1) | cancelled | 86s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36432713395/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36432713395/attempts/1) | success | 182s | 16s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36432882516/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36432882516/attempts/1) | success | 456s | 1031s | unknown | 1229 |
| Mesh-LLM/mesh-llm / PR · Windows | [36433601041/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433601041/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36433601375/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433601375/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [36433601632/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433601632/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [36433602117/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433602117/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [36433921230/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36433921230/attempts/1) | action_required | unknown | unknown | unknown | 0 |
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

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 35990147451/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/35990147451/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 35990147763/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/35990147763/attempts/1): failure.
  - Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests: Recurrent standalone inference smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 35990201559/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/35990201559/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36121859484/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36121859484/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36121859766/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36121859766/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36121859773/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36121859773/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36121886701/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36121886701/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 36124554298/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/36124554298/attempts/1): cancelled.
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

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
