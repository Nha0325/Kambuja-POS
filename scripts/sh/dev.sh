#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh — Start everything for Kambuja POS local development
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"

# shellcheck source=./load-env.sh
source "$PROJECT_ROOT/scripts/sh/load-env.sh"
load_root_env "$PROJECT_ROOT"

LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

BACKEND_PORT="${SERVER_PORT:-8080}"
MANAGER_PORT="${WEB_ADMIN_MANAGER_PORT:-5173}"
WEB_ADMIN_PORT="${WEB_ADMIN_PORT:-5174}"
NGROK_API_PORT="${NGROK_API_PORT:-4040}"

# ── Parse flags ──────────────────────────────────────────────────────────────
USE_NGROK=false
USE_CLOUDFLARE=false
run_api=1
run_manager=1
run_web_admin=1

for arg in "$@"; do
  case "$arg" in
    --api-only)    run_manager=0; run_web_admin=0 ;;
    --no-api)      run_api=0 ;;
    --no-manager)  run_manager=0 ;;
    --no-web-admin)run_web_admin=0 ;;
    --ngrok)       USE_NGROK=true ;;
    --cloudflare)  USE_CLOUDFLARE=true; USE_NGROK=false ;;
    --help)
      cat <<'EOF'
Usage: ./scripts/sh/dev.sh [options]

Options:
  --api-only       Start only apps/api.
  --no-api         Skip apps/api.
  --no-manager     Skip apps/web-admin-manager.
  --no-web-admin   Skip apps/web-admin.
  --ngrok          Start ngrok tunnel for webhook/public access.
  --cloudflare     Start cloudflare tunnel (recommended over ngrok).
EOF
      exit 0
      ;;
  esac
done

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${GREEN}[DEV]${NC} $*"; }
info() { echo -e "${CYAN}[DEV]${NC} $*"; }
warn() { echo -e "${YELLOW}[DEV]${NC} $*"; }
err()  { echo -e "${RED}[DEV]${NC} $*" >&2; }

# ── Port ownership helpers ───────────────────────────────────────────────────
pids_on_port() {
  local port=$1
  if command -v lsof &>/dev/null; then
    lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | sort -u
    return
  fi
  ss -ltnp "sport = :$port" 2>/dev/null | sed -nE 's/.*pid=([0-9]+).*/\1/p' | sort -u
}

pid_belongs_to_project() {
  local pid=$1 cwd cmdline
  cwd="$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)"
  if [[ "$cwd" == "$PROJECT_ROOT" || "$cwd" == "$PROJECT_ROOT/"* ]]; then
    return 0
  fi
  cmdline="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"
  [[ "$cmdline" == *"$PROJECT_ROOT"* ]]
}

free_project_port() {
  local port=$1 label=$2 pid cmdline
  local pids=()
  mapfile -t pids < <(pids_on_port "$port")

  [ "${#pids[@]}" -eq 0 ] && return 0

  for pid in "${pids[@]}"; do
    if ! pid_belongs_to_project "$pid"; then
      cmdline="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null | cut -c1-140 || true)"
      err "$label port $port is already used by non-project PID $pid: $cmdline"
      err "Stop that process or run this script with a different port configuration."
      return 1
    fi
  done

  for pid in "${pids[@]}"; do
    warn "Stopping existing $label process on port $port (PID $pid)"
    kill "$pid" 2>/dev/null || true
  done

  for _ in {1..10}; do
    sleep 0.5
    mapfile -t pids < <(pids_on_port "$port")
    [ "${#pids[@]}" -eq 0 ] && return 0
  done

  mapfile -t pids < <(pids_on_port "$port")
  for pid in "${pids[@]}"; do
    if pid_belongs_to_project "$pid"; then
      warn "Force stopping existing $label process on port $port (PID $pid)"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
}

