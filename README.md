# Website Du lịch Liên Thúy

Website 5 trang, dùng HTML, CSS và JavaScript thuần. Không cần cài thư viện hay chạy build. Các thư mục mẫu ban đầu và `image_01` được giữ nguyên.

## Mở website

Mở `index.html` trực tiếp bằng Chrome/Edge, hoặc dùng Live Server trong VS Code. Có thể chạy máy chủ tĩnh từ thư mục dự án:

```powershell
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`. Đưa 5 file HTML và thư mục `assets` lên hosting tĩnh là đủ.

## Triển khai GitHub Pages

Repository: `https://github.com/pukapuka0179-cyber/taxi_lienthuy`.

Trong repository, vào **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**. Workflow `.github/workflows/deploy-pages.yml` sẽ kiểm tra và triển khai mỗi lần đẩy mã lên nhánh `main` hoặc `master`. Có thể chạy thủ công trong **Actions → Deploy website to GitHub Pages → Run workflow**.

Địa chỉ dự kiến sau khi triển khai thành công: `https://pukapuka0179-cyber.github.io/taxi_lienthuy/`. Theo dõi trạng thái thực tế trong tab Actions trước khi chia sẻ đường dẫn.

Gói triển khai chỉ gồm 5 trang, `.nojekyll` và `assets`; các mẫu ban đầu, ảnh gốc, công cụ kiểm tra và thư mục nội bộ không được đưa lên website. Lệnh tạo gói cục bộ:

```powershell
node tools/verify-site.cjs
node tools/package-site.cjs
```

## Cấu trúc

```text
index.html                      Trang chủ
dich-vu.html                    Dịch vụ
doi-xe.html                     Đội xe
quy-trinh.html                  Quy trình
lien-he.html                    Liên hệ
assets/
  css/
    fonts.css                   Khai báo font cục bộ
    tokens.css                  Màu sắc, font, chiều cao header
    utilities.css               CSS tĩnh giữ bố cục của các mẫu
    common.css                  Header, footer, menu, nút, CTA
    pages.css                   Điều chỉnh riêng từng trang
  js/
    config.js                   Tên nhà xe, hotline, Zalo, menu
    i18n.js                     Chuyển đổi và ghi nhớ ngôn ngữ
    main.js                     Chọn nhu cầu, cuộn đội xe, sao chép
    common/
      header.js                 Header, menu desktop/mobile, chọn ngôn ngữ
      footer.js                 Footer chung
      contact.js                CTA và nút liên hệ nổi
      time-picker.js            Bộ chọn giờ, phút và Sáng / Chiều dùng chung
    locales/
      common.js                 Bản dịch các thành phần dùng chung
      vi.js                     Nội dung tiếng Việt
      en.js                     Nội dung tiếng Anh
      zh.js                     Nội dung tiếng Trung giản thể
    pages/
      contact.js                Kiểm tra form, tạo nội dung và sao chép để gửi qua Zalo
  images/                       Ảnh thực tế và ảnh minh họa từ mẫu
  fonts/                        Font Be Vietnam Pro và biểu tượng
tools/                          Kiểm tra tùy chọn, không cần khi chạy web
```

## Chỉnh sửa

- **Tên nhà xe, số điện thoại và Zalo:** sửa `assets/js/config.js`. Các chuỗi có `{name}` hoặc `{phoneDisplay}` sẽ tự lấy thông tin từ đây.
- **Header, footer, CTA:** sửa đúng file trong `assets/js/common`. Mọi trang sẽ cập nhật cùng lúc.
- **Màu sắc:** sửa các giá trị `--rgb-*` trong `assets/css/tokens.css`. Mỗi giá trị gồm ba số R G B, ví dụ `5 150 105`. Không cần biên dịch lại CSS.
- **Bố cục chung:** sửa `common.css`; bố cục riêng từng trang sửa `pages.css` hoặc HTML tương ứng.
- **Nội dung:** tìm khóa `data-i18n` trong HTML, rồi sửa giá trị cùng khóa trong `vi.js`, `en.js`, `zh.js`. Nội dung dùng chung nằm ở `locales/common.js`. Khi thêm nội dung mới, thêm khóa cho đủ ba ngôn ngữ. Không đưa thẻ HTML vào chuỗi dịch.
- **Ảnh:** thay file trong `assets/images` hoặc cập nhật `src` trong trang. Các ảnh VinFast thực tế đã chọn là `vinfast-sunset.jpg`, `vinfast-wedding.jpg`, `vinfast-front.jpg`. Ảnh `sample-*` là minh họa giữ từ mẫu, không phải ảnh thực tế của nhà xe.
- **Mã hóa:** luôn lưu UTF-8. Dự án có `.editorconfig` để hỗ trợ thiết lập này.

Bộ chọn ngôn ngữ hỗ trợ Việt / English / 中文, nhớ lựa chọn trong trình duyệt và giữ khi chuyển trang. Có thể mở trực tiếp với `?lang=vi`, `?lang=en`, `?lang=zh`.

## Form tư vấn

Form dùng Zalo cá nhân số **0976.696.179**. Khách điền thông tin, bấm **Sao Chép Yêu Cầu**, rồi **Mở Zalo để gửi**, dán nội dung và bấm gửi trong cuộc trò chuyện. Website chỉ tạo và sao chép nội dung trên thiết bị, không tự gửi tin nhắn hoặc xác nhận nhà xe đã nhận được yêu cầu. Luồng này không gọi API email, không phụ thuộc FormSubmit hay Gmail.

Nội dung tin nhắn có nhãn theo ngôn ngữ khách chọn (Việt, Anh hoặc Trung), ngày dạng `dd/mm/yyyy` và giờ dạng 24 giờ để tránh nhầm sáng/chiều. Ngày, giờ và ghi chú chưa điền sẽ không xuất hiện trong tin nhắn. Bộ chọn giờ trên form vẫn có ô giờ, phút và Sáng / Chiều riêng.

**Cấu hình:** sửa `zalo` và `zaloDisplay` trong `assets/js/config.js` để đổi tài khoản Zalo trên toàn website. Số gọi điện lấy từ `phone` và `phoneDisplay`, được quản lý riêng. Khách cần có tài khoản Zalo và đăng nhập để nhắn tin cho nhà xe.

Nếu trình duyệt chặn clipboard, nội dung vẫn hiện trong ô chỉ đọc, được chọn sẵn để khách sao chép thủ công. Khi sửa thông tin form, bản nội dung cũ được ẩn để tránh gửi nhầm. Khi đổi ngôn ngữ, nội dung được cập nhật và khách được nhắc sao chép lại. Trang không tự mở cửa sổ ngoài; nút mở Zalo là liên kết do khách bấm.

Kiểm tra trình duyệt xác minh nội dung và clipboard bằng mô phỏng, kiểm tra liên kết đúng số Zalo, không gửi tin nhắn thật. Nhà xe vẫn cần trao đổi trực tiếp với khách để chốt giá và lịch xe. Các file thiết lập email cũ trong `.preview` là tài liệu thử nghiệm cục bộ và không được đưa lên GitHub hoặc hosting.

## Kiểm tra tùy chọn

Không cần các công cụ này để sử dụng website. Nếu máy có Node.js 22 trở lên:

```powershell
node tools/verify-site.cjs
node tools/check-site.cjs
```

Lệnh thứ hai dùng Chrome hoặc Edge cài sẵn ở đường dẫn chuẩn trên Windows, chạy headless để kiểm tra 5 trang × 3 ngôn ngữ × 3 kích thước màn hình, cùng các thao tác chính. Báo cáo và ảnh chụp nằm trong `.preview`.
