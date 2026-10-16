import { formatPrice } from "./catalogue.js";
import {
  getListing,
  readMarketState,
  checkoutTotals,
  marketPersistenceStatus,
} from "./market-state.js";
import { esc, icon, link, button, image } from "./components.js";
import {
  getOfferDraft,
  listOfferDrafts,
  listSummarySnapshots,
  getSummarySnapshot,
  buyerPersistenceStatus,
  buyerRecoveryCount,
  canUndoBuyerDeletion,
  parseRupiahInput,
} from "./buyer-records.js";

const cm = (value) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
const dimensions = (item) =>
  `${cm(item.dimensions.width)} × ${cm(item.dimensions.depth)} × ${cm(item.dimensions.height)} cm`;
export const buyerDate = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date(value)) + " WIB"
    : "Waktu awal tidak tercatat";
export const persistenceCopy = (outcome) =>
  outcome === "device-persistent"
    ? "Tersimpan di perangkat ini"
    : outcome === "temporary-in-tab"
      ? "Tersedia selama sesi ini"
      : "Belum tersimpan";
const empty = (title, copy, href = "/beli", label = "Jelajahi furnitur") =>
  `<div class="empty-state">${icon("bookmark")}<h2>${esc(title)}</h2><p>${esc(copy)}</p>${link(href, label, "button")}</div>`;
const fallbackCard = (item) =>
  `<article class="buyer-simple-card">${link("/barang/" + item.id, image(item.photos[0]))}<div><h3>${link("/barang/" + item.id, esc(item.title))}</h3><strong>${formatPrice(item.price)}</strong></div></article>`;
const localNote =
  '<p class="commerce-note">Tidak ada pembayaran, pesan kepada penjual, atau pesanan. Semua harga dan biaya adalah contoh.</p>';

export function renderPriceBreakdown(item, delivery = "pickup") {
  const totals = checkoutTotals([item.id], { delivery });
  if (!totals.items.length)
    return '<p class="buyer-notice">Barang ini sedang tidak tersedia untuk keranjang.</p>';
  return `<section class="buyer-price-breakdown" aria-label="Rincian total contoh"><dl><div><dt>Harga 1 barang</dt><dd>${formatPrice(totals.subtotal)}</dd></div><div><dt>Biaya persiapan contoh</dt><dd>${formatPrice(totals.preparedFee)}</dd></div><div><dt>${totals.delivery === "delivery" ? "Pengiriman contoh" : "Ambil sendiri"}</dt><dd>${formatPrice(totals.deliveryFee)}</dd></div><div class="total"><dt>Total contoh</dt><dd>${formatPrice(totals.total)}</dd></div></dl><small>Rincian untuk 1 barang ini. Biaya persiapan dan pengiriman dihitung sekali per penjual di keranjang.</small></section>`;
}

function offerHistory(record, item) {
  const changed =
    record.referencePriceIdr !== null &&
    record.referencePriceIdr !== item.price;
  return `<p class="buyer-record-time">${record.updatedAt ? "Diperbarui " + esc(buyerDate(record.updatedAt)) : "Draf lama · waktu awal tidak tercatat"}</p>${record.referencePriceIdr === null ? '<p class="buyer-record-hint">Harga barang saat draf awal dibuat tidak tercatat.</p>' : changed ? `<p class="buyer-notice">Harga barang berubah: saat draf dibuat ${formatPrice(record.referencePriceIdr)}, sekarang ${formatPrice(item.price)}. ${record.amountIdr > item.price ? "Sesuaikan jumlah sebelum menyimpan ulang." : "Periksa kembali sebelum mengubah draf."}</p>` : ""}${item.available === false || ["reserved", "sold"].includes(item.status) ? '<p class="buyer-notice">Barang sedang tidak tersedia. Draf tetap dapat dibaca atau dihapus; draf ini tidak memesan barang.</p>' : ""}`;
}

