# CI timing history

351 recorded attempts. 2240 separate job cohorts. 10 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-0) | github-hosted | execution | 932s | 1146s | 23.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 113s | 185s | 63.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Quality / Quality / Select quality runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux products / Linux product (cpu) | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Console artifact / Select console artifact runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Console artifact / Build immutable console UI | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Neutral Linux host / Select Linux host runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 158s | 191s | 20.9% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 931s | 1243s | 33.5% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [37195009655/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37195009655/attempts/1) | success | 625s | 1719s | unknown | 1168 |
| Mesh-LLM/mesh-llm / Main · Windows | [37197131950/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37197131950/attempts/1) | success | 1973s | 6547s | unknown | 1685329687 |
| Mesh-LLM/mesh-llm / Main · Quality | [37197131972/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37197131972/attempts/1) | success | 295s | 943s | unknown | 1168 |
| Mesh-LLM/mesh-llm / Main · Linux | [37197132105/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37197132105/attempts/1) | success | 1428s | 8729s | unknown | 2636814136 |
| Mesh-LLM/mesh-llm / Main · macOS | [37197132118/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37197132118/attempts/1) | success | 2646s | 6938s | unknown | 1581876153 |
| Mesh-LLM/mesh-packaging / Mesh LLM Packaging Release | [37232152060/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/37232152060/attempts/1) | success | 1051s | 4267s | unknown | 12246242190 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [37256240135/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/37256240135/attempts/1) | success | 123s | 120s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [37257766201/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/37257766201/attempts/1) | success | 117s | 113s | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [37304376232/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/37304376232/attempts/1) | failure | 392s | 5306s | unknown | 834140 |
| Mesh-LLM/mesh-llm / PR · macOS | [37304724611/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37304724611/attempts/1) | success | 27s | 21s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37304897825/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37304897825/attempts/1) | success | 353s | 1007s | unknown | 1238 |
| Mesh-LLM/mesh-packaging / Mesh LLM Packaging Release | [37309406401/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/37309406401/attempts/1) | success | 1319s | 4477s | unknown | 12246459592 |
| Mesh-LLM/mesh-llm / PR · Quality | [37310261322/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37310261322/attempts/1) | cancelled | 128s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37310261398/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37310261398/attempts/1) | success | 25s | 19s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37310261486/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37310261486/attempts/1) | success | 26s | 19s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37310447245/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37310447245/attempts/1) | success | 368s | 1053s | unknown | 1236 |
| Mesh-LLM/mesh-llm / PR · Quality | [37311026087/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37311026087/attempts/1) | cancelled | 192s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37311026226/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37311026226/attempts/1) | success | 22s | 18s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37311026283/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37311026283/attempts/1) | success | 25s | 19s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37311270400/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37311270400/attempts/1) | success | 431s | 1061s | unknown | 1236 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454125407/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454125407/attempts/1) | success | 2478s | 2452s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454125502/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454125502/attempts/1) | success | 27s | 22s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454294141/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454294141/attempts/1) | success | 25s | 20s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454294210/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454294210/attempts/1) | success | 26s | 18s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454365919/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454365919/attempts/1) | success | 26s | 21s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454366345/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454366345/attempts/1) | success | 28s | 23s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454833430/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454833430/attempts/1) | success | 20s | 15s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454833687/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454833687/attempts/1) | success | 23s | 18s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37457643778/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37457643778/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37457644133/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37457644133/attempts/1) | action_required | unknown | unknown | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

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
- [Mesh-LLM/mesh-llm 37189437490/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37189437490/attempts/1): failure.
  - Resolve release metadata: Prepare canonical release source.
- [Mesh-LLM/mesh-llm 37194781534/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37194781534/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 37304376232/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/37304376232/attempts/1): failure.
  - Stage public vulkan / public vulkan arm64: Verify exact staged platform digest.
  - Stage public rocm72 / public rocm72 amd64: Verify exact staged platform digest.
  - Stage public cpu / public cpu amd64: Verify exact staged platform digest.
  - Stage public ui / public ui amd64: Build platform image once.
  - Stage public cuda13 / public cuda13 arm64: Verify exact staged platform digest.
  - Stage public rocm70 / public rocm70 amd64: Verify exact staged platform digest.
  - Stage public vulkan / public vulkan amd64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 amd64: Verify exact staged platform digest.
  - Stage self-hosted rocm72 / self-hosted rocm72 amd64: Verify exact staged platform digest.
  - Stage public cpu / public cpu arm64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan amd64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 amd64: Verify exact staged platform digest.
  - Stage self-hosted rocm70 / self-hosted rocm70 amd64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 arm64: Verify exact staged platform digest.
  - Stage public web / public web amd64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu arm64: Verify exact staged platform digest.
  - Stage public browser / public browser amd64: Build platform image once.
  - Stage public cuda12 / public cuda12 amd64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu amd64: Verify exact staged platform digest.
- [Mesh-LLM/mesh-llm 37310261322/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37310261322/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 37311026087/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37311026087/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 37457643778/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37457643778/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37457644133/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37457644133/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
