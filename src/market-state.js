/*
 * Small, deliberately bounded persistence layer for the marketplace surface.
 *
 * The catalogue is authored data. This module only stores IDs and seller-side
 * edits, so a malformed localStorage value cannot become HTML, a photo URL, or
 * a second copy of an item in a cart. It also keeps its key separate from the
 * capture, viewer, and favourites stores used by the older experience.
 */
import { AVAILABLE_LISTINGS, COMING_SOON_LISTINGS, ALL_LISTINGS } from './catalogue.js';

export { AVAILABLE_LISTINGS, ALL_LISTINGS };
export const LISTINGS = AVAILABLE_LISTINGS;
export const COMING_SOON = COMING_SOON_LISTINGS;
export const ALL = ALL_LISTINGS;

export const MARKETPLACE_STORAGE_KEY = 'lihatdulu:marketplace:v1';
export const MARKET_STATE_SCHEMA = 1;
export const ACTIVE_IDS = Object.freeze(AVAILABLE_LISTINGS.map(item => item.id));
export const COMING_SOON_IDS = Object.freeze(COMING_SOON_LISTINGS.map(item => item.id));
export const MARKETPLACE_IDS = Object.freeze(ALL_LISTINGS.map(item => item.id));
export const PREPARED_FEES = Object.freeze({
  'Studio Sora': 150000,
  'Ruang Kedua': 125000,
  'Atelier Batu': 100000,
  'Rimba Objects': 100000
});
// Stable identities own fee rules; a display-name edit cannot change a quote.
export const PREPARED_FEES_BY_SELLER_ID = Object.freeze({
  'studio-sora': 150000, 'ruang-kedua': 125000,
  'atelier-batu': 100000, 'rimba-objects': 100000
});
export function sellerIdentity(item) {
  const seller = item?.seller;
  if (typeof seller?.id === 'string' && /^[a-z0-9_-]{1,80}$/i.test(seller.id)) return seller.id;
  if (typeof seller?.slug === 'string' && /^[a-z0-9_-]{1,80}$/i.test(seller.slug)) return seller.slug;
  return String(seller?.name || 'Penjual LihatDulu').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'penjual-lihatdulu';
}
export const DELIVERY_FEES = Object.freeze({ pickup: 0, delivery: 150000 });
export const PAYMENT_METHODS = Object.freeze(['bank', 'qris', 'cash']);

const memory = new Map();
const FALLBACK_MAX = 180000;
const MAX_CART = 100;
const MAX_COLLECTIONS = 20;
const MAX_COLLECTION_ITEMS = 100;
let sequence = 0;
let storageFallback = false;
let storageOutcome = 'device-persistent';

const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const hasUnicode = value => !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value);
const text = (value, limit, fallback = '') => typeof value === 'string' && hasUnicode(value)
  ? value.slice(0, limit) : fallback;
const integer = (value, minimum, maximum) => typeof value === 'number' && Number.isFinite(value) &&
  Number.isInteger(value) && value >= minimum && value <= maximum ? value : null;
const idList = (value, allowed = ACTIVE_IDS, limit = MAX_CART) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter(id => typeof id === 'string' && allowed.includes(id) && !seen.has(id) && seen.add(id)).slice(0, limit);
};
const validStatus = value => ['available', 'reserved', 'sold'].includes(value) ? value : null;
const statusAlias = value => value === 'active' ? 'available' : validStatus(value);

function storage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}
function readRaw() {
  let raw = memory.get(MARKETPLACE_STORAGE_KEY);
  if (!storageFallback) try {
    const stored = storage()?.getItem(MARKETPLACE_STORAGE_KEY);
    if (stored !== null && stored !== undefined) raw = stored;
  } catch { storageFallback = true; storageOutcome = 'temporary-in-tab'; /* private mode or a blocked storage area */ }
  return raw;
}
function writeRaw(value) {
  let raw;
  try { raw = JSON.stringify(value); } catch { return false; }
  if (raw.length > FALLBACK_MAX) return false;
  memory.set(MARKETPLACE_STORAGE_KEY, raw);
  try {
    const target = storage();
    if (target) { target.setItem(MARKETPLACE_STORAGE_KEY, raw); storageFallback = false; storageOutcome = 'device-persistent'; }
    else { storageFallback = true; storageOutcome = 'temporary-in-tab'; }
  } catch { storageFallback = true; storageOutcome = 'temporary-in-tab'; /* memory remains the safe fallback */ }
  return true;
}

export function freshMarketState() {
  return {
    schema: MARKET_STATE_SCHEMA,
    cart: [],
    drafts: {},
    collections: [],
    checkout: { delivery: 'pickup', payment: 'bank' }
  };
}

function normalizeDraft(value) {
  if (!isPlain(value)) return null;
  const draft = {};
  const price = integer(value.price, 0, 1000000000);
  const status = statusAlias(value.status);
  if (price !== null) draft.price = price;
  if (status) draft.status = status;
  if (typeof value.notes === 'string' && hasUnicode(value.notes)) draft.notes = value.notes.slice(0, 2000);
  if (typeof value.description === 'string' && hasUnicode(value.description)) draft.description = value.description.slice(0, 3000);
  return Object.keys(draft).length ? draft : null;
}

