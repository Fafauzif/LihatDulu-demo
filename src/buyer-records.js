import { ALL_LISTINGS } from "./catalogue.js";
import {
  getListing,
  checkoutTotals,
  readMarketState,
  sellerIdentity,
} from "./market-state.js";

// Buyer records are independent of seller edits, evidence and room placements.
export const BUYER_RECORDS_KEY = "lihatdulu:buyer-records:v1";
export const BUYER_RECORDS_SCHEMA = 1;
export const MAX_OFFER_NOTE = 500;
export const MAX_SUMMARIES = 10;
const MAX_AMOUNT = 1000000000;
const MAX_RAW = 240000;
const knownIds = ALL_LISTINGS.map((item) => item.id);
const memory = new Map();
let fallback = false,
  lastOutcome = "device-persistent",
  recoveryCount = 0,
  sequence = 0,
  lastDeletion = null;
const plain = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);
const unicode = (value) =>
  !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
    value,
  );
const text = (value, max) =>
  typeof value === "string" && unicode(value) ? value.slice(0, max) : "";
const money = (value) =>
  Number.isSafeInteger(value) && value >= 0 && value <= MAX_AMOUNT
    ? value
    : null;
const iso = (value) =>
  typeof value === "string" &&
  value.length <= 40 &&
  Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
const clone = (value) => JSON.parse(JSON.stringify(value));
const fresh = () => ({
  schema: BUYER_RECORDS_SCHEMA,
  offers: {},
  summaries: [],
  legacyHandled: [],
});
function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Accept whole rupiah, plain digits or Indonesian three-digit dot groups only. */
export function parseRupiahInput(value) {
  if (typeof value === "number") return money(value) !== null ? value : null;
  if (typeof value !== "string" || value.length > 40) return null;
  const raw = value.trim().replace(/^Rp\s*/i, "");
  if (!/^\d+$/.test(raw) && !/^\d{1,3}(?:\.\d{3})+$/.test(raw)) return null;
  const parsed = Number(raw.replaceAll(".", ""));
  return money(parsed);
}

function normalizeOffer(value, id) {
  if (
    !plain(value) ||
    value.schema !== BUYER_RECORDS_SCHEMA ||
    value.listingId !== id ||
    !knownIds.includes(id)
  )
    return null;
  const amountIdr = money(value.amountIdr);
  if (
    amountIdr === null ||
    amountIdr < 1 ||
    typeof value.note !== "string" ||
    !unicode(value.note)
  )
    return null;
  return {
    schema: BUYER_RECORDS_SCHEMA,
    listingId: id,
    amountIdr,
    note: value.note.slice(0, MAX_OFFER_NOTE),
    referencePriceIdr: money(value.referencePriceIdr),
    createdAt: iso(value.createdAt),
    updatedAt: iso(value.updatedAt),
    migratedAt: iso(value.migratedAt),
  };
}

function normalizeItem(value) {
  if (
    !plain(value) ||
    !knownIds.includes(value.listingId) ||
    !text(value.title, 160) ||
    money(value.priceIdr) === null ||
    !text(value.sellerId, 80)
  )
    return null;
  const dimensions = value.dimensions;
  if (
    !plain(dimensions) ||
    ["width", "depth", "height"].some(
      (key) =>
        typeof dimensions[key] !== "number" ||
        !Number.isFinite(dimensions[key]) ||
        dimensions[key] <= 0 ||
        dimensions[key] > 1000,
    )
  )
    return null;
  const image =
    typeof value.image === "string" &&
    /^\/images\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpe?g)$/.test(value.image)
      ? value.image
      : "";
  return {
    listingId: value.listingId,
    title: text(value.title, 160),
    category: text(value.category, 80),
    priceIdr: value.priceIdr,
    sellerId: text(value.sellerId, 80),
    sellerName: text(value.sellerName, 100),
    location: text(value.location, 100),
    condition: text(value.condition, 300),
    material: text(value.material, 500),
    dimensions: {
      width: dimensions.width,
      depth: dimensions.depth,
      height: dimensions.height,
    },
    image,
  };
}

