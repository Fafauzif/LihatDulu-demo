// Authored furniture examples illustrated by a single product photograph.
// Dimensions, asking prices and condition notes are example inventory data.
// These records do not claim a captured model, reputation or inspected evidence.
const photo = (id, alt) => ({ src: `/images/examples/${id}.webp`, alt, caption: 'Foto contoh produk' });
const capabilities = () => ({ articulation: false, conditions: false, room: false, capture: false });

export const EXTRA_LISTINGS = [
  {
    id: 'awan', title: 'Sofa Awan', category: 'Sofa', price: 2850000, location: 'Jakarta Selatan',
    material: 'Pelapis kain krem dengan bantalan duduk dan sandaran', materialGroup: 'Kain',
    dimensions: { width: 180, depth: 82, height: 78 },
    description: 'Sofa kain krem dengan dua bantalan duduk dan dua bantal lepas. Bentuknya sederhana untuk ruang tamu; periksa ukuran contoh dan foto sebelum menimbang kebutuhan ruangmu.',
    condition: 'Bekas · kain terawat, lipatan pada bantalan', conditionGroup: 'Terawat',
    photos: [photo('awan', 'Sofa Awan berlapis kain krem dengan dua bantalan duduk dan dua bantal lepas')],
    available: true, model: false, capabilities: capabilities(),
    features: ['Pelapis kain', 'Dua bantal lepas', 'Contoh berbasis foto'],
    seller: { name: 'Rumah Awan', note: 'Contoh penjual' }, created: '2026-10-06T08:00:00Z'
  },
  {
    id: 'tala', title: 'Kursi Tala', category: 'Kursi', price: 950000, location: 'Bandung',
    material: 'Rangka dan anyaman rotan dengan bantalan duduk kain putih', materialGroup: 'Rotan',
    dimensions: { width: 58, depth: 63, height: 84 },
    description: 'Kursi rotan warna madu dengan lengan melengkung dan bantalan duduk putih. Anyaman terbuka memberi bentuk yang ringan untuk sudut baca atau ruang keluarga.',
    condition: 'Bekas · perubahan warna ringan pada rotan', conditionGroup: 'Pemakaian ringan',
    photos: [photo('tala', 'Kursi Tala dari rotan warna madu dengan anyaman terbuka dan bantalan duduk putih')],
    available: true, model: false, capabilities: capabilities(),
    features: ['Anyaman rotan', 'Bantalan duduk', 'Contoh berbasis foto'],
    seller: { name: 'Tala Living', note: 'Contoh penjual' }, created: '2026-10-04T08:00:00Z'
  },
  {
    id: 'loka', title: 'Meja Loka', category: 'Meja', price: 1650000, location: 'Yogyakarta',
    material: 'Kayu warna cokelat hangat dengan pegangan laci logam', materialGroup: 'Kayu',
    dimensions: { width: 120, depth: 60, height: 75 },
    description: 'Meja tulis kayu dengan dua laci, pegangan logam, dan empat kaki lurus. Bidang kerja dan penyimpanan kecilnya cocok untuk kebutuhan belajar atau kerja di rumah.',
    condition: 'Bekas · goresan ringan pada bidang kerja', conditionGroup: 'Pemakaian ringan',
    photos: [photo('loka', 'Meja Loka dari kayu cokelat dengan dua laci, pegangan logam, dan kaki lurus')],
    available: true, model: false, capabilities: capabilities(),
    features: ['Dua laci', 'Bidang kerja kayu', 'Contoh berbasis foto'],
    seller: { name: 'Loka Studio', note: 'Contoh penjual' }, created: '2026-10-02T08:00:00Z'
  },
  {
    id: 'nusa', title: 'Rak Nusa', category: 'Penyimpanan', price: 1380000, location: 'Jakarta Barat',
    material: 'Kayu oak warna alami', materialGroup: 'Kayu',
    dimensions: { width: 80, depth: 30, height: 160 },
    description: 'Rak buku kayu tinggi dengan lima ambalan dalam dan enam kompartemen terbuka. Bentuk tegaknya menyediakan tempat untuk buku serta benda pajangan tanpa pintu.',
    condition: 'Bekas · rak terawat, jejak pemakaian pada ambalan', conditionGroup: 'Terawat',
    photos: [photo('nusa', 'Rak Nusa dari kayu oak alami dengan enam kompartemen terbuka')],
    available: true, model: false, capabilities: capabilities(),
    features: ['Enam kompartemen', 'Rak terbuka', 'Contoh berbasis foto'],
    seller: { name: 'Nusa Rumah', note: 'Contoh penjual' }, created: '2026-09-30T08:00:00Z'
  },
  {
    id: 'senja', title: 'Kursi Senja', category: 'Lounge', price: 1750000, location: 'Surabaya',
    material: 'Pelapis kain krem keabu-abuan dengan kaki kayu', materialGroup: 'Kain',
    dimensions: { width: 72, depth: 80, height: 86 },
    description: 'Kursi lounge berlapis kain dengan sandaran membulat, lengan menyatu, dan kaki kayu. Proporsi duduk santainya dapat menjadi titik baca di ruang keluarga.',
    condition: 'Bekas · noda kecil pada pelapis', conditionGroup: 'Detail pemakaian',
    photos: [photo('senja', 'Kursi Senja berlapis kain krem keabu-abuan dengan sandaran membulat dan kaki kayu')],
    available: true, model: false, capabilities: capabilities(),
    features: ['Dudukan berlapis kain', 'Kaki kayu', 'Contoh berbasis foto'],
    seller: { name: 'Sudut Senja', note: 'Contoh penjual' }, created: '2026-09-28T08:00:00Z'
  },
  {
    id: 'ruji', title: 'Bangku Ruji', category: 'Bangku', price: 780000, location: 'Bandung',
    material: 'Kayu warna alami dengan dudukan bilah', materialGroup: 'Kayu',
    dimensions: { width: 100, depth: 35, height: 45 },
    description: 'Bangku kayu dengan dudukan bilah dan penghubung kaki di bagian bawah. Bentuk memanjangnya dapat dipakai sebagai dudukan singkat di ruang masuk atau dekat meja makan.',
    condition: 'Bekas · goresan ringan pada dudukan', conditionGroup: 'Pemakaian ringan',
    photos: [photo('ruji', 'Bangku Ruji dari kayu alami dengan dudukan bilah dan penghubung kaki bawah')],
    available: true, model: false, capabilities: capabilities(),
    features: ['Dudukan bilah kayu', 'Tanpa sandaran', 'Contoh berbasis foto'],
    seller: { name: 'Ruji Objects', note: 'Contoh penjual' }, created: '2026-09-26T08:00:00Z'
  }
];
