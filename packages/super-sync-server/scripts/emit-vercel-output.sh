#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIST="$ROOT/web-dist"
HANDLER="$ROOT/server/backup-handler.js"
OUT="$ROOT/.vercel/output"
FUNC="$OUT/functions/api/backup.func"

if [[ ! -d "$WEB_DIST" ]]; then
  echo "error: missing $WEB_DIST" >&2
  exit 1
fi
if [[ ! -f "$HANDLER" ]]; then
  echo "error: missing $HANDLER" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT/static" "$FUNC"

cp -a "$WEB_DIST"/. "$OUT/static/"
cp "$HANDLER" "$FUNC/index.js"

cat > "$FUNC/.vc-config.json" <<'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true,
  "maxDuration": 30
}
EOF

cat > "$OUT/config.json" <<'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/index.html",
      "headers": { "cache-control": "no-cache, no-store, must-revalidate" },
      "continue": true
    },
    {
      "src": "/ngsw.json",
      "headers": { "cache-control": "no-cache" },
      "continue": true
    },
    {
      "src": "/manifest.json",
      "headers": { "cache-control": "no-cache" },
      "continue": true
    },
    { "src": "/api/backup", "dest": "/api/backup" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "emit-vercel-output: static=$(find "$OUT/static" -type f | wc -l) function=$FUNC"
