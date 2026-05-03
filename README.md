# Bao đổi bao dom — Hướng dẫn chạy nhanh

Tài liệu này dành cho chạy local/dev. Hướng dẫn production bằng script và Cloudflare public URL nằm ở [README.prod.md](README.prod.md).

---

## Yêu cầu

- Docker + Docker Compose v2
- Node.js/npm nếu muốn chạy seed trực tiếp trên máy

---

## 1. Chạy local / LAN bằng Docker

Trong thư mục gốc repo:

```bash
# Gợi ý: đặt LOCAL_IP = IP máy bạn trên LAN, để điện thoại truy cập được
export LOCAL_IP=192.168.x.x

docker compose up --build
```

**Cổng dịch vụ**

| Dịch vụ | URL máy bạn | Ghi chú |
|---------|-------------|---------|
| App người dùng | http://localhost:3000 | Nuxt frontend |
| API backend | http://localhost:3001 | NestJS |
| Admin web | http://localhost:3002 | Nuxt admin |
| Adminer DB | http://localhost:8080 | Server: `db`, user/pass xem `docker-compose.yml` |

Chuỗi kết nối Postgres từ máy host:

```text
postgresql://root:root@localhost:5432/appdb?schema=public
```

Dừng stack:

```bash
docker compose down
```

---

## 2. Quick Tunnel kiểu dev

Nếu cần chia sẻ nhanh app dev qua Cloudflare Quick Tunnel:

```bash
docker compose -f docker-compose.yml -f docker-compose.quicktunnel.yml up --build
```

Trong log Docker:

- `cloudflared-quick`: URL app user, API đi qua `/api`.
- `cloudflared-quick-admin`: URL admin web.

Production Quick Tunnel dùng `./scripts/public.sh run`, xem [README.prod.md](README.prod.md).

---

## 3. Chạy seed dữ liệu mẫu

Seed chạy trong backend, cần Postgres đã chạy và `DATABASE_URL` khớp DB.

### Khi đang dùng Docker Compose

Sau khi `docker compose up` và container `backend` đã lên:

```bash
docker compose exec backend npm run seed
```

Chỉ seed bảng điểm thu gom:

```bash
docker compose exec backend npm run seed:collection-points
```

### Chạy seed trên máy

```bash
cd backend
export DATABASE_URL=postgresql://root:root@localhost:5432/appdb?schema=public
npm install
npm run seed
```

---

## 4. Biến môi trường local hay dùng

| Biến | Ý nghĩa |
|------|---------|
| `LOCAL_IP` | IP LAN cho link trong compose. |
| `NUXT_PUBLIC_ADMIN_EMAILS` | Email được phép đăng nhập admin. |

Biến production chi tiết nằm ở [README.prod.md](README.prod.md).

---

## 5. Cấu trúc thư mục chính

- `backend/` — API NestJS, seed trong `src/database/`
- `frontend/` — app người dùng Nuxt
- `admin-frontend/` — admin Nuxt
- `docker-compose.yml` — stack local/dev
- `docker-compose.prod.yml` — stack production độc lập
- `docker-compose.quicktunnel.yml` — quick tunnel + proxy
- `scripts/local-links.sh` — chạy BE, FE user, FE admin thành 3 link local riêng
- `scripts/prod.sh` — shortcut chạy production
- `scripts/public.sh` — shortcut chạy public tunnel
- `Makefile` — shortcut thay thế nếu máy có sẵn `make`
- `README.prod.md` — hướng dẫn production
