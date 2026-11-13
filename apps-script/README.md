# Google Apps Script + Google Sheet — hướng dẫn cho người mới

Backend này thay thế backend Node nếu bạn muốn lưu khảo sát trong một Google Sheet riêng. Nó nhận đúng hai tab `surveyA` và `sessionsB`. Website trên GitHub Pages vẫn là HTML/CSS/JavaScript, không cần build.

**Trạng thái kiểm chứng:** mã đã được kiểm tra cục bộ bằng mô phỏng các dịch vụ Google. Chưa có Web app `/exec` thật hoặc Sheet đích trong yêu cầu này; chưa xác nhận đăng nhập, ghi Sheet hoặc CORS từ website github.io thực tế. Không coi kiểm tra mô phỏng hoặc curl thành bằng chứng CORS của trình duyệt.

## 1. Tạo Sheet riêng

1. Đăng nhập Google bằng tài khoản bạn sẽ dùng để quản lý nghiên cứu.
2. Tạo một Google Sheet mới, đặt tên dễ nhớ, ví dụ **Music Healing DNA — DEMO**.
3. Giữ quyền chia sẻ Sheet là **Restricted / Bị hạn chế**. Không Publish to web, không mở quyền đọc công khai bảng phản hồi. Quyền truy cập Web app và quyền chia sẻ Sheet là hai việc khác nhau.
4. Trong URL `https://docs.google.com/spreadsheets/d/ID_CUA_SHEET/edit`, sao chép phần `ID_CUA_SHEET`. Đây là ID, không phải URL đầy đủ hoặc gid của tab.
5. Không cần nhập tiêu đề cột bằng tay; hàm setup ở bước dưới sẽ tạo hai tab đúng tên. Nếu Sheet có dữ liệu cũ, tạo một Sheet demo khác để tránh xung đột schema.

## 2. Mở Apps Script và thêm mã

1. Tại Google Sheet, chọn **Extensions / Tiện ích mở rộng → Apps Script**.
2. Trong editor, thay nội dung `Code.gs` bằng file `apps-script/Code.gs` của repo.
3. Bấm dấu **+ → Script**, tạo file **Schema** (editor hiển thị `Schema.gs`), dán nội dung `apps-script/Schema.gs`.
4. Bấm **Save**. Hai file phải ở cùng dự án. Không dán chúng vào HTML hay JavaScript của GitHub Pages.
5. Mã cần runtime **V8**. Nếu muốn dùng manifest có sẵn: trong Project Settings bật hiển thị `appsscript.json`, rồi chép nội dung `apps-script/appsscript.json`. Manifest chỉ yêu cầu quyền Sheets, không quyền email/Drive toàn bộ.

## 3. Đặt Script Properties — không đặt mật khẩu trong code

1. Bấm biểu tượng bánh răng **Project Settings** ở bên trái.
2. Tìm **Script Properties → Add script property / Edit script properties**.
3. Thêm ba thuộc tính:

| Property | Value | Ý nghĩa |
|---|---|---|
| `SPREADSHEET_ID` | ID của Sheet vừa tạo | Nơi ghi và đọc hai bảng |
| `ADMIN_PASSWORD` | Tự nhập mật khẩu tại đây | Dùng `1234` chỉ khi thử với dữ liệu giả |
| `DEMO_MODE` | `true` | Chặn mọi dòng có `is_simulated` khác số 1 |

4. Bấm **Save script properties**. Giá trị ADMIN_PASSWORD không xuất hiện trong mã frontend hoặc repo.
5. Sau này đổi mật khẩu bằng cách sửa ADMIN_PASSWORD tại đây. Không cần sửa code. Token cũ sẽ không còn hợp lệ ở lần đọc tiếp theo vì token gắn với dấu vân tay mật khẩu.
6. Chỉ khi chuẩn bị thu thập thật mới đổi `DEMO_MODE` thành `false`, dùng mật khẩu riêng tối thiểu 12 ký tự và rà soát quyền truy cập. Dữ liệu demo đang có trong Sheet không tự bị xóa khi đổi chế độ; dùng bộ lọc hoặc Sheet riêng để tránh gộp nhầm.

**Script Properties không phải kho bí mật dành cho người cùng sửa dự án:** người có quyền chỉnh sửa script có thể truy cập thuộc tính. Chỉ cấp quyền editor cho người quản trị tin cậy.

