#!/usr/bin/env bash

load_env_file() {
  local env_file="$1"
  local line key value

  [ -f "$env_file" ] || return 1

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    line="${line#export }"
    key="${line%%=*}"
    value="${line#*=}"

    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || {
      printf '[WARN] Ignoring invalid env entry in %s: %s\n' "$env_file" "$key" >&2
      continue
    }

    if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done < "$env_file"
}

load_root_env() {
  local root_dir="$1"
  local env_file="$root_dir/.env"

  if ! load_env_file "$env_file"; then
    printf '[WARN] .env file not found at %s. Services might fail.\n' "$env_file" >&2
  fi
}
