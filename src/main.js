import "./brand-tokens.css";
import "./stitch.css";
import {
  AVAILABLE_LISTINGS,
  COMING_SOON_LISTINGS,
  formatPrice,
} from "./catalogue.js";
import {
  getListing,
  readMarketState,
  addCart,
  removeCart,
  checkoutTotals,
  setCheckout,
  saveCollection,
  deleteCollection,
  cartEligible,
  addToCollection,
  removeFromCollection,
  marketPersistenceStatus,
} from "./market-state.js";
import {
  parseFilters,
  serializeFilters,
  filterCatalogue,
  toggleCompare,
  comparisonRows,
  resetRefinements,
  activeGroupCount,
  filtersEqual,
  parentCollections,
  collectionSelections,
  parsePreparedReference,
  preparedReferencePath,
} from "./discovery.js";
import { mountInspection } from "./inspection.js";
import {
  renderVideoWorkspace,
  renderVideoCapture,
  renderVideoReview,
  mountVideoJourney,
} from "./video-capture.js";
import { esc, icon, link, button, image, brand } from "./components.js";
import { productCover, galleryMedia } from "./product-media.js";
import "./discovery-views.css";
import "./buyer-views.css";
import { createDiscoveryViews } from "./discovery-views.js";
import { createProductViews } from "./product-views.js";
import {
  getOfferDraft,
  saveOfferDraft,
  deleteOfferDraft,
  deleteSummarySnapshot,
  parseRupiahInput,
  undoBuyerDeletion,
  saveSummarySnapshot,
  buyerPersistenceStatus,
} from "./buyer-records.js";
import {
  renderOfferComposer,
  renderBuyerSaved,
  renderBuyerCart,
  renderSavedSummary,
} from "./buyer-views.js";

const app = document.querySelector("#app");
const modal = document.querySelector("#modal");
const SAVED_KEY = "lihatdulu:favourites:v2";
const COMPARE_KEY = "lihatdulu:compare:v1";
const memory = new Map();
const ephemeralKeys = new Set();
let persistence = "device-persistent";
function read(key, fallback) {
  if (ephemeralKeys.has(key)) return memory.get(key) ?? fallback;
  try {
    return JSON.parse(localStorage.getItem(key)) ?? memory.get(key) ?? fallback;
  } catch {
    return memory.get(key) ?? fallback;
  }
}
function write(key, value) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    ephemeralKeys.delete(key);
    persistence = "device-persistent";
  } catch {
    ephemeralKeys.add(key);
    persistence = "temporary-in-tab";
  }
  return persistence;
}
const eligibleIds = (value) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter((id) => AVAILABLE_LISTINGS.some((i) => i.id === id)),
        ),
      ].slice(0, 100)
    : [];
let saved = eligibleIds(read(SAVED_KEY, []));
let compared = eligibleIds(read(COMPARE_KEY, []))
  .filter((id) => cartEligible(id))
  .slice(0, 3);
let dispose = () => {};
let toastTimer;
let modalTrigger = null;
let deletionUndo = null;
const galleryPositions = new Map();
const catalogue = () =>
  AVAILABLE_LISTINGS.map((i) => getListing(i.id)).filter(Boolean);
const currentFilters = () =>
  parseFilters(
    new URLSearchParams(location.pathname === "/beli" ? location.search : ""),
  );
const filterPath = (f) =>
  "/beli" + (serializeFilters(f).size ? "?" + serializeFilters(f) : "");
const cm = (value) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
const dims = (i) =>
  i.dimensions
    ? `${cm(i.dimensions.width)} × ${cm(i.dimensions.depth)} × ${cm(i.dimensions.height)} cm`
    : "Belum dicantumkan";
const reminders = () => {
  const raw = read("lihatdulu:reminders:v1", []);
  return Array.isArray(raw)
    ? [
        ...new Set(
          raw.filter((id) => COMING_SOON_LISTINGS.some((i) => i.id === id)),
        ),
      ]
    : [];
};
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4000);
}
const savedFeedback = (message, outcome = persistence) =>
  outcome === "device-persistent"
    ? message + " di perangkat ini."
    : message + " sementara, hanya selama tab ini terbuka.";
