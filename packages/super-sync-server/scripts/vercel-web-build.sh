#!/usr/bin/env bash
# Unpack the prebuilt Angular browser bundle for Vercel.
# SuperSync projects may run this from the repo root or from
# packages/super-sync-server (Node framework / package rootDirectory).
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

# When the Node framework runs this inside the SuperSync package, also
# fill the repo-root outputDirectory used by the root vercel.json.
if [[ -f ../../vercel.json && "$(pwd)" == *"/packages/super-sync-server" ]]; then
  extract_into ../../dist
fi

ls -la dist/browser/index.html
echo "[vercel-web-build] done"
