#!/usr/bin/env bash
set -euo pipefail
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=6144}"
export npm_config_production=false
export NPM_CONFIG_INCLUDE=dev
npm run env
node ./tools/git-version.js
npm run sync-core:build
npm run sync-providers:build
npm run shared-schema:build
npm run plugin-api:build
npx ng build --configuration productionWeb