## 4. Khởi tạo hai tab

1. Quay lại **Editor**.
2. Trong danh sách hàm ở trên, chọn **setupSheets**, bấm **Run**.
3. Google có thể yêu cầu cấp quyền. Kiểm tra đúng dự án do bạn tạo và quyền Sheets rồi hoàn thành cấp quyền bằng tài khoản sở hữu. Nếu có cảnh báo hoặc chính sách tổ chức chặn, dừng và nhờ quản trị tài khoản kiểm tra; không bỏ qua cảnh báo một cách máy móc.
4. Quay lại Sheet. Bạn phải thấy `surveyA` và `sessionsB`, hàng đầu có tiêu đề cột.
5. Chạy lại setup không xóa dữ liệu. Nếu tiêu đề có sẵn khác schema, hàm báo lỗi thay vì ghi đè.

Không bấm Run cho `doPost` để thử gửi biểu mẫu: hàm này cần đối tượng sự kiện HTTP. Run trực tiếp không có JSON sẽ báo lỗi có kiểm soát.

## 5. Triển khai Web app

1. Trong Apps Script, chọn **Deploy → New deployment**.
2. Bấm bánh răng chọn loại **Web app**.
3. Đặt mô tả, ví dụ **Music Healing DNA demo v1**.
4. **Execute as / Thực thi dưới tên:** chọn **Me / Tôi**, là tài khoản có quyền chỉnh sửa Sheet.
5. **Who has access / Ai có quyền truy cập:** để người tham gia không cần đăng nhập Google, chọn lựa chọn cho phép **Anyone / Bất kỳ ai**, bao gồm người chưa đăng nhập. Không chọn “Anyone with a Google account” nếu muốn tham gia không cần tài khoản. Tên lựa chọn có thể thay đổi theo ngôn ngữ/tài khoản.
6. Bấm **Deploy**, hoàn thành cấp quyền nếu được yêu cầu.
7. Sao chép **Web app URL kết thúc bằng `/exec`**. Không dùng `/dev`, URL của editor hoặc URL một lần tại googleusercontent.

Nếu tài khoản trường/công ty không có lựa chọn cho truy cập ẩn danh, **chưa chắc tài khoản đó cho phép triển khai theo cách này**. Chính sách Workspace có thể giới hạn; cần hỏi quản trị hoặc chọn host khác được tổ chức cho phép. Không công khai Sheet để “sửa” lỗi quyền Web app.

Khi sửa code sau này: **Deploy → Manage deployments → Edit → New version → Deploy**. Sửa code và Save chưa đủ để chắc chắn URL `/exec` đang chạy phiên bản mới. Sửa Script Properties không cần ghi mật khẩu vào phiên bản mã mới.

## 6. Dán /exec vào config.js

Trong file `config.js` của repo, đặt **duy nhất trường `appsScriptUrl`** thành Web app URL vừa sao chép. Để `endpoint` và `adminApi` trống nếu chỉ dùng Apps Script. Không điền mật khẩu vào bất kỳ trường config nào.

Khi appsScriptUrl có giá trị, frontend tự chọn Apps Script cho cả khảo sát và admin; nó ưu tiên hơn endpoint/adminApi của backend Node. Khi để trống appsScriptUrl, cơ chế Node/manual trước đây vẫn hoạt động.

Giữ quy trình nhánh → pull request → review của repo. Sau khi thay đổi config được merge và phiên bản Pages mới đã triển khai, mới kiểm tra link công khai. PR này không tự merge hoặc deploy.

## 7. Giao thức ghi dữ liệu

Mỗi `doPost` nhận JSON có dạng:

```json
{"sheet":"surveyA","columns":["pid","age","gender","culture","status","listen_min","stress_genre","purpose","genre_like","stress_week","is_simulated"],"row":["M9000",25,"na","vn","","","pop","",7,6,1]}
```

