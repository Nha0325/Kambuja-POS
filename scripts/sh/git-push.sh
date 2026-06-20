#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# git-push.sh — Interactive menu-driven Git push script for Kambuja POS
# ─────────────────────────────────────────────────────────────────────────────

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
cd "$PROJECT_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
# Commit message templates
# ─────────────────────────────────────────────────────────────────────────────
show_menu() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  Kambuja POS Git Push Menu${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "${GREEN}Backend (Spring Boot)${NC}"
  echo -e "  ${YELLOW}1)${NC}  Update backend API endpoints"
  echo -e "  ${YELLOW}2)${NC}  Fix backend bug"
  echo -e "  ${YELLOW}3)${NC}  Add backend feature"
  echo -e "  ${YELLOW}4)${NC}  Update backend security/auth"
  echo -e "  ${YELLOW}5)${NC}  Update database schema/MongoDB"
  echo ""
  echo -e "${GREEN}Frontend (Admin Manager)${NC}"
  echo -e "  ${YELLOW}6)${NC}  Update admin manager UI"
  echo -e "  ${YELLOW}7)${NC}  Fix admin manager bug"
  echo -e "  ${YELLOW}8)${NC}  Add admin manager feature"
  echo ""
  echo -e "${GREEN}Frontend (Admin / Cashier)${NC}"
  echo -e "  ${YELLOW}9)${NC}  Update admin/cashier UI"
  echo -e "  ${YELLOW}10)${NC} Fix admin/cashier bug"
  echo -e "  ${YELLOW}11)${NC} Add admin/cashier feature"
  echo ""
  echo -e "${GREEN}Telegram Bot${NC}"
  echo -e "  ${YELLOW}12)${NC} Update telegram bot"
  echo -e "  ${YELLOW}13)${NC} Fix telegram bot webhook"
  echo -e "  ${YELLOW}14)${NC} Add telegram bot feature"
  echo ""
  echo -e "${GREEN}Infrastructure & Configuration${NC}"
  echo -e "  ${YELLOW}15)${NC} Update environment configuration"
  echo -e "  ${YELLOW}16)${NC} Update dependencies"
  echo -e "  ${YELLOW}17)${NC} Update dev scripts (dev.sh, setup.sh)"
  echo -e "  ${YELLOW}18)${NC} Update documentation"
  echo ""
  echo -e "${GREEN}General${NC}"
  echo -e "  ${YELLOW}19)${NC} Refactor code"
  echo -e "  ${YELLOW}20)${NC} Update tests"
  echo -e "  ${YELLOW}21)${NC} Performance improvements"
  echo -e "  ${YELLOW}22)${NC} Security updates"
  echo -e "  ${YELLOW}23)${NC} General bug fixes"
  echo -e "  ${YELLOW}24)${NC} Work in progress (WIP)"
  echo ""
  echo -e "${GREEN}Quick Actions${NC}"
  echo -e "  ${YELLOW}25)${NC} Quick commit (default message)"
  echo -e "  ${YELLOW}26)${NC} Custom commit message"
  echo ""
  echo -e "${RED}0)${NC}  Cancel and exit"
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main script
# ─────────────────────────────────────────────────────────────────────────────

# If a message is provided as argument, use it directly (backward compatibility)
if [ $# -ge 1 ]; then
  MSG="$1"
else
  # Show interactive menu
  show_menu
  
  # Get user choice
  echo -n -e "${CYAN}Select an option [0-26]: ${NC}"
  read -r CHOICE
  
  case "$CHOICE" in
    1)  MSG="Update backend API endpoints" ;;
    2)  MSG="Fix backend bug" ;;
    3)  MSG="Add backend feature" ;;
    4)  MSG="Update backend security/auth" ;;
    5)  MSG="Update database schema/MongoDB" ;;
    6)  MSG="Update admin manager UI" ;;
    7)  MSG="Fix admin manager bug" ;;
    8)  MSG="Add admin manager feature" ;;
    9)  MSG="Update admin/cashier UI" ;;
    10) MSG="Fix admin/cashier bug" ;;
    11) MSG="Add admin/cashier feature" ;;
    12) MSG="Update telegram bot" ;;
    13) MSG="Fix telegram bot webhook" ;;
    14) MSG="Add telegram bot feature" ;;
    15) MSG="Update environment configuration" ;;
    16) MSG="Update dependencies" ;;
    17) MSG="Update dev scripts" ;;
    18) MSG="Update documentation" ;;
    19) MSG="Refactor code" ;;
    20) MSG="Update tests" ;;
    21) MSG="Performance improvements" ;;
    22) MSG="Security updates" ;;
    23) MSG="General bug fixes" ;;
    24) MSG="WIP: Work in progress" ;;
    25) MSG="Update project" ;;
    26) 
      echo -n -e "${CYAN}Enter custom commit message: ${NC}"
      read -r MSG
      if [ -z "$MSG" ]; then
        echo -e "${RED}Error: Commit message cannot be empty${NC}"
        exit 1
      fi
      ;;
    0)
      echo -e "${YELLOW}Cancelled.${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Exiting.${NC}"
      exit 1
      ;;
  esac
