# Provision a Windows guest with the mesh-llm build prerequisites.
#
# Runs once from install.bat at the end of the unattended install, under
# Windows PowerShell 5.1 (the only shell a fresh Windows Server has), so it
# avoids PowerShell 7 syntax. Every tool is pinned to one version; downloads
# whose publisher states a SHA-256 are checked against it, the others have
# their digest recorded in versions.txt.
#
# Tool versions follow mesh-llm's Windows CI: CUDA 12.6.3 and Vulkan SDK
# 1.4.328.1 (`WINDOWS_CUDA_VERSION`, `WINDOWS_VULKAN_SDK_VERSION`), and the
# HIP SDK through mesh-llm's own scripts/install-windows-sdk.ps1, so the guest
# and the hosted runners install it the same way.

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Root = $PSScriptRoot
$Cache = 'C:\mesh-guest\downloads'
$Tools = 'C:\mesh-guest\bin'
$Inventory = Join-Path $Root 'versions.txt'
New-Item -ItemType Directory -Force -Path $Cache, $Tools | Out-Null

# mesh-llm commit whose scripts/install-windows-sdk.ps1 installs the HIP SDK.
$MeshLlmRef = 'e506096c5'

function Write-Step([string]$Message) {
    Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $Message)
}

function Add-MachinePath([string]$Dir) {
    $current = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    if (($current -split ';') -notcontains $Dir) {
        [Environment]::SetEnvironmentVariable('Path', "$current;$Dir", 'Machine')
    }
    if (($env:Path -split ';') -notcontains $Dir) {
        $env:Path = "$env:Path;$Dir"
    }
}

function Get-Download {
    param([string]$Name, [string]$Url, [string]$Sha256 = '')
    $file = Join-Path $Cache $Name
    if (-not (Test-Path $file)) {
        Write-Step "download $Name"
        Invoke-WebRequest -Uri $Url -OutFile $file -UseBasicParsing
    }
    $actual = (Get-FileHash -Algorithm SHA256 -Path $file).Hash.ToLowerInvariant()
    if ($Sha256) {
        if ($actual -ne $Sha256.ToLowerInvariant()) {
            throw "$Name SHA-256 mismatch: expected $Sha256, got $actual"
        }
        Add-Content $Inventory "$Name sha256=$actual (verified)"
    } else {
        Add-Content $Inventory "$Name sha256=$actual (recorded, no published digest)"
    }
    return $file
}

function Invoke-Installer {
    param([string]$File, [string[]]$Arguments)
    $process = Start-Process -FilePath $File -ArgumentList $Arguments -Wait -PassThru -NoNewWindow
    # 3010: success, reboot required; the guest reboots once at the end.
    if ($process.ExitCode -ne 0 -and $process.ExitCode -ne 3010) {
        throw "$File exited with $($process.ExitCode)"
    }
}

function Expand-ToolZip([string]$Zip, [string]$Exe) {
    $dest = Join-Path $Cache ([IO.Path]::GetFileNameWithoutExtension($Zip))
    Expand-Archive -Path $Zip -DestinationPath $dest -Force
    $found = Get-ChildItem -Path $dest -Recurse -Filter $Exe | Select-Object -First 1
    if (-not $found) { throw "$Exe not found in $Zip" }
    Copy-Item $found.FullName (Join-Path $Tools $Exe) -Force
}

# Re-running the script (after a failed step, or to repair a guest) skips
# what is already installed at the pinned version, since some installers fail
# when run over their own install.
function Test-Installed([string]$What, [scriptblock]$Check) {
    $present = $false
    try { $present = [bool](& $Check) } catch { $present = $false }
    if ($present) {
        Write-Step "$What already installed, skipped"
        Add-Content $Inventory "${What}: already installed"
    }
    return $present
}

function Get-FirstLine([string]$Exe, [string]$Arg) {
    if (-not (Test-Path $Exe)) { return '' }
    return [string](& $Exe $Arg 2>&1 | Select-Object -First 1)
}

Set-Content $Inventory "mesh-llm Windows guest, provisioned $(Get-Date -Format s)"
Add-MachinePath $Tools