export function renderOfferStatus(item, { includeEmpty = true } = {}) {
  const record = getOfferDraft(item.id);
  if (!record)
    return includeEmpty && item.available !== false
      ? `<div class="buyer-offer-entry">${button("Siapkan penawaran", "offer", "button secondary", `data-id="${esc(item.id)}"`)}<small>Draf pribadi · belum dikirim</small></div>`
      : "";
  return `<section class="buyer-offer-status" aria-label="Draf penawaran lokal"><span class="eyebrow">DRAF PENAWARAN LOKAL</span><strong>${formatPrice(record.amountIdr)}</strong><span class="buyer-storage-label">${esc(persistenceCopy(buyerPersistenceStatus()))} · belum dikirim</span>${offerHistory(record, item)}<div class="buyer-record-actions">${button("Lihat draf penawaran", "offer", "text-button", `data-id="${esc(item.id)}"`)}${button("Hapus draf", "delete-offer", "text-button buyer-delete", `data-id="${esc(item.id)}"`)}</div></section>`;
}

export function renderOfferComposer(
  item,
  { draft = getOfferDraft(item.id), amount, note, errors = {}, outcome } = {},
) {
  const value = amount ?? (draft ? String(draft.amountIdr) : "");
  const noteValue = note ?? draft?.note ?? "";
  const parsed = parseRupiahInput(value);
  return `<form data-offer data-id="${esc(item.id)}" class="composer buyer-offer-composer" novalidate>
    <header><span class="eyebrow">CATATAN PRIBADI</span><h2 id="offer-title">Draf penawaran</h2></header>
    <div class="buyer-offer-context">${image(item.photos[0])}<div><h3>${esc(item.title)}</h3><p>${esc(item.seller.name)} · ${esc(item.location)}</p><span>1 barang</span></div></div>
    <p id="offer-scope">Simpan rencana harga dan catatan di perangkat ini. Draf belum dikirim kepada penjual dan tidak mengubah harga di keranjang.</p>
    ${draft ? offerHistory(draft, item) : ""}
    <dl class="buyer-offer-asking"><div><dt>Harga barang saat ini</dt><dd>${formatPrice(item.price)}</dd></div>${draft?.referencePriceIdr !== null && draft?.referencePriceIdr !== undefined ? `<div><dt>Harga saat draf awal dibuat</dt><dd>${formatPrice(draft.referencePriceIdr)}</dd></div>` : ""}</dl>
    <label for="offer-amount">Harga penawaran untuk 1 barang (Rp)</label><input id="offer-amount" name="amount" type="text" inputmode="numeric" autocomplete="off" required maxlength="40" value="${esc(value)}" placeholder="Misalnya 2.200.000" aria-invalid="${Boolean(errors.amount)}" aria-describedby="offer-amount-help offer-amount-error">
    <p class="buyer-field-help" id="offer-amount-help">Rupiah utuh, dari Rp1 sampai ${formatPrice(item.price)}. Gunakan angka biasa atau titik ribuan; biaya contoh di luar nilai ini.</p>
    <p class="buyer-field-error" id="offer-amount-error" ${errors.amount ? "" : "hidden"}>${esc(errors.amount || "")}</p>
    <p class="buyer-offer-preview" data-offer-preview>${parsed !== null && parsed > 0 ? "Nilai penawaran: " + formatPrice(parsed) : "Nilai penawaran akan tampil di sini."}</p>
    <label for="offer-note">Catatan pribadi (opsional)</label><textarea id="offer-note" name="note" rows="4" maxlength="500" style="resize:none" aria-invalid="${Boolean(errors.note)}" aria-describedby="offer-note-help offer-note-error" placeholder="Rencana pengambilan atau hal yang ingin diperiksa">${esc(noteValue)}</textarea>
    <p class="buyer-field-help" id="offer-note-help"><span data-offer-note-count>${noteValue.length}</span>/500 karakter. Enter membuat baris baru.</p><p class="buyer-field-error" id="offer-note-error" ${errors.note ? "" : "hidden"}>${esc(errors.note || "")}</p>
    <p class="buyer-field-error" data-offer-error role="status" ${errors.form ? "" : "hidden"}>${esc(errors.form || "")}</p>
    ${outcome ? `<p class="buyer-notice">${esc(persistenceCopy(outcome))}${outcome === "temporary-in-tab" ? ". Penyimpanan perangkat tidak tersedia; muat ulang dapat menghapus draf." : "."}</p>` : ""}
    <footer class="buyer-composer-actions">${button("Batal", "close-modal", "button secondary")}<button class="button" type="submit">Simpan draf ${icon("check")}</button></footer>
  </form>`;
}

