# Hướng Dẫn Triển Khai Website "Chờ vé thông minh" Lên Server Thật

Dự án sử dụng **Next.js (App Router)** và **SQLite** (`prisma/dev.db`). Để dữ liệu không bị mất sau khi khởi động lại, server cần có ổ đĩa lưu file bền vững (Persistent Disk).

Dưới đây là 3 cách triển khai lên server thật:

---

## Cách 1: Triển khai lên Cloud Server Miễn phí (Render.com hoặc Railway) - Khuyên dùng

Đây là cách phổ biến và dễ nhất cho sinh viên, tự động cấp **Domain HTTPS miễn phí** (ví dụ: `https://cho-ve-thong-minh.onrender.com`).

### Các bước thực hiện với Render.com:
1. Đẩy mã nguồn dự án lên một kho GitHub cá nhân của bạn.
2. Truy cập [render.com](https://render.com), đăng ký/đăng nhập bằng GitHub.
3. Chọn **New +** $\rightarrow$ **Web Service**.
4. Chọn repository GitHub chứa dự án của bạn.
5. Cấu hình các thông số:
   - **Name:** `cho-ve-thong-minh`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma migrate deploy && npm run seed && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free`
6. Nhấn **Deploy Web Service**.
7. Chờ 2–3 phút, Render sẽ cấp cho bạn một đường link công khai dạng `https://...onrender.com` có thể gửi cho bất kỳ ai truy cập từ máy tính hoặc điện thoại!

---

## Cách 2: Triển khai lên VPS riêng (Ubuntu / Linux) bằng Docker Compose

Nếu bạn đã thuê một máy chủ ảo VPS (DigitalOcean, AWS EC2, Linode, Vultr, v.v.):

1. Cài đặt Docker & Docker Compose trên VPS:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```
2. Sao chép thư mục dự án lên VPS (qua `git clone` hoặc `scp`).
3. Tại thư mục dự án trên VPS, chạy 1 lệnh duy nhất:
   ```bash
   docker compose up -d --build
   ```
4. Kiểm tra trạng thái:
   ```bash
   docker compose ps
   ```
5. Website sẽ chạy tại địa chỉ IP của VPS: `http://<IP-VPS>:3000`. Bạn có thể trỏ tên miền (Domain) và cấu hình Nginx + SSL Certbot miễn phí nếu cần.

---

## Cách 3: Mở Link Online Công Khai Trực Tiếp Từ Máy (Tức thì trong 1 phút)

Nếu bạn cần link HTTPS thật ngay lập tức để gửi cho thầy cô hoặc mở trên điện thoại mà chưa kịp setup tài khoản cloud server:

1. Khởi động website ở chế độ production:
   ```bash
   npm run build
   npm run start
   ```
2. Mở một cửa sổ Terminal mới và chạy:
   ```bash
   npx localtunnel --port 3000
   ```
3. Terminal sẽ cấp ngay cho bạn một đường link công khai, ví dụ:  
   `your url is: https://smart-waitlist-demo.loca.lt`  
   Link này có thể truy cập từ bất kỳ đâu trên thế giới!
