$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

function Run-Npm([string]$Directory, [string[]]$Arguments) {
    Push-Location $Directory
    try {
        & npm.cmd @Arguments
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    finally {
        Pop-Location
    }
}

Write-Host "[TEST] Backend validation" -ForegroundColor Cyan
Run-Npm (Join-Path $ProjectRoot "Backend") @("test")

Write-Host "[TEST] Frontend lint" -ForegroundColor Cyan
Run-Npm (Join-Path $ProjectRoot "Frontend") @("run", "lint")

Write-Host "[TEST] Frontend build" -ForegroundColor Cyan
Run-Npm (Join-Path $ProjectRoot "Frontend") @("run", "build")

Write-Host "[TEST] All validations passed" -ForegroundColor Green
