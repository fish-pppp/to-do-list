#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=6144"
export NODE_ENV=production

echo "vercel-build-web: node $(node -v) root=$ROOT"

npm run buildFrontend:prodWeb

if [[ ! -d dist/browser ]]; then
  echo "error: expected dist/browser after ng build" >&2
  ls -la dist || true
  find dist -maxdepth 3 -type d 2>/dev/null || true
  exit 1
fi

# Vercel Root Directory is sometimes packages/super-sync-server (GitHub
# monorepo import). Copy the static web app into that folder so output stays
# inside the configured project root.
if [[ "${1:-}" == "--copy-to-sync-server" ]]; then
  dest="$ROOT/packages/super-sync-server/.vercel-web"
  rm -rf "$dest"
  cp -a dist/browser "$dest"
  echo "copied dist/browser -> $dest"
fi
