(() => {
  const { escape: e, icon } = Site;
  const services = ['tour', 'airport', 'wedding', 'province'];
  Site.mount('footer', `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand footer-brand" href="index.html"><span class="brand-mark">${icon('directions_car')}</span><span class="brand-copy"><strong>${e(SiteConfig.name)}</strong><small data-i18n="brand.subtitle"></small></span></a>
            <p data-i18n="footer.intro"></p>
            <span class="footer-badge">${icon('verified_user')}<span data-i18n="footer.safe"></span></span>
          </div>
          <div><h2 data-i18n="footer.services"></h2><ul>${services.map(key => `<li><a href="dich-vu.html#${key}">${icon('chevron_right')}<span data-i18n="service.${key}"></span></a></li>`).join('')}</ul></div>
          <div><h2 data-i18n="footer.commitments"></h2><ul>${['clean', 'driver', 'price', 'support'].map(key => `<li>${icon('check_circle')}<span data-i18n="footer.${key}"></span></li>`).join('')}</ul></div>
          <div><h2 data-i18n="footer.contact"></h2><ul>
            <li>${icon('phone_in_talk')}<div><span data-i18n="footer.hotline"></span><a class="footer-hotline" href="tel:${e(SiteConfig.phone)}">${e(SiteConfig.phoneDisplay)}</a></div></li>
            <li>${icon('schedule')}<span data-i18n="footer.hours"></span></li>
            <li>${icon('location_on')}<span data-i18n="footer.office"></span></li>
          </ul></div>
        </div>
        <div class="footer-bottom"><p>© ${new Date().getFullYear()} <span data-i18n="brand.full"></span>. <span data-i18n="footer.safe"></span></p>
          <nav aria-label="Footer">${SiteConfig.navigation.map(item => `<a href="${item.href}" data-i18n="nav.${item.key}"></a>`).join('')}</nav>
        </div>
      </div>
    </footer>`);
})();