function normalizeSummary(value) {
  if (
    !plain(value) ||
    value.schema !== BUYER_RECORDS_SCHEMA ||
    !/^local-[a-z0-9-]{1,60}$/.test(value.id || "") ||
    !iso(value.savedAt) ||
    !["pickup", "delivery"].includes(value.delivery) ||
    !Array.isArray(value.items) ||
    value.items.length < 1 ||
    value.items.length > 10 ||
    !Array.isArray(value.groups)
  )
    return null;
  const items = value.items.map(normalizeItem);
  if (
    items.some((item) => !item) ||
    new Set(items.map((item) => item.listingId)).size !== items.length
  )
    return null;
  const groups = [];
  const seen = new Set();
  for (const candidate of value.groups) {
    if (
      !plain(candidate) ||
      typeof candidate.sellerId !== "string" ||
      seen.has(candidate.sellerId)
    )
      return null;
    const members = items.filter(
      (item) => item.sellerId === candidate.sellerId,
    );
    if (
      !members.length ||
      !Array.isArray(candidate.ids) ||
      candidate.ids.length !== members.length ||
      candidate.ids.some((id, index) => id !== members[index].listingId) ||
      money(candidate.preparedFee) === null ||
      money(candidate.deliveryFee) === null
    )
      return null;
    const subtotal = members.reduce((sum, item) => sum + item.priceIdr, 0);
    if (
      candidate.subtotal !== subtotal ||
      candidate.total !==
        subtotal + candidate.preparedFee + candidate.deliveryFee
    )
      return null;
    groups.push({
      sellerId: text(candidate.sellerId, 80),
      sellerName: text(candidate.sellerName, 100),
      ids: members.map((item) => item.listingId),
      subtotal,
      preparedFee: candidate.preparedFee,
      deliveryFee: candidate.deliveryFee,
      total: candidate.total,
    });
    seen.add(candidate.sellerId);
  }
  if (items.some((item) => !seen.has(item.sellerId))) return null;
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const preparedFee = groups.reduce((sum, group) => sum + group.preparedFee, 0);
  const deliveryFee = groups.reduce((sum, group) => sum + group.deliveryFee, 0);
  const total = subtotal + preparedFee + deliveryFee;
  if (
    value.subtotal !== subtotal ||
    value.preparedFee !== preparedFee ||
    value.deliveryFee !== deliveryFee ||
    value.total !== total ||
    !Number.isSafeInteger(total)
  )
    return null;
  return {
    schema: BUYER_RECORDS_SCHEMA,
    id: value.id,
    savedAt: iso(value.savedAt),
    delivery: value.delivery,
    items,
    groups,
    subtotal,
    preparedFee,
    deliveryFee,
    total,
  };
}

export function normalizeBuyerRecords(value) {
  const result = fresh();
  if (!plain(value) || value.schema !== BUYER_RECORDS_SCHEMA) return result;
  result.legacyHandled = Array.isArray(value.legacyHandled)
    ? [
        ...new Set(value.legacyHandled.filter((id) => knownIds.includes(id))),
      ].slice(0, knownIds.length)
    : [];
  if (plain(value.offers))
    for (const id of knownIds) {
      const offer = normalizeOffer(value.offers[id], id);
      if (offer) result.offers[id] = offer;
    }
  const seen = new Set();
  if (Array.isArray(value.summaries))
    for (const candidate of value.summaries.slice(0, MAX_SUMMARIES)) {
      const summary = normalizeSummary(candidate);
      if (summary && !seen.has(summary.id)) {
        result.summaries.push(summary);
        seen.add(summary.id);
      }
    }
  return result;
}

function persist(value) {
  let raw;
  try {
    raw = JSON.stringify(normalizeBuyerRecords(value));
    if (raw.length > MAX_RAW) return "failed";
    memory.set(BUYER_RECORDS_KEY, raw);
  } catch {
    lastOutcome = "failed";
    return "failed";
  }
  try {
    const target = storage();
    if (!target) throw new Error("Storage unavailable");
    target.setItem(BUYER_RECORDS_KEY, raw);
    fallback = false;
    lastOutcome = "device-persistent";
  } catch {
    fallback = true;
    lastOutcome = "temporary-in-tab";
  }
  return lastOutcome;
}

/** Valid legacy content retains unknown original time and price, even after migration. */
function migrateLegacy(state) {
  const target = storage();
  if (!target) return state;
  let changed = false;
  for (const id of knownIds) {
    if (state.offers[id] || state.legacyHandled.includes(id)) continue;
    try {
      const raw = target.getItem("lihatdulu:offer:" + id);
      if (!raw) continue;
      const value = JSON.parse(raw),
        amount = plain(value) ? money(value.amount) : null;
      if (
        amount === null ||
        amount < 1 ||
        typeof value.note !== "string" ||
        !unicode(value.note)
      )
        continue;
      state.offers[id] = {
        schema: BUYER_RECORDS_SCHEMA,
        listingId: id,
        amountIdr: amount,
        note: value.note.slice(0, MAX_OFFER_NOTE),
        referencePriceIdr: null,
        createdAt: null,
        updatedAt: null,
        migratedAt: new Date().toISOString(),
      };
      state.legacyHandled.push(id);
      changed = true;
    } catch {
      /* One malformed old draft cannot erase other records. */
    }
  }
  if (changed) {
    const outcome = persist(state);
    // Remove only drafts copied successfully to durable storage, so deletion
    // cannot resurrect an old-format draft on the next visit.
    if (outcome === "device-persistent")
      for (const id of Object.keys(state.offers))
        try {
          target.removeItem("lihatdulu:offer:" + id);
        } catch {
          /* main record remains authoritative */
        }
  }
  return state;
}

