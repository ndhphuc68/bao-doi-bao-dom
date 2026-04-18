# Bao đổi bao dom — Hướng dẫn chạy nhanh

Tài liệu tóm tắt: **Docker**, **Cloudflare Tunnel** (panel / quick tunnel), và **chạy seed** dữ liệu mẫu.

---

## Yêu cầu

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2  
- (Tuỳ chọn) Tài khoản Cloudflare nếu dùng tunnel có token (Zero Trust)

---

## 1. Chạy bằng Docker (mặc định — máy local / LAN)

Trong thư mục gốc repo:

```bash
# Gợi ý: đặt LOCAL_IP = IP máy bạn trên LAN (điện thoại truy cập được)
export LOCAL_IP=192.168.x.x   # ví dụ; không bắt buộc nếu chỉ dùng localhost

docker compose up --build
```

**Cổng dịch vụ**

| Dịch vụ        | URL (máy bạn)        | Ghi chú                    |
|----------------|----------------------|----------------------------|
| App người dùng | http://localhost:3000 | Nuxt frontend              |
| API backend    | http://localhost:3001 | NestJS                     |
| Admin web      | http://localhost:3002 | Nuxt admin                 |
| Adminer (DB)   | http://localhost:8080 | Server: `db`, user/pass xem `docker-compose.yml` |

Chuỗi kết nối Postgres (từ máy host):  
`postgresql://root:root@localhost:5432/appdb?schema=public`

Dừng stack:

```bash
docker compose down
```

---

## 2. Cloudflare — hai cách

### A) Quick Tunnel (`*.trycloudflare.com`) — không cần domain, URL đổi mỗi lần chạy

Dùng khi muốn chia sẻ nhanh app + API **cùng một origin** (Nginx gộp `/` → frontend, `/api/` → backend).

```bash
./scripts/quicktunnel-up.sh
# tương đương:
# docker compose -f docker-compose.yml -f docker-compose.quicktunnel.yml up
```

**Xem URL public**

- Trong log Docker, tìm container **`cloudflared-quick`** → một dòng URL dạng `https://xxxx.trycloudflare.com` (app user: UI + API qua `/api`).
- Container **`cloudflared-quick-admin`** → URL thứ hai cho **admin** (port 3002).

**Admin từ xa (qua tunnel)**

1. Copy URL **app user** (tunnel thứ nhất), ví dụ `https://abc.trycloudflare.com` (không có dấu `/` cuối).
2. Tạo / sửa file **`.env`** ở **thư mục gốc repo**:

   ```env
   ADMIN_NUXT_PUBLIC_API_BASE=https://abc.trycloudflare.com/api
   ```

3. Khởi động lại stack quick tunnel (để `admin-frontend` đọc biến này).

4. Mở URL từ log **`cloudflared-quick-admin`** để vào panel admin.

**Lưu ý:** Mỗi lần tắt/bật quick tunnel, URL thường thay đổi — cần cập nhật lại `ADMIN_NUXT_PUBLIC_API_BASE` nếu admin gọi API qua tunnel app.

---

### B) Cloudflare Tunnel có token (Zero Trust — URL ổn định theo domain bạn cấu hình)

1. Vào Cloudflare **Zero Trust** → **Networks** → **Tunnels** → tạo tunnel, lấy **token**.
2. Đặt biến môi trường (hoặc file `.env` ở thư mục gốc):

   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJ...
   ```

3. Chạy kèm profile `tunnel`:

   ```bash
   docker compose --profile tunnel up --build
   ```

4. Trong dashboard tunnel, cấu hình **Public Hostname** trỏ về service Docker, ví dụ:
   - `http://frontend:3000`
   - `http://backend:3000`
   - `http://admin-frontend:3002`

Chi tiết gợi ý nằm trong comment của `docker-compose.yml` (service `cloudflared`).

---

## 3. Chạy seed (điểm thu gom & dữ liệu mẫu)

Seed chạy trong **backend**, cần **Postgres đã chạy** và biến `DATABASE_URL` khớp DB.

### Khi đang dùng Docker Compose

Sau khi `docker compose up` và container `backend` đã lên:

```bash
docker compose exec backend npm run seed
```

Chỉ seed bảng điểm thu gom:

```bash
docker compose exec backend npm run seed:collection-points
```

### Chạy seed trên máy (không vào container)

Cài dependency trong `backend/`, rồi:

```bash
cd backend
export DATABASE_URL=postgresql://root:root@localhost:5432/appdb?schema=public
npm install
npm run seed
```

---

## 4. Biến môi trường hay dùng (tóm tắt)

| Biến | Ý nghĩa |
|------|---------|
| `LOCAL_IP` | IP LAN cho link trong compose (mặc định trong file có placeholder). |
| `CLOUDFLARE_TUNNEL_TOKEN` | Bật service `cloudflared` (profile `tunnel`). |
| `ADMIN_NUXT_PUBLIC_API_BASE` | Khi dùng **quick tunnel**: base URL API cho admin (ví dụ `https://xxxx.trycloudflare.com/api`). |
| `NUXT_PUBLIC_ADMIN_EMAILS` | Email được phép đăng nhập admin (xem `docker-compose.yml`). |

---

## 5. Cấu trúc thư mục chính

- `backend/` — API NestJS, seed trong `src/database/`
- `frontend/` — app người dùng (Nuxt)
- `admin-frontend/` — admin (Nuxt)
- `docker-compose.yml` — stack chính
- `docker-compose.quicktunnel.yml` — quick tunnel + proxy
- `scripts/quicktunnel-up.sh` — shortcut chạy quick tunnel

Nếu cần chỉnh CORS / origin khi deploy, xem `FRONTEND_ORIGIN` và các biến trong `docker-compose.yml`.
