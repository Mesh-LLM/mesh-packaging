# Windows guest for a persistent self-hosted runner

A Windows Server 2025 virtual machine, run as a Docker container on a Linux host
with KVM, that comes up with every prerequisite needed to build and test
`mesh-llm` on Windows. Its purpose is a persistent Windows runner on lab
hardware, so Windows jobs do not depend on hosted runner images.

This is a CI image, not a distribution channel. It never contains `mesh-llm`
and it does not follow the `product bundle -> native package -> runtime image`
flow from `AGENTS.md`: it installs build toolchains, and jobs build `mesh-llm`
from source inside it.

## What it installs

`oem/provision.ps1` runs once, at the end of the unattended Windows install,
and pins every tool it can:

| Tool | Version | Verified |
|---|---|---|
| OpenSSH server | Windows capability | |
| PowerShell | 7.7.0 | SHA-256 |
| Git for Windows | 2.56.1 | SHA-256 |
| CMake | 4.4.5 | SHA-256 |
| Ninja | 1.13.2 | SHA-256 |
| sccache | 0.16.0, the version mesh-llm's Windows CI pins | SHA-256 |
| just | 1.59.0 | SHA-256 |
| Visual Studio 2022 Build Tools | VC tools, Windows 11 SDK 26100 | vswhere |
| Rust | rustup 1.29.3, stable toolchain | SHA-256 (rustup-init) |
| Node.js | 26.13.1, with pnpm 10.34.5 | SHA-256 (installer) |
| CUDA toolkit | 12.6.3: nvcc, cudart, cuBLAS, VS integration | |
| Vulkan SDK and runtime | 1.4.328.1 | |
| AMD HIP SDK | from `mesh-llm` `scripts/install-windows-sdk.ps1` | |

Installers without a published checksum (Build Tools bootstrapper, CUDA, Vulkan,
HIP) have their SHA-256 recorded in `C:\OEM\versions.txt` instead. That file
also lists the version every tool reports once provisioning ends.

The HIP SDK comes from the same script the `mesh-llm` Windows workflows use,
fetched at a pinned commit (`$MeshLlmRef` in `provision.ps1`), so the guest and
hosted CI install the same SDK. Set `MESH_GUEST_SKIP_ROCM=1` in the guest to
skip it.

Every step checks whether its tool is already installed, so the script can be
run again to repair a guest or resume after a failed download.

## Requirements

- A Linux host with KVM (`/dev/kvm`) and Docker Compose.
- 16 GB of RAM and 8 cores for the guest by default. The virtual disk is
  sparse: a provisioned guest uses about 29 GB inside Windows and about 35 GB
  on the host, including the 8 GB evaluation ISO kept in `storage/`.
- Network access to Microsoft, GitHub, NVIDIA, LunarG and AMD download servers.

## Run it

```bash
cd docker/windows-guest
cp ~/.ssh/id_ed25519.pub oem/authorized_keys   # optional: key-based SSH for the administrator
GUEST_PASSWORD='choose-one' docker compose up -d
```

The first start downloads the evaluation ISO from Microsoft, installs Windows,
then runs `oem/provision.ps1`. Follow it on the web console
(`http://127.0.0.1:8006`) or in `C:\OEM\provision.log`. Provisioning is
finished when `C:\OEM\provision.done` exists.

`GUEST_RAM_SIZE`, `GUEST_CPU_CORES`, `GUEST_DISK_SIZE` and `GUEST_USERNAME`
override the defaults. All ports are bound to the host's loopback: 8006 (web
console), 3389 (RDP) and 2222 (SSH to the guest's port 22).

## Register the runner

Inside the guest, as Administrator, with a registration token from the
repository or organization runner settings:

```powershell
pwsh -File C:\OEM\register-runner.ps1 -Url https://github.com/Mesh-LLM/mesh-llm -Token <token>
```

The runner (actions/runner 2.338.2, checksum verified) is installed as a
Windows service with the labels `windows,x64,mesh-windows-guest` and survives
guest restarts. The token is used once and never written to disk by the script.

## Licensing

`VERSION: "2025"` installs the Windows Server 2025 evaluation, which runs for
180 days. A long-lived runner needs a license key or a re-install before it
expires; the provisioning script runs again on a fresh install.

Visual Studio Build Tools, the CUDA toolkit, the Vulkan SDK and the AMD HIP SDK
are installed under their vendors' licenses, accepted non-interactively by
`provision.ps1`. Whoever runs the guest accepts those licenses.

## Limits

- No GPU is passed through. The guest builds CUDA, Vulkan and HIP backends but
  cannot run them on a device.
- The guest is a full virtual machine: the first start is long, most of it in
  Windows setup, Visual Studio Build Tools and CUDA. Later starts boot the
  existing disk and skip provisioning.
