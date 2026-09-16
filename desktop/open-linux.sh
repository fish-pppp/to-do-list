#!/bin/sh
set -eu
cd "$(dirname "$0")"

if command -v node >/dev/null 2>&1; then
  node ./open.cjs --electron && exit 0
  exec node ./open.cjs --browser
fi

if [ -z "${SP_WEB_URL:-}" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|\#*|//*) continue ;;
    esac
    SP_WEB_URL=$line
    break
  done < ./web-url.txt
fi

if [ -z "${SP_WEB_URL:-}" ]; then
  echo "Set SP_WEB_URL or put an https URL in desktop/web-url.txt" >&2
  exit 1
fi

for bin in \
  google-chrome-stable \
  google-chrome \
  chromium-browser \
  chromium \
  microsoft-edge-stable \
  microsoft-edge
do
  if command -v "$bin" >/dev/null 2>&1; then
    exec "$bin" --app="${SP_WEB_URL}#/tag/TODAY/tasks" --window-size=420,780
  fi
done

echo "Install Google Chrome, Chromium, or Microsoft Edge." >&2
exit 1
