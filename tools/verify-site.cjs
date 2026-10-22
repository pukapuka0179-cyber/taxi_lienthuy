// Kiểm tra tĩnh; không thay đổi mã nguồn. Không cần thư viện bên ngoài.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const context = { window: {} };
for (const filename of ['common.js', 'vi.js', 'en.js', 'zh.js']) {
  vm.runInNewContext(fs.readFileSync(`assets/js/locales/${filename}`, 'utf8'), context);
}
const locales = context.window.Translations;
const keys = Object.keys(locales.vi).sort();
for (const [lang, content] of Object.entries(locales)) {
  assert.deepEqual(Object.keys(content).sort(), keys, `Missing translation keys: ${lang}`);
  for (const [key, value] of Object.entries(content)) {
    assert.ok(value.trim(), `Empty translation: ${lang}.${key}`);
    assert.equal(/\uFFFD|[A-Za-zÀ-ỹ]\?[A-Za-zÀ-ỹ]/.test(value), false, `Broken UTF-8: ${lang}.${key}`);
    const placeholders = source => [...source.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(value), placeholders(locales.vi[key]), `Placeholder mismatch: ${lang}.${key}`);
  }
}
for (const filename of fs.readdirSync('assets/js', { recursive: true }).filter(name => name.endsWith('.js'))) {
  new vm.Script(fs.readFileSync(path.join('assets/js', filename), 'utf8'), { filename });
}
const pages = ['index.html', 'dich-vu.html', 'doi-xe.html', 'quy-trinh.html', 'lien-he.html'];
for (const filename of pages) {
  const html = fs.readFileSync(filename, 'utf8');
  assert.equal(/\uFFFD|[A-Za-zÀ-ỹ]\?[A-Za-zÀ-ỹ]/.test(html), false, `Broken UTF-8: ${filename}`);
  assert.equal(/\son\w+\s*=|cdn\.tailwindcss/.test(html), false, `Inline handler or runtime dependency: ${filename}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `Duplicate IDs: ${filename}`);
  for (const match of html.matchAll(/data-i18n(?:-(?:alt|placeholder|aria-label|content|title))?="([^"]+)"/g)) {
    assert.ok(locales.vi[match[1]], `Unknown translation: ${filename} ${match[1]}`);
  }
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|tel:|mailto:|data:)/.test(value)) continue;
    assert.notEqual(value, '#', `Placeholder link: ${filename}`);
    const [pathname, hash] = value.split('#');
    const target = pathname.split('?')[0] || filename;
    assert.ok(fs.existsSync(target), `Missing asset: ${filename} -> ${target}`);
    if (hash) {
      const targetHtml = fs.readFileSync(target, 'utf8');
      assert.ok(targetHtml.includes(`id="${hash}"`), `Missing anchor: ${filename} -> ${value}`);
    }
  }
}
console.log(`PASS: ${pages.length} pages, ${keys.length} translation keys in 3 languages, UTF-8, links, assets and JavaScript syntax.`);
