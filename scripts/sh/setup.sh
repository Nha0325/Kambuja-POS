#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"
cd "$PROJECT_ROOT"

SKIP_BACKEND=0
SKIP_FRONTEND=0
SKIP_TOOL_CHECK=0
RUN_BACKEND=0
RUN_FRONTEND_MANAGER=0
RUN_FRONTEND_ADMIN=0

ISSUES=()
STARTED_PROCESSES=()

SUMMARY_SYSTEM="Not checked"
SUMMARY_TOOLS="Not checked"
SUMMARY_ENV="Not checked"
SUMMARY_FRONTEND_MANAGER_DEPS="Skipped"
SUMMARY_FRONTEND_ADMIN_DEPS="Skipped"
SUMMARY_BACKEND="Skipped"

usage() {
    cat <<'EOF'
Usage: ./scripts/sh/setup.sh [options]

Options:
  --skip-backend          Skip Java, and backend checks.
  --skip-frontend         Skip Node/npm and frontend dependency install.
  --skip-tool-check       Skip tool validation.
  --run-backend           Start backend after setup.
  --run-frontend-manager  Start apps/web-admin-manager after setup.
  --run-frontend-admin    Start apps/web-admin after setup.
  --help                  Show this help.
EOF
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --skip-backend) SKIP_BACKEND=1 ;;
        --skip-frontend) SKIP_FRONTEND=1 ;;
        --skip-tool-check) SKIP_TOOL_CHECK=1 ;;
        --run-backend) RUN_BACKEND=1 ;;
        --run-frontend-manager) RUN_FRONTEND_MANAGER=1 ;;
        --run-frontend-admin) RUN_FRONTEND_ADMIN=1 ;;
        --help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
    esac
    shift
done

section() { printf '\n%s\n' "$1"; }
info() { printf '  %s\n' "$1"; }
warn() { printf '  WARNING: %s\n' "$1"; }
add_issue() { ISSUES+=("What failed: $1\nWhy: $2\nManual fix: $3"); }
command_exists() { command -v "$1" >/dev/null 2>&1; }

detect_os() {
    local kernel="$(uname -s 2>/dev/null || echo unknown)"
    OS_NAME="$kernel"
    if [ "$kernel" = "Darwin" ]; then
        OS_NAME="$(sw_vers -productName 2>/dev/null || echo macOS) $(sw_vers -productVersion 2>/dev/null || true)"
    elif [ "$kernel" = "Linux" ]; then
        if [ -r /etc/os-release ]; then
            . /etc/os-release
            OS_NAME="${PRETTY_NAME:-Linux}"
        fi
    fi
}

install_hint() {
    cat <<'EOF'
Install Git, Node.js 20+, npm, mongosh, and JDK 21+ using your OS package manager.
EOF
}

java_hint() {
    cat <<'EOF'
Install JDK 21+ manually from Eclipse Temurin/Adoptium, or use SDKMAN:
sdk install java 21.0.2-tem
EOF
}

install_frontend_deps() {
    local dir="$1"
    local label="$2"

    if ! command_exists npm; then
        add_issue "$label dependencies" "npm was not found." "Install Node.js 20+ with npm, then rerun ./setup.sh."
        return 1
    fi

    if [ -f "$dir/package-lock.json" ] && [ ! -d "$dir/node_modules" ]; then
        info "Running npm ci for $label"
        if ! (cd "$dir" && npm ci --no-audit --no-fund); then
            add_issue "$label dependencies" "npm ci failed." "Delete node_modules and package-lock.json only if your team agrees, then run npm install."
            return 1
        fi
    else
        info "Running npm install for $label"
        if ! (cd "$dir" && npm install --no-audit --no-fund); then
            add_issue "$label dependencies" "npm install failed." "Delete node_modules only if your team agrees."
            return 1
        fi
    fi
}

start_background() {
    local label="$1"
    local dir="$2"
    shift 2
    info "Starting $label in the background"
    (cd "$dir" && "$@") &
    STARTED_PROCESSES+=("$label PID $!")
}

section "[1/6] Checking system"
detect_os
SUMMARY_SYSTEM="$OS_NAME"
info "OS: $OS_NAME"
info "Project root: $PROJECT_ROOT"

section "[2/6] Checking required tools"
if [ "$SKIP_TOOL_CHECK" -eq 1 ]; then
    SUMMARY_TOOLS="Skipped"
    info "Skipping tool checks"
