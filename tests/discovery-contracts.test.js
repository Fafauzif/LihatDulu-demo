import test from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_LISTINGS } from '../src/catalogue.js';
import { parseFilters, serializeFilters, filterCatalogue, activeGroupCount, resetRefinements, filtersEqual, parseWholeRupiah, parentCollections, collectionSelections, relatedListings, parsePreparedReference, preparedReferencePath, preparedCandidates } from '../src/discovery.js';
import { createDiscoveryViews, readFilterEntries } from '../src/discovery-views.js';

const ids = items => items.map(item => item.id);
const item = id => AVAILABLE_LISTINGS.find(value => value.id === id);
const f = query => parseFilters(new URLSearchParams(query));

test('refinement reset keeps the applied query/order and cannot mutate the applied draft', () => {
  const applied = f('q=meja+kerja&categories=Meja&locations=Bandung&min=500000&max=2000000&width=130&sort=price-desc&model=1');
  const before = serializeFilters(applied).toString(), draft = resetRefinements(applied);
  assert.equal(draft.q, 'meja kerja');
  assert.equal(draft.sort, 'price-desc');
  assert.equal(activeGroupCount(draft), 0);
  assert.equal(serializeFilters(applied).toString(), before);
  assert.deepEqual(ids(filterCatalogue(AVAILABLE_LISTINGS, draft)), ['loka']);
});

test('query/sort do not inflate the active-group badge; multiple values count once per group', () => {
  assert.equal(activeGroupCount(f('q=kayu&sort=newest')), 0);
  assert.equal(activeGroupCount(f('locations=Bandung,Yogyakarta&materials=Kayu&min=0&max=2000000&width=120&depth=80&categories=Meja&conditions=Pemakaian+ringan&model=1')), 7);
  assert.equal(activeGroupCount(f('categories=Meja&min=0&max=2000000&width=120&locations=Yogyakarta&model=1')), 5);
  assert.deepEqual(ids(filterCatalogue(AVAILABLE_LISTINGS,f('locations=Bandung,Yogyakarta&materials=Kayu'))), ['arca','loka','ruji']);
});

test('filter equivalence ignores categorical selection order but respects actual constraints', () => {
  assert.equal(filtersEqual(f('locations=Bandung,Yogyakarta'), f('locations=Yogyakarta,Bandung')), true);
  assert.equal(filtersEqual(f('q=meja'), f('q=kursi')), false);
  assert.equal(filtersEqual(f('max=0'), f('')), false);
});

test('whole-rupiah parsing accepts grouping without converting fractional or malformed input', () => {
  for (const value of ['2200000', '2.200.000', '2,200,000']) assert.deepEqual(parseWholeRupiah(value), { value:2200000,error:'' });
  assert.deepEqual(parseWholeRupiah(''), { value:null,error:'' });
  assert.equal(parseWholeRupiah('0').value, 0);
  for (const value of ['2.20','1,5','-1','Infinity','12.00.000','1.000,000','1e6']) assert.ok(parseWholeRupiah(value).error, value);
});

test('invalid form range retains raw input and fails before any valid-result count', () => {
  const result = readFilterEntries([['q','meja kerja'],['sort','price-desc'],['min','2.000.000'],['max','1.000.000'],['width','72,6']]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.max);
  assert.equal(result.raw.min, '2.000.000');
  assert.equal(result.raw.max, '1.000.000');
  assert.equal(result.filter.q, 'meja kerja');
  assert.equal(result.filter.sort, 'price-desc');
  assert.equal(result.filter.width, 72.6);
  assert.equal(readFilterEntries([['min','1.000.000'],['max','2.000.000']]).valid,true);
  assert.equal(readFilterEntries([['min','2.20']]).valid,false);
  assert.equal(readFilterEntries([['height','-2']]).valid,false);
});

test('shared invalid price range/unsupported sort sanitize to visible canonical defaults', () => {
  assert.equal(f('min=2000000&max=1000000').min,null);
  assert.equal(f('min=2000000&max=1000000').max,null);
  assert.equal(f('sort=almost-newest').sort,'relevance');
  assert.equal(f('max=1.2').max,null);
});

test('parent categories preserve leaf taxonomy and link to the exact supplied records', () => {
  const collections = parentCollections(AVAILABLE_LISTINGS), byId = Object.fromEntries(collections.map(value=>[value.id,value]));
  assert.equal(byId.seating.count,5);
  assert.deepEqual([...byId.seating.ids].sort(),['arca','awan','ruji','senja','tala']);
  assert.equal(byId.tables.count,2);
  assert.deepEqual(byId.tables.ids,['batu','loka']);
  assert.equal(byId.storage.count,3);
  assert.deepEqual(byId.storage.ids,['sora','rimba','nusa']);
  assert.deepEqual(byId.affordable.ids,['arca','tala','nusa','ruji']);
  assert.equal(byId.affordable.count,4);
  assert.equal(byId.affordable.label,'Hingga Rp1.500.000');
  for(const collection of collections) assert.deepEqual(ids(filterCatalogue(AVAILABLE_LISTINGS,f(collection.href.split('?')[1]))),collection.ids);
  assert.deepEqual(collectionSelections('storage').categories,['Lemari','Penyimpanan']);
  assert.equal(AVAILABLE_LISTINGS.find(value=>value.id==='sora').category,'Lemari');
});

