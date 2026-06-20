$ErrorActionPreference = "Stop"

$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"
$CYAN = "Cyan"
$MAGENTA = "Magenta"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

function ShowMenu() {
    Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor $CYAN
    Write-Host "  Kambuja POS Git Push Menu" -ForegroundColor $CYAN
    Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor $CYAN
    
    Write-Host "Backend (Spring Boot)" -ForegroundColor $GREEN
    Write-Host "  1)  Update backend API endpoints"
    Write-Host "  2)  Fix backend bug"
    Write-Host "  3)  Add backend feature"
    Write-Host "  4)  Update backend security/auth"
    Write-Host "  5)  Update database schema/MongoDB`n"
    
    Write-Host "Frontend (Admin Manager)" -ForegroundColor $GREEN
    Write-Host "  6)  Update admin manager UI"
    Write-Host "  7)  Fix admin manager bug"
    Write-Host "  8)  Add admin manager feature`n"
    
    Write-Host "Frontend (Admin / Cashier)" -ForegroundColor $GREEN
    Write-Host "  9)  Update admin/cashier UI"
    Write-Host "  10) Fix admin/cashier bug"
    Write-Host "  11) Add admin/cashier feature`n"
    
    Write-Host "Telegram Bot" -ForegroundColor $GREEN
    Write-Host "  12) Update telegram bot"
    Write-Host "  13) Fix telegram bot webhook"
    Write-Host "  14) Add telegram bot feature`n"
    
    Write-Host "Infrastructure & Configuration" -ForegroundColor $GREEN
    Write-Host "  15) Update environment configuration"
    Write-Host "  16) Update dependencies"
    Write-Host "  17) Update dev scripts (dev.ps1, setup.ps1)"
    Write-Host "  18) Update documentation`n"
    
    Write-Host "General" -ForegroundColor $GREEN
    Write-Host "  19) Refactor code"
    Write-Host "  20) Update tests"
    Write-Host "  21) Performance improvements"
    Write-Host "  22) Security updates"
    Write-Host "  23) General bug fixes"
    Write-Host "  24) Work in progress (WIP)`n"
    
    Write-Host "Quick Actions" -ForegroundColor $GREEN
    Write-Host "  25) Quick commit (default message)"
    Write-Host "  26) Custom commit message`n"
    
    Write-Host "0)  Cancel and exit`n" -ForegroundColor $RED
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $CYAN
}

$Msg = ""
if ($args.Count -ge 1) {
    $Msg = $args[0]
} else {
    ShowMenu
    $Choice = Read-Host "Select an option [0-26]"
    switch ($Choice) {
        "1"  { $Msg = "Update backend API endpoints" }
        "2"  { $Msg = "Fix backend bug" }
        "3"  { $Msg = "Add backend feature" }
        "4"  { $Msg = "Update backend security/auth" }
        "5"  { $Msg = "Update database schema/MongoDB" }
        "6"  { $Msg = "Update admin manager UI" }
        "7"  { $Msg = "Fix admin manager bug" }
        "8"  { $Msg = "Add admin manager feature" }
        "9"  { $Msg = "Update admin/cashier UI" }
        "10" { $Msg = "Fix admin/cashier bug" }
        "11" { $Msg = "Add admin/cashier feature" }
        "12" { $Msg = "Update telegram bot" }
        "13" { $Msg = "Fix telegram bot webhook" }
        "14" { $Msg = "Add telegram bot feature" }
        "15" { $Msg = "Update environment configuration" }
        "16" { $Msg = "Update dependencies" }
        "17" { $Msg = "Update dev scripts" }
        "18" { $Msg = "Update documentation" }
        "19" { $Msg = "Refactor code" }
        "20" { $Msg = "Update tests" }
        "21" { $Msg = "Performance improvements" }
        "22" { $Msg = "Security updates" }
        "23" { $Msg = "General bug fixes" }
        "24" { $Msg = "WIP: Work in progress" }
        "25" { $Msg = "Update project" }
        "26" { 
            $Msg = Read-Host "Enter custom commit message"
            if ([string]::IsNullOrWhiteSpace($Msg)) {
                Write-Host "Error: Commit message cannot be empty" -ForegroundColor $RED
                exit 1
            }
        }
        "0" { Write-Host "Cancelled." -ForegroundColor $YELLOW; exit 0 }
        default { Write-Host "Invalid choice. Exiting." -ForegroundColor $RED; exit 1 }
    }
}

