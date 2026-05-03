# Bao đổi bao dom — Production

Hướng dẫn chạy production bằng script, `docker-compose.prod.yml` và Cloudflare Tunnel.

---

## Yêu cầu

- Docker + Docker Compose v2
- Cloudflare chỉ cần khi muốn public app ra internet

---

## 1. Chạy production local / LAN

Nếu muốn chạy BE, FE user và FE admin thành 3 link local riêng, dùng script này:

```bash
./scripts/local-links.sh up
```

Script sẽ chạy:

```text
BE/API:    http://localhost:3001
FE user:   http://localhost:3000
FE admin:  http://localhost:3002
```

Và tự set:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
ADMIN_NUXT_PUBLIC_API_BASE=http://localhost:3001
```

Nếu muốn mở từ máy khác trong LAN, chạy:

```bash
LOCAL_IP=192.168.x.x ./scripts/local-links.sh up
```

Khi đó 3 link sẽ là:

```text
BE/API:    http://192.168.x.x:3001
FE user:   http://192.168.x.x:3000
FE admin:  http://192.168.x.x:3002
```

Lệnh phụ:

```bash
./scripts/local-links.sh logs
./scripts/local-links.sh ps
./scripts/local-links.sh check
./scripts/local-links.sh down
./scripts/local-links.sh restart
```

Nếu web lên nhưng không có CSS, chạy lại build sạch:

```bash
./scripts/local-links.sh rebuild
./scripts/local-links.sh check
```

Nếu `check` báo CSS OK mà trình duyệt vẫn không có style, mở tab ẩn danh hoặc hard refresh `Ctrl+F5`; app user có service worker nên browser có thể đang giữ asset cũ.

Trong thư mục gốc repo:

```bash
# Nếu muốn mở từ máy khác trong LAN, đặt IP máy host
export LOCAL_IP=192.168.x.x

./scripts/prod.sh up
```

Lệnh tương đương:

```bash
docker compose -f docker-compose.prod.yml up --build -d db backend frontend admin-frontend
```

**Cổng dịch vụ**

| Dịch vụ | URL mặc định |
|---------|--------------|
| App người dùng | http://localhost:3000 |
| API backend | http://localhost:3001 |
| Admin web | http://localhost:3002 |
| PostgreSQL | localhost:5432 |

**Set link BE cho FE user và FE admin**

FE user và FE admin đều gọi BE qua biến API base:

```env
NUXT_PUBLIC_API_BASE=http://<IP_MAY_CHAY_DOCKER>:3001
ADMIN_NUXT_PUBLIC_API_BASE=http://<IP_MAY_CHAY_DOCKER>:3001
```

Nếu chỉ chạy trên cùng máy, có thể để mặc định `localhost`. Nếu mở từ điện thoại/máy khác trong LAN, tạo hoặc sửa `.env` ở root:

```env
LOCAL_IP=192.168.x.x
NUXT_PUBLIC_API_BASE=http://192.168.x.x:3001
ADMIN_NUXT_PUBLIC_API_BASE=http://192.168.x.x:3001
```

`docker-compose.prod.yml` đã dùng `LOCAL_IP` để tự thêm CORS cho BE với FE user `:3000` và FE admin `:3002`.

**Lệnh script hay dùng**

```bash
./scripts/prod.sh db          # DB
./scripts/prod.sh be          # DB + backend
./scripts/prod.sh fe-user     # DB + backend + frontend user
./scripts/prod.sh fe-admin    # DB + backend + frontend admin
./scripts/prod.sh logs        # xem logs
./scripts/prod.sh ps          # xem container
./scripts/prod.sh down        # tắt stack prod
```

---

## 2. Cloudflare Quick Tunnel free

Quick Tunnel tạo URL public miễn phí dạng `https://xxxx.trycloudflare.com`. URL này là tạm thời, đổi sau mỗi lần chạy lại tunnel; đây không phải public IP cố định.

Stack public này tạo **3 link riêng**:

```text
BE/API:    cloudflared-quick-backend
FE user:   cloudflared-quick-user
FE admin:  cloudflared-quick-admin
```

`./scripts/public.sh` chỉ bật/tắt 3 tunnel Cloudflare. Script này không build, không restart và không recreate BE/FE.

Chạy theo thứ tự này.

**Bước 0: chạy BE và 2 FE trước**

```bash
./scripts/local-links.sh up
```

