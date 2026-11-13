# Packaging compatibility for 0.79.0

The audit started on 2026-11-01 against packaging `06c6aa8` and
MeshLLM `15da969d74c1e1d879029d9c1ce05f6314dd21a5`. The stable release evidence
and its limits are recorded below.

## Required changes

| Producer change | Packaging adjustment |
| --- | --- |
| Product-v2 now records the host's required Skippy ABI and the runtime's supplied ABI and independent release version | Synchronize the exact schema and validate both identities against the native manifest |
| Native manifests use schema version 2 and `release_version` | Reject legacy manifests, mismatched ABI/release identities, malformed Linux glibc floors, and undeclared runtime license material |
| SDK sources moved to `mesh/sdk/node` | Resolve the SDK directory explicitly and reject missing or ambiguous layouts |
| The console verifier now invokes Rust automation | Verify the immutable console assets in this consumer without compiling upstream automation |
| Node SDK lifecycle and constructor options changed | Exercise the current public SDK with isolated state and bounded shutdown |
| Addon producers only import their package, and downstream lifecycle QA ran only on Linux x64 | Install the assembled tarball and run the bounded lifecycle on every selected native platform before npm publication |
| Current Homebrew refuses untrusted third-party formulae | Explicitly trust only the generated validation formula before its audit and installation |
| Release admission depends on unchanged host bytes and bounded client shutdown | Compare the installed Homebrew host with its product-manifest digest and bound forced cleanup after a SIGINT timeout |
| Unix product archives now contain pinned plugin archives | Preserve safe, regular, top-level plugin archives in native packages and Homebrew; rely on the verified upstream archive checksum and producer's host-pin check |
| CUDA native runtimes carry their user-space library closure | Use plain distro runtime bases and remove toolkit package dependencies while retaining NVIDIA driver-injection variables |
| Package QA must cover automatic client selection | Exercise `client --auto` with an unreachable loopback discovery relay in native packages, final images, and Homebrew |
| Release candidates need a full rehearsal without stable-channel promotion | Reject prerelease image/package publication while retaining dry runs and npm's explicit `next` channel |

The strict schema check remains before native/Homebrew fan-out. Historical
releases with older schemas must use their matching packaging revision. The
consumer does not silently reinterpret an old runtime as the current format.

## Existing pull requests

