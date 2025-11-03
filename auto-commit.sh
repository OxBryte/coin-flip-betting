#!/usr/bin/env bash
# Auto-commit script for coin-flip-betting

cd "$(dirname "$0")" || exit

while true; do
  git add -A
  if ! git diff-index --quiet HEAD --; then
    git commit -m "Update: $(date +'%Y-%m-%d %H:%M:%S')" || true
    git push || true
  fi
  sleep 60
done

