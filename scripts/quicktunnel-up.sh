#!/usr/bin/env sh
cd "$(dirname "$0")/.." || exit 1
exec docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.quicktunnel.yml up "$@"
