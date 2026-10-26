# CI timing history

526 recorded attempts. 2939 separate job cohorts. 17 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / PR · Quality | [40086682777/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682777/attempts/1) | cancelled | 243s | 236s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [40086682779/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682779/attempts/1) | cancelled | 641s | unknown | unknown | 14406630 |
| Mesh-LLM/mesh-llm / PR · Linux | [40086682829/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682829/attempts/1) | cancelled | 655s | 651s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40086682848/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682848/attempts/1) | cancelled | 658s | 2134s | unknown | 53537707 |
| Mesh-LLM/mesh-llm / PR · Quality | [40086911716/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086911716/attempts/1) | success | 39s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40086931796/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086931796/attempts/1) | cancelled | 424s | 402s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40087012172/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40087012172/attempts/1) | success | 38s | 32s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40087380199/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40087380199/attempts/1) | cancelled | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40087389310/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40087389310/attempts/1) | cancelled | 238s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [40185535987/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185535987/attempts/1) | cancelled | 167s | 164s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40185536002/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185536002/attempts/1) | cancelled | 164s | 157s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40185536013/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185536013/attempts/1) | cancelled | 167s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [40185536039/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185536039/attempts/1) | cancelled | 164s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [40185698817/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185698817/attempts/1) | success | 2409s | 2379s | unknown | 14535403 |
| Mesh-LLM/mesh-llm / PR · Quality | [40185698841/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185698841/attempts/1) | cancelled | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40185698906/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185698906/attempts/1) | success | 2656s | 5799s | unknown | 197307038 |
| Mesh-LLM/mesh-llm / PR · Linux | [40185698967/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185698967/attempts/1) | success | 3303s | 8258s | unknown | 602638306 |
| Mesh-LLM/mesh-llm / PR · Quality | [40185714574/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185714574/attempts/1) | cancelled | 275s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40186007749/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40186007749/attempts/1) | success | 2371s | 3351s | unknown | 10988284 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [40306387684/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/40306387684/attempts/1) | failure | 492s | 6499s | unknown | 880385 |
| Mesh-LLM/mesh-llm / PR · macOS | [40323522618/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40323522618/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40323665809/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40323665809/attempts/1) | success | 2514s | 3639s | unknown | 10990987 |
| Mesh-LLM/mesh-llm / PR · macOS | [40324351500/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40324351500/attempts/1) | success | 44s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40326119711/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40326119711/attempts/1) | success | 42s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40326120364/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40326120364/attempts/1) | cancelled | 449s | 442s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40326329193/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40326329193/attempts/1) | success | 62s | 44s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40327054315/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054315/attempts/1) | cancelled | 714s | 1229s | unknown | 10989750 |
| Mesh-LLM/mesh-llm / PR · Windows | [40327054465/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054465/attempts/1) | cancelled | 739s | unknown | unknown | 14533765 |
| Mesh-LLM/mesh-llm / PR · Linux | [40327054468/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054468/attempts/1) | cancelled | 682s | unknown | unknown | 10987046 |
| Mesh-LLM/mesh-llm / PR · macOS | [40327054510/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054510/attempts/1) | success | 43s | 37s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 39767224627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39767224627/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943813595/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943813595/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943813634/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943813634/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887254/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887254/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887335/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887396/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887396/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943887408/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943887408/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943895866/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943895866/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943895979/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943895979/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943896111/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943896111/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 39943896166/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/39943896166/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40086682777/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682777/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40086682779/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682779/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40086682829/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682829/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40086682848/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086682848/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40086931796/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40086931796/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40087380199/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40087380199/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40087389310/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40087389310/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40185535987/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185535987/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40185536002/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185536002/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40185536013/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185536013/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40185536039/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185536039/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40185698841/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185698841/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40185714574/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40185714574/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 40306387684/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/40306387684/attempts/1): failure.
  - Stage self-hosted vulkan / self-hosted vulkan amd64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu arm64: Verify exact staged platform digest.
  - Stage public cpu / public cpu amd64: Verify exact staged platform digest.
  - Stage public rocm70 / public rocm70 amd64: Verify exact staged platform digest.
  - Stage public ui / public ui amd64: Build platform image once.
  - Stage public vulkan / public vulkan amd64: Verify exact staged platform digest.
  - Stage self-hosted cpu / self-hosted cpu amd64: Verify exact staged platform digest.
  - Stage self-hosted rocm70 / self-hosted rocm70 amd64: Verify exact staged platform digest.
  - Stage public browser / public browser amd64: Build platform image once.
  - Stage public cpu / public cpu arm64: Verify exact staged platform digest.
  - Stage public vulkan / public vulkan arm64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 amd64: Verify exact staged platform digest.
  - Stage public cuda12 / public cuda12 arm64: Verify exact staged platform digest.
  - Stage self-hosted rocm72 / self-hosted rocm72 amd64: Verify exact staged platform digest.
  - Stage self-hosted vulkan / self-hosted vulkan arm64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 amd64: Verify exact staged platform digest.
  - Stage public cuda13 / public cuda13 arm64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 arm64: Verify exact staged platform digest.
  - Stage public web / public web amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda13 / self-hosted cuda13 arm64: Verify exact staged platform digest.
  - Stage public rocm72 / public rocm72 amd64: Verify exact staged platform digest.
  - Stage self-hosted cuda12 / self-hosted cuda12 amd64: Verify exact staged platform digest.
- [Mesh-LLM/mesh-llm 40323522618/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40323522618/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40326120364/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40326120364/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40327054315/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054315/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40327054465/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054465/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40327054468/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40327054468/attempts/1): cancelled.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
