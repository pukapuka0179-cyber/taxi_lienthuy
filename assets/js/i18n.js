/* Nội dung tĩnh được tra theo khóa; chỉ gán textContent, không chèn HTML dịch. */
(() => {
  const supported = ['vi', 'en', 'zh'];
  const storageKey = 'lienthuy.language';
  let lang = 'vi';
  try { lang = localStorage.getItem(storageKey) || lang; } catch (_) { /* file:// hoặc trình duyệt chặn lưu trữ */ }
  const query = new URLSearchParams(location.search).get('lang');
  if (supported.includes(query)) lang = query;
  if (!supported.includes(lang)) lang = 'vi';
  function t(key, values = {}) {
    const result = window.Translations[lang]?.[key] ?? window.Translations.vi[key] ?? key;
    return result.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? SiteConfig[name] ?? match);
  }
  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    for (const attr of ['placeholder', 'aria-label', 'title', 'alt', 'content']) {
      document.querySelectorAll(`[data-i18n-${attr}]`).forEach(node => { node.setAttribute(attr, t(node.getAttribute(`data-i18n-${attr}`))); });
    }
    document.querySelectorAll('[data-language]').forEach(select => { select.value = lang; });
    document.title = `${t('nav.' + document.body.dataset.page)} | ${t('brand.full')}`;
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }
  function setLanguage(next) {
    if (!supported.includes(next)) return;
    lang = next;
    try { localStorage.setItem(storageKey, lang); } catch (_) { /* Tham số URL giữ ngôn ngữ nếu không có localStorage. */ }
    apply();
  }
  window.I18n = { t, apply, setLanguage, get language() { return lang; } };
  document.querySelectorAll('[data-language]').forEach(select => { select.addEventListener('change', () => setLanguage(select.value)); });
  // Giữ lựa chọn cả khi chạy trực tiếp bằng file:// và localStorage bị chặn.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    if (link.getAttribute('href').startsWith('#')) return;
    const url = new URL(link.href, location.href);
    if (url.protocol === location.protocol && url.host === location.host && /\.html$/.test(url.pathname)) {
      url.searchParams.set('lang', lang);
      link.href = url.href;
    }
  });
  apply();
})();
