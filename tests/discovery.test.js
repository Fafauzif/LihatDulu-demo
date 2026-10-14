import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters, serializeFilters, filterCatalogue, getFacets, toggleCompare, comparisonRows } from '../src/discovery.js';
import { EXTRA_LISTINGS } from '../src/example-listings.js';
import { AVAILABLE_LISTINGS, COMING_SOON_LISTINGS } from '../src/catalogue.js';

const blank = () => ({ q: '', categories: [], conditions: [], materials: [], locations: [], min: null, max: null, width: null, depth: null, height: null, model: false, sort: 'relevance' });
const core = AVAILABLE_LISTINGS.filter(item => ['sora', 'arca', 'batu', 'rimba'].includes(item.id));
const inventory = () => [...AVAILABLE_LISTINGS, ...COMING_SOON_LISTINGS];
const ids = items => items.map(item => item.id);

test('URL defaults create a complete reset state and serialize to no query', () => {
  const filter = parseFilters(new URLSearchParams());
  assert.deepEqual(filter, blank());
  assert.equal(serializeFilters(filter).toString(), '');
});

test('URL arrays trim, deduplicate, accept a legacy category, and round-trip selected filters', () => {
  const filter = parseFilters(new URLSearchParams('q=+meja+kayu+&categories=Meja,%20Kursi,Meja&conditions=Detail%20pemakaian&materials=Kayu&locations=Bandung,Jakarta%20Selatan&min=0&max=2500000&width=122&depth=78&height=78&model=1&sort=price-asc'));
  assert.deepEqual(filter, { q: 'meja kayu', categories: ['Meja', 'Kursi'], conditions: ['Detail pemakaian'], materials: ['Kayu'], locations: ['Bandung', 'Jakarta Selatan'], min: 0, max: 2500000, width: 122, depth: 78, height: 78, model: true, sort: 'price-asc' });
  assert.deepEqual(parseFilters(serializeFilters(filter)), filter);
  assert.deepEqual(parseFilters(new URLSearchParams('category=Penyimpanan')).categories, ['Penyimpanan']);
  assert.deepEqual(parseFilters(new URLSearchParams('category=Kursi&categories=Meja')).categories, ['Meja']);
  assert.deepEqual(parseFilters(new URLSearchParams('category=Semua')).categories, []);
});

test('invalid, negative and nondecimal URL limits are ignored rather than becoming active constraints', () => {
  const filter = parseFilters(new URLSearchParams('min=-1&max=Infinity&width=NaN&depth=0x10&height=-2&model=false&sort=anything'));
  assert.deepEqual(filter, blank());
  const decimal = parseFilters(new URLSearchParams('min=0&width=47.5&depth=.5&height=0'));
  assert.equal(decimal.min, 0);
  assert.equal(decimal.width, 47.5);
  assert.equal(decimal.depth, .5);
  assert.equal(decimal.height, 0);
  assert.equal(serializeFilters({ ...blank(), max: -5, width: Infinity }).toString(), '');
});

test('each dimension is an independent inclusive maximum in canonical centimetres', () => {
  const sora = core.find(item => item.id === 'sora');
  assert.deepEqual(ids(filterCatalogue([sora], { ...blank(), width: 90, depth: 47.5, height: 120 })), ['sora']);
  for (const [key, limit] of [['width', 89.9], ['depth', 47.4], ['height', 119.9]]) {
    assert.deepEqual(filterCatalogue([sora], { ...blank(), [key]: limit }), [], key);
  }
  assert.deepEqual(ids(filterCatalogue([sora], { ...blank(), width: 120 })), ['sora']);
});

