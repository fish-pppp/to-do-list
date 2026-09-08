#!/usr/bin/env bash
set -euo pipefail
# Wrappers live inside Root Directory so Vercel can invoke them even when
# dashboard overrides ignore the nested vercel.json command strings.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec bash "$ROOT/scripts/vercel-install.sh"
