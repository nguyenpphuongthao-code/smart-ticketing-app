# Chờ vé thông minh (Smart Ticket Waitlist)

> **Dự án môn học:** Chuyển đổi số trong doanh nghiệp (Digital Transformation in Business)  
> **Tình huống đề tài:** Vào các dịp cao điểm, hành khách không thể mua được vé cho chuyến tàu mong muốn do hết chỗ, và nhu cầu chưa được đáp ứng này hoàn toàn không để lại dấu vết trong dữ liệu. Hệ thống "Chờ vé thông minh" cho phép hành khách đăng ký nhu cầu chờ vé cho các chuyến đã hết chỗ và theo dõi tiến trình; đồng thời hỗ trợ nhân sự điều hành đường sắt tổng hợp, phân tích dữ liệu nhu cầu chưa được đáp ứng theo từng chuyến/tuyến/ngày để **HỖ TRỢ (không tự động hóa)** lập kế hoạch vận hành thực tế.

---

## 1. Hướng dẫn cài đặt & Khởi chạy

Dự án sử dụng SQLite cục bộ, không yêu cầu bất kỳ API key bên ngoài hay cài đặt database server phức tạp.

Khởi chạy tuần tự theo các lệnh chuẩn:

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Tạo và đồng bộ cấu trúc cơ sở dữ liệu SQLite
npx prisma migrate dev

# 3. Nạp dữ liệu mẫu ban đầu (Idempotent seed)
npm run seed

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

---

## 2. Danh sách tài khoản thử nghiệm (Demo Accounts)

Tất cả các tài khoản thử nghiệm đều có mật khẩu chung: `Demo@12345`  
*(Trên trang Đăng nhập có sẵn các nút bấm đăng nhập nhanh 1-click để thuận tiện chấm điểm và trải nghiệm)*

| Vai trò (Role) | Email | Tên hiển thị | Ghi chú & Quyền hạn |
| :--- | :--- | :--- | :--- |
| **STAFF** (Nhân viên) | `nhanvien@demo.local` | Nhân viên điều hành (giả lập) | Toàn quyền truy cập khu vực `/quan-tri/*`: duyệt trạng thái, xem phân tích biểu đồ, theo dõi 6 chỉ số KPI, ghi nhận vé trả và xác nhận ghép chỗ |
| **PASSENGER** (Hành khách 1) | `khach1@demo.local` | Nguyễn Văn An (giả lập) | Quản lý yêu cầu YC-001, YC-006; đăng ký vé chờ mới |
| **PASSENGER** (Hành khách 2) | `khach2@demo.local` | Trần Thị Bình (giả lập) | Quản lý yêu cầu YC-002 (đã có vé phù hợp), YC-007 |
| **PASSENGER** (Hành khách 3) | `khach3@demo.local` | Lê Hoàng Cường (giả lập) | Quản lý yêu cầu YC-003 (đã hủy), YC-008 |
| **PASSENGER** (Hành khách 4) | `khach4@demo.local` | Phạm Minh Đức (giả lập) | Quản lý yêu cầu YC-004 |
| **PASSENGER** (Hành khách 5) | `khach5@demo.local` | Hoàng Ngọc Lan (giả lập) | Quản lý yêu cầu YC-005 |

---

## 3. Kiến trúc & Công nghệ sử dụng

- **Frontend:** Next.js (App Router, Server & Client Components), TypeScript, Tailwind CSS, Lucide React icons.
- **Backend & Database:** Next.js Server Actions, Route Handlers, Prisma ORM, SQLite (`prisma/dev.db`).
- **Xác thực (Authentication):** Cookie-based session (`httpOnly`, SameSite, bảo mật ký mã HMAC SHA-256 qua thư viện chuẩn `jose`).
- **Phân tích & Trực quan hóa:** Recharts (biểu đồ cột phân tích nhu cầu theo chuyến và theo ngày).
- **Kiểm thử (Automated Tests):** Vitest (kiểm tra toàn diện quy tắc nghiệp vụ, công thức 6 chỉ số KPI và kịch bản Acceptance Test).

---

## 4. Các tính năng chính của hệ thống

### A. Khu vực công cộng (Public)
1. **Trang chủ (`/`):**
   - Hero banner tìm kiếm ga đi, ga đến, ngày khởi hành từ bộ dữ liệu 66 ga đường sắt Việt Nam.
   - Live counter hiển thị số lượng yêu cầu và tổng số vé đang chờ từ cơ sở dữ liệu thời gian thực.
   - Phần "Cách hoạt động" 3 bước rõ ràng: *Đăng ký chờ -> Theo dõi trạng thái -> Nhận thông báo*.
   - Hai cột so sánh lợi ích: *"Dành cho hành khách"* & *"Dành cho nhân sự điều hành"*.
   - Khung giới thiệu minh bạch: *"Phạm vi và giới hạn của bản demo"*.
