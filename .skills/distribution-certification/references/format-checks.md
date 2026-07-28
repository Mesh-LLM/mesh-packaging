# MeshLLM format certification checks

Use the exact release-derived artifact names and requested version throughout.
Capture each command, UTC timestamp, combined output, and exit code.

## Debian/Ubuntu `.deb`

### Preflight

Record:

- `uname -a`, `uname -m`, `/etc/os-release`, and `df -h`;
- `dpkg-query -W mesh-llm` allowing not installed;
- `command -v -a mesh-llm` or equivalent exhaustive PATH lookup;
- exact MeshLLM processes and system/user service state;
- listeners on 9337, 3131, proposed API port, and proposed console port;
- relevant user cache/config/runtime state.

Download the platform CPU package, every metadata-only backend package assigned
to this host, their sidecars, and the aggregate checksum directly on the host.

For every package:

- verify the sidecar and aggregate checksum;
- run `dpkg-deb --info` and `dpkg-deb --contents`;
- require package `mesh-llm`, normalized upstream version equal to the requested
  version, correct Debian architecture, and expected executable ownership;
- validate backend-specific dependency metadata against the artifact name.

Before installing, run a simulated local-package transaction. Proceed only when
the package was absent and the transaction will not alter an active service or
unrelated dependency state.

Install the CPU package through apt/dpkg, then:

- query installed version;
- invoke the package-owned path, normally `/usr/local/bin/mesh-llm`;
- run `--version` and `runtime list`;
- start isolated client mode using unique API and console ports;
- observe readiness and endpoint from a second SSH channel;
- send SIGINT and require bounded shutdown.

Remove the package only if the test installed it. Verify installed-package and
owned-executable absence afterward.

## Arch `.pkg.tar.zst`

### Preflight

Record the Debian-equivalent host data using:

- `pacman -Q mesh-llm`;
- exact executable/process/systemd checks;
- default and proposed port listeners;
- Snapper configuration and existing snapshot IDs when pacman hooks use it.

For every package:

- verify sidecar and aggregate checksum;
- inspect with `pacman -Qip` and `pacman -Qlp`;
- require package `mesh-llm`, normalized requested version, `x86_64` or the
  matrix architecture, expected executable ownership, and backend-consistent
  dependencies.

Install only the designated smoke package when safe. Query it with `pacman -Q`,
then run the exact owned executable's version, runtime list, isolated client
readiness, optional endpoint probe, SIGINT, and bounded shutdown.

On cleanup:

- remove only the test-installed package;
- diff package-hook/Snapper state and delete only snapshots conclusively created
  by the certification transactions;
- remove only test-created cache/config/runtime entries;
- verify package, executable, process, listener, temp directory, and test
  snapshot absence.

Metadata-only GPU rows certify package format and dependency closure, not GPU
hardware or model-serving performance.

## Homebrew

Record macOS version, architecture, Homebrew version, existing taps, installed
formula state, every MeshLLM executable in PATH, processes/services, and chosen
ports.

Install exactly the canonical fully qualified formula:

```text
brew install <owner>/<tap>/mesh-llm
```

Then:

- inspect `brew info --json=v2` and require the requested stable/installed
  version;
- run `brew audit --strict --online` and `brew test`;
- resolve the exact executable through `brew --prefix mesh-llm`;
- verify its file architecture and `--version`;
- run its `runtime list`;
- start the exact Cellar/opt binary with isolated HOME/runtime and unique API
  and console ports;
- require readiness, optional `/v1/models` HTTP success, and clean SIGINT.

Never invoke a shadowing `~/.local/bin/mesh-llm`.

Uninstall only if the test installed the formula. Untap only if the test added
the tap. Verify original state restoration.

## npm SDK

Use a fresh temporary project outside repository `node_modules`.

Record Node/npm versions and require the package's engine floor. Query the exact
version and current dist-tags from the public registry, including tarball URL,
integrity, shasum, signatures/provenance, OS, and CPU metadata.

Run `npm pack <package>@<version>`, then inspect the tarball for:

- JavaScript entry point;
- TypeScript declarations;
- README and license;
- console assets;
- every addon target advertised by the tagged packaging matrix.

Verify local tarball shasum/integrity against registry metadata.

Inside the fresh project:

1. Run `npm init`.
2. Install the exact public package with normal install semantics. Do not use a
   repository lockfile or local tarball for the canonical install test.
3. Confirm installed version and lockfile registry resolution.
4. Run the harness from the project directory so Node resolves that
   `node_modules`.
5. Require `require(<package>)`, exact `currentMeshVersion()`, and the expected
   platform addon path/architecture.
6. Generate an owner keypair through the public API.
7. Create a `Node` with unique cache/runtime directories,
   `servingEnabled: false`, and a unique local invite token.
8. Use bounded awaits for `start()`, `status()`, and `stop()`; call `stop()` in
   `finally`.
9. Require normal process exit without addon/dynamic-library errors, crashes,
   hangs, or leaked handles.

This certifies the SDK/native addon, not a standalone CLI.

Remove the project, npm cache, SDK cache/runtime paths, and process. Retain only
redacted evidence and the packed tarball if the evidence policy calls for it.

## OCI/Docker images

Record Docker Desktop/client/server versions, daemon OS/architecture, Buildx
version, disk space, existing exact versioned image references, containers, and
MeshLLM processes. Never use moving tags.

Derive enabled tags from the immutable packaging tag's `images.json` and
tag-generation code. Do not copy an expected list from a previous release.

For every image:

1. Run `docker buildx imagetools inspect` on the exact tag.
2. Record the OCI index digest and expected platform child. Ignore
   `unknown/unknown` attestation children when determining platform coverage.
3. Inspect labels/config from a trustworthy manifest/config surface and require:
   requested version, packaging source, upstream source, correct backend,
   correct backend version, and upstream release ref.
4. Pull with `docker pull --platform <expected>`.
5. Confirm local `Os` and `Architecture`.
6. Prove native-package installation:
   - Ubuntu: `dpkg-query`, `dpkg -s`, and `dpkg -L`.
   - Arch: `pacman -Q`, `pacman -Qi`, and `pacman -Ql`.
7. Require the installed package to own the expected executable path.
8. Run a unique `--rm` version container and require exact MeshLLM version.
9. Start a uniquely named client container with explicit platform,
   `--log-format json --no-console client --auto`, and no GPU/device
   passthrough.
10. Require a ready event and running container.
11. Do not publish ports unless performing an endpoint probe.
12. Send SIGINT, wait with a bound, and capture logs plus final
    `Running=false`/exit code.
13. Remove the test container in a trap/finally path.

Run AMD64 images under emulation on Apple Silicon when Docker supports it and
record native versus emulated execution. If the daemon cannot emulate an
advertised architecture, record the exact daemon error as `BLOCKED`. A missing
GPU is not a blocker for client mode.

Mark an image `FAIL` when its executable/shared-library closure prevents
`--version` or client readiness. Do not exempt missing CUDA driver libraries
from a no-device client smoke.

After all rows, remove only exact image references absent at preflight. Preserve
pre-existing references even when layers are shared. Verify zero test
containers and exact image-reference restoration.
