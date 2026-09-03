#!/usr/bin/env bash
# Codespaces spontaneously reverts forwarded ports back to "private" on its own,
# every couple of minutes, even with no process restart and devcontainer.json
# declaring them public. A one-shot fix isn't enough, so keep re-asserting
# public visibility in the background for as long as the dev command runs.
set -uo pipefail

if [ -n "${CODESPACE_NAME:-}" ] && command -v gh >/dev/null 2>&1; then
  (
    while true; do
      gh codespace ports visibility 5173:public 4000:public --codespace "$CODESPACE_NAME" >/dev/null 2>&1
      sleep 15
    done
  ) &
  watcher_pid=$!
  trap 'kill "$watcher_pid" 2>/dev/null' EXIT INT TERM
fi

"$@"