The compatibility change incorporates the intent of
[#30](https://github.com/Mesh-LLM/mesh-packaging/pull/30),
[#31](https://github.com/Mesh-LLM/mesh-packaging/pull/31),
[#32](https://github.com/Mesh-LLM/mesh-packaging/pull/32),
[#33](https://github.com/Mesh-LLM/mesh-packaging/pull/33), and
[#36](https://github.com/Mesh-LLM/mesh-packaging/pull/36).

Those branches cannot be treated as current release evidence. In particular,
#36 expects `plugins/manifest.json`, which the current producer does not emit;
#33 builds on #30; #31's tar test double writes a stray file named after an
option; and #32 leaves final-image and Homebrew automatic selection uncovered.

## Audit coverage and external state

The audit covers every release workflow and its package/image reusable
workflow, the matrix, archive/schema admission, native and Homebrew staging,
Docker dependencies and QA, Node addon/package assembly, release evidence and
handoffs, publication, readiness, and the existing open PRs. The baseline suite
passed 171 tests with one optional Docker test skipped. Those fixtures alone
did not detect the producer changes above.

Live configuration checked on 2026-11-01:

- Packaging Actions and the release workflow are enabled.
- The `release` environment allows only the `main` branch. The `npm`
  environment exists and has no protection rules.
- `DEPOT_REGISTRY_CACHE_ENABLED` is `false`; mirror placement remains disabled.
- The main ruleset prevents deletion and force pushes and requires linear
  history. It does not define required checks or approval counts.
- The most recent stable packaging run was
  [37309406401](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/37309406401)
  for the earlier producer generation. Its success does not qualify 0.79.0.

The upstream dispatcher still sends the legacy payload and does not wait for
packaging. The larger upstream proposals #2227 and #2423 closed without
merging. Keep the downstream legacy compatibility path until an identity-bound
dispatcher actually lands. For 0.79.0 the release manager must check the
terminal downstream receipt and all requested channel results before declaring
distribution complete. A successful dispatch alone is insufficient.

Repository/environment inspection does not establish organization runner-group
settings, Depot authorization, npm trusted-publisher settings, or the effective
scope of the upstream dispatch secret. The subsequent stable publication
exercised its applicable permissions for that run.

## Release acceptance

- [x] Pass the full local suite, exact matrix coverage, shell and workflow
  checks, and real Docker package reproducibility checks on the final diff.
- [x] Pass Packaging Precheck on the reviewed compatibility commit. Both the
  [final PR check](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41338638204)
  and [merged main check](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41338913553)
  passed; the merged implementation is `294a0ae1d7642d0a330e5f34a2a970682d166c82`.
- [ ] Run the complete native, Homebrew, and npm matrix against the immutable
  0.79.0 RC, with `dry_run=true` and all publication switches disabled.
- [ ] Require a successful readiness receipt bound to that RC's SHA and
  `native-runtimes.json` digest. Publication jobs must be skipped for the RC.
- [x] After stable publication, verify the exact downstream run and requested
  package, image, and npm results, then verify the Homebrew tap update. The
  stable evidence is recorded below; it does not replace the RC dry run.

Hardware inference qualification belongs to the upstream release validation.
Packaging's no-driver readiness checks establish install/start/shutdown
behavior, not CUDA, Vulkan, ROCm, or Metal inference correctness.

Local validation passed 203 tests with five expected local skips. Four native
Linux cases then passed in a separate Docker run with all 16 selected tests
executed. The six-test Docker efficiency suite also passed without skips,
including independent Debian and Arch package builds with matching hashes,
package installation, dependency-stage cache reuse, and absence of the package
archive from final image layers. Matrix coverage is 100% for lines, branches,
and functions. ShellCheck, actionlint, and the Dockerfile build check passed.
These results describe the local implementation checks. The separately
requested RC dry run above has not been evidenced.

## Stable 0.79.0 distribution

The [stable packaging run](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/42910686420)
completed on 2026-11-10 at packaging commit
`f96f9edbdc2bdf154abc489bdb05e8b85e48c848`. Its successful readiness receipt
records upstream tag `v0.79.0`, commit
`e8c9e7fba8bf88b3fa65a4187862d1147dce372c`, and `native-runtimes.json`
SHA-256 `5d1666497fd47b20c19c52220d3f246941994d62df62d75768199b2375759c02`.
It used legacy correlation ID `legacy-42910686420-1` and requested image,
package, and npm publication. All requested results in the receipt succeeded.

The run passed all 11 native package and final-image rows, Homebrew validation,
and installed SDK lifecycle checks on all four native targets. It published the
[package release](https://github.com/Mesh-LLM/mesh-packaging/releases/tag/packaging-v0.79.0),
images, and npm package. On 2026-11-13, npm reported version `0.79.0`, and the
Homebrew tap formula pointed to the `v0.79.0` Metal archive. The stable run was
not a publication-disabled RC rehearsal.

The successful package/image checks did not assert that the installed runtime
appeared in `runtime list`. A subsequent offline inspection of the published
ARM64 CPU image found the bundled runtime was not discovered by default. That
finding requires a package layout and QA correction and limits the practical
meaning of the stable run's successful readiness result.

## Supplemental preview rehearsal

While 0.79.0 candidate preparation continued, packaging ran
[41339711692](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41339711692)
against the published October 30 preview. This is infrastructure evidence, not
0.79.0 qualification. The inputs were:

- Packaging commit: `294a0ae1d7642d0a330e5f34a2a970682d166c82`.
- Upstream tag: `v0.78.0-preview.40959817943.1`.
- Upstream commit: `1253a2a490ab5cf7a7897cb6bb06297f4f286a67`.
- `native-runtimes.json` SHA-256:
  `aecff7cb55e384ad17d91143bcec73a4b46b1665ec50bda8f241df573d3aafc8`.
- `dry_run=true`, all validation channels selected, all publication disabled.

All eight Linux product archives, the shared host-identity gate, all 11 native
package rows, and all 11 final runtime images passed. The package and image
checks include no-driver automatic client readiness and bounded shutdown.

All four Node addon archives passed verification. The assembled npm package
passed installation and dry-run publication, then failed its lifecycle smoke:
the preview predates `Node.fromConfig`, which current upstream exports and the
current packaging smoke requires. Matching product schemas do not establish
SDK API compatibility. This failure does not justify a fallback in the current
smoke and does not establish a defect in the 0.79.0 candidate.

The run finished with failed readiness. After its runner queue cleared,
Homebrew refused to load the generated validation formula from an untrusted
tap. Its audit, installation, and runtime test did not execute. The fix trusts
that specific generated formula before loading it, preserving Homebrew's trust
checks for other tap contents. Release assembly was skipped, every publication
job was skipped, and the readiness report retained the exact upstream identity
above. Follow [issue #37](https://github.com/Mesh-LLM/mesh-packaging/issues/37)
for the corrected Homebrew rehearsal and subsequent 0.79.0 evidence.

## Follow-up validation gates

[#39](https://github.com/Mesh-LLM/mesh-packaging/pull/39) adds native lifecycle
consumers for the same assembled npm tarball on all four supported targets.
Archive verification, package assembly, and each selected native consumer must
succeed before npm publication or successful readiness. A mismatched runner
target fails before addon loading.

The generated Homebrew formula receives explicit formula-specific trust. Its
test also checks the installed host against the product-manifest digest before
execution and bounds forced TERM/KILL cleanup after a SIGINT timeout. The
cleanup regression exercises a real child process that ignores TERM.

Local validation of these follow-up changes passed 208 tests with five expected
local skips. Ruby syntax and Homebrew formula style also passed. SDK subprocess
fixtures now allow startup under host load while retaining bounded execution,
lifecycle assertions, and temporary-state cleanup. These local results did not
establish the later stable distribution results recorded above.

The formula-specific trust correction passed a Homebrew-only preview rehearsal
in [41341832014](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41341832014)
at packaging `8a9e054bb938f3f79d4988b3219099d9ed271033`. Audit, installation,
automatic client readiness, bounded shutdown, and terminal readiness passed.
Every publication job was skipped. The receipt retained the preview identity
listed above.

The final Homebrew-only preview rehearsal
[41343494547](https://github.com/Mesh-LLM/mesh-packaging/actions/runs/41343494547)
passed at packaging `c27470e49502e1e1934b4efaffc8c45883351760`. Audit,
installation, installed-host digest verification, automatic client readiness,
bounded shutdown, and terminal readiness all passed. The successful
`packaging-readiness.json` retained the same upstream identity. All publication
jobs were skipped. The downloaded generated formula is byte-identical to the
rendering from merged main `c8d4e59` for preview
`v0.78.0-preview.40959817943.1` and archive SHA-256
`729cefe6eac0b290ac14f97c6b3c70c27fa7dcc7e2c55472d6b9a96482cf6391`.

The companion [homebrew-tap #1](https://github.com/Mesh-LLM/homebrew-tap/pull/1)
merged at `e81e3a25e41c99aadf99315f88a8b21397098632`. Both tap workflows had
omitted formula trust, and successful scheduled syncs skipped unchanged
candidates, leaving the affected path untested. The fix trusts only the intended
formula in each workflow and adds a manual sync dry run that validates unchanged
input with publication disabled.

The [final-head formula test](https://github.com/Mesh-LLM/homebrew-tap/actions/runs/41348914607)
passed audit, installation, and runtime testing at
`fe0aba22a9b79e2b82436c2ce45241f50b984ca3`. The
[sync dry run](https://github.com/Mesh-LLM/homebrew-tap/actions/runs/41347637397)
passed at `c7a5b738cd171849758983b1b8b714cb8d006b62`, whose workflows and formula
are identical to the final head. It audited, installed, and tested unchanged
version `0.78.1`; publication was skipped and the current-version report passed.
The merged tree matches the tested final head. The canonical stable formula
bytes were unchanged. Manual sync now defaults to `dry_run=true`; an actual
manual stable update must explicitly set `dry_run=false`.

The four-platform SDK lifecycle and stable publication passed in the stable run
described above. The separately requested 0.79.0 RC dry run remains unverified;
issue #37 remains open for its acceptance criteria.
