# CI timing history

709 recorded attempts. 4056 separate job cohorts. 23 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / PR · Quality | [42454978521/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42454978521/attempts/1) | cancelled | 103s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [42455214802/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42455214802/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [42455214854/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42455214854/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [42455214858/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42455214858/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [42533880076/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/42533880076/attempts/1) | success | 323s | 2551s | unknown | 957413 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [42534357033/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/42534357033/attempts/1) | success | 536s | 6251s | unknown | 1379319 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [42535175737/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/42535175737/attempts/1) | success | 421s | 414s | unknown | 94509 |
| Mesh-LLM/mesh-llm / PR · Quality | [42570053270/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570053270/attempts/1) | cancelled | 118s | 101s | unknown | 0 |
| Mesh-LLM/mesh-llm / Main · Windows | [42570516758/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570516758/attempts/1) | failure | 619s | 739s | unknown | 14999487 |
| Mesh-LLM/mesh-llm / Main · Quality | [42570516777/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570516777/attempts/1) | failure | 1376s | 3148s | unknown | 11384120 |
| Mesh-LLM/mesh-llm / PR · Quality | [42570618409/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570618409/attempts/1) | cancelled | 99s | 90s | unknown | 11432468 |
| Mesh-LLM/mesh-llm / PR · macOS | [42570618415/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570618415/attempts/1) | success | 29s | 24s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [42570625944/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570625944/attempts/1) | success | 30s | 26s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [42570628770/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570628770/attempts/1) | success | 35s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [42570618409/2](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42570618409/attempts/2) | success | 2052s | 2656s | 151s | 11432468 |
| Mesh-LLM/mesh-llm / PR · Quality | [42572435537/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42572435537/attempts/1) | failure | 1231s | 2600s | unknown | 11384121 |
| Mesh-LLM/mesh-llm / PR · Linux | [42572767839/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42572767839/attempts/1) | failure | 68s | 63s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [42572767847/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42572767847/attempts/1) | cancelled | 229s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [42622394214/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/42622394214/attempts/1) | success | 1228s | 8403s | unknown | 1382381 |
| Mesh-LLM/mesh-packaging / Packaging · refs/heads/main | [42910686420/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/42910686420/attempts/1) | success | 1119s | 4912s | unknown | 13161388130 |
| Mesh-LLM/mesh-llm / PR · macOS | [42965342255/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965342255/attempts/1) | success | 34s | 29s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [42965342370/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965342370/attempts/1) | success | 2553s | 4224s | unknown | 608694054 |
| Mesh-LLM/mesh-llm / PR · Windows | [42965342378/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965342378/attempts/1) | success | 871s | 857s | unknown | 14003224 |
| Mesh-LLM/mesh-llm / PR · Quality | [42965373279/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965373279/attempts/1) | cancelled | 259s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [42965808460/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965808460/attempts/1) | success | 2797s | 3689s | unknown | 11475345 |
| Mesh-LLM/mesh-llm / PR · Quality | [42965907235/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907235/attempts/1) | success | 30s | 26s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [42965907373/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907373/attempts/1) | success | 29s | 25s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [42965907404/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907404/attempts/1) | success | 26s | 22s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [42965907443/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965907443/attempts/1) | success | 692s | 688s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [42965993828/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42965993828/attempts/1) | success | 29s | 25s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 41969596322/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41969596322/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41969596477/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41969596477/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41969596606/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41969596606/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41969596617/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41969596617/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 41969635877/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41969635877/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Test CI, packaging, and SDK contracts.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 42168240246/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42168240246/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42168861863/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42168861863/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42169027176/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42169027176/attempts/1): failure.
  - Quality / Quality / CI contracts and consistency: Test CI, packaging, and SDK contracts.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 42171121093/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42171121093/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42338934348/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42338934348/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 42340432335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/42340432335/attempts/1): cancelled.
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

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
