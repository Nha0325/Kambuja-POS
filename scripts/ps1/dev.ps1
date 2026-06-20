$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

$LogDir = "$ProjectRoot\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$BackendPort = 8080
$ManagerPort = 5173
$WebAdminPort = 5174
$NgrokApiPort = 4040

$RunApi = $true
$RunManager = $true
$RunWebAdmin = $true
$UseNgrok = $false
$UseCloudflare = $false

for ($i = 0; $i -lt $args.Count; $i++) {
    switch ($args[$i]) {
        "--api-only" { $RunManager = $false; $RunWebAdmin = $false }
        "--no-api" { $RunApi = $false }
        "--no-manager" { $RunManager = $false }
        "--no-web-admin" { $RunWebAdmin = $false }
        "--ngrok" { $UseNgrok = $true }
        "--cloudflare" { $UseCloudflare = $true; $UseNgrok = $false }
    }
}

function Log($Msg) { Write-Host "[DEV] $Msg" -ForegroundColor Green }
function Info($Msg) { Write-Host "[DEV] $Msg" -ForegroundColor Cyan }
function Warn($Msg) { Write-Host "[DEV] $Msg" -ForegroundColor Yellow }
function Err($Msg) { Write-Host "[DEV] $Msg" -ForegroundColor Red }

function Kill-Port($Port, $Label) {
    $Conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($Conns) {
        Warn "Stopping existing $Label process on port $Port"
        $Conns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 1
    }
}

function Check-MongoDB() {
    if (Get-Command mongosh -ErrorAction SilentlyContinue) {
        $Uri = "mongodb://localhost:27017/kambuja_pos"
        $EnvPath = "$ProjectRoot\.env"
        if (Test-Path $EnvPath) {
            $Line = Get-Content $EnvPath | Where-Object { $_ -match "^MONGODB_URI=" } | Select-Object -First 1
            if ($Line) { $Uri = ($Line -split "=", 2)[1].Trim('"') }
        }
        
        mongosh $Uri --quiet --eval "db.runCommand({ ping: 1 }).ok" >$null 2>&1
        if ($LASTEXITCODE -ne 0) {
            Err "MongoDB is not reachable through MONGODB_URI."
            exit 1
        }
    }
}

Log "Checking development ports..."
Kill-Port $BackendPort "API"
Kill-Port $ManagerPort "ADMIN_MANAGER"
Kill-Port $WebAdminPort "ADMIN_CASHIER"
if ($UseNgrok) { Kill-Port $NgrokApiPort "ngrok" }
if ($UseCloudflare) {
    Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

$Jobs = @()

$PublicApiUrl = ""
if ($UseCloudflare) {
    if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
        Log "Starting Cloudflare Tunnel..."
        $Jobs += Start-Process cloudflared -ArgumentList "tunnel","--url","http://localhost:$BackendPort","--no-autoupdate" -RedirectStandardOutput "$LogDir\cloudflare-tunnel.log" -RedirectStandardError "$LogDir\cloudflare-tunnel.log" -WindowStyle Hidden -PassThru
    }
} elseif ($UseNgrok) {
    if (Get-Command ngrok -ErrorAction SilentlyContinue) {
        Log "Starting ngrok tunnel..."
        $Jobs += Start-Process ngrok -ArgumentList "http","$BackendPort","--log=stdout" -RedirectStandardOutput "$LogDir\ngrok.log" -RedirectStandardError "$LogDir\ngrok.log" -WindowStyle Hidden -PassThru
    }
}

if ($RunApi) {
    Log "Starting Spring Boot API..."
    Check-MongoDB
    Push-Location "$ProjectRoot\apps\api"
    $Jobs += Start-Process "cmd.exe" -ArgumentList "/c mvnw.cmd spring-boot:run" -RedirectStandardOutput "$LogDir\api.log" -RedirectStandardError "$LogDir\api.log" -WindowStyle Hidden -PassThru
    Pop-Location
    Info "API log -> logs/api.log"
}

if ($RunManager) {
    Log "Starting ADMIN_MANAGER frontend..."
    Push-Location "$ProjectRoot\apps\web-admin-manager"
    $Jobs += Start-Process "cmd.exe" -ArgumentList "/c npm run dev -- --port $ManagerPort --strictPort" -RedirectStandardOutput "$LogDir\web-admin-manager.log" -RedirectStandardError "$LogDir\web-admin-manager.log" -WindowStyle Hidden -PassThru
    Pop-Location
    Info "Manager log -> logs/web-admin-manager.log"
}

if ($RunWebAdmin) {
    Log "Starting ADMIN/CASHIER frontend..."
    Push-Location "$ProjectRoot\apps\web-admin"
    $Jobs += Start-Process "cmd.exe" -ArgumentList "/c npm run dev -- --port $WebAdminPort --strictPort" -RedirectStandardOutput "$LogDir\web-admin.log" -RedirectStandardError "$LogDir\web-admin.log" -WindowStyle Hidden -PassThru
    Pop-Location
    Info "Admin/Cashier log -> logs/web-admin.log"
}

if ($UseCloudflare) {
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Path "$LogDir\cloudflare-tunnel.log") {
            $Line = Get-Content "$LogDir\cloudflare-tunnel.log" | Where-Object { $_ -match "https://[a-z0-9-]+\.trycloudflare\.com" } | Select-Object -First 1
            if ($Line -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
                $PublicApiUrl = $Matches[1]
                break
            }
        }
    }
} elseif ($UseNgrok) {
    Start-Sleep -Seconds 4
    try {
        $Resp = Invoke-RestMethod -Uri "http://localhost:$NgrokApiPort/api/tunnels" -ErrorAction SilentlyContinue
        if ($Resp.tunnels) {
            $PublicApiUrl = $Resp.tunnels[0].public_url
        }
    } catch {}
}

if ($PublicApiUrl) {
    Log "Public API URL: $PublicApiUrl"
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Kambuja POS Dev Environment Started" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
if ($RunApi) { Write-Host "  Backend API     -> http://localhost:$BackendPort" -ForegroundColor Cyan }
if ($RunManager) { Write-Host "  Admin Manager UI-> http://localhost:$ManagerPort" -ForegroundColor Cyan }
if ($RunWebAdmin) { Write-Host "  Admin/Cashier UI-> http://localhost:$WebAdminPort" -ForegroundColor Cyan }
if ($PublicApiUrl) { Write-Host "  Public Tunnel   -> $PublicApiUrl" -ForegroundColor Cyan }
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Logs in ./logs/" -ForegroundColor Yellow
Write-Host "  Close this window or press Ctrl+C to stop services" -ForegroundColor Red
Write-Host ""

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Write-Host "`nShutting down services..." -ForegroundColor Yellow
    foreach ($Job in $Jobs) {
        if (-not $Job.HasExited) { Stop-Process -Id $Job.Id -Force -ErrorAction SilentlyContinue }
    }
}
