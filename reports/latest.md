# CI timing history

455 recorded attempts. 2687 separate job cohorts. 17 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / Main · Quality | [39022105185/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39022105185/attempts/1) | success | 2489s | 5131s | unknown | 10859406 |
| Mesh-LLM/mesh-llm / Main · Windows | [39022105220/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39022105220/attempts/1) | success | 3663s | 8952s | unknown | 1750269625 |
| Mesh-LLM/mesh-llm / Main · Linux | [39022105300/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39022105300/attempts/1) | failure | 3415s | 14417s | unknown | 2718376973 |
| Mesh-LLM/mesh-llm / PR · Windows | [39026165805/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026165805/attempts/1) | success | 43s | 38s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39026165822/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026165822/attempts/1) | success | 43s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39026165837/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026165837/attempts/1) | cancelled | 111s | 103s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39026165839/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026165839/attempts/1) | success | 48s | 42s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39026519156/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026519156/attempts/1) | cancelled | 200s | 192s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39026519235/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026519235/attempts/1) | success | 50s | 45s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39101242051/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101242051/attempts/1) | cancelled | 1205s | 2694s | unknown | 10862988 |
| Mesh-LLM/mesh-llm / PR · macOS | [39101242115/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101242115/attempts/1) | success | 40s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39101242124/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101242124/attempts/1) | success | 3229s | 3215s | unknown | 14394104 |
| Mesh-LLM/mesh-llm / PR · Linux | [39101242148/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101242148/attempts/1) | success | 2870s | 7569s | unknown | 596452504 |
| Mesh-LLM/mesh-llm / PR · Quality | [39101288627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101288627/attempts/1) | cancelled | 14s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39102359062/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39102359062/attempts/1) | success | 2601s | 4140s | unknown | 10862988 |
| Mesh-LLM/mesh-llm / PR · Quality | [39102765818/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39102765818/attempts/1) | success | 2613s | 2628s | unknown | 10861752 |
| Mesh-LLM/mesh-llm / PR · Windows | [39102765853/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39102765853/attempts/1) | success | 9426s | 14285s | unknown | 1750835394 |
| Mesh-LLM/mesh-llm / PR · Linux | [39102765864/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39102765864/attempts/1) | success | 3565s | 16000s | unknown | 2718767728 |
| Mesh-LLM/mesh-llm / PR · macOS | [39102765882/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39102765882/attempts/1) | success | 3190s | 8692s | unknown | 390841293 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [39234720000/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/39234720000/attempts/1) | failure | 376s | 5267s | unknown | 848190 |
| Mesh-LLM/mesh-llm / PR · Quality | [39261749710/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261749710/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39261749805/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261749805/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39261749908/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261749908/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39261750064/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750064/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39261750176/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750176/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39261750316/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750316/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [39261750896/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750896/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [39261751054/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261751054/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [39261751058/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261751058/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [39261751130/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261751130/attempts/1) | action_required | unknown | unknown | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 38726401233/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401233/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38726401399/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401399/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38726401484/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401484/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38726532127/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726532127/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38728674708/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38728674708/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 38871572841/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572841/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38871572854/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572854/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38871572880/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572880/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38871572976/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572976/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38885874876/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885874876/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38885874938/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885874938/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38885875035/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885875035/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38885875521/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885875521/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38886193420/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38886193420/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39022105300/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39022105300/attempts/1): failure.
  - Linux / Rust tests / Rust tests (batch-1): Run isolated Cargo tests for the batch.
  - Linux / CI / Linux: Enforce Linux result.
  - Main / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 39026165837/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026165837/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39026519156/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39026519156/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39101242051/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101242051/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 39101288627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39101288627/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 39234720000/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/39234720000/attempts/1): failure.
  - Stage public web / public web amd64: Verify exact staged platform digest.
  - Stage self-hosted rocm72 / self-hosted rocm72 amd64: Verify exact staged platform digest.
  - Stage self-hosted rocm70 / self-hosted rocm70 amd64: Verify exact staged platform digest.
  - Stage public cpu / public cpu amd64: Verify exact staged platform digest.
  - Stage public rocm70 / public rocm70 amd64: Verify exact staged platform digest.
  - Stage public rocm72 / public rocm72 amd64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 arm64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 amd64: Verify exact staged platform digest.
  - Stage public cpu / public cpu arm64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan arm64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 amd64: Verify exact staged platform digest.
  - Stage public ui / public ui amd64: Build platform image once.
  - Stage public browser / public browser amd64: Build platform image once.
  - Stage self-hosted cuda12 / self-hosted cuda12 arm64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 arm64: Verify exact staged platform digest.
  - Stage public vulkan / public vulkan arm64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan amd64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 arm64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 amd64: Verify exact staged platform digest.
  - Stage public vulkan / public vulkan amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 amd64: Verify exact staged platform digest.
- [Mesh-LLM/mesh-llm 39261749710/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261749710/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261749805/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261749805/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261749908/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261749908/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261750064/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750064/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261750176/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750176/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261750316/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750316/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261750896/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261750896/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261751054/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261751054/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261751058/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261751058/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39261751130/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39261751130/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
