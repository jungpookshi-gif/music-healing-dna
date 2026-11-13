# Music Healing DNA

Website khảo sát tiếng Việt về sở thích âm nhạc và cảm nhận thư giãn. GitHub Pages phục vụ giao diện; Google Forms nhận phản hồi, Google Sheets lưu bảng dữ liệu riêng tư.

## Tham gia

[Biểu mẫu khảo sát](https://docs.google.com/forms/d/e/1FAIpQLSdNKHgcgVoSoCQnRvD1rSZjsX_2_DdteVQyD9Lv_sFD2H9eYw/viewform)

12 câu hỏi dành cho người từ 18 tuổi. Không hỏi tên, email, số điện thoại hay thông tin bệnh lý. Câu hỏi đồng ý tham gia là bắt buộc. Thông tin nền và cảm nhận có thể bỏ qua hoặc chọn không trả lời. Người không đồng ý hoặc dưới 18 tuổi được hướng dẫn đóng biểu mẫu. Câu 12 chỉ dành cho người có nghe nhạc để thư giãn trong 7 ngày qua; không áp dụng thì bỏ qua.

## Quản lý

- Chỉnh giao diện trong `index.html`; liên kết người trả lời trong `config.js`.
- Google Forms → Responses → View in Sheets để quản lý dữ liệu.
- Bảng phản hồi được tạo ở chế độ chỉ chủ sở hữu có quyền truy cập. Không công khai bảng tính, bản tóm tắt phản hồi hoặc CSV.
- Không commit token, khóa API hoặc dữ liệu người tham gia vào repository này.
- Bật GitHub Pages từ nhánh main, thư mục gốc. Không cần thư viện hay bước build.

## Phương pháp

Câu 10 là thang cảm nhận riêng của dự án từ 0 đến 10, không phải thang đo lâm sàng đã thẩm định. Câu 12 là hồi tưởng chủ quan, không phải phép đo trước–sau độc lập. Không suy ra quan hệ nhân quả hoặc hiệu quả chữa bệnh. “DNA” là ẩn dụ, không thu dữ liệu di truyền.

## Kiểm tra

Đã kiểm tra nội dung 12 câu hỏi, cấu hình không thu email, không yêu cầu đăng nhập để giới hạn phản hồi, không chia sẻ tóm tắt câu trả lời, và liên kết bảng phản hồi. Không gửi dữ liệu giả vào khảo sát; chưa kiểm thử một lượt gửi đến bảng tính.
