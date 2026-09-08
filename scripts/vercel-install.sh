#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export HUSKY=0
export NODE_ENV=development
export ELECTRON_SKIP_BINARY_DOWNLOAD=1

echo "vercel-install: node $(node -v) npm $(npm -v) root=$ROOT"

npm ci --include=dev --ignore-scripts
npx --yes patch-package@8.0.1
npx ts-patch install

# Nested plugin-dev apps are not in the root lockfile. Root npm ci therefore
# does not install vite-plugin-solid, and NODE_ENV=production would omit it
# even from a later npm install inside those folders.
for dir in \
  packages/plugin-dev/procrastination-buster \
  packages/plugin-dev/automations \
  packages/plugin-dev/ai-productivity-prompts
do
  echo "vercel-install: npm install --include=dev in $dir"
  (cd "$dir" && npm install --include=dev --ignore-scripts)
done
