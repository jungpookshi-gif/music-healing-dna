# Backend quản trị Music Healing DNA

Node.js 20+; chỉ dùng thư viện chuẩn, không npm install hoặc build. GitHub Pages chỉ phục vụ frontend; chạy backend này trên máy chủ Node riêng có HTTPS và ổ đĩa riêng bền vững. Không đặt thư mục dữ liệu trong thư mục public hoặc repo.

## Demo cục bộ

Từ gốc repo:

```sh
SERVE_STATIC=1 node server/server.mjs
```

Mở `http://127.0.0.1:8787/admin/`, nhập mật khẩu demo `1234`. Máy chủ tự thay adminApi trong bản config trả về khi phục vụ cục bộ; không sửa file config trên đĩa. Có 48 phiếu A và 96 phiên B GIẢ LẬP được tạo hoàn toàn từ mã backend. Không phải kết quả nghiên cứu. Không ghi fixture vào ổ đĩa cho tới khi nhận một submission thử hợp lệ.

Để kiểm tra đường dẫn Pages có tên repo:

```sh
SERVE_STATIC=1 STATIC_PREFIX=/music-healing-dna node server/server.mjs
```

Mở `http://127.0.0.1:8787/music-healing-dna/admin/`. Chế độ phục vụ frontend chỉ cho phép các trang/asset được chọn; không phục vụ server/, mật khẩu hoặc dữ liệu riêng.

## Kết nối frontend Pages

1. Chạy backend trên host Node qua reverse proxy HTTPS. Mặc định chỉ lắng nghe loopback; host nào yêu cầu bind công khai thì đặt HOST=0.0.0.0 theo cấu hình của host. PORT mặc định 8787. Không triển khai backend như static asset.
2. Đặt ALLOWED_ORIGIN là đúng origin của frontend, ví dụ `https://jungpookshi-gif.github.io` (không thêm tên repo hoặc dấu / cuối). Chỉ origin này được phép gọi API từ trình duyệt.
3. Đặt `adminApi: 'https://<backend-host>/api/'` trong config.js. Không đặt mật khẩu/token vào file này. HTTPS bắt buộc ngoài localhost.
4. Nếu muốn gửi trực tiếp từ biểu mẫu, đặt `endpoint: 'https://<backend-host>/api/submit'`. Endpoint trong bản giao vẫn để trống; không âm thầm chuyển nơi nhận dữ liệu. Khi trống, kết quả vẫn là mã sao chép như trước.

GitHub Pages không chạy Node.js. Chỉ merge frontend lên Pages sẽ chưa tạo ra một backend. Không có host backend công khai được cung cấp/triển khai trong PR này.

## Biến môi trường

- ADMIN_PASSWORD: đổi mật khẩu tại backend; mặc định demo là 1234.
- DEMO_MODE: mặc định true. Chỉ nhận/đọc dữ liệu có is_simulated=1; chặn dữ liệu thật bằng HTTP 403.
- DEMO_MODE=false: ADMIN_PASSWORD phải có ít nhất 12 ký tự và khác mật khẩu mặc định. Không tạo fixture; bắt đầu với dữ liệu trống. Dòng cảnh báo mật khẩu demo ở frontend vẫn hiển thị theo yêu cầu.
- DATA_FILE: đường dẫn file JSON riêng. Mặc định server/data/responses.json được gitignore. Phải gắn ổ đĩa bền vững khi deploy; chỉ chạy một tiến trình ghi. Backend ghi qua file tạm rồi rename với quyền 0600. Không phù hợp nhiều replica hoặc số lượng phản hồi lớn.
- ALLOWED_ORIGIN: origin frontend cho CORS. Khi trống chỉ cùng origin được chấp nhận từ trình duyệt.
- SERVE_STATIC, STATIC_PREFIX: phục vụ frontend cho phát triển/thử nghiệm cục bộ.

server/.env.example là tài liệu cấu hình demo công khai, không phải bí mật và không được tự động nạp. Cấu hình biến môi trường bằng dashboard của host hoặc cơ chế bí mật của host. Đổi mật khẩu cần khởi động lại backend; các phiên cũ bị mất khi khởi động lại.

## API

- POST /api/login: JSON `{"password":"..."}`. Đúng trả token ngẫu nhiên và expiresAt; sai trả 401. Giới hạn toàn cục 5 lần sai/phút để không cần lưu IP. Có thể ảnh hưởng đồng thời nhiều quản trị viên khi demo bị thử sai nhiều lần.
- GET /api/results: Bearer token bắt buộc. Trả `{surveyA:[], sessionsB:[], demo:true|false}`. Không có endpoint công khai cho phép đọc kết quả.
- POST /api/logout: thu hồi token hiện tại.
- POST /api/submit: nhận payload hiện có `{surveyA:{...}, sessionsB:[...]}`. Không cần quyền admin để người tham gia nộp; giới hạn toàn cục 30 yêu cầu/phút. Kiểm tra schema ở backend, tính lại delta, bỏ khóa lạ, từ chối A khác nhau cùng PID và tối đa 4 phiên/PID. Payload trùng hoàn toàn được bỏ qua. Không xác minh được một người thực sự nghe nhạc hay thực sự đồng ý chỉ từ JSON gửi lên.

Mật khẩu được kiểm tra trên backend qua scrypt và so sánh thời gian cố định. Token chỉ giữ trong bộ nhớ trang, hết hạn tuyệt đối sau 30 phút; không localStorage/sessionStorage/cookies. Token phía server lưu dạng SHA-256 trong bộ nhớ. Kết quả và phản hồi API có Cache-Control: no-store. Không log mật khẩu, token, IP hay body phản hồi. Reverse proxy/host có thể có nhật ký riêng.

## Dữ liệu, biểu đồ, CSV

Dashboard đọc bảng hiện tại từ backend, không có dữ liệu kết quả được nhúng trong frontend. Backend fixture chỉ tồn tại trong server/demo-data.mjs. is_simulated là 1 hoặc 0 bắt buộc. Bộ lọc mặc định chỉ giả lập ở demo; ngoài demo chỉ dòng không đánh dấu giả lập. Bảng và CSV luôn giữ cột này.

Heatmap đếm phiếu A theo nhóm tuổi 18–24, 25–34, 35–44, 45+. Δ và trước/sau tính trên cùng các phiên có đủ điểm 0–10. Thiếu BPM không được biến thành BPM=0; scatter chỉ nhận BPM 20–300. Điểm trùng nhau có thể chồng lên nhau; không jitter dữ liệu. Trung bình là theo phiên, không phải hiệu quả điều trị hoặc trung bình độc lập theo người.

CSV xuất riêng A/B theo bộ lọc hiện tại, UTF-8 BOM, quoting theo CSV, chống thực thi công thức từ chuỗi có = + - @ ở đầu. Các giá trị số âm vẫn là số. CSV chứa câu trả lời cần được giữ riêng tư.

Dữ liệu giả lập và tự báo cáo chỉ mang tính thăm dò. Không diễn giải khác biệt giữa điều kiện là quan hệ nhân quả.

## Kiểm tra

```sh
node tests/core.test.cjs
node tests/admin.test.cjs
node tests/backend.test.mjs
```

Backend tests dùng thư mục tạm và dữ liệu tổng hợp, không ghi dữ liệu vào repo. Kiểm tra đăng nhập sai/đúng, cấm đọc không token, hết hạn/đăng xuất, CORS, không phục vụ tệp backend, chặn dữ liệu thật trong demo, ghi bền vững, chống trùng và kiểm tra delta.
