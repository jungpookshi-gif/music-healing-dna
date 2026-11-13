# Music Healing DNA — A → B

Website tĩnh HTML/CSS/JavaScript, không cần build. Chọn Tiếng Việt, 한국어, English hoặc 简体中文; hoàn thành A → nghỉ 3 phút → B 10 phút → Gửi một lần. Trang quản trị mới ở `admin/index.html`, dùng backend xác thực riêng.

## Nguồn và phạm vi

Nội dung và giá trị lưu dựa trên `Bang-cau-hoi-va-dap-an.docx` trong ZIP người dùng cung cấp; HTML mẫu dùng để tham khảo giao diện và âm thanh thử. Tên người tham gia là bắt buộc. Không có ô nhập mã; mã liên kết nội bộ được tạo tự động để tương thích backend. Không xác minh danh tính người tham gia. Bản dịch Anh/Trung bổ sung cần người nghiên cứu rà soát ngôn ngữ trước khi thu thập chính thức.

Mỗi lần mở biểu mẫu hoàn thành một A và một phiên B. `b/index.html` cũng mở luồng kết hợp từ A, không phải biểu mẫu B riêng. Tài liệu gốc đề cập A một lần và tối đa bốn phiên B; frontend tĩnh không quản lý người tham gia xuyên nhiều lần truy cập. Backend tùy chọn có giới hạn tối đa bốn phiên trên cùng mã, nhưng mã nội bộ không xác minh một người duy nhất. `session_order` để trống cho nhóm nghiên cứu điền. Không dùng các tài liệu SURVEY cũ của repo làm schema cho phiên bản này.

## Tệp

- `index.html`: chọn ngôn ngữ.
- `a/index.html`, `b/index.html`: vỏ trang cho luồng kết hợp.
- `assets/style.css`: giao diện thích ứng màn hình nhỏ.
- `assets/schema.js`: câu hỏi và giá trị lưu.
- `assets/i18n.js`: bản dịch giao diện.
- `assets/core.js`: kiểm tra và chuẩn hóa dữ liệu.
- `assets/app.js`: điều phối luồng, đồng hồ, submit và xác nhận lưu kết quả.
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

Kết quả gửi qua Google Apps Script đã cấu hình. Tên bắt buộc ở A và góp ý ở bước cuối được gửi cùng phiên B. Sau khi lưu, chỉ hiển thị xác nhận và lời cảm ơn; không hiển thị mã kết quả hoặc nút sao chép. Nếu gửi lỗi, giữ trang mở và dùng nút thử gửi lại cùng payload; backend Apps Script khử trùng những hàng giống hệt nhau. Không cấu hình backend thì không báo đã lưu.
Payload: `{ "surveyA": { ... }, "sessionsB": [{ ... }] }`. Các khóa A/B theo Word, giá trị không trả lời giữ `""`, không biến thành 0. `delta = before - after`. Silence để trống `genre`, `bpm`, `like`, `track`, `track_url`.

Nếu cấu hình endpoint HTTPS, máy chủ phải cho phép CORS và nhận JSON POST; trả HTTP 2xx với JSON `{"ok":true}` để báo thành công. Không gửi cookies hay referrer. Giới hạn chờ 15 giây. Khi lỗi vẫn giữ payload trong bộ nhớ; máy chủ có thể đã nhận trước khi lỗi mạng nên không tự động gửi lại. Backend phải tự xác thực dữ liệu và xử lý trùng lặp; backend tùy chọn có trong `server/`; xem `server/README.md`. Chưa kiểm thử gửi thật vì endpoint cố ý để trống.

## Dữ liệu và quyền riêng tư

Có trường tên bắt buộc, không có trường email; không thu thập IP bằng mã ứng dụng, không analytics/cookies/localStorage. Câu trả lời chỉ giữ trong bộ nhớ đến khi đóng/tải lại trang; không có khôi phục bản nháp. Không nhập thông tin nhận dạng vào note hoặc tên/link bài hát. Loại bỏ một số tham số theo dõi phổ biến khỏi URL, nhưng việc này không bảo đảm URL hoàn toàn vô danh. Nhà cung cấp hosting và máy chủ nhận có thể ghi nhật ký kết nối riêng; không hứa ẩn danh tuyệt đối. Không lưu dữ liệu thật, khóa API hay mật khẩu vận hành vào repo. Mật khẩu mẫu công khai chỉ dùng với demo giả lập ở backend.

