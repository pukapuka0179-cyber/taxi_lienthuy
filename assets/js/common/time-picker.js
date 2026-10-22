/* Bộ chọn giờ dùng chung; nhãn buổi theo ngôn ngữ, dữ liệu gửi đi theo HH:mm. */
document.querySelectorAll('[data-time-picker]').forEach(picker => {
  const value = picker.querySelector('input[type="hidden"]');
  const hour = picker.querySelector('[data-time-hour]');
  const minute = picker.querySelector('[data-time-minute]');
  const period = picker.querySelector('[data-time-period]');
  const pad = number => String(number).padStart(2, '0');
  for (let number = 1; number <= 12; number++) hour.add(new Option(pad(number), String(number)));
  for (let number = 0; number < 60; number++) minute.add(new Option(pad(number), pad(number)));
  function restore() {
    const match = /^(\d{2}):(\d{2})$/.exec(value.value);
    if (!match) { hour.value = ''; minute.value = '00'; period.value = 'am'; return; }
    const hours = Number(match[1]);
    hour.value = String(hours % 12 || 12);
    minute.value = match[2];
    period.value = hours >= 12 ? 'pm' : 'am';
  }
  picker.addEventListener('change', event => {
    if (event.target === value) { restore(); return; }
    value.value = hour.value ? `${pad(Number(hour.value) % 12 + (period.value === 'pm' ? 12 : 0))}:${minute.value}` : '';
    value.dispatchEvent(new Event('input', { bubbles: true }));
  });
  window.addEventListener('pageshow', restore);
  picker.closest('form')?.addEventListener('reset', () => setTimeout(restore, 0));
  restore();
});
