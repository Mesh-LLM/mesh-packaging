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
- require ownership of
  `/usr/local/lib/mesh-llm/<version>/native-runtimes/<runtime-id>` plus the
  product and host-import manifests;
- validate backend-specific dependency metadata against the artifact name;
- reject backend libraries installed beside `/usr/local/bin/mesh-llm`.

Before installing, run a simulated local-package transaction and capture the
complete apt/dpkg transaction state, including dependencies, package
configuration, alternatives, hooks, and service changes. Proceed only when the
package was absent and exact reversal of every transaction-created change can
be established. Otherwise mark certification `BLOCKED`.

Install the CPU package through apt/dpkg, then:

- query installed version;
- invoke the package-owned path, normally `/usr/local/bin/mesh-llm`;
- run `--version`, `--help`, and `runtime list` without GPU passthrough;
- require `runtime list` to discover the package-owned runtime with an empty
  user cache and verify the runtime was not copied into that cache;
- start isolated client mode using unique API and console ports;
- observe readiness and endpoint from a second SSH channel;
- send SIGINT and require bounded shutdown.

Remove only proven test-created package, dependency, configuration,
alternative, hook, service, cache, config, and runtime state. If exact reversal
cannot be established, mark certification `BLOCKED` instead of guessing.
Verify installed-package and owned-executable absence afterward.

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
  dependencies;
- require ownership of the versioned runtime tree and product/host-import
  manifests, with no backend libraries beside the host executable.

Install only the designated smoke package when safe. Query it with `pacman -Q`,
then run the exact owned executable's version, help, runtime list with an empty
user cache and no device passthrough, isolated client readiness, optional
endpoint probe, SIGINT, and bounded shutdown. Confirm runtime discovery uses the
package-owned versioned tree without populating the user runtime cache.

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
ports. Require either an isolated Homebrew prefix or an initially clean
canonical owner/tap and formula. Abort before mutation if `<owner>/<tap>` or
`<owner>/<tap>/mesh-llm` is already present outside an isolated prefix.

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
- verify `libexec/native-runtimes/<runtime-id>`, `product-manifest.json`, and
  `host-imports.json` are formula-owned;
- run `--help` and `runtime list` without device passthrough and with an empty
  user cache, requiring discovery of the formula-owned runtime without copying
  it into the cache;
- start the exact Cellar/opt binary with isolated HOME/runtime and unique API
  and console ports;
- require readiness, optional `/v1/models` HTTP success, and clean SIGINT.

Never invoke a shadowing `~/.local/bin/mesh-llm`.

Uninstall only if the test installed the formula. Untap only if the test added
the tap. Delete only test-created resources and verify original state
restoration.

## npm SDK

Use a fresh temporary project outside repository `node_modules`.

Set `npm_config_cache=<temporary-project>/.npm-cache` and use that environment
variable for every npm operation, including registry queries, `npm init`,
`npm pack`, and installation. Record Node/npm versions and require the package's
engine floor. Query the exact version and current dist-tags from the public
registry, including tarball URL, integrity, shasum, signatures/provenance, OS,
and CPU metadata. Run `npm pack <package>@<version>`, then inspect the tarball
for:

- JavaScript entry point;
- TypeScript declarations;
- README and license;
- console assets;
- every addon target advertised by the tagged packaging matrix.

Verify local tarball shasum/integrity against registry metadata.

Inside the fresh project:

1. Run `npm init` with `npm_config_cache` set to the per-project cache.
2. Install the exact public package with normal install semantics. Do not use a
   repository lockfile or local tarball for the canonical install test. Use the
   same `npm_config_cache` value.
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

Remove the project, the per-project npm cache, SDK cache/runtime paths, and
process. Do not delete any other npm cache. Retain only redacted evidence and
the packed tarball if the evidence policy calls for it.

## OCI/Docker images

Record Docker Desktop/client/server versions, daemon OS/architecture, Buildx
version, disk space, existing exact versioned image references, containers, and
MeshLLM processes. Never use moving tags.

Derive enabled tags from the immutable packaging tag's `images.json` and
tag-generation code. Do not copy an expected list from a previous release.

For every image:

1. Run `docker buildx imagetools inspect` on the exact tag.
2. Record the OCI index digest and selected platform child digest. Exclude
   `unknown/unknown` children only when their media type or annotations identify
   attestation content.
3. Inspect labels/config from a trustworthy manifest/config surface and require:
   requested version, packaging source, upstream source, correct backend,
   correct backend version, and upstream release ref.
4. Pull the immutable child digest with
   `docker pull --platform <expected> <repository>@sha256:<child-digest>`.
5. Confirm local `Os` and `Architecture`.
6. Prove native-package installation:
   - Ubuntu: `dpkg-query`, `dpkg -s`, and `dpkg -L`.
   - Arch: `pacman -Q`, `pacman -Qi`, and `pacman -Ql`.
7. Require the installed package to own the expected executable path, versioned
   runtime tree, product manifest, and host-import report.
8. Verify the host-import report rejects no backend imports and no backend
   libraries are installed beside the host executable.
9. Run unique `--rm` version, help, and runtime-list containers without device
   passthrough from `<repository>@sha256:<child-digest>`. Require exact MeshLLM
   version and discovery of the package-owned runtime with an empty user cache.
10. Start a uniquely named client container with explicit platform,
   `--log-format json --no-console client --auto`, and no GPU/device
   passthrough.
11. Require a ready event and running container.
12. Do not publish ports unless performing an endpoint probe.
13. Send SIGINT, wait with a bound, and capture logs plus final
    `Running=false`/exit code.
14. Remove the test container in a trap/finally path.

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