# ── MongoDB Check ────────────────────────────────────────────────────────────
check_mongodb() {
  if command -v mongosh >/dev/null 2>&1; then
    if ! mongosh "${MONGODB_URI:-mongodb://localhost:27017/kambuja_pos}" --quiet --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null 2>&1; then
      err "MongoDB is not reachable through MONGODB_URI."
      exit 1
    fi
    return
  fi

  if [[ "${MONGODB_URI:-}" =~ ^mongodb://([^/:]+):([0-9]+) ]]; then
    local host="${BASH_REMATCH[1]}"
    local port="${BASH_REMATCH[2]}"
    if command -v nc >/dev/null 2>&1 && ! nc -z "$host" "$port"; then
      err "MongoDB is not reachable at $host:$port."
      exit 1
    fi
  fi
}

# ── PID tracking ─────────────────────────────────────────────────────────────
PIDS=()

cleanup() {
  if [ "${#PIDS[@]}" -eq 0 ]; then
    return
  fi
  echo ""
  warn "Shutting down all services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  free_project_port "$BACKEND_PORT" "API" || true
  free_project_port "$MANAGER_PORT" "ADMIN_MANAGER" || true
  free_project_port "$WEB_ADMIN_PORT" "ADMIN_CASHIER" || true
  if [ "$USE_NGROK" = true ]; then
    free_project_port "$NGROK_API_PORT" "ngrok" || true
  fi

  log "All services stopped."
}
trap cleanup EXIT INT TERM

wait_for_port() {
  local port=$1 label=$2 retries=${3:-30} count=0
  while ! nc -z localhost "$port" 2>/dev/null; do
    sleep 1
    count=$((count + 1))
    if [ "$count" -ge "$retries" ]; then
      warn "$label did not start on port $port within ${retries}s"
      return 1
    fi
  done
  log "$label ready on port $port"
}

# ── Free ports from previous runs ────────────────────────────────────────────
log "Checking development ports..."
free_project_port "$BACKEND_PORT" "API"
free_project_port "$MANAGER_PORT" "ADMIN_MANAGER"
free_project_port "$WEB_ADMIN_PORT" "ADMIN_CASHIER"
if [ "$USE_NGROK" = true ]; then
  free_project_port "$NGROK_API_PORT" "ngrok"
fi
if [ "$USE_CLOUDFLARE" = true ]; then
  pkill -f "cloudflared tunnel" 2>/dev/null || true
  sleep 1
fi

# ── 1. Tunnel Setup ──────────────────────────────────────────────────────────
PUBLIC_API_URL=""

if [ "$USE_CLOUDFLARE" = true ]; then
  if command -v cloudflared &>/dev/null; then
    log "Starting Cloudflare Tunnel (proxying to backend port $BACKEND_PORT)..."
    cloudflared tunnel --url "http://localhost:$BACKEND_PORT" --no-autoupdate > "$LOG_DIR/cloudflare-tunnel.log" 2>&1 &
    PIDS+=($!)
  else
    warn "cloudflared not found. Skipping tunnel."
  fi
elif [ "$USE_NGROK" = true ]; then
  if command -v ngrok &>/dev/null; then
    log "Starting ngrok tunnel (proxying to backend port $BACKEND_PORT)..."
    ngrok http "$BACKEND_PORT" --log=stdout > "$LOG_DIR/ngrok.log" 2>&1 &
    PIDS+=($!)
  else
    warn "ngrok not found. Skipping tunnel."
  fi
fi

# ── 2. Backend ───────────────────────────────────────────────────────────────
if ((run_api)); then
  log "Starting Spring Boot API..."
  check_mongodb
  (
    cd "$PROJECT_ROOT/apps/api"
    ./mvnw spring-boot:run > "$LOG_DIR/api.log" 2>&1
  ) &
  PIDS+=($!)
  info "API log → logs/api.log"
fi

# ── 3. Frontend Admin Manager ────────────────────────────────────────────────
if ((run_manager)); then
  log "Starting ADMIN_MANAGER frontend..."
  (
    cd "$PROJECT_ROOT/apps/web-admin-manager"
    npm run dev -- --port "$MANAGER_PORT" --strictPort > "$LOG_DIR/web-admin-manager.log" 2>&1
  ) &
  PIDS+=($!)
  info "Manager log → logs/web-admin-manager.log"
fi

# ── 4. Frontend Admin/Cashier ────────────────────────────────────────────────
if ((run_web_admin)); then
  log "Starting ADMIN/CASHIER frontend..."
  (
    cd "$PROJECT_ROOT/apps/web-admin"
    npm run dev -- --port "$WEB_ADMIN_PORT" --strictPort > "$LOG_DIR/web-admin.log" 2>&1
  ) &
  PIDS+=($!)
  info "Admin/Cashier log → logs/web-admin.log"
fi

# ── 5. Resolve Tunnel URLs ───────────────────────────────────────────────────
if [ "$USE_CLOUDFLARE" = true ]; then
  for i in {1..15}; do
    sleep 1
    if grep -q "https://" "$LOG_DIR/cloudflare-tunnel.log" 2>/dev/null; then
      PUBLIC_API_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/cloudflare-tunnel.log" | head -1)
      break
    fi
  done
elif [ "$USE_NGROK" = true ]; then
  sleep 4
  NGROK_RAW=$(curl -s "http://localhost:$NGROK_API_PORT/api/tunnels" 2>/dev/null \
    | grep -o '"public_url":"https://[^"]*"' | cut -d'"' -f4 || echo "")
  if [ -n "$NGROK_RAW" ]; then
    PUBLIC_API_URL="$NGROK_RAW"
  fi
fi

if [ -n "$PUBLIC_API_URL" ]; then
  log "Public API URL: ${YELLOW}$PUBLIC_API_URL${NC}"
  # Update webhook automatically if we have a tunnel
  TELEGRAM_BOT_TOKEN=$(grep -E "^[[:space:]]*TELEGRAM_BOT_TOKEN=" "$PROJECT_ROOT/.env" | cut -d= -f2- | tr -d '"'\''\r' || true)
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ "$TELEGRAM_BOT_TOKEN" != "replace_with_botfather_token" ]; then
    WEBHOOK_URL="$PUBLIC_API_URL/api/telegram/webhook"
    log "Registering Telegram webhook: $WEBHOOK_URL"
    curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
         -H "Content-Type: application/json" \
         -d "{\"url\":\"$WEBHOOK_URL\"}" > /dev/null || warn "Failed to register webhook"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Kambuja POS Dev Environment Started${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
((run_api)) && echo -e "  ${CYAN}Backend API     ${NC}→ http://localhost:$BACKEND_PORT"
((run_manager)) && echo -e "  ${CYAN}Admin Manager UI${NC}→ http://localhost:$MANAGER_PORT"
((run_web_admin)) && echo -e "  ${CYAN}Admin/Cashier UI${NC}→ http://localhost:$WEB_ADMIN_PORT"
[ -n "$PUBLIC_API_URL" ] && echo -e "  ${CYAN}Public Tunnel   ${NC}→ $PUBLIC_API_URL"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "  Logs in ${YELLOW}./logs/${NC}"
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

wait
