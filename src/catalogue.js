// Authored showcase inventory. These values do not represent live stock or sellers.
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
  },
  {
    id: 'arca',
    title: 'Kursi Arca',
    category: 'Kursi',
    price: 875000,
    location: 'Bandung',
    material: 'Kayu oak dan anyaman tali',
    dimensions: { width: 47, depth: 52, height: 80 },
    description: 'Kursi makan dengan sandaran melengkung dan dudukan anyaman bernuansa natural. Bentuknya ringan untuk meja makan kecil maupun sudut kerja yang hangat.',
    condition: 'Sangat baik',
    photos: [
      { src: '/images/catalogue/arca-chair.webp', alt: 'Kursi Arca berbahan oak terang dengan sandaran melengkung dan dudukan anyaman krem', caption: 'Bentuk dan tekstur kursi Arca' }
    ],
    model: false,
    features: ['Sandaran melengkung', 'Dudukan anyaman', 'Warna natural'],
    created: '2026-09-05T08:00:00Z'
  },
  {
    id: 'nara',
    title: 'Kursi Santai Nara',
    category: 'Kursi',
    price: 3200000,
    location: 'Jakarta Pusat',
    material: 'Kayu walnut dan kulit warna cognac',
    dimensions: { width: 78, depth: 84, height: 78 },
    description: 'Kursi santai berbingkai walnut dengan bantalan kulit cognac yang lebar. Sandaran rendah dan lengan kayu membentuk sudut baca yang nyaman dengan karakter klasik.',
    condition: 'Baik',
    photos: [
      { src: '/images/catalogue/nara-lounge.webp', alt: 'Kursi santai Nara dengan rangka walnut gelap dan bantalan kulit cognac', caption: 'Rangka walnut dan bantalan kulit Nara' }
    ],
    model: false,
    features: ['Bantalan kulit', 'Lengan kayu', 'Dudukan lebar'],
    created: '2026-09-04T08:00:00Z'
  },
  {
    id: 'rimba',
    title: 'Sideboard Rimba',
    category: 'Lemari',
    price: 4100000,
    location: 'Tangerang Selatan',
    material: 'Kayu walnut dan kaki metal',
    dimensions: { width: 160, depth: 42, height: 75 },
    description: 'Penyimpanan rendah dengan tiga pintu dan detail alur vertikal pada kedua sisinya. Serat walnut dan kaki metal ramping memberi ruang keluarga tampilan yang tenang.',
    condition: 'Sangat baik',
    photos: [
      { src: '/images/catalogue/rimba-sideboard.webp', alt: 'Sideboard Rimba walnut tiga pintu dengan tekstur alur vertikal dan kaki metal hitam', caption: 'Tiga pintu dan detail alur Rimba' }
    ],
    model: false,
    features: ['Tiga pintu', 'Detail alur vertikal', 'Kaki metal'],
    created: '2026-09-03T08:00:00Z'
  },
  {
    id: 'batu',
    title: 'Meja Kopi Batu',
    category: 'Meja',
    price: 1950000,
    location: 'Yogyakarta',
    material: 'Batu travertine krem',
    dimensions: { width: 110, depth: 60, height: 38 },
    description: 'Meja kopi oval dengan permukaan travertine krem dan dua kaki berbentuk silinder. Tekstur batu yang halus memberi titik fokus yang lembut di depan sofa.',
    condition: 'Baik',
    photos: [
      { src: '/images/catalogue/batu-coffee.webp', alt: 'Meja kopi Batu berbentuk oval dari travertine krem dengan dua kaki silinder', caption: 'Bentuk oval dan tekstur travertine Batu' }
    ],
    model: false,
    features: ['Permukaan oval', 'Dua kaki silinder', 'Tekstur batu natural'],
    created: '2026-09-02T08:00:00Z'
  },
  {
    id: 'lino',
    title: 'Sofa Lino',
    category: 'Sofa',
    price: 3850000,
    location: 'Surabaya',
    material: 'Kain linen oatmeal dan kaki walnut',
    dimensions: { width: 180, depth: 86, height: 80 },
    description: 'Sofa dua dudukan dengan pelapis linen oatmeal dan lengan membulat. Ukuran ringkas, bantalan terpisah, serta warna netral membuatnya mudah dipadukan di ruang keluarga.',
    condition: 'Sangat baik',
    photos: [
      { src: '/images/catalogue/lino-sofa.webp', alt: 'Sofa Lino dua dudukan berlapis linen oatmeal dengan lengan membulat dan kaki walnut', caption: 'Sofa dua dudukan Lino' }
    ],
    model: false,
    features: ['Dua dudukan', 'Pelapis linen', 'Lengan membulat'],
    created: '2026-09-01T08:00:00Z'
  }
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
