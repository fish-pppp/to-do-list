#!/usr/bin/env bash
set -euo pipefail
echo "[vercel-web-build] start node=$(node -v) npm=$(npm -v) pwd=$(pwd)"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=6144}"
export npm_config_production=false
export NPM_CONFIG_INCLUDE=dev
export NG_CLI_ANALYTICS=false
npm run env
node ./tools/git-version.js
npm run sync-core:build
npm run sync-providers:build
npm run shared-schema:build
npm run plugin-api:build
echo "[vercel-web-build] starting ng build"
./node_modules/.bin/ng build --configuration productionWeb
echo "[vercel-web-build] done; listing dist/browser"
ls -la dist/browser/index.html
