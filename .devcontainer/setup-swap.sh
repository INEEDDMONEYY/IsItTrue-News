#!/usr/bin/env bash
# Codespaces VMs have 8 GB RAM and no swap. When the extension host, language
# servers and a compile peak together, the VS Code remote server stalls and
# shell environment resolution times out. Adds a swap file once; later runs are no-ops.
# The root filesystem is overlayfs, which cannot back swap files, so use /tmp (ext4).
set -euo pipefail

SWAP_FILE=/tmp/swapfile
SWAP_SIZE_GB=4

if swapon --show=NAME --noheadings | grep -qx "$SWAP_FILE"; then
  exit 0
fi

if [ ! -f "$SWAP_FILE" ]; then
  sudo fallocate -l "${SWAP_SIZE_GB}G" "$SWAP_FILE" || sudo dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$((SWAP_SIZE_GB * 1024))
  sudo chmod 600 "$SWAP_FILE"
  sudo mkswap "$SWAP_FILE" >/dev/null
fi

sudo swapon "$SWAP_FILE"