function rememberPosition(openedListingId = null) {
  history.replaceState(
    {
      ...history.state,
      scrollY: window.scrollY,
      ...(openedListingId && location.pathname === "/beli"
        ? { openedListingId }
        : {}),
    },
    "",
    location.href,
  );
}
function navigate(path, options = {}) {
  if (typeof options === "boolean") options = { replace: options };
  if (modal.open) modal.close();
  rememberPosition(
    path.startsWith("/barang/") ? path.split("/")[2]?.split("?")[0] : null,
  );
  const same = location.pathname + location.search + location.hash === path;
  if (!same)
    history[options.replace ? "replaceState" : "pushState"](
      { scrollY: 0 },
      "",
      path,
    );
  render();
  if (options.results || location.hash === "#camera-results") {
    const target = document.querySelector(
      location.pathname === "/beli" ? "#catalogue-results" : "#camera-results",
    );
    target?.scrollIntoView({ behavior: "instant", block: "start" });
    target?.focus({ preventScroll: true });
    if (location.pathname === "/beli")
      toast(
        `${filterCatalogue(catalogue(), currentFilters()).length} furnitur ditemukan.`,
      );
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector("#main")?.focus({ preventScroll: true });
  }
}
function header() {
  const sell = location.pathname.startsWith("/jual");
  const q = currentFilters().q;
  return `<header class="site-header"><div class="header-inner">${brand()}
    <nav class="role-switch" aria-label="Beli atau jual">${link("/beli", "Beli furnitur", !sell ? "selected" : "", !sell ? 'aria-current="page"' : "")}${link("/jual", "Jual furnitur", sell ? "selected" : "", sell ? 'aria-current="page"' : "")}</nav>
    <form class="header-search" data-search novalidate><label class="sr-only" for="site-search">Cari semua furnitur</label>${icon("search")}<input id="site-search" name="q" type="search" maxlength="120" placeholder="Cari lemari, kursi, atau meja…" value="${esc(q)}">${button(icon("close"), "clear-search", "icon-button search-clear", `aria-label="Hapus pencarian" ${q ? "" : "hidden"}`)}<button type="submit" class="icon-button search-submit" aria-label="Cari semua furnitur">${icon("arrow")}</button></form>
    <nav class="header-nav" aria-label="Navigasi utama">${link("/cari-dari-foto", icon("camera") + "<span>Acuan foto</span>", "photo-entry", 'aria-label="Demo pencarian dari foto"')}${link("/tersimpan", icon("bookmark"), "icon-button", 'aria-label="Pilihan tersimpan"')}${link("/bandingkan", icon("compare") + `<span class="count-badge" data-compare-count ${compared.length ? "" : "hidden"}>${compared.length}</span>`, "icon-button", 'aria-label="Bandingkan furnitur"')}${link("/keranjang", icon("bag") + `<span class="count-badge" data-cart-count ${checkoutTotals().items.length ? "" : "hidden"}>${checkoutTotals().items.length}</span>`, "icon-button", 'aria-label="Keranjang"')}</nav>
  </div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="footer-grid"><div>${brand()}<p>Furnitur untuk kehidupan berikutnya.<br>Kenali bentuk, kondisi, dan ukurannya.</p><small>10 barang contoh · Pilihan tersimpan di perangkat.</small></div><div><strong>JELAJAHI</strong>${link("/beli", "Semua furnitur")}${link("/tersimpan", "Pilihan & draf tersimpan")}${link("/bandingkan", "Bandingkan barang")}</div><div><strong>SEBELUM MEMILIH</strong>${link("/barang/sora?tab=model", "Jelajahi Sora dalam 3D")}${link("/cari-dari-foto", "Demo pencarian dari foto")}${link("/tentang", "Panduan kondisi & ukuran")}</div><div><strong>UNTUK PENJUAL</strong>${link("/jual", "Ruang kerja Sora")}${link("/jual/sora/rekam", "Panduan video")}${link("/jual/sora/tinjau", "Tinjau bukti")}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} LihatDulu</span><span>Katalog contoh. Tidak ada transaksi atau pesan yang dikirim.</span></div></footer>`;
}
function bottomNav() {
  return `<nav class="bottom-nav" aria-label="Navigasi ponsel">${[
    ["/beli", "grid", "Jelajahi"],
    ["/tersimpan", "bookmark", "Tersimpan"],
    ["/bandingkan", "compare", "Bandingkan"],
    ["/keranjang", "bag", "Keranjang"],
    ["/jual", "camera", "Jual"],
  ]
    .map(([href, ic, name]) =>
      link(
        href,
        `${icon(ic)}<span>${name}</span>`,
        location.pathname === href ? "active" : "",
        location.pathname === href ? 'aria-current="page"' : "",
      ),
    )
    .join("")}</nav>`;
}
function shell(content, cls = "") {
  return `${header()}<main id="main" tabindex="-1" class="page ${cls}">${ephemeralKeys.size || marketPersistenceStatus() === "temporary-in-tab" ? '<div class="local-storage-notice" role="status">Penyimpanan perangkat tidak tersedia. Pilihan sementara hanya ada selama tab ini terbuka; muat ulang dapat menghapusnya.</div>' : ""}${content}</main>${footer()}${bottomNav()}${compared.length && location.pathname === "/beli" ? compareTray() : ""}`;
}
function card(i) {
  const active = i.available;
  const coming = COMING_SOON_LISTINGS.some((item) => item.id === i.id);
  return `<article class="product-card ${coming ? "coming-card" : active ? "" : "unavailable-card"}" data-listing="${i.id}"><div class="card-media">${link(`/barang/${i.id}`, image(productCover(i)), "card-image", `aria-label="Lihat ${esc(i.title)}"`)}${!coming ? button(icon("heart"), "save", "icon-button save-button", `data-id="${i.id}" aria-label="${saved.includes(i.id) ? "Hapus" : "Simpan"} ${esc(i.title)}" aria-pressed="${saved.includes(i.id)}"`) : '<span class="badge coming-badge">Segera hadir</span>'}${!coming && !active ? '<span class="badge coming-badge">Tidak tersedia</span>' : ""}</div><div class="card-body"><h3>${link("/barang/" + i.id, esc(i.title))}</h3>${!coming ? `<strong class="card-asking-price">${formatPrice(i.price)}</strong><p class="card-dimensions">${dims(i)}</p><p class="card-condition">${esc(i.condition.includes("·") ? i.condition.split("·").slice(1).join("·").trim() : i.condition)}</p><div class="card-seller">${link("/toko/" + (i.seller.id || i.id), esc(i.seller.name))}<span>${icon("pin")}${esc(i.location)}</span></div><div class="card-bottom"><span class="media-label">${icon(i.model ? "cube" : "camera")}${i.model ? "3D tersedia" : "1 foto"}</span>${button(icon("compare") + "<span>Bandingkan</span>", "compare", "compare-button", `data-id="${i.id}" aria-label="Bandingkan ${esc(i.title)}" aria-pressed="${compared.includes(i.id)}" ${active ? "" : "disabled"}`)}</div>` : `<p class="card-condition">Detail dan harga sedang disiapkan.</p>${button(reminders().includes(i.id) ? "Minat tersimpan" : "Simpan minat", "remind", "text-button", `data-id="${i.id}"`)}`}</div></article>`;
}
function rolePage() {
  const collections = parentCollections(catalogue()).slice(0, 3);
  return shell(
    `<section class="home-intro"><div><span class="eyebrow">ADA RUANG UNTUK CERITA BERIKUTNYA</span><h1>Furnitur bekas,<br><span>lebih jelas sebelum dipilih.</span></h1><p>Temukan bentuk yang kamu suka. Periksa kondisi dan ukurannya.</p></div><div class="home-entry">${link("/beli", "Beli furnitur " + icon("arrow"), "button")}${link("/jual", "Jual furnitur", "button secondary")}</div></section><section class="home-products"><div class="section-heading"><div><h2>Pilihan furnitur</h2><p>Empat pilihan dari 10 barang contoh.</p></div>${link("/beli", "Lihat semua " + icon("arrow"), "text-link")}</div><div class="product-grid home-grid">${["sora", "awan", "loka", "tala"].map((id) => card(getListing(id))).join("")}</div></section><section class="home-categories"><div class="section-heading"><h2>Untuk setiap sudut rumah</h2></div><div class="category-directory">${collections.map((c) => link(c.href, `<div>${image(productCover(getListing(c.coverId)))}</div><span><strong>${esc(c.label)}</strong><small>${c.count} barang contoh</small></span>${icon("arrow")}`, "category-tile")).join("")}</div><div class="quick-collections">${link("/beli?model=1", icon("cube") + " 4 barang dengan 3D " + icon("arrow"), "quick-collection")}${link("/beli?max=1500000", "Hingga Rp 1.500.000 · 4 pilihan " + icon("arrow"), "quick-collection")}</div></section><section class="inspection-feature"><div class="inspection-feature-image">${image(productCover(getListing("sora")))}</div><div><span class="eyebrow">KENALI SEBELUM MEMILIH</span><h2>Sudut kecil juga berarti.</h2><p>Putar Lemari Sora, buka pintu dan lacinya, lalu periksa tiga catatan kondisi yang tersedia.</p>${link("/barang/sora?tab=model", "Lihat Sora dari dekat " + icon("arrow"), "button")}<small>Model 3D tersimpan · Ukuran sesuai model.</small></div></section><section class="seller-entry"><div><span class="eyebrow">PUNYA FURNITUR UNTUK RUANG BERIKUTNYA?</span><h2>Tunjukkan barangmu dengan jelas.</h2><p>Coba panduan video Sora dan susun bukti untuk pratinjau pembeli.</p></div>${link("/jual", "Buka ruang penjual " + icon("arrow"), "button secondary")}</section>`,
    "home-page",
  );
}
function marketplace() {
  const f = currentFilters();
  const items = filterCatalogue(catalogue(), f);
  const groupCount = activeGroupCount(f);
  const collections = parentCollections(catalogue()).slice(0, 3);
  return shell(
    `<div class="market-heading"><div><span class="eyebrow">TEMUKAN TEMPAT BARUNYA</span><h1>Koleksi furnitur</h1></div>${link("/cari-dari-foto", icon("camera") + " Demo acuan foto", "text-link")}</div><nav class="category-chips" aria-label="Jelajahi kategori">${button("Semua", "category", "chip " + (!f.categories.length ? "selected" : ""), `data-category="" aria-pressed="${!f.categories.length}"`)}${collections.map((c) => button(`${c.label} <small>${c.count}</small>`, "parent-category", "chip " + (f.categories.length && f.categories.join(",") === c.categories.join(",") ? "selected" : ""), `data-category="${c.id}" aria-pressed="${f.categories.join(",") === c.categories.join(",")}"`)).join("")}${link("/beli?model=1", icon("cube") + " 3D tersedia", "chip")}${link("/beli?max=1500000", "Hingga Rp 1,5 juta", "chip")}</nav><div class="market-layout"><aside class="filter-rail" aria-label="Filter katalog">${filterForm(f)}</aside><section class="catalogue-results" id="catalogue-results" tabindex="-1" aria-label="Hasil katalog"><div class="result-toolbar"><strong data-result-count>${items.length} furnitur ditemukan</strong><div class="result-tools">${button(icon("filter") + ` Filter${groupCount ? " (" + groupCount + ")" : ""}`, "open-filters", "button secondary mobile-filter", `aria-label="Filter, ${groupCount} kelompok aktif"`)}<label class="sort-label"><span>Urutkan</span><select data-sort aria-label="Urutkan furnitur">${[
      ["relevance", "Pilihan LihatDulu"],
      ["newest", "Terbaru"],
      ["price-asc", "Harga terendah"],
      ["price-desc", "Harga tertinggi"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${f.sort === v ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select></label></div></div>${activeFilterChips(f)}${items.length ? `<div class="product-grid">${items.map(card).join("")}</div><p class="catalogue-disclosure">${icon("info")} Harga, penjual, dan biaya merupakan data contoh. Periksa rincian biaya pada halaman barang.</p>` : noResults(f)}${items.length && !f.q && groupCount === 0 ? `<details class="coming-section"><summary>Di koleksi berikutnya · 2 barang dalam persiapan</summary><div class="coming-grid">${COMING_SOON_LISTINGS.map(card).join("")}</div></details>` : ""}</section></div>`,
    "market-page",
  );
}
function compareTray() {
  return `<aside class="compare-tray" aria-label="Pilihan perbandingan"><div><strong>${compared.length} / 3 dipilih</strong><div class="compare-thumbs">${compared.map((id) => `<span>${image(productCover(getListing(id)))}${button(icon("close"), "compare", "thumb-remove", `data-id="${id}" aria-label="Hapus ${esc(getListing(id).title)} dari perbandingan"`)}</span>`).join("")}</div></div>${button("Hapus", "clear-compare", "text-button")}${link("/bandingkan", "Bandingkan " + icon("arrow"), "button")}</aside>`;
}
function empty(title, text, href, label) {
  return `<div class="empty-state">${icon("bookmark")}<h2>${esc(title)}</h2><p>${esc(text)}</p>${link(href, label, "button")}</div>`;
}
function missing() {
  return shell(
    empty(
      "Halaman belum tersedia",
      "Temukan furnitur dan panduan dari koleksi utama.",
      "/beli",
      "Kembali ke koleksi",
    ),
  );
}
const discoveryViews = createDiscoveryViews({
  catalogue,
  card,
  shell,
  getListing,
});
const {
  filterForm,
  readForm,
  validateForm,
  updatePreview,
  activeFilterChips,
  noResults,
  photoSearch,
} = discoveryViews;
const productViews = createProductViews({
  shell,
  card,
  saved: () => saved,
  compared: () => compared,
  galleryPositions,
  missing,
});
const {
  productPage,
  storePage,
  gallery,
  wearNotes,
  conditionDetail,
  purchase,
} = productViews;
function comparePage() {
  const items = compared.map(getListing).filter((i) => i?.available);
  return shell(
    `<div class="page-heading"><span class="eyebrow">SEBELUM MENENTUKAN PILIHAN</span><h1>Bandingkan furnitur.</h1><p>Ukuran, kondisi, dan harga dalam satu pandangan. Pilih hingga tiga barang.</p></div>${
      items.length
        ? `<div class="compare-intro"><p>${icon("compare")} <strong>${items.length} dari 3 barang</strong><span>Baris berwarna menunjukkan perbedaan.</span></p>${link("/beli", "Tambah barang untuk dibandingkan", "button secondary")}${button("Hapus semua", "clear-compare", "text-button")}</div><div class="comparison-scroll" tabindex="0" aria-label="Tabel perbandingan, geser untuk melihat semua barang"><table class="comparison-table"><caption class="sr-only">Perbandingan ${items.map((i) => i.title).join(", ")}</caption><thead><tr><th scope="col">Detail barang</th>${items.map((i) => `<th scope="col"><div class="compare-product">${image(i.photos[0])}${button(icon("close"), "compare", "icon-button", `data-id="${i.id}" aria-label="Hapus ${esc(i.title)} dari perbandingan"`)}<h2>${link("/barang/" + i.id, esc(i.title))}</h2>${link("/barang/" + i.id, "Lihat barang " + icon("arrow"), "text-link")}</div></th>`).join("")}</tr></thead><tbody>${comparisonRows(
            items,
          )
            .map(
              (r) =>
                `<tr class="${r.different ? "different" : ""}"><th scope="row">${r.label}${r.different ? '<span class="difference-label">Berbeda</span>' : ""}</th>${r.values.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`,
            )
            .join("")}</tbody></table></div>`
        : empty(
            "Belum ada pilihan untuk dibandingkan",
            "Pilih tombol Bandingkan pada furnitur yang menarik perhatianmu.",
            "/beli",
            "Jelajahi furnitur",
          )
    }`,
    "comparison-page",
  );
}
function about() {
  return shell(
    `<div class="page-heading"><span class="eyebrow">PANDUAN LIHATDULU</span><h1>Kenali barang.<br>Pahami ruangmu.</h1><p>Hal kecil yang perlu diperiksa sebelum memilih furnitur bekas.</p></div><div class="guide-grid">${[
      [
        "ruler",
        "Baca tiga dimensi",
        "Lebar, kedalaman, dan tinggi dibedakan pada katalog. Sisakan ruang untuk berjalan dan bukaan pintu.",
      ],
      [
        "camera",
        "Lihat pemakaiannya",
        "Catatan permukaan membantu menunjukkan goresan, perubahan warna, dan sudut yang perlu dilihat lagi.",
      ],
      [
        "cube",
        "Jelajahi modelnya",
        "Empat produk memiliki model tersimpan. Putar, ganti sudut pandang, dan atur bukaan yang tersedia.",
      ],
      [
        "room",
        "Coba ukurannya",
        "Gunakan ruangan simulasi untuk memeriksa ukuran dan jarak bukaan. Ukuran ruang asli tetap perlu diukur.",
      ],
    ]
      .map(
        ([ic, title, text]) =>
          `<article>${icon(ic)}<h2>${title}</h2><p>${text}</p></article>`,
      )
      .join(
        "",
      )}</div><div class="guide-banner"><div><h2>Coba dengan Lemari Sora.</h2><p>Jelajahi model, tiga catatan kondisi, dan bukaan penyimpanan.</p></div>${link("/barang/sora", "Lihat Sora " + icon("arrow"), "button")}</div><p class="about-scope">LihatDulu ini menggunakan katalog contoh dan data lokal di perangkat. Video penjual sudah disiapkan; tidak ada rekonstruksi 3D, transaksi, unggah, atau kontak penjual.</p>`,
  );
}