function undoNotice() {
  return canUndoBuyerDeletion()
    ? `<div class="buyer-undo" role="status"><span>Catatan lokal dihapus.</span>${button("Urungkan", "undo-buyer-delete", "text-button")}</div>`
    : "";
}
function recordsNotice() {
  return `${buyerPersistenceStatus() === "temporary-in-tab" ? '<div class="buyer-notice" role="status">Tersedia selama sesi ini. Penyimpanan perangkat tidak tersedia; muat ulang dapat menghapus catatan baru.</div>' : ""}${buyerRecoveryCount() ? '<div class="buyer-notice">Sebagian catatan lokal tidak dapat dibaca. Catatan lain yang valid tetap tersedia.</div>' : ""}`;
}

export function renderBuyerSaved({
  view = "barang",
  savedIds = [],
  renderCard = fallbackCard,
  summaryId = null,
  collectionId = null,
} = {}) {
  if (summaryId) return renderSavedSummary(summaryId);
  const state = readMarketState(),
    offers = listOfferDrafts(),
    summaries = listSummarySnapshots();
  const items = [...new Set(savedIds)]
    .map((id) => getListing(id))
    .filter(Boolean);
  const selected = ["barang", "koleksi", "draf", "ringkasan"].includes(view)
    ? view
    : "barang";
  const tabs = [
    ["barang", "Barang", items.length],
    ["koleksi", "Koleksi", state.collections.length],
    ["draf", "Draf penawaran", offers.length],
    ["ringkasan", "Ringkasan", summaries.length],
  ];
  let content = "";
  if (selected === "barang")
    content = items.length
      ? `<div class="saved-toolbar">${button("Simpan sebagai koleksi", "collection", "button secondary")}${link("/beli", "Tambah pilihan " + icon("arrow"), "text-link")}</div><div class="product-grid saved-grid">${items.map(renderCard).join("")}</div>`
      : empty(
          "Simpan yang ingin dilihat lagi",
          "Ketuk ikon hati pada furnitur untuk menyimpannya di perangkat ini.",
        );
  if (selected === "koleksi") {
    const current = state.collections.find((item) => item.id === collectionId);
    if (current) {
      const members = current.ids.map((id) => getListing(id)).filter(Boolean);
      content = `<section class="buyer-collection-detail">${link("/tersimpan?view=koleksi", icon("back") + " Semua koleksi", "text-link")}<div class="section-heading"><div><h2>${esc(current.name)}</h2><p>${members.length} barang dalam koleksi.</p></div>${button("Pilih untuk dibandingkan", "collection-compare", "button secondary", `data-id="${esc(current.id)}"`)}</div><div class="product-grid saved-grid">${members.map((item) => `<div>${renderCard(item)}${button("Hapus dari koleksi", "remove-from-collection", "text-button", `data-id="${esc(current.id)}" data-listing="${esc(item.id)}"`)}</div>`).join("")}</div>${
        items.filter((item) => !current.ids.includes(item.id)).length
          ? `<form data-collection-members data-id="${esc(current.id)}" class="buyer-collection-members" novalidate><label for="collection-member">Tambah dari barang tersimpan</label><select id="collection-member" name="listing">${items
              .filter((item) => !current.ids.includes(item.id))
              .map(
                (item) =>
                  `<option value="${esc(item.id)}">${esc(item.title)}</option>`,
              )
              .join(
                "",
              )}</select><button type="submit" class="button secondary">Tambah ke koleksi</button></form>`
          : ""
      }</section>`;
    } else
      content = state.collections.length
        ? `<div class="buyer-collection-grid">${state.collections
            .map(
              (collection) =>
                `<article class="buyer-collection-card"><div class="buyer-collection-images">${
                  collection.ids
                    .slice(0, 3)
                    .map((id) => getListing(id))
                    .filter(Boolean)
                    .map((item) => image(item.photos[0]))
                    .join("") || icon("bookmark")
                }</div><h2>${link("/tersimpan?view=koleksi&collection=" + encodeURIComponent(collection.id), esc(collection.name))}</h2><p>${collection.ids.length} barang contoh</p><div class="buyer-record-actions">${link("/tersimpan?view=koleksi&collection=" + encodeURIComponent(collection.id), "Buka koleksi", "button secondary")}${button("Hapus", "delete-collection", "text-button buyer-delete", `data-id="${esc(collection.id)}" aria-label="Hapus koleksi ${esc(collection.name)}"`)}</div></article>`,
            )
            .join("")}</div>`
        : empty(
            "Koleksi belum dibuat",
            "Simpan beberapa barang, lalu salin pilihanmu sebagai koleksi bernama.",
            "/tersimpan?view=barang",
            "Lihat barang tersimpan",
          );
  }
  if (selected === "draf")
    content = offers.length
      ? `<p class="buyer-workspace-intro">Draf ini belum dikirim dan tidak mengubah harga di keranjang.</p><div class="buyer-record-list">${offers
          .map((record) => {
            const item = getListing(record.listingId);
            return item
              ? `<article class="buyer-record-card"><div class="buyer-record-context">${link("/barang/" + item.id, image(item.photos[0]))}<div><span class="eyebrow">1 BARANG · DRAF LOKAL</span><h2>${link("/barang/" + item.id, esc(item.title))}</h2><p>${esc(item.seller.name)} · ${esc(item.location)}</p></div></div><div class="buyer-record-numbers"><span>Harga barang saat ini <strong>${formatPrice(item.price)}</strong></span><span>Penawaran pribadi <strong>${formatPrice(record.amountIdr)}</strong></span></div>${record.note ? `<p class="buyer-saved-note">${esc(record.note)}</p>` : '<p class="buyer-record-hint">Tanpa catatan tambahan.</p>'}<span class="buyer-storage-label">${esc(persistenceCopy(buyerPersistenceStatus()))} · belum dikirim</span>${offerHistory(record, item)}<div class="buyer-record-actions">${button("Lihat / ubah draf", "offer", "button secondary", `data-id="${esc(item.id)}"`)}${button("Hapus draf", "delete-offer", "text-button buyer-delete", `data-id="${esc(item.id)}"`)}</div></article>`
              : "";
          })
          .join("")}</div>`
      : empty(
          "Belum ada draf penawaran",
          "Buka barang lalu pilih Siapkan penawaran untuk menyimpan rencana harga dan catatan pribadi.",
        );
  if (selected === "ringkasan")
    content = summaries.length
      ? `<p class="buyer-workspace-intro">Hingga 10 ringkasan terakhir. Isi ringkasan mengikuti pilihan saat disimpan.</p><div class="buyer-record-list">${summaries.map((record) => `<article class="buyer-record-card buyer-summary-card"><div><span class="eyebrow">RINGKASAN LOKAL</span><h2>${record.items.length} barang · ${formatPrice(record.total)}</h2><p>${esc(buyerDate(record.savedAt))}</p><p>${record.items.map((item) => esc(item.title)).join(" · ")}</p><span class="buyer-storage-label">${esc(persistenceCopy(buyerPersistenceStatus()))}</span></div><div class="buyer-record-actions">${link("/tersimpan?view=ringkasan&summary=" + encodeURIComponent(record.id), "Buka ringkasan " + icon("arrow"), "button secondary")}${button("Hapus", "delete-summary", "text-button buyer-delete", `data-id="${esc(record.id)}" aria-label="Hapus ringkasan ${esc(buyerDate(record.savedAt))}"`)}</div></article>`).join("")}</div>`
      : empty(
          "Belum ada ringkasan",
          "Tambahkan furnitur ke keranjang, tinjau total contoh, lalu simpan ringkasannya.",
          "/keranjang",
          "Buka keranjang",
        );
  return `<div class="page-heading buyer-workspace-heading"><span class="eyebrow">RUANG UNTUK MEMPERTIMBANGKAN</span><h1>Pilihan tersimpan.</h1><p>Barang dan catatan pribadi di browser ini.</p></div><nav class="buyer-workspace-tabs" aria-label="Pilihan tersimpan">${tabs.map(([id, label, count]) => link("/tersimpan?view=" + id, `${label}<span>${count}</span>`, selected === id ? "selected" : "", selected === id ? 'aria-current="page"' : "")).join("")}</nav>${recordsNotice()}${undoNotice()}${content}`;
}

