# Music Healing DNA — A → B

Website tĩnh HTML/CSS/JavaScript, không cần build. Chọn Tiếng Việt, 한국어, English hoặc 简体中文; hoàn thành A → nghỉ 3 phút → B 10 phút → Gửi một lần. Trang quản trị mới ở `admin/index.html`, dùng backend xác thực riêng.

## Nguồn và phạm vi

Nội dung và giá trị lưu dựa trên `Bang-cau-hoi-va-dap-an.docx` trong ZIP người dùng cung cấp; HTML mẫu dùng để tham khảo giao diện và âm thanh thử. Mã người tham gia được thay theo yêu cầu mới thành M + đúng 4 chữ số tự chọn (ví dụ M0123). Không tự động tạo mã. Backend tùy chọn phát hiện A khác nhau có cùng mã; không xác minh danh tính người tham gia. Bản dịch Anh/Trung bổ sung cần người nghiên cứu rà soát ngôn ngữ trước khi thu thập chính thức.

Mỗi lần mở biểu mẫu hoàn thành một A và một phiên B. `b/index.html` cũng mở luồng kết hợp từ A, không phải biểu mẫu B riêng. Tài liệu gốc đề cập A một lần và tối đa bốn phiên B; frontend tĩnh không quản lý người tham gia xuyên nhiều lần truy cập. Backend tùy chọn có giới hạn tối đa bốn phiên trên cùng mã, nhưng mã do người tham gia tự chọn không xác minh một người duy nhất. `session_order` để trống cho nhóm nghiên cứu điền. Không dùng các tài liệu SURVEY cũ của repo làm schema cho phiên bản này.

## Tệp

- `index.html`: chọn ngôn ngữ.
- `a/index.html`, `b/index.html`: vỏ trang cho luồng kết hợp.
- `assets/style.css`: giao diện thích ứng màn hình nhỏ.
- `assets/schema.js`: câu hỏi và giá trị lưu.
- `assets/i18n.js`: bản dịch giao diện.
- `assets/core.js`: kiểm tra và chuẩn hóa dữ liệu.
- `assets/app.js`: điều phối luồng, đồng hồ, submit và sao chép kết quả.
- `assets/audio.js`: âm thanh tổng hợp thử từ mẫu B.
- `config.js`: cấu hình công khai, không chứa bí mật.
- `tests/core.test.cjs`: kiểm tra với dữ liệu giả.
- `.nojekyll`: phục vụ tài nguyên tĩnh trên GitHub Pages.

## Chạy và chia sẻ

Đặt nội dung ở gốc repo GitHub Pages. Mọi đường dẫn ứng dụng là tương đối để chạy dưới `/<repo>/`. Không cần npm hay build. Có thể kiểm tra cục bộ bằng một HTTP server tĩnh.

Tham số `?lang=vi|ko|en|zh`, `&condition=self|relax|energy|silence`. Điều kiện được chỉ định bằng URL sẽ khóa lựa chọn. Không dùng mã người tham gia trong URL.

`?test=1` (hoặc `#thu`) rút nghỉ xuống 3 giây, phiên xuống 10 giây, luôn lưu `is_simulated=1` trong cả A và B. Không đưa liên kết thử vào thu thập thật. Bình thường `is_simulated=0`.

## Âm nhạc

Mỗi điều kiện relax/energy có bảy lựa chọn trong `config.js`, gồm 2 bài ban đầu và 5 bài thêm mới (Kevin MacLeod, CC BY 4.0). Nguồn và giấy phép ở `music-credits.html`, được liên kết tại bước chọn bài. Phát trực tiếp bản gốc từ máy chủ tác giả; không host MP3 trong repo, không chỉnh sửa hoặc chuẩn hóa loudness. Âm lượng trình phát là 50%, không bảo đảm loudness hoặc mức dB tương đương giữa bài/thiết bị. File đã tải để kiểm tra giải mã trước khi kết nối.

Chọn một bài trước khi bắt đầu, khóa lựa chọn trong phiên, lặp bản gốc đến hết thời gian 10 phút. Ghi tên bài/nghệ sĩ, URL trang nguồn, BPM do tác giả công bố và genre vào sessionsB; BPM của Meditation Impromptu 01 để trống vì chưa công bố. Electronica dùng other trong schema hiện tại. Giữ tương thích cấu hình single-track cũ. Nguồn ngoài có thể gián đoạn hoặc thay đổi; lỗi phát chặn bắt đầu hoặc đánh dấu phiên gián đoạn. Cần pilot và kiểm tra thiết bị trước thu thập chính thức. Đây là lựa chọn kích thích theo đặc điểm âm nhạc, không phải xác nhận hiệu quả trị liệu từng bài. Lựa chọn bài của người tham gia có thể ảnh hưởng kết quả; phân tích theo track và like.
Self cho phép người tham gia tự phát nhạc bên ngoài, URL http/https tùy chọn; silence không phát nhạc. Trình duyệt yêu cầu bấm bắt đầu để phát âm thanh. Đồng hồ đo thời gian phiên, không chứng minh người tham gia thực sự nghe nhạc; mở ứng dụng khác có thể ảnh hưởng phát âm thanh. Dừng sớm và bỏ nghỉ được ghi vào note.