- Tab phải chính xác là `surveyA` hoặc `sessionsB`.
- columns phải trùng tên, thứ tự và số lượng cột được duyệt. row phải có đúng số ô. Không cho ghi tùy ý vào tab/cột khác.
- Mọi chuỗi bắt đầu bằng `=`, `+`, `-`, `@`, kể cả sau khoảng trắng/ký tự điều khiển phổ biến, đều bị từ chối bằng `FORMULA_BLOCKED`.
- **Số âm kiểu number được phép**, vì Δ stress âm là dữ liệu hợp lệ. Ví dụ JSON `-2` được nhận, chuỗi `"-2"` bị chặn. Không biến số âm thành chuỗi để gửi. Quy tắc này chống công thức ở ô text, đồng thời giữ nguyên giá trị số.
- B tính lại `delta = before - after`; không tin giá trị delta tự gửi lên. Các ô không áp dụng ở silence được giữ trống.
- ScriptLock bảo vệ phần kiểm tra + ghi giữa các execution của script; không phải giao dịch cơ sở dữ liệu và không khóa thao tác sửa Sheet thủ công.
- Một yêu cầu hợp lệ mới ghi một dòng. Dòng trùng hoàn toàn được xác nhận duplicate và không thêm lần nữa. A khác nhau cùng PID bị từ chối; B cần A trước và tối đa 4 phiên trên một PID.
- Một lần bấm Gửi trên giao diện vẫn tạo hai POST tuần tự: A trước, B sau. **Không có giao dịch nguyên tử giữa hai POST**. A có thể đã ghi mà B chưa ghi. Khi mất phản hồi, trình duyệt không tự gửi lại, luôn giữ mã kết quả và nêu trạng thái chưa xác nhận đầy đủ.
- Với doPost lỗi được trả dưới dạng JSON `{ok:false,error:{code,message}}`. ContentService không cung cấp API đặt HTTP status tùy ý trong mã này; không chỉ nhìn HTTP 200 để kết luận thành công. Frontend kiểm tra `ok` và tab được xác nhận.

Giá trị text hợp lệ bắt đầu bằng dấu + hoặc - (ví dụ tên bài hát) cũng bị chặn theo quy tắc bảo thủ. Người tham gia cần nhập lại mô tả không bắt đầu bằng các ký tự đó; mã kết quả thủ công vẫn được giữ khi backend từ chối.

## 8. Đọc dữ liệu quản trị

Admin gửi POST JSON `{ "action": "read", "password": "..." }` trong body HTTPS. Không gửi mật khẩu bằng GET/query string. Backend so sánh với ADMIN_PASSWORD trong Script Properties; đúng trả toàn bộ hai bảng và token tạm, sai chỉ trả lỗi, không trả câu trả lời.

Làm mới dùng token trong body POST để không lưu lại mật khẩu. Token chỉ ở bộ nhớ trang, không localStorage/sessionStorage; hết hạn tối đa 30 phút. CacheService có thể xóa token sớm nên có thể cần đăng nhập lại trước 30 phút. Đăng xuất xóa token phía backend; đổi mật khẩu vô hiệu hóa các token cũ ở lần kiểm tra tiếp theo.

Sau **5 lần sai trong cửa sổ 15 phút**, các lần kiểm tra mật khẩu tiếp theo bị chặn tới hết cửa sổ. Đây là giới hạn toàn cục của dự án, không theo IP/người dùng: người khác thử sai có thể tạm chặn cả quản trị viên. Counter dùng Script Properties + lock, không dựa vào cache dễ mất. Nếu cần gỡ khóa cho demo, chủ dự án có thể xóa property `ADMIN_FAILURES`; không xóa các property cấu hình. Không coi giới hạn nhỏ này là hệ thống chống tấn công cho dữ liệu nhạy cảm.

## 9. CORS: điều đã biết và điều chưa kiểm chứng

Frontend gửi body JSON với **Content-Type: text/plain;charset=UTF-8**, không Authorization header, credentials=omit và redirect=follow. Cách này tránh preflight do application/json hoặc custom Authorization trong yêu cầu thông thường. Backend vẫn JSON.parse nội dung `e.postData.contents`.

**Tránh preflight không đồng nghĩa được phép đọc phản hồi.** Trình duyệt vẫn cần các CORS header phù hợp trên đường trả về. ContentService chuyển phản hồi sang URL một lần ở `script.googleusercontent.com`; TextOutput không có phương thức tùy ý setHeader/setStatusCode. Không thêm `setHeader('Access-Control-Allow-Origin', '*')` hoặc một doOptions không được tài liệu Web app bảo đảm để giả vờ đã giải quyết.