function openModal(content, cls = "", label = "") {
  modalTrigger = document.activeElement;
  modal.className = cls;
  modal.innerHTML = `<div class="dialog-top">${button(icon("close"), "close-modal", "icon-button", 'aria-label="Tutup dialog"')}</div><div class="dialog-body">${content}</div>`;
  const title = modal.querySelector("h2");
  if (title) {
    title.id = "dialog-title";
    modal.setAttribute("aria-labelledby", title.id);
    modal.removeAttribute("aria-label");
  } else {
    modal.setAttribute("aria-label", label || "Pilihan LihatDulu");
    modal.removeAttribute("aria-labelledby");
  }
  document.body.classList.add("modal-open");
  modal.showModal();
}
function requestModalClose() {
  const form = modal.querySelector("[data-offer]");
  if (
    form?.dataset.dirty === "true" &&
    !modal.querySelector(".discard-draft")
  ) {
    const panel = document.createElement("div");
    panel.className = "discard-draft";
    panel.innerHTML = `<p>Perubahan draf belum disimpan.</p>${button("Lanjutkan mengedit", "keep-editing", "button secondary")}${button("Buang perubahan", "discard-edit", "text-button")}`;
    form.append(panel);
    panel.querySelector("button")?.focus();
    return;
  }
  if (!form || form.dataset.dirty !== "true") modal.close();
}
function paintPhotoModal(id) {
  const item = getListing(id);
  if (!item) return;
  const media = galleryMedia(item);
  const index = Math.min(galleryPositions.get(id) || 0, media.length - 1);
  const focusAction = modal.contains(document.activeElement)
    ? document.activeElement.dataset.action
    : null;
  modal.dataset.photoId = id;
  modal.setAttribute("aria-label", "Gambar " + item.title);
  modal.removeAttribute("aria-labelledby");
  modal.innerHTML = `<div class="dialog-top">${button(icon("close"), "close-modal", "icon-button", 'aria-label="Tutup gambar"')}</div><div class="enlarged-photo">${image(media[index], "", true)}</div><p class="photo-modal-caption" role="status" aria-live="polite">${esc(item.title)} · ${esc(media[index].caption)} · ${index + 1} / ${item.photos.length}</p><div class="photo-modal-tools">${item.photos.length > 1 ? button(icon("back"), "modal-photo-prev", "button secondary", `data-id="${id}" aria-label="Gambar sebelumnya"`) : ""}${button("Perbesar 1,5×", "zoom-photo", "button secondary", 'aria-pressed="false"')}${item.photos.length > 1 ? button(icon("arrow"), "modal-photo-next", "button secondary", `data-id="${id}" aria-label="Gambar berikutnya"`) : ""}</div>`;
  if (modal.open && focusAction)
    modal
      .querySelector(`[data-action="${focusAction}"]`)
      ?.focus({ preventScroll: true });
}
function openPhoto(id) {
  if (!getListing(id)) return;
  modalTrigger = document.activeElement;
  modal.className = "photo-modal";
  paintPhotoModal(id);
  document.body.classList.add("modal-open");
  modal.showModal();
}
function openCondition(id) {
  openModal(
    conditionDetail(id),
    "condition-modal",
    "Catatan kondisi Lemari Sora",
  );
}
function savedPage() {
  const p = new URLSearchParams(location.search);
  return shell(
    renderBuyerSaved({
      view: p.get("view") || "barang",
      savedIds: saved,
      renderCard: card,
      summaryId: p.get("summary"),
      collectionId: p.get("collection"),
    }),
    "saved-page",
  );
}
function cartPage(review = false) {
  return shell(
    renderBuyerCart({ review }),
    review ? "review-page" : "cart-page",
  );
}
function setPageMetadata(path) {
  const titles = {
    "/": "Furnitur bekas, lebih jelas sebelum dipilih",
    "/beli": "Koleksi furnitur",
    "/tersimpan": "Pilihan, draf & ringkasan tersimpan",
    "/bandingkan": "Bandingkan furnitur",
    "/keranjang": "Keranjang furnitur",
    "/tinjau-pesanan": "Tinjau pilihan",
    "/checkout": "Tinjau pilihan",
    "/tentang": "Panduan kondisi & ukuran",
    "/cari-dari-foto": "Demo pencarian dari foto",
    "/jual": "Ruang penjual Sora",
    "/jual/sora/rekam": "Video bukti Sora",
    "/jual/sora/tinjau": "Tinjau bukti Sora",
  };
  const item = path.startsWith("/barang/")
    ? getListing(path.split("/")[2])
    : null;
  document.title =
    (item?.title ||
      titles[path] ||
      (path.startsWith("/toko/")
        ? "Koleksi penjual"
        : "Halaman belum tersedia")) + " · LihatDulu";
  const description = item
    ? `${item.title}. ${dims(item)}. ${item.available ? formatPrice(item.price) + ". " : ""}${item.condition || "Koleksi berikutnya"}. Katalog furnitur contoh LihatDulu.`
    : "Jelajahi 10 furnitur contoh, bandingkan ukuran dan kondisi, lalu simpan pilihan di perangkat ini.";
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", description);
}
function render() {
  dispose();
  dispose = () => {};
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.body.classList.toggle("capture-page", path === "/jual/sora/rekam");
  document.body.classList.toggle("on-product", path.startsWith("/barang/"));
  document.body.classList.toggle(
    "has-compare-tray",
    path === "/beli" && compared.length > 0,
  );
  const sora = getListing("sora");
  if (path === "/") app.innerHTML = rolePage();
  else if (path === "/beli") app.innerHTML = marketplace();
  else if (path.startsWith("/barang/"))
    app.innerHTML = productPage(path.split("/")[2]);
  else if (path === "/bandingkan") app.innerHTML = comparePage();
  else if (path === "/tersimpan") app.innerHTML = savedPage();
  else if (path.startsWith("/ringkasan/"))
    app.innerHTML = shell(renderSavedSummary(path.split("/")[2]), "saved-page");
  else if (["/keranjang", "/tinjau-pesanan", "/checkout"].includes(path))
    app.innerHTML = cartPage(path !== "/keranjang");
  else if (path === "/cari-dari-foto") app.innerHTML = photoSearch();
  else if (path === "/tentang") app.innerHTML = about();
  else if (path.startsWith("/toko/"))
    app.innerHTML = storePage(path.split("/")[2]);
  else if (["/jual", "/buat", "/barang-saya"].includes(path))
    app.innerHTML = shell(renderVideoWorkspace(sora), "seller-page");
  else if (path === "/jual/sora/rekam")
    app.innerHTML = `<main id="main" tabindex="-1">${renderVideoCapture(sora)}</main>`;
  else if (path === "/jual/sora/tinjau")
    app.innerHTML = shell(renderVideoReview(sora), "seller-page");
  else app.innerHTML = missing();
  setPageMetadata(path);
  if (app.querySelector(".inspection")) {
    const item = getListing(path.split("/")[2]);
    const tab = new URLSearchParams(location.search).get("tab");
    dispose = mountInspection(app, {
      mode:
        tab === "room" ? "room" : tab === "condition" ? "condition" : "model",
      listing: item,
      onToast: toast,
    });
  }
  if (path.startsWith("/jual") || ["/buat", "/barang-saya"].includes(path))
    dispose = mountVideoJourney(app, {
      mode: path.includes("/rekam")
        ? "capture"
        : path.includes("/tinjau")
          ? "review"
          : "workspace",
      listing: sora,
      onNavigate: navigate,
      onToast: toast,
    });
  if (path === "/cari-dari-foto") {
    let cancelled = false;
    let cleanup = () => {};
    let loaded = false;
    const details = app.querySelector("[data-camera-demo]");
    const onToggle = async () => {
      if (!details.open || loaded) return;
      loaded = true;
      try {
        const camera = await import("./camera-search.js");
        if (cancelled) return;
        const host = app.querySelector("[data-camera-host]");
        if (host) {
          host.innerHTML = camera.renderCameraSearch();
          cleanup = camera.mountCameraSearch(host);
        }
      } catch {
        if (!cancelled) {
          const host = app.querySelector("[data-camera-host]");
          if (host)
            host.innerHTML =
              "<p>Gerakan 3D belum tersedia. Pilihan kursi tetap tersedia di atas.</p>";
        }
      }
    };
    details?.addEventListener("toggle", onToggle);
    dispose = () => {
      cancelled = true;
      cleanup();
      details?.removeEventListener("toggle", onToggle);
    };
  }
}
Object.defineProperty(window, "lihatDulu", {
  value: {
    get engine() {
      return document.querySelector(".inspection")?._engine;
    },
  },
  configurable: true,
});

