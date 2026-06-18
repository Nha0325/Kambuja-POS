#!/usr/bin/env bash
set -e

BRANCH="$(git branch --show-current)"
MESSAGE="${1:-update: $(date '+%Y-%m-%d %H:%M:%S')}"

git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$MESSAGE"
git push -u origin "$BRANCH"
