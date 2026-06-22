#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
cd "$PROJECT_ROOT"

SKIP_BACKEND=0
SKIP_FRONTEND=0
SKIP_TOOL_CHECK=0
RUN_BACKEND=0
RUN_FRONTEND=0

usage() {
  cat <<'EOF'
Usage: ./scripts/sh/setup.sh [options]

Options:
  --skip-backend     Skip Backend dependency installation.
  --skip-frontend    Skip Frontend dependency installation.
  --skip-tool-check  Skip Node.js, npm, and MongoDB shell checks.
  --run-backend      Start Backend after setup.
  --run-frontend     Start Frontend after setup.
  --help             Show this help.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --skip-backend) SKIP_BACKEND=1 ;;
    --skip-frontend) SKIP_FRONTEND=1 ;;
    --skip-tool-check) SKIP_TOOL_CHECK=1 ;;
    --run-backend) RUN_BACKEND=1 ;;
    --run-frontend) RUN_FRONTEND=1 ;;
    --help) usage; exit 0 ;;
    *) printf 'Unknown option: %s\n' "$1" >&2; usage; exit 1 ;;
  esac
  shift
done

section() { printf '\n%s\n' "$1"; }
info() { printf '  %s\n' "$1"; }
fail() { printf '  ERROR: %s\n' "$1" >&2; exit 1; }
command_exists() { command -v "$1" >/dev/null 2>&1; }

prepare_env() {
  local target="$1"
  local example="$2"

  if [ -f "$target" ]; then
    info "$(realpath --relative-to="$PROJECT_ROOT" "$target") already exists"
    return
  fi

  [ -f "$example" ] || fail "Missing env template: $(realpath --relative-to="$PROJECT_ROOT" "$example")"
  cp "$example" "$target"
  info "Created $(realpath --relative-to="$PROJECT_ROOT" "$target") from template"
}

install_dependencies() {
  local directory="$1"
  local label="$2"

  [ -f "$directory/package.json" ] || fail "$label/package.json was not found"

  if [ -f "$directory/package-lock.json" ]; then
    info "Running npm ci in $label"
    (cd "$directory" && npm ci --no-audit --no-fund)
  else
    info "Running npm install in $label"
    (cd "$directory" && npm install --no-audit --no-fund)
  fi
}

section "[1/4] Checking project structure"
[ -d "$PROJECT_ROOT/Backend" ] || fail "Backend directory was not found"
[ -d "$PROJECT_ROOT/Frontend" ] || fail "Frontend directory was not found"
info "Project root: $PROJECT_ROOT"

section "[2/4] Checking required tools"
if [ "$SKIP_TOOL_CHECK" -eq 1 ]; then
  info "Skipped"
else
  command_exists node || fail "Node.js 20+ is required"
  command_exists npm || fail "npm is required"

  node_major="$(node --version | sed -E 's/^v([0-9]+).*/\1/')"
  [ "$node_major" -ge 20 ] || fail "Node.js 20+ is required; found $(node --version)"

  info "Node.js: $(node --version)"
  info "npm: $(npm --version)"

  if command_exists mongosh; then
    info "mongosh: $(command -v mongosh)"
  else
    info "mongosh not found; MongoDB connectivity will be checked when Backend starts"
  fi
fi

section "[3/4] Preparing environment files"
prepare_env "$PROJECT_ROOT/Backend/.env" "$PROJECT_ROOT/Backend/.env.example"
prepare_env "$PROJECT_ROOT/Frontend/.env" "$PROJECT_ROOT/Frontend/.env.example"

section "[4/4] Installing dependencies"
if [ "$SKIP_BACKEND" -eq 0 ]; then
  install_dependencies "$PROJECT_ROOT/Backend" "Backend"
else
  info "Backend skipped"
fi

if [ "$SKIP_FRONTEND" -eq 0 ]; then
  install_dependencies "$PROJECT_ROOT/Frontend" "Frontend"
else
  info "Frontend skipped"
fi

printf '\nSetup completed.\n'
printf 'Run validation: ./scripts/sh/test.sh\n'
printf 'Start development: ./scripts/sh/dev.sh\n'

if [ "$RUN_BACKEND" -eq 1 ] || [ "$RUN_FRONTEND" -eq 1 ]; then
  dev_args=()
  [ "$RUN_BACKEND" -eq 0 ] && dev_args+=(--no-backend)
  [ "$RUN_FRONTEND" -eq 0 ] && dev_args+=(--no-frontend)
  exec "$SCRIPT_DIR/dev.sh" "${dev_args[@]}"
fi
