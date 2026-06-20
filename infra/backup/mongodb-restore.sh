#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup-directory>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../../scripts/load-env.sh
source "$ROOT_DIR/scripts/load-env.sh"
load_root_env "$ROOT_DIR"

command -v mongorestore >/dev/null || {
  echo "mongorestore is required. Install MongoDB Database Tools." >&2
  exit 1
}

mongorestore --uri="$MONGODB_URI" "$1"
