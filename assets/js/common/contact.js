(() => {
  const { escape: e, icon } = Site;
  Site.mount('contact-cta', `
    <section class="contact-cta"><div class="container cta-inner">
      <div><span class="eyebrow" data-i18n="cta.eyebrow"></span><h2 data-i18n="cta.title"></h2><p data-i18n="cta.description"></p></div>
      <div class="cta-actions"><a class="button button-amber" href="tel:${e(SiteConfig.phone)}">${icon('call')}<span>${e(SiteConfig.phoneDisplay)}</span></a><a class="button button-white" href="${e(SiteConfig.zalo)}" target="_blank" rel="noopener noreferrer">${icon('chat')}<span data-i18n="cta.zalo"></span></a></div>
    </div></section>`);
  Site.mount('floating-contact', `<aside class="floating-contact" aria-label="Liên hệ nhanh" data-i18n-aria-label="contact.quick">
    <a class="floating-zalo" href="${e(SiteConfig.zalo)}" target="_blank" rel="noopener noreferrer">${icon('chat')}<span data-i18n="cta.zalo"></span></a>
    <a class="floating-phone" href="tel:${e(SiteConfig.phone)}">${icon('call')}<span>${e(SiteConfig.phoneDisplay)}</span></a>
  </aside>`);
})();
