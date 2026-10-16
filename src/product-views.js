import "./product-views.css";
import {
  AVAILABLE_LISTINGS,
  formatPrice,
  getSeller,
  sellerListings,
  relatedListings,
  furnitureGroup,
} from "./catalogue.js";
import {
  getListing,
  readMarketState,
  cartEligible,
  checkoutTotals,
} from "./market-state.js";
import { esc, icon, link, button, image } from "./components.js";
import { renderInspection } from "./inspection.js";
import {
  readVideoState,
  videoCoverage,
  PREPARED_AREAS,
} from "./video-state.js";
import {
  WEAR_NOTES,
  conditionNotes,
  galleryMedia,
  mediaCounts,
} from "./product-media.js";
import { renderOfferStatus, renderPriceBreakdown } from "./buyer-views.js";

const cm = (value) =>
  Number(value).toLocaleString("id-ID", { maximumFractionDigits: 1 });
const dimensions = (item) =>
  item.dimensions
    ? ["width", "depth", "height"]
        .map((key) => cm(item.dimensions[key]))
        .join(" × ") + " cm"
    : "Belum dicantumkan";
const sourceLabel = (media) =>
  media.kind === "condition"
    ? "Detail kondisi contoh"
    : media.kind === "render"
      ? "Render model tersimpan"
      : "Foto produk contoh";
const groupTitle = (item) =>
  furnitureGroup(item) === "seating"
    ? "Pilihan tempat duduk lain"
    : furnitureGroup(item) === "tables"
      ? "Pilihan meja lain"
      : "Pilihan penyimpanan lain";

