# CI timing history

`CI metrics history` keeps GitHub run, job, step, and artifact metadata in the
`ci-metrics` branch. The branch contains JSON records and generated reports, so
artifact expiry does not erase collected history. Source code stays on `main`.
The workflow starts writing records after it is merged and enabled; local
validation does not create the branch or publish anything.

The collector makes read-only GitHub API requests for an explicit repository and
workflow allowlist in `scripts/ci-metrics-model.ts`. It supports this repository,
the MeshLLM release and platform CI workflows, and `Build and Push Runner Images`
in `Mesh-LLM/mesh-llm-runner-images`. It never dispatches builds,
changes runner placement, switches providers, or edits secrets and variables.
In particular, queue incidents do not justify moving AMD64 CUDA compilation off
the existing ARC runners. Compare compilation time and queue delay separately.

## Collection

Completed `Mesh LLM Packaging Release` and `Packaging Precheck` runs trigger an
immediate collection. The daily reconciliation covers all three repositories. Manual
runs can collect one run and all its attempts, or backfill a date range.

```sh
node --experimental-strip-types scripts/ci-metrics.ts collect \
  --repository Mesh-LLM/mesh-packaging \
  --run-id 31355832185 \
  --output /tmp/mesh-ci-metrics

node --experimental-strip-types scripts/ci-metrics.ts collect \
  --repository Mesh-LLM/mesh-llm \
  --since 2026-09-01 --until 2026-09-07 --max-runs 10 \
  --output /tmp/mesh-ci-metrics

node --experimental-strip-types scripts/ci-metrics.ts report \
  --output /tmp/mesh-ci-metrics
```

Use Node 24 or newer and an authenticated `gh` CLI. The scheduled job uses its
repository token. Companion repository collection reads public GitHub metadata;
it does not need or request a token with write access to MeshLLM.

The defaults are a 14-day creation-date window and at most 10 collected runs per
repository. Discovery examines the latest 100 completed runs per allowlisted
workflow within that window and prioritizes attempts missing from the store.
This recovers missed `workflow_run` events and makes successive bounded backfills
advance. After missing attempts are covered, recent records are refreshed.
An exact run ID bypasses the creation-date window.

Each invocation has a 300-request budget, configurable up to 1,000 with
`--max-requests`. A run can have at most 20 attempts; jobs and artifacts are each
limited to 1,000 API items per attempt or run. Exceeding a bound or encountering
an API error fails the collection visibly instead of writing a truncated total.
The workflow publishes only after collection and report generation both succeed.
Narrow the date range or select exact runs when a large backfill reaches a bound.

GitHub can replace pending runs in a concurrency group. Reconciliation is
therefore part of collection, not a substitute for reviewing failures. An older
rerun whose source run falls outside the date window, or a burst exceeding the
100-runs-per-workflow discovery bound, needs an explicit date window or run ID.
No claim of complete historical coverage is made before those gaps are filled.

## Record schema

Records use schema version 1 and live at:

```text
records/Mesh-LLM__mesh-packaging/2026-08/31355832185-1.json
records/Mesh-LLM__mesh-llm/2026-09/33549875856-1.json
records/Mesh-LLM__mesh-llm/2026-09/33549875856-2.json
reports/latest.json
reports/latest.md
```

The identity is `repository`, `run_id`, and `run_attempt`. The record keeps the
workflow name/path, event, source branch/SHA, status, conclusion, and API
timestamps. Canonical JSON and stable ordering avoid duplicate records for an
unchanged observation.

The month directory follows the attempt endpoint's `created_at`. GitHub gives
rerun attempts their own creation time, while the latest run endpoint retains
the original run creation time. Historical artifact retention validates each
stored attempt against its matching endpoint, including reruns in another month.

Each job retains its ID, name, actual runner labels/name/group, timestamps,
conclusion, and step list. Provider is derived from labels and recorded with that
source: `depot`, `self-hosted`, `github-hosted`, or `null`. Backend, backend version,
architecture, and packaging row are inferred only when the job name or labels
identify them. They carry `source: job_name_and_runner_labels`; these are not
claims about unreported workflow inputs or machine hardware.

Runner-image jobs also retain `image_environment` and `image_backend_id` from
explicit job names, such as `Stage public cuda13 / public cuda13 arm64`.
Compact IDs identify the backend family but do not establish the full toolkit
version: `rocm72` leaves `backend_version` null rather than asserting 7.2.3.
The image environment is separate from the execution provider. A `self-hosted`
image can be built by a GitHub-hosted job. Conflicting family names remain
unclassified, and these fields are included in comparison cohorts.
The additive public AMD64 `ui` and `browser` families retain their own IDs;
neither is grouped with the existing full `web` family.