2. **Tìm chuyến (`/tim-chuyen`):**
   - Bộ lọc linh hoạt theo ga đi, ga đến, ngày đi.
   - Nhãn trạng thái tồn chỗ theo từng hạng vé: **"Còn vé"** (kèm số chỗ) hoặc **"Hết vé"**.
3. **Chi tiết chuyến tàu (`/chuyen/[id]`):**
   - Bảng tồn chỗ chi tiết (sức chứa, đã bán, còn lại).
   - Nếu hạng vé hết chỗ: hiển thị nút **"Đăng ký chờ"** (yêu cầu đăng nhập, tự động chuyển tiếp lại sau khi đăng nhập).
4. **Giới thiệu (`/gioi-thieu`):**
   - Trình bày bài toán thực tế, ý tưởng giải pháp và tuyên bố rõ ràng danh sách **"Bản demo KHÔNG làm"**.

### B. Khu vực dành cho Hành khách (Passenger)
1. **Đăng ký chờ vé (`/cho-ve/moi`):**
   - Chọn chuyến tàu, hạng chỗ, số lượng vé (stepper 1-6 vé).
   - Tùy chọn linh hoạt: *"Lệch ngày ±1"*, *"Chuyến khác cùng tuyến"*, *"Loại chỗ khác"*.
   - Kênh nhận thông báo giả lập: *Website / SMS / Email*.
   - Chặn đăng ký khi chuyến còn đủ vé với thông báo chuẩn: *"Chuyến này còn vé, bạn có thể đặt vé trên kênh bán vé chính thức."*
   - Ghi nhật ký phân tích `form_started` khi mở biểu mẫu và `request_created` khi tạo thành công.
2. **Quản lý yêu cầu của tôi (`/yeu-cau`):**
   - Lọc theo 3 trạng thái chuẩn: **"Đang chờ"** (amber), **"Có vé phù hợp"** (green), **"Đã hủy"** (gray).
   - Tìm kiếm theo mã yêu cầu (YC-xxx).
3. **Chi tiết yêu cầu (`/yeu-cau/[code]`):**
   - Timeline tiến trình 3 bước trực quan: *"Đã gửi yêu cầu" -> "Đang chờ vé phù hợp" -> "Có vé phù hợp"*.
   - Nút **"Hủy yêu cầu"** (hộp thoại xác nhận kèm lý do tùy chọn).
   - Khi có vé phù hợp: hiển thị banner chúc mừng, thông tin chuyến/chỗ gợi ý, nút *"Tôi đã đặt vé trên kênh chính thức (giả lập)"* (cập nhật `convertedAt`) và thang đánh giá CSAT 1-5 sao.
4. **Trung tâm thông báo (`/thong-bao`):**
   - Danh sách thông báo giả lập trong ứng dụng, nút *"Đánh dấu đã đọc"* (cập nhật `readAt`), badge đếm số thông báo chưa đọc trên thanh điều hướng.
5. **Hồ sơ cá nhân (`/ho-so`):**
   - Đổi thông tin tên, số điện thoại, kênh nhận thông báo mặc định.
   - Đổi mật khẩu tài khoản.
   - **Xuất dữ liệu của tôi (JSON):** Tải về toàn bộ dữ liệu cá nhân theo quyền riêng tư.
   - **Xóa tài khoản:** Xóa người dùng và toàn bộ các yêu cầu liên quan (cascade delete).

### C. Khu vực Quản trị & Điều hành (`/quan-tri/*`)
1. **Tổng quan (`/quan-tri`):**
   - 4 thẻ thống kê: *"Yêu cầu đang chờ"*, *"Vé đang chờ"*, *"Có vé phù hợp"*, *"Đã hủy"*.
   - Hộp **"Gợi ý để nhân sự xem xét"**: Text sinh tự động từ dữ liệu thực tế (chỉ ra chuyến có nhu cầu chờ cao nhất kèm khuyến cáo kỹ thuật, **tuyệt đối không có nút hành động tự động**).
2. **Danh sách yêu cầu chờ (`/quan-tri/yeu-cau`):**
   - Bảng quản lý chi tiết: Mã, Chuyến, Ngày đi, Số vé, Chấp nhận thay thế, Trạng thái, Tạo lúc, Thông báo lúc.
   - Lọc theo Tuyến/Ngày/Chuyến/Trạng thái, tìm theo mã, sắp xếp, phân trang và nút **"Xuất CSV"** (UTF-8 có BOM hiển thị chuẩn tiếng Việt trong Excel).
