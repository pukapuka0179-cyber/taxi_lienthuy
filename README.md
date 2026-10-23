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
      contact.js                Kiểm tra form và gửi yêu cầu qua dịch vụ email
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

Form gửi JSON bằng POST đến API AJAX của FormSubmit, không chuyển khách sang trang ngoài. Chỉ hiện thành công khi API trả xác nhận rõ ràng; HTTP 200 đơn thuần hoặc đường dẫn `?sent=1` không được coi là đã gửi. Nếu dịch vụ lỗi SSL, mất mạng hoặc không trả xác nhận trong 12 giây, form báo lỗi tại chỗ và giữ nguyên dữ liệu để khách liên hệ hotline. Không tự gửi lại khi hết thời gian chờ vì dịch vụ có thể đã nhận yêu cầu nhưng chưa trả kết quả.

Ngày và giờ chọn riêng. Giờ dùng các ô giờ, phút và Sáng / Chiều (AM / PM với tiếng Anh, 上午 / 下午 với tiếng Trung), không phụ thuộc nhãn SA / CH của trình duyệt. Dữ liệu email dùng định dạng 24 giờ để tránh nhầm lẫn, ví dụ 04:00 Chiều được gửi thành 16:00.

**Cấu hình:** `contactFormId` trong `assets/js/config.js` sử dụng mã định tuyến lấy từ thư FormSubmit. Không đưa địa chỉ email nhận vào file này. Khi đổi tên miền, kiểm tra thư kích hoạt cho địa chỉ website mới và xác nhận trước khi sử dụng form. Nếu API yêu cầu kích hoạt, giao diện hiển thị thông báo phù hợp, không báo gửi thành công. Có thể dùng trang cấu hình cục bộ `.preview/email-setup.html` để kích hoạt email mới; file này không được đưa lên GitHub hoặc hosting.

Để đổi email nhận, kích hoạt địa chỉ mới trên FormSubmit rồi thay `contactFormId` bằng mã tương ứng. Mã form là định tuyến công khai, không phải mật khẩu. Nó giấu địa chỉ email trong mã nguồn nhưng không ngăn mọi hình thức spam. Luồng AJAX giữ trường bẫy bot `_honey` và dựa vào bộ lọc phía dịch vụ; không có bước CAPTCHA ở trang chuyển tiếp như luồng POST cũ. Không coi kiểm tra hoặc khóa nút trên trình duyệt là biện pháp chống spam phía máy chủ.

Gửi form không tự xác nhận đặt xe hoặc xác nhận thư đã vào hộp thư đến. Nhà xe cần liên hệ khách để chốt giá và lịch xe. Lỗi SSL 525 tại `formsubmit.co` phải được nhà cung cấp xử lý; chỉnh JavaScript không thể sửa chứng chỉ máy chủ của họ. Kiểm tra trình duyệt dùng phản hồi API mô phỏng để xác minh giao diện và các nhánh lỗi, không chứng minh chuyển thư thật. Cần gửi thử từ trang liên hệ và kiểm tra Gmail sau khi dịch vụ hoạt động và form đã được kích hoạt. Phải mở website qua HTTP/HTTPS để gửi, không gửi từ `file://`.

## Kiểm tra tùy chọn

Không cần các công cụ này để sử dụng website. Nếu máy có Node.js 22 trở lên:

```powershell
node tools/verify-site.cjs
node tools/check-site.cjs
```

Lệnh thứ hai dùng Chrome hoặc Edge cài sẵn ở đường dẫn chuẩn trên Windows, chạy headless để kiểm tra 5 trang × 3 ngôn ngữ × 3 kích thước màn hình, cùng các thao tác chính. Báo cáo và ảnh chụp nằm trong `.preview`.
