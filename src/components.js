import { mediaSrc } from './product-media.js';
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths = {
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 cart:'<path d="M3 3h2l2 12h12l2-8H6M8 20h.01M18 20h.01"/>',
 compare:'<path d="M9 4H4v16h5M15 4h5v16h-5M8 12h8m-3-3 3 3-3 3"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 camera:'<path d="M3 7h4l2-3h6l2 3h4v14H3Z"/><circle cx="12" cy="13" r="4"/>',
 cube:'<path d="m12 3 9 5v9l-9 5-9-5V8Zm0 9 9-4M3 8l9 4m0 0v10"/>',
 ruler:'<path d="m3 16 13-13 5 5L8 21Zm5-5 2 2m1-5 2 2m1-5 2 2"/>',
 filter:'<path d="M3 6h18M3 12h18M3 18h18M7 3v6m10 0v6M9 15v6"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 bag:'<path d="M4 7h16v14H4Zm4 0V5a4 4 0 0 1 8 0v2"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 room:'<path d="M3 21V3h18v18Zm0-6h6v6m6-18v6h6"/>',
 play:'<path d="m8 4 12 8-12 8Z"/>',
 bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11h.01"/>',
 grid:'<path d="M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z"/>',
 truck:'<path d="M2 5h12v12H2Zm12 5h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 back:'<path d="M20 12H4m6-6-6 6 6 6"/>'
};
export const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
export const link = (href, text, cls = '', extra = '') => `<a href="${esc(href)}" data-nav class="${cls}" ${extra}>${text}</a>`;
export const button = (text, action, cls = '', extra = '') => `<button type="button" data-action="${action}" class="${cls}" ${extra}>${text}</button>`;
export const image = (item, cls = '', eager = false) => `<img src="${esc(mediaSrc(item.src))}" alt="${esc(item.alt)}" class="${cls}" width="1000" height="1000" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
export const brand = () => `${link('/', 'LihatDulu<span aria-hidden="true">•</span>', 'brand', 'aria-label="LihatDulu, pilih pembeli atau penjual"')}`;
