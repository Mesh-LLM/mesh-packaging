# CI timing history

424 recorded attempts. 2510 separate job cohorts. 25 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-0) | github-hosted | execution | 903s | 1110s | 22.9% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 121s | 190s | 57.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Quality / Quality / Select quality runner | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux products / Linux product (cpu) | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Console artifact / Select console artifact runner | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 11s | 102s | 827.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux SDK smoke / Rust SDK smoke / rust SDK Smoke | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 565s | 1296s | 129.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Console artifact / Select console artifact runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Console artifact / Build immutable console UI | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Neutral Linux host / Select Linux host runner | github-hosted | queue | 2s | 3s | 25.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 2s | 1438s | 71800.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 10s | 66.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 162s | 217s | 34.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Select platform-check runner | github-hosted | execution | 6s | 9s | 50.0% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 160s | 241s | 50.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 21.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 936s | 1286s | 37.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [38537418159/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38537418159/attempts/1) | success | 2409s | 3335s | unknown | 10857069 |
| Mesh-LLM/mesh-llm / Main · Quality | [38543992048/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38543992048/attempts/1) | cancelled | 2286s | 5073s | unknown | 10857068 |
| Mesh-LLM/mesh-llm / Main · macOS | [38543992176/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38543992176/attempts/1) | success | 3510s | 12350s | unknown | 1820007686 |
| Mesh-LLM/mesh-llm / Main · Windows | [38543992221/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38543992221/attempts/1) | success | 3165s | 8589s | unknown | 1751303753 |
| Mesh-LLM/mesh-llm / Main · Linux | [38543992264/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38543992264/attempts/1) | success | 3541s | 14587s | unknown | 2722544072 |
| Mesh-LLM/mesh-llm / PR · Windows | [38550208023/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208023/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38550208037/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208037/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [38550208134/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208134/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38550208228/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208228/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38550348983/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550348983/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38723681229/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38723681229/attempts/1) | success | 40s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [38723681265/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38723681265/attempts/1) | success | 2363s | 2708s | unknown | 190493776 |
| Mesh-LLM/mesh-llm / PR · Quality | [38723914430/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38723914430/attempts/1) | cancelled | 2430s | unknown | unknown | 10855831 |
| Mesh-LLM/mesh-llm / PR · Windows | [38726401199/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401199/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38726401233/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401233/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38726401399/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401399/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [38726401484/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401484/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38726532127/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726532127/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38728674708/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38728674708/attempts/1) | cancelled | 125s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38728674921/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38728674921/attempts/1) | success | 36s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38871135643/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871135643/attempts/1) | success | 2561s | 2755s | unknown | 10862195 |
| Mesh-LLM/mesh-llm / PR · Linux | [38871572841/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572841/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38871572854/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572854/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [38871572880/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572880/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38871572976/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38871572976/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [38885874876/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885874876/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [38885874938/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885874938/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38885875035/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885875035/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [38885875521/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38885875521/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [38886193420/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38886193420/attempts/1) | action_required | unknown | unknown | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 38229530366/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38229530366/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 38229540695/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38229540695/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 38247588861/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/38247588861/attempts/1): failure.
  - Stage public rocm72 / public rocm72 amd64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 arm64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 amd64: Verify exact staged platform digest.
  - Stage public web / public web amd64: Verify exact staged platform digest.
  - Stage public browser / public browser amd64: Build platform image once.
  - Stage self-hosted rocm70 / self-hosted rocm70 amd64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu arm64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu amd64: Verify exact staged platform digest.
  - Stage public cpu / public cpu amd64: Verify exact staged platform digest.
  - Stage public rocm70 / public rocm70 amd64: Verify exact staged platform digest.
  - Stage self-hosted rocm72 / self-hosted rocm72 amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 arm64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan amd64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan arm64: Verify exact staged platform digest.
  - Stage public cpu / public cpu arm64: Verify exact staged platform digest.
  - Stage public vulkan / public vulkan amd64: Verify exact staged platform digest.
  - Stage public ui / public ui amd64: Build platform image once.
  - Stage public vulkan / public vulkan arm64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 amd64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 amd64: Verify exact staged platform digest.
- [Mesh-LLM/mesh-llm 38249019412/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38249019412/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38249019470/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38249019470/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38249019586/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38249019586/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38249019683/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38249019683/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38249279902/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38249279902/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38543992048/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38543992048/attempts/1): cancelled.
  - Quality / CI / Quality: Enforce quality result.
  - Main / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 38550208023/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208023/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38550208037/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208037/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38550208134/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208134/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38550208228/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550208228/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38550348983/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38550348983/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 38723914430/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38723914430/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 38726401199/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/38726401199/attempts/1): action_required.
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

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
