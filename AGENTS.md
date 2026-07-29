# AGENTS.md

## Project Overview

This repository owns packaging and distribution orchestration for `mesh-llm`.
Keep work structured around explicit artifacts and avoid one-off build paths.

## Repository Layout

- Keep distro/backend/platform rows in `packaging/images.json`.
- Keep matrix expansion, artifact names, tags, runner labels, and validation in `scripts/image-matrix.ts`.
- Keep Docker build/runtime mechanics in `docker/Dockerfile.mesh-llm` and `docker/install-*.sh`.
- Keep native package scripts and metadata under `packaging/`.
- Keep policy and support-window documentation in `docs/`.
- Keep repository scripts in the same language family; new scripts should be TypeScript/Node unless a platform shell helper is required.
- Use `packaging/` for all package-related work:
  - `packaging/images.json`: target rows and package metadata inputs.
  - `packaging/native/`: Linux package builders and shared staging helpers.
  - `packaging/homebrew/`: macOS Homebrew formula scaffolding.

## Development Workflow

Build shared artifacts first, then fan out only after those artifacts are ready:

1. Resolve the `mesh-llm` release ref once to an immutable source SHA.
2. Resolve and verify one backend-neutral host artifact per OS/architecture.
3. Resolve and verify one native runtime per platform/backend/backend-version.
4. Compose the immutable inputs into a product-v2 bundle; never rebuild the host
   for a backend alias.
5. Build native package artifacts from the complete bundle and metadata.
6. Assemble Docker runtime images from the native package artifact for that same row.

Before any package/image fan-out, prove every verified product for the same
OS/architecture has the same host SHA-256. The workflow must consume
upstream-produced, verified host/runtime bytes and reject schema drift at the
immutable upstream commit; it must never infer host identity from a tag name.

When adding a new distro or backend, update all affected layers in the same
change: matrix data, validation, dependency installers, package metadata,
workflows, and docs.

## Package And Image Rules

Docker images should exercise the same package artifacts users receive. The
preferred flow is:

```text
host artifact + runtime artifact -> product bundle -> native package -> runtime image
```

Do not add a second path that rebuilds `mesh-llm` directly inside the final
runtime image. If an image needs a binary, it should receive the package or
artifact produced by the package pipeline.

Package-install and final-image QA must start `client --auto` without a GPU
device or driver stub, using isolated ports/runtime/cache roots and JSON logs.
They must observe either the JSON `Client ready` message or the structured
`passive_mode`/`status=ready`/`role=client` event, retain a live process, and
prove bounded SIGINT shutdown. `--version` and `runtime list` alone are not
runtime QA.

Only bypass the package artifact when a distro has no supported package format
yet, and document that exception in `docs/native-packages.md`.

Package names must retain the mesh-llm version, distro, architecture, backend,
and backend version where applicable.

## macOS Distribution

Docker is not the macOS GPU distribution path. Prefer Homebrew packaging for
macOS and document GPU/runtime limitations separately from Linux container
support.

## Build And Test Commands

After changes, run the narrowest relevant checks first, then broaden:

- `node --experimental-strip-types scripts/image-matrix.ts validate`
- `node --experimental-strip-types --test --experimental-test-coverage --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 tests/image-matrix.test.ts`
- Representative `node --experimental-strip-types scripts/image-matrix.ts github-matrix` commands for changed filters/rows
- YAML parse checks for workflows
- Shell syntax checks for scripts
- Dockerfile `buildx --check` for changed targets when Docker is available
- Package builder dry-runs for each changed package format

## TODO Discipline

Use TODOs aggressively. Every multi-step change must have active TODO items with
a concrete `QA:` clause. Mark items complete only after the stated verification
has actually run.
