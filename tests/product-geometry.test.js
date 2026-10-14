import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as engine from '../src/engine.js';
import { evaluatePlacement } from '../src/geometry.js';

const assets = { sora: 'cabinet', arca: 'arca', batu: 'batu', rimba: 'rimba' };
const expected = { sora: { width: 90, depth: 47.5, height: 120 }, arca: { width: 72.6, depth: 62, height: 120 }, batu: { width: 122, depth: 78.1, height: 51.7 }, rimba: { width: 132, depth: 47.5, height: 86 } };
function api(name) { assert.equal(typeof engine[name], 'function', `${name} is exported for actual product geometry`); return engine[name]; }
async function product(id) {
  const bytes = readFileSync(new URL(`../public/assets/${assets[id]}.glb`, import.meta.url));
  // Geometry tests load the retained GLB vertices and transforms. Materials are
  // replaced during loading only to avoid decoding browser-only raster textures.
  const loader = new GLTFLoader().register(() => ({ name: 'GeometryOnly', loadMaterial: () => Promise.resolve(new THREE.MeshBasicMaterial()) }));
  const { scene: model } = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const manifest = JSON.parse(readFileSync(new URL(`../public/assets/${assets[id]}-manifest.json`, import.meta.url)));
  return { model, sourceManifest: manifest, geometry: api('getProductGeometry')(model, manifest) };
}
const room = (width, depth) => ({ minX: -width / 2, maxX: width / 2, minZ: -depth / 2, maxZ: depth / 2 });
const check = ({ model, geometry }, bounds, obstacles = []) => evaluatePlacement({ model, manifest: geometry.manifest, bounds, obstacles });

test('all four retained GLBs provide their actual closed centimetre dimensions rather than Sora defaults or stale manifest sizes', async () => {
  for (const id of Object.keys(assets)) {
    const { geometry } = await product(id);
    assert.deepEqual(geometry.dimensions, expected[id], id);
    assert.ok(geometry.bounds instanceof THREE.Box3 && !geometry.bounds.isEmpty());
  }
});

test('room body fit respects each real model footprint and rotation independently', async () => {
  const expectedWidth = { sora: true, arca: true, batu: false, rimba: false };
  const expectedDepth = { sora: true, arca: false, batu: false, rimba: true };
  for (const id of Object.keys(assets)) {
    const value = await product(id);
    assert.equal(check(value, room(1.2, 2)).closedFits, expectedWidth[id], `${id} width`);
    assert.equal(check(value, room(2, .6)).closedFits, expectedDepth[id], `${id} depth`);
    value.model.rotation.y = Math.PI / 2;
    assert.equal(check(value, room(.6, 2)).closedFits, expectedDepth[id], `${id} rotated depth becomes width`);
  }
});

test('physical part coverage includes repeated-name legs and handles omitted by older manifests', async () => {
  const arca = await product('arca');
  const physical = [];
  arca.model.traverse(node => { if (node.isMesh && !node.name.startsWith('wear_')) physical.push(node.name); });
  assert.deepEqual(new Set(arca.geometry.manifest.partIds), new Set(physical));
  const lastLeg = arca.model.getObjectByName('leg_3');
  const legBounds = new THREE.Box3().setFromObject(lastLeg);
  assert.equal(check(arca, room(3, 3), [legBounds]).closedFits, false);
  const rimba = await product('rimba');
  assert.ok(rimba.geometry.manifest.partIds.includes('knob'));
  assert.ok(rimba.geometry.manifest.partIds.includes('knob_1'));
});

test('motion limits come from real nodes and manifest travel without synthesizing unsupported motions', async () => {
  for (const id of ['arca', 'batu']) {
    const { model, geometry } = await product(id);
    assert.deepEqual(geometry.motionLimits, {});
    assert.equal(model.getObjectByName('left_door_pivot'), undefined);
    assert.equal(model.getObjectByName('drawer_slide'), undefined);
  }
  const sora = await product('sora');
  assert.deepEqual(Object.keys(sora.geometry.motionLimits), ['left', 'right', 'drawer']);
  assert.equal(sora.geometry.motionLimits.left.max, 100);
  assert.equal(sora.geometry.motionLimits.drawer.max, .3);
  const rimba = await product('rimba');
  assert.deepEqual(Object.keys(rimba.geometry.motionLimits), ['left', 'right']);
  assert.ok(Math.abs(rimba.geometry.motionLimits.left.max - THREE.MathUtils.radToDeg(1.05)) < 1e-8);
  assert.equal(rimba.model.getObjectByName('drawer_slide'), undefined);
});

test('dimension guides span each product actual bounds and retain its canonical rounded labels', async () => {
  for (const id of Object.keys(assets)) {
    const { geometry } = await product(id);
    const guides = api('productDimensionGuides')(geometry);
    assert.deepEqual(guides.map(guide => guide.key), ['width', 'height', 'depth']);
    for (const guide of guides) {
      const axis = { width: 'x', depth: 'z', height: 'y' }[guide.key];
      assert.equal(guide.start[axis], geometry.bounds.min[axis]);
      assert.equal(guide.end[axis], geometry.bounds.max[axis]);
      assert.equal(guide.label, `${expected[id][guide.key].toLocaleString('id-ID')} cm`);
    }
  }
});

test('placement evaluation restores articulated poses and Sora independent door/drawer outcomes', async () => {
  const sora = await product('sora');
  const left = sora.model.getObjectByName('left_door_pivot'), drawer = sora.model.getObjectByName('drawer_slide');
  left.rotation.y = -.7; drawer.position.z = .18;
  sora.model.position.z = -.4;
  const blocker = (center, size) => new THREE.Box3(new THREE.Vector3(...center).sub(new THREE.Vector3(...size).multiplyScalar(.5)), new THREE.Vector3(...center).add(new THREE.Vector3(...size).multiplyScalar(.5)));
  const doors = check(sora, room(3.2, 3), [blocker([-.30, .62, -.02], [.14, .24, .1])]);
  assert.deepEqual([doors.closedFits, doors.doorsClear, doors.drawerClear], [true, false, true]);
  const drawers = check(sora, room(3.2, 3), [blocker([0, 1.09, .075], [.24, .1, .15])]);
  assert.deepEqual([drawers.closedFits, drawers.doorsClear, drawers.drawerClear], [true, true, false]);
  assert.equal(left.rotation.y, -.7);
  assert.equal(drawer.position.z, .18);
});

test('product fixture obstacles obstruct real Rimba doors and reject unsupported drawer or static furniture fixtures', async () => {
  const rimba = await product('rimba');
  rimba.model.position.z = -.4;
  const fixture = api('getProductFixture')(rimba.model, rimba.geometry, 'door', { x: 0, z: -.4, rotation: 0 });
  assert.ok(fixture);
  const half = fixture.size.clone().multiplyScalar(.5);
  const result = check(rimba, room(3.2, 3), [new THREE.Box3(fixture.center.clone().sub(half), fixture.center.clone().add(half))]);
  assert.deepEqual([result.closedFits, result.doorsClear], [true, false]);
  assert.equal(engine.getProductFixture(rimba.model, rimba.geometry, 'drawer'), null);
  for (const id of ['arca', 'batu']) {
    const value = await product(id);
    assert.equal(engine.getProductFixture(value.model, value.geometry, 'door'), null);
  }
});