const totalList = (totals) =>
  `<dl class="buyer-total-list"><div><dt>Harga ${totals.items.length} barang</dt><dd>${formatPrice(totals.subtotal)}</dd></div><div><dt>Biaya persiapan contoh</dt><dd>${formatPrice(totals.preparedFee)}</dd></div><div><dt>Pengiriman contoh</dt><dd>${formatPrice(totals.deliveryFee)}</dd></div><div class="total"><dt>Total contoh</dt><dd>${formatPrice(totals.total)}</dd></div></dl>`;

export function renderBuyerCart({ review = false, undoCartId = null } = {}) {
  const state = readMarketState(),
    totals = checkoutTotals(state.cart, state.checkout);
  const excluded = totals.excludedIds.length
    ? `<div class="buyer-notice" role="status"><strong>${totals.excludedIds.length} barang sedang tidak tersedia.</strong><p>Barang ini dikeluarkan dari total. Hapus dari keranjang sebelum menyimpan ringkasan.</p>${totals.excludedIds.map((id) => `<div class="buyer-record-actions"><span>${esc(getListing(id)?.title || id)}</span>${button("Hapus dari keranjang", "remove-cart", "text-button", `data-id="${esc(id)}"`)}</div>`).join("")}</div>`
    : "";
  const undo = undoCartId
    ? `<div class="buyer-undo" role="status"><span>Barang dihapus dari keranjang.</span>${button("Urungkan", "undo-cart", "text-button", `data-id="${esc(undoCartId)}"`)}</div>`
    : "";
  const heading = `<div class="page-heading"><span class="eyebrow">${review ? "SEBELUM MENYIMPAN" : "PILIHAN UNTUK RUANGMU"}</span><h1>${review ? "Tinjau pilihanmu." : "Keranjang furnitur."}</h1><p>${review ? "Periksa barang, cara menerima, dan total contoh yang akan disimpan." : `${totals.items.length} barang · satu unit untuk setiap furnitur.`}</p></div>${marketPersistenceStatus() === "temporary-in-tab" ? '<p class="buyer-notice">Keranjang tersedia selama sesi ini. Penyimpanan perangkat tidak tersedia.</p>' : ""}${undo}${excluded}`;
  if (!totals.items.length)
    return (
      heading +
      empty(
        "Keranjangmu masih kosong",
        "Lihat barang dari dekat, lalu tambahkan pilihanmu di sini.",
      )
    );
  return `${heading}<div class="cart-layout buyer-cart-layout ${review ? "buyer-review-layout" : ""}"><section class="buyer-cart-groups" aria-label="Barang pilihan">${totals.groups.map((group) => `<article class="seller-cart"><h2>${icon("bag")}${esc(group.sellerName)}<small>${group.items.length} barang</small></h2>${group.items.map((item) => `<div class="cart-line">${link("/barang/" + item.id, image(item.photos[0]))}<div><h3>${link("/barang/" + item.id, esc(item.title))}</h3><p>${esc(item.condition)}</p><span class="dimension-tag">${dimensions(item)}</span><small>1 barang · ${esc(item.location)}</small><strong>${formatPrice(item.price)}</strong></div>${!review ? button(icon("close"), "remove-cart", "icon-button", `data-id="${esc(item.id)}" aria-label="Hapus ${esc(item.title)} dari keranjang"`) : ""}</div>`).join("")}<div class="seller-fees"><span>Biaya persiapan contoh</span><strong>${formatPrice(group.preparedFee)}</strong><span>${totals.delivery === "delivery" ? "Pengiriman contoh" : "Ambil sendiri"}</span><strong>${formatPrice(group.deliveryFee)}</strong><span>Total penjual ini</span><strong>${formatPrice(group.total)}</strong></div></article>`).join("")}<div class="cart-explanation">${icon("info")}<p>Biaya persiapan dan pengiriman contoh dihitung sekali per penjual. Draf penawaran tidak mengubah harga pilihan.</p></div></section><aside class="cart-summary"><h2>${review ? "Yang akan disimpan" : "Ringkasan pilihan"}</h2>${
    review
      ? `<div class="buyer-review-fulfilment"><span>Cara menerima barang</span><strong>${totals.delivery === "delivery" ? "Pengiriman contoh" : "Ambil sendiri"}</strong><small>${totals.groups.length} penjual · ${totals.items.length} barang</small></div>`
      : `<fieldset class="fulfilment-choice"><legend>Cara menerima barang</legend>${[
          ["pickup", "Ambil sendiri"],
          ["delivery", "Pengiriman contoh"],
        ]
          .map(
            ([value, label]) =>
              `<label><input name="cart-delivery" type="radio" value="${value}" ${totals.delivery === value ? "checked" : ""}><span><strong>${label}</strong><small>${value === "pickup" ? "Tanpa biaya kirim" : "Rp150.000 per penjual"}</small></span></label>`,
          )
          .join("")}</fieldset>`
  }${totalList(totals)}${review ? `${button("Simpan ringkasan lokal " + icon("check"), "save-summary", "button", totals.excludedIds.length ? "disabled" : "")}${link("/keranjang", "Ubah pilihan", "text-link buyer-edit-cart")}<p class="buyer-record-hint">Barang, harga, ukuran, dan biaya saat ini akan disalin ke ringkasan.</p>` : link("/tinjau-pesanan", "Tinjau pilihan " + icon("arrow"), "button")}${localNote}</aside></div>`;
}