# Remote access for whoever runs the guest: OpenSSH, key-only when a key is
# supplied next to this script (authorized_keys), as the lab runner and the
# validation harness use it.
Write-Step 'OpenSSH server'
if (-not (Get-Service sshd -ErrorAction SilentlyContinue)) {
    Add-WindowsCapability -Online -Name 'OpenSSH.Server~~~~0.0.1.0' | Out-Null
}
$keys = Join-Path $Root 'authorized_keys'
if (Test-Path $keys) {
    $adminKeys = 'C:\ProgramData\ssh\administrators_authorized_keys'
    New-Item -ItemType Directory -Force -Path (Split-Path $adminKeys) | Out-Null
    Copy-Item $keys $adminKeys -Force
    icacls.exe $adminKeys /inheritance:r /grant 'Administrators:F' /grant 'SYSTEM:F' | Out-Null
}
Set-Service sshd -StartupType Automatic
Start-Service sshd
if (-not (Get-NetFirewallRule -Name 'mesh-guest-sshd' -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name 'mesh-guest-sshd' -DisplayName 'OpenSSH (mesh guest)' -Protocol TCP -LocalPort 22 -Action Allow | Out-Null
}

Write-Step 'PowerShell 7.7.0'
$zip = Get-Download 'PowerShell-7.7.0-win-x64.zip' 'https://github.com/PowerShell/PowerShell/releases/download/v7.7.0/PowerShell-7.7.0-win-x64.zip' '7c74e03b20a75b59715847439d046a6214b1863ee79b187872980f139bb4a05f'
Expand-Archive -Path $zip -DestinationPath 'C:\Program Files\PowerShell\7' -Force
Add-MachinePath 'C:\Program Files\PowerShell\7'

Write-Step 'Git 2.56.1'
if (-not (Test-Installed 'Git 2.56.1' { (Get-FirstLine 'C:\Program Files\Git\cmd\git.exe' '--version') -match '2\.56\.1' })) {
    $git = Get-Download 'Git-2.56.1-64-bit.exe' 'https://github.com/git-for-windows/git/releases/download/v2.56.1.windows.1/Git-2.56.1-64-bit.exe' 'c330c72e10b408cc39994bfefdb63542b0d93d21699325c3e0bd874af8a5a559'
    Invoke-Installer $git @('/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/SUPPRESSMSGBOXES')
}
Add-MachinePath 'C:\Program Files\Git\cmd'
Add-MachinePath 'C:\Program Files\Git\bin'

Write-Step 'CMake 4.4.5'
if (-not (Test-Installed 'CMake 4.4.5' { (Get-FirstLine 'C:\Program Files\CMake\bin\cmake.exe' '--version') -match '4\.4\.5' })) {
    $cmake = Get-Download 'cmake-4.4.5-windows-x86_64.msi' 'https://github.com/Kitware/CMake/releases/download/v4.4.5/cmake-4.4.5-windows-x86_64.msi' 'c18b52b4017c4e5ffcd7d516ea39c4e0ed37f58920b90a5c98a46280b1857145'
    Invoke-Installer 'msiexec.exe' @('/i', "`"$cmake`"", '/qn', '/norestart', 'ADD_CMAKE_TO_PATH=System')
}

Write-Step 'Ninja 1.13.2, sccache 0.16.0, just 1.59.0'
Expand-ToolZip (Get-Download 'ninja-win.zip' 'https://github.com/ninja-build/ninja/releases/download/v1.13.2/ninja-win.zip' '07fc8261b42b20e71d1720b39068c2e14ffcee6396b76fb7a795fb460b78dc65') 'ninja.exe'
# 0.16.0, as mesh-llm's Windows CI and developer bootstrap pin it: sccache 0.17+
# expands Cargo's rustc argfile, and with Rust 1.100's build-dir layout that
# command line passes the Windows limit (os error 206, mozilla/sccache#2787).
# Re-running this script replaces a newer copy, since Expand-ToolZip overwrites.
Expand-ToolZip (Get-Download 'sccache-v0.16.0-x86_64-pc-windows-msvc.zip' 'https://github.com/mozilla/sccache/releases/download/v0.16.0/sccache-v0.16.0-x86_64-pc-windows-msvc.zip' 'b8514ed7552e148b0a032114f745118dcb801791adafafeaf9935e4bfb0edf1b') 'sccache.exe'
Expand-ToolZip (Get-Download 'just-1.59.0-x86_64-pc-windows-msvc.zip' 'https://github.com/casey/just/releases/download/1.59.0/just-1.59.0-x86_64-pc-windows-msvc.zip' '9c5463e2d0974e31bee71346aa5cbf19167de1585a4abc1bae7b3b04604ea9c0') 'just.exe'

Write-Step 'Visual Studio 2022 Build Tools (MSVC, Windows SDK)'
$vswhere = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'
if (-not (Test-Installed 'Visual Studio Build Tools (VC tools)' { (Test-Path $vswhere) -and (& $vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath) })) {
    $vs = Get-Download 'vs_BuildTools.exe' 'https://aka.ms/vs/17/release/vs_BuildTools.exe'
    Invoke-Installer $vs @(
        '--quiet', '--wait', '--norestart', '--nocache',
        '--add', 'Microsoft.VisualStudio.Workload.VCTools',
        '--add', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64',
        '--add', 'Microsoft.VisualStudio.Component.Windows11SDK.26100',
        '--includeRecommended'
    )
}

Write-Step 'Rust (rustup 1.29.3, stable)'
[Environment]::SetEnvironmentVariable('RUSTUP_HOME', 'C:\Rust\rustup', 'Machine')
[Environment]::SetEnvironmentVariable('CARGO_HOME', 'C:\Rust\cargo', 'Machine')
$env:RUSTUP_HOME = 'C:\Rust\rustup'
$env:CARGO_HOME = 'C:\Rust\cargo'
if (-not (Test-Installed 'Rust (stable)' { Test-Path 'C:\Rust\cargo\bin\rustc.exe' })) {
    $rustup = Get-Download 'rustup-init-1.29.3.exe' 'https://static.rust-lang.org/rustup/archive/1.29.3/x86_64-pc-windows-msvc/rustup-init.exe' '38027d51d69a5d05493627a0634dbea52d6cd793c8f072d2373d3f4163eec7db'
    Invoke-Installer $rustup @('-y', '--no-modify-path', '--profile', 'minimal', '--default-toolchain', 'stable')
}
Add-MachinePath 'C:\Rust\cargo\bin'

Write-Step 'Node 26.13.1 and pnpm 10.34.5'
if (-not (Test-Installed 'Node 26.13.1' { (Get-FirstLine 'C:\Program Files\nodejs\node.exe' '--version') -eq 'v26.13.1' })) {
    $node = Get-Download 'node-v26.13.1-x64.msi' 'https://nodejs.org/dist/v26.13.1/node-v26.13.1-x64.msi' '0398ced8446e119478c724d1aa37c5afd6aa1a76fceab12787eb9714c5ed8b45'
    Invoke-Installer 'msiexec.exe' @('/i', "`"$node`"", '/qn', '/norestart')
}
Add-MachinePath 'C:\Program Files\nodejs'
# Node 25 and later no longer ship corepack; install the pnpm version
# mesh-llm-ui pins (`packageManager`) globally instead.
if (-not (Test-Installed 'pnpm 10.34.5' { (Get-FirstLine 'C:\Program Files\nodejs\pnpm.cmd' '--version') -eq '10.34.5' })) {
    & 'C:\Program Files\nodejs\npm.cmd' install --global --prefix 'C:\Program Files\nodejs' 'pnpm@10.34.5'
    if ($LASTEXITCODE -ne 0) { throw "npm install pnpm exited with $LASTEXITCODE" }
}

Write-Step 'CUDA 12.6.3 (nvcc, cudart, cuBLAS, Visual Studio integration)'
if (-not (Test-Installed 'CUDA 12.6' { Test-Path 'C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.6\bin\nvcc.exe' })) {
    $cuda = Get-Download 'cuda_12.6.3_windows_network.exe' 'https://developer.download.nvidia.com/compute/cuda/12.6.3/network_installers/cuda_12.6.3_windows_network.exe'
    Invoke-Installer $cuda @('-s', 'nvcc_12.6', 'cudart_12.6', 'cublas_12.6', 'cublas_dev_12.6', 'visual_studio_integration_12.6', '-n')
}

Write-Step 'Vulkan SDK 1.4.328.1'
if (-not (Test-Installed 'Vulkan SDK 1.4.328.1' { Test-Path 'C:\VulkanSDK\1.4.328.1\Bin\glslc.exe' })) {
    $vulkan = Get-Download 'vulkansdk-windows-X64-1.4.328.1.exe' 'https://sdk.lunarg.com/sdk/download/1.4.328.1/windows/vulkansdk-windows-X64-1.4.328.1.exe'
    Invoke-Installer $vulkan @('--accept-licenses', '--default-answer', '--confirm-command', 'install')
}

Write-Step 'Vulkan runtime loader 1.4.328.1'
if (-not (Test-Installed 'Vulkan runtime loader' { Test-Path (Join-Path $env:WINDIR 'System32\vulkan-1.dll') })) {
    $vulkanRt = Get-Download 'VulkanRT-X64-1.4.328.1-Installer.exe' 'https://sdk.lunarg.com/sdk/download/1.4.328.1/windows/VulkanRT-X64-1.4.328.1-Installer.exe'
    Invoke-Installer $vulkanRt @('/S')
}

if ($env:MESH_GUEST_SKIP_ROCM -ne '1') {
    Write-Step "HIP SDK (mesh-llm scripts/install-windows-sdk.ps1 at $MeshLlmRef)"
    $hipRoot = Get-ChildItem 'C:\Program Files\AMD\ROCm', 'C:\Program Files\AMD\HIP' -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName 'lib\cmake\hip\hip-config.cmake') } |
        Sort-Object Name -Descending | Select-Object -ExpandProperty FullName -First 1
    if (-not (Test-Installed 'HIP SDK' { $hipRoot })) {
        $sdkScript = Join-Path $Cache 'install-windows-sdk.ps1'
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Mesh-LLM/mesh-llm/$MeshLlmRef/scripts/install-windows-sdk.ps1" -OutFile $sdkScript -UseBasicParsing
        # The script is written for GitHub Actions: it logs under RUNNER_TEMP,
        # and without GITHUB_ENV it only sets ROCM_PATH for its own process,
        # so the machine-wide variables are set below.
        $env:RUNNER_TEMP = $Cache
        & 'C:\Program Files\PowerShell\7\pwsh.exe' -NoProfile -ExecutionPolicy Bypass -File $sdkScript -Backend rocm -InstallerCacheDir $Cache
        if ($LASTEXITCODE -ne 0) { throw "install-windows-sdk.ps1 -Backend rocm exited with $LASTEXITCODE" }
        $hipRoot = Get-ChildItem 'C:\Program Files\AMD\ROCm', 'C:\Program Files\AMD\HIP' -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path (Join-Path $_.FullName 'lib\cmake\hip\hip-config.cmake') } |
            Sort-Object Name -Descending | Select-Object -ExpandProperty FullName -First 1
        if (-not $hipRoot) { throw 'HIP SDK installed, but no ROCm root with hip-config.cmake was found' }
    }
    [Environment]::SetEnvironmentVariable('ROCM_PATH', $hipRoot, 'Machine')
    [Environment]::SetEnvironmentVariable('HIP_PATH', $hipRoot, 'Machine')
    Add-MachinePath (Join-Path $hipRoot 'bin')
}

