#!/bin/bash
set -eu
cd "$(dirname "$0")"

if command -v node >/dev/null 2>&1; then
  exec node ./open.cjs
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

open_chrome() {
  open -na "$1" --args --app="${SP_WEB_URL}#/tag/TODAY/tasks" --window-size=420,780
}

if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  open_chrome "Google Chrome"
  exit 0
fi
if [ -x "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" ]; then
  open_chrome "Microsoft Edge"
  exit 0
fi

echo "Install Google Chrome or Microsoft Edge." >&2
exit 1
