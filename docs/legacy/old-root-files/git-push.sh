#!/usr/bin/env bash
set -e

REMOTE_NAME="origin"
REMOTE_URL="https://github.com/Nha0325/tfc-pos.git"
DEFAULT_BRANCH="main"

COMMIT_MSG="${1:-update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo "Checking git..."

if [ ! -d ".git" ]; then
  echo "Git not found. Initializing..."
  git init -b "$DEFAULT_BRANCH"
fi

CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
  CURRENT_BRANCH="$DEFAULT_BRANCH"
  git checkout -B "$CURRENT_BRANCH"
fi

echo "Branch: $CURRENT_BRANCH"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

echo "Remote:"
git remote -v

echo "Adding files..."
git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "Committing..."
git commit -m "$COMMIT_MSG"

echo "Pushing..."
git push -u "$REMOTE_NAME" "$CURRENT_BRANCH"

echo "Done."
