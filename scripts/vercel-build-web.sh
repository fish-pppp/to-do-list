#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

npm run buildFrontend:prodWeb

# Vercel Root Directory is sometimes packages/super-sync-server (GitHub
# monorepo import). Copy the static web app into that folder so output stays
# inside the configured project root.
if [[ "${1:-}" == "--copy-to-sync-server" ]]; then
  dest="$ROOT/packages/super-sync-server/.vercel-web"
  rm -rf "$dest"
  cp -a dist/browser "$dest"
fi