function updateSavedButtons(id) {
  document
    .querySelectorAll(`[data-action="save"][data-id="${id}"]`)
    .forEach((b) => {
      b.setAttribute("aria-pressed", saved.includes(id));
      b.setAttribute(
        "aria-label",
        `${saved.includes(id) ? "Hapus" : "Simpan"} ${getListing(id).title}`,
      );
      if (b.classList.contains("text-button"))
        b.innerHTML =
          icon("heart") + (saved.includes(id) ? "Tersimpan" : "Simpan");
    });
}
function updateCompare() {
  if (location.pathname === "/bandingkan") {
    render();
    return;
  }
  document.querySelectorAll('[data-action="compare"]').forEach((b) => {
    b.setAttribute("aria-pressed", compared.includes(b.dataset.id));
    const span = b.querySelector("span");
    if (span)
      span.textContent = compared.includes(b.dataset.id)
        ? "Dipilih"
        : "Bandingkan";
  });
  document.querySelectorAll("[data-compare-count]").forEach((b) => {
    b.textContent = compared.length;
    b.hidden = !compared.length;
  });
  document.querySelector(".compare-tray")?.remove();
  document.body.classList.toggle(
    "has-compare-tray",
    location.pathname === "/beli" && compared.length > 0,
  );
  if (location.pathname === "/beli" && compared.length)
    app.insertAdjacentHTML("beforeend", compareTray());
}
function resetFilterForm(form) {
  const isModal = modal.contains(form);
  form.outerHTML = filterForm(resetRefinements(currentFilters()), isModal);
  const next = isModal
    ? modal.querySelector("form")
    : app.querySelector("[data-filters]");
  next
    ?.querySelector('[data-action="filter-reset"]')
    ?.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const a = event.target.closest("a[data-nav]");
  if (
    a &&
    a.getAttribute("href") &&
    !a.getAttribute("href").startsWith("#") &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  ) {
    event.preventDefault();
    navigate(a.getAttribute("href"));
    return;
  }
  const el = event.target.closest("[data-action]");
  if (!el || el.disabled) return;
  const id = el.dataset.id;
  const action = el.dataset.action;
  if (action === "close-modal") requestModalClose();
  else if (action === "keep-editing") {
    modal.querySelector(".discard-draft")?.remove();
    modal.querySelector('[name="amount"]')?.focus();
  } else if (action === "discard-edit") {
    modal.querySelector("[data-offer]")?.setAttribute("data-dirty", "false");
    modal.close();
  } else if (action === "clear-search") {
    const input = el.closest("form").querySelector('[name="q"]');
    input.value = "";
    el.hidden = true;
    const f = currentFilters();
    f.q = "";
    navigate(filterPath(f), { results: location.pathname === "/beli" });
    document.querySelector("#site-search")?.focus({ preventScroll: true });
  } else if (action === "save") {
    saved = saved.includes(id) ? saved.filter((v) => v !== id) : [...saved, id];
    const outcome = write(SAVED_KEY, saved);
    updateSavedButtons(id);
    if (location.pathname === "/tersimpan") render();
    toast(
      savedFeedback(
        saved.includes(id) ? "Barang disimpan" : "Pilihan diperbarui",
        outcome,
      ),
    );
  } else if (action === "compare") {
    if (!compared.includes(id) && compared.length === 3) {
      toast("Maksimal tiga barang. Hapus satu pilihan untuk menggantinya.");
      return;
    }
    compared = toggleCompare(compared, id, catalogue());
    write(COMPARE_KEY, compared);
    updateCompare();
  } else if (action === "clear-compare") {
    compared = [];
    write(COMPARE_KEY, compared);
    render();
  } else if (action === "category") {
    const f = currentFilters();
    f.categories = el.dataset.category ? [el.dataset.category] : [];
    navigate(filterPath(f), { results: true });
  } else if (action === "parent-category") {
    const f = currentFilters();
    f.categories = collectionSelections(el.dataset.category).categories;
    navigate(filterPath(f), { results: true });
  } else if (action === "open-filters")
    openModal(
      `<h2>Sesuaikan pilihanmu</h2>${filterForm(currentFilters(), true)}`,
      "filter-modal",
    );
  else if (action === "filter-reset") resetFilterForm(el.closest("form"));
  else if (action === "filter-cancel") {
    if (modal.contains(el)) modal.close();
    else el.closest("form").outerHTML = filterForm(currentFilters());
  } else if (action === "clear-filters")
    navigate(filterPath(resetRefinements(currentFilters())), { results: true });
  else if (action === "remove-filter") {
    const f = currentFilters();
    const key = el.dataset.key;
    if (Array.isArray(f[key]))
      f[key] = f[key].filter((v) => v !== el.dataset.value);
    else if (key in f)
      f[key] = key === "q" ? "" : key === "model" ? false : null;
    navigate(filterPath(f), { results: true });
  } else if (["photo", "photo-next", "photo-prev"].includes(action)) {
    const i = getListing(id);
    if (!i) return;
    const n = galleryPositions.get(id) || 0;
    galleryPositions.set(
      id,
      action === "photo"
        ? Number(el.dataset.index)
        : (n + (action === "photo-next" ? 1 : -1) + i.photos.length) %
            i.photos.length,
    );
    const host = document.querySelector(".photo-gallery");
    if (host) host.outerHTML = gallery(i);
    document
      .querySelector(
        action === "photo"
          ? `.gallery-thumb[data-index="${el.dataset.index}"]`
          : `[data-action="${action}"][data-id="${id}"]`,
      )
      ?.focus({ preventScroll: true });
  } else if (action === "enlarge-photo") openPhoto(id);
  else if (action === "zoom-photo") {
    const zoomed = modal
      .querySelector(".enlarged-photo")
      .classList.toggle("is-zoomed");
    el.setAttribute("aria-pressed", zoomed);
    el.textContent = zoomed ? "Atur ulang zoom" : "Perbesar 1,5×";
  } else if (["modal-photo-prev", "modal-photo-next"].includes(action)) {
    const i = getListing(id);
    const n = galleryPositions.get(id) || 0;
    galleryPositions.set(
      id,
      (n + (action === "modal-photo-next" ? 1 : -1) + i.photos.length) %
        i.photos.length,
    );
    paintPhotoModal(id);
  } else if (action === "condition") openCondition(id);
  else if (action === "focus-condition") {
    modal.close();
    if (!document.querySelector(".inspection-condition"))
      navigate(
        "/barang/sora?" +
          (new URLSearchParams(location.search).get("preview") === "1"
            ? "preview=1&"
            : "") +
          "tab=condition",
      );
    const focusNote = () => {
      const target = document.querySelector(
        `.inspection-condition[data-condition="${id}"]`,
      );
      if (target && !target.disabled) target.click();
    };
    setTimeout(focusNote, 450);
    document
      .querySelector(".inspection")
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  } else if (action === "add-cart") {
    if (!cartEligible(id)) {
      toast(
        "Barang ini belum bisa ditambahkan. Lihat pilihan lain di katalog.",
      );
      return;
    }
    const state = addCart(id);
    if (!state.cart.includes(id)) {
      toast("Pilihan belum tersimpan. Coba lagi.");
      return;
    }
    document.querySelectorAll("[data-cart-count]").forEach((b) => {
      b.textContent = checkoutTotals().items.length;
      b.hidden = false;
    });
    document
      .querySelectorAll(`[data-action="add-cart"][data-id="${id}"]`)
      .forEach((b) => {
        b.innerHTML = icon("bag") + "Di keranjang";
      });
    const panel = document.querySelector(".purchase-panel");
    panel?.querySelector(".cart-added")?.remove();
    if (panel)
      panel.insertAdjacentHTML(
        "beforeend",
        `<div class="cart-added" role="status"><strong>${esc(getListing(id).title)} ada di keranjang.</strong>${link("/keranjang", "Lihat keranjang " + icon("arrow"), "text-link")}${link("/beli", "Lanjut jelajahi", "text-link")}</div>`,
      );
    toast(
      savedFeedback("Pilihan keranjang disimpan", marketPersistenceStatus()) +
        " Belum menjadi pesanan.",
    );
  } else if (action === "remove-cart") {
    deletionUndo = { type: "cart", id };
    removeCart(id);
    render();
    app
      .querySelector("#main")
      ?.insertAdjacentHTML(
        "afterbegin",
        `<div class="undo-banner" role="status">Barang dihapus dari keranjang. ${button("Urungkan", "undo-local-delete", "text-button")}</div>`,
      );
  } else if (action === "offer")
    openModal(renderOfferComposer(getListing(id)), "offer-modal");
  else if (action === "delete-offer") {
    deleteOfferDraft(id);
    if (modal.open) modal.close();
    render();
    app
      .querySelector("#main")
      ?.insertAdjacentHTML(
        "afterbegin",
        `<div class="undo-banner" role="status">Draf penawaran dihapus. ${button("Urungkan", "undo-buyer-delete", "text-button")}</div>`,
      );
  } else if (action === "undo-buyer-delete") {
    undoBuyerDeletion();
    render();
    toast("Catatan dikembalikan.");
  } else if (action === "delete-summary") {
    deleteSummarySnapshot(id);
    navigate("/tersimpan?view=ringkasan");
    toast("Ringkasan dihapus. Kamu bisa mengurungkannya.");
  } else if (action === "remove-from-collection") {
    const c = readMarketState().collections.find((c) => c.id === id);
    if (!c) return;
    deletionUndo = { type: "collection", value: c };
    removeFromCollection(id, el.dataset.listing);
    render();
    app
      .querySelector("#main")
      ?.insertAdjacentHTML(
        "afterbegin",
        `<div class="undo-banner" role="status">Barang dihapus dari koleksi. ${button("Urungkan", "undo-local-delete", "text-button")}</div>`,
      );
  } else if (action === "undo-cart") {
    addCart(id);
    render();
  } else if (action === "collection")
    openModal(
      `<form data-collection class="composer" novalidate><h2>Beri nama koleksimu</h2><p>${saved.length} pilihan tersimpan akan disalin ke koleksi.</p><label>Nama koleksi<input name="name" required maxlength="50" placeholder="Ruang tamu baru" aria-describedby="collection-error"></label><p id="collection-error" class="field-error" role="alert"></p><button type="submit" class="button">Simpan koleksi</button></form>`,
      "collection-modal",
    );
  else if (action === "delete-collection") {
    const c = readMarketState().collections.find((c) => c.id === id);
    if (!c) return;
    deletionUndo = { type: "collection", value: c };
    deleteCollection(id);
    render();
    app
      .querySelector("#main")
      ?.insertAdjacentHTML(
        "afterbegin",
        `<div class="undo-banner" role="status">Koleksi dihapus. ${button("Urungkan", "undo-local-delete", "text-button")}</div>`,
      );
  } else if (action === "undo-local-delete") {
    if (deletionUndo?.type === "cart") addCart(deletionUndo.id);
    else if (deletionUndo?.type === "collection")
      saveCollection(deletionUndo.value.name, deletionUndo.value.ids);
    deletionUndo = null;
    render();
    toast("Pilihan dikembalikan.");
  } else if (action === "collection-compare") {
    const c = readMarketState().collections.find((c) => c.id === id);
    const ids = eligibleIds(c?.ids).filter((id) => cartEligible(id));
    if (ids.length <= 3) {
      compared = ids;
      write(COMPARE_KEY, compared);
      navigate("/bandingkan");
    } else
      openModal(
        `<form data-collection-compare novalidate><h2>Pilih hingga tiga barang</h2><p>Koleksi ${esc(c.name)} berisi ${ids.length} barang. Pilih barang yang ingin dibandingkan.</p>${ids.map((id) => `<label class="check-row"><input type="checkbox" name="ids" value="${id}"><span>${esc(getListing(id).title)}</span></label>`).join("")}<p class="field-error" data-compare-error role="alert"></p><button type="submit" class="button">Bandingkan pilihan</button></form>`,
        "collection-modal",
      );
  } else if (action === "remind") {
    write("lihatdulu:reminders:v1", [...new Set([...reminders(), id])]);
    el.textContent = "Minat tersimpan";
    toast(savedFeedback("Minat disimpan") + " Tidak ada notifikasi otomatis.");
  } else if (action === "save-summary") {
    const state = readMarketState();
    const result = saveSummarySnapshot(state.cart, state.checkout);
    if (result.ok) {
      navigate("/tersimpan?view=ringkasan&summary=" + result.record.id);
      toast(
        result.outcome === "device-persistent"
          ? "Ringkasan tersimpan di perangkat ini."
          : "Ringkasan hanya tersedia selama tab ini terbuka.",
      );
    } else toast("Ringkasan belum tersimpan. Periksa pilihanmu dan coba lagi.");
  } else if (action === "photo-reset")
    navigate(
      preparedReferencePath(
        parsePreparedReference(new URLSearchParams(location.search)),
        { resetWidth: true },
      ),
      { results: true },
    );
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches("[data-search]")) {
    event.preventDefault();
    if (form.dataset.composing === "true") return;
    const f = currentFilters();
    f.q = String(new FormData(form).get("q") || "")
      .trim()
      .slice(0, 120);
    navigate(filterPath(f), { results: true });
  } else if (form.matches("[data-filters]")) {
    event.preventDefault();
    const result = validateForm(form, { focus: true });
    if (result.valid) {
      if (!filtersEqual(result.filter, currentFilters()))
        navigate(filterPath(result.filter), { results: true });
      else if (modal.open) modal.close();
    }
  } else if (form.matches("[data-offer]")) {
    event.preventDefault();
    const fd = new FormData(form);
    const result = saveOfferDraft(form.dataset.id, {
      amount: fd.get("amount"),
      note: fd.get("note"),
    });
    if (result.ok) {
      form.dataset.dirty = "false";
      modal.close();
      render();
      toast(
        result.outcome === "device-persistent"
          ? "Draf penawaran tersimpan di perangkat. Belum dikirim."
          : "Draf tersedia selama tab ini terbuka. Belum dikirim.",
      );
    } else {
      for (const name of ["amount", "note"]) {
        const input = form.querySelector(`[name="${name}"]`);
        const error = form.querySelector(`#offer-${name}-error`);
        input?.setAttribute(
          "aria-invalid",
          result.errors?.[name] ? "true" : "false",
        );
        if (error) {
          error.textContent = result.errors?.[name] || "";
          error.hidden = !result.errors?.[name];
        }
      }
      const error = form.querySelector("[data-offer-error]");
      if (error) {
        error.textContent = result.errors?.form || "";
        error.hidden = !result.errors?.form;
      }
      form.querySelector('[aria-invalid="true"]')?.focus();
    }
  } else if (form.matches("[data-collection]")) {
    event.preventDefault();
    const input = form.querySelector('[name="name"]');
    const name = input.value.trim();
    const error = form.querySelector("#collection-error");
    if (!name) {
      error.textContent = "Beri nama koleksi terlebih dahulu.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    const existing = readMarketState().collections.find((c) => c.name === name);
    if (existing && form.dataset.confirmName !== name) {
      error.textContent = `Koleksi “${name}” sudah ada. Tekan Perbarui koleksi untuk mengganti isinya dengan ${saved.length} pilihan saat ini.`;
      form.dataset.confirmName = name;
      form.querySelector('[type="submit"]').textContent = "Perbarui koleksi";
      return;
    }
    saveCollection(name, saved);
    modal
      .querySelector("[data-collection]")
      ?.setAttribute("data-dirty", "false");
    modal.close();
    navigate("/tersimpan?view=koleksi");
    toast(savedFeedback("Koleksi diperbarui", marketPersistenceStatus()));
  } else if (form.matches("[data-collection-compare]")) {
    event.preventDefault();
    const ids = eligibleIds(new FormData(form).getAll("ids"));
    if (!ids.length || ids.length > 3) {
      form.querySelector("[data-compare-error]").textContent =
        "Pilih satu hingga tiga barang.";
      return;
    }
    compared = ids;
    write(COMPARE_KEY, compared);
    navigate("/bandingkan");
  } else if (form.matches("[data-collection-members]")) {
    event.preventDefault();
    const c = readMarketState().collections.find(
      (c) => c.id === form.dataset.id,
    );
    if (!c) return;
    addToCollection(c.id, String(new FormData(form).get("listing") || ""));
    render();
    toast("Isi koleksi diperbarui.");
  } else if (form.matches("[data-photo-limits]")) {
    event.preventDefault();
    const input = form.querySelector('[name="width"]');
    const raw = input.value.trim();
    const n = Number(raw);
    if (
      raw &&
      (!/^\d+(?:\.\d+)?$/.test(raw) || !Number.isFinite(n) || n < 1 || n > 500)
    ) {
      input.setAttribute("aria-invalid", "true");
      const error = form.querySelector("[data-width-error]");
      if (error) {
        error.textContent = "Gunakan lebar 1 hingga 500 cm.";
        error.hidden = false;
      }
      input.focus();
      return;
    }
    const state = parsePreparedReference(new URLSearchParams(location.search));
    state.width = raw ? n : null;
    navigate(preparedReferencePath(state), { results: true });
  }
});
document.addEventListener("change", (event) => {
  const el = event.target;
  if (el.matches("[data-sort]")) {
    const f = currentFilters();
    f.sort = el.value;
    navigate(filterPath(f), { results: true });
  } else if (["fulfilment", "cart-delivery"].includes(el.name)) {
    setCheckout({ delivery: el.value });
    if (el.name === "cart-delivery") {
      const y = scrollY;
      render();
      window.scrollTo(0, y);
    } else {
      const id = location.pathname.split("/")[2];
      const panel = document.querySelector(".purchase-panel");
      if (panel) {
        panel.outerHTML = purchase(
          getListing(id),
          new URLSearchParams(location.search).get("preview") === "1",
        );
        const total = document.querySelector("[data-mobile-product-total]");
        if (total)
          total.textContent = formatPrice(
            checkoutTotals([id], readMarketState().checkout).total,
          );
        document
          .querySelector(`[name="fulfilment"][value="${el.value}"]`)
          ?.focus({ preventScroll: true });
      }
    }
  } else if (el.matches("[data-photo-source]")) {
    const state = parsePreparedReference(new URLSearchParams(location.search));
    state.source = el.value === "tala" ? "tala" : "arca";
    navigate(preparedReferencePath(state), { results: true });
  }
});
document.addEventListener("input", (event) => {
  const el = event.target;
  if (el.matches('[data-photo-limits] [name="width"]')) {
    el.setAttribute("aria-invalid", "false");
    const error = el.closest("form").querySelector("[data-width-error]");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  }
  const filters = el.closest("[data-filters]");
  if (filters) updatePreview(filters);
  const collection = el.closest("[data-collection]");
  if (
    collection &&
    el.name === "name" &&
    collection.dataset.confirmName !== el.value.trim()
  ) {
    delete collection.dataset.confirmName;
    collection.querySelector('[type="submit"]').textContent = "Simpan koleksi";
    collection.querySelector("#collection-error").textContent = "";
    el.setAttribute("aria-invalid", "false");
  }
  const offer = el.closest("[data-offer]");
  if (offer) {
    offer.dataset.dirty = "true";
    const parsed = parseRupiahInput(
      offer.querySelector('[name="amount"]').value,
    );
    const preview = offer.querySelector("[data-offer-preview]");
    if (preview)
      preview.textContent =
        parsed !== null && parsed > 0
          ? "Nilai penawaran: " + formatPrice(parsed)
          : "Masukkan nominal rupiah bulat.";
    const count = offer.querySelector("[data-offer-note-count]");
    if (count)
      count.textContent = offer.querySelector('[name="note"]').value.length;
  }
  if (el.matches("[data-search] input, .header-search input")) {
    const clear = el
      .closest("form")
      .querySelector('[data-action="clear-search"]');
    if (clear) clear.hidden = !el.value;
  }
  if (el.tagName === "TEXTAREA") {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 280) + "px";
  }
});
document.addEventListener("compositionstart", (event) => {
  const form = event.target.closest("[data-search]");
  if (form) form.dataset.composing = "true";
});
document.addEventListener("compositionend", (event) => {
  const form = event.target.closest("[data-search]");
  if (form) form.dataset.composing = "false";
});
modal.addEventListener("cancel", (event) => {
  event.preventDefault();
  requestModalClose();
});
modal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  const id = modal.dataset.photoId;
  const host =
    id && document.querySelector(`.photo-gallery[data-gallery-id="${id}"]`);
  if (host) host.outerHTML = gallery(getListing(id));
  delete modal.dataset.photoId;
  if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
  else if (id)
    document.querySelector(".gallery-enlarge")?.focus({ preventScroll: true });
  modalTrigger = null;
});
modal.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const focusable = [
      ...modal.querySelectorAll(
        'a[href],button:not(:disabled),input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
      ),
    ].filter(
      (el) =>
        !el.hidden &&
        el.getClientRects().length &&
        getComputedStyle(el).visibility !== "hidden",
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (!first) {
      event.preventDefault();
      modal.focus();
      return;
    }
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !modal.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !modal.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  }
  if (
    !modal.dataset.photoId ||
    !["ArrowLeft", "ArrowRight"].includes(event.key) ||
    event.isComposing
  )
    return;
  event.preventDefault();
  const item = getListing(modal.dataset.photoId);
  const n = galleryPositions.get(item.id) || 0;
  galleryPositions.set(
    item.id,
    (n + (event.key === "ArrowRight" ? 1 : -1) + item.photos.length) %
      item.photos.length,
  );
  paintPhotoModal(item.id);
});
modal.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  const r = modal.getBoundingClientRect();
  if (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  )
    requestModalClose();
});
document.addEventListener(
  "error",
  (event) => {
    const img = event.target;
    if (img.tagName !== "IMG" || img.dataset.failed) return;
    img.dataset.failed = "1";
    img.classList.add("failed-media");
    const holder = img.parentElement;
    if (
      holder?.classList.contains("card-image") ||
      holder?.classList.contains("gallery-main")
    ) {
      holder.classList.add("image-failure");
      const note = document.createElement("span");
      note.textContent =
        "Gambar belum tersedia. Detail barang tetap bisa dibuka.";
      holder.append(note);
    }
  },
  true,
);
if (location.pathname.length > 1 && location.pathname.endsWith("/"))
  history.replaceState(
    history.state,
    "",
    location.pathname.replace(/\/+$/, "") + location.search + location.hash,
  );
history.scrollRestoration = "manual";
window.addEventListener("popstate", () => {
  if (modal.open) modal.close();
  const top = history.state?.scrollY || 0;
  render();
  // Restore during the same navigation task. Warm-cache Back can complete
  // before requestAnimationFrame, exposing the top of results for a frame.
  window.scrollTo({ top, behavior: "instant" });
});
window.addEventListener("storage", (event) => {
  if (
    ![
      SAVED_KEY,
      COMPARE_KEY,
      "lihatdulu:buyer-records:v1",
      "lihatdulu:marketplace:v1",
    ].includes(event.key) ||
    modal.open
  )
    return;
  saved = eligibleIds(read(SAVED_KEY, []));
  compared = eligibleIds(read(COMPARE_KEY, []))
    .filter((id) => cartEligible(id))
    .slice(0, 3);
  const y = scrollY;
  render();
  window.scrollTo(0, y);
});
render();
