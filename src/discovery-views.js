import {
  AVAILABLE_LISTINGS,
  getListing as canonicalListing,
  formatPrice,
} from "./catalogue.js";
import { esc, icon, link, button, image } from "./components.js";
import {
  parseFilters,
  getFacets,
  filterCatalogue,
  parseWholeRupiah,
  activeGroupCount,
  parsePreparedReference,
  preparedCandidates,
} from "./discovery.js";

const ARRAY_KEYS = ["categories", "conditions", "materials", "locations"];
const DIMENSIONS = [
  ["width", "Lebar"],
  ["depth", "Kedalaman"],
  ["height", "Tinggi"],
];
const GROUP_LABELS = {
  categories: "Kategori furnitur",
  conditions: "Kondisi",
  materials: "Material",
  locations: "Lokasi penjual",
};
const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

// The form retains raw input until validation succeeds. In particular, invalid
// price ranges never become an apparently valid zero-result preview.
export function readFilterEntries(entries) {
  const params = new URLSearchParams(),
    raw = {};
  for (const [key, value] of entries) {
    if (ARRAY_KEYS.includes(key)) params.append(key, String(value));
    else raw[key] = String(value);
  }
  for (const key of ["q", "sort", "model"])
    if (raw[key]) params.set(key, raw[key]);
  const errors = {};
  for (const key of ["min", "max"]) {
    const parsed = parseWholeRupiah(raw[key]);
    if (parsed.error) errors[key] = parsed.error;
    else if (parsed.value !== null) params.set(key, String(parsed.value));
  }
  if (
    !errors.min &&
    !errors.max &&
    params.has("min") &&
    params.has("max") &&
    Number(params.get("min")) > Number(params.get("max"))
  )
    errors.max =
      "Harga maksimal harus sama dengan atau lebih besar dari harga minimal.";
  for (const [key, label] of DIMENSIONS) {
    const value = (raw[key] ?? "").trim();
    if (!value) continue;
    if (
      !/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value) ||
      !Number.isFinite(Number(value.replace(",", "."))) ||
      Number(value.replace(",", ".")) < 0
    )
      errors[key] = `${label} harus berupa angka nol atau lebih, dalam cm.`;
    else params.set(key, value.replace(",", "."));
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    filter: parseFilters(params),
    raw,
  };
}

