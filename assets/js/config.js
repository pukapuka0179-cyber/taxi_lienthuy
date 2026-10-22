/* Sửa thông tin nhà xe và menu tại đây; mọi trang cùng sử dụng cấu hình này. */
window.SiteConfig = {
  name: 'Liên Thúy',
  phone: '0914531983',
  phoneDisplay: '0914.531.983',
  zalo: 'https://zalo.me/0914531983',
  navigation: [
    { key: 'home', href: 'index.html' },
    { key: 'services', href: 'dich-vu.html' },
    { key: 'fleet', href: 'doi-xe.html' },
    { key: 'process', href: 'quy-trinh.html' },
    { key: 'contact', href: 'lien-he.html' }
  ]
};
window.Site = {
  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  },
  icon(name) { return `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`; },
  mount(name, html) {
    document.querySelectorAll(`[data-component="${name}"]`).forEach(element => { element.outerHTML = html; });
  }
};
