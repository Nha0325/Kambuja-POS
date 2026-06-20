#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"

echo -e "\033[0;36m[TEST]\033[0m Running Backend Tests..."
if [ -f "$PROJECT_ROOT/apps/api/mvnw" ]; then
  (cd "$PROJECT_ROOT/apps/api" && ./mvnw test)
else
  echo -e "\033[0;33m[WARN]\033[0m Backend not found, skipping."
fi

echo -e "\033[0;32m[TEST]\033[0m All validations passed!"
