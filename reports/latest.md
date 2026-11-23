# CI timing history

854 recorded attempts. 5071 separate job cohorts. 23 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / CUDA inference smoke / Skippy Inference Smoke Tests | self-hosted | execution | 117s | 192s | 63.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Plan Windows | github-hosted | execution | 12s | 22s | 83.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Quality / CI / Quality | github-hosted | execution | 10s | 15s | 50.0% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios) | github-hosted | execution | 693s | 1380s | 99.1% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK smoke / Swift SDK smoke / swift SDK Smoke | github-hosted | queue | 7s | 9s | 28.6% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | queue | 11s | 102s | 827.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-macabi) | github-hosted | execution | 613s | 1405s | 129.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Plan Linux | github-hosted | execution | 14s | 23s | 64.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / CI / Windows | github-hosted | execution | 9s | 13s | 47.1% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Model download smoke / HuggingFace download smoke | github-hosted | execution | 140s | 177s | 26.4% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-darwin) | github-hosted | execution | 565s | 1296s | 129.4% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Platform checks (windows-log-store) | github-hosted | queue | 2s | 1453s | 72525.0% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Native macOS runtimes / macOS Metal runtime (arm64, metal, .deps/llama-build/build-stage-abi-dynamic-metal, macos-metal, ... | github-hosted | queue | 6s | 10s | 66.7% | 5 / 5 |
| Mesh-LLM/mesh-llm / Linux / Linux product smoke / Core inference smoke / Skippy Inference Smoke Tests | github-hosted | execution | 165s | 248s | 50.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / Windows / Windows checks / Select platform-check runner | github-hosted | execution | 7s | 9s | 21.4% | 6 / 6 |
| Mesh-LLM/mesh-llm / macOS / Metal product smoke / Metal model-load smoke / Skippy Inference Smoke Tests (macOS Metal) | github-hosted | execution | 160s | 241s | 50.6% | 5 / 5 |
| Mesh-LLM/mesh-llm-runner-images / prepare | github-hosted | execution | 24s | 34s | 41.7% | 6 / 6 |
| Mesh-LLM/mesh-llm / Main / Windows | github-hosted | execution | 3s | 4s | 33.3% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Kotlin SDK input / Select protected native SDK runner | github-hosted | execution | 7s | 9s | 28.6% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Swift SDK input / Swift target (aarch64-apple-ios-sim) | github-hosted | execution | 164s | 1437s | 776.2% | 5 / 5 |
| Mesh-LLM/mesh-llm / Windows / Neutral Windows host / Windows host (amd64) | github-hosted | execution | 1054s | 1513s | 43.6% | 6 / 6 |
| Mesh-LLM/mesh-llm / Linux / Rust tests / Rust tests (batch-1) | github-hosted | execution | 940s | 1328s | 41.3% | 7 / 7 |
| Mesh-LLM/mesh-llm / macOS / Neutral macOS host / Select macOS host runner | github-hosted | execution | 6s | 8s | 33.3% | 5 / 5 |
| Mesh-LLM/mesh-llm / macOS / macOS products / Select macOS product runner | github-hosted | queue | 2s | 3s | 50.0% | 5 / 5 |

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-llm / PR · Quality | [44872581207/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44872581207/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44873325688/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873325688/attempts/1) | cancelled | 1699s | 2388s | unknown | 542501 |
| Mesh-LLM/mesh-llm / PR · Windows | [44873520272/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520272/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44873520307/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520307/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44873520453/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520453/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [44873520483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520483/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44873537360/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873537360/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44873589833/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873589833/attempts/1) | success | 35s | 31s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44873696522/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873696522/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44987119277/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119277/attempts/1) | cancelled | 142s | 258s | unknown | 541259 |
| Mesh-LLM/mesh-llm / PR · Windows | [44987119358/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119358/attempts/1) | cancelled | 132s | 126s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44987119409/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119409/attempts/1) | success | 34s | 30s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [44987119510/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119510/attempts/1) | cancelled | 143s | unknown | unknown | 541259 |
| Mesh-LLM/mesh-llm / PR · Windows | [44987122950/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987122950/attempts/1) | cancelled | 150s | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [44987123004/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987123004/attempts/1) | success | 44s | 39s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [44987123005/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987123005/attempts/1) | cancelled | 160s | unknown | unknown | 541259 |
| Mesh-LLM/mesh-llm / PR · Linux | [44987123134/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987123134/attempts/1) | cancelled | 138s | 219s | unknown | 12665305 |
| Mesh-LLM/mesh-llm / PR · Quality | [44987277176/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987277176/attempts/1) | failure | 508s | 734s | unknown | 541259 |
| Mesh-LLM/mesh-llm / PR · Quality | [44987300830/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987300830/attempts/1) | failure | 521s | 739s | unknown | 541259 |
| Mesh-LLM/mesh-llm / PR · Windows | [45085858970/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858970/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45085858983/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858983/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [45085858996/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858996/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [45085859177/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085859177/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45086222074/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086222074/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [45086450447/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450447/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [45086450519/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450519/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [45086450678/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450678/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [45087807005/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45087807005/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [45112330948/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/45112330948/attempts/1) | success | 631s | 4831s | unknown | 1730118 |
| Mesh-LLM/mesh-llm / PR · Quality | [45114290335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45114290335/attempts/1) | failure | 34s | 30s | unknown | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 44685048001/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685048001/attempts/1): failure.
  - Quality / Candidate source consistency: Check release targets and embedded client dependency purity.
  - Quality / Quality / Rust format: Check formatting.
  - Quality / Quality / Rust Clippy (batch-2): Run one Clippy invocation for the batch.
  - Quality / Quality / CI contracts: Test CI, packaging, and SDK contracts.
  - Quality / Quality / Rust Clippy (batch-1): Run one Clippy invocation for the batch.
  - Quality / Quality / Rust Clippy (batch-0): Run one Clippy invocation for the batch.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 44685889808/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44685889808/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44687458627/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44687458627/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44872463516/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44872463516/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44872581207/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44872581207/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44873325688/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873325688/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44873520272/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520272/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44873520307/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520307/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44873520453/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520453/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44873520483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873520483/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44873537360/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873537360/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44873696522/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44873696522/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 44987119277/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119277/attempts/1): cancelled.
  - Quality / Quality / Rust format: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Unused dependency check: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / CI contracts: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
- [Mesh-LLM/mesh-llm 44987119358/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119358/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44987119510/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987119510/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44987122950/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987122950/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 44987123005/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987123005/attempts/1): cancelled.
  - Quality / Quality / CI contracts: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust Clippy (batch-0): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / Quality / Unused dependency check: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust format: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust Clippy (batch-1): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
- [Mesh-LLM/mesh-llm 44987123134/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987123134/attempts/1): cancelled.
  - Linux / Console artifact / Build immutable console UI: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
- [Mesh-LLM/mesh-llm 44987277176/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987277176/attempts/1): failure.
  - Quality / Quality / Rust format: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / CI contracts: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust Clippy (batch-2): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / Quality / Rust Clippy (batch-1): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / Quality / Unused dependency check: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust Clippy (batch-0): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 44987300830/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/44987300830/attempts/1): failure.
  - Quality / Quality / CI contracts: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Unused dependency check: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust format: Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16.
  - Quality / Quality / Rust Clippy (batch-2): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / Quality / Rust Clippy (batch-0): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / Quality / Rust Clippy (batch-1): Run Mesh-LLM/mesh-llm/.github/actions/audit-depot-pr-isolation@ed07043b84d720aab30e75ed2f038f7042576f16, Capture Clippy cache evidence.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 45085858970/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858970/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45085858983/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858983/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45085858996/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085858996/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45085859177/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45085859177/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086222074/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086222074/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086450447/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450447/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086450519/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450519/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45086450678/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45086450678/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45087807005/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45087807005/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 45114290335/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/45114290335/attempts/1): failure.
  - Plan quality: Build canonical plan.
  - PR / Quality: Enforce quality result.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
