# CI timing history

591 recorded attempts. 3403 separate job cohorts. 20 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
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
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 1054s | 1513s | 43.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 963s | 1447s | 50.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [41050872600/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872600/attempts/1) | cancelled | 208s | 209s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41051207049/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41051207049/attempts/1) | failure | 2691s | 2660s | unknown | 11012747 |
| Mesh-LLM/mesh-llm / PR · Quality | [41053861876/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41053861876/attempts/1) | cancelled | 2580s | 4673s | unknown | 11013945 |
| Mesh-LLM/mesh-llm / PR · Quality | [41059065618/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41059065618/attempts/1) | cancelled | 202s | 202s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41059065692/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41059065692/attempts/1) | cancelled | 1023s | unknown | unknown | 48865512 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41120362847/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41120362847/attempts/1) | failure | 387s | 1158s | unknown | 883826 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41123271184/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/1) | failure | 1008s | 4325s | unknown | 894204 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41123271184/2](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/2) | cancelled | 57s | unknown | 160s | 894204 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41123271184/3](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/3) | success | 609s | 747s | 49s | 894204 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [41127631709/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41127631709/attempts/1) | success | 1029s | 3530s | unknown | 1305513 |
| Mesh-LLM/mesh-llm / PR · Quality | [41202470895/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202470895/attempts/1) | success | 27s | 22s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41202477920/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202477920/attempts/1) | success | 25s | 21s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41202703393/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703393/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [41202703398/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703398/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41202703453/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703453/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41202703552/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703552/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41202703559/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703559/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [41202703606/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703606/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41202703627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703627/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41202703631/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703631/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41302882532/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41302882532/attempts/1) | failure | 32s | 26s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41303004977/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41303004977/attempts/1) | success | 2722s | 3004s | unknown | 11194569 |
| Mesh-LLM/mesh-llm / Main · Windows | [41304966073/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41304966073/attempts/1) | success | 5028s | 10677s | unknown | 1853125687 |
| Mesh-LLM/mesh-llm / Main · Quality | [41304966105/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41304966105/attempts/1) | success | 2593s | 5098s | unknown | 11195411 |
| Mesh-LLM/mesh-llm / Main · Linux | [41304966188/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41304966188/attempts/1) | failure | 4035s | 16769s | unknown | 2756039409 |
| Mesh-LLM/mesh-llm / PR · Windows | [41308699262/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41308699262/attempts/1) | success | 796s | 784s | unknown | 14813777 |
| Mesh-LLM/mesh-llm / PR · macOS | [41308699318/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41308699318/attempts/1) | success | 33s | 28s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41311215061/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41311215061/attempts/1) | cancelled | 144s | 138s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41311215063/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41311215063/attempts/1) | success | 33s | 28s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [41311215094/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41311215094/attempts/1) | success | 27s | 22s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 40874104404/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40874104404/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40875251679/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251679/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40875251709/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251709/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40875251729/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251729/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40875251936/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251936/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40879201037/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40879201037/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40879224721/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40879224721/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41046455548/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41046455548/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41046728846/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41046728846/attempts/1): failure.
  - Quality / Quality / Commit convention: Check commit convention.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41050872457/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872457/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41050872497/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872497/attempts/1): cancelled.
  - Windows / Windows products / Windows product (cpu): Compose immutable Windows product.
- [Mesh-LLM/mesh-llm 41050872600/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872600/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41051207049/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41051207049/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Check CI crate-list drift.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41053861876/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41053861876/attempts/1): cancelled.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41059065618/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41059065618/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41059065692/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41059065692/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm-runner-images 41120362847/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41120362847/attempts/1): failure.
  - Validate public cpu / public cpu amd64: Build platform image once.
  - Validate public rocm72 / public rocm72 amd64: Build platform image once.
  - Validate self-hosted cpu / self-hosted cpu arm64: Build platform image once.
  - Validate public cuda13 / public cuda13 amd64: Build platform image once.
  - Validate public web / public web amd64: Build platform image once.
  - Validate self-hosted cuda12 / self-hosted cuda12 amd64: Build platform image once.
  - Validate self-hosted cuda12 / self-hosted cuda12 arm64: Build platform image once.
  - Validate public rocm70 / public rocm70 amd64: Build platform image once.
  - Validate self-hosted vulkan / self-hosted vulkan amd64: Build platform image once.
  - Validate self-hosted cuda13 / self-hosted cuda13 arm64: Build platform image once.
  - Validate self-hosted cuda13 / self-hosted cuda13 amd64: Build platform image once.
  - Validate public cuda13 / public cuda13 arm64: Build platform image once.
  - Validate self-hosted rocm70 / self-hosted rocm70 amd64: Build platform image once.
  - Validate self-hosted cpu / self-hosted cpu amd64: Build platform image once.
  - Validate self-hosted rocm72 / self-hosted rocm72 amd64: Build platform image once.
  - Validate public ui / public ui amd64: Build platform image once.
  - Validate public cuda12 / public cuda12 amd64: Build platform image once.
  - Validate self-hosted vulkan / self-hosted vulkan arm64: Build platform image once.
  - Validate public vulkan / public vulkan amd64: Build platform image once.
  - Validate public cpu / public cpu arm64: Build platform image once.
  - Validate public vulkan / public vulkan arm64: Build platform image once.
  - Validate public cuda12 / public cuda12 arm64: Build platform image once.
  - Validate public browser / public browser amd64: Build platform image once.
- [Mesh-LLM/mesh-llm-runner-images 41123271184/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/1): failure.
  - Validate self-hosted cpu / self-hosted cpu arm64: Download manifest bundles.
  - Validate self-hosted cpu / self-hosted cpu amd64: Download manifest bundles.
  - Validate self-hosted cuda13 / self-hosted cuda13 amd64: Download manifest bundles.
  - Validate public ui / public ui amd64: Download manifest bundles.
  - Validate self-hosted rocm70 / self-hosted rocm70 amd64: Download manifest bundles.
- [Mesh-LLM/mesh-llm-runner-images 41123271184/2](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/41123271184/attempts/2): cancelled.
  - Validate self-hosted rocm70 / self-hosted rocm70 amd64: Download manifest bundles.
- [Mesh-LLM/mesh-llm 41202703393/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703393/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703398/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703398/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703453/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703453/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703552/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703552/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703559/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703559/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703606/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703606/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703627/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41202703631/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41202703631/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 41302882532/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41302882532/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 41304966188/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41304966188/attempts/1): failure.
  - Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests: Dense OpenAI client compatibility smoke.
  - Linux / CI / Linux: Enforce Linux result.
  - Main / Linux: Enforce Linux result.
- [Mesh-LLM/mesh-llm 41311215061/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41311215061/attempts/1): cancelled.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