Write-Step 'inventory'
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine')
foreach ($probe in @(
    @('pwsh', '--version'), @('git', '--version'), @('cmake', '--version'),
    @('ninja', '--version'), @('sccache', '--version'), @('just', '--version'),
    @('rustc', '--version'), @('cargo', '--version'), @('node', '--version')
)) {
    try {
        $out = (& $probe[0] $probe[1] 2>&1 | Select-Object -First 1)
        Add-Content $Inventory "$($probe[0]): $out"
    } catch {
        Add-Content $Inventory "$($probe[0]): MISSING"
    }
}
$nvcc = Get-ChildItem 'C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\*\bin\nvcc.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
Add-Content $Inventory ("nvcc: " + $(if ($nvcc) { $nvcc.FullName } else { 'MISSING' }))
Add-Content $Inventory ("VULKAN_SDK: " + [Environment]::GetEnvironmentVariable('VULKAN_SDK', 'Machine'))
Add-Content $Inventory ("HIP_PATH: " + [Environment]::GetEnvironmentVariable('HIP_PATH', 'Machine'))
$vswhere = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'
if (Test-Path $vswhere) {
    Add-Content $Inventory ("msvc: " + (& $vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationVersion))
}
Set-Content (Join-Path $Root 'provision.done') (Get-Date -Format s)
Write-Step 'done'
