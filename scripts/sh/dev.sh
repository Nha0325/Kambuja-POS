#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# dev.sh — Start Backend + Frontend for Kambuja POS local development
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd -P)"

# shellcheck source=./load-env.sh
source "$PROJECT_ROOT/scripts/sh/load-env.sh"

LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

if ! load_env_file "$PROJECT_ROOT/Backend/.env"; then
  printf '[DEV] Backend/.env is missing. Run ./scripts/sh/setup.sh first.\n' >&2
  exit 1
fi

BACKEND_PORT="${PORT:-${SERVER_PORT:-5000}}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
NGROK_API_PORT="${NGROK_API_PORT:-4040}"

# ── Parse flags ──────────────────────────────────────────────────────────────
USE_NGROK=false
USE_CLOUDFLARE=false
run_backend=1
run_frontend=1

for arg in "$@"; do
  case "$arg" in
    --no-backend)    run_backend=0 ;;
    --no-frontend)   run_frontend=0 ;;
    --ngrok)         USE_NGROK=true ;;
    --cloudflare)    USE_CLOUDFLARE=true; USE_NGROK=false ;;
    --help)
      cat <<'EOF'
Usage: ./scripts/sh/dev.sh [options]

Options:
  --no-backend     Skip Backend.
  --no-frontend    Skip Frontend.
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

# ── MongoDB check ────────────────────────────────────────────────────────────
check_mongodb() {
  local mongo_uri="${MONGODB_URI:-mongodb://localhost:27017/kambuja_pos}"

  if command -v mongosh >/dev/null 2>&1; then
    if mongosh "$mongo_uri" --quiet --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null 2>&1; then
      return
    fi
  fi

  if [[ "$mongo_uri" =~ ^mongodb://(localhost|127\.0\.0\.1)(:([0-9]+))?/ ]]; then
    local host="${BASH_REMATCH[1]}"
    local port="${BASH_REMATCH[3]:-27017}"

    if command -v nc >/dev/null 2>&1 && nc -z "$host" "$port"; then
      return
    fi

    if command -v mongod >/dev/null 2>&1; then
      local mongo_data_dir="$PROJECT_ROOT/data/mongodb"
      local mongo_log="$LOG_DIR/mongodb.log"
      mkdir -p "$mongo_data_dir"

      log "Starting local MongoDB on port $port..."
      mongod \
        --dbpath "$mongo_data_dir" \
        --bind_ip "$host" \
        --port "$port" \
        --logpath "$mongo_log" \
        --logappend &
      PIDS+=($!)

      for _ in {1..30}; do
        sleep 1
        if command -v mongosh >/dev/null 2>&1; then
          mongosh "$mongo_uri" --quiet --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null 2>&1 && return
        elif nc -z "$host" "$port" 2>/dev/null; then
          return
        fi
      done

      tail -n 30 "$mongo_log" >&2 || true
      err "Local MongoDB failed to start on $host:$port."
      exit 1
    fi
  fi

  err "MongoDB is not reachable through MONGODB_URI."
  exit 1
}


# ── PID tracking ─────────────────────────────────────────────────────────────
PIDS=()
CLEANED_UP=0

cleanup() {
  if [ "$CLEANED_UP" -eq 1 ]; then
    return
  fi
  CLEANED_UP=1

  if [ "${#PIDS[@]}" -eq 0 ]; then
    return
  fi
  echo ""
  warn "Shutting down all services..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  free_project_port "$BACKEND_PORT"  "Backend"  || true
  free_project_port "$FRONTEND_PORT" "Frontend" || true
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
free_project_port "$BACKEND_PORT"  "Backend"
free_project_port "$FRONTEND_PORT" "Frontend"
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
if ((run_backend)); then
  log "Starting Backend..."
  check_mongodb
  (
    cd "$PROJECT_ROOT/Backend"
    npm run migrate:roles >> "$LOG_DIR/backend.log" 2>&1
    npm run seed >> "$LOG_DIR/backend.log" 2>&1
  )
  (
    cd "$PROJECT_ROOT/Backend"
    if node -e "process.exit(require('./package.json').scripts.dev ? 0 : 1)" 2>/dev/null; then
      npm run dev > "$LOG_DIR/backend.log" 2>&1
    elif node -e "process.exit(require('./package.json').scripts['start:dev'] ? 0 : 1)" 2>/dev/null; then
      npm run start:dev > "$LOG_DIR/backend.log" 2>&1
    elif node -e "process.exit(require('./package.json').scripts.start ? 0 : 1)" 2>/dev/null; then
      npm start > "$LOG_DIR/backend.log" 2>&1
    else
      err "No 'dev', 'start:dev', or 'start' script found in Backend/package.json"
      exit 1
    fi
  ) &
  PIDS+=($!)
  info "Backend log → logs/backend.log"
fi

# ── 3. Frontend ──────────────────────────────────────────────────────────────
if ((run_frontend)); then
  log "Starting Frontend..."
  (
    cd "$PROJECT_ROOT/Frontend"
    if node -e "process.exit(require('./package.json').scripts.dev ? 0 : 1)" 2>/dev/null; then
      npm run dev -- --port "$FRONTEND_PORT" --strictPort > "$LOG_DIR/frontend.log" 2>&1
    elif node -e "process.exit(require('./package.json').scripts.start ? 0 : 1)" 2>/dev/null; then
      npm start > "$LOG_DIR/frontend.log" 2>&1
    else
      err "No 'dev' or 'start' script found in Frontend/package.json"
      exit 1
    fi
  ) &
  PIDS+=($!)
  info "Frontend log → logs/frontend.log"
fi

# ── 4. Readiness checks ──────────────────────────────────────────────────────
if ((run_backend)); then
  if ! wait_for_port "$BACKEND_PORT" "Backend"; then
    tail -n 30 "$LOG_DIR/backend.log" >&2 || true
    exit 1
  fi
fi

if ((run_frontend)); then
  if ! wait_for_port "$FRONTEND_PORT" "Frontend"; then
    tail -n 30 "$LOG_DIR/frontend.log" >&2 || true
    exit 1
  fi
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
((run_backend))  && echo -e "  ${CYAN}Backend   ${NC}→ http://localhost:$BACKEND_PORT"
((run_frontend)) && echo -e "  ${CYAN}Frontend  ${NC}→ http://localhost:$FRONTEND_PORT"
[ -n "$PUBLIC_API_URL" ] && echo -e "  ${CYAN}Public Tunnel   ${NC}→ $PUBLIC_API_URL"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "  Logs in ${YELLOW}./logs/${NC}"
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

wait
