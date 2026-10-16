import test from 'node:test';
import assert from 'node:assert/strict';
import { AVAILABLE_LISTINGS, getListing, getSeller, sellerListings, relatedListings, SELLER_ALIASES } from '../src/catalogue.js';
import { mediaSrc, productCover, galleryMedia, conditionNotes, mediaCounts } from '../src/product-media.js';
import { image } from '../src/components.js';
import { checkoutTotals } from '../src/market-state.js';

const sora = getListing('sora');
test('edited cover can never replace a model gallery or exact condition image', () => {
  assert.equal(productCover(sora).src, '/images/cutouts/sora.webp');
  assert.equal(mediaSrc(sora.photos[0].src), '/images/products/sora/hero.webp');
  const gallery = galleryMedia(sora);
  assert.equal(gallery[0].src, '/images/products/sora/hero.webp');
  assert.equal(gallery[0].kind, 'render');
  assert.match(gallery[0].caption, /^Render/);
  assert.match(image(gallery[0]), /src="\/images\/products\/sora\/hero.webp"/);
  for (const note of conditionNotes(sora)) {
    const entry = gallery.find(photo => photo.conditionId === note.id);
    assert.equal(entry.src, note.image);
    assert.equal(entry.kind, 'condition');
    assert.equal(entry.modelAnchor, note.id);
    assert.ok(entry.caption.includes(note.size));
  }
});
test('gallery assets, unique condition notes and prepared seller groups stay independent', () => {
  assert.deepEqual(mediaCounts(sora), { gallery: 7, condition: 3, sellerGroups: 0, model: true });
  assert.equal(mediaCounts(sora, ['front', 'front', 'right', 'rear', 'interior', 'drawer', 'scratch', 'unknown']).sellerGroups, 6);
  assert.deepEqual(conditionNotes(sora).map(note => note.size), ['Panjang 11 cm', '8 × 5 mm', 'Diameter 5,5 cm']);
  for (const item of AVAILABLE_LISTINGS.filter(item => !item.model)) {
    assert.deepEqual(mediaCounts(item, ['front']), { gallery: 1, condition: 0, sellerGroups: 0, model: false });
    assert.equal(galleryMedia(item)[0].src, item.photos[0].src);
    assert.equal(galleryMedia(item)[0].kind, 'photo');
  }
});
test('stable seller aliases retain one-item inventories and known identity when unavailable', () => {
  assert.equal(new Set(AVAILABLE_LISTINGS.map(item => item.seller.id)).size, 10);
  assert.equal(SELLER_ALIASES.sora, 'studio-sora');
  assert.equal(getSeller('sora').id, 'studio-sora');
  assert.equal(getSeller('studio-sora').name, 'Studio Sora');
  assert.deepEqual(sellerListings('sora').map(item => item.id), ['sora']);
  const unavailable = AVAILABLE_LISTINGS.map(item => item.id === 'sora' ? { ...item, available: false } : item);
  assert.equal(getSeller('sora', unavailable).id, 'studio-sora');
  assert.deepEqual(sellerListings('sora', unavailable), []);
  const renamed = AVAILABLE_LISTINGS.map(item => item.id === 'sora' ? { ...item, seller: { ...item.seller, name: 'Sora Nama Baru' } } : item);
  assert.deepEqual(sellerListings('studio-sora', renamed).map(item => item.id), ['sora']);
  assert.equal(checkoutTotals(['sora'], { delivery: 'pickup' }, renamed).total, 2600000);
  assert.equal(checkoutTotals(['sora'], { delivery: 'delivery' }, renamed).total, 2750000);
});
test('alternatives prioritize leaf category, then same parent and nearest price without padding', () => {
  assert.deepEqual(relatedListings(getListing('sora')).map(item => item.id), ['rimba', 'nusa']);
  assert.deepEqual(relatedListings(getListing('batu')).map(item => item.id), ['loka']);
  assert.deepEqual(relatedListings(getListing('arca')).map(item => item.id), ['tala', 'senja', 'ruji', 'awan']);
  const fixtures = [
    { ...getListing('tala'), id: 'z-chair', price: 1280000 },
    { ...getListing('tala'), id: 'a-chair', price: 1280000 },
    { ...getListing('tala'), id: 'sold-chair', status: 'sold' },
    { ...getListing('tala'), id: 'future-chair', available: false }
  ];
  assert.deepEqual(relatedListings(getListing('arca'), fixtures).map(item => item.id), ['a-chair', 'z-chair']);
});
