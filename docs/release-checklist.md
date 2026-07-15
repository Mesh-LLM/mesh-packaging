# Release checklist

## Upstream contract

- [ ] The upstream tag and non-draft GitHub Release exist and the tag resolves to one immutable SHA.
- [ ] Every generated archive and `.sha256` sidecar exists in that release.
- [ ] Archive verification accepts only `mesh-bundle/mesh-llm`; every extracted binary reports the requested version.
- [ ] The full matrix matches the current release asset inventory. Unsupported channels remain disabled rather than inferred.

## Dry-run QA

- [ ] A full `dry_run=true` workflow succeeds with publish jobs skipped.
- [ ] Every native package passes metadata inspection, exact filename/checksum checks, package-manager installation, `mesh-llm --version`, and `mesh-llm runtime list`.
- [ ] Every runtime image installs the matching package artifact and passes the same command smoke tests.
- [ ] The arm64 Homebrew formula installs and tests the upstream Metal archive.
- [ ] The final readiness manifest reports success for plan, upstream, native packages, runtime images, and Homebrew.

## Publication

- [ ] A reviewer confirms the selected publish switches and the `release` environment gate.
- [ ] GHCR tags match `docs/tagging.md`; pushed digests receive provenance attestations.
- [ ] Package release assets contain exact packages, SHA256 manifests, SPDX SBOMs, and the rendered formula.
- [ ] No native runtime bundles or manifest are republished here.
- [ ] The release record names the upstream tag and immutable SHA.

## External automation

- [ ] Upstream has a fine-grained `MESH_AGENT_IMAGES_DISPATCH_TOKEN` or GitHub App installation scoped to this repository.
- [ ] Upstream sends `mesh-llm-release` only after its release is published.
- [ ] The first automated dispatch is observed end-to-end before enabling publication by dispatch payload.