else
    missing_tools=0
    for tool in bash git mongosh; do
        if command_exists "$tool"; then
            info "$tool found: $(command -v "$tool")"
        else
            add_issue "$tool" "$tool was not found." "$(install_hint)"
            missing_tools=1
        fi
    done

    if [ "$SKIP_BACKEND" -eq 0 ]; then
        if command_exists java; then
            java_version="$(java -version 2>&1 | sed -nE 's/.*version "([0-9]+).*/\1/p' | head -n 1)"
            info "Java: $java_version"
            if [[ -z "$java_version" || "$java_version" -lt 21 ]]; then
                add_issue "Java 21+" "Installed Java is < 21." "$(java_hint)"
                missing_tools=1
            fi
        else
            add_issue "java" "java was not found." "$(java_hint)"
            missing_tools=1
        fi
    fi

    if [ "$SKIP_FRONTEND" -eq 0 ]; then
        if command_exists node; then
            node_version="$(node --version 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/')"
            info "Node.js: $(node --version)"
            if [[ -z "$node_version" || "$node_version" -lt 20 ]]; then
                add_issue "Node.js" "Node.js version is < 20." "$(install_hint)"
                missing_tools=1
            fi
        else
            add_issue "node" "node was not found." "$(install_hint)"
            missing_tools=1
        fi
    fi

    if [ "$missing_tools" -eq 0 ]; then SUMMARY_TOOLS="Checked"; else SUMMARY_TOOLS="Missing tools"; fi
fi

section "[3/6] Preparing env files"
if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    info "Created .env from .env.example"
    warn "Replace JWT_SECRET, BOOTSTRAP_ADMIN_MANAGER_PASSWORD, and TELEGRAM_BOT_TOKEN before running."
    SUMMARY_ENV="Created"
else
    SUMMARY_ENV="Already exists"
    info ".env already exists"
fi

section "[4/6] Install frontend dependencies"
if [ "$SKIP_FRONTEND" -eq 1 ]; then
    SUMMARY_FRONTEND_MANAGER_DEPS="Skipped"
    SUMMARY_FRONTEND_ADMIN_DEPS="Skipped"
else
    if install_frontend_deps "$PROJECT_ROOT/apps/web-admin-manager" "web-admin-manager"; then
        SUMMARY_FRONTEND_MANAGER_DEPS="Ready"
    else
        SUMMARY_FRONTEND_MANAGER_DEPS="Failed"
    fi
    if install_frontend_deps "$PROJECT_ROOT/apps/web-admin" "web-admin"; then
        SUMMARY_FRONTEND_ADMIN_DEPS="Ready"
    else
        SUMMARY_FRONTEND_ADMIN_DEPS="Failed"
    fi
fi

section "[5/6] Backend check"
if [ "$SKIP_BACKEND" -eq 1 ]; then
    SUMMARY_BACKEND="Skipped"
else
    if [ ! -f "$PROJECT_ROOT/apps/api/mvnw" ]; then
        SUMMARY_BACKEND="Missing mvnw"
        add_issue "Backend" "apps/api/mvnw not found." ""
    else
        chmod +x "$PROJECT_ROOT/apps/api/mvnw"
        info "Running dependency check..."
        (cd "$PROJECT_ROOT/apps/api" && ./mvnw -q -DskipTests dependency:go-offline) || true
        SUMMARY_BACKEND="Ready"
    fi
fi

section "[6/6] Summary"
printf '\nSetup completed.\n\nSummary:\n'
printf -- '- System: %s\n' "$SUMMARY_SYSTEM"
printf -- '- Tools: %s\n' "$SUMMARY_TOOLS"
printf -- '- Env: %s\n' "$SUMMARY_ENV"
printf -- '- Manager deps: %s\n' "$SUMMARY_FRONTEND_MANAGER_DEPS"
printf -- '- Admin deps: %s\n' "$SUMMARY_FRONTEND_ADMIN_DEPS"
printf -- '- Backend: %s\n' "$SUMMARY_BACKEND"

if [ "${#ISSUES[@]}" -gt 0 ]; then
    printf '\nSome setup steps need manual action:\n'
    for issue in "${ISSUES[@]}"; do printf '\n%s\n' "$issue"; done
    exit 1
fi

cat <<'EOF'

Next steps:
  ./scripts/sh/dev.sh
EOF

if [ "$RUN_BACKEND" -eq 1 ]; then start_background "backend" "$PROJECT_ROOT/apps/api" ./mvnw spring-boot:run; fi
if [ "$RUN_FRONTEND_MANAGER" -eq 1 ]; then start_background "web-admin-manager" "$PROJECT_ROOT/apps/web-admin-manager" npm run dev; fi
if [ "$RUN_FRONTEND_ADMIN" -eq 1 ]; then start_background "web-admin" "$PROJECT_ROOT/apps/web-admin" npm run dev; fi

if [ "${#STARTED_PROCESSES[@]}" -gt 0 ]; then
    printf '\nStarted processes:\n'
    for process in "${STARTED_PROCESSES[@]}"; do printf -- '- %s\n' "$process"; done
fi
