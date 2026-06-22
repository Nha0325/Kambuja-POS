#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"

printf '\033[0;36m[TEST]\033[0m Backend validation\n'
(cd "$PROJECT_ROOT/Backend" && npm test)

printf '\033[0;36m[TEST]\033[0m Frontend lint\n'
(cd "$PROJECT_ROOT/Frontend" && npm run lint)

printf '\033[0;36m[TEST]\033[0m Frontend build\n'
(cd "$PROJECT_ROOT/Frontend" && npm run build)

printf '\033[0;32m[TEST]\033[0m All validations passed\n'