test('category, condition, material, location, model, search and inclusive price constraints combine', () => {
  const filter = { ...blank(), q: 'MEJA BATU', categories: ['Meja', 'Kursi'], conditions: ['Detail pemakaian'], materials: ['Batu'], locations: ['Yogyakarta'], model: true, min: 1890000, max: 1890000 };
  assert.deepEqual(ids(filterCatalogue(inventory(), filter)), ['batu']);
  assert.deepEqual(filterCatalogue(inventory(), { ...filter, max: 1889999 }), []);
  assert.deepEqual(filterCatalogue(inventory(), { ...filter, locations: ['Bandung'] }), []);
  assert.deepEqual(filterCatalogue(inventory(), { ...filter, materials: ['Kayu'] }), []);
  assert.deepEqual(filterCatalogue(inventory(), { ...filter, conditions: ['Terawat'] }), []);
  assert.deepEqual(ids(filterCatalogue(inventory(), { ...blank(), categories: ['Kursi'], materials: ['Rotan'] })), ['tala']);
});

test('reset includes all ten active examples and excludes unavailable or coming-soon products', () => {
  const source = inventory();
  source.push({ ...core[0], id: 'sold', available: false });
  assert.equal(filterCatalogue(source, blank()).length, 10);
  assert.equal(filterCatalogue(source, { ...blank(), model: true }).length, 4);
  assert.deepEqual(ids(filterCatalogue(source, { ...blank(), q: 'tidak-ada-barang' })), []);
});

test('all sorts return a separate array without changing source order or records', () => {
  const source = core.map(item => Object.freeze({ ...item }));
  Object.freeze(source);
  const before = ids(source);
  assert.deepEqual(ids(filterCatalogue(source, { ...blank(), sort: 'price-asc' })), ['arca', 'batu', 'sora', 'rimba']);
  assert.deepEqual(ids(filterCatalogue(source, { ...blank(), sort: 'price-desc' })), ['rimba', 'sora', 'batu', 'arca']);
  assert.deepEqual(ids(filterCatalogue(source, { ...blank(), sort: 'newest' })), ['rimba', 'batu', 'arca', 'sora']);
  assert.deepEqual(ids(filterCatalogue(source, blank())), before);
  assert.deepEqual(ids(source), before);
  assert.notStrictEqual(filterCatalogue(source, blank()), source);
});

test('facets use only active records and each facet value filters to its reported count', () => {
  const source = inventory();
  const facets = getFacets(source);
  assert.equal(facets.total, 10);
  assert.equal(facets.modelCount, 4);
  assert.equal(facets.priceRange.min, Math.min(...filterCatalogue(source, blank()).map(item => item.price)));
  assert.deepEqual(facets.dimensionRanges.width, { min: 58, max: 180 });
  for (const key of ['categories', 'conditions', 'materials', 'locations']) {
    assert.ok(facets[key].length > 0);
    for (const facet of facets[key]) {
      assert.equal(typeof facet.value, 'string');
      assert.equal(facet.label, facet.value);
      assert.equal(filterCatalogue(source, { ...blank(), [key]: [facet.value] }).length, facet.count, `${key}: ${facet.value}`);
    }
  }
  assert.ok(facets.conditions.some(facet => facet.value === 'Pemakaian ringan'));
  assert.ok(facets.materials.some(facet => facet.value === 'Panel kayu' && facet.count === 1));
  assert.ok(facets.materials.some(facet => facet.value === 'Batu' && facet.count === 1));
});

test('empty facets have safe nullable ranges and no fabricated options', () => {
  assert.deepEqual(getFacets(COMING_SOON_LISTINGS), { categories: [], conditions: [], materials: [], locations: [], total: 0, modelCount: 0, priceRange: { min: null, max: null }, dimensionRanges: { width: { min: null, max: null }, depth: { min: null, max: null }, height: { min: null, max: null } } });
});

