#!/usr/bin/env bash
set -euo pipefail
echo "[vercel-web-build] extracting prebuilt browser bundle"
rm -rf dist
mkdir -p dist
tar -xzf deploy-artifacts/browser.tgz -C dist
test -f dist/browser/index.html
ls -la dist/browser/index.html
echo "[vercel-web-build] done"