Recognized steps also get a phase label: `artifact_upload`, `artifact_download`,
`container_setup`, `package_build`, `package_qa`, `image_build`,
`image_pull_and_qa`, or `compose`. The original step name remains available.
Steps that combine work, such as image pull and QA, remain combined. Existing
Depot phase receipts and build IDs can support more detailed investigation, but
the collector does not download or execute source-run artifacts. Historical
collection still works when those artifacts have expired.
Named console, product, Node addon, and Swift artifact uploads and release/Swift
downloads also receive transfer phases. Combined download/verification/rendering
steps keep their original names and timing without a transfer-only phase.

Runner-image steps additionally distinguish `image_verification`,
`image_index_and_qa`, and `image_promotion`. Verification includes the remote
verification build, and index assembly and validation remain one phase because
the workflow measures them together. Post-action cleanup has no build phase
label; its raw timing is still retained. These classifications were checked
against runner-image run `34106281467` and its 54 jobs.

Timing fields have distinct meanings:

| Field | Meaning |
| --- | --- |
| Job `queue_seconds` | Job creation to start as reported by GitHub. It can include scheduling constraints and is not proof of runner capacity pressure. |
| Job/step `execution_seconds` | Start to completion. |
| `attempt_elapsed_seconds` | Attempt start to the last executed job's completion, including waits and gaps. |
| `execution_span_seconds` | First executed job's start to last completion, including overlaps and gaps. |
| `first_job_delay_seconds` | Attempt start to first executed job's start. |
| `job_execution_seconds` | Sum of executed job durations. Parallel work overlaps, so this is not elapsed time or a billing estimate. |
| `rerun_delay_seconds` | Previous attempt's reported update time to the next attempt's start. Kept separate from execution. |

The collector calls the attempt-specific run and jobs endpoints. GitHub can repeat
successful jobs in a later attempt with new job IDs and creation timestamps but
old execution timestamps. Those jobs have `reused_from_previous_attempt: true`;
their queue/step/job durations are null and they do not enter rerun totals or
comparison cohorts. Failed earlier attempts remain separate records.

Artifact metadata includes name, size, expiry state and dates. GitHub exposes
these at run scope, so `artifacts.scope` is `run_not_attempt`. Refreshes merge
previous observations by immutable artifact ID. Metadata and known byte counts
survive even when GitHub stops listing a deleted or expired artifact.
`items[].listed_in_latest_response` distinguishes currently listed artifacts
from historical entries. Expiry state for an absent entry is the last observed
state, not a claim that GitHub still holds its bytes.

`artifacts.bytes` counts every unique artifact ID observed for this run, and
`aggregation` is `cumulative_observed_artifact_ids`. `currently_listed_bytes`
describes only the latest API response. A verified empty response therefore has
zero currently listed bytes while historical bytes remain available. Missing
sizes leave the corresponding total null. Retained records must match the
repository, run/attempt, source SHA, workflow identity and creation timestamp;
conflicting immutable artifact metadata fails collection.

Every attempt carries the same run-scoped artifact history. IDs are deduplicated
within each total. Do not add those totals across attempts or treat compressed
artifact bytes as measured network transfers. Artifacts deleted before any
collection cannot be recovered from GitHub. Unknown timestamps, providers and
durations remain null.

## Comparisons

The report separates repository, workflow, event, source branch, normalized job
name, backend/version, architecture, packaging row, provider, runner labels/group,
job conclusion, and first attempts from reruns. Toolkit versions stay distinct.
Release version text alone is normalized in job names.

Each cohort compares adjacent, non-overlapping windows of up to 10 runs, with at
least five known measurements in each window. Reruns of one run supply at most
one observation to a rerun cohort. Five baseline and five candidate samples can
produce a comparison before 20 samples exist. Queue and execution have separate
sample counts, medians, p95 values, and regression signals. A median increase of
20% is a signal; missing samples or a zero baseline produce no percentage claim.
The limits can be changed with `--min-samples`, `--window`, and
`--regression-percent`.

Cohorts with unknown provider, missing runner labels, missing workflow identity,
or unnamed jobs cannot produce comparison signals. Multiple jobs with the same
cohort identity in one attempt are excluded as ambiguous. The raw observations
remain in the records for inspection.