export function readBuyerRecords() {
  let raw = memory.get(BUYER_RECORDS_KEY),
    value = null;
  if (!fallback)
    try {
      const target = storage();
      if (!target) {
        lastOutcome = "temporary-in-tab";
      }
      const stored = target?.getItem(BUYER_RECORDS_KEY);
      if (stored !== null && stored !== undefined) {
        raw = stored;
        lastOutcome = "device-persistent";
      }
    } catch {
      fallback = true;
      lastOutcome = "temporary-in-tab";
    }
  try {
    value =
      typeof raw === "string" && raw.length <= MAX_RAW ? JSON.parse(raw) : null;
  } catch {
    recoveryCount = 1;
  }
  const normalized = normalizeBuyerRecords(value);
  if (plain(value)) {
    const inputCount =
      (plain(value.offers) ? Object.keys(value.offers).length : 0) +
      (Array.isArray(value.summaries) ? value.summaries.length : 0);
    recoveryCount = Math.min(
      20,
      Math.max(
        recoveryCount,
        inputCount -
          Object.keys(normalized.offers).length -
          normalized.summaries.length,
      ),
    );
  }
  return clone(migrateLegacy(normalized));
}

export function buyerPersistenceStatus() {
  return lastOutcome;
}
export function buyerRecoveryCount() {
  return recoveryCount;
}
export function getOfferDraft(id) {
  return readBuyerRecords().offers[id] || null;
}
export function listOfferDrafts() {
  return Object.values(readBuyerRecords().offers).sort((a, b) =>
    (b.updatedAt || b.migratedAt || "").localeCompare(
      a.updatedAt || a.migratedAt || "",
    ),
  );
}

export function validateOfferInput(listing, input = {}) {
  const amountIdr = parseRupiahInput(input.amountIdr ?? input.amount);
  const errors = {};
  if (!listing || !knownIds.includes(listing.id))
    errors.form = "Barang tidak ditemukan. Catatan tetap dapat kamu salin.";
  else if (
    listing.available === false ||
    ["reserved", "sold"].includes(listing.status)
  )
    errors.form =
      "Barang ini sedang tidak tersedia. Draf sebelumnya tetap dapat dibaca atau dihapus.";
  if (amountIdr === null || amountIdr < 1)
    errors.amount =
      "Masukkan rupiah utuh, misalnya 2.200.000. Tanpa desimal atau koma.";
  else if (
    listing &&
    Number.isFinite(listing.price) &&
    amountIdr > listing.price
  )
    errors.amount = "Penawaran tidak boleh melebihi harga barang saat ini.";
  if (
    typeof input.note !== "string" ||
    !unicode(input.note) ||
    input.note.length > MAX_OFFER_NOTE
  )
    errors.note = "Catatan maksimal 500 karakter.";
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    amountIdr,
    note: typeof input.note === "string" ? input.note : "",
  };
}

export function saveOfferDraft(
  id,
  input = {},
  { now = new Date().toISOString(), listing = getListing(id) } = {},
) {
  const checked = validateOfferInput(listing, input);
  if (!checked.valid)
    return {
      ok: false,
      outcome: "failed",
      errors: checked.errors,
      record: null,
    };
  const state = readBuyerRecords(),
    previous = state.offers[id],
    timestamp = iso(now) || new Date().toISOString();
  const record = {
    schema: BUYER_RECORDS_SCHEMA,
    listingId: id,
    amountIdr: checked.amountIdr,
    note: checked.note,
    referencePriceIdr: previous ? previous.referencePriceIdr : listing.price,
    createdAt: previous ? previous.createdAt : timestamp,
    updatedAt: timestamp,
    migratedAt: previous?.migratedAt || null,
  };
  state.offers[id] = record;
  const outcome = persist(state);
  return {
    ok: outcome !== "failed",
    outcome,
    record: clone(record),
    errors:
      outcome === "failed"
        ? {
            form: "Draf belum tersimpan. Pertahankan dialog ini dan coba lagi.",
          }
        : {},
  };
}

