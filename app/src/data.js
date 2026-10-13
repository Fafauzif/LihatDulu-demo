export const views = [
 ['front','Depan','capture-front'],['left','Sisi kiri','capture-left'],['right','Sisi kanan','capture-right'],['rear','Belakang','capture-rear'],['top','Permukaan atas','capture-top'],['interior','Bagian dalam','capture-interior'],['drawer','Laci','capture-drawer'],['rear-lower','Belakang bawah','capture-rear'],['underside','Bagian bawah','capture-underside']
].map(([id,label,image])=>({id,label,image}));
export const conditions = [
 {id:'scratch',title:'Goresan pada pintu kiri',short:'Goresan permukaan',location:'Pintu kiri',size:'11 cm',description:'Goresan memanjang terlihat pada permukaan pintu kiri. Periksa dari dekat sebelum memutuskan.',image:'wear-scratch'},
 {id:'chip',title:'Serpihan kecil di sudut kanan atas',short:'Serpihan pada sudut',location:'Sudut kanan atas',size:'8 × 5 × 1 mm',description:'Bagian kecil pada tepi kanan atas terkelupas. Detail tetap terlihat saat kamu memutar model.',image:'wear-chip'},
 {id:'mark',title:'Bekas lingkaran pada permukaan atas',short:'Bekas lingkaran',location:'Panel atas',size:'Ø 5,5 cm',description:'Bekas lingkaran samar pada bagian atas lemari. Perhatikan perubahan permukaan pada gambar detail.',image:'wear-mark'}
];
export const chapters = [
 {title:'Kenali barang',eyebrow:'Satu barang, dari segala sisi',text:'Putar lemari dan lihat bentuknya. Semua detail dalam demo berasal dari barang contoh yang sama.',tip:'Geser untuk memutar. Cubit atau gulir untuk mendekat.'},
 {title:'Periksa kondisi',eyebrow:'Detail kecil, keputusan lebih jelas',text:'Pilih salah satu dari tiga penanda. Kamera akan mendekat ke bagian yang perlu kamu lihat.',tip:'Penanda mengikuti bagian lemari, termasuk saat pintu dibuka.'},
 {title:'Buka penyimpanan',eyebrow:'Lihat sampai ke dalam',text:'Buka kedua pintu dan tarik laci. Periksa bagian yang tidak terlihat pada foto depan.',tip:'Pintu terbuka hingga 100°. Laci bergerak sejauh 30 cm.'},
 {title:'Pahami ukuran',eyebrow:'Bukan hanya lebar dan tinggi',text:'Ukuran saat tertutup sudah menyertakan handle. Pintu dan laci membutuhkan ruang tambahan saat dibuka.',tip:'90 cm lebar · 47,5 cm dalam · 120 cm tinggi.'},
 {title:'Periksa dokumentasi',eyebrow:'Yang belum terlihat juga berarti',text:'Lihat sisi belakang dan bawah. Area tanpa gambar belum memberi informasi tentang kondisinya.',tip:'Kamu bisa membandingkan cakupan 7 area dengan 9 area.'},
 {title:'Coba di ruang',eyebrow:'Cari posisi yang pas',text:'Ubah ukuran ruang, lalu geser dan putar lemari. Hasil penempatan mengikuti posisi yang kamu pilih.',tip:'Geser lemari di lantai atau gunakan kontrol posisi.'},
 {title:'Periksa ruang buka',eyebrow:'Muat belum tentu bisa dibuka',text:'Badan lemari bisa muat, sementara pintu atau lacinya terhalang. Coba penghalang, lalu geser lemari.',tip:'Tiga pemeriksaan terpisah: badan, pintu, dan laci.'}
];
export const icons = {
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 cube:'<path d="m12 3 9 5v8l-9 5-9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5"/>',
 report:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
 save:'<path d="M6 3h12v18l-6-4-6 4Z"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 4 4 10-10"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 room:'<path d="M3 21V6l9-3 9 3v15M3 16l9-3 9 3M12 3v10"/>',
 reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
 camera:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 1-3h6l1 3"/><circle cx="12" cy="13" r="4"/>',
 ruler:'<path d="m3 16 13-13 5 5L8 21Z M7 12l2 2m2-6 2 2m2-6 2 2"/>',
 link:'<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1"/>',
 person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 expand:'<path d="M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6"/>'
};
export const icon=(id,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]||icons.cube}</svg>`;
export const img=(name,alt,cls='')=>`<img src="/images/${name}.webp" alt="${alt}" class="${cls}" loading="lazy">`;
