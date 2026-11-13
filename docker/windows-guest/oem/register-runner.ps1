# Register this Windows guest as a persistent GitHub Actions runner.
#
# Run inside a provisioned guest, as Administrator, with a registration token
# from the repository or organization runner settings (it expires after one
# hour and is never stored by this script):
#
#   pwsh -File C:\OEM\register-runner.ps1 -Url https://github.com/Mesh-LLM/mesh-llm -Token <token>
#
# The runner is installed as a Windows service, so it survives guest reboots.
param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Token,
    [string]$Name = $env:COMPUTERNAME,
    [string]$Labels = 'windows,x64,mesh-windows-guest',
    [string]$RunnerDir = 'C:\actions-runner'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$version = '2.338.2'
$zipName = "actions-runner-win-x64-$version.zip"
$sha256 = 'a1f17aa987fc8158bc7521d284912267a0d01b7c2c4684b33c86783b5e8221cc'

New-Item -ItemType Directory -Force -Path $RunnerDir | Out-Null
$zip = Join-Path $RunnerDir $zipName
if (-not (Test-Path $zip)) {
    Invoke-WebRequest -Uri "https://github.com/actions/runner/releases/download/v$version/$zipName" -OutFile $zip -UseBasicParsing
}
$actual = (Get-FileHash -Algorithm SHA256 -Path $zip).Hash.ToLowerInvariant()
if ($actual -ne $sha256) {
    throw "$zipName SHA-256 mismatch: expected $sha256, got $actual"
}
Expand-Archive -Path $zip -DestinationPath $RunnerDir -Force

Push-Location $RunnerDir
try {
    & .\config.cmd --unattended --url $Url --token $Token --name $Name --labels $Labels --runasservice --replace
    if ($LASTEXITCODE -ne 0) { throw "config.cmd exited with $LASTEXITCODE" }
} finally {
    Pop-Location
}
