#!/bin/sh
set -e
cd /app
if [ ! -d node_modules ] || [ ! -d node_modules/@nestjs ]; then
  echo "[backend] Cài dependency (volume node_modules trống hoặc lần đầu)..."
  npm install
fi
exec "$@"
