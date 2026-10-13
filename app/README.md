# LihatDulu V5.1

LihatDulu adalah konsep marketplace furnitur bekas yang membantu orang melihat bentuk, kondisi, ukuran, dan konteks ruang sebelum memilih. Antarmuka publik memakai Bahasa Indonesia dan seluruh produk pada katalog adalah contoh terkurasi, bukan inventaris live.

## Produk dan alur

- `/` membuka pilihan pembeli atau penjual.
- `/beli` menampilkan empat listing aktif: Lemari Sora, Kursi Arca, Meja Batu, dan Sideboard Rimba. Dua preview coming soon tersedia untuk Sofa Lino dan Lounge Nara.
- Setiap listing aktif memiliki halaman sendiri, gallery, dimensi, seller example, aksi simpan, cart, dan model GLB yang sesuai.
- Sora mempertahankan artikulasi pintu dan laci, tiga catatan kondisi, room clearance, serta prepared capture seller.
- Arca, Batu, dan Rimba memiliki GLB terpisah, manifest per produk, geometri dengan satuan meter, dan kemampuan room placement. Rimba juga memiliki bukaan pintu yang benar-benar terpisah.
- `/cari-dari-foto` adalah alur visual search yang sudah disiapkan. Foto kursi contoh dan hasilnya bersifat prepared, tanpa kamera, mikrofon, file upload, atau permission API.
- `/keranjang` dan `/checkout/:id` berhenti pada editable review. Tidak ada pembayaran, reservasi, atau order yang dikirim.
- `/jual`, `/buat`, dan `/barang-saya` membuka prepared Sora capture workspace. Alur ini mempertahankan draft capture tanpa menghapus favourites, cart, atau data lain.

## Menjalankan lokal

Gunakan Node.js 24 atau lebih baru.

```bash
npm ci
npm run dev
```

```bash
npm run build
npm test
npm run test:production
node scripts/check-products.mjs
```

## Deploy ke Vercel

Jika repository tetap menggunakan struktur ini, atur **Root Directory** proyek Vercel ke `app`.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

`vercel.json` di folder ini sudah menyediakan SPA rewrite. Jangan menjalankan `vite build` dari parent repository, karena `package.json` dan dependency Vite berada di `app/`.

## Asset dan reproducibility

- `public/assets/cabinet.glb` adalah model Sora yang dipertahankan dari baseline.
- `public/assets/arca.glb`, `batu.glb`, dan `rimba.glb` adalah GLB prosedural baru dengan manifest dan report masing-masing.
- `scripts/generate-product-assets.mjs` membangun GLB tambahan dari geometri Three.js yang memiliki unit meter dan koordinat Y up.
- `public/brand/` menyimpan SVG logo, lockup, favicon, concept board, dan sumber konstruksi.
- `src/brand-tokens.css` menjadi sumber token runtime yang dibagikan dengan brand guideline.
- `../deliverables/brand/` berisi PPTX editable dan PDF hasil export yang cocok dengan sistem merek runtime.

## Batasan yang dinyatakan

Produk, seller, harga, dimensi, kondisi, foto, room result, dan delivery fee adalah contoh authored untuk eksplorasi. Model 3D adalah authored mesh, bukan Gaussian-splat reconstruction. Batas ukuran bukan jaminan furnitur akan muat pada ruang nyata. Capture dan visual search menunjukkan prepared experience tanpa mengakses media pengguna.