fi

# ─────────────────────────────────────────────────────────────────────────────
# Git operations
# ─────────────────────────────────────────────────────────────────────────────

git_path_exists() {
  local path_name="$1"
  local git_path
  git_path="$(git rev-parse --git-path "$path_name" 2>/dev/null || true)"
  [ -n "$git_path" ] && [ -e "$git_path" ]
}

show_rebase_conflict_help() {
  echo -e "${RED}Rebase failed. Resolve conflicts, then continue manually.${NC}" >&2
  echo -e "${YELLOW}Run:${NC}" >&2
  echo -e "  git status" >&2
  echo -e "  git add ." >&2
  echo -e "  git rebase --continue" >&2
  echo -e "${YELLOW}Or cancel with:${NC}" >&2
  echo -e "  git rebase --abort" >&2
}

echo ""
echo -e "${BLUE}Checking repository state...${NC}"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo -e "${RED}Error: Not inside a Git repository.${NC}"
  exit 1
}

if git_path_exists rebase-merge || git_path_exists rebase-apply || git_path_exists MERGE_HEAD; then
  echo -e "${RED}Error: A rebase or merge is already in progress.${NC}" >&2
  echo -e "${YELLOW}Run git status, then finish or abort the current operation.${NC}" >&2
  exit 1
fi

echo ""
echo -e "${BLUE}Checking current branch...${NC}"
CURRENT_BRANCH="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"

if [ -z "$CURRENT_BRANCH" ]; then
  echo -e "${RED}Error: You are in detached HEAD mode. Checkout main before pushing.${NC}" >&2
  exit 1
fi

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}Error: This script only pushes from main to origin/main.${NC}" >&2
  echo -e "${YELLOW}Current branch: $CURRENT_BRANCH${NC}" >&2
  echo -e "${YELLOW}Run: git checkout main${NC}" >&2
  exit 1
fi

echo -e "${GREEN}Already on main branch${NC}"

echo ""
echo -e "${BLUE}Running validation (tests)...${NC}"
"$SCRIPT_DIR/test.sh"

echo ""
echo -e "${BLUE}Fetching latest changes from origin/main...${NC}"
git fetch origin --prune
git ls-remote --exit-code --heads origin main >/dev/null 2>&1 || {
  echo -e "${RED}Error: origin/main was not found.${NC}" >&2
  exit 1
}

echo ""
echo -e "${BLUE}Checking for changes...${NC}"

# Stage all changes, including deletes and renames.
git add -A

if git diff --cached --quiet; then
  echo -e "${YELLOW}No changes to commit.${NC}"

  LOCAL="$(git rev-parse HEAD)"
  REMOTE="$(git rev-parse origin/main)"

  if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✓ Already up to date with origin/main${NC}"
    exit 0
  fi

  echo -e "${BLUE}Rebasing existing local commits on origin/main...${NC}"
  if ! git pull --rebase origin main; then
    show_rebase_conflict_help
    exit 1
  fi

  if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
    echo -e "${BLUE}Pushing existing local commits to main branch...${NC}"
    git push origin main
  else
    echo -e "${GREEN}✓ Up to date with origin/main${NC}"
  fi

  exit 0
fi

# Show what will be committed
echo ""
echo -e "${CYAN}Files to be committed:${NC}"
git diff --cached --name-status | while read -r status file; do
  case "$status" in
    A) echo -e "  ${GREEN}[Added]${NC}    $file" ;;
    M) echo -e "  ${YELLOW}[Modified]${NC} $file" ;;
    D) echo -e "  ${RED}[Deleted]${NC}  $file" ;;
    *) echo -e "  [$status]      $file" ;;
  esac
done

echo ""
echo -e "${CYAN}Commit message:${NC} ${MAGENTA}$MSG${NC}"
echo ""

# Ask for confirmation
echo -n -e "${YELLOW}Proceed with commit and push to main? [Y/n]: ${NC}"
read -r CONFIRM

if [[ "$CONFIRM" =~ ^[Nn] ]]; then
  echo -e "${YELLOW}Cancelled by user.${NC}"
  git reset > /dev/null 2>&1
  exit 0
fi

# Commit
echo -e "${BLUE}Committing changes...${NC}"
git commit -m "$MSG"

# Rebase the new commit on top of origin/main to get latest changes.
echo -e "${BLUE}Rebasing on origin/main...${NC}"
if ! git pull --rebase origin main; then
  show_rebase_conflict_help
  exit 1
fi

# Push directly to main branch
echo -e "${BLUE}Pushing to main branch...${NC}"
git push origin main

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Successfully pushed to main branch!${NC}"
echo -e "${GREEN}✓ Commit: $MSG${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
