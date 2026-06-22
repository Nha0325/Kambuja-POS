$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$BackendDir = Join-Path $ProjectRoot "Backend"
$FrontendDir = Join-Path $ProjectRoot "Frontend"

$SkipBackend = $false
$SkipFrontend = $false
$SkipToolCheck = $false
$RunBackend = $false
$RunFrontend = $false

foreach ($Arg in $args) {
    switch ($Arg) {
        "--skip-backend" { $SkipBackend = $true }
        "--skip-frontend" { $SkipFrontend = $true }
        "--skip-tool-check" { $SkipToolCheck = $true }
        "--run-backend" { $RunBackend = $true }
        "--run-frontend" { $RunFrontend = $true }
        "--help" {
            Write-Host @"
Usage: .\scripts\ps1\setup.ps1 [options]

Options:
  --skip-backend     Skip Backend dependency installation.
  --skip-frontend    Skip Frontend dependency installation.
  --skip-tool-check  Skip Node.js and npm checks.
  --run-backend      Start Backend after setup.
  --run-frontend     Start Frontend after setup.
  --help             Show this help.
"@
            exit 0
        }
        default { Write-Host "Unknown option: $Arg" -ForegroundColor Red; exit 1 }
    }
}

function Section([string]$Title) { Write-Host "`n$Title" -ForegroundColor Cyan }
function Info([string]$Message) { Write-Host "  $Message" -ForegroundColor Green }
function Fail([string]$Message) { Write-Host "  ERROR: $Message" -ForegroundColor Red; exit 1 }

function Prepare-Env([string]$Target, [string]$Example) {
    if (Test-Path $Target) {
        Info "$Target already exists"
        return
    }
    if (-not (Test-Path $Example)) { Fail "Missing env template: $Example" }
    Copy-Item $Example $Target
    Info "Created $Target from template"
}

function Install-Dependencies([string]$Directory, [string]$Label) {
    if (-not (Test-Path (Join-Path $Directory "package.json"))) {
        Fail "$Label\package.json was not found"
    }

    Push-Location $Directory
    try {
        if (Test-Path "package-lock.json") {
            Info "Running npm ci in $Label"
            npm.cmd ci --no-audit --no-fund
        }
        else {
            Info "Running npm install in $Label"
            npm.cmd install --no-audit --no-fund
        }
        if ($LASTEXITCODE -ne 0) { Fail "Dependency installation failed in $Label" }
    }
    finally {
        Pop-Location
    }
}

Section "[1/4] Checking project structure"
if (-not (Test-Path $BackendDir)) { Fail "Backend directory was not found" }
if (-not (Test-Path $FrontendDir)) { Fail "Frontend directory was not found" }
Info "Project root: $ProjectRoot"

Section "[2/4] Checking required tools"
if ($SkipToolCheck) {
    Info "Skipped"
}
else {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Node.js 20+ is required" }
    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { Fail "npm is required" }

    $NodeVersion = node --version
    $NodeMajor = [int](($NodeVersion -replace "^v", "") -split "\.")[0]
    if ($NodeMajor -lt 20) { Fail "Node.js 20+ is required; found $NodeVersion" }

    Info "Node.js: $NodeVersion"
    Info "npm: $(npm.cmd --version)"
}

Section "[3/4] Preparing environment files"
Prepare-Env (Join-Path $BackendDir ".env") (Join-Path $BackendDir ".env.example")
Prepare-Env (Join-Path $FrontendDir ".env") (Join-Path $FrontendDir ".env.example")

Section "[4/4] Installing dependencies"
if ($SkipBackend) { Info "Backend skipped" } else { Install-Dependencies $BackendDir "Backend" }
if ($SkipFrontend) { Info "Frontend skipped" } else { Install-Dependencies $FrontendDir "Frontend" }

Write-Host "`nSetup completed." -ForegroundColor Green
Write-Host "Run validation: .\scripts\ps1\test.ps1"
Write-Host "Start development: .\scripts\ps1\dev.ps1"

if ($RunBackend -or $RunFrontend) {
    $DevArgs = @()
    if (-not $RunBackend) { $DevArgs += "--no-backend" }
    if (-not $RunFrontend) { $DevArgs += "--no-frontend" }
    & (Join-Path $ScriptDir "dev.ps1") @DevArgs
}
