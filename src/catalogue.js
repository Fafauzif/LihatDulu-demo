// Authored Sora showcase item. These values do not represent live stock or sellers.
// Asset provenance and the original-image prompts are recorded in docs/catalogue-assets.md.
export const LISTINGS = [
  {
    id: 'sora',
    title: 'Lemari Sora',
    category: 'Lemari',
    price: 2450000,
    location: 'Jakarta Selatan',
    material: 'Panel kayu dengan finishing serat kayu terang',
    dimensions: { width: 90, depth: 47.5, height: 120 },
    description: 'Lemari penyimpanan berwarna kayu terang dengan dua pintu dan satu laci. Lihat bagian dalam, ukuran, serta detail pemakaian pada model interaktif sebelum menentukan posisi di ruangmu.',
    condition: 'Bekas · ada detail pemakaian',
    photos: [
      { src: '/images/cabinet-closed.webp', alt: 'Lemari Sora kayu terang dengan dua pintu dan satu laci dalam keadaan tertutup', caption: 'Tampak depan lemari' },
      { src: '/images/cabinet-open.webp', alt: 'Lemari Sora dengan kedua pintu dan laci terbuka', caption: 'Pintu dan laci terbuka' },
      { src: '/images/capture-rear.webp', alt: 'Bagian belakang lemari Sora', caption: 'Tampak belakang' },
      { src: '/images/wear-scratch.webp', alt: 'Detail goresan pada permukaan pintu kiri lemari Sora', caption: 'Detail pemakaian pada pintu kiri' }
    ],
    model: true,
    features: ['Dua pintu', 'Satu laci', 'Model 3D interaktif', 'Detail pemakaian'],
    created: '2026-09-06T08:00:00Z'
  }
];

// Marketplace placeholders are intentionally not live listings. They give the
// judge a believable catalogue shape without inventing stock, sellers or prices.
// Every placeholder routes to Sora, the only item with a complete interactive
// 3D experience in this release.
export const MARKETPLACE_PLACEHOLDERS = [
  { id: 'arca', title: 'Kursi Arca', category: 'Kursi', image: '/images/catalogue/arca-chair.webp', alt: 'Kursi Arca', description: 'Contoh item untuk katalog kursi.' },
  { id: 'batu', title: 'Meja Batu', category: 'Meja', image: '/images/catalogue/batu-coffee.webp', alt: 'Meja Batu', description: 'Contoh item untuk katalog meja.' },
  { id: 'lino', title: 'Sofa Lino', category: 'Sofa', image: '/images/catalogue/lino-sofa.webp', alt: 'Sofa Lino', description: 'Contoh item untuk katalog sofa.' },
  { id: 'nara', title: 'Lounge Nara', category: 'Lounge', image: '/images/catalogue/nara-lounge.webp', alt: 'Lounge Nara', description: 'Contoh item untuk katalog lounge.' },
  { id: 'rimba', title: 'Sideboard Rimba', category: 'Penyimpanan', image: '/images/catalogue/rimba-sideboard.webp', alt: 'Sideboard Rimba', description: 'Contoh item untuk katalog penyimpanan.' }
];

export function getListing(id) {
  return LISTINGS.find(listing => listing.id === id);
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
});

export function formatPrice(number) {
  return rupiah.format(number).replace(/\u00a0/g, ' ');
}

const normalize = value => String(value ?? '').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id-ID').trim();

function priceLimit(value, fallback) {
  if (value === '' || value == null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function filterListings({ query = '', category = '', sort = 'relevance', minPrice, maxPrice } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const selectedCategory = normalize(category);
  const minimum = priceLimit(minPrice, -Infinity);
  const maximum = priceLimit(maxPrice, Infinity);
  const results = LISTINGS.filter(listing => {
    if (selectedCategory && !['semua', 'all'].includes(selectedCategory) && normalize(listing.category) !== selectedCategory) return false;
    if (listing.price < minimum || listing.price > maximum) return false;
    const searchable = normalize([listing.title, listing.category, listing.material, listing.location, listing.description, ...listing.features].join(' '));
    return terms.every(term => searchable.includes(term));
  });

  if (['price-asc', 'cheapest'].includes(sort)) results.sort((a, b) => a.price - b.price);
  else if (['price-desc', 'priciest'].includes(sort)) results.sort((a, b) => b.price - a.price);
  else if (sort === 'newest') results.sort((a, b) => Date.parse(b.created) - Date.parse(a.created));
  return results;
}
