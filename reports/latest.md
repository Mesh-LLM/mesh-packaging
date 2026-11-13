# CI timing history

734 recorded attempts. 4100 separate job cohorts. 23 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Plan Windows | github-hosted | execution | 12s | 22s | 83.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Quality / CI / Quality | github-hosted | execution | 11s | 14s | 28.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 11s | 102s | 827.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | execution | 9s | 13s | 47.1% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Model download smoke / HuggingFace download smoke | github-hosted | execution | 140s | 177s | 26.4% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 565s | 1296s | 129.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 2s | 1453s | 72525.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 10s | 66.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 248s | 50.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Select platform-check runner | github-hosted | execution | 7s | 9s | 21.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 160s | 241s | 50.6% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 24s | 31s | 29.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 1054s | 1513s | 43.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 963s | 1447s | 50.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Plan quality | github-hosted | execution | 13s | 18s | 38.5% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [42965907235/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907235/attempts/1) | success | 30s | 26s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [42965907373/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907373/attempts/1) | success | 29s | 25s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [42965907404/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907404/attempts/1) | success | 26s | 22s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [42965907443/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907443/attempts/1) | success | 692s | 688s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [42965993828/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965993828/attempts/1) | success | 29s | 25s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [43163655460/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43163655460/attempts/1) | cancelled | 378s | 377s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43163821856/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43163821856/attempts/1) | cancelled | 286s | 284s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43164338554/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338554/attempts/1) | cancelled | 102s | 101s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [43164338638/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338638/attempts/1) | cancelled | 360s | 358s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [43164338676/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338676/attempts/1) | cancelled | 360s | 358s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43164338906/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338906/attempts/1) | cancelled | 360s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43164522747/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164522747/attempts/1) | cancelled | 269s | 268s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [43164975045/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164975045/attempts/1) | success | 1237s | 25s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43164975191/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164975191/attempts/1) | success | 1265s | 29s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [43164975220/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164975220/attempts/1) | success | 1163s | 26s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [43252065932/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43252065932/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43376689620/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43376689620/attempts/1) | success | 43s | 38s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43377635179/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43377635179/attempts/1) | success | 37s | 33s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43377879839/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43377879839/attempts/1) | success | 51s | 33s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43377879844/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43377879844/attempts/1) | cancelled | 16s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [43378062132/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378062132/attempts/1) | success | 44s | 40s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43378062179/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378062179/attempts/1) | success | 39s | 34s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [43378062325/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378062325/attempts/1) | success | 35s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [43378062354/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378062354/attempts/1) | success | 34s | 29s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43378468414/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378468414/attempts/1) | success | 39s | 35s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [43378572191/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378572191/attempts/1) | cancelled | 210s | unknown | unknown | 541384 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [43391116204/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43391116204/attempts/1) | success | 166s | 163s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [43391848134/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43391848134/attempts/1) | failure | 47s | 45s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [43391892581/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43391892581/attempts/1) | success | 162s | 160s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [43392153255/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43392153255/attempts/1) | success | 151s | 149s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 42340546971/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42340546971/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454723111/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454723111/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454729055/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454729055/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454729062/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454729062/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454729090/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454729090/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454729100/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454729100/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454737961/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454737961/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42454978521/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454978521/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42455214802/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42455214802/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 42455214854/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42455214854/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 42455214858/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42455214858/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 42570053270/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570053270/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42570516758/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570516758/attempts/1): failure.
  - Windows / Product windows x64 automation / Product automation (windows-x64): Produce immutable product-source automation, Post Produce immutable product-source automation.
  - Windows / Protected windows x64 automation / Protected automation (windows-x64): Produce immutable protected automation, Post Produce immutable protected automation.
  - Windows / CI / Windows: Enforce Windows result.
  - Main / Windows: Enforce Windows result.
- [Mesh-LLM/mesh-llm 42570516777/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570516777/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Run mozilla-actions/sccache-action@fc920bf0ec8de6ee65d409111f7ec508035751ba, Post Run mozilla-actions/sccache-action@fc920bf0ec8de6ee65d409111f7ec508035751ba.
  - Quality / CI / Quality: Enforce quality result.
  - Main / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 42570618409/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570618409/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42572435537/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42572435537/attempts/1): failure.
  - Quality / Quality / Rust Clippy (batch-0): Run one Clippy invocation for the batch.
  - Quality / Quality / CI contracts and consistency: Test CI, packaging, and SDK contracts.
  - Quality / Quality / Rust Clippy (batch-2): Run one Clippy invocation for the batch.
  - Quality / Quality / Rust Clippy (batch-1): Run one Clippy invocation for the batch.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 42572767839/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42572767839/attempts/1): failure.
  - Plan Linux: Install repository build accelerator, Post Install repository build accelerator.
  - PR / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 42572767847/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42572767847/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42965373279/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965373279/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43163655460/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43163655460/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43163821856/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43163821856/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43164338554/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338554/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43164338638/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338638/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43164338676/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338676/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43164338906/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164338906/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43164522747/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43164522747/attempts/1): cancelled.
- [Mesh-LLM/mesh-packaging 43252065932/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43252065932/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 43377879844/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43377879844/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 43378572191/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/43378572191/attempts/1): cancelled.
- [Mesh-LLM/mesh-packaging 43391848134/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/43391848134/attempts/1): failure.
  - validate: Lint shell scripts.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