Signals point to observations for review. They do not prove a code change caused
the difference, and they never trigger a provider change or rollback. Different
source commits, cache warmth, runner contention and external package registries
can still affect an otherwise comparable cohort. The JSON includes the source
run links and selected samples so those factors can be checked.

## Persistence and permissions

The workflow checks out the trusted default branch, even when collecting a pull
request run. It reads source-run metadata only. Names from job metadata are data,
not commands. Manual dispatch is also restricted to the default branch.

The collector job has `actions: read` and `contents: write` for this repository.
Writes are serialized with cancellation disabled. The data checkout never
supplies executable code. Only `records/` and `reports/` are staged, and a normal
non-force push rejects an external branch race. No release, image, package, or
provider credentials are required. A new collection failure appears as a failed
metrics workflow; it does not change the source run's result.

## Validation

```sh
node --experimental-strip-types --test tests/ci-metrics.test.ts
actionlint .github/workflows/ci-metrics.yml
```

Fixtures cover pagination limits, missing values, expired and deleted artifact
refreshes, idempotent history retention, source identity conflicts, reused
rerun jobs, failed attempts, input allowlists, provider separation, minimum
samples, independent queue/execution signals, deterministic storage and trusted
workflow execution. Live read-only validation can target the August 10 packaging
release and September 1 MeshLLM rerun using temporary output directories.

## Optional offline runner image evidence

Import finalized runner-image bundles explicitly after collecting their exact
Actions attempts:

```sh
node --experimental-strip-types scripts/ci-metrics.ts enrich \
  --output /absolute/path/to/history \
  --receipts /absolute/path/to/bundles
```

Each direct child of the receipts directory is one immutable invocation bundle
with `receipt.json`, optional `identity.json`, and one optional `cache.jsonl` or
`cache.log`. The command performs no network requests, subprocess execution,
artifact downloads, registry access, or remote history writes. It accepts at most
256 bundles and 64 MiB of total input. Unknown files, symlinks inside the roots,
invalid evidence, and duplicate invocation keys fail the entire validation pass.
All bundles and affected stored records are validated before writes start. Each
changed history file uses atomic replacement; multiple files are not a single
transaction.

Receipts must match repository, run, attempt, workflow path, and triggering head
SHA exactly. Existing job dimensions supply family and architecture. Each role
must match one executed, non-reused job with the corresponding build or verification
phase. An explicitly skipped receipt instead matches a skipped role step within
an executed, non-reused job. Its invocation IDs, wrapper timing, binding and cache
evidence must be null. Skipped verification also requires null context; skipped
production may retain a separately enumerated context estimate. Actual checked-out source revisions are producer assertions; they can differ
from the triggering head. Receipts for both roles must agree on those assertions.
Verification imports require the exact hashed identity sidecar and matching
platform, source, OCI descriptors, and layers. The importer validates recorded
bindings; it does not repeat runtime verification or authenticate provenance.

Optional `enrichment.runner_images` remains within schema version 1. A repeated
receipt with the same exact-byte hash is a no-op. A changed hash for an existing
invocation is an immutable conflict, including a replacement of null measurements.
Finalize bundles once. Raw collector refreshes preserve structurally validated
stored enrichment only for that exact attempt, without requiring or downloading
its sidecars. Existing records without enrichment stay valid.

Reports keep producer evidence separate from Actions timing. Wrapper elapsed is
orchestration-clock time. Depot execution and context transfer time are unknown.
Context bytes and file count describe enumerated content, not protocol transfer.
Layer descriptor totals count each manifest occurrence for one runnable platform,
including repeated digests; they do not measure pull savings or filesystem size.
Null means unknown, while zero remains a measured zero.

Cache evidence is optional and bound to the producer's invocation IDs. Qualified
BuildKit raw-JSON envelopes retain cached vertex digests in `cache.jsonl`. Plain
progress in `cache.log` retains only cached RUN/COPY/ADD operation IDs whose
operation definition preceded an exact CACHED terminal. Both retain byte hash,
byte count, and nonempty line count. These are producer-asserted observations with
no denominator, cache hit rate, saved-time estimate, or authenticated association.
Raw logs and identity bytes are not copied into shared history. Persisted receipts
retain their validated hash references.

Toolkit policy and runtime tool validation belong to the producer's binder. The
consumer checks the recorded family structure and normalized backend but does not
infer an exact toolkit version from compact job family IDs or repeat policy checks.

Cache line bounds and event counts accept LF, CRLF, or CR line endings. Hashes and
byte counts always cover the exact original bytes, including line endings.
