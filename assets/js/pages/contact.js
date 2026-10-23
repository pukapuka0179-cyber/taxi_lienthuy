(() => {
  const form = document.getElementById('contactBookingForm');
  if (!form) return;
  const result = document.getElementById('bookingResult');
  const message = document.getElementById('bookingMessage');
  const status = document.getElementById('bookingStatus');
  const phone = document.getElementById('customerPhone');
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.querySelector('[data-i18n]');
  const copy = document.getElementById('copyBooking');
  const query = new URLSearchParams(location.search);
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const choices = { tour: 'Xe 5 chỗ', wedding: 'Cưới hỏi', airport: 'Đón sân bay', province: 'Đi tỉnh xa' };
  const initial = [...form.querySelectorAll('[name="trip_service"]')].find(input => input.value === choices[query.get('service')]);
  if (initial) initial.checked = true;
  let prepared = false;
  let copying = false;
  let feedback = '';
  let messageLanguage = I18n.language;
  function buildMessage() {
    const data = Object.fromEntries(new FormData(form));
    const selected = form.querySelector('[name="trip_service"]:checked');
    const serviceKey = selected.closest('label').querySelector('[data-i18n]').dataset.i18n;
    const lines = [
      I18n.t('message.greeting'),
      `${I18n.t('form.name')}: ${data.name}`,
      `${I18n.t('form.phone')}: ${data.phone}`,
      `${I18n.t('form.service')}: ${I18n.t(serviceKey)}`,
      `${I18n.t('form.pickup')}: ${data.pickup}`,
      `${I18n.t('form.destination')}: ${data.destination}`
    ];
    if (data.date) lines.push(`${I18n.t('form.date')}: ${data.date.split('-').reverse().join('/')}`);
    if (data.time) lines.push(`${I18n.t('form.time')}: ${data.time}`);
    if (data.notes.trim()) lines.push(`${I18n.t('form.notes')}: ${data.notes.trim()}`);
    lines.push('', I18n.t('message.ending'));
    return lines.join('\n');
  }
  function render() {
    submit.disabled = copying;
    copy.disabled = copying;
    fields.forEach(field => { field.disabled = copying; });
    submitLabel.dataset.i18n = copying ? 'form.copying' : 'form.prepare';
    submitLabel.textContent = I18n.t(submitLabel.dataset.i18n);
    form.setAttribute('aria-busy', String(copying));
    result.hidden = !prepared;
    status.hidden = !feedback;
    status.textContent = feedback ? I18n.t(feedback) : '';
    status.dataset.state = feedback === 'copy.success' ? 'success' : 'info';
  }
  async function copyMessage() {
    if (copying) return;
    copying = true;
    feedback = 'form.ready';
    render();
    let copied = false;
    let timer;
    try {
      copied = await Promise.race([
        window.copyText(message.value),
        new Promise(resolve => { timer = setTimeout(() => resolve(false), 1500); })
      ]);
    } catch (_) { /* Nội dung luôn có sẵn để chọn và sao chép thủ công. */ }
    finally { clearTimeout(timer); copying = false; }
    feedback = copied ? 'copy.success' : 'copy.manual';
    render();
    if (messageLanguage !== I18n.language) {
      message.value = buildMessage();
      messageLanguage = I18n.language;
      feedback = 'form.ready';
      render();
      status.focus();
      return;
    }
    if (copied) status.focus();
    else { message.focus(); message.select(); }
  }
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('input', () => { prepared = false; feedback = ''; render(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (copying) return;
    for (const id of ['customerName', 'pickupPoint', 'dropPoint']) {
      const field = document.getElementById(id);
      field.value = field.value.trim();
    }
    phone.value = phone.value.replace(/[\s().-]/g, '');
    phone.setCustomValidity(/^\+?[0-9]{9,15}$/.test(phone.value) ? '' : I18n.t('form.invalidPhone'));
    if (!form.reportValidity()) return;
    message.value = buildMessage();
    messageLanguage = I18n.language;
    prepared = true;
    result.hidden = false;
    await copyMessage();
    result.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  copy.addEventListener('click', copyMessage);
  document.addEventListener('languagechange', () => {
    phone.setCustomValidity('');
    if (prepared && !copying) { message.value = buildMessage(); messageLanguage = I18n.language; feedback = 'form.ready'; }
    render();
  });
  if (query.has('sent')) {
    const clean = new URL(location.href); clean.searchParams.delete('sent');
    history.replaceState(null, '', clean.href);
  }
  render();
})();
