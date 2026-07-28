# MeshLLM evidence, delegation, and report contract

## Evidence layout

Use one root:

```text
artifacts/distribution-certification-<version>-<UTC>/
├── inventory/
├── debian/
├── arch/
├── homebrew/
├── npm/
├── docker/
├── orchestrator/
└── REPORT.md
```

Each owner writes raw logs plus `RESULT.md` under its directory. Do not let
multiple owners edit the final `REPORT.md`.

Record:

- exact UTC start/end timestamps;
- host OS/kernel/architecture and disk;
- command text, output, and exit code;
- artifact URL, release asset ID/timestamp, checksum, and OCI digest;
- package metadata/contents/ownership;
- selected executable/addon path;
- readiness/status/endpoint evidence;
- signal, bounded wait, and final exit state;
- pre-existing state and cleanup verification.

## Sensitive logs

MeshLLM startup can emit invite tokens or identity material. Never retain or
report a live token, owner keypair, secret, credential, or private endpoint.

Prefer structured redaction that preserves:

- event name;
- timestamp;
- readiness/status;
- selected ports;
- HTTP status and non-sensitive response;
- signal and exit state.

Record that redaction occurred. Do not remove the only readiness or failure
evidence merely because the source log contained a token.

## Delegation

Use subagents only when the user explicitly requests delegation or governing
instructions allow it.

Assign exactly one owner to each independent distribution unit. A practical
split is:

- Debian host/package family;
- Arch host/package family;
- Homebrew;
- npm SDK;
- Docker image matrix, or one owner per image when explicitly requested.

Cycle owners when concurrency is limited. Each brief must include:

- exact version, repositories, host/platform, and evidence directory;
- validation-only safety boundary;
- required preflight, integrity, install/load, runtime, endpoint, stop, and
  cleanup checks;
- instruction to continue independent checks after failure;
- instruction not to edit the final report;
- required `RESULT.md` schema and final response.

The orchestrator owns immutable release inventory, cross-channel consistency,
independent cleanup verification, defect classification, and `REPORT.md`.

## Result semantics

Use only:

- `PASS`: every required assertion for the row succeeded.
- `FAIL`: a published artifact is missing, corrupt, mislabeled, uninstallable,
  unloadable, version-inconsistent, crashes, or does not reach/leave readiness
  correctly.
- `BLOCKED`: safety or unavailable infrastructure prevents the required test
  and no safe equivalent exists.
- `NOT APPLICABLE`: the check does not apply, such as runtime start for a
  metadata-only GPU package row.

Do not use `PASS` for a process that merely stayed alive briefly. Do not use
`BLOCKED` for missing GPU passthrough in a client-only image smoke.

Overall precedence:

1. Any proven artifact failure makes the overall verdict `FAIL`.
2. Otherwise any required blocked row makes it `BLOCKED`.
3. Only a complete passing matrix makes it `PASS`.

## Required summary table

Use:

| Format | Artifact/reference | Host/platform | Integrity | Install/load | Version | Runtime start | Endpoint/status | Cleanup | Result |
|---|---|---|---|---|---|---|---|---|---|

Include separate rows for:

- release inventory;
- each native install/start package;
- each metadata-only native backend family requested;
- Homebrew;
- npm SDK;
- every individual OCI image.

## Required report sections

After the summary table include:

1. Release inventory and immutable source/matrix derivation.
2. Exact failures with command, exit code, and relevant excerpt.
3. Pre-existing state and safe isolation decisions.
4. Native package SHA-256 values and exact release URLs.
5. OCI index digests, platforms, labels, and native-package proof.
6. Start/readiness/status/endpoint/stop evidence for every mutable row.
7. Cross-channel version and ownership consistency.
8. Cleanup confirmation for every host.
9. Smallest owning-repository corrections, without implementing them.
10. Final overall verdict.

Distinguish:

- package-format certification from GPU runtime/performance qualification;
- a harness mistake from a product defect;
- an environmental blocker from a published-artifact failure;
- channel success from release-level integrity failure.

## Final audit before handoff

Verify mechanically:

- report exists and is non-empty;
- summary contains every derived image row;
- checksum table contains every enabled native row;
- digest table contains every image row;
- all linked evidence files exist and are non-empty;
- no test package/formula/tap/process/container/listener/temp directory remains;
- pre-existing state is still present;
- only intended evidence and skill files changed in the worktree.
