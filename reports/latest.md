# CI timing history

372 recorded attempts. 2328 separate job cohorts. 10 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / PR · macOS | [37454125502/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454125502/attempts/1) | success | 27s | 22s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454294141/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454294141/attempts/1) | success | 25s | 20s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454294210/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454294210/attempts/1) | success | 26s | 18s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454365919/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454365919/attempts/1) | success | 26s | 21s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454366345/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454366345/attempts/1) | success | 28s | 23s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37454833430/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454833430/attempts/1) | success | 20s | 15s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37454833687/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37454833687/attempts/1) | success | 23s | 18s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37457643778/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37457643778/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37457644133/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37457644133/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37925163149/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163149/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37925163467/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163467/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [37925163534/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163534/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37925163549/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163549/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37925340483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925340483/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [37927356309/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356309/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37927356463/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356463/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [37927356546/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356546/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [37927356560/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356560/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [37927632929/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927632929/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [38013236475/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/38013236475/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [38046161581/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38046161581/attempts/1) | failure | 3676s | 10644s | unknown | 2693573620 |
| Mesh-LLM/mesh-llm / PR · macOS | [38046161634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38046161634/attempts/1) | success | 1636s | 5092s | unknown | 322591770 |
| Mesh-LLM/mesh-llm / PR · Quality | [38050230718/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38050230718/attempts/1) | success | 364s | 1090s | unknown | 1237 |
| Mesh-LLM/mesh-llm / PR · macOS | [38050230785/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38050230785/attempts/1) | success | 1709s | 5060s | unknown | 322594939 |
| Mesh-LLM/mesh-llm / CI · Linux · 5747d98cfeebb198c4baf50323e727edf45d6737 | [38050315814/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38050315814/attempts/1) | failure | 2655s | 11040s | unknown | 1229918643 |
| Mesh-LLM/mesh-llm / PR · Windows | [38052433708/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052433708/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38052433785/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052433785/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [38052433900/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052433900/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38052434051/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052434051/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38052495013/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052495013/attempts/1) | action_required | unknown | unknown | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

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
- [Mesh-LLM/mesh-llm 37925163149/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163149/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37925163467/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163467/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37925163534/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163534/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37925163549/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925163549/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37925340483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37925340483/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37927356309/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356309/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37927356463/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356463/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37927356546/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356546/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37927356560/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927356560/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 37927632929/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/37927632929/attempts/1): action_required.
- [Mesh-LLM/mesh-packaging 38013236475/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/38013236475/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38046161581/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38046161581/attempts/1): failure.
  - Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests: Dense standalone inference smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 38050315814/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38050315814/attempts/1): failure.
  - Standalone Skippy products / Standalone Linux Skippy (cpu): Execute composed Skippy dense CPU qualification.
  - CI / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 38052433708/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052433708/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38052433785/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052433785/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38052433900/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052433900/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38052434051/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052434051/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38052495013/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38052495013/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
