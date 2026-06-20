$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

$Msg = ""
if ($args.Count -ge 1) {
    $Msg = $args[0]
}

if ([string]::IsNullOrWhiteSpace($Msg)) {
    $Msg = Read-Host "Commit message"
}

if ([string]::IsNullOrWhiteSpace($Msg)) {
    Write-Host "Commit message cannot be empty." -ForegroundColor Red
    exit 1
}

Write-Host "Safe Team Git Sync"
Write-Host "Commit local work, rebase on latest origin/main, then push."
& "$ScriptDir\git-push.ps1" $Msg