export function deleteOfferDraft(id) {
  const state = readBuyerRecords(),
    record = state.offers[id];
  if (!record) return { ok: false, outcome: lastOutcome };
  delete state.offers[id];
  const outcome = persist(state);
  if (outcome !== "failed") {
    lastDeletion = { type: "offer", record: clone(record) };
    try {
      storage()?.removeItem("lihatdulu:offer:" + id);
    } catch {
      /* tab state is authoritative */
    }
  }
  return { ok: outcome !== "failed", outcome, record };
}

export function saveSummarySnapshot(
  ids = readMarketState().cart,
  selection = readMarketState().checkout,
  { now = new Date().toISOString(), baseListings } = {},
) {
  const totals = checkoutTotals(ids, selection, baseListings);
  if (!totals.items.length || totals.excludedIds.length)
    return {
      ok: false,
      outcome: "failed",
      error: totals.excludedIds.length
        ? "Ada barang yang tidak tersedia. Ubah keranjang sebelum menyimpan ringkasan."
        : "Tambahkan barang sebelum menyimpan ringkasan.",
    };
  sequence = (sequence + 1) % 1000000;
  const savedAt = iso(now) || new Date().toISOString();
  const record = {
    schema: BUYER_RECORDS_SCHEMA,
    id: `local-${Date.now().toString(36)}-${sequence.toString(36)}`,
    savedAt,
    delivery: totals.delivery,
    items: totals.items.map((item) => ({
      listingId: item.id,
      title: item.title,
      category: item.category,
      priceIdr: item.price,
      sellerId: sellerIdentity(item),
      sellerName: item.seller.name,
      location: item.location,
      condition: item.condition,
      material: item.material,
      dimensions: { ...item.dimensions },
      image: item.photos[0]?.src || "",
    })),
    groups: totals.groups.map((group) => ({
      sellerId: group.sellerId,
      sellerName: group.sellerName,
      ids: [...group.ids],
      subtotal: group.subtotal,
      preparedFee: group.preparedFee,
      deliveryFee: group.deliveryFee,
      total: group.total,
    })),
    subtotal: totals.subtotal,
    preparedFee: totals.preparedFee,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
  };
  const valid = normalizeSummary(record);
  if (!valid)
    return {
      ok: false,
      outcome: "failed",
      error: "Ringkasan belum tersimpan. Periksa pilihan lalu coba lagi.",
    };
  const state = readBuyerRecords();
  state.summaries = [valid, ...state.summaries].slice(0, MAX_SUMMARIES);
  const outcome = persist(state);
  return { ok: outcome !== "failed", outcome, record: clone(valid) };
}

export function listSummarySnapshots() {
  return readBuyerRecords().summaries;
}
export function getSummarySnapshot(id) {
  return (
    readBuyerRecords().summaries.find((record) => record.id === id) || null
  );
}
export function deleteSummarySnapshot(id) {
  const state = readBuyerRecords(),
    record = state.summaries.find((item) => item.id === id);
  if (!record) return { ok: false, outcome: lastOutcome };
  state.summaries = state.summaries.filter((item) => item.id !== id);
  const outcome = persist(state);
  if (outcome !== "failed")
    lastDeletion = { type: "summary", record: clone(record) };
  return { ok: outcome !== "failed", outcome };
}
export function canUndoBuyerDeletion() {
  return Boolean(lastDeletion);
}
export function undoBuyerDeletion() {
  if (!lastDeletion) return { ok: false, outcome: lastOutcome };
  const state = readBuyerRecords();
  if (lastDeletion.type === "offer")
    state.offers[lastDeletion.record.listingId] = lastDeletion.record;
  else
    state.summaries = [
      lastDeletion.record,
      ...state.summaries.filter((item) => item.id !== lastDeletion.record.id),
    ].slice(0, MAX_SUMMARIES);
  const outcome = persist(state);
  if (outcome !== "failed") lastDeletion = null;
  return { ok: outcome !== "failed", outcome };
}

// Used by explicit local reset and isolated tests; unrelated browser data stays.
export function clearBuyerRecords() {
  memory.clear();
  fallback = false;
  lastOutcome = "device-persistent";
  recoveryCount = 0;
  lastDeletion = null;
  try {
    const target = storage();
    target?.removeItem(BUYER_RECORDS_KEY);
    for (const id of knownIds) target?.removeItem("lihatdulu:offer:" + id);
  } catch {
    /* no-op */
  }
}