## Gửi và kết quả

`config.js` có `endpoint: ''` mặc định. Nút cuối gọi `submit()`. Khi chưa có endpoint, không gửi dữ liệu đến máy chủ; hiển thị chuỗi `MHD1:` + Base64 của JSON UTF-8 để sao chép. Đây **không phải mã hóa bảo mật**. Giữ kết quả riêng tư và gửi cho nhóm nghiên cứu qua kênh đã thống nhất.

Payload: `{ "surveyA": { ... }, "sessionsB": [{ ... }] }`. Các khóa A/B theo Word, giá trị không trả lời giữ `""`, không biến thành 0. `delta = before - after`. Silence để trống `genre`, `bpm`, `like`, `track`, `track_url`.

Nếu cấu hình endpoint HTTPS, máy chủ phải cho phép CORS và nhận JSON POST; trả HTTP 2xx với JSON `{"ok":true}` để báo thành công. Không gửi cookies hay referrer. Giới hạn chờ 15 giây. Khi lỗi vẫn giữ mã kết quả; máy chủ có thể đã nhận trước khi lỗi mạng nên không tự động gửi lại. Backend phải tự xác thực dữ liệu và xử lý trùng lặp; backend tùy chọn có trong `server/`; xem `server/README.md`. Chưa kiểm thử gửi thật vì endpoint cố ý để trống.

## Dữ liệu và quyền riêng tư

Không có trường tên/email, không thu thập IP bằng mã ứng dụng, không analytics/cookies/localStorage. Câu trả lời chỉ giữ trong bộ nhớ đến khi đóng/tải lại trang; không có khôi phục bản nháp. Không nhập thông tin nhận dạng vào note hoặc tên/link bài hát. Loại bỏ một số tham số theo dõi phổ biến khỏi URL, nhưng việc này không bảo đảm URL hoàn toàn vô danh. Nhà cung cấp hosting và máy chủ nhận có thể ghi nhật ký kết nối riêng; không hứa ẩn danh tuyệt đối. Không lưu dữ liệu thật, khóa API hay mật khẩu vận hành vào repo. Mật khẩu mẫu công khai chỉ dùng với demo giả lập ở backend.

## Kiểm tra

Chạy `node tests/core.test.cjs`. Bộ kiểm tra bao gồm mã Mxxxx, tuổi tối thiểu, các thang điểm, đồng ý tham gia, rỗng khác 0, URL, delta, silence và cờ mô phỏng. Cần kiểm tra thiết bị/âm thanh thực tế sau khi cung cấp nhạc nghiên cứu. Không tự động merge hoặc triển khai từ nhánh tính năng.

## Quản trị mới

Mở `/admin/` để đăng nhập và xem số phiếu A, số phiên B, hai bảng, bốn biểu đồ SVG thuần, CSV và làm mới. Xác thực tại backend, không có mật khẩu trong trang hoặc JavaScript frontend. Mặc định `adminApi` để trống cho tới khi có host HTTPS riêng. Xem [hướng dẫn backend](server/README.md) cho demo cục bộ, cấu hình triển khai và giới hạn. Dữ liệu demo là 48 phiếu A và 96 phiên B giả lập hoàn toàn; không đưa dữ liệu này vào phân tích thật.

## Google Apps Script + Sheet

Backend thay thế đã có trong `apps-script/Code.gs` và `apps-script/Schema.gs`. Đọc [hướng dẫn cho người mới và checklist](apps-script/README.md), đặt Script Properties và triển khai Web app /exec; sau đó chỉ điền `appsScriptUrl` trong config.js. Admin và khảo sát tự dùng transport này. Có trang `admin/connection-test.html` để kiểm tra GET/POST từ github.io và proxy tùy chọn nếu CORS bị chặn. Chưa có deployment Google thực hoặc kiểm thử CORS thực trong PR này.

## Mở rộng thư viện nhạc
Mỗi nhóm giữ 2 bài ban đầu và thêm 5 bài; tổng 14 bản thu. Relax thêm Morning, Fresh Air, Water Lily, Dream Culture, Gymnopedie No. 1; energy thêm Cipher, Motivator, Nonstop, Nowhere Land, Feelin Good. Chi tiết tiêu chí, tác giả/nhạc sĩ và nguồn ở music-credits.html. Nút mở nhạc trong tab mới đã bỏ khỏi phiên; URL nguồn vẫn được lưu vào kết quả.