export function renderSavedSummary(id) {
  const record = getSummarySnapshot(id);
  if (!record)
    return `<div class="page-heading"><h1>Ringkasan tidak ditemukan.</h1></div>${empty("Lihat ringkasan lain", "Ringkasan ini mungkin dihapus atau tidak tersedia di browser ini.", "/tersimpan?view=ringkasan", "Buka ringkasan tersimpan")}`;
  const outcome = buyerPersistenceStatus();
  return `<div class="breadcrumb">${link("/tersimpan?view=ringkasan", "Ringkasan tersimpan")}<span>/</span>Ringkasan pilihan</div><div class="page-heading buyer-snapshot-heading"><span class="eyebrow">CATATAN PILIHAN LOKAL</span><h1>${outcome === "device-persistent" ? "Ringkasan tersimpan di perangkat ini." : "Ringkasan tersedia selama sesi ini."}</h1><p>Disimpan ${esc(buyerDate(record.savedAt))}. Isi mengikuti pilihan saat disimpan.</p></div>${recordsNotice()}${undoNotice()}<div class="cart-layout buyer-cart-layout buyer-snapshot-layout"><section aria-label="Barang dalam ringkasan">${record.groups
    .map(
      (group) =>
        `<article class="seller-cart"><h2>${icon("bag")}${esc(group.sellerName)}<small>${group.ids.length} barang</small></h2>${group.ids
          .map((listingId) => {
            const item = record.items.find(
                (value) => value.listingId === listingId,
              ),
              current = getListing(listingId),
              changed = current && current.price !== item.priceIdr;
            return `<div class="cart-line buyer-snapshot-line">${link("/barang/" + listingId, image({ src: item.image, alt: item.title }))}<div><h3>${link("/barang/" + listingId, esc(item.title))}</h3><p>${esc(item.condition)}</p><span class="dimension-tag">${dimensions(item)}</span><small>1 barang · ${esc(item.location)}</small><strong>${formatPrice(item.priceIdr)}</strong>${!current || current.available === false || ["reserved", "sold"].includes(current.status) ? '<p class="buyer-notice">Barang sekarang tidak tersedia. Ringkasan lama tetap sama.</p>' : changed ? `<p class="buyer-notice">Harga saat ini ${formatPrice(current.price)}. Harga dalam ringkasan tetap ${formatPrice(item.priceIdr)}.</p>` : ""}</div></div>`;
          })
          .join(
            "",
          )}<div class="seller-fees"><span>Biaya persiapan contoh saat disimpan</span><strong>${formatPrice(group.preparedFee)}</strong><span>${record.delivery === "delivery" ? "Pengiriman contoh saat disimpan" : "Ambil sendiri"}</span><strong>${formatPrice(group.deliveryFee)}</strong><span>Total penjual ini</span><strong>${formatPrice(group.total)}</strong></div></article>`,
    )
    .join(
      "",
    )}</section><aside class="cart-summary"><h2>Ringkasan tersimpan</h2><div class="buyer-review-fulfilment"><span>Cara menerima barang</span><strong>${record.delivery === "delivery" ? "Pengiriman contoh" : "Ambil sendiri"}</strong></div>${totalList(record)}${localNote}<div class="buyer-snapshot-actions">${link("/tersimpan?view=ringkasan", "Semua ringkasan", "button secondary")}${link("/beli", "Lanjut jelajahi furnitur", "text-link")}${button("Hapus ringkasan", "delete-summary", "text-button buyer-delete", `data-id="${esc(record.id)}"`)}</div></aside></div>`;
}
