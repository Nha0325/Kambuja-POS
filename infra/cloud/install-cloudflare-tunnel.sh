#!/usr/bin/env bash
set -euo pipefail

if command -v cloudflared >/dev/null 2>&1; then
  cloudflared --version
  echo "cloudflared is already installed."
  exit 0
fi

command -v curl >/dev/null 2>&1 || {
  echo "curl is required." >&2
  exit 1
}

case "$(uname -m)" in
  x86_64|amd64) asset="cloudflared-linux-amd64" ;;
  aarch64|arm64) asset="cloudflared-linux-arm64" ;;
  *)
    echo "Unsupported architecture: $(uname -m)" >&2
    exit 1
    ;;
esac

temporary_file="$(mktemp)"
trap 'rm -f "$temporary_file"' EXIT

curl --fail --location --output "$temporary_file" \
  "https://github.com/cloudflare/cloudflared/releases/latest/download/$asset"

chmod +x "$temporary_file"
sudo install "$temporary_file" /usr/local/bin/cloudflared
cloudflared --version

echo "Quick local tunnel examples:"
echo "  cloudflared tunnel --url http://localhost:5173"
echo "  cloudflared tunnel --url http://localhost:5174"
