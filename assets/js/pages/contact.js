(() => {
  const form = document.getElementById('contactBookingForm');
  if (!form) return;
  const result = document.getElementById('bookingResult');
  const message = document.getElementById('bookingMessage');
  const status = document.getElementById('bookingStatus');
  const phone = document.getElementById('customerPhone');
  const requested = new URLSearchParams(location.search).get('service');
  const choices = { tour: 'Xe 5 chỗ', wedding: 'Cưới hỏi', airport: 'Đón sân bay', province: 'Đi tỉnh xa' };
  const initial = [...form.querySelectorAll('[name="trip_service"]')].find(input => input.value === choices[requested]);
  if (initial) initial.checked = true;
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('input', () => { result.hidden = true; status.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    phone.value = phone.value.replace(/[\s().-]/g, '');
    phone.setCustomValidity(/^\+?[0-9]{9,15}$/.test(phone.value) ? '' : I18n.t('form.invalidPhone'));
    if (!form.reportValidity()) return;
    const value = id => document.getElementById(id).value.trim();
    const service = form.querySelector('[name="trip_service"]:checked');
    const lines = [
      I18n.t('message.greeting'),
      `${I18n.t('form.name')}: ${value('customerName')}`,
      `${I18n.t('form.phone')}: ${phone.value}`,
      `${I18n.t('form.service')}: ${service.closest('label').querySelector('span').textContent}`,
      `${I18n.t('form.pickup')}: ${value('pickupPoint')}`,
      `${I18n.t('form.destination')}: ${value('dropPoint')}`
    ];
    if (value('tripDate')) {
      // Giữ nguyên ngày đã chọn, không đổi theo múi giờ của thiết bị.
      const locale = { vi: 'vi-VN', en: 'en-GB', zh: 'zh-CN' }[I18n.language];
      const departure = new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'
      }).format(new Date(value('tripDate') + 'T00:00:00Z'));
      lines.push(`${I18n.t('form.date')}: ${departure}`);
    }
    if (value('tripTime')) lines.push(`${I18n.t('form.time')}: ${value('tripTime')}`);
    if (value('tripNotes')) lines.push(`${I18n.t('form.notes')}: ${value('tripNotes')}`);
    lines.push(I18n.t('message.ending'));
    message.value = lines.join('\n');
    result.hidden = false;
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    message.focus();
  });
  document.getElementById('copyBooking').addEventListener('click', async () => {
    status.textContent = I18n.t(await copyText(message.value) ? 'copy.success' : 'copy.manual');
  });
  document.addEventListener('languagechange', () => {
    result.hidden = true; status.textContent = ''; phone.setCustomValidity('');
  });
})();
