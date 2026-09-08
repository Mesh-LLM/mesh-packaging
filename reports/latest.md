# CI timing history

6 recorded attempts. 3 separate job cohorts. 0 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |

No supported regression signal. Cohorts with insufficient samples are still listed in reports/latest.json.

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [33241487554/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/33241487554/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [34187922125/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34187922125/attempts/1) | success | 135s | 133s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [34188260088/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34188260088/attempts/1) | success | 142s | 128s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [34188260694/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34188260694/attempts/1) | success | 133s | 130s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [34188462352/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34188462352/attempts/1) | success | 122s | 120s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [33241487554/2](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/33241487554/attempts/2) | success | 71s | 66s | 856068s | 0 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-packaging 33241487554/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/33241487554/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
