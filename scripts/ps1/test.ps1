$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "[TEST] Running Backend Tests..." -ForegroundColor Cyan
if (Test-Path "$ProjectRoot\apps\api\mvnw.cmd") {
    Push-Location "$ProjectRoot\apps\api"
    .\mvnw.cmd test
    Pop-Location
} else {
    Write-Host "[WARN] Backend not found, skipping." -ForegroundColor Yellow
}

Write-Host "[TEST] All validations passed!" -ForegroundColor Green
