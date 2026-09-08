#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export HUSKY=0
export NODE_ENV=development

npm ci --include=dev --ignore-scripts
npx --yes patch-package@8.0.1
npx ts-patch install
