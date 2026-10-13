import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { evaluatePlacement } from '../src/geometry.js';
import { validateRoom } from '../src/state.js';

const manifest = JSON.parse(readFileSync(new URL('../public/assets/cabinet-manifest.json', import.meta.url)));

// Build the same physical parts and pivots that the engine checks, from the authored manifest.
function cabinet() {
  const model = new THREE.Group(), root = new THREE.Group();
  root.name = 'cabinet_root'; model.add(root);
  for (const motion of manifest.motion) {
    const pivot = new THREE.Group(); pivot.name = motion.nodeId;
    pivot.position.fromArray(motion.pivotM); root.add(pivot);
  }
  for (const part of manifest.parts) {
    const min = part.boundsMM.slice(0, 3).map(value => value / 1000);
    const max = part.boundsMM.slice(3).map(value => value / 1000);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...min.map((value, index) => max[index] - value)));
    mesh.name = part.id;
    const parent = model.getObjectByName(part.parent);
    mesh.position.fromArray(min.map((value, index) => (value + max[index]) / 2)).sub(parent.position);
    parent.add(mesh);
  }
  return model;
}

function checkRoom(room, model = cabinet()) {
  model.position.set(room.x, 0, room.z); model.rotation.y = THREE.MathUtils.degToRad(room.rotation);
  const obstacles = [];
  if (room.fixture === 'door' || room.fixture === 'drawer') {
    const center = new THREE.Vector3(...(room.fixture === 'door' ? [-.30, .62, -.02] : [0, 1.09, .075]));
    const half = new THREE.Vector3(...(room.fixture === 'door' ? [.14, .24, .1] : [.24, .1, .15])).multiplyScalar(.5);
    obstacles.push(new THREE.Box3(center.clone().sub(half), center.clone().add(half)));
  }
  return evaluatePlacement({ model, manifest, obstacles, bounds: { minX: -room.width / 2, maxX: room.width / 2, minZ: -room.depth / 2, maxZ: room.depth / 2 } });
}

test('each one-click room produces independently checked body, door and drawer clearance', async () => {
  const { ROOM_PRESETS, roomForPreset } = await import('../src/room-presets.js');
  assert.equal(ROOM_PRESETS.length, 3);
  const expected = {
    clear: { closedFits: true, doorsClear: true, drawerClear: true },
    door: { closedFits: true, doorsClear: false, drawerClear: true },
    drawer: { closedFits: true, doorsClear: true, drawerClear: false },
  };
  for (const preset of ROOM_PRESETS) {
    const room = roomForPreset(preset.id);
    assert.deepEqual(validateRoom(room), room);
    const { conflicts, ...fit } = checkRoom(room);
    assert.deepEqual(fit, expected[preset.id], preset.id);
    if (preset.id !== 'clear') assert.equal(conflicts[0].obstacle, 'example-block');
  }
});

test('preset selection restores geometry after a moved, rotated room without mutating templates', async () => {
  const { roomForPreset, matchRoomPreset } = await import('../src/room-presets.js');
  const model = cabinet();
  checkRoom({ width: 3.2, depth: 3, x: 1.5, z: -.4, rotation: 45, fixture: 'clear' }, model);
  assert.equal(checkRoom(roomForPreset('door'), model).doorsClear, false);
  const clear = roomForPreset('clear');
  assert.equal(checkRoom(clear, model).closedFits, true);
  assert.equal(checkRoom(clear, model).doorsClear, true);
  assert.equal(checkRoom(clear, model).drawerClear, true);
  clear.x = 1.5;
  assert.equal(matchRoomPreset(clear), null);
  assert.equal(roomForPreset('clear').x, 0);
  assert.equal(matchRoomPreset(roomForPreset('drawer')), 'drawer');
  assert.equal(roomForPreset('missing'), null);
  assert.equal(matchRoomPreset(null), null);
});
