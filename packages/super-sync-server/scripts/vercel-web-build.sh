#!/usr/bin/env bash
# Unpack the prebuilt Angular browser bundle and emit Vercel Build Output
# that includes /api/backup. SuperSync projects may run this from the repo
# root or from packages/super-sync-server.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

candidates=(
  "deploy-artifacts/browser.tgz"
  "${script_dir}/../deploy-artifacts/browser.tgz"
  "${script_dir}/../../deploy-artifacts/browser.tgz"
  "${script_dir}/../packages/super-sync-server/deploy-artifacts/browser.tgz"
  "../../deploy-artifacts/browser.tgz"
  "../deploy-artifacts/browser.tgz"
)

tarball=""
for candidate in "${candidates[@]}"; do
  if [[ -f "${candidate}" ]]; then
    tarball="$(cd "$(dirname "${candidate}")" && pwd)/$(basename "${candidate}")"
    break
  fi
done

if [[ -z "${tarball}" ]]; then
  echo "[vercel-web-build] browser.tgz not found" >&2
  echo "[vercel-web-build] cwd=$(pwd)" >&2
  echo "[vercel-web-build] script_dir=${script_dir}" >&2
  ls -la . deploy-artifacts ../../deploy-artifacts "${script_dir}/.." 2>&1 || true
  exit 1
fi

echo "[vercel-web-build] extracting ${tarball}"
echo "[vercel-web-build] cwd=$(pwd)"

extract_into() {
  local dest="$1"
  mkdir -p "${dest}"
  rm -rf "${dest}/browser"
  tar -xzf "${tarball}" -C "${dest}"
  test -f "${dest}/browser/index.html"
}

extract_into dist

if [[ -f ../../vercel.json && "$(pwd)" == *"/packages/super-sync-server" ]]; then
  extract_into ../../dist
fi

handler=""
handler_candidates=(
  "api/backup.js"
  "${script_dir}/../api/backup.js"
  "../../api/backup.js"
  "server/backup-handler.js"
)
for candidate in "${handler_candidates[@]}"; do
  if [[ -f "${candidate}" ]]; then
    handler="$(cd "$(dirname "${candidate}")" && pwd)/$(basename "${candidate}")"
    break
  fi
done

if [[ -z "${handler}" ]]; then
  echo "[vercel-web-build] api/backup.js not found" >&2
  exit 1
fi

echo "[vercel-web-build] using backup handler ${handler}"

out=".vercel/output"
rm -rf "${out}"
mkdir -p "${out}/static" "${out}/functions/api/backup.func"
cp -a dist/browser/. "${out}/static/"
cp "${handler}" "${out}/functions/api/backup.func/index.js"
cat > "${out}/functions/api/backup.func/.vc-config.json" <<'EOF'
{
  "runtime": "nodejs20.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true,
  "maxDuration": 30
}
EOF
cat > "${out}/config.json" <<'EOF'
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

helper=""
helper_candidates=(
  "public-web/cloud-backup.html"
  "${script_dir}/../public-web/cloud-backup.html"
  "${script_dir}/../../../public-web/cloud-backup.html"
  "../../public-web/cloud-backup.html"
)
for candidate in "${helper_candidates[@]}"; do
  if [[ -f "${candidate}" ]]; then
    helper="$(cd "$(dirname "${candidate}")" && pwd)/$(basename "${candidate}")"
    break
  fi
done
if [[ -n "${helper}" ]]; then
  cp "${helper}" "${out}/static/cloud-backup.html"
fi

test -f "${out}/static/index.html"
test -f "${out}/functions/api/backup.func/index.js"
ls -la dist/browser/index.html "${out}/static/index.html"
echo "[vercel-web-build] done"
