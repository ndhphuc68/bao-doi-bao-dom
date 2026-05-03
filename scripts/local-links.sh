#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.." || exit 1

HOST="${LOCAL_IP:-localhost}"
API_BASE="http://${HOST}:3001"
USER_URL="http://${HOST}:3000"
ADMIN_URL="http://${HOST}:3002"
# Trung voi docker-compose.prod.yml: ${ADMINER_PORT:-8080}
ADMINER_PORT_VAL="${ADMINER_PORT:-8080}"
ADMINER_URL="http://${HOST}:${ADMINER_PORT_VAL}"

export LOCAL_IP="$HOST"
export NUXT_PUBLIC_API_BASE="$API_BASE"
export ADMIN_NUXT_PUBLIC_API_BASE="$API_BASE"
export FRONTEND_ORIGIN="http://localhost:3000,http://127.0.0.1:3000,http://${HOST}:3000,http://localhost:3002,http://127.0.0.1:3002,http://${HOST}:3002"
export CORS_REFLECT_REQUEST_ORIGIN="true"

usage() {
  cat <<'EOF'
Usage: ./scripts/local-links.sh <command>

Commands:
  up       Build va chay 3 link local rieng: BE, FE user, FE admin
  rebuild  Build lai sach FE/BE va recreate container
  check    Kiem tra HTML co link CSS va CSS co tai duoc khong
  logs     Xem logs cua BE va 2 FE
  ps       Xem trang thai container
  down     Tat stack prod local
  restart  Restart stack prod local

Mac dinh: up
EOF
}

compose() {
  docker compose -f docker-compose.prod.yml "$@"
}

print_links() {
  cat <<EOF

Dang chay 3 link local:
  BE/API:    ${API_BASE}
  FE user:   ${USER_URL}
  FE admin:  ${ADMIN_URL}
  DB (Adminer): ${ADMINER_URL}

FE user va FE admin dang goi BE qua:
  ${API_BASE}

EOF
}

check_css() {
  name="$1"
  url="$2"
  tmp="/tmp/bao-doi-bao-dom-${name}.html"

  if ! curl -fsS "$url" > "$tmp"; then
    echo "FAIL ${name}: khong tai duoc ${url}"
    return 1
  fi

  css_path=$(grep -o 'href="[^"]*\.css[^"]*"' "$tmp" | sed 's/^href="//; s/"$//' | head -n 1 || true)
  if [ -z "$css_path" ]; then
    echo "FAIL ${name}: HTML khong co link CSS"
    return 1
  fi

  case "$css_path" in
    http://*|https://*) css_url="$css_path" ;;
    /*) css_url="${url%/}${css_path}" ;;
    *) css_url="${url%/}/${css_path}" ;;
  esac

  if curl -fsSI "$css_url" >/dev/null; then
    echo "OK ${name}: CSS tai duoc ${css_url}"
  else
    echo "FAIL ${name}: CSS khong tai duoc ${css_url}"
    return 1
  fi
}

cmd="${1:-up}"

case "$cmd" in
  help|-h|--help)
    usage
    ;;
  up)
    compose up --build --force-recreate -d db adminer backend frontend admin-frontend
    print_links
    ;;
  rebuild)
    compose build --no-cache backend frontend admin-frontend
    compose up --force-recreate -d db adminer backend frontend admin-frontend
    print_links
    ;;
  check)
    check_css "frontend" "$USER_URL"
    check_css "admin" "$ADMIN_URL"
    ;;
  logs)
    compose logs -f backend frontend admin-frontend
    ;;
  ps)
    compose ps
    ;;
  down)
    compose down
    ;;
  restart)
    compose up --build --force-recreate -d db adminer backend frontend admin-frontend
    print_links
    ;;
  *)
    usage
    exit 1
    ;;
esac
