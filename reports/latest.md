# CI timing history

50 recorded attempts. 535 separate job cohorts. 0 cohorts have a regression signal.

Signals require at least 5 known samples in each window and a 20% median increase. Queue and execution are evaluated separately. These are observations across different commits, not proof of a cause.

Runner provider and backend dimensions come from labels and job names. Unknown values remain null in JSON. Provider cohorts are never combined. No routing or provider settings are changed.

## Regression signals

| Repository / job | Provider | Metric | Baseline median | Recent median | Change | Samples |
| --- | --- | --- | ---: | ---: | ---: | ---: |

No supported regression signal. Cohorts with insufficient samples are still listed in reports/latest.json.

## Recent attempts

| Repository / workflow | Attempt | Result | Attempt elapsed | Job execution sum | Rerun delay | Observed run artifact bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [34188462352/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34188462352/attempts/1) | success | 122s | 120s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [33241487554/2](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/33241487554/attempts/2) | success | 71s | 66s | 856068s | 0 |
| Mesh-LLM/mesh-packaging / Packaging Precheck | [34191247200/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34191247200/attempts/1) | success | 147s | 143s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [34215039821/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34215039821/attempts/1) | success | 460s | 456s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [34215039875/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34215039875/attempts/1) | success | 2991s | 13689s | unknown | 1028809639 |
| Mesh-LLM/mesh-llm / PR · macOS | [34215039966/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34215039966/attempts/1) | success | 2400s | 4625s | unknown | 281376113 |
| Mesh-LLM/mesh-llm / PR · Quality | [34215046142/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34215046142/attempts/1) | success | 560s | 1648s | unknown | 1168 |
| Mesh-LLM/mesh-llm / PR · Linux | [34215046475/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34215046475/attempts/1) | success | 2983s | 13938s | unknown | 1028849252 |
| Mesh-LLM/mesh-llm / PR · macOS | [34215046557/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34215046557/attempts/1) | success | 2114s | 5233s | unknown | 281347412 |
| Mesh-LLM/mesh-llm / Main · Quality | [34219607773/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34219607773/attempts/1) | success | 284s | 996s | unknown | 1168 |
| Mesh-LLM/mesh-llm / PR · Windows | [34220249987/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220249987/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [34220250007/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220250007/attempts/1) | action_required | unknown | unknown | unknown | 1235 |
| Mesh-LLM/mesh-llm / PR · macOS | [34220250553/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220250553/attempts/1) | action_required | unknown | unknown | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Windows | [34220249987/2](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220249987/attempts/2) | success | 49s | 43s | 5s | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [34220250007/2](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220250007/attempts/2) | success | 488s | 1216s | 5s | 1235 |
| Mesh-LLM/mesh-llm / PR · macOS | [34220250553/2](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220250553/attempts/2) | success | 50s | 42s | 4s | 0 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [34256062098/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/34256062098/attempts/1) | success | 528s | 6691s | unknown | 1111736 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [34257309100/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/34257309100/attempts/1) | success | 423s | 413s | unknown | 91634 |
| Mesh-LLM/mesh-llm-runner-images / Build and Push Runner Images | [34257492652/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/34257492652/attempts/1) | success | 700s | 446s | unknown | 91178 |
| Mesh-LLM/mesh-llm / PR · macOS | [34340918626/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34340918626/attempts/1) | success | 56s | 50s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Linux | [34340918677/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34340918677/attempts/1) | success | 1145s | 4611s | unknown | 134600439 |
| Mesh-LLM/mesh-llm / Main · Quality | [34342640323/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342640323/attempts/1) | success | 285s | 962s | unknown | 1167 |
| Mesh-LLM/mesh-llm / Main · Windows | [34342640528/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342640528/attempts/1) | success | 1492s | 4160s | unknown | 1666961314 |
| Mesh-LLM/mesh-llm / Main · Linux | [34342640792/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342640792/attempts/1) | success | 1323s | 8142s | unknown | 1029093091 |
| Mesh-LLM/mesh-llm / PR · Windows | [34342903574/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342903574/attempts/1) | success | 52s | 47s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [34342903873/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342903873/attempts/1) | success | 259s | 620s | unknown | 1167 |
| Mesh-LLM/mesh-llm / PR · Linux | [34342904041/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342904041/attempts/1) | success | 1131s | 4157s | unknown | 134600582 |
| Mesh-LLM/mesh-llm / PR · macOS | [34342904317/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34342904317/attempts/1) | success | 50s | 45s | unknown | 0 |
| Mesh-LLM/mesh-llm / PR · Quality | [34345352483/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34345352483/attempts/1) | success | 485s | 480s | unknown | 0 |
| Mesh-LLM/mesh-packaging / Mesh LLM Packaging Release | [34451956724/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34451956724/attempts/1) | success | 1012s | 3955s | unknown | 7932115518 |

Job execution sums include overlapping jobs and are not wall-clock durations. Artifact bytes preserve unique IDs ever observed for the whole run, including artifacts no longer listed by GitHub, and must not be summed across rerun attempts. Reused successful jobs are excluded from rerun execution. Attempt elapsed includes queueing and gaps between jobs.

## Recent failures and cancellations

- [Mesh-LLM/mesh-packaging 33241487554/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/33241487554/attempts/1): action_required.
- [Mesh-LLM/mesh-llm-runner-images 34183319275/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/34183319275/attempts/1): cancelled.
  - Validate public ui / public ui amd64: Build platform image once.
  - Validate public browser / public browser amd64: Build platform image once.
- [Mesh-LLM/mesh-packaging 34185447880/1](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/34185447880/attempts/1): failure.
  - Package and image ubuntu-cuda-12.9.2-arm64 / Build and test local final image: Build the final runtime image once.
  - Package and image ubuntu-cuda-12.9.2-amd64 / Build and test local final image: Build the final runtime image once.
  - Packaging readiness manifest: Record and enforce required results.
- [Mesh-LLM/mesh-llm-runner-images 34186269379/1](https://github.com/Mesh-LLM/mesh-llm-runner-images/actions/runs/34186269379/attempts/1): cancelled.
- [Mesh-LLM/mesh-llm 34220249987/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220249987/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 34220250007/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220250007/attempts/1): action_required.
- [Mesh-LLM/mesh-llm 34220250553/1](https://github.com/Mesh-LLM/mesh-llm/actions/runs/34220250553/attempts/1): action_required.

## Optional runner image producer evidence

0 locally imported receipts. These are producer assertions with validated local bindings, not authenticated provenance or runtime re-execution. Missing receipts and null measurements remain unknown.

Wrapper elapsed measures orchestration time; Actions execution timing remains separate. Context content is an enumerated estimate, not transfer bytes. OCI layer totals count descriptor occurrences for one platform, not pull savings. Cached operations or vertices are scoped observations without a denominator, hit rate, or saved-time claim.

| Run / attempt | Family / platform | Role / outcome | Wrapper seconds | Context bytes / files | Layer descriptor bytes | Cache evidence |
| --- | --- | --- | ---: | --- | ---: | --- |