3. **Chi tiết & Đổi trạng thái (`/quan-tri/yeu-cau/[code]`):**
   - Cho phép nhân sự đổi trạng thái theo luồng hợp lệ: "Đang chờ" sang "Có vé phù hợp" hoặc "Đã hủy".
   - Khi chọn "Có vé phù hợp": nhân viên chọn chuyến và hạng ghế gợi ý, nhập ghi chú; hệ thống tạo thông báo giả lập tương ứng.
   - Checkbox đánh dấu *"Thông báo sai / không còn chỗ"* để tính KPI.
4. **Phân tích nhu cầu (`/quan-tri/phan-tich`):**
   - Biểu đồ cột: *Số vé đang chờ theo chuyến* (cột cao nhất đánh dấu "Nhu cầu cao").
   - Biểu đồ: *Số vé đang chờ theo ngày khởi hành*.
   - Bảng phân bổ nhu cầu theo từng tuyến và hạng vé.
   - *Chỉ tính toán trên các yêu cầu có trạng thái "Đang chờ"*.
5. **Đo lường KPI (`/quan-tri/kpi`):**
   - Bảng theo dõi đầy đủ 6 chỉ số KPI: (1) Tỷ lệ hoàn tất đăng ký chờ; (2) Tỷ lệ chuyển thành đặt vé; (3) Thời gian phản hồi thông báo; (4) Tỷ lệ thông báo sai; (5) Điểm CSAT trung bình; (6) Số lượt chờ theo chuyến/ngày.
   - Đầy đủ định nghĩa, công thức toán học, cách đo lường, giá trị hiện tại và ngưỡng quyết định: *"Chưa đặt (cần baseline)"*.
6. **Quản lý chuyến & Gợi ý ghép chỗ (`/quan-tri/chuyen`):**
   - Điều chỉnh sức chứa (capacity) và vé đã bán (sold) trực tiếp.
   - **Ghi nhận vé trả (giả lập):** Nhập chuyến, hạng chỗ và số lượng vé trả.
   - Thuật toán quy tắc **Gợi ý ghép chỗ** tự động kích hoạt, sắp xếp theo thời gian gửi và thứ tự ưu tiên:
     - Ưu tiên 1: Đúng chuyến & đúng hạng chỗ.
     - Ưu tiên 2: Cùng chuyến, loại chỗ khác.
     - Ưu tiên 3: Chuyến khác cùng tuyến trong ngày.
     - Ưu tiên 4: Lệch ngày ±1 cùng tuyến.
   - Nhân viên chủ động click *"Xác nhận"* cho từng gợi ý.
   - Cảnh báo rõ ràng: *"Gợi ý có thể trùng chỗ giữa nhiều yêu cầu; hệ thống không giữ chỗ."*
7. **Nhật ký kiểm toán (`/quan-tri/nhat-ky`):**
   - Bảng AuditLog ghi nhận chi tiết: Ai thực hiện, thao tác gì, thực thể nào, dữ liệu trước/sau (before/after JSON) và mốc thời gian.

---

## 5. Các ràng buộc cốt lõi (Hard Constraints)

1. **Dữ liệu giả lập 100%:** Không tích hợp bất kỳ hệ thống vé thật, cổng thanh toán, dịch vụ SMS hay Email thực tế nào. Mọi thông báo gửi đi đều ghi nhận dạng simulated trong bảng `Notification`.
2. **Không sao chép nhận diện thương hiệu:** Giao diện hoàn toàn trung tính, thiết kế gốc với tông màu Calm Blue (`#2563EB`), Inter font chuẩn công thái học, không sử dụng logo, tên gọi hay bố cục của Tổng công ty Đường sắt Việt Nam (VNR).
3. **Con người kiểm soát quyết định (Human-in-the-loop):** Hệ thống không bao giờ tự động thêm toa, lập tàu hay tự động gán vé cho khách. Mọi quyết định đều do nhân sự xem xét và click xác nhận.
4. **Không giữ chỗ & Không thanh toán:** Khách hàng không bị thu phí và hệ thống không giữ chỗ thay thế.
5. **Ba trạng thái duy nhất:** `Đang chờ` (amber), `Có vé phù hợp` (green), `Đã hủy` (gray).
6. **Banner bắt buộc xuất hiện trên mọi trang:**
   > *"Dữ liệu giả lập – sản phẩm minh họa của nhóm sinh viên, không phải hệ thống chính thức. Vui lòng không nhập thông tin cá nhân thật."*

---

## 6. Chạy kiểm thử tự động (Automated Tests)

Chạy bộ kiểm thử Vitest kiểm tra toàn diện các quy tắc nghiệp vụ, tính toán KPI và kịch bản Acceptance Test:

```bash
npm test
```

Kết quả: Toàn bộ 9/9 ca kiểm thử trong 2 test suites đều vượt qua (100% Passed).
