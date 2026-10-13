// Canonical authored catalogue for the LihatDulu marketplace concept.
// All entries are demonstration inventory. They are intentionally labelled as
// authored examples rather than live stock, sellers, ratings or transactions.
const photo = (src, alt, caption) => ({ src, alt, caption });

const soraPhotos = [
  photo('/images/cabinet-closed.webp', 'Lemari Sora kayu terang dengan dua pintu dan satu laci dalam keadaan tertutup', 'Tampak depan lemari'),
  photo('/images/cabinet-open.webp', 'Lemari Sora dengan kedua pintu dan laci terbuka', 'Pintu dan laci terbuka'),
  photo('/images/capture-rear.webp', 'Bagian belakang lemari Sora', 'Tampak belakang'),
  photo('/images/wear-scratch.webp', 'Detail goresan pada permukaan pintu kiri lemari Sora', 'Detail pemakaian pada pintu kiri')
];

export const AVAILABLE_LISTINGS = [
  {
    id: 'sora', title: 'Lemari Sora', category: 'Lemari', price: 2450000, location: 'Jakarta Selatan',
    material: 'Panel kayu dengan finishing serat kayu terang', dimensions: { width: 90, depth: 47.5, height: 120 },
    description: 'Lemari penyimpanan dengan dua pintu dan satu laci. Putar modelnya, buka bagian penyimpanan, dan lihat detail pemakaian sebelum menentukan posisi di ruangmu.',
    condition: 'Bekas · ada detail pemakaian', photos: soraPhotos, model: true, modelType: 'sora', available: true, asset: { modelUrl: '/assets/cabinet.glb', manifestUrl: '/assets/cabinet-manifest.json', reportUrl: '/assets/cabinet-report.json' }, capabilities: { articulation: true, conditions: true, room: true, capture: true },
    features: ['Dua pintu', 'Satu laci', 'Model 3D interaktif', 'Detail pemakaian'], created: '2026-09-06T08:00:00Z',
    seller: { name: 'Studio Sora', note: 'Contoh penjual terkurasi' }
  },
  {
    id: 'arca', title: 'Kursi Arca', category: 'Kursi', price: 1280000, location: 'Bandung',
    material: 'Kayu jati dengan dudukan anyaman', dimensions: { width: 68, depth: 72, height: 78 },
    description: 'Kursi makan dengan proporsi rendah dan sandaran melengkung. Lihat hubungan antara dudukan, rangka, dan ruang gerak di sekelilingnya.',
    condition: 'Bekas · patina ringan', photos: [photo('/images/catalogue/arca-chair.webp', 'Kursi Arca kayu dengan dudukan anyaman', 'Tampak tiga perempat')],
    model: true, modelType: 'arca', available: true, asset: { modelUrl: '/assets/arca.glb', manifestUrl: '/assets/arca-manifest.json', reportUrl: '/assets/arca-report.json' }, capabilities: { articulation: false, conditions: false, room: true, capture: false }, features: ['Kayu jati', 'Dudukan anyaman', 'Model 3D interaktif'], created: '2026-09-18T08:00:00Z',
    seller: { name: 'Ruang Kedua', note: 'Contoh penjual terkurasi' }
  },
  {
    id: 'batu', title: 'Meja Batu', category: 'Meja', price: 1890000, location: 'Yogyakarta',
    material: 'Top kayu walnut dengan rak aksen kuningan', dimensions: { width: 122, depth: 78, height: 78 },
    description: 'Meja kopi dengan bidang lebar dan rak tipis di bawahnya. Periksa ketebalan top, jarak kaki, dan ruang gerak dari setiap sisi.',
    condition: 'Bekas · noda permukaan terlihat', photos: [photo('/images/catalogue/batu-coffee.webp', 'Meja Batu kayu dengan top tebal dan kaki gelap', 'Tampak tiga perempat')],
    model: true, modelType: 'batu', available: true, asset: { modelUrl: '/assets/batu.glb', manifestUrl: '/assets/batu-manifest.json', reportUrl: '/assets/batu-report.json' }, capabilities: { articulation: false, conditions: false, room: true, capture: false }, features: ['Top walnut', 'Rak bawah', 'Model 3D interaktif'], created: '2026-09-21T08:00:00Z',
    seller: { name: 'Atelier Batu', note: 'Contoh penjual terkurasi' }
  },
  {
    id: 'rimba', title: 'Sideboard Rimba', category: 'Penyimpanan', price: 3150000, location: 'Jakarta Barat',
    material: 'Panel hijau sage dengan kaki kayu gelap', dimensions: { width: 132, depth: 42, height: 88 },
    description: 'Sideboard ringkas dengan dua pintu dan kaki tinggi. Lihat ruang simpan, arah bukaan, serta jarak dari dinding sebelum memilih tempatnya.',
    condition: 'Bekas · warna tidak sepenuhnya seragam', photos: [photo('/images/catalogue/rimba-sideboard.webp', 'Sideboard Rimba hijau sage dengan kaki kayu', 'Tampak depan tiga perempat')],
    model: true, modelType: 'rimba', available: true, asset: { modelUrl: '/assets/rimba.glb', manifestUrl: '/assets/rimba-manifest.json', reportUrl: '/assets/rimba-report.json' }, capabilities: { articulation: true, conditions: false, room: true, capture: false }, features: ['Dua pintu', 'Kaki tinggi', 'Model 3D interaktif'], created: '2026-09-25T08:00:00Z',
    seller: { name: 'Rimba Objects', note: 'Contoh penjual terkurasi' }
  }
];

