$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$BackendDir = Join-Path $ProjectRoot "Backend"
$FrontendDir = Join-Path $ProjectRoot "Frontend"
$LogDir = Join-Path $ProjectRoot "logs"
$BackendEnvPath = Join-Path $BackendDir ".env"

function Get-DotEnvValue([string]$Path, [string]$Name, [string]$DefaultValue) {
    if (-not (Test-Path $Path)) { return $DefaultValue }

    $Line = Get-Content $Path |
        Where-Object { $_ -match "^\s*$([regex]::Escape($Name))=" } |
        Select-Object -First 1

    if (-not $Line) { return $DefaultValue }
    return (($Line -split "=", 2)[1].Trim().Trim('"').Trim("'"))
}

function Log([string]$Message) { Write-Host "[DEV] $Message" -ForegroundColor Green }
function Info([string]$Message) { Write-Host "[DEV] $Message" -ForegroundColor Cyan }
function Fail([string]$Message) { Write-Host "[DEV] $Message" -ForegroundColor Red; exit 1 }

function Assert-PortFree([int]$Port, [string]$Label) {
    $Connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($Connections) {
        $Pids = ($Connections | Select-Object -ExpandProperty OwningProcess -Unique) -join ", "
        Fail "$Label port $Port is already in use by PID(s): $Pids"
    }
}

function Wait-ForPort([int]$Port, [string]$Label, [int]$Retries = 30) {
    for ($Attempt = 0; $Attempt -lt $Retries; $Attempt++) {
        if (Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) {
            Log "$Label ready on port $Port"
            return
        }
        Start-Sleep -Seconds 1
    }
    Fail "$Label did not start on port $Port within $Retries seconds"
}

function Ensure-MongoDB([string]$MongoUri) {
    try {
        $ParsedUri = [Uri]$MongoUri
    }
    catch {
        Fail "MONGODB_URI is invalid"
    }

    $MongoHost = $ParsedUri.Host
    $MongoPort = if ($ParsedUri.Port -gt 0) { $ParsedUri.Port } else { 27017 }

    if (Test-NetConnection -ComputerName $MongoHost -Port $MongoPort -InformationLevel Quiet -WarningAction SilentlyContinue) {
        return
    }

    if (($MongoHost -ne "localhost") -and ($MongoHost -ne "127.0.0.1")) {
        Fail "MongoDB is not reachable through MONGODB_URI"
    }

    $Mongod = Get-Command mongod.exe -ErrorAction SilentlyContinue
    if (-not $Mongod) { $Mongod = Get-Command mongod -ErrorAction SilentlyContinue }
    if (-not $Mongod) { Fail "MongoDB is not running and mongod was not found" }

    $MongoDataDir = Join-Path $ProjectRoot "data\mongodb"
    $MongoLog = Join-Path $LogDir "mongodb.log"
    New-Item -ItemType Directory -Path $MongoDataDir -Force | Out-Null

    Log "Starting local MongoDB on port $MongoPort..."
    $script:Processes += Start-Process $Mongod.Source `
        -ArgumentList "--dbpath", $MongoDataDir, "--bind_ip", "127.0.0.1", "--port", "$MongoPort", "--logpath", $MongoLog, "--logappend" `
        -WindowStyle Hidden `
        -PassThru

    Wait-ForPort $MongoPort "MongoDB"
}

$RunBackend = $true
$RunFrontend = $true

foreach ($Arg in $args) {
    switch ($Arg) {
        "--no-backend" { $RunBackend = $false }
        "--no-frontend" { $RunFrontend = $false }
        "--help" {
            Write-Host @"
Usage: .\scripts\ps1\dev.ps1 [options]

Options:
  --no-backend   Skip Backend.
  --no-frontend  Skip Frontend.
  --help         Show this help.
"@
            exit 0
        }
        default { Fail "Unknown option: $Arg" }
    }
}

if (-not (Test-Path (Join-Path $BackendDir "package.json"))) {
    Fail "Backend\package.json was not found"
}
if (-not (Test-Path (Join-Path $FrontendDir "package.json"))) {
    Fail "Frontend\package.json was not found"
}

New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

$ServerPort = Get-DotEnvValue $BackendEnvPath "SERVER_PORT" "5000"
$BackendPort = [int](Get-DotEnvValue $BackendEnvPath "PORT" $ServerPort)
$FrontendPort = if ($env:FRONTEND_PORT) { [int]$env:FRONTEND_PORT } else { 5173 }
$MongoUri = Get-DotEnvValue $BackendEnvPath "MONGODB_URI" "mongodb://localhost:27017/kambuja_pos"
$Processes = @()

if ($RunBackend) { Assert-PortFree $BackendPort "Backend" }
if ($RunFrontend) { Assert-PortFree $FrontendPort "Frontend" }

try {
    if ($RunBackend) {
        Ensure-MongoDB $MongoUri
        Log "Migrating roles and ensuring configured ADMIN_MANAGER exists..."
        Push-Location $BackendDir
        try {
            & npm.cmd run migrate:roles
            if ($LASTEXITCODE -ne 0) { Fail "Backend role migration failed" }
            & npm.cmd run seed
            if ($LASTEXITCODE -ne 0) { Fail "Backend seed failed" }
        }
        finally {
            Pop-Location
        }

        Log "Starting Backend..."
        $BackendLog = Join-Path $LogDir "backend.log"
        $BackendErrorLog = Join-Path $LogDir "backend-error.log"
        $Processes += Start-Process "npm.cmd" `
            -ArgumentList "run", "start:dev" `
            -WorkingDirectory $BackendDir `
            -RedirectStandardOutput $BackendLog `
            -RedirectStandardError $BackendErrorLog `
            -WindowStyle Hidden `
            -PassThru
        Info "Backend logs: logs\backend.log and logs\backend-error.log"
        Wait-ForPort $BackendPort "Backend"
    }

    if ($RunFrontend) {
        Log "Starting Frontend..."
        $FrontendLog = Join-Path $LogDir "frontend.log"
        $FrontendErrorLog = Join-Path $LogDir "frontend-error.log"
        $Processes += Start-Process "npm.cmd" `
            -ArgumentList "run", "dev", "--", "--port", "$FrontendPort", "--strictPort" `
            -WorkingDirectory $FrontendDir `
            -RedirectStandardOutput $FrontendLog `
            -RedirectStandardError $FrontendErrorLog `
            -WindowStyle Hidden `
            -PassThru
        Info "Frontend logs: logs\frontend.log and logs\frontend-error.log"
        Wait-ForPort $FrontendPort "Frontend"
    }

    Write-Host ""
    if ($RunBackend) { Write-Host "Backend:  http://localhost:$BackendPort" -ForegroundColor Cyan }
    if ($RunFrontend) { Write-Host "Frontend: http://localhost:$FrontendPort" -ForegroundColor Cyan }
    Write-Host "Press Ctrl+C to stop services." -ForegroundColor Yellow

    while ($true) { Start-Sleep -Seconds 1 }
}
finally {
    foreach ($Process in $Processes) {
        if ($Process -and -not $Process.HasExited) {
            Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
