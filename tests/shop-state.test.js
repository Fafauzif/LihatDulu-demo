import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutTotals, normalizeSaved, safeDelivery } from '../src/shop-state.js';

test('pickup has no delivery fee and delivery totals retain the selected item price', () => {
  assert.deepEqual(checkoutTotals(1850000, 'pickup'), { subtotal:1850000, delivery:0, total:1850000 });
  assert.deepEqual(checkoutTotals(1850000, 'delivery'), { subtotal:1850000, delivery:150000, total:2000000 });
});
test('invalid prices and delivery selections cannot become checkout amounts', () => {
  assert.throws(() => checkoutTotals(-1,'delivery'));
  assert.throws(() => checkoutTotals(NaN,'pickup'));
  assert.equal(safeDelivery('arbitrary'), 'pickup');
});
test('saved listing IDs are deduplicated and cannot inject unknown or malformed records', () => {
  assert.deepEqual(normalizeSaved(['sora','sora','unknown',{},'chair'],['sora','chair']),['sora','chair']);
  assert.deepEqual(normalizeSaved(null,['sora']),[]);
});
