// Chỉ đóng gói các file cần cho website; không đưa thư mục làm việc lên hosting.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'dist');
fs.mkdirSync(destination, { recursive: true });
for (const name of ['index.html', 'dich-vu.html', 'doi-xe.html', 'quy-trinh.html', 'lien-he.html', '.nojekyll']) {
  fs.copyFileSync(path.join(root, name), path.join(destination, name));
}
fs.cpSync(path.join(root, 'assets'), path.join(destination, 'assets'), { recursive: true });
console.log('Website đã sẵn sàng trong dist/.');
