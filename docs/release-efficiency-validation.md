# Release efficiency validation, September 7, 2026

The packaging implementation at `37f0aa08950f722e300dddd0fa2180c48dfcf35b`
passed 132 TypeScript tests, with the optional Docker fixture skipped in that
invocation. The separate Docker suite passed all five tests. Independent Debian
and Arch builds produced matching package hashes, dependency stages remained
cached, and no saved image layer contained a package archive. Matrix line,
branch, and function coverage each passed at 100%. Actionlint, ShellCheck,
representative matrix expansions, and diff checks passed.

MeshLLM implementation `cd602d6cba0f505fd9e1b4a6b5d1ca261a0032a0` passed
`just ci-validate`: 821 Python tests passed and seven PowerShell behavior tests
were skipped because the local host lacks `pwsh`. The crate-list, release-target,
console-print, and publish-crates consistency gates passed, as did the changed
embedded Bash checks. A real release-mode UI build and checksum verification
also passed. These are local results, not a GitHub release-run result.

## Published CUDA product in the CPU composer image

The following published artifact was downloaded and verified against both its
checksum sidecar and GitHub's release-asset digest:

- Release: `Mesh-LLM/mesh-llm` `v0.75.1`
- Asset: `mesh-llm-v0.75.1-aarch64-unknown-linux-gnu-cuda-13.tar.gz`
- Asset ID: `508286795`; size: `449784818` bytes
- SHA-256: `00f54b8c308fbd7076868b4ed29d848a894db5ca5503cb7c5b0a38d35560831a`
- CPU image: `ghcr.io/mesh-llm/mesh-llm-cuda-runner@sha256:8d93de6ba30173e825a16fdecf011f9c632edc6e1259df7289e491b0a05f829d`
- Platform: `linux/arm64`

The packaging `scripts/upstream-archive.ts` verifier checked the archive shape,
version/backend, host digest, runtime-tree digest, and runtime manifest digest.
The verified host and import report formed a temporary host input; its checksum
came from the verified product manifest. The extracted runtime supplied the
runtime input. No host or native runtime was compiled or modified.

The unmodified MeshLLM `scripts/ci-compose-product-input.sh` from `cd602d6cb`
then ran inside the pinned CPU image with `INPUT_READINESS_SMOKE=true`, version
`v0.75.1`, and backend `cuda`. Docker used `--platform linux/arm64 --network none`
and no GPU device mounts. Checks confirmed no `/dev/nvidia0` and no `nvcc`.

The command exited zero after verifying the CPU image, validating native library
dependency closure, composing the product, checking version/runtime discovery,
observing client readiness, completing bounded graceful shutdown, and creating
the product archive. The recomposed manifest equaled the published manifest,
and an independent hash check confirmed these unchanged inputs:

| Input | SHA-256 |
| --- | --- |
| Host | `fa694d5baa6be219e23a2a44df3486ccefcf820631ec5bcfeff3949a9a079016` |
| CUDA 13 runtime tree | `533fac736a3dea5bbf43436ba1b6f3cfd34f933ee6b6f2a449d0cfb622b22701` |
| Runtime manifest | `b248b206f61b779348d4d3289c7506b5cad1642851ed5ad7054789a44cda917d` |

This proves composition compatibility for that ARM64 CUDA 13 product in the
CPU image. It does not establish GPU inference performance, other platform
results, new shared-UI host builds, or release-wide timing. The temporary input
did not include the release attestation verifier/key, so this run did not repeat
release signature verification. The production release workflow retains that
check. No verification requirement was removed from repository code.

## Historical metrics

The runner-image classification follow-up passed 25 metrics tests and an
independent review. A live collection of run `34106281467` read 54 jobs and
classified 21 image builds, 21 verification steps, 14 combined index/QA steps,
and 14 promotion steps. Compact image-family IDs remain separate from full
toolkit versions and execution providers. Historical deletion/expiry and rerun
fixtures also pass. See [CI metrics](ci-metrics.md) for collection and comparison
semantics.

## Remaining operational validation

The full native/Homebrew packaging dry run, protected publication handoff, and
multi-platform MeshLLM release canary remain pending. MeshLLM's existing release
workflow accepts manual dispatch only from `main`, so the changed release graph
cannot be exercised by dispatching this feature branch. Preserve that boundary.
After merge, collect the first canary's actual job/step timings before claiming
a speed improvement. Registry mirrors remain disabled pending their separate
measurement gate; CUDA compilation remains on the existing ARC placement.
