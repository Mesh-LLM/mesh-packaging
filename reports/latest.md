# CI timing history

566 recorded attempts. 3289 separate job cohorts. 17 cohorts have a regression signal.

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
| Mesh-LLM/mesh-llm / PR · Linux | [40680935285/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40680935285/attempts/1) | success | 3350s | 9193s | unknown | 603283200 |
| Mesh-LLM/mesh-llm / PR · macOS | [40680935350/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40680935350/attempts/1) | success | 42s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40680935386/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40680935386/attempts/1) | cancelled | 229s | 200s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [40680935565/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40680935565/attempts/1) | success | 2378s | 2311s | unknown | 14552621 |
| Mesh-LLM/mesh-llm / PR · Quality | [40681299270/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40681299270/attempts/1) | success | 2506s | 3448s | unknown | 10996800 |
| Mesh-LLM/mesh-llm / PR · Quality | [40689122017/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122017/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40689122039/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122039/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [40689122284/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122284/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [40689122405/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122405/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40689558569/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689558569/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [40873628373/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40873628373/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40873663739/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40873663739/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40874104404/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40874104404/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40875251679/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251679/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [40875251709/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251709/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [40875251729/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251729/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40875251936/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40875251936/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40879201037/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40879201037/attempts/1) | cancelled | 13s | 11s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · macOS | [40879201094/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40879201094/attempts/1) | success | 45s | 36s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [40879224721/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40879224721/attempts/1) | cancelled | 238s | 228s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41046455548/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41046455548/attempts/1) | cancelled | 149s | 126s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41046728846/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41046728846/attempts/1) | failure | 2613s | 2600s | unknown | 11012747 |
| Mesh-LLM/mesh-llm / PR · Linux | [41050872457/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872457/attempts/1) | cancelled | 3648s | unknown | unknown | 1454848853 |
| Mesh-LLM/mesh-llm / PR · Windows | [41050872497/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872497/attempts/1) | cancelled | 4037s | unknown | unknown | 845767083 |
| Mesh-LLM/mesh-llm / PR · macOS | [41050872533/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872533/attempts/1) | success | 2892s | 8614s | unknown | 403649916 |
| Mesh-LLM/mesh-llm / PR · Quality | [41050872600/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41050872600/attempts/1) | cancelled | 208s | 209s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [41051207049/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41051207049/attempts/1) | failure | 2691s | 2660s | unknown | 11012747 |
| Mesh-LLM/mesh-llm / PR · Quality | [41053861876/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41053861876/attempts/1) | cancelled | 2580s | 4673s | unknown | 11013945 |
| Mesh-LLM/mesh-llm / PR · Quality | [41059065618/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41059065618/attempts/1) | cancelled | 202s | 202s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [41059065692/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/41059065692/attempts/1) | cancelled | 1023s | unknown | unknown | 48865512 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-llm 40490764100/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40490764100/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40493697623/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40493697623/attempts/1): failure.
  - Quality / Quality / Rust format: Check formatting.
  - Quality / CI / Quality: Enforce quality result.
  - PR / Quality: Enforce quality result.
- [Mesh-LLM/mesh-llm 40493697962/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40493697962/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40493697997/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40493697997/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40493698108/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40493698108/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40497462799/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40497462799/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40680935386/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40680935386/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 40689122017/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122017/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40689122039/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122039/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40689122284/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122284/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40689122405/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689122405/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40689558569/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40689558569/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40873628373/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40873628373/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 40873663739/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/40873663739/attempts/1): action_required.
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

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
