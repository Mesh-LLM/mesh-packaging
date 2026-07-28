---
name: distribution-certification
description: Certify a published MeshLLM packaging release end to end across native Linux packages, Homebrew, npm SDK, and OCI images. Use when validating a MeshLLM version or packaging tag, proving that published artifacts install or load and start their packaged runtime, checking release checksums/SBOM/provenance/labels, comparing versions across channels, preserving pre-existing services, cleaning all test state, and producing an evidence-backed overall PASS/FAIL/BLOCKED verdict.
---

# Distribution Certification

Validate the complete published MeshLLM distribution, not merely release
metadata. Install or load every required format, prove its packaged runtime
reaches a real ready state, stop it cleanly, and restore every host to its
preflight state.

Read these resources completely before acting:

- [references/format-checks.md](references/format-checks.md) for per-channel
  preflight, integrity, installation, runtime, and cleanup checks.
- [references/report-contract.md](references/report-contract.md) for evidence,
  result, redaction, delegation, and final-report requirements.

## Required inputs

Resolve and record:

- MeshLLM semantic version, such as `0.74.0`.
- Canonical packaging repository and immutable packaging tag.
- Canonical OCI repository.
- Canonical Homebrew tap/formula.
- Canonical npm package name.
- Remote hosts assigned to each native package platform.
- Expected native/image matrix.

Use user-supplied values when present. Otherwise derive the matrix from the
tagged packaging source, never from memory or a newer branch. Do not silently
substitute a newer version, tag, repository, package scope, architecture, or
backend.

If a required host is unspecified, select only a compatible host documented in
the repository's authoritative computer inventory. Ask before using an
undocumented machine or before making a materially different substitution.

## Mandatory preparation

1. Read the repository `AGENTS.md`.
2. Read the MeshLLM source repository's
   `.agents/skills/manage-ci/SKILL.md`, when available, before inspecting
   release workflows, tag-generation code, live runs, or publishing topology.
   This is inspection only: never dispatch, rerun, cancel, publish, or mutate
   CI.
3. Read the available `remote-observable-process` skill before starting a
   remote smoke process over SSH. In a MeshLLM source checkout, it lives at
   `.agents/skills/remote-observable-process/SKILL.md`.
4. Inspect `git status`; preserve unrelated worktree changes.
5. Create one UTC-stamped evidence root:

   ```text
   artifacts/distribution-certification-<version>-<UTC timestamp>/
   ```

6. Record the exact certification inputs and start time before downloading or
   installing anything.

## Safety boundary

This skill is validation-only.

- Use only already-published artifacts for the exact requested version.
- Never build MeshLLM from source.
- Never publish or replace assets, mutate a release, alter tags, rerun a
  workflow, change secrets, or edit another repository.
- Never stop, replace, reconfigure, or signal a pre-existing MeshLLM process or
  service.
- Never invoke a pre-existing shadowing executable accidentally.
- Never use a TUI through SSH or in a container.
- Start every noninteractive MeshLLM CLI with `--log-format json`.
- Use unique temporary directories, API ports, console ports, container names,
  cache roots, runtime roots, and log names.
- Remove only state proven to have been created by the certification. Never use
  broad cleanup such as `docker system prune`, recursive deletion of a broad
  directory, or package-cache purges.
- Continue independent rows after failures so the final matrix is complete.
- Diagnose defects after the matrix; do not fix them during certification.

## Preflight before every mutation

Capture the host OS, kernel, architecture, disk space, package-manager state,
all `mesh-llm` executables, exact running processes, relevant system/user
services, occupied default ports, and proposed test ports.

Also snapshot format-specific persistent state that an install hook may change:

- Homebrew taps and installed formulae.
- Docker versioned references and containers.
- User MeshLLM cache/config/runtime paths.
- Arch Snapper snapshot IDs when pacman hooks create snapshots.

If an active service or installed package would be affected, do not disturb it.
Use an isolated path only when it still proves the canonical distribution
contract. Otherwise mark the row `BLOCKED` with exact evidence.

## Phase 1: immutable release inventory

Snapshot the packaging release before other tests:

1. Record release ID, tag, body, publication time, draft/prerelease flags, asset
   IDs, asset creation/update times, byte sizes, URLs, and server-reported
   digests.
2. Require the body to identify the exact upstream MeshLLM version/ref.
3. Download the aggregate checksum, aggregate provenance, formula, every native
   package, every package sidecar, and every expected row SBOM/upstream
   provenance file.
4. Verify every native package against both its sidecar and aggregate checksum.
5. Run the aggregate checksum across every file it names, not just native
   packages. A stale formula or metadata checksum is a release failure.
