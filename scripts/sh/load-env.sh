#!/usr/bin/env bash

load_root_env() {
  local root_dir="$1"
  local env_file="$root_dir/.env"

  if [ -f "$env_file" ]; then
    set -a
    # Load .env file, ignoring comments and handling potential Windows line endings
    while IFS= read -r line || [ -n "$line" ]; do
      # Ignore empty lines and comments
      if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
        continue
      fi
      # Remove \r if exists and export
      line="${line//[$'\r']/}"
      export "$line"
    done < "$env_file"
    set +a
  else
    echo -e "\033[1;33m[WARN] .env file not found at $env_file. Services might fail.\033[0m" >&2
  fi
}