function ShowRebaseConflictHelp() {
    Write-Host "`nRebase failed. Resolve conflicts, then continue manually." -ForegroundColor $RED
    Write-Host "Run:" -ForegroundColor $YELLOW
    Write-Host "  git status"
    Write-Host "  git add ."
    Write-Host "  git rebase --continue"
    Write-Host "Or cancel with:" -ForegroundColor $YELLOW
    Write-Host "  git rebase --abort"
}

Write-Host "`nChecking repository state..." -ForegroundColor $BLUE
git rev-parse --is-inside-work-tree >$null 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "Error: Not inside a Git repository." -ForegroundColor $RED; exit 1 }

if ((Test-Path ".git\rebase-merge") -or (Test-Path ".git\rebase-apply") -or (Test-Path ".git\MERGE_HEAD")) {
    Write-Host "Error: A rebase or merge is already in progress." -ForegroundColor $RED
    Write-Host "Run git status, then finish or abort the current operation." -ForegroundColor $YELLOW
    exit 1
}

Write-Host "`nChecking current branch..." -ForegroundColor $BLUE
$CurrentBranch = (git symbolic-ref --quiet --short HEAD 2>$null)
if (-not $CurrentBranch) { Write-Host "Error: Detached HEAD mode." -ForegroundColor $RED; exit 1 }
if ($CurrentBranch -ne "main") { Write-Host "Error: This script only pushes from main." -ForegroundColor $RED; exit 1 }
Write-Host "Already on main branch" -ForegroundColor $GREEN

Write-Host "`nRunning validation (tests)..." -ForegroundColor $BLUE
& "$ScriptDir\test.ps1"

Write-Host "`nFetching latest changes from origin/main..." -ForegroundColor $BLUE
git fetch origin --prune
git ls-remote --exit-code --heads origin main >$null 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "Error: origin/main not found." -ForegroundColor $RED; exit 1 }

Write-Host "`nChecking for changes..." -ForegroundColor $BLUE
git add -A
$Status = git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "No changes to commit." -ForegroundColor $YELLOW
    $Local = (git rev-parse HEAD)
    $Remote = (git rev-parse origin/main)
    if ($Local -eq $Remote) {
        Write-Host "✓ Already up to date with origin/main" -ForegroundColor $GREEN
        exit 0
    }
    
    Write-Host "Rebasing existing local commits on origin/main..." -ForegroundColor $BLUE
    git pull --rebase origin main
    if ($LASTEXITCODE -ne 0) { ShowRebaseConflictHelp; exit 1 }
    
    if ((git rev-parse HEAD) -ne (git rev-parse origin/main)) {
        Write-Host "Pushing existing local commits to main branch..." -ForegroundColor $BLUE
        git push origin main
    } else {
        Write-Host "✓ Up to date with origin/main" -ForegroundColor $GREEN
    }
    exit 0
}

Write-Host "`nFiles to be committed:" -ForegroundColor $CYAN
git diff --cached --name-status | ForEach-Object {
    if ($_ -match "^A\s+(.*)") { Write-Host "  [Added]    $($Matches[1])" -ForegroundColor $GREEN }
    elseif ($_ -match "^M\s+(.*)") { Write-Host "  [Modified] $($Matches[1])" -ForegroundColor $YELLOW }
    elseif ($_ -match "^D\s+(.*)") { Write-Host "  [Deleted]  $($Matches[1])" -ForegroundColor $RED }
    else { Write-Host "  $_" }
}

Write-Host "`nCommit message: " -NoNewline -ForegroundColor $CYAN; Write-Host $Msg -ForegroundColor $MAGENTA

$Confirm = Read-Host "`nProceed with commit and push to main? [Y/n]"
if ($Confirm -match "^[Nn]") {
    Write-Host "Cancelled by user." -ForegroundColor $YELLOW
    git reset >$null 2>&1
    exit 0
}

Write-Host "`nCommitting changes..." -ForegroundColor $BLUE
git commit -m "$Msg"

Write-Host "Rebasing on origin/main..." -ForegroundColor $BLUE
git pull --rebase origin main
if ($LASTEXITCODE -ne 0) { ShowRebaseConflictHelp; exit 1 }

Write-Host "Pushing to main branch..." -ForegroundColor $BLUE
git push origin main

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor $GREEN
Write-Host "✓ Successfully pushed to main branch!" -ForegroundColor $GREEN
Write-Host "✓ Commit: $Msg" -ForegroundColor $GREEN
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor $GREEN
