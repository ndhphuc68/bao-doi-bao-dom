#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.." || exit 1

PUBLIC_TUNNELS="cloudflared-quick-backend cloudflared-quick-user cloudflared-quick-admin"

usage() {
  cat <<'EOF'
Usage: ./scripts/public.sh <command>

Commands:
  run             Chi chay 3 Cloudflare tunnel o background (-d), khong dung BE/FE
  up              Giong run
  foreground      Chi chay 3 Cloudflare tunnel o foreground, khong dung BE/FE
  logs            Xem URL trycloudflare.com trong logs
  down            Tat va xoa 3 container tunnel, khong dung BE/FE
  stop            Stop 3 container tunnel, khong dung BE/FE
  restart         Restart stack public tunnel o background
  ps              Xem trang thai container

Thu tu hay dung:
  ./scripts/local-links.sh up
  ./scripts/public.sh run
  ./scripts/public.sh logs
  # copy URL BE tu log cloudflared-quick-backend
  # dat NUXT_PUBLIC_API_BASE=https://<URL_BE> trong .env
  # dat ADMIN_NUXT_PUBLIC_API_BASE=https://<URL_BE> trong .env
  # dat CORS_REFLECT_REQUEST_ORIGIN=true trong .env
  ./scripts/prod.sh restart
  ./scripts/public.sh logs

Xem DB trong trinh duyet (Adminer):
  Sau khi stack prod da chay (./scripts/local-links.sh up hoac ./scripts/prod.sh up),
  mo http://localhost:8080 (mac dinh; dat ADMINER_PORT trong .env de doi cong map ra host).
  Dang nhap: He thong PostgreSQL, May chu db, Nguoi dung / Mat khau / CSDL
  giong POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB (mac dinh root / root / appdb).
EOF
}

compose() {
  docker compose -f docker-compose.prod.yml -f docker-compose.quicktunnel.yml "$@"
}

cmd="${1:-run}"
if [ "$#" -gt 0 ]; then
  shift
fi

case "$cmd" in
  help|-h|--help)
    usage
    ;;
  run|public|up|background)
    compose up --no-deps -d "$@" $PUBLIC_TUNNELS
    ;;
  foreground|fg)
    compose up --no-deps "$@" $PUBLIC_TUNNELS
    ;;
  logs)
    compose logs -f cloudflared-quick-backend cloudflared-quick-user cloudflared-quick-admin
    ;;
  down)
    compose rm -f -s -v $PUBLIC_TUNNELS
    ;;
  stop)
    compose stop $PUBLIC_TUNNELS
    ;;
  restart)
    compose rm -f -s -v $PUBLIC_TUNNELS
    compose up --no-deps -d $PUBLIC_TUNNELS
    ;;
  ps)
    compose ps $PUBLIC_TUNNELS
    ;;
  *)
    usage
    exit 1
    ;;
esac