test('comparison toggling sanitizes persisted selection, removes an existing ID, and caps new selection at three', () => {
  const source = inventory();
  const selected = ['sora', 'sora', 'unknown', 'lino', 'arca'];
  assert.deepEqual(toggleCompare(selected, 'batu', source), ['sora', 'arca', 'batu']);
  assert.deepEqual(selected, ['sora', 'sora', 'unknown', 'lino', 'arca']);
  assert.deepEqual(toggleCompare(['sora', 'arca', 'batu'], 'rimba', source), ['sora', 'arca', 'batu']);
  assert.deepEqual(toggleCompare(['sora', 'arca', 'batu'], 'arca', source), ['sora', 'batu']);
  assert.deepEqual(toggleCompare(['sora'], 'unknown', source), ['sora']);
  assert.deepEqual(toggleCompare(['sora'], 'lino', source), ['sora']);
  assert.deepEqual(toggleCompare([], 'awan', source), ['awan']);
});

test('comparison rows retain canonical evidence, highlight differences, and disclose missing fields', () => {
  const sora = core.find(item => item.id === 'sora');
  const photo = AVAILABLE_LISTINGS.find(item => item.id === 'awan');
  const rows = comparisonRows([sora, photo]);
  const byKey = Object.fromEntries(rows.map(row => [row.key, row]));
  assert.ok(byKey.category, 'Comparison provides a category row');
  assert.equal(byKey.category.different, true);
  assert.deepEqual(byKey.width.values, ['90 cm', '180 cm']);
  assert.deepEqual(byKey.depth.values, ['47,5 cm', '82 cm']);
  assert.deepEqual(byKey.material.values, [sora.material, photo.material]);
  assert.deepEqual(byKey.condition.values, [sora.condition, photo.condition]);
  assert.deepEqual(byKey.media.values, ['3D interaktif · 7 foto', 'Foto · 1 foto']);
  assert.deepEqual(byKey.fulfilment.values, ['Ambil sendiri · Pengiriman contoh', 'Ambil sendiri · Pengiriman contoh']);
  assert.equal(byKey.fulfilment.different, false);
  assert.ok(rows.every(row => typeof row.label === 'string' && row.values.length === 2 && typeof row.different === 'boolean'));
  assert.deepEqual(comparisonRows([]), []);
  assert.ok(comparisonRows([sora]).every(row => row.different === false));
});

test('comparison rows are bounded, remove duplicate/unavailable records, and do not invent missing evidence', () => {
  const incomplete = { id: 'missing', available: true, title: 'Meja contoh', category: 'Meja', price: null };
  const rows = comparisonRows([incomplete, incomplete, COMING_SOON_LISTINGS[0], ...core]);
  assert.ok(rows.length > 0, 'Comparison provides rows for active items');
  assert.ok(rows.every(row => row.values.length === 3));
  for (const key of ['price', 'width', 'depth', 'height', 'material', 'condition', 'wear', 'media', 'location', 'fulfilment', 'seller']) {
    assert.equal(rows.find(row => row.key === key).values[0], 'Belum dicantumkan', key);
  }
});

test('six pinned photo fixtures have complete truthful catalogue records', () => {
  assert.deepEqual(EXTRA_LISTINGS.map(item => item.id), ['awan', 'tala', 'loka', 'nusa', 'senja', 'ruji']);
  for (const item of EXTRA_LISTINGS) {
    assert.ok(item.title && item.category && item.location && item.material && item.description && item.condition);
    assert.ok(Number.isInteger(item.price) && item.price > 0);
    assert.ok(['width', 'depth', 'height'].every(key => Number.isFinite(item.dimensions[key]) && item.dimensions[key] > 0));
    assert.equal(item.available, true);
    assert.equal(item.model, false);
    assert.deepEqual(item.capabilities, { articulation: false, conditions: false, room: false, capture: false });
    assert.equal(item.photos.length, 1);
    assert.deepEqual(item.photos[0].src, `/images/examples/${item.id}.webp`);
    assert.ok(item.photos[0].alt && item.photos[0].caption);
    assert.equal(item.seller.note, 'Contoh penjual');
    assert.ok(Number.isFinite(Date.parse(item.created)));
    assert.equal(item.asset, undefined);
  }
});
