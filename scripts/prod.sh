#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.." || exit 1

PROD_SERVICES="db adminer backend frontend admin-frontend"
BUILD_SERVICES="backend frontend admin-frontend"

usage() {
  cat <<'EOF'
Usage: ./scripts/prod.sh <command>

Commands:
  up              Build va chay prod stack: DB, BE, FE user, FE admin
  build           Build image prod
  down            Tat va xoa container prod stack
  stop            Stop container prod stack
  restart         Restart prod stack
  logs            Xem log prod stack
  ps              Xem trang thai container
  db              Chay rieng DB
  be              Chay rieng DB + backend
  fe-user         Chay rieng DB + backend + frontend user
  fe-admin        Chay rieng DB + backend + frontend admin
  seed            Seed du lieu mau trong backend
  seed-points     Chi seed diem thu gom
EOF
}

compose() {
  docker compose -f docker-compose.prod.yml "$@"
}

cmd="${1:-help}"

case "$cmd" in
  help|-h|--help)
    usage
    ;;
  up|prod)
    compose up --build -d $PROD_SERVICES
    ;;
  build)
    compose build $BUILD_SERVICES
    ;;
  down)
    compose down
    ;;
  stop)
    compose stop $PROD_SERVICES
    ;;
  restart)
    compose up --build --force-recreate -d $PROD_SERVICES
    ;;
  logs)
    compose logs -f $PROD_SERVICES
    ;;
  ps)
    compose ps
    ;;
  db)
    compose up -d db
    ;;
  be)
    compose up --build -d db backend
    ;;
  fe-user)
    compose up --build -d db backend frontend
    ;;
  fe-admin)
    compose up --build -d db backend admin-frontend
    ;;
  seed)
    compose exec backend npm run seed
    ;;
  seed-points)
    compose exec backend npm run seed:collection-points
    ;;
  *)
    usage
    exit 1
    ;;
esac
