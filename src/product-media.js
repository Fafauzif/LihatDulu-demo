// One canonical cover per example product. Gallery evidence remains unchanged.
const ids = ['sora', 'arca', 'batu', 'rimba', 'awan', 'tala', 'loka', 'nusa', 'senja', 'ruji'];
const covers = new Map(ids.map(id => [
  ['sora','arca','batu','rimba'].includes(id) ? `/images/products/${id}/hero.webp` : `/images/examples/${id}.webp`,
  `/images/cutouts/${id}.webp`
]));
export const mediaSrc = src => covers.get(src) ?? src;
export const productCover = item => ({ ...item.photos[0], src: mediaSrc(item.photos[0].src) });