**Chưa xác nhận được CORS cho deployment này**, vì chưa có `/exec` thực và bản frontend mới trên github.io. Không khẳng định Google luôn trả header cần thiết ở mọi tài khoản, quyền triển khai, redirect hoặc trình duyệt.

Cách kiểm tra sau khi deploy:

1. Mở `admin/connection-test.html` dưới chính tên miền `https://<tai-khoan>.github.io/<repo>/`.
2. Kiểm tra trang ghi đúng origin github.io; bấm **Kiểm tra kết nối**.
3. GET và POST phải hiện **ĐỌC ĐƯỢC JSON, ok=true**. Phép thử không ghi Sheet và không gửi mật khẩu.
4. Nếu lỗi, mở DevTools → Network/Console. Kiểm tra lỗi CORS, redirect sang đăng nhập Google, URL sai hoặc HTML thay vì JSON. Thông báo Failed to fetch một mình không chứng minh nguyên nhân là CORS.
5. Tiếp tục thử gửi một phiếu giả và đăng nhập; health thành công chưa chứng minh schema/Sheet/password đã cấu hình đúng.

**Không đổi sang mode:no-cors để đọc dữ liệu admin.** Phản hồi khi đó là opaque: JS không đọc được body hoặc xác nhận lưu. Không dùng JSONP hoặc mật khẩu/token trong URL cho dữ liệu khảo sát. curl/Postman đọc được không chứng minh trình duyệt github.io đọc được.

### Nếu CORS thật sự bị chặn

Phương án kèm mã: triển khai `apps-script/proxy/worker.mjs` thành Cloudflare Worker riêng (hoặc dùng reverse proxy tương đương của bạn).

- Đặt environment `GAS_EXEC_URL` bằng URL `/exec` cố định, `ALLOWED_ORIGIN` bằng chính xác `https://<tai-khoan>.github.io` (không tên repo, không / cuối).
- Thay appsScriptUrl trong config.js bằng HTTPS URL của Worker.
- Worker chỉ chuyển tới GAS_EXEC_URL đã cấu hình, theo redirect ở phía server, và trả CORS header cho đúng origin đã chọn. Nó không phải proxy nhận upstream tùy ý từ URL của người gọi.
- Google Sheet và mật khẩu vẫn được quản lý ở Apps Script. Mật khẩu đi qua Worker nên chủ Worker và nền tảng host phải được tin cậy. Không dùng proxy CORS công khai của người lạ.
- Proxy cần tài khoản/triển khai/bảo trì riêng, chịu giới hạn host và không sửa được quyền truy cập hoặc quota Apps Script. Không có Worker công khai nào đã được triển khai trong PR này.
- Origin là kiểm soát trình duyệt, không phải xác thực cho endpoint ghi công khai. Không hứa nó chặn được mọi request do script hoặc curl tạo ra.

Phương án khác: chuyển trang admin sang Apps Script HtmlService, dùng `google.script.run` thay fetch xuyên origin. Phương án này cần đóng gói lại HTML/CSS/JS cho HtmlService, admin không còn nằm hoàn toàn trên github.io; chưa triển khai trong bộ mã hiện tại. Hoặc dùng backend Node sẵn có làm nền tảng cho một proxy server-side được quản lý riêng.

## 10. Checklist nghiệm thu