**Bước 1: bật 3 public tunnel nền bằng `-d`**

```bash
./scripts/public.sh run
```

**Bước 2: xem log để lấy URL public**

```bash
./scripts/public.sh logs
```

Trong log tìm:

- `cloudflared-quick-backend`: URL BE/API.
- `cloudflared-quick-user`: URL FE user.
- `cloudflared-quick-admin`: URL admin web.

**Bước 3: set link BE cho FE user và FE admin**

Sau khi có URL BE, ví dụ `https://be-abc.trycloudflare.com`, tạo hoặc sửa `.env` ở root nếu muốn FE user/admin gọi BE qua link public:

```env
NUXT_PUBLIC_API_BASE=https://be-abc.trycloudflare.com
ADMIN_NUXT_PUBLIC_API_BASE=https://be-abc.trycloudflare.com
CORS_REFLECT_REQUEST_ORIGIN=true
```

Không thêm `/api` ở cuối vì BE tunnel đang trỏ thẳng vào backend.

**Bước 4: restart BE/FE bằng script app, không dùng public.sh**

```bash
./scripts/prod.sh restart
./scripts/public.sh logs
```

`public.sh` vẫn chỉ giữ nhiệm vụ bật/tắt tunnel. Lệnh `prod.sh restart` chỉ recreate DB/BE/FE services, không tắt 3 tunnel đang chạy.

Nếu chỉ cần lấy 3 link và không cần đổi API base, bỏ qua bước 3 và 4.

Sau khi đã cấu hình xong, những lần sau để lấy 3 link public chỉ cần:

```bash
./scripts/public.sh up
./scripts/public.sh logs
```

Tắt public tunnel:

```bash
./scripts/public.sh down
```

Lệnh tương đương:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.quicktunnel.yml up --no-deps -d cloudflared-quick-backend cloudflared-quick-user cloudflared-quick-admin
```

---

## 3. Cloudflare Tunnel có token

Dùng khi bạn có domain / hostname ổn định trong Cloudflare Zero Trust.

1. Vào Cloudflare Zero Trust -> Networks -> Tunnels -> tạo tunnel và lấy token.
2. Đặt biến:

   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJ...
   ```

3. Chạy:

   ```bash
   docker compose -f docker-compose.prod.yml --profile tunnel up --build
   ```

4. Trong dashboard tunnel, cấu hình Public Hostname trỏ về service Docker:

   ```text
   http://frontend:3000
   http://backend:3000
   http://admin-frontend:3002
   ```

---

## 4. Biến môi trường prod

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `LOCAL_IP` | `localhost` | IP LAN để frontend/admin gọi API |
| `POSTGRES_USER` | `root` | User PostgreSQL |
| `POSTGRES_PASSWORD` | `root` | Password PostgreSQL |
| `POSTGRES_DB` | `appdb` | Database PostgreSQL |
| `POSTGRES_PORT` | `5432` | Port PostgreSQL trên host |
| `DATABASE_URL` | `postgresql://root:root@db:5432/appdb?schema=public` | Chuỗi kết nối backend -> DB |
| `FRONTEND_ORIGIN` | localhost + `LOCAL_IP` | CORS cho backend |
| `BACKEND_PORT` | `3001` | Port API trên host |
| `FRONTEND_PORT` | `3000` | Port frontend user |
| `ADMIN_FRONTEND_PORT` | `3002` | Port frontend admin |
| `NUXT_PUBLIC_API_BASE` | `http://${LOCAL_IP:-localhost}:3001` | API base cho frontend user |
| `ADMIN_NUXT_PUBLIC_API_BASE` | `http://${LOCAL_IP:-localhost}:3001` | API base cho frontend admin |
| `NUXT_PUBLIC_ADMIN_EMAILS` | rỗng | Email được phép vào admin |
| `NUXT_PUBLIC_SUPER_ADMIN_EMAILS` | rỗng | Email super admin |
| `CLOUDFLARE_TUNNEL_TOKEN` | rỗng | Token cho tunnel có hostname cố định |

---

## 5. Seed dữ liệu trong prod

Sau khi prod stack đã chạy:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

Hoặc dùng script:

```bash
./scripts/prod.sh seed
```

Chỉ seed điểm thu gom:

```bash
docker compose -f docker-compose.prod.yml exec backend npm run seed:collection-points
```

Hoặc dùng script:

```bash
./scripts/prod.sh seed-points
```
