// Chỉ đóng gói các file cần cho website; không đưa thư mục làm việc lên hosting.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'dist');
fs.mkdirSync(destination, { recursive: true });
for (const name of ['index.html', 'dich-vu.html', 'doi-xe.html', 'quy-trinh.html', 'lien-he.html', '.nojekyll']) {
  if (!name.endsWith('.html')) {
    fs.copyFileSync(path.join(root, name), path.join(destination, name));
    continue;
  }
  // Mỗi phiên bản JS/CSS có URL riêng để tránh trộn HTML mới với bản dịch lưu cũ.
  const html = fs.readFileSync(path.join(root, name), 'utf8').replace(
    /\b(src|href)="(assets\/[^"?#]+\.(?:js|css))(?:\?[^"#]*)?"/g,
    (_, attribute, asset) => {
      const hash = createHash('sha256').update(fs.readFileSync(path.join(root, asset))).digest('hex').slice(0, 12);
      return `${attribute}="${asset}?v=${hash}"`;
    }
  );
  fs.writeFileSync(path.join(destination, name), html, 'utf8');
}
fs.cpSync(path.join(root, 'assets'), path.join(destination, 'assets'), { recursive: true });
console.log('Website đã sẵn sàng trong dist/.');
