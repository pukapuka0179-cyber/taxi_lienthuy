// Kiểm tra bằng Chrome/Edge headless, chỉ dùng các module có sẵn của Node 22+.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  });
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser, ws;
const errors = [], failures = [], screenshots = [];
async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  console.log('Local check server:', base);
  const bin = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
  if (!bin) throw new Error('Chrome or Edge is required for this optional browser check.');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lienthuy-preview-'));
  browser = spawn(bin, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => reject(new Error('Browser startup timeout')), 15000);
    browser.stderr.on('data', chunk => {
      buffer += chunk;
      const match = buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    browser.once('error', reject);
  });
  const debugBase = endpoint.replace(/^ws:/, 'http:').replace(/\/devtools\/browser\/.*/, '');
  const tabs = await (await fetch(debugBase + '/json/list')).json();
  console.log('Browser connected');
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let counter = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const handler = pending.get(message.id); pending.delete(message.id);
      if (message.error) handler.reject(new Error(JSON.stringify(message.error))); else handler.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry.text);
  };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++counter;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
  async function visit(url) {
    await cdp('Page.navigate', { url });
    for (let i = 0; i < 150; i++) {
      if (await evaluate('document.readyState === "complete" && !!window.I18n && !!document.querySelector(".site-footer")')) break;
      await sleep(40);
    }
    await evaluate('document.fonts.ready.then(() => true)');
  }
  async function screenshot(name) {
    const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.join(root, '.preview'), { recursive: true });
    fs.writeFileSync(path.join(root, '.preview', name), Buffer.from(result.data, 'base64')); screenshots.push(name);
  }
  const pages = ['index.html', 'dich-vu.html', 'doi-xe.html', 'quy-trinh.html', 'lien-he.html'];
  let count = 0;
  for (const width of [1440, 375, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 960, deviceScaleFactor: 1, mobile: width < 768 });
    for (const lang of ['vi', 'en', 'zh']) {
      for (const page of pages) {
        await visit(`${base}/${page}?lang=${lang}`);
        if (count % 5 === 0) console.log('Checking', width, lang, page);
        const result = await evaluate(`(async () => {
          document.querySelectorAll('img').forEach(img => img.loading = 'eager');
          await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
          return {
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            overflowElements: [...document.querySelectorAll('main *')].filter(el => {const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 3 && getComputedStyle(el).position !== 'absolute';}).slice(0, 5).map(el => ({tag: el.tagName, cls: el.className})),
            missing: [...document.querySelectorAll('[data-i18n]')].filter(el => !Translations[I18n.language][el.dataset.i18n]).map(el => el.dataset.i18n),
            broken: [...document.images].filter(img => !img.naturalWidth || img.dataset.fallback).map(img => img.src),
            components: document.querySelectorAll('[data-component]').length,
            headings: document.querySelectorAll('h1').length,
            current: document.querySelectorAll('[data-nav][aria-current="page"]').length,
            placeholderLinks: document.querySelectorAll('a[href="#"]').length,
            badText: /[A-Za-zÀ-ỹ]\\?[A-Za-zÀ-ỹ]/.test(document.body.innerText),
            fonts: document.fonts.check('16px ' + getComputedStyle(document.body).fontFamily) && document.fonts.check('24px "Material Symbols Outlined"')
          };
        })()`);
        if (result.lang !== (lang === 'zh' ? 'zh-Hans' : lang) || result.overflow || result.missing.length || result.broken.length || result.components || result.headings !== 1 || result.current !== 2 || result.placeholderLinks || result.badText || !result.fonts) failures.push({ page, lang, width, ...result });
        count++;
        if (page === 'index.html' && lang === 'vi' && width !== 320) await screenshot(`home-vi-${width}.png`);
        if (page === 'lien-he.html' && lang === 'zh' && width === 375) await screenshot('contact-zh-375.png');
      }
    }
  }
  // The language selector persists across page navigation and reload.
  await visit(`${base}/index.html?lang=vi`);
  assert.equal(await evaluate(`(() => { const select = document.querySelector('[data-language]'); select.value='en'; select.dispatchEvent(new Event('change')); return I18n.language; })()`), 'en');
  await visit(`${base}/dich-vu.html`);
  assert.equal(await evaluate('I18n.language'), 'en');
  // The mobile menu is operable and tracks aria-expanded.
  assert.equal(await evaluate(`(() => { document.querySelector('.menu-toggle').click(); return !document.querySelector('.mobile-nav').hidden && document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true'; })()`), true);
  await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'}))`);
  assert.equal(await evaluate('document.querySelector(".mobile-nav").hidden'), true);
  // Choosing a trip carries the choice into the contact form.
  await visit(`${base}/index.html?lang=en`);
  await evaluate(`document.querySelector('[data-trip="wedding"]').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('.trip-btn[aria-pressed="true"]').length`), 1);
  assert.match(await evaluate(`document.getElementById('dynamicZaloLink').href`), /service=wedding/);
  // The generated message contains real newlines; user data stays literal text.
  await visit(`${base}/lien-he.html?lang=en&service=wedding#booking`);
  assert.equal(await evaluate(`document.querySelector('[name="trip_service"]:checked').value`), 'Cưới hỏi');
  assert.equal(await evaluate('document.getElementById("tripDate").type'), 'datetime-local');
  await evaluate(`(() => { for (const [id,value] of Object.entries({customerName:'Test <script>alert(1)</script>',customerPhone:'+84 914 531 983',pickupPoint:'Da Nang',dropPoint:'Hoi An',tripDate:'2030-12-25T09:30',tripNotes:'2 suitcases'})) document.getElementById(id).value=value; document.querySelector('form button[type=submit]').click(); })()`);
  assert.equal(await evaluate('document.getElementById("bookingResult").hidden'), false);
  const message = await evaluate('document.getElementById("bookingMessage").value');
  assert.match(message, /Test <script>/); assert.match(message, /\n/); assert.match(message, /\+84914531983/);
  assert.match(message, /25\/12\/2030/); assert.match(message, /09:30/);
  assert.equal(await evaluate('document.getElementById("bookingStatus").textContent'), '');
  await evaluate(`document.getElementById('tripDate').scrollIntoView({behavior:'instant',block:'center'})`);
  await screenshot('contact-date-time-320.png');
  await evaluate(`I18n.setLanguage('zh')`);
  assert.equal(await evaluate('document.getElementById("bookingResult").hidden'), true);
  await visit(`${base}/quy-trinh.html?lang=zh`);
  assert.equal(await evaluate('I18n.t("message.template").includes("\\n")'), true);
  await evaluate(`window.copyText = async text => { window.copiedMessage = text; return true; }; document.getElementById('copyTemplateBtn').click()`);
  await sleep(30);
  assert.equal(await evaluate('window.copiedMessage.includes("\\n")'), true);
  await evaluate(`window.copyText = async () => false; document.getElementById('copyTemplateBtn').click()`);
  await sleep(30);
  assert.equal(await evaluate('document.getElementById("copyFallback").hidden'), false);
  assert.equal(await evaluate('document.getElementById("copyFallback").value === I18n.t("message.template")'), true);
  await evaluate(`I18n.setLanguage('en')`);
  assert.equal(await evaluate('document.getElementById("copyBtnText").textContent === I18n.t("process.046")'), true);
  // Direct double-click / file:// mode must also render shared components and languages.
  await visit(require('node:url').pathToFileURL(path.join(root,'index.html')).href + '?lang=zh');
  assert.equal(await evaluate('I18n.language'), 'zh');
  assert.equal(await evaluate('document.querySelectorAll(".site-header").length'), 1);
  const report = { combinations: count, errors: [...new Set(errors)], failures, screenshots, interactions: 'passed', fileProtocol: 'passed' };
  fs.writeFileSync(path.join(root, '.preview', 'check-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failures.length || errors.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { ws?.close(); browser?.kill(); server.close(); });
