#!/usr/bin/env bash

set -euo pipefail

SOURCE_DIR="${1:-dist}"
SSH_HOST="${SNAPPY_SSH_HOST:?SNAPPY_SSH_HOST is required}"
SSH_USER="${SNAPPY_SSH_USER:?SNAPPY_SSH_USER is required}"
DEPLOY_PATH="${SNAPPY_DEPLOY_PATH:?SNAPPY_DEPLOY_PATH is required}"
SSH_PORT="${SNAPPY_SSH_PORT:-22}"
SSH_KEY_PATH="${SNAPPY_SSH_KEY_PATH:-$HOME/.ssh/id_ed25519}"
SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"

if [[ ! -d "$SOURCE_DIR" ]]; then
  printf 'Source directory not found: %s\n' "$SOURCE_DIR" >&2
  exit 1
fi

if [[ ! -f "$SSH_KEY_PATH" ]]; then
  printf 'SSH key not found: %s\n' "$SSH_KEY_PATH" >&2
  exit 1
fi

ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=yes -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "mkdir -p '$DEPLOY_PATH'"

rsync \
  --archive \
  --compress \
  --delete \
  --human-readable \
  --omit-dir-times \
  --no-perms \
  -e "ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=yes -p $SSH_PORT" \
  "$SOURCE_DIR/" \
  "$SSH_USER@$SSH_HOST:$DEPLOY_PATH/"
