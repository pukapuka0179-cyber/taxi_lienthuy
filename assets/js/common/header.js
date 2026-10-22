(() => {
  const { escape: e, icon } = Site;
  const config = SiteConfig;
  const links = config.navigation.map(item => `<a href="${item.href}" data-nav="${item.key}" data-i18n="nav.${item.key}"></a>`).join('');
  Site.mount('header', `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="${e(config.name)}" data-i18n-aria-label="brand.home">
          <span class="brand-mark">${icon('directions_car')}</span>
          <span class="brand-copy"><strong>${e(config.name)}</strong><small data-i18n="brand.subtitle"></small></span>
        </a>
        <nav class="desktop-nav" aria-label="Menu" data-i18n-aria-label="nav.label">${links}</nav>
        <div class="header-actions">
          <label class="language-picker">${icon('language')}<span class="sr-only" data-i18n="language.label"></span>
            <select data-language aria-label="Ngôn ngữ / Language / 语言">
              <option value="vi">VI</option><option value="en">EN</option><option value="zh">中文</option>
            </select>
          </label>
          <a class="button button-amber header-phone" href="tel:${e(config.phone)}">${icon('call')}<span>${e(config.phoneDisplay)}</span></a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation" data-i18n-aria-label="nav.open">${icon('menu')}</button>
        </div>
      </div>
      <nav class="mobile-nav container" id="mobile-navigation" aria-label="Menu" data-i18n-aria-label="nav.label" hidden>${links}</nav>
    </header>`);
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  function close() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', close);
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === document.body.dataset.page) link.setAttribute('aria-current', 'page');
  });
})();
