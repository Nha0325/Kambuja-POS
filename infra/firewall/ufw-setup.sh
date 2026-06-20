#!/usr/bin/env bash
set -euo pipefail

SSH_PORT="${SSH_PORT:-22}"
API_PORT="${SERVER_PORT:-8080}"
MANAGEMENT_PORT="${MANAGEMENT_PORT:-8081}"
ALLOWED_SSH_CIDR="${ALLOWED_SSH_CIDR:-}"
ALLOWED_API_CIDR="${ALLOWED_API_CIDR:-127.0.0.1}"
ALLOWED_MONITORING_CIDR="${ALLOWED_MONITORING_CIDR:-127.0.0.1}"

command -v ufw >/dev/null 2>&1 || {
  echo "ufw is required." >&2
  exit 1
}

sudo ufw default deny incoming
sudo ufw default allow outgoing

if [[ -n "$ALLOWED_SSH_CIDR" ]]; then
  sudo ufw allow from "$ALLOWED_SSH_CIDR" to any port "$SSH_PORT" proto tcp \
    comment "Kambuja POS SSH"
else
  sudo ufw allow "$SSH_PORT/tcp" comment "Kambuja POS SSH"
fi

sudo ufw allow 80/tcp comment "Kambuja POS HTTP"
sudo ufw allow 443/tcp comment "Kambuja POS HTTPS"
sudo ufw allow from "$ALLOWED_API_CIDR" to any port "$API_PORT" proto tcp \
  comment "Kambuja POS API"
sudo ufw allow from "$ALLOWED_MONITORING_CIDR" to any port "$MANAGEMENT_PORT" proto tcp \
  comment "Kambuja POS monitoring"

sudo ufw --force enable
sudo ufw status verbose
