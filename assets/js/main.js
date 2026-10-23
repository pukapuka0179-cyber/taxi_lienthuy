(() => {
  // Đồng bộ cả các số điện thoại và liên kết nằm trong nội dung riêng của trang.
  document.querySelectorAll('[data-phone-text]').forEach(node => { node.textContent = SiteConfig.phoneDisplay; });
  document.querySelectorAll('[data-zalo-text]').forEach(node => { node.textContent = SiteConfig.zaloDisplay; });
  document.querySelectorAll('a[data-phone]').forEach(node => { node.href = `tel:${SiteConfig.phone}`; });
  document.querySelectorAll('a[data-zalo]').forEach(node => { node.href = SiteConfig.zalo; });
  document.querySelectorAll('img').forEach(image => {
    image.addEventListener('error', () => {
      if (!image.dataset.fallback) { image.dataset.fallback = 'true'; image.src = 'assets/images/placeholder.svg'; }
    });
  });
  const tripButtons = document.querySelectorAll('[data-trip]');
  let selectedTrip = tripButtons[0]?.dataset.trip;
  function updateTrip() {
    tripButtons.forEach(button => {
      const selected = button.dataset.trip === selectedTrip;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('bg-emerald-light', selected);
      button.classList.toggle('text-emerald-deep', selected);
      button.classList.toggle('bg-surface-subtle', !selected);
      button.classList.toggle('text-on-surface-variant', !selected);
    });
    const display = document.getElementById('selectedTypeDisplay');
    if (display) display.textContent = I18n.t('trip.selected', { type: I18n.t('trip.' + selectedTrip) });
    const action = document.getElementById('dynamicZaloLink');
    if (action) action.href = `lien-he.html?service=${encodeURIComponent(selectedTrip)}&lang=${I18n.language}#booking`;
  }
  tripButtons.forEach(button => button.addEventListener('click', () => { selectedTrip = button.dataset.trip; updateTrip(); }));
  document.addEventListener('languagechange', updateTrip);
  if (tripButtons.length) updateTrip();
  document.querySelectorAll('[data-scroll]').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      document.querySelectorAll('[data-scroll]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  window.copyText = async text => {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch (_) { /* Thử cách sao chép tương thích file://. */ }
    const field = document.createElement('textarea');
    field.value = text; field.className = 'clipboard-helper'; document.body.append(field); field.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) { /* Hiện nội dung để sao chép thủ công. */ }
    field.remove();
    return success;
  };
  const copyButton = document.getElementById('copyTemplateBtn');
  copyButton?.addEventListener('click', async () => {
    const text = I18n.t('message.template');
    const success = await window.copyText(text);
    document.getElementById('copyBtnText').textContent = I18n.t(success ? 'copy.success' : 'copy.manual');
    const fallback = document.getElementById('copyFallback');
    if (fallback) { fallback.hidden = success; fallback.value = text; }
  });
  document.addEventListener('languagechange', () => {
    const fallback = document.getElementById('copyFallback');
    if (fallback) fallback.hidden = true;
  });
})();