export const COMING_SOON_LISTINGS = [
  { id: 'lino', title: 'Sofa Lino', category: 'Sofa', location: 'Segera hadir', price: null, available: false, model: false, modelType: 'lino', image: '/images/catalogue/lino-sofa.webp', photos: [photo('/images/catalogue/lino-sofa.webp', 'Sofa Lino berlapis kain terang', 'Referensi bentuk')], alt: 'Sofa Lino berlapis kain terang', description: 'Koleksi sofa dengan detail kondisi dan model 3D yang sedang disiapkan.' },
  { id: 'nara', title: 'Lounge Nara', category: 'Lounge', location: 'Segera hadir', price: null, available: false, model: false, modelType: 'nara', image: '/images/catalogue/nara-lounge.webp', photos: [photo('/images/catalogue/nara-lounge.webp', 'Lounge Nara dengan bantalan rendah', 'Referensi bentuk')], alt: 'Lounge Nara dengan bantalan rendah', description: 'Koleksi lounge dengan detail kondisi dan model 3D yang sedang disiapkan.' }
];

export const LISTINGS = AVAILABLE_LISTINGS;
export const MARKETPLACE_PLACEHOLDERS = COMING_SOON_LISTINGS;
export const ALL_LISTINGS = [...AVAILABLE_LISTINGS, ...COMING_SOON_LISTINGS];

export function getListing(id) { return ALL_LISTINGS.find(listing => listing.id === id); }

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
export function formatPrice(number) { return number == null ? 'Segera hadir' : rupiah.format(number).replace(/\u00a0/g, ' '); }
const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id-ID').trim();
function priceLimit(value, fallback) { if (value === '' || value == null) return fallback; const number = Number(value); return Number.isFinite(number) ? number : fallback; }
export function filterListings({ query = '', category = '', sort = 'relevance', minPrice, maxPrice, includeComingSoon = false } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean), selectedCategory = normalize(category), minimum = priceLimit(minPrice, -Infinity), maximum = priceLimit(maxPrice, Infinity);
  const source = includeComingSoon ? ALL_LISTINGS : AVAILABLE_LISTINGS;
  const results = source.filter(listing => {
    if (selectedCategory && !['semua', 'all'].includes(selectedCategory) && normalize(listing.category) !== selectedCategory) return false;
    if (listing.price != null && (listing.price < minimum || listing.price > maximum)) return false;
    const searchable = normalize([listing.title, listing.category, listing.material, listing.location, listing.description, ...(listing.features || [])].join(' '));
    return terms.every(term => searchable.includes(term));
  });
  if (['price-asc', 'cheapest'].includes(sort)) results.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  else if (['price-desc', 'priciest'].includes(sort)) results.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  else if (sort === 'newest') results.sort((a, b) => Date.parse(b.created || 0) - Date.parse(a.created || 0));
  return results;
}
