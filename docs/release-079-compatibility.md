# Packaging compatibility for 0.79.0

The audit started on 2026-11-01 against packaging `06c6aa8` and
MeshLLM `15da969d74c1e1d879029d9c1ce05f6314dd21a5`. The release candidate's
immutable tag and artifact bytes remain the final compatibility inputs.

## Required changes

| Producer change | Packaging adjustment |
| --- | --- |
| Product-v2 now records the host's required Skippy ABI and the runtime's supplied ABI and independent release version | Synchronize the exact schema and validate both identities against the native manifest |
| Native manifests use schema version 2 and `release_version` | Reject legacy manifests, mismatched ABI/release identities, malformed Linux glibc floors, and undeclared runtime license material |
| SDK sources moved to `mesh/sdk/node` | Resolve the SDK directory explicitly and reject missing or ambiguous layouts |
| The console verifier now invokes Rust automation | Verify the immutable console assets in this consumer without compiling upstream automation |
| Node SDK lifecycle and constructor options changed | Exercise the current public SDK with isolated state and bounded shutdown |
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
scope of the upstream dispatch secret. The live RC rehearsal and stable
publication must exercise the applicable permissions.

## Release acceptance

- [x] Pass the full local suite, exact matrix coverage, shell and workflow
  checks, and real Docker package reproducibility checks on the final diff.
- [ ] Pass Packaging Precheck on the reviewed compatibility commit.
- [ ] Run the complete native, Homebrew, and npm matrix against the immutable
  0.79.0 RC, with `dry_run=true` and all publication switches disabled.
- [ ] Require a successful readiness receipt bound to that RC's SHA and
  `native-runtimes.json` digest. Publication jobs must be skipped for the RC.
- [ ] After stable publication, verify the exact downstream run and requested
  package, image, and npm results, then verify the Homebrew tap update.

Hardware inference qualification belongs to the upstream release validation.
Packaging's no-driver readiness checks establish install/start/shutdown
behavior, not CUDA, Vulkan, ROCm, or Metal inference correctness.

Local validation passed 197 tests with five expected local skips. Four native
Linux cases then passed in a separate Docker run with all 16 selected tests
executed. The six-test Docker efficiency suite also passed without skips,
including independent Debian and Arch package builds with matching hashes,
package installation, dependency-stage cache reuse, and absence of the package
archive from final image layers. Matrix coverage is 100% for lines, branches,
and functions. ShellCheck, actionlint, and the Dockerfile build check passed.
These results qualify the packaging implementation; the RC and publication
gates above remain open until their real runs finish.
