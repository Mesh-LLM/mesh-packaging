# Efficiency and runner capacity

Orchestration normally uses GitHub-hosted runners: `ubuntu-24.04` on amd64,
`ubuntu-24.04-arm` on arm64, and `macos-15` for Homebrew. The optional registry
mirror gate selects pre-authenticated Depot runners for eligible main package
and image rows. All package/image builds use remote Depot BuildKit; runner
placement and the remote builder are separate measurements.

The full active matrix has 11 Linux package/image rows but only 8 unique Linux
product archives. Archive, host digest, runtime digest, and product-manifest
verification are deduplicated before distro fan-out. Host compilation, UI
generation, and native-runtime builds happen only in upstream MeshLLM,
eliminating the largest former cost and drift source.

Use `native_selector` with exact artifact IDs for review iteration. A production
dry run should still exercise every active row because rolling Arch dependencies
and vendor runtime bases can drift independently even when the upstream binary
is unchanged. Stable package-tooling layers are shared per distro/architecture. Runtime
dependency layers additionally distinguish backend and backend version. Dry runs build and load
one final image for external QA without registry writes; publishing runs push
one staging image and reuse its exact tested digest during promotion.

The expected cost order is CPU < Vulkan < CUDA < ROCm, driven here by
QA/runtime-base download and package installation rather than compilation. All
rows run neutral-host command smoke without a device; optional hardware
qualification belongs on controlled GPU runners and does not replace the
hosted no-device gate. The ROCm row deliberately uses
`rocm/dev-ubuntu-24.04:7.0`; its `complete` sibling is more than 5 GB compressed
and exhausts a standard hosted runner during extraction. The first complete
v0.73.1 static-host dry run finished all 35 jobs in 9m57s; keep it as historical
data and record a new product-v2 baseline before setting current budgets.

## Depot tuning boundary

This repository assembles and verifies upstream product archives; it is not the
owner of the Depot runner-size experiment. The companion runner-images benchmark
record (`../../mesh-llm-runner-images/docs/CI_BENCHMARKS.md`, not modified here)
contains three matched 20-row warm-cache control/candidate pairs. Depot was
slower on wall time and native runner time in all three pairs:

| Pair | Wall time | Active time | Native runner time | Build-action time | Candidate cost estimate |
|---|---:|---:|---:|---:|---:|
| 1 | 187s → 246s (+31.6%) | 890s → 1371s (+54.0%) | 863s → 1329s (+54.0%) | 675s → 688s (+1.9%) | $0.7132 |
| 2 | 125s → 141s (+12.8%) | 750s → 1147s (+52.9%) | 724s → 1101s (+52.1%) | 518s → 473s (-8.7%) | $0.5921 |
| 3 | 153s → 165s (+7.8%) | 562s → 1298s (+131.0%) | 534s → 1253s (+134.6%) | 358s → 579s (+61.7%) | $0.6731 |

The paired logs reported `CACHED` step counts of 414/434, 431/493, and
470/492 (14–32 cached layers per run). Those counts have no stable total-layer
denominator and are not a Depot cache-hit rate, so this record does not infer
one.

The median effect was +16s (+12.8%) wall time, +481s (+54.0%) active
time, and +466s (+54.0%) native runner time; build-action time was +13s
(+1.9%) with a -45s to +221s pair range. The cost values are observed-runner
arithmetic from that experiment, not Depot invoices. That evidence does not
justify increasing this repository's runner size, adding a matrix concurrency
cap, or splitting the existing Depot project. The trusted runner-images rollout
therefore retains its measured 16-vCPU native and 4-vCPU orchestration choices;
that boundary is not expanded into packaging.

The only packaging-side comparison available is a one-row observation, not a
cold/warm pair or a full-matrix baseline:

| Build path | Run | Workflow wall | Native package | Dry image |
|---|---|---:|---:|---:|
| Depot remote BuildKit | [30708002408](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/30708002408) | 148s | 45s | 40s |
| Hosted Buildx control | [30708253831](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/30708253831) | 200s | 76s | 63s |

Those runs used different commits and one `ubuntu-cpu-amd64` row, so they do
not establish cold versus warm behavior, cache hit rate, context upload time,
cache import/export time, CPU utilization, billed cost, matrix completion time,
or per-architecture/per-backend variance. The hosted control's `.dockerbuild`
artifact also does not supply the missing Depot cache and resource metrics.

To improve bounded reporting without manufacturing those values, each
`package-image` row now uploads one 14-day `depot-build-*` JSON record for each
Depot phase (native package, dry image, and staged image). Each record carries
the exact artifact/matrix identity, runner label, Depot project/build IDs,
GitHub action-step seconds, and a `du -sb` context-size estimate. Unsupported
fields remain explicit: `cache_state` is `unclassified`, while cache hit rate,
context upload duration, cache import/export duration, CPU utilization, and
cost are `null`. `action_seconds` measures the GitHub action step, not Depot's
server-side build duration.

The workflow continues to use project `mzm95zcv7p`; no new cache project or
family-specific cache identity is invented without measured contamination,
hit-rate, or cost evidence. The phase labels in the records are measurement
identities only and do not change the archive-first producer contract or cache
scope. Revisit runner size, bake grouping, matrix concurrency, or project
boundaries only after at least three comparable full-matrix runs have
independent cache-state labels, per-row Depot records, and resource/cost data.

## Historical measurements

The August 10, 2026 release at packaging commit `1b47fef` completed in 19m24s.
Its 4,109,126,303-byte aggregate artifact took 124s to upload and 160s to download
in the publisher. These are historical observations from run `31355832185`,
not measured savings from the new original-artifact handoff. Independent
Debian/Arch fixture builds verify reproducibility and package-free image
layers; fixtures do not certify a published MeshLLM release.

Use the [historical metrics workflow](ci-metrics.md) to retain run/attempt and
job/step records beyond artifact expiry, inspect queue and execution separately,
and compare matching cohorts. The row receipts now record selected labels,
actual runner name, and runner environment. Unknown cache rates, resource use,
and billed costs remain null. CUDA compilation intentionally stays on the
self-hosted AMD64 ARC runner; an infrastructure incident's queue is not evidence
that hosted compilation is faster.