// UI state and surrounding surfaces are supplied by the application controller.
export function createProductViews({
  shell,
  card,
  saved = () => [],
  compared = () => [],
  galleryPositions = new Map(),
  missing,
  search = () => globalThis.location?.search || "",
}) {
  const catalogue = () =>
    AVAILABLE_LISTINGS.map((item) => getListing(item.id)).filter(Boolean);
  const query = () => new URLSearchParams(search());
  const productPath = (item, tab, preview = false) =>
    `/barang/${item.id}?${preview ? "preview=1&" : ""}tab=${tab}`;

  function gallery(item) {
    const media = galleryMedia(item);
    if (!media.length)
      return '<div class="empty-state"><p>Gambar belum dicantumkan. Fakta barang tetap tersedia.</p></div>';
    const requested = Number(galleryPositions.get(item.id)) || 0;
    const index = Math.max(0, Math.min(requested, media.length - 1));
    const entry = media[index];
    return `<section class="photo-gallery" data-gallery-id="${item.id}" aria-label="Gambar ${esc(item.title)}">
      <div class="gallery-main">${image(entry, "", true)}
        ${button(icon("search") + " Perbesar gambar", "enlarge-photo", "gallery-enlarge", `data-id="${item.id}"`)}
        <span class="badge gallery-counter">${index + 1} / ${media.length}</span>
        ${media.length > 1 ? button(icon("back"), "photo-prev", "icon-button gallery-prev", `data-id="${item.id}" aria-label="Gambar sebelumnya"`) + button(icon("arrow"), "photo-next", "icon-button gallery-next", `data-id="${item.id}" aria-label="Gambar berikutnya"`) : ""}
      </div><div class="gallery-caption-line"><p class="gallery-caption" aria-live="polite">${esc(entry.caption)}</p><span class="media-source-label">${sourceLabel(entry)}</span></div>
      ${media.length > 1 ? `<div class="gallery-thumbs" aria-label="Pilih gambar">${media.map((photo, number) => button(image(photo), "photo", "gallery-thumb " + (number === index ? "selected" : ""), `data-id="${item.id}" data-index="${number}" aria-label="${esc(photo.caption)}" aria-pressed="${number === index}"`)).join("")}</div>` : '<p class="single-photo-note">1 foto tersedia. Gambar belakang, bagian dalam, dan foto dekat kondisi belum tersedia dalam contoh ini.</p>'}
    </section>`;
  }

  function evidencePreview(item) {
    const notes = conditionNotes(item);
    if (!notes.length)
      return `<section class="purchase-evidence"><h2>Kondisi yang diketahui</h2><p>${esc(item.condition.replace(/^Bekas\s*·\s*/, ""))}</p><small>Gambar dekat kondisi belum tersedia dalam contoh ini.</small></section>`;
    return `<details class="purchase-evidence purchase-evidence-details"><summary><span>${notes.length} catatan kondisi dengan gambar</span>${icon("arrow")}</summary><div class="condition-preview-list">${notes.map((note) => button(`<span><strong>${esc(note.title)}</strong><small>${esc(note.size)}</small></span>${icon("arrow")}`, "condition", "condition-preview", `data-id="${note.id}" aria-label="Lihat ${esc(note.title)}, ${esc(note.size)}"`)).join("")}</div><small>Catatan contoh, bukan sertifikasi kondisi.</small></details>`;
  }

  function purchase(item, preview = false) {
    const market = readMarketState(),
      carted = market.cart.includes(item.id),
      eligible = cartEligible(item.id);
    return `<aside class="purchase-panel" aria-label="Pilihan untuk ${esc(item.title)}">
      ${!eligible ? '<p class="unavailable-notice" role="status">Barang ini sedang tidak tersedia untuk ditambahkan ke keranjang.</p>' : ""}
      ${evidencePreview(item)}
      <div class="product-facts"><div>${icon("cube")}<span>Material<strong>${esc(item.material)}</strong></span></div></div>
      <fieldset class="fulfilment-choice"><legend>Pengambilan / pengiriman</legend>${[
        ["pickup", "Ambil sendiri", "Tanpa biaya kirim"],
        ["delivery", "Pengiriman contoh", "Rp 150.000 per penjual"],
      ]
        .map(
          ([value, title, note]) =>
            `<label><input type="radio" name="fulfilment" value="${value}" ${market.checkout.delivery === value ? "checked" : ""} ${preview ? "disabled" : ""}><span><strong>${title}</strong><small>${note}</small></span>${icon(value === "pickup" ? "pin" : "truck")}</label>`,
        )
        .join("")}</fieldset>
      <div data-product-costs>${renderPriceBreakdown(item, market.checkout.delivery)}</div>
      ${preview ? '<p class="commerce-note">Pratinjau lokal. Keranjang dan penawaran dinonaktifkan.</p>' : `<div class="purchase-actions">${button(icon("bag") + (carted ? "Di keranjang" : "Tambahkan ke keranjang"), "add-cart", "button", `data-id="${item.id}" ${!eligible ? "disabled" : ""}`)}</div><div data-product-offer>${renderOfferStatus(item)}</div>`}
      ${carted && !preview ? `<div class="product-cart-confirmation">${icon("check")}<span>1 unit ada di keranjang.</span>${link("/keranjang", "Lihat keranjang " + icon("arrow"), "text-link")}</div>` : ""}
      <div class="product-secondary">${button(icon("heart") + (saved().includes(item.id) ? "Tersimpan" : "Simpan"), "save", "text-button", `data-id="${item.id}" aria-label="${saved().includes(item.id) ? "Hapus" : "Simpan"} ${esc(item.title)}" aria-pressed="${saved().includes(item.id)}"`)}${button(icon("compare") + (compared().includes(item.id) ? "Dipilih" : "Bandingkan"), "compare", "text-button", `data-id="${item.id}" aria-pressed="${compared().includes(item.id)}"`)}</div>
      <div class="seller-mini"><span class="seller-avatar" aria-hidden="true">${esc(item.seller.name[0])}</span><span><strong>${link("/toko/" + item.seller.id, esc(item.seller.name))}</strong><small>${esc(item.location)} · Contoh penjual</small></span>${link("/toko/" + item.seller.id, icon("arrow"), "icon-button", 'aria-label="Lihat koleksi ' + esc(item.seller.name) + '"')}</div>
      <p class="commerce-note">Data barang, penjual, dan biaya adalah contoh. Pilihan disimpan lokal; tidak ada pesanan, pembayaran, atau kontak penjual.</p>
    </aside>`;
  }

  function conditionsSection(item) {
    const notes = conditionNotes(item);
    return `<section class="condition-section" id="catatan-kondisi"><div class="section-heading"><div><span class="eyebrow">KONDISI & PEMAKAIAN</span><h2>${notes.length ? "Perhatikan tiga bagian ini." : "Catatan kondisi barang."}</h2></div><span>${notes.length ? `${notes.length} catatan unik dengan gambar` : "Catatan katalog contoh"}</span></div>${notes.length ? `<div class="condition-grid">${notes.map((note, index) => button(`${image({ src: note.image, alt: `${note.title}, ${note.where.toLocaleLowerCase("id-ID")}`, width: note.width, height: note.height })}<div><span class="eyebrow">CATATAN ${index + 1} · ${esc(note.size)}</span><h3>${esc(note.title)}</h3><p>${esc(note.where)}</p><span class="text-link">Lihat detail ${icon("arrow")}</span></div>`, "condition", "condition-card", `data-id="${note.id}"`)).join("")}</div>` : `<div class="condition-summary"><strong>${esc(item.condition)}</strong><p>Gambar dekat kondisi belum tersedia dalam contoh ini.</p><small>${item.model ? "Gambar galeri merupakan render model tersimpan." : "Satu foto produk contoh tersedia."} Catatan ini bukan hasil inspeksi fisik.</small></div>`}</section>`;
  }

  function relatedSection(item, { store = false } = {}) {
    const alternatives = relatedListings(item, catalogue()).filter(
      (candidate) => !store || candidate.seller.id !== item.seller.id,
    );
    if (!alternatives.length) return "";
    return `<section class="related-section"><div class="section-heading"><div><span class="eyebrow">${store ? "DARI PENJUAL LAIN" : "BANDINGKAN PILIHAN"}</span><h2>${groupTitle(item)}</h2><p>Jenis yang sama lebih dulu, lalu kelompok furnitur dan harga terdekat.</p></div>${link("/beli", "Lihat koleksi " + icon("arrow"), "text-link")}</div><div class="product-grid related-grid">${alternatives.map(card).join("")}</div></section>`;
  }

  function productPage(id) {
    const item = getListing(id);
    if (!item) return missing();
    if (!item.available && item.price == null)
      return shell(
        `<div class="breadcrumb">${link("/beli", "Koleksi")} / ${esc(item.title)}</div><div class="coming-product"><div>${gallery(item)}</div><div class="coming-purchase"><span class="eyebrow">KOLEKSI BERIKUTNYA</span><h1>${esc(item.title)}</h1><p>${esc(item.description)}</p><p>Harga, kondisi lengkap, dan model belum tersedia.</p>${button("Simpan minat", "remind", "button", `data-id="${item.id}"`)}${link("/beli", "Kembali ke koleksi", "text-link")}</div></div>`,
        "product-page",
      );
    const params = query(),
      preview = item.id === "sora" && params.get("preview") === "1";
    const requested = params.get("tab"),
      tab =
        item.model && ["model", "room", "condition"].includes(requested)
          ? requested
          : "photos";
    const progress = preview ? videoCoverage(readVideoState()) : null,
      counts = mediaCounts(item);
    return shell(
      `<div class="breadcrumb">${link("/beli", "Koleksi")}<span>/</span>${link("/beli?categories=" + encodeURIComponent(item.category), esc(item.category))}<span>/</span>${esc(item.title)}</div>
      ${preview ? `<div class="preview-notice"><div><strong>Pratinjau pembeli lokal</strong><span>${progress.count} / 6 kelompok bukti penjual dipilih. ${progress.complete ? "Semua bagian contoh dipilih." : "Bukti masih sebagian."}</span></div>${link("/jual/sora/tinjau", "Kembali ke tinjauan " + icon("arrow"), "button secondary")}</div><section class="preview-coverage" aria-label="Kelompok bukti penjual pada pratinjau"><h2>${progress.count} dari 6 kelompok bukti penjual</h2><p>Terpisah dari ${counts.gallery} gambar galeri dan ${counts.condition} catatan kondisi.</p><div>${PREPARED_AREAS.map((area) => `<a href="/jual/sora/rekam?area=${area.id}" data-nav class="preview-evidence ${progress.selected.includes(area.id) ? "is-selected" : ""}">${image({ src: area.image, alt: `Acuan ${area.title.toLocaleLowerCase("id-ID")} Sora` })}<span><strong>${esc(area.title)}</strong><small>${progress.selected.includes(area.id) ? "Dipilih" : "Belum dipilih"}</small></span>${icon(progress.selected.includes(area.id) ? "check" : "camera")}</a>`).join("")}</div></section>` : ""}
      <header class="product-identity"><div><span class="eyebrow">${esc(item.category)} · 1 unit contoh</span><h1>${esc(item.title)}</h1><p>${esc(item.condition)}</p></div><div class="product-identity-price"><strong>${formatPrice(item.price)}</strong><span>${icon("pin")}${esc(item.location)}</span></div><div class="product-identity-facts"><span>${icon("ruler")}${dimensions(item)} · L × D × T, tertutup</span><span>${item.model ? icon("cube") + "Model 3D tersedia" : icon("camera") + "1 foto produk"}</span></div></header>
      <div class="product-layout"><div class="product-media"><nav class="media-tabs" aria-label="Pilihan media">${link(productPath(item, "photos", preview), icon("camera") + ` ${item.model ? "Gambar" : "Foto"} (${counts.gallery})`, tab === "photos" ? "selected" : "", tab === "photos" ? 'aria-current="page"' : "")}${item.model ? link(productPath(item, "model", preview), icon("cube") + " Putar 3D", ["model", "condition"].includes(tab) ? "selected" : "", ["model", "condition"].includes(tab) ? 'aria-current="page"' : "") : ""}${item.capabilities?.room ? link(productPath(item, "room", preview), icon("room") + " Coba di ruang", tab === "room" ? "selected" : "", tab === "room" ? 'aria-current="page"' : "") : ""}</nav>
      ${tab === "photos" ? gallery(item) : renderInspection(tab, item, { preview })}
      <div class="media-help">${icon("info")}<p>${tab === "photos" ? (item.model ? `${counts.gallery} gambar: ${counts.gallery - counts.condition} render dari model tersimpan${counts.condition ? ` dan ${counts.condition} detail kondisi contoh` : ""}. Render tidak membuktikan kondisi fisik barang.` : "Foto dan fakta produk merupakan data contoh. Belum ada foto dekat kondisi.") : tab === "room" ? "Ruangan adalah simulasi ukuran. Ukur ruang dan akses di lokasi aslimu." : "Model tersimpan dapat diputar. Gambar kondisi tetap tersedia jika 3D tidak bisa dimuat."}</p></div></div>${purchase(item, preview)}</div>
      ${conditionsSection(item)}<section class="product-description product-detail-description"><span class="eyebrow">TENTANG BARANG</span><h2>Ukuran, fungsi, dan yang disertakan.</h2><p>${esc(item.description)}</p><div class="product-detail-grid"><div><h3>Ukuran & ruang</h3><p>${dimensions(item)} (L × D × T), dalam keadaan tertutup. Ukuran akses masuk belum dicantumkan.</p></div><div><h3>Yang disertakan</h3><ul>${(
        item.features || []
      )
        .filter(
          (feature) =>
            !/model 3d|contoh berbasis|detail pemakaian/i.test(feature),
        )
        .map((feature) => `<li>${esc(feature)}</li>`)
        .join(
          "",
        )}</ul><small>Informasi pembongkaran dan akses lantai belum dicantumkan.</small></div></div></section>${relatedSection(item)}
      ${!preview ? `<div class="mobile-buy-bar"><div><small>Total ${readMarketState().checkout.delivery === "delivery" ? "pengiriman" : "ambil sendiri"} contoh</small><strong data-mobile-product-total>${formatPrice(checkoutTotals([item.id], readMarketState().checkout).total)}</strong></div>${button(icon("bag") + (readMarketState().cart.includes(item.id) ? "Di keranjang" : "Keranjang"), "add-cart", "button", `data-id="${item.id}" ${!cartEligible(item.id) ? "disabled" : ""}`)}</div>` : ""}`,
      "product-page refined-product-page",
    );
  }

  function conditionDetail(id) {
    const note = WEAR_NOTES.find((entry) => entry.id === id);
    if (!note) return "";
    return `<div class="condition-dialog">${image({ src: note.image, alt: `${note.title}, ${note.where.toLocaleLowerCase("id-ID")}`, width: note.width, height: note.height }, "", true)}<div><span class="eyebrow">CATATAN KONDISI · LEMARI SORA</span><h2 id="condition-dialog-title">${esc(note.title)}</h2><dl><div><dt>Lokasi</dt><dd>${esc(note.where)}</dd></div><div><dt>Ukuran</dt><dd>${esc(note.size)}</dd></div></dl><p>${esc(note.note)}</p><small>Gambar kondisi contoh. Terpisah dari kelompok bukti penjual dan render galeri.</small>${button("Lihat letak pada model " + icon("cube"), "focus-condition", "button", `data-id="${id}"`)}${button("Kembali ke barang", "close-modal", "button secondary")}</div></div>`;
  }

  function storePage(id) {
    const seller = getSeller(id, catalogue());
    if (!seller) return missing();
    const items = sellerListings(seller.id, catalogue());
    const representative =
      items[0] || catalogue().find((item) => item.seller.id === seller.id);
    return shell(
      `<div class="breadcrumb">${link("/beli", "Koleksi furnitur")}<span>/</span>${esc(seller.name)}</div><div class="store-heading"><span class="seller-avatar" aria-hidden="true">${esc(seller.name[0])}</span><div><span class="eyebrow">KOLEKSI PENJUAL CONTOH</span><h1>${esc(seller.name)}</h1><p>${icon("pin")}${esc(seller.city || representative?.location || "Lokasi belum dicantumkan")}</p></div></div><div class="store-inventory-heading"><div><h2>${items.length} furnitur tersedia dalam contoh ini</h2><p>Setiap barang ditawarkan sebagai satu unit.</p></div><span class="badge">${esc(seller.note || "Contoh penjual")}</span></div>${items.length ? `<div class="product-grid store-inventory">${items.map(card).join("")}</div>` : '<div class="empty-state"><h2>Belum ada barang tersedia</h2><p>Identitas penjual tetap tersedia melalui tautan ini.</p></div>'}<aside class="store-known"><h2>Informasi yang tersedia</h2><p>${esc(seller.name)} · ${esc(seller.city || representative?.location || "Lokasi belum dicantumkan")}.</p><p>Pilihan contoh: ambil sendiri atau pengiriman. Biaya terlihat di halaman barang dan keranjang.</p><small>Profil dan barang adalah data contoh. Belum ada data ulasan transaksi atau layanan penjual.</small></aside>${representative ? relatedSection(representative, { store: true }) : ""}`,
      "store-page refined-store-page",
    );
  }

  return {
    productPage,
    storePage,
    gallery,
    purchase,
    conditionDetail,
    wearNotes: WEAR_NOTES,
  };
}
export { WEAR_NOTES as wearNotes };
