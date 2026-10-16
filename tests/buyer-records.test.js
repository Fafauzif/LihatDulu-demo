import test from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_LISTINGS } from '../src/catalogue.js';
import { clearMarketState, getListing, checkoutTotals, setDraft, addCart } from '../src/market-state.js';
import { BUYER_RECORDS_KEY, MAX_SUMMARIES, parseRupiahInput, validateOfferInput, clearBuyerRecords,
  getOfferDraft, saveOfferDraft, readBuyerRecords, listOfferDrafts, deleteOfferDraft, undoBuyerDeletion,
  buyerPersistenceStatus, buyerRecoveryCount, saveSummarySnapshot, getSummarySnapshot, listSummarySnapshots,
  deleteSummarySnapshot } from '../src/buyer-records.js';
import { renderOfferComposer, renderOfferStatus, renderBuyerCart, renderBuyerSaved, renderPriceBreakdown, renderSavedSummary } from '../src/buyer-views.js';

const originalStorage = globalThis.localStorage;
function store(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), values };
}
test.beforeEach(() => { clearBuyerRecords(); clearMarketState(); globalThis.localStorage = store({ unrelated: 'keep' }); });
test.after(() => { if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage; });

test('whole-rupiah parsing accepts dot groups without changing their magnitude', () => {
  for (const value of ['2200000', '2.200.000', 'Rp 2.200.000', 2200000]) assert.equal(parseRupiahInput(value), 2200000);
  for (const value of ['', '2.2', '2,2', '2,200,000', '2.20.000', '2e6', '-2', Infinity, 1.5, '<script>', '1000000001']) assert.equal(parseRupiahInput(value), null);
  assert.equal(validateOfferInput(getListing('sora'), { amount: '0', note: '' }).valid, false);
  assert.equal(validateOfferInput(getListing('sora'), { amount: '2.500.000', note: '' }).errors.amount.includes('melebihi'), true);
});

test('new offers carry a price basis and known time while no amount is suggested by the composer', () => {
  assert.match(renderOfferComposer(getListing('sora')), /name="amount"[^>]*value=""/);
  const result = saveOfferDraft('sora', { amount: '2.200.000', note: 'Ambil Sabtu\nPeriksa pintu.' }, { now: '2026-10-16T06:00:00Z' });
  assert.equal(result.ok, true); assert.equal(result.outcome, 'device-persistent');
  assert.equal(result.record.amountIdr, 2200000); assert.equal(result.record.referencePriceIdr, 2450000);
  assert.equal(result.record.createdAt, '2026-10-16T06:00:00.000Z');
  assert.match(renderOfferStatus(getListing('sora')), /Lihat draf penawaran/);
  assert.equal(globalThis.localStorage.getItem('unrelated'), 'keep');
});

test('legacy offer migration preserves values and unknown original history', () => {
  globalThis.localStorage.setItem('lihatdulu:offer:sora', JSON.stringify({ amount: 2200000, note: 'x'.repeat(600) }));
  const draft = getOfferDraft('sora');
  assert.equal(draft.amountIdr, 2200000); assert.equal(draft.note.length, 500);
  assert.equal(draft.referencePriceIdr, null); assert.equal(draft.createdAt, null); assert.equal(draft.updatedAt, null);
  assert.equal(typeof draft.migratedAt, 'string');
  assert.match(renderOfferComposer(getListing('sora')), /waktu awal tidak tercatat/);
  const edited = saveOfferDraft('sora', { amount: '2100000', note: 'Catatan baru' });
  assert.equal(edited.record.referencePriceIdr, null, 'editing does not invent the original asking price');
  assert.equal(edited.record.createdAt, null);
});

test('deletion and Undo restore exact draft contents across product and saved views', () => {
  const prior = saveOfferDraft('sora', { amount: '2.000.000', note: 'Catatan lengkap' }).record;
  assert.equal(deleteOfferDraft('sora').ok, true); assert.equal(getOfferDraft('sora'), null);
  assert.match(renderBuyerSaved({ view: 'draf' }), /Urungkan/);
  assert.equal(undoBuyerDeletion().ok, true); assert.deepEqual(getOfferDraft('sora'), prior);
  assert.match(renderBuyerSaved({ view: 'draf' }), /Catatan lengkap/);
});

test('a removed migrated legacy key cannot resurrect a deleted draft if removeItem is blocked', () => {
  globalThis.localStorage.setItem('lihatdulu:offer:sora', JSON.stringify({ amount: 2000000, note: 'Lama' }));
  globalThis.localStorage.removeItem = () => { throw new Error('blocked'); };
  getOfferDraft('sora'); deleteOfferDraft('sora');
  assert.equal(getOfferDraft('sora'), null);
  assert.deepEqual(readBuyerRecords().legacyHandled, ['sora']);
});

test('price and availability changes retain notes and require correction before resave', () => {
  saveOfferDraft('sora', { amount: '2.200.000', note: 'Jangan hilangkan catatan' });
  setDraft('sora', { price: 1800000 });
  assert.equal(getOfferDraft('sora').amountIdr, 2200000);
  assert.equal(getOfferDraft('sora').note, 'Jangan hilangkan catatan');
  assert.match(renderOfferStatus(getListing('sora')), /Harga barang berubah/);
  assert.equal(saveOfferDraft('sora', { amount: '2200000', note: 'Tetap ada' }).ok, false);
  setDraft('sora', { status: 'sold' });
  assert.equal(saveOfferDraft('sora', { amount: '1000000', note: 'Tetap ada' }).errors.form.includes('tidak tersedia'), true);
  assert.match(renderBuyerSaved({ view: 'draf' }), /sedang tidak tersedia/);
  assert.equal(getOfferDraft('sora').note, 'Jangan hilangkan catatan');
});