function normalizeCollection(value) {
  if (!isPlain(value)) return null;
  const id = typeof value.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value.id) ? value.id : null;
  const name = typeof value.name === 'string' && hasUnicode(value.name) ? value.name.trim().slice(0, 50) : '';
  if (!id || !name) return null;
  return { id, name, ids: idList(value.ids, ACTIVE_IDS, MAX_COLLECTION_ITEMS) };
}

export function normalizeMarketState(value) {
  const fallback = freshMarketState();
  if (!isPlain(value) || value.schema !== MARKET_STATE_SCHEMA) return fallback;
  const drafts = {};
  // Seller editing is intentionally limited to the prepared Sora listing.
  const soraDraft = normalizeDraft(value.drafts?.sora);
  if (soraDraft) drafts.sora = soraDraft;
  const collections = [];
  const seenCollections = new Set();
  if (Array.isArray(value.collections)) {
    for (const candidate of value.collections.slice(0, MAX_COLLECTIONS)) {
      const collection = normalizeCollection(candidate);
      if (collection && !seenCollections.has(collection.id)) {
        seenCollections.add(collection.id);
        collections.push(collection);
      }
    }
  }
  const delivery = value.checkout?.delivery === 'delivery' ? 'delivery' : 'pickup';
  const payment = PAYMENT_METHODS.includes(value.checkout?.payment) ? value.checkout.payment : 'bank';
  return { schema: MARKET_STATE_SCHEMA, cart: idList(value.cart), drafts, collections, checkout: { delivery, payment } };
}

export function readMarketState() {
  try {
    const raw = readRaw();
    if (typeof raw !== 'string') return freshMarketState();
    return normalizeMarketState(JSON.parse(raw));
  } catch { return freshMarketState(); }
}

export function writeMarketState(value) {
  const normalized = normalizeMarketState(value);
  return writeRaw(normalized);
}
export function marketPersistenceStatus() { return storageOutcome; }

export function clearMarketState() {
  memory.delete(MARKETPLACE_STORAGE_KEY);
  try { storage()?.removeItem(MARKETPLACE_STORAGE_KEY); } catch { /* no-op */ }
  storageFallback = false;
  storageOutcome = 'device-persistent';
  return true;
}

function activeListing(id, base = AVAILABLE_LISTINGS) {
  return (Array.isArray(base) ? base : AVAILABLE_LISTINGS).find(item => item?.id === id) || null;
}

/** Merge seller edits while retaining catalogue dimensions, photos, and model data. */
export function deriveListing(base, draft = null) {
  if (!isPlain(base)) return null;
  const validBase = activeListing(base.id, [base]);
  if (!validBase) return null;
  const validDraft = normalizeDraft(draft ?? readMarketState().drafts[base.id]);
  if (!validDraft || base.id !== 'sora') return { ...base, status: base.available === false ? 'sold' : 'available' };
  const status = validDraft.status ?? (base.available === false ? 'sold' : 'available');
  return {
    ...base,
    ...(validDraft.price !== undefined ? { price: validDraft.price } : {}),
    ...(validDraft.description !== undefined ? { description: validDraft.description } : {}),
    ...(validDraft.notes !== undefined ? { notes: validDraft.notes, sellerNote: validDraft.notes } : {}),
    status,
    available: status === 'available' && base.available !== false
  };
}
export const effectiveListing = deriveListing;

export function getListing(id, base = ALL_LISTINGS) {
  const source = Array.isArray(base) ? base : ALL_LISTINGS;
  const found = source.find(item => item?.id === id);
  return found ? deriveListing(found) : null;
}

export function cartEligible(id, base = AVAILABLE_LISTINGS) {
  const listing = getListing(id, base);
  return Boolean(listing && ACTIVE_IDS.includes(id) && listing.available !== false && listing.status !== 'reserved' && listing.status !== 'sold' && Number.isFinite(listing.price));
}
export function getCartItems(ids = readMarketState().cart, base = AVAILABLE_LISTINGS) {
  return idList(ids).map(id => getListing(id, base)).filter(listing => listing && cartEligible(listing.id, base));
}
export const cartItems = getCartItems;
export const cartEligibility = (ids = readMarketState().cart, base = AVAILABLE_LISTINGS) => idList(ids).map(id => ({ id, eligible: cartEligible(id, base) }));

