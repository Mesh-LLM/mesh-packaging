# Image and package naming

OCI tags are newline-separated Buildx inputs:

```text
<version>-<distro>-<arch>-<backend>[backend-version]
<distro>-<arch>-<backend>[backend-version]
```

Examples: `0.73.1-ubuntu-arm64-cuda13.1.2`, `ubuntu-arm64-cuda13.1.2`, and `0.73.1-arch-amd64-vulkan`. The versioned tag is immutable; the unversioned convenience tag may move only after the matching versioned image succeeds.

Package filenames follow `mesh-llm-<version>-<distro>-<arch>-<backend>[backend-version].<format>`. This makes the package installed in an image traceable without inspecting registry metadata.

There is no generic `latest` GPU tag and no implicit multi-architecture tag.
Standard OCI labels record source, version, immutable upstream revision,
release ref, backend/backend version, neutral-host digest, selected runtime ID,
and runtime digest. Different backend tags for the same OS/architecture must
name the same host digest.
