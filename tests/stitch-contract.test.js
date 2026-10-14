import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { AVAILABLE_LISTINGS, COMING_SOON_LISTINGS, ALL_LISTINGS } from '../src/catalogue.js';

// These hashes were measured from the user-supplied V5.1 source ZIP. They protect
// the explicitly requested model retention, rather than accepting a replacement
// box or a changed mesh just because a canvas exists.
const originalModels = {
  sora: ['cabinet', '18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742'],
  arca: ['arca', '376a875a4f7fe6af102d89292d5a1abb1eca1eaa7ea93d80c61678ae0c3afe28'],
  batu: ['batu', '45d556bfb599f4a3e7c4c3668acdb7e71241e540dbb15683225c5642e0debe60'],
  rimba: ['rimba', '7881860eb17b19f25943f3d5ebb36f4c3719556a19c6bf8e505b0ced686719d9']
};
const asset = pathname => new URL('../public' + pathname, import.meta.url);

test('ten active furniture listings have usable canonical decision information', () => {
  assert.equal(AVAILABLE_LISTINGS.length, 10);
  assert.equal(new Set(ALL_LISTINGS.map(item => item.id)).size, ALL_LISTINGS.length);
  const furnitureCategories = new Set(['Lemari', 'Kursi', 'Meja', 'Penyimpanan', 'Sofa', 'Lounge', 'Bangku']);
  for (const item of AVAILABLE_LISTINGS) {
    assert.equal(item.available, true, item.id);
    assert.ok(furnitureCategories.has(item.category), item.id + ' is furniture only');
    assert.ok(Number.isInteger(item.price) && item.price > 0, item.id + ' has an asking price');
    for (const field of ['title', 'material', 'condition', 'location', 'description']) assert.ok(typeof item[field] === 'string' && item[field].trim(), item.id + ':' + field);
    for (const field of ['width', 'depth', 'height']) assert.ok(Number.isFinite(item.dimensions[field]) && item.dimensions[field] > 0, item.id + ':' + field);
    assert.ok(item.seller.name.trim(), item.id + ' names its example seller');
    assert.ok(Array.isArray(item.fulfilment) && item.fulfilment.length, item.id + ' has fulfilment information');
    assert.ok(item.photos.length && item.photos.every(photo => photo.alt?.trim() && photo.caption?.trim()), item.id + ' has described pictures');
  }
});

test('four original models are byte-for-byte retained and remain room-capable', () => {
  assert.deepEqual(AVAILABLE_LISTINGS.filter(item => item.model).map(item => item.id).sort(), Object.keys(originalModels).sort());
  for (const [id, [filename, hash]] of Object.entries(originalModels)) {
    const item = AVAILABLE_LISTINGS.find(item => item.id === id);
    assert.equal(item.asset.modelUrl, `/assets/${filename}.glb`);
    assert.equal(item.capabilities.room, true);
    const bytes = fs.readFileSync(asset(item.asset.modelUrl));
    assert.equal(bytes.subarray(0, 4).toString(), 'glTF');
    assert.equal(bytes.readUInt32LE(4), 2, id + ' is GLB2');
    assert.equal(bytes.readUInt32LE(8), bytes.length, id + ' container is complete');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, id + ' original mesh retained');
  }
});

test('six photo-only records cannot imply model room reconstruction or condition hotspots', () => {
  const photoItems = AVAILABLE_LISTINGS.filter(item => !item.model);
  assert.deepEqual(photoItems.map(item => item.id).sort(), ['awan', 'loka', 'nusa', 'ruji', 'senja', 'tala']);
  for (const item of photoItems) {
    assert.equal(item.asset?.modelUrl, undefined, item.id);
    for (const field of ['articulation', 'conditions', 'room', 'capture']) assert.equal(item.capabilities[field], false, item.id + ':' + field);
    assert.equal(item.photos[0].src, `/images/examples/${item.id}.webp`);
  }
  assert.deepEqual(AVAILABLE_LISTINGS.filter(item => item.capabilities.capture).map(item => item.id), ['sora'], 'Prepared capture is Sora only');
});

test('coming-soon furniture has no invented price or live model capability', () => {
  assert.equal(COMING_SOON_LISTINGS.length, 2);
  for (const item of COMING_SOON_LISTINGS) {
    assert.equal(item.available, false);
    assert.equal(item.price, null);
    assert.equal(item.model, false);
    assert.equal(item.capabilities?.room === true, false);
  }
});

test('all catalogue picture containers exist and are complete local WebP assets', () => {
  for (const item of ALL_LISTINGS) for (const photo of item.photos) {
    assert.ok(photo.src.startsWith('/images/'), item.id + ' does not depend on an external picture request');
    const bytes = fs.readFileSync(asset(photo.src));
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', photo.src);
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', photo.src);
    assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, photo.src + ' is not truncated');
  }
});