export function createDiscoveryViews({
  catalogue = () => AVAILABLE_LISTINGS,
  getListing = canonicalListing,
  card = () => "",
  shell = (html) => html,
} = {}) {
  function filterGroup(key, f, facets = getFacets(catalogue())) {
    // Counts are deliberately omitted here: these are available criteria, not
    // misleading global counts presented as contextual match counts.
    const options = [...(facets[key] ?? [])];
    for (const value of f[key] ?? [])
      if (!options.some((option) => option.value === value))
        options.push({ value, label: value });
    return `<fieldset><legend>${GROUP_LABELS[key]}</legend>${options.map(({ value, label }) => `<label class="check-row"><input type="checkbox" name="${key}" value="${esc(value)}" ${(f[key] ?? []).includes(value) ? "checked" : ""}><span>${esc(label)}</span></label>`).join("")}</fieldset>`;
  }

  function filterForm(f, mobile = false) {
    const facets = getFacets(catalogue()),
      prefix = mobile ? "sheet" : "rail",
      count = filterCatalogue(catalogue(), f).length;
    return `<form data-filters novalidate class="filter-form discovery-filter-form" data-filter-mode="${mobile ? "sheet" : "rail"}"><input type="hidden" name="q" value="${esc(f.q)}"><input type="hidden" name="sort" value="${esc(f.sort)}"><div class="filter-heading"><h2>${icon("filter")} Sesuaikan pilihan</h2>${button("Reset", "filter-reset", "text-button", 'aria-label="Reset penyaring, pertahankan pencarian dan urutan"')}</div><p class="filter-draft-help">Perubahan diterapkan setelah memilih Tampilkan barang.</p><div class="filter-fields">${filterGroup("categories", f, facets)}<fieldset><legend>Rentang harga</legend><p class="field-hint" id="${prefix}-price-help">Rupiah bulat. Kolom kosong berarti tanpa batas.</p><div class="filter-numbers">${[
      ["min", "Harga minimal"],
      ["max", "Harga maksimal"],
    ]
      .map(
        ([key, label]) =>
          `<label for="${prefix}-${key}">${label}<span class="filter-money-input"><small>Rp</small><input id="${prefix}-${key}" name="${key}" type="text" inputmode="numeric" autocomplete="off" placeholder="Tanpa batas" value="${f[key] ?? ""}" aria-describedby="${prefix}-price-help ${prefix}-${key}-error"></span><small class="filter-field-error" id="${prefix}-${key}-error" data-error-for="${key}" hidden></small></label>`,
      )
      .join(
        "",
      )}</div><p class="field-hint price-range-help" data-price-summary>${priceSummary(f)}</p></fieldset><fieldset><legend>Dimensi maksimal</legend><p class="field-hint">Dalam cm; kolom kosong berarti tanpa batas.</p><div class="dimension-fields">${DIMENSIONS.map(([key, label]) => `<label for="${prefix}-${key}">${label}<span><input id="${prefix}-${key}" name="${key}" type="text" inputmode="decimal" autocomplete="off" placeholder="Tanpa batas" value="${f[key] ?? ""}" aria-describedby="${prefix}-${key}-error"><small>cm</small></span><small class="filter-field-error" id="${prefix}-${key}-error" data-error-for="${key}" hidden></small></label>`).join("")}</div></fieldset><fieldset><legend>Media inspeksi</legend><label class="check-row"><input type="checkbox" name="model" value="1" ${f.model ? "checked" : ""}><span>Model 3D tersedia</span></label></fieldset>${["conditions", "materials", "locations"].map((key) => filterGroup(key, f, facets)).join("")}</div><p class="filter-validation-status" data-filter-status role="status" aria-live="polite"></p><div class="filter-submit"><button class="button" type="submit"><span data-filter-action-label>Tampilkan <span data-filter-preview>${count}</span> barang</span>${icon("arrow")}</button>${button("Batal", "filter-cancel", "button secondary")}</div></form>`;
  }

  function validateForm(form, { focus = false } = {}) {
    const result = readFilterEntries(new FormData(form).entries());
    for (const key of ["min", "max", ...DIMENSIONS.map(([name]) => name)]) {
      const field = form.elements.namedItem(key),
        error = form.querySelector(`[data-error-for="${key}"]`);
      if (field) {
        field.setAttribute(
          "aria-invalid",
          result.errors[key] ? "true" : "false",
        );
        field.setCustomValidity?.(result.errors[key] ?? "");
      }
      if (error) {
        error.textContent = result.errors[key] ?? "";
        error.hidden = !result.errors[key];
      }
    }
    const status = form.querySelector("[data-filter-status]");
    if (status)
      status.textContent = result.valid
        ? ""
        : "Periksa isian yang ditandai sebelum menerapkan filter.";
    if (focus && !result.valid)
      form.elements.namedItem(Object.keys(result.errors)[0])?.focus();
    return result;
  }

  function readForm(form) {
    return readFilterEntries(new FormData(form).entries()).filter;
  }

  function updatePreview(form) {
    const result = validateForm(form),
      label = form.querySelector("[data-filter-action-label]"),
      priceHelp = form.querySelector("[data-price-summary]");
    if (label)
      label.innerHTML = result.valid
        ? `Tampilkan <span data-filter-preview>${filterCatalogue(catalogue(), result.filter).length}</span> barang`
        : "Periksa isian filter";
    if (priceHelp)
      priceHelp.textContent =
        result.errors.min || result.errors.max
          ? ""
          : priceSummary(result.filter);
    return result;
  }

  function activeFilterChips(f) {
    const labels = [];
    if (f.q) labels.push(["q", f.q, `Pencarian: “${f.q}”`]);
    for (const key of ARRAY_KEYS)
      (f[key] ?? []).forEach((value) => labels.push([key, value, value]));
    for (const [key, label] of [
      ["min", "Mulai"],
      ["max", "Hingga"],
      ["width", "Lebar ≤"],
      ["depth", "Kedalaman ≤"],
      ["height", "Tinggi ≤"],
    ])
      if (f[key] !== null)
        labels.push([
          key,
          "",
          `${label} ${["min", "max"].includes(key) ? formatPrice(f[key]) : number.format(f[key]) + " cm"}`,
        ]);
    if (f.model) labels.push(["model", "", "3D tersedia"]);
    return labels.length
      ? `<div class="active-filters" aria-label="Pencarian dan filter yang diterapkan">${labels.map(([key, value, label]) => button(`${esc(label)}${icon("close")}`, "remove-filter", "filter-chip", `data-key="${key}" data-value="${esc(value)}" aria-label="Hapus ${esc(label)}"`)).join("")}${activeGroupCount(f) ? button("Hapus filter", "clear-filters", "text-button", 'aria-label="Hapus penyaring, pertahankan pencarian dan urutan"') : ""}</div>`
      : "";
  }

  function noResults(f) {
    return `<div class="empty-state discovery-no-results">${icon("search")}<h2>Belum ada furnitur yang cocok</h2><p>${f.q ? `Pencarian “${esc(f.q)}” belum memiliki hasil${activeGroupCount(f) ? " dengan filter ini" : ""}.` : "Belum ada barang dengan gabungan filter ini."} Hapus satu pilihan di atas atau longgarkan batas harga dan ukuran.</p><div class="empty-recovery">${activeGroupCount(f) ? button("Hapus filter", "clear-filters", "button") : ""}${f.q ? button("Hapus kata pencarian", "remove-filter", "button secondary", 'data-key="q" data-value=""') : ""}${link("/beli", "Mulai pencarian baru", "text-link")}</div></div>`;
  }

  function photoSearch(
    params = new URLSearchParams(globalThis.location?.search ?? ""),
  ) {
    const state = parsePreparedReference(params),
      source = getListing(state.source),
      candidates = preparedCandidates(catalogue(), state);
    return shell(
      `<div class="breadcrumb">${link("/beli", "Koleksi furnitur")}<span>/</span>Acuan bentuk</div><header class="prepared-page-heading"><span class="eyebrow">CARI DARI ACUAN</span><h1>Bentuk yang menarik.<br><span>Pilihan yang bisa diperiksa.</span></h1><p>Pilih salah satu acuan contoh, lalu bandingkan furnitur dan ukurannya.</p></header><section class="camera-results-section prepared-discovery" id="camera-results" tabindex="-1" aria-labelledby="prepared-results-title"><aside class="prepared-reference-panel" aria-label="Acuan dan batas ukuran"><div class="camera-selected-reference">${image(source.photos[0])}<div><span class="eyebrow">ACUAN CONTOH</span><strong>${esc(source.title)}</strong><small>Lebar ${number.format(source.dimensions.width)} cm</small></div></div><label for="prepared-source">Ganti acuan<select id="prepared-source" data-photo-source><option value="arca" ${state.source === "arca" ? "selected" : ""}>Kursi Arca</option><option value="tala" ${state.source === "tala" ? "selected" : ""}>Kursi Tala</option></select></label><form data-photo-limits novalidate><label for="prepared-width">Lebar maksimal (cm)<input id="prepared-width" name="width" aria-describedby="prepared-width-help prepared-width-error" min="1" max="500" step="any" type="number" inputmode="decimal" value="${state.width ?? ""}" placeholder="Tanpa batas"></label><p class="field-hint" id="prepared-width-help">Kosongkan untuk semua lebar.</p><p id="prepared-width-error" class="field-error" data-width-error hidden></p><button class="button secondary" type="submit">Terapkan ukuran ${icon("filter")}</button></form>${button("Reset ukuran", "photo-reset", "text-button", 'aria-label="Hapus batas lebar, pertahankan acuan"')}<p class="prepared-explanation">Acuan dan urutan alternatif disiapkan dari katalog contoh. Ini bukan pencarian gambar otomatis atau unggahan foto.</p></aside><div class="prepared-result-content"><div class="section-heading"><div><span class="eyebrow">PADANAN YANG DISIAPKAN</span><h2 id="prepared-results-title">${candidates.length} pilihan kursi${state.width !== null ? ` · lebar ≤ ${number.format(state.width)} cm` : ""}</h2><p>Acuan muncul lebih dahulu jika ukurannya memenuhi batas.</p></div></div>${candidates.length ? `<div class="product-grid camera-results">${candidates.map((item) => `<div class="search-result">${card(item)}<p class="match-reason">${icon("info")}<span>${preparedReason(item, state.source)}</span></p></div>`).join("")}</div>` : `<div class="empty-state prepared-no-results">${icon("ruler")}<h3>Belum ada pilihan hingga ${number.format(state.width)} cm</h3><p>Lebar ketiga pilihan adalah 58 cm, 72 cm, dan 72,6 cm. Hapus batas lebar untuk melihat kembali semua pilihan.</p>${button("Hapus batas lebar", "photo-reset", "button")}</div>`}</div></section><details class="prepared-motion" data-camera-demo><summary><span>${icon("camera")} Lihat contoh gerakan kamera</span><small>12 detik · menggunakan Kursi Arca</small>${icon("arrow", "prepared-disclosure-icon")}</summary><div class="prepared-motion-body"><p>Demo gerakan ini selalu memakai model Arca, termasuk ketika acuan Tala dipilih. Model dan kontrol terpisah dari pilihan produk di atas.</p><div data-camera-host><div class="camera-loading">Tekan untuk membuka contoh gerakan. Pilihan kursi tetap tersedia di atas.</div></div></div></details>`,
      "camera-page prepared-page",
    );
  }

  return {
    filterForm,
    filterGroup,
    readForm,
    validateForm,
    updatePreview,
    activeFilterChips,
    noResults,
    photoSearch,
  };
}

function priceSummary(f) {
  if (f.min === null && f.max === null) return "Harga tidak dibatasi.";
  if (f.min === null) return `Hingga ${formatPrice(f.max)}.`;
  if (f.max === null)
    return `Mulai ${formatPrice(f.min)}, tanpa batas maksimal.`;
  return `${formatPrice(f.min)}–${formatPrice(f.max)}.`;
}

function preparedReason(item, source) {
  const reason =
    item.id === source
      ? "Barang pada acuan contoh."
      : item.id === "tala"
        ? "Alternatif rotan dengan bantalan duduk."
        : item.id === "senja"
          ? "Alternatif kursi santai berlapis kain."
          : "Alternatif kayu dengan sandaran tinggi.";
  return `${reason} Lebar ${number.format(item.dimensions.width)} cm.`;
}