## Kiểm tra

Chạy `node tests/core.test.cjs`. Bộ kiểm tra bao gồm mã Mxxxx, tuổi tối thiểu, các thang điểm, đồng ý tham gia, rỗng khác 0, URL, delta, silence và cờ mô phỏng. Cần kiểm tra thiết bị/âm thanh thực tế sau khi cung cấp nhạc nghiên cứu. Không tự động merge hoặc triển khai từ nhánh tính năng.

## Quản trị mới

Mở `/admin/` để đăng nhập và xem số phiếu A, số phiên B, hai bảng, bốn biểu đồ SVG thuần, CSV và làm mới. Xác thực tại backend, không có mật khẩu trong trang hoặc JavaScript frontend. Mặc định `adminApi` để trống cho tới khi có host HTTPS riêng. Xem [hướng dẫn backend](server/README.md) cho demo cục bộ, cấu hình triển khai và giới hạn. Dữ liệu demo là 48 phiếu A và 96 phiên B giả lập hoàn toàn; không đưa dữ liệu này vào phân tích thật.

## Google Apps Script + Sheet

Backend thay thế đã có trong `apps-script/Code.gs` và `apps-script/Schema.gs`. Đọc [hướng dẫn cho người mới và checklist](apps-script/README.md), đặt Script Properties và triển khai Web app /exec; sau đó chỉ điền `appsScriptUrl` trong config.js. Admin và khảo sát tự dùng transport này. Có trang `admin/connection-test.html` để kiểm tra GET/POST từ github.io và proxy tùy chọn nếu CORS bị chặn. Chưa có deployment Google thực hoặc kiểm thử CORS thực trong PR này.

## Mở rộng thư viện nhạc
Mỗi nhóm giữ 2 bài ban đầu và thêm 5 bài; tổng 14 bản thu. Relax thêm Morning, Fresh Air, Water Lily, Dream Culture, Gymnopedie No. 1; energy thêm Cipher, Motivator, Nonstop, Nowhere Land, Feelin Good. Chi tiết tiêu chí, tác giả/nhạc sĩ và nguồn ở music-credits.html. Nút mở nhạc trong tab mới đã bỏ khỏi phiên; URL nguồn vẫn được lưu vào kết quả.

## Tên và góp ý (2026-11-14)
Tên bắt buộc (80 ký tự) ở A, góp ý không bắt buộc (300 ký tự) ở bước cuối trước khi gửi A+B. Bỏ hiển thị mã MHD1 và nút sao chép. Lưu tên/góp ý/cờ phiên trong trường sessionsB.note dưới định dạng có độ dài MHD2|n|f|..., tối đa 500 ký tự và tương thích backend Google Apps Script hiện hành; không đổi header Sheet. Admin và CSV B tách thêm participant_name, feedback, session_notes. Tên chỉ được gửi/lưu khi hoàn tất A+B. Không công khai phản hồi hoặc đưa vào repo. Thử gửi lại chỉ dùng cùng payload giữ trong RAM; backend khử trùng A/B giống hệt. Google Docs là bản chụp riêng của dữ liệu hiện có, không tự đồng bộ; Google Sheets vẫn là nguồn nhận phản hồi mới.

## Bắt buộc tên, bỏ nhập mã (2026-11-14)
Frontend không hiển thị câu hỏi nhập M + 4 chữ số và không yêu cầu nhớ mã. Tên bắt buộc, trim khoảng trắng, 1–80 ký tự ở cả bốn ngôn ngữ. Giữ pid nội bộ để tương thích Apps Script hiện hành; sinh bằng Web Crypto, giữ ổn định trong một lượt khảo sát. Khi gửi A, nếu backend báo PID_CONFLICT hoặc duplicate của một lượt chưa được xác nhận, chọn mã khác và cập nhật A+B cùng nhau trước khi gửi B (tối đa 10 lần). Nếu A đã được xác nhận trong lượt hiện tại, thử gửi lại giữ nguyên liên kết. Không dùng tên làm khóa duy nhất. Chưa có backend reservation/transaction: phản hồi mạng thất lạc sau khi A được ghi có thể để lại A chưa có B; không ghép vào hồ sơ cũ chỉ vì A trùng hoàn toàn. Chế độ tự chọn giữ nguyên: tên/link dùng ghi nhận, người tham gia phát nhạc ở ứng dụng hoặc tab khác.

