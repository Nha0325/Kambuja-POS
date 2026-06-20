$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

$SkipBackend = $false
$SkipFrontend = $false
$SkipToolCheck = $false

for ($i = 0; $i -lt $args.Count; $i++) {
    switch ($args[$i]) {
        "--skip-backend" { $SkipBackend = $true }
        "--skip-frontend" { $SkipFrontend = $true }
        "--skip-tool-check" { $SkipToolCheck = $true }
    }
}

function Section($Title) { Write-Host "`n$Title" -ForegroundColor Cyan }
function Info($Msg) { Write-Host "  $Msg" -ForegroundColor Green }
function Warn($Msg) { Write-Host "  WARNING: $Msg" -ForegroundColor Yellow }
function Err($Msg) { Write-Host "  ERROR: $Msg" -ForegroundColor Red }

Section "[1/5] Checking required tools"
if ($SkipToolCheck) {
    Info "Skipping tool checks"
} else {
    foreach ($Tool in @("git", "mongosh")) {
        if (Get-Command $Tool -ErrorAction SilentlyContinue) {
            Info "$Tool found."
        } else {
            Err "$Tool is missing."
        }
    }
    if (-not $SkipBackend) {
        if (Get-Command java -ErrorAction SilentlyContinue) {
            Info "java found."
        } else {
            Err "java (JDK 21+) is missing."
        }
    }
    if (-not $SkipFrontend) {
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Info "node found."
        } else {
            Err "node (v20+) is missing."
        }
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            Info "npm found."
        } else {
            Err "npm is missing."
        }
    }
}

Section "[2/5] Preparing env files"
if (-not (Test-Path "$ProjectRoot\.env")) {
    Copy-Item "$ProjectRoot\.env.example" "$ProjectRoot\.env"
    Info "Created .env from .env.example"
    Warn "Replace JWT_SECRET, BOOTSTRAP_ADMIN_MANAGER_PASSWORD, and TELEGRAM_BOT_TOKEN before running."
} else {
    Info ".env already exists"
}

Section "[3/5] Install frontend dependencies"
if ($SkipFrontend) {
    Info "Skipped"
} else {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Info "Installing apps\web-admin-manager..."
        Push-Location "$ProjectRoot\apps\web-admin-manager"
        npm ci --no-audit --no-fund
        Pop-Location

        Info "Installing apps\web-admin..."
        Push-Location "$ProjectRoot\apps\web-admin"
        npm ci --no-audit --no-fund
        Pop-Location
    }
}

Section "[4/5] Backend check"
if ($SkipBackend) {
    Info "Skipped"
} else {
    if (Test-Path "$ProjectRoot\apps\api\mvnw.cmd") {
        Info "Resolving backend dependencies..."
        Push-Location "$ProjectRoot\apps\api"
        .\mvnw.cmd -q -DskipTests dependency:go-offline
        Pop-Location
    } else {
        Err "apps\api\mvnw.cmd not found."
    }
}

Section "[5/5] Summary"
Write-Host "`nSetup completed." -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  .\scripts\ps1\dev.ps1" -ForegroundColor Cyan