6. Compare asset timestamps/digests with the release snapshot. Treat a replaced
   asset whose aggregate checksum was not regenerated as a published integrity
   defect.
7. Download the immutable packaging tag source and derive the expected matrix
   using its checked-in matrix and tag-generation code. Do not build product
   code.
8. Confirm one SBOM and one upstream-provenance file for every enabled native
   row. Explicitly record disabled/unsupported rows.
9. Compare tagged channel identity—especially npm package scope—with the
   artifact actually published.

Preserve both raw machine-readable inventory and a concise human-readable
validation log.

## Phase 2: certify distribution channels

Follow [references/format-checks.md](references/format-checks.md) exactly.

Common runtime rule:

1. Resolve the package-owned or channel-owned executable directly.
2. Run `--version` and require exact MeshLLM semantic version equality.
3. Run `runtime list` where the channel exposes the CLI.
4. Isolate `HOME`, XDG paths, cache directory, and runtime directory.
5. Reserve both an API port and a console port. Pass both explicitly even when
   using `--no-console`; some versions may still initialize the web server.
6. Start client mode with `--log-format json --no-console --auto`.
7. Require the process/container to remain alive and emit a real ready event
   such as `Client ready`.
8. Probe `/v1/models` only when an endpoint was intentionally exposed.
9. Send SIGINT, enforce a bounded shutdown, capture the final exit state, and
   verify listeners/processes disappeared.

A metadata-only check, successful install, `--version`, or transient live PID
is not runtime certification.

## Phase 3: cross-channel consistency

Require agreement on the requested semantic version across:

- packaging tag and release body;
- normalized native package versions (distro revision suffixes such as `-1`
  are allowed only when upstream version remains exact);
- package-owned executables;
- Homebrew formula, Cellar version, and exact Cellar executable;
- npm package and `currentMeshVersion()`;
- OCI labels, installed in-image package metadata, and every loadable image
  executable.

Also prove:

- Native packages own the expected executable path.
- Images install their native package rather than copying an unrelated binary.
- Homebrew downloads the expected upstream Apple Silicon archive.
- npm selects the current host's advertised prebuilt addon.
- No test invokes a shadowing user-local executable.
- No channel resolves to an older release.

An executable that cannot load does not satisfy version consistency even if its
metadata says the right version.

## Phase 4: cleanup audit

Perform cleanup in a `finally`/trap path for every mutable test.

After all channel owners finish, independently recheck:

- original package/formula/tap state;
- exact process and listener absence;
- test directory/cache/runtime absence;
- Docker container and image-reference restoration;
- remote temp-directory absence;
- preservation of every pre-existing service, executable, image, and user
  state.

Record a final UTC cleanup transcript. Do not claim cleanup from an attempted
command alone; verify the resulting state.

## Phase 5: report and verdict

Write:

```text
artifacts/distribution-certification-<version>-<UTC timestamp>/REPORT.md
```

Use [references/report-contract.md](references/report-contract.md). The report
must contain a row for every required native, Homebrew, npm, and image target,
plus release inventory. Include exact failures, commands, exit codes, log
excerpts, checksums, digests, readiness, pre-existing conflicts, and cleanup.

Verdict precedence:

1. `FAIL` if any required published artifact is missing, corrupt, mislabeled,
   uninstallable, unloadable, version-inconsistent, or cannot reach readiness.
2. Otherwise `BLOCKED` if environmental safety or unavailable infrastructure
   prevents any required row.
3. `PASS` only when every required row passes and cleanup is verified.

Rows that are intentionally metadata-only use `NOT APPLICABLE` for runtime
columns, not `PASS`.

## Findings-driven guardrails

Always preserve these learned checks:

- Detect release assets replaced after aggregate checksum generation.
- Run remote smoke processes in a held foreground TTY with a separate observer
  and control channel; do not rely on detached SSH first attempts.
- Treat `--no-console` as insufficient isolation by itself; reserve/pass a
  unique console port too.
- Redact ephemeral invite tokens without deleting readiness, status, signal,
  exit, and listener evidence.
- Run npm harnesses from inside the fresh project so Node resolves the installed
  package rather than the evidence script's directory.
- For OCI indexes, accept expected platform children plus `unknown/unknown`
  attestation manifests. Resolve the index digest from a trustworthy inspect
  surface; do not mark an image failed because a log wrapper made raw JSON
  unparsable.
- Pull every image with explicit platform and confirm local OS/architecture.
- Run CUDA client images without device passthrough. A hard
  `libcuda.so.1` loader dependency is a product failure, not an environmental
  skip.
- Record and remove only test-created Arch package-manager snapshots.