## Quốc gia bổ sung (2026-11-14)
Thêm Mongolia (mn), Myanmar (mm), Nepal (np), đủ VI/KO/EN/ZH. Frontend giữ giá trị quốc gia cụ thể. Apps Script đang triển khai chỉ chấp nhận vn/kr/other/na: transport gửi culture=other cho ba quốc gia mới và lưu culture:mn/mm/np trong phần metadata của sessionsB.note. Không thay đổi header hoặc làm mất thông tin quốc gia. Admin phục hồi culture từ metadata cho bảng A và CSV A; ở Sheet gốc cần xem metadata trong note của B để phân biệt ba quốc gia, không dùng riêng cột culture của A để phân tích. Metadata chỉ được phục hồi khi A là other và cờ có đúng ba mã được cho phép. Bản ghi cũ không bị sửa. Trước khi gửi B, A giữ nguyên cơ chế khử trùng/đổi mã tự động.

## Thang điểm dạng thanh kéo (2026-11-14)
Năm thang điểm genre_like, stress_week, before, after, like dùng range 0–10, step=1, giá trị lớn và đầu mút theo câu hỏi, hỗ trợ nhập số trực tiếp. Range hiển thị vị trí giữa ban đầu nhưng hidden answer rỗng, display là —; input/change/click hoặc Enter/Space mới xác nhận điểm. Form A lấy giá trị từ hidden answers để không tự lưu điểm mặc định; 0 khác chưa trả lời. Giá trị âm, >10 và thập phân không được chấp nhận. Dữ liệu vẫn là số nguyên theo schema hiện tại. Ghi scale_ui:slider_v1 trong metadata note của B để nhận diện thay đổi giao diện khi phân tích. Nền Aurora giữ chung cho các điều kiện.

## Vinyl A + Colour Flow B (2026-11-14)
A hiển thị 10 track: track đầu là tên/đồng ý, tiếp theo là A02–A10. Đĩa CSS xoay 36 giây/vòng, kim đi từ rãnh ngoài vào trong theo track. Chọn radio bằng click thì tự sang track sau 450 ms; nhập số/tên và thang điểm xác nhận bằng Tiếp tục; có Track trước, giữ đáp án, kiểm tra từng track và kiểm tra toàn bộ trước B. Hỗ trợ giảm chuyển động bằng checkbox và prefers-reduced-motion; hệ thống yêu cầu reduced motion thì ưu tiên thiết lập đó. B giữ phiên thật 600 giây, màu loang CSS chậm với cùng thời lượng chuyển động giữa bốn điều kiện; self tím/teal, relax mint/xanh, energy peach/cam, silence xám. Không triển khai hướng dẫn thở. Hiệu ứng chỉ chạy khi phiên bắt đầu thành công, kết thúc/dừng/lỗi/đổi màn hình thì dừng. Sau khi server xác nhận A+B, hiển thị bìa đĩa với tên, ngày phiên và mã P (từ pid đã xác nhận, tối thiểu 3 chữ số; không phải số thứ tự). Chế độ test có nhãn DEMO. Lưu vf1:condition:on/off/mix trong note cùng scale_ui để nhận diện điều kiện thị giác và việc đổi trạng thái chuyển động. Tổng note tối đa với tên 80, góp ý 300 và mọi cờ hiện tại: 498/500 ký tự. Màu/hiệu ứng là yếu tố mới ngoài âm nhạc; khi phân tích cần tách phiên bản trước/sau, không quy toàn bộ khác biệt cho âm nhạc. Preview QA dùng mock submit chỉ trong thư mục preview ngoài repo; không phát hành fixture và không gửi phản hồi thử vào dữ liệu thật.

## Chuyển bốn ngôn ngữ trong khảo sát (2026-11-14)
Header của a/ và b/ luôn có Tiếng Việt, 한국어, English, 中文. Chuyển ngôn ngữ tại chỗ qua DOM text/ARIA đã kiểm soát; không reload, không dựng lại form, không thay value/checked/URL bài nhạc, không dừng audio hoặc reset timer. Các vùng tên/người tham gia/mã/ngày/bài nhạc được bảo vệ, thông tin động được render lại từ state. URL chỉ cập nhật tham số lang qua history.replaceState, giữ condition/test/hash. Có nhãn ngôn ngữ hiện tại, aria-pressed và lang cho từng nút. Kiểm tra chuỗi có dấu ngoặc, dấu câu, ngôn ngữ đa byte và dữ liệu người tham gia trùng từ trong UI.
