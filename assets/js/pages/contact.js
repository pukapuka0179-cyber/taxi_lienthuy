(() => {
  const form = document.getElementById('contactBookingForm');
  if (!form) return;
  const status = document.getElementById('bookingStatus');
  const phone = document.getElementById('customerPhone');
  const button = form.querySelector('[type="submit"]');
  const buttonLabel = button.querySelector('[data-i18n]');
  const query = new URLSearchParams(location.search);
  let submitting = false;
  let feedback = '';
  const fields = [...form.querySelectorAll('input:not([type="hidden"]), select, textarea')];
  const choices = { tour: 'Xe 5 chỗ', wedding: 'Cưới hỏi', airport: 'Đón sân bay', province: 'Đi tỉnh xa' };
  const initial = [...form.querySelectorAll('[name="trip_service"]')].find(input => input.value === choices[query.get('service')]);
  if (initial) initial.checked = true;
  function render() {
    button.disabled = submitting;
    fields.forEach(field => { field.disabled = submitting; });
    buttonLabel.dataset.i18n = submitting ? 'form.sending' : 'contact.018';
    buttonLabel.textContent = I18n.t(buttonLabel.dataset.i18n);
    form.setAttribute('aria-busy', String(submitting));
    status.hidden = !feedback;
    status.textContent = feedback ? I18n.t(feedback) : '';
    status.dataset.state = feedback === 'form.sent' ? 'success' : 'error';
  }
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('input', () => { feedback = ''; render(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    for (const id of ['customerName', 'pickupPoint', 'dropPoint']) {
      const field = document.getElementById(id);
      field.value = field.value.trim();
    }
    phone.value = phone.value.replace(/[\s().-]/g, '');
    phone.setCustomValidity(/^\+?[0-9]{9,15}$/.test(phone.value) ? '' : I18n.t('form.invalidPhone'));
    if (!form.reportValidity()) return;
    // Email nằm tại dịch vụ; trình duyệt chỉ biết mã định tuyến công khai.
    const formId = SiteConfig.contactFormId.trim();
    if (!/^[a-zA-Z0-9_-]{16,128}$/.test(formId)) {
      feedback = 'form.unavailable'; render(); status.focus(); return;
    }
    if (!['http:', 'https:'].includes(location.protocol)) {
      feedback = 'form.webRequired'; render(); status.focus(); return;
    }
    form.elements._url.value = new URL('lien-he.html', location.href).href;
    form.elements._subject.value = `Yêu cầu tư vấn xe – ${SiteConfig.name}`;
    form.elements.language.value = I18n.language;
    const payload = Object.fromEntries(new FormData(form));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    submitting = true; feedback = ''; render();
    try {
      // Chỉ báo thành công khi API xác nhận; không chuyển khách sang trang dịch vụ.
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(formId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'origin',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      const message = typeof result?.message === 'string' ? result.message : '';
      if (/activat|confirm (?:your )?email|check your email/i.test(message)) {
        feedback = 'form.activation';
      } else if (!response.ok || ![true, 'true'].includes(result?.success)) {
        feedback = 'form.error';
      } else {
        feedback = 'form.sent';
      }
    } catch (_) {
      feedback = controller.signal.aborted ? 'form.timeout' : 'form.error';
    } finally {
      clearTimeout(timer);
      submitting = false;
      render();
      status.focus();
    }
  });
  document.addEventListener('languagechange', () => { phone.setCustomValidity(''); render(); });
  if (query.has('sent')) {
    const clean = new URL(location.href); clean.searchParams.delete('sent');
    history.replaceState(null, '', clean.href);
  }
  render();
})();