- [ ] Script Properties có SPREADSHEET_ID, ADMIN_PASSWORD, DEMO_MODE=true; mật khẩu không nằm trong repo/config/frontend.
- [ ] setupSheets tạo đúng hai tab và header; Sheet vẫn Restricted.
- [ ] Web app chạy dưới tài khoản có quyền Sheet, cho phép truy cập theo nhóm người dùng dự kiến; URL là /exec.
- [ ] Dán URL vào appsScriptUrl; cập nhật phiên bản frontend qua PR/Pages theo quy trình của repo.
- [ ] Từ github.io, trang connection-test đọc được JSON của cả GET và POST.
- [ ] Mở khảo sát với `?lang=vi&test=1&condition=silence`; nhập PID thử chưa dùng, ví dụ M9000; hoàn thành A và B. Chế độ thử rút nghỉ còn 3 giây và phiên còn 10 giây.
- [ ] Bấm Gửi một lần: surveyA thêm đúng một dòng, sessionsB thêm đúng một dòng, PID khớp và is_simulated=1. Không có dòng dữ liệu thật.
- [ ] Kiểm tra ô không trả lời vẫn trống, không bị chuyển thành 0; delta bằng before − after. Kiểm tra cả trường hợp delta âm kiểu number.
- [ ] Kiểm tra chuỗi giả lập bắt đầu bằng = + - @ bị FORMULA_BLOCKED, Sheet không thêm dòng. Có thể dùng fixture apps-script/demo-payloads.json và công cụ HTTP riêng trên Sheet demo; kiểm tra này không chứng minh CORS.
- [ ] Đăng nhập admin với mật khẩu sai: chỉ hiện lỗi, không nhận bảng dữ liệu.
- [ ] Đăng nhập với mật khẩu đúng: số A/B khớp Sheet, cờ GIẢ LẬP hiện rõ, bốn biểu đồ dùng đúng bộ lọc.
- [ ] Với tập dữ liệu chỉ có silence, scatter báo không có BPM là đúng. Để kiểm tra đủ scatter, gửi thêm phiên thử relax/energy (hợp lệ khi có BPM thử).
- [ ] Bấm Làm mới sau khi thêm một phiếu giả: số đếm cập nhật. Xuất CSV A/B, đối chiếu số dòng với bộ lọc, giữ is_simulated.
- [ ] Đăng xuất hoặc tải lại trang: cần đăng nhập lại. Sau năm lần sai: bị giới hạn; chờ hết cửa sổ hoặc chủ dự án xóa ADMIN_FAILURES cho demo.
- [ ] Khi giả lập mất phản hồi sau ghi A: giao diện giữ mã kết quả và thông báo chưa xác nhận đủ A+B; kiểm tra Sheet trước khi xử lý tiếp.
- [ ] Chỉ sau khi các mục trên đạt mới cân nhắc dữ liệu thật, thay mật khẩu mạnh và rà soát quyền truy cập.

## 11. Giới hạn và nguồn chính thức

Đây là backend khảo sát nhỏ, không phải cơ sở dữ liệu giao dịch. Mã đọc/kiểm tra các dòng hiện có để phát hiện trùng; dữ liệu lớn có thể chậm hoặc hết thời gian chạy. Giới hạn 10.000 A / 40.000 B trong mã là **giới hạn của ứng dụng**, không phải cam kết quota Google. Chưa đo sức tải thực tế. Quota Apps Script phụ thuộc tài khoản và có thể thay đổi; vượt quota có thể ngừng execution. Kiểm tra bảng quota chính thức trước khi thu thập rộng.

Không dùng URL/URLSearchParams trong Schema.gs: các Web API này không có trong runtime V8 Apps Script. Hàm URL phía server dùng kiểm tra bảo thủ cho URL ASCII HTTP(S) đã được frontend chuẩn hóa, không hỗ trợ mọi URL hợp lệ (ví dụ literal IPv6). Bản schema này được giữ tương thích trường/giá trị với assets/core.js bằng test.

Nguồn đã kiểm tra ngày 2026-11-13:

- [Web apps: doGet/doPost, deploy, execution identity](https://developers.google.com/apps-script/guides/web)
- [Properties Service: quản lý Script Properties](https://developers.google.com/apps-script/guides/properties)
- [Content Service: JSON và redirect](https://developers.google.com/apps-script/guides/content)
- [TextOutput: các phương thức được hỗ trợ](https://developers.google.com/apps-script/reference/content/text-output)
- [CacheService: cache có thể mất sớm](https://developers.google.com/apps-script/reference/cache/cache-service)
- [LockService](https://developers.google.com/apps-script/reference/lock/lock-service)
- [V8 runtime: API không có sẵn](https://developers.google.com/apps-script/guides/v8-runtime)
- [Quota chính thức](https://developers.google.com/apps-script/guides/services/quotas)
- [MDN CORS: simple request vẫn cần quyền đọc phản hồi](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN Fetch: no-cors trả opaque response](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

Test cục bộ:

```sh
node tests/apps-script.test.cjs
node tests/apps-script-client.test.cjs
node tests/apps-script-proxy.test.mjs
```

Các test này không gọi Google, không tạo Sheet và không chứng minh CORS của deployment thật.
