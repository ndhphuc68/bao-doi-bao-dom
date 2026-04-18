#!/bin/sh
set -e
cd /app
if [ ! -d node_modules ] || [ ! -d node_modules/nuxt ] || [ ! -f node_modules/@primeuix/themes/package.json ]; then
  echo "[admin-frontend] Cài dependency (volume node_modules trống, thiếu gói, hoặc lần đầu)..."
  npm install
fi
exec "$@"