test('actual catalogue price ordering and model eligibility match acceptance fixtures', () => {
  assert.deepEqual(ids(filterCatalogue(AVAILABLE_LISTINGS,f('sort=price-asc'))).slice(0,2),['ruji','tala']);
  assert.deepEqual(ids(filterCatalogue(AVAILABLE_LISTINGS,f('sort=price-desc'))).slice(0,2),['rimba','awan']);
  assert.deepEqual(ids(filterCatalogue(AVAILABLE_LISTINGS,f('model=1'))),['sora','arca','batu','rimba']);
  const ties = [{...item('tala'),id:'z'}, {...item('tala'),id:'a'}];
  assert.deepEqual(ids(filterCatalogue(ties,f('sort=price-asc'))),['a','z']);
  assert.deepEqual(ids(filterCatalogue(ties,f('sort=newest'))),['a','z']);
});

test('prepared mappings use the chosen reference first then actual inclusive width constraints', () => {
  assert.deepEqual(ids(preparedCandidates(AVAILABLE_LISTINGS,{source:'arca',width:null})),['arca','tala','senja']);
  assert.deepEqual(ids(preparedCandidates(AVAILABLE_LISTINGS,{source:'tala',width:null})),['tala','arca','senja']);
  for(const source of ['arca','tala']) {
    assert.deepEqual(ids(preparedCandidates(AVAILABLE_LISTINGS,{source,width:50})),[]);
    assert.deepEqual(ids(preparedCandidates(AVAILABLE_LISTINGS,{source,width:60})),['tala']);
    assert.deepEqual(ids(preparedCandidates(AVAILABLE_LISTINGS,{source,width:72})),['tala','senja']);
    assert.equal(preparedCandidates(AVAILABLE_LISTINGS,{source,width:73}).length,3);
    assert.equal(preparedCandidates(AVAILABLE_LISTINGS,{source,width:72.59}).some(value=>value.id==='arca'),false);
    assert.equal(preparedCandidates(AVAILABLE_LISTINGS,{source,width:72.6}).some(value=>value.id==='arca'),true);
  }
});

test('prepared URL/reset strips unrelated scope while preserving selected Tala', () => {
  const state = parsePreparedReference(new URLSearchParams('source=tala&width=50&q=meja&sort=price-desc&preview=1'));
  assert.deepEqual(state,{source:'tala',width:50});
  assert.equal(preparedReferencePath(state,{resetWidth:true}),'/cari-dari-foto?source=tala#camera-results');
  for(const query of ['source=__proto__&width=bad','source=unknown&width=-1','source=none&width=0','source=tala&width=501']) {
    const canonical = parsePreparedReference(new URLSearchParams(query));
    assert.equal(canonical.width,null);
    assert.ok(['arca','tala'].includes(canonical.source));
  }
});

test('relevant alternatives use same leaf then parent and price distance, allowing fewer than four', () => {
  assert.deepEqual(ids(relatedListings(AVAILABLE_LISTINGS,item('arca'))),['tala','senja','ruji','awan']);
  assert.deepEqual(ids(relatedListings(AVAILABLE_LISTINGS,item('loka'))),['batu']);
  assert.deepEqual(ids(relatedListings(AVAILABLE_LISTINGS,item('sora'))),['rimba','nusa']);
  assert.ok(relatedListings(AVAILABLE_LISTINGS,item('awan')).every(value=>value.id!=='awan'));
});

test('rendered controls omit invented counts/ranges and distinguish query removal from reset', () => {
  const views = createDiscoveryViews();
  const html = views.filterForm(f('q=meja&sort=price-desc'));
  assert.doesNotMatch(html,/type="range"|price-histogram|data-price-slider/);
  assert.match(html,/Kolom kosong berarti tanpa batas/);
  assert.match(html,/data-action="filter-cancel"/);
  assert.match(html,/value="price-desc"/);
  assert.doesNotMatch(views.filterGroup('categories',f('')),/<small>\d+<\/small>/);
  const queryOnly = views.activeFilterChips(f('q=meja'));
  assert.match(queryOnly,/data-key="q"/);
  assert.doesNotMatch(queryOnly,/data-action="clear-filters"/);
});

test('prepared results stay before an optional scene and empty-state recovery preserves source', () => {
  const views = createDiscoveryViews({card: value=>`<article data-test-item="${value.id}">${value.title}</article>`});
  const html = views.photoSearch(new URLSearchParams('source=tala&width=60'));
  assert.ok(html.indexOf('data-test-item="tala"') < html.indexOf('data-camera-demo'));
  assert.match(html,/<details class="prepared-motion"/);
  assert.doesNotMatch(html,/<details[^>]* open/);
  assert.doesNotMatch(html,/data-test-item="arca"/);
  assert.match(html,/selalu memakai model Arca/);
  const empty = views.photoSearch(new URLSearchParams('source=tala&width=50'));
  assert.equal((empty.match(/data-action="photo-reset"/g)||[]).length,2);
  assert.match(empty,/value="tala" selected/);
  assert.match(empty,/Belum ada pilihan hingga 50 cm/);
});
