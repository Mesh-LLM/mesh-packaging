# Mesh LLM Agent Images

Canonical container and packaging scaffolding for [`mesh-llm`](https://github.com/Mesh-LLM/mesh-llm).

This repository builds release-grade Linux images from a released `mesh-llm` ref. The workflow resolves that ref once to an immutable commit SHA before any split artifacts are built, so the UI, llama.cpp ABI, binary, and final runtime image all come from the same source commit. The `mesh-llm` source repository remains the source of truth for the Rust/Cargo workspace and llama.cpp build scripts; this repository owns image matrices, image tags, runtime packaging layout, and future native package distribution.

## Layout

```text
docker/                    Shared Dockerfile and install/entrypoint helpers
packaging/images.json      Single source of truth for image variants
packaging/native/          Placeholder home for deb/rpm/apk/pkg.tar.zst work
scripts/image-matrix.py    Matrix, tag, and config validation helper
docs/                      Matrix, tagging, and native package strategy
.github/workflows/         Precheck and release image publishing workflows
```

## Release trigger

GitHub Actions cannot directly subscribe to a release event in another repository. The image release workflow therefore listens for `repository_dispatch` events named `mesh-llm-release`. The `mesh-llm` release workflow should send that event after a release is published:

```yaml
- name: Trigger image release
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.MESH_AGENT_IMAGES_DISPATCH_TOKEN }}
    repository: Mesh-LLM/mesh-agent-images
    event-type: mesh-llm-release
    client-payload: |
      {
        "repository": "${{ github.repository }}",
        "ref": "${{ github.ref_name }}",
        "version": "${{ github.ref_name }}",
        "release_url": "${{ github.event.release.html_url }}"
      }
```

The receiver also supports manual `workflow_dispatch` for backfills and dry runs. Manual runs can select the default GitHub-hosted runners or the Carrack self-hosted runner mode, which targets the repository-visible `self-hosted` runner label, and can narrow the matrix with `variant_filter` and `platform_filter` inputs for fast iteration. Publishing still requires `push=true`, the canonical `Mesh-LLM/mesh-llm` source repository, and a release tag/ref-version match.

## Image matrix

`packaging/images.json` defines the supported rows. Initial release families are:

- Ubuntu CPU
- Ubuntu Vulkan
- Ubuntu CUDA 12.6, 12.8, 13.2
- Ubuntu ROCm 7.0, 7.1, 7.2
- Alpine CPU
- Alpine Vulkan

CUDA and ROCm rows intentionally start on `linux/amd64`. CPU and Vulkan rows include `linux/amd64` and `linux/arm64` where the distro/toolchain stack is expected to be available.

GPU backend support is toolkit-window-specific. See `docs/matrix.md` for the CUDA SM, ROCm gfx, and Vulkan support tables that explain when to keep separate backend-version rows for architecture compatibility.

## Artifact pipeline

The release workflow avoids rebuilding platform-independent artifacts in every image row:

```text
resolve mesh-llm ref -> immutable source commit SHA shared by all artifact jobs
build-ui job       -> upload mesh-llm-ui-<version> once per mesh-llm release
build-llama jobs   -> upload one llama.cpp ABI artifact per distro/backend/platform
build matrix jobs  -> download UI + llama ABI, run Cargo directly against the restored ABI, upload binary artifact
package jobs       -> download matching binary artifact, copy it into the runtime image, publish tags
```

The Dockerfile exposes matching targets: `ui-artifact`, `llama-artifact`, `binary-artifact`, and `runtime`. The binary target intentionally does not call the full `mesh-llm/scripts/build-linux.sh` helper because that helper prepares and builds llama.cpp; instead it validates the restored llama ABI directory and runs the release Cargo build with the same backend features and linker settings. Cargo registry/git caches, BuildKit cache mounts, and `sccache` speed up repeated Rust and native compilation, but only the UI dist, llama ABI directory, and final binary are treated as correctness artifacts. The original release ref is retained for display/policy checks; the resolved commit SHA is what controls the source checkout and OCI revision label.

## Local validation

```bash
python3 scripts/image-matrix.py validate
python3 scripts/image-matrix.py github-matrix --version v0.66.0 --image ghcr.io/mesh-llm/mesh-llm
```

## Tag format

Tags are explicit and architecture-aware:

```text
<version>-<distro>-<arch>-<backend>[backend-version]
<distro>-<arch>-<backend>[backend-version]
```

Examples:

```text
ghcr.io/mesh-llm/mesh-llm:0.66.0-ubuntu-amd64-cuda12.8
ghcr.io/mesh-llm/mesh-llm:ubuntu-amd64-cuda12.8
ghcr.io/mesh-llm/mesh-llm:0.66.0-alpine-arm64-vulkan
```

Image versions accept release semver and prerelease suffixes, but not semver build metadata (`+...`) because Docker tags do not allow `+`.

See `docs/tagging.md` for details.
