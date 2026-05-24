# Image tagging

Tags must make the mesh-llm version, Linux distribution, architecture, backend, and backend version obvious without reading image labels.

## Public tag shape

```text
<version>-<distro>-<arch>-<backend>[backend-version]
<distro>-<arch>-<backend>[backend-version]
```

`<version>` is normalized from the `mesh-llm` release tag by removing a leading `v`. Semver build metadata (`+...`) is intentionally rejected because Docker tags do not allow `+`.

Examples:

```text
0.66.0-ubuntu-amd64-cpu
ubuntu-amd64-cpu
0.66.0-ubuntu-amd64-cuda12.8
ubuntu-amd64-cuda12.8
0.66.0-ubuntu-amd64-rocm7.1
ubuntu-amd64-rocm7.1
0.66.0-alpine-arm64-vulkan
alpine-arm64-vulkan
```

## Why architecture is explicit

The first implementation builds each distro/backend/platform target exactly once. Architecture-specific tags are therefore the canonical tags. Convenience multi-arch manifest tags can be added later without changing the canonical arch tags.

## `latest`

Do not publish `latest` for GPU variants. If a convenience `latest` is added later, it should point only at the default Ubuntu CPU manifest.

## OCI labels

The Dockerfile writes standard OCI labels for source, version, revision, description, and license. Workflows pass the release ref and version from the `mesh-llm-release` dispatch payload.