function mutate(mutator) {
  const next = mutator(readMarketState());
  const normalized = normalizeMarketState(next);
  writeMarketState(normalized);
  return normalized;
}
export function addCart(id) {
  if (!cartEligible(id)) return readMarketState();
  return mutate(state => ({ ...state, cart: [...state.cart, id] }));
}
export function removeCart(id) {
  return mutate(state => ({ ...state, cart: state.cart.filter(item => item !== id) }));
}
export function setDraft(id, patch = {}) {
  if (id !== 'sora' || !isPlain(patch)) return readMarketState();
  return mutate(state => ({ ...state, drafts: { ...state.drafts, sora: { ...(state.drafts.sora || {}), ...patch } } }));
}
export function resetDraft(id = 'sora') {
  if (id !== 'sora') return readMarketState();
  return mutate(state => { const drafts = { ...state.drafts }; delete drafts.sora; return { ...state, drafts }; });
}

export function checkoutTotals(cartIds = readMarketState().cart, selection = {}, baseListings = AVAILABLE_LISTINGS) {
  if (!Array.isArray(cartIds)) cartIds = readMarketState().cart;
  const state = readMarketState();
  const options = isPlain(selection) ? selection : { delivery: selection };
  const delivery = options.delivery === 'delivery' ? 'delivery' : 'pickup';
  const payment = PAYMENT_METHODS.includes(options.payment) ? options.payment : state.checkout.payment;
  const ids = idList(cartIds);
  const excludedIds = ids.filter(id => !cartEligible(id, baseListings));
  const items = getCartItems(ids, baseListings);
  const grouped = new Map();
  for (const item of items) {
    const sellerId = sellerIdentity(item);
    if (!grouped.has(sellerId)) grouped.set(sellerId, []);
    grouped.get(sellerId).push(item);
  }
  const groups = [...grouped.entries()].map(([sellerId, groupItems]) => {
    const seller = groupItems[0].seller?.name || 'Penjual LihatDulu';
    const subtotal = groupItems.reduce((sum, item) => sum + item.price, 0);
    const preparedFee = PREPARED_FEES_BY_SELLER_ID[sellerId] ?? 100000;
    const deliveryFee = delivery === 'delivery' ? DELIVERY_FEES.delivery : 0;
    return { sellerId, seller, sellerName: seller, items: groupItems, ids: groupItems.map(item => item.id), subtotal, preparedFee, deliveryFee, total: subtotal + preparedFee + deliveryFee };
  });
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const preparedFee = groups.reduce((sum, group) => sum + group.preparedFee, 0);
  const deliveryFee = groups.reduce((sum, group) => sum + group.deliveryFee, 0);
  return { items, groups, bySeller: groups, excludedIds, delivery, payment, subtotal, preparedFee, preparation: preparedFee, deliveryFee, deliveryCost: deliveryFee, total: subtotal + preparedFee + deliveryFee };
}

function collectionId() {
  sequence = (sequence + 1) % 1000000;
  return `collection-${Date.now().toString(36)}-${sequence.toString(36)}`;
}
export function createCollection(name, ids = []) {
  const safeName = typeof name === 'string' && hasUnicode(name) ? name.trim().slice(0, 50) : '';
  if (!safeName) return readMarketState();
  return mutate(state => ({ ...state, collections: [...state.collections, { id: collectionId(), name: safeName, ids: idList(ids, ACTIVE_IDS, MAX_COLLECTION_ITEMS) }].slice(-MAX_COLLECTIONS) }));
}
export function saveCollection(name, ids = []) {
  const state = readMarketState();
  const existing = state.collections.find(item => item.name === String(name ?? '').trim());
  if (existing) return mutate(current => ({ ...current, collections: current.collections.map(item => item.id === existing.id ? { ...item, ids: idList(ids, ACTIVE_IDS, MAX_COLLECTION_ITEMS) } : item) }));
  return createCollection(name, ids);
}
export function deleteCollection(id) {
  return mutate(state => ({ ...state, collections: state.collections.filter(item => item.id !== id) }));
}
export function addToCollection(collectionId, id) {
  if (!ACTIVE_IDS.includes(id)) return readMarketState();
  return mutate(state => ({ ...state, collections: state.collections.map(item => item.id === collectionId ? { ...item, ids: idList([...item.ids, id], ACTIVE_IDS, MAX_COLLECTION_ITEMS) } : item) }));
}
export function removeFromCollection(collectionId, id) {
  return mutate(state => ({ ...state, collections: state.collections.map(item => item.id === collectionId ? { ...item, ids: item.ids.filter(value => value !== id) } : item) }));
}
export function setCheckout(selection = {}) {
  const current = readMarketState();
  const safeSelection = isPlain(selection) ? selection : {};
  const delivery = safeSelection.delivery === 'delivery' ? 'delivery' : 'pickup';
  const payment = PAYMENT_METHODS.includes(safeSelection.payment) ? safeSelection.payment : current.checkout.payment;
  return mutate(state => ({ ...state, checkout: { delivery, payment } }));
}

export default Object.freeze({
  readMarketState, writeMarketState, clearMarketState, freshMarketState, normalizeMarketState,
  deriveListing, effectiveListing, getListing, cartEligible, getCartItems, cartItems, cartEligibility,
  addCart, removeCart, setDraft, resetDraft, checkoutTotals, createCollection, saveCollection,
  deleteCollection, addToCollection, removeFromCollection, setCheckout
});
