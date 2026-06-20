#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../../scripts/load-env.sh
source "$ROOT_DIR/scripts/load-env.sh"
load_root_env "$ROOT_DIR"

command -v mongodump >/dev/null || {
  echo "mongodump is required. Install MongoDB Database Tools." >&2
  exit 1
}

timestamp="$(date +%Y%m%d-%H%M%S)"
destination="${BACKUP_DIR:-$ROOT_DIR/backups}/$timestamp"

mkdir -p "$destination"
mongodump --uri="$MONGODB_URI" --out="$destination"

echo "MongoDB backup created at $destination"