test('blocked persistence retains fresh drafts in the current tab and reports that outcome accurately', () => {
  globalThis.localStorage.setItem = () => { throw new Error('quota'); };
  let result = saveOfferDraft('sora', { amount: '2000000', note: 'Draft pertama' });
  assert.equal(result.ok, true); assert.equal(result.outcome, 'temporary-in-tab');
  result = saveOfferDraft('sora', { amount: '1900000', note: 'Draft terbaru' });
  assert.equal(getOfferDraft('sora').note, 'Draft terbaru');
  assert.equal(buyerPersistenceStatus(), 'temporary-in-tab');
  assert.match(renderBuyerSaved({ view: 'draf' }), /Tersedia selama sesi ini/);
  const invalid = validateOfferInput(getListing('sora'), { amount: '2.2', note: 'Tulisan belum hilang' });
  assert.equal(invalid.note, 'Tulisan belum hilang'); assert.equal(invalid.valid, false);
  assert.equal(getOfferDraft('sora').note, 'Draft terbaru');
});

test('partial invalid buyer records recover valid entries without resetting unrelated local state', () => {
  saveOfferDraft('sora', { amount: '2000000', note: 'Valid' });
  const raw = JSON.parse(globalThis.localStorage.getItem(BUYER_RECORDS_KEY));
  raw.offers.arca = { schema: 1, listingId: 'arca', amountIdr: -1, note: 'bad' };
  raw.offers.unknown = { amountIdr: 1 }; raw.summaries = [{ bad: true }];
  globalThis.localStorage.setItem(BUYER_RECORDS_KEY, JSON.stringify(raw));
  assert.equal(listOfferDrafts().length, 1); assert.equal(getOfferDraft('sora').note, 'Valid');
  assert.equal(buyerRecoveryCount(), 3); assert.equal(globalThis.localStorage.getItem('unrelated'), 'keep');
});

test('shared prices retain Sora arithmetic and stable seller identities own grouping and fees', () => {
  assert.equal(checkoutTotals(['sora'], { delivery: 'pickup' }).total, 2600000);
  assert.equal(checkoutTotals(['sora'], { delivery: 'delivery' }).total, 2750000);
  const fixture = AVAILABLE_LISTINGS.map(item => ['sora', 'arca'].includes(item.id) ? { ...item, seller: { id: 'studio-sora', name: item.id === 'sora' ? 'Nama baru' : 'Nama lain' } } : item);
  const totals = checkoutTotals(['sora', 'arca'], { delivery: 'delivery' }, fixture);
  assert.equal(totals.groups.length, 1); assert.equal(totals.preparedFee, 150000); assert.equal(totals.deliveryFee, 150000);
  assert.match(renderPriceBreakdown(getListing('sora'), 'pickup'), /2\.600\.000/);
  assert.match(renderPriceBreakdown(getListing('sora'), 'delivery'), /2\.750\.000/);
});

test('summary snapshots preserve item facts, fee arithmetic and time independently of later edits', () => {
  addCart('sora');
  const saved = saveSummarySnapshot(undefined, { delivery: 'delivery' }, { now: '2026-10-16T06:10:00Z' });
  assert.equal(saved.ok, true); assert.equal(saved.record.total, 2750000);
  const original = structuredClone(saved.record);
  saved.record.items[0].title = 'caller edit';
  setDraft('sora', { price: 1700000, status: 'sold' });
  assert.deepEqual(getSummarySnapshot(original.id), original);
  const html = renderSavedSummary(original.id);
  assert.match(html, /2\.750\.000/); assert.match(html, /Barang sekarang tidak tersedia/);
  assert.match(html, /Lemari Sora/); assert.doesNotMatch(html, /caller edit/);
  assert.equal(saveSummarySnapshot(['sora']).ok, false);
});

test('summary count is bounded to ten and deletion can be reversed', () => {
  for (let index = 0; index < MAX_SUMMARIES + 3; index++) assert.equal(saveSummarySnapshot(['sora']).ok, true);
  const before = listSummarySnapshots(); assert.equal(before.length, MAX_SUMMARIES);
  assert.equal(new Set(before.map(item => item.id)).size, MAX_SUMMARIES);
  deleteSummarySnapshot(before[0].id); assert.equal(listSummarySnapshots().length, MAX_SUMMARIES - 1);
  undoBuyerDeletion(); assert.deepEqual(getSummarySnapshot(before[0].id), before[0]);
});

test('review is a separate read-only decision step and draft amounts never change totals', () => {
  addCart('sora'); saveOfferDraft('sora', { amount: '1000000', note: 'Pribadi' });
  const cart = renderBuyerCart(), review = renderBuyerCart({ review: true });
  assert.match(cart, /name="cart-delivery"/); assert.doesNotMatch(review, /name="cart-delivery"/);
  assert.match(review, /Ubah pilihan/); assert.match(review, /Simpan ringkasan lokal/);
  assert.match(review, /2\.600\.000/); assert.doesNotMatch(review, /1\.000\.000/);
});
