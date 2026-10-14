import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AVAILABLE_LISTINGS, ALL, LISTINGS, COMING_SOON, PREPARED_FEES,
  addCart, addToCollection, cartEligible, checkoutTotals, clearMarketState,
  createCollection, deleteCollection, deriveListing, getCartItems, readMarketState,
  removeCart, removeFromCollection, resetDraft, saveCollection, setCheckout, setDraft,
  writeMarketState
} from '../src/market-state.js';

const originalStorage = globalThis.localStorage;
function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), values };
}
test.beforeEach(() => { clearMarketState(); globalThis.localStorage = memoryStorage({ unrelated: 'leave me alone' }); });
test.after(() => { if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage; });

test('catalogue exports expose ten active and two coming-soon authored records', () => {
  assert.equal(LISTINGS, AVAILABLE_LISTINGS);
  assert.equal(AVAILABLE_LISTINGS.length, 10);
  assert.deepEqual(AVAILABLE_LISTINGS.map(item => item.id), ['sora', 'arca', 'batu', 'rimba','awan','tala','loka','nusa','senja','ruji']);
  assert.equal(COMING_SOON.length, 2);
  assert.equal(ALL.length, 12);
});

test('malformed storage falls back safely and leaves unrelated browser data intact', () => {
  const storage = globalThis.localStorage;
  storage.setItem('lihatdulu:marketplace:v1', '{broken');
  assert.deepEqual(readMarketState(), { schema: 1, cart: [], drafts: {}, collections: [], checkout: { delivery: 'pickup', payment: 'bank' } });
  assert.equal(storage.getItem('unrelated'), 'leave me alone');
});

test('blocked durable storage retains the latest bounded state in memory', () => {
  const storage = globalThis.localStorage;
  storage.setItem = () => { throw new Error('quota'); };
  addCart('sora');
  assert.deepEqual(readMarketState().cart, ['sora']);
  assert.equal(storage.getItem('unrelated'), 'leave me alone');
});

test('cart accepts each active item once and rejects coming soon or unavailable items', () => {
  addCart('sora'); addCart('sora'); addCart('lino');
  assert.deepEqual(readMarketState().cart, ['sora']);
  assert.equal(cartEligible('sora'), true);
  setDraft('sora', { status: 'sold' });
  assert.equal(cartEligible('sora'), false);
  assert.deepEqual(getCartItems(), []);
  removeCart('sora');
  assert.deepEqual(readMarketState().cart, []);
});

test('seller draft is bounded to Sora and cannot replace authored dimensions or photos', () => {
  const original = AVAILABLE_LISTINGS.find(item => item.id === 'sora');
  setDraft('arca', { price: 1, status: 'sold' });
  setDraft('sora', { price: 2700000, status: 'reserved', notes: 'Hubungi dahulu', description: 'Versi penjual' });
  const listing = deriveListing(original);
  assert.equal(listing.price, 2700000);
  assert.equal(listing.status, 'reserved');
  assert.equal(listing.available, false);
  assert.deepEqual(listing.dimensions, original.dimensions);
  assert.strictEqual(listing.photos, original.photos);
  assert.equal(readMarketState().drafts.arca, undefined);
  resetDraft();
  assert.equal(deriveListing(original).price, original.price);
});

test('checkout groups eligible items by seller and applies prepared fee per seller', () => {
  addCart('sora'); addCart('arca'); addCart('batu');
  const totals = checkoutTotals(undefined, { delivery: 'pickup', payment: 'qris' });
  assert.equal(totals.groups.length, 3);
  assert.equal(totals.deliveryFee, 0);
  assert.equal(totals.preparedFee, PREPARED_FEES['Studio Sora'] + PREPARED_FEES['Ruang Kedua'] + PREPARED_FEES['Atelier Batu']);
  assert.equal(totals.total, totals.subtotal + totals.preparedFee);
  setCheckout({ delivery: 'delivery', payment: 'bank' });
  const delivered = checkoutTotals(readMarketState().cart, readMarketState().checkout);
  assert.equal(delivered.payment, 'bank');
  assert.equal(delivered.deliveryFee, 450000);
});

test('collections are local, bounded, deduplicated, and item IDs remain canonical', () => {
  createCollection('Ruang tamu', ['sora', 'sora', 'unknown']);
  let collection = readMarketState().collections[0];
  assert.deepEqual(collection.ids, ['sora']);
  addToCollection(collection.id, 'arca'); addToCollection(collection.id, 'arca'); addToCollection(collection.id, 'lino');
  assert.deepEqual(readMarketState().collections[0].ids, ['sora', 'arca']);
  saveCollection('Ruang tamu', ['batu']);
  collection = readMarketState().collections[0];
  assert.deepEqual(collection.ids, ['batu']);
  removeFromCollection(collection.id, 'batu');
  assert.deepEqual(readMarketState().collections[0].ids, []);
  deleteCollection(collection.id);
  assert.equal(readMarketState().collections.length, 0);
});

test('write normalizes unsupported records instead of persisting executable or unbounded values', () => {
  writeMarketState({ schema: 1, cart: ['sora', 'sora', { toString: () => '<script>' }], drafts: { sora: { price: Infinity, notes: '\ud800' }, arca: { status: 'sold' } }, collections: [{ id: 'x', name: 'x', ids: ['sora', 'lino'] }], checkout: { delivery: 'hack', payment: 'hack' } });
  const state = readMarketState();
  assert.deepEqual(state.cart, ['sora']);
  assert.deepEqual(state.drafts, {});
  assert.deepEqual(state.collections, [{ id: 'x', name: 'x', ids: ['sora'] }]);
  assert.deepEqual(state.checkout, { delivery: 'pickup', payment: 'bank' });
});
