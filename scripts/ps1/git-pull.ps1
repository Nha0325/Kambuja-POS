$ErrorActionPreference = "Stop"

# Colors
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"
$CYAN = "Cyan"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location $ProjectRoot

$TargetRemote = "origin"
$TargetBranch = "main"

function Fail($Msg) {
    Write-Host "`nError: $Msg" -ForegroundColor $RED
    exit 1
}

function HasLocalChanges() {
    $Status = git status --porcelain
    return [bool]($Status)
}

function ShowUnfinishedHelp() {
    Write-Host "`nA rebase or merge is already in progress.`n" -ForegroundColor $RED
    Write-Host "To continue:" -ForegroundColor $YELLOW
    Write-Host "  git status"
    Write-Host "  git rebase --continue`n"
    Write-Host "To abort:" -ForegroundColor $YELLOW
    Write-Host "  git rebase --abort"
    Write-Host "  git merge --abort"
}

function ShowPullConflictHelp() {
    Write-Host "`nPull stopped because collaborator code conflicts with your local work.`n" -ForegroundColor $RED
    Write-Host "To fix:" -ForegroundColor $YELLOW
    Write-Host "  git status"
    Write-Host "  Edit conflicted files (look for <<<<<<< markers)"
    Write-Host "  git add ."
    Write-Host "  git rebase --continue`n"
    Write-Host "To cancel:" -ForegroundColor $YELLOW
    Write-Host "  git rebase --abort"
}

function ShowStashConflictHelp() {
    Write-Host "`nYour saved local changes conflicted with the latest code.`n" -ForegroundColor $RED
    Write-Host "To fix:" -ForegroundColor $YELLOW
    Write-Host "  git status"
    Write-Host "  Edit conflicted files (look for <<<<<<< markers)"
    Write-Host "  git add ."
    Write-Host "  git commit -m `"resolve local conflict`"`n"
    Write-Host "Your stash is kept as backup.`n" -ForegroundColor $CYAN
    Write-Host "To check:" -ForegroundColor $YELLOW
    Write-Host "  git stash list`n"
    Write-Host "To drop after verification:" -ForegroundColor $YELLOW
    Write-Host "  git stash drop stash@{0}"
}

git rev-parse --is-inside-work-tree >$null 2>&1
if ($LASTEXITCODE -ne 0) { Fail "Not inside a Git repository." }

if ((Test-Path ".git\rebase-merge") -or (Test-Path ".git\rebase-apply") -or (Test-Path ".git\MERGE_HEAD")) {
    ShowUnfinishedHelp
    exit 1
}

$Branch = (git symbolic-ref --quiet --short HEAD 2>$null)
if (-not $Branch) { Fail "You are in detached HEAD mode. Checkout a branch before pulling." }
if ($Branch -ne $TargetBranch) { Fail "This script only pulls into the $TargetBranch branch. Run: git checkout $TargetBranch" }

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor $CYAN
Write-Host "  Kambuja POS — Safe Team Git Pull" -ForegroundColor $CYAN
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $CYAN
Write-Host "Current branch: " -NoNewline -ForegroundColor $GREEN; Write-Host $Branch -ForegroundColor $YELLOW
Write-Host "Pull target:    " -NoNewline -ForegroundColor $GREEN; Write-Host "$TargetRemote/$TargetBranch`n" -ForegroundColor $YELLOW

Write-Host "Fetching latest changes from $TargetRemote..." -ForegroundColor $BLUE
git fetch $TargetRemote --prune
git ls-remote --exit-code --heads $TargetRemote $TargetBranch >$null 2>&1
if ($LASTEXITCODE -ne 0) { Fail "$TargetRemote/$TargetBranch was not found." }

$StashCreated = $false
if (HasLocalChanges) {
    Write-Host "Stashing local changes..." -ForegroundColor $YELLOW
    $DateStr = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    git stash push --include-untracked -m "safe-pull auto-stash $Branch $DateStr" | Out-Null
    $StashCreated = $true
    Write-Host "✓ Local changes stashed" -ForegroundColor $GREEN
}

Write-Host "Pulling and rebasing..." -ForegroundColor $BLUE
git pull --rebase $TargetRemote $TargetBranch
if ($LASTEXITCODE -ne 0) {
    ShowPullConflictHelp
    if ($StashCreated) {
        Write-Host "`nYour uncommitted changes are still saved in the auto-stash." -ForegroundColor $CYAN
        Write-Host "Check it with: git stash list" -ForegroundColor $CYAN
    }
    exit 1
}

if ($StashCreated) {
    Write-Host "Restoring local changes..." -ForegroundColor $BLUE
    git stash apply "stash@{0}"
    if ($LASTEXITCODE -ne 0) {
        ShowStashConflictHelp
        exit 1
    }
    git stash drop "stash@{0}" | Out-Null
    Write-Host "✓ Local changes restored" -ForegroundColor $GREEN
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor $GREEN
Write-Host "✓ Pull completed successfully!" -ForegroundColor $GREEN
Write-Host "✓ Your branch '$Branch' has the latest $TargetRemote/$TargetBranch code" -ForegroundColor $GREEN
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor $GREEN
