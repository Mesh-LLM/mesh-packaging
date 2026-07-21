# Release checklist

## Upstream contract

- [ ] The upstream tag and non-draft GitHub Release exist and the tag resolves to one immutable SHA.
- [ ] Every generated archive and `.sha256` sidecar exists in that release.
- [ ] Archive verification accepts only `mesh-bundle/mesh-llm` and confirms the extracted Linux payload is an ELF executable. Version startup is proven later inside the matching package/runtime base because GPU binaries require vendor shared libraries.
- [ ] The full matrix matches the current release asset inventory. Unsupported channels remain disabled rather than inferred.

## Dry-run QA

- [ ] A full `dry_run=true` workflow succeeds with publish jobs skipped.
- [ ] Every native package passes metadata inspection, exact filename/checksum checks, package-manager installation, `mesh-llm --version`, and `mesh-llm runtime list`; CUDA command smoke uses only the matching vendor SDK driver stub.
- [ ] Every runtime image installs the matching package artifact. CPU, Vulkan, and ROCm pass command smoke; CUDA resolves every shared dependency except host-injected `libcuda.so.1`.
- [ ] The arm64 Homebrew formula installs and tests the upstream Metal archive.
- [ ] The final readiness manifest reports success for plan, upstream, native packages, runtime images, and Homebrew.

## Publication

- [ ] A reviewer confirms the selected publish switches and the `release` environment gate.
- [ ] GHCR tags match `docs/tagging.md`; pushed digests receive provenance attestations.
- [ ] Package release assets contain exact packages, SHA256 manifests, SPDX SBOMs, and the rendered formula.
- [ ] No native runtime bundles or manifest are republished here.
- [ ] The release record names the upstream tag and immutable SHA.

## External automation

- [ ] Upstream has a fine-grained `MESH_AGENT_IMAGES_DISPATCH_TOKEN` or GitHub App installation with Contents write access scoped to this repository.
- [ ] Upstream sends `mesh-llm-release` only after its complete non-canary release is published, with both publication switches enabled.
- [ ] The first automated dispatch is observed end-to-end before enabling publication by dispatch payload.
- [ ] The existing `ghcr.io/mesh-llm/mesh-llm` package grants Actions write access to `Mesh-LLM/mesh-packaging`.
- [ ] The GHCR package visibility is intentionally selected; public visibility cannot be reverted to private.
