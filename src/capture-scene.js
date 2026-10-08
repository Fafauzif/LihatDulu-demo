import * as THREE from 'three';
import { createRoom } from './geometry.js';

const AREA_LABELS = {
  overview: 'Tampilan keseluruhan', front: 'Bagian depan', 'front-left': 'Depan kiri',
  'front-right': 'Depan kanan', left: 'Sisi kiri', right: 'Sisi kanan', rear: 'Bagian belakang',
  'rear-lower': 'Belakang bawah', top: 'Permukaan atas', underside: 'Bagian bawah',
  interior: 'Bagian dalam', drawer: 'Laci', scratch: 'Goresan', chip: 'Sudut terkelupas', mark: 'Bekas permukaan',
};
const PHASE_LABELS = { prepare: 'Siapkan barang', exterior: 'Rekam bagian luar', interior: 'Foto detail & bagian dalam', review: 'Tinjau hasil rekaman' };

function roundedShape(width, height, radius) {
  const shape = new THREE.Shape(), x = -width / 2, y = -height / 2;
  shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius); shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function canvasTexture(width, height, paint) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return { canvas, texture };
}

/** Authored spatial illustration. The phone preview renders the existing cabinet,
 * not a real camera input or reconstructed object. */
export function createCaptureScene({ scene, renderer, reduced = () => false }) {
  const group = new THREE.Group(); group.name = 'capture_illustration'; group.visible = false; scene.add(group);
  const room = createRoom({ width: 4.8, depth: 4.8, height: 2.6 });
  room.group.name = 'capture_room'; group.add(room.group);
  const paint = new THREE.MeshStandardMaterial({ color: 0xf1eee6, roughness: .92 });
  const oak = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#d7c5ab'; c.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) {
      c.fillStyle = row % 3 === 0 ? '#d3bea0' : row % 3 === 1 ? '#e0cbb0' : '#d8c1a2';
      c.fillRect(0, row * 64 + 1, w, 63);
      c.strokeStyle = 'rgba(112,80,43,.10)'; c.lineWidth = 1;
      for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(0, row * 64 + 8 + k * 7); c.bezierCurveTo(150, row * 64 + k * 7, 300, row * 64 + 15 + k * 7, w, row * 64 + 8 + k * 7); c.stroke(); }
      c.strokeStyle = 'rgba(108,79,48,.16)'; c.beginPath(); const x = row % 2 ? 156 : 342; c.moveTo(x, row * 64); c.lineTo(x, row * 64 + 64); c.stroke();
    }
  });
  oak.texture.wrapS = oak.texture.wrapT = THREE.RepeatWrapping; oak.texture.repeat.set(3, 3);
  const floor = new THREE.MeshStandardMaterial({ map: oak.texture, roughness: .86 });
  const oldMaterials = new Set();
  room.group.traverse(n => { if (!n.isMesh) return; oldMaterials.add(n.material); if (n.name === 'floor') n.material = floor; else if (n.name !== 'window_view') n.material = paint; });
  // The shared initial room materials that are no longer referenced can be freed now.
  for (const material of oldMaterials) if (!room.group.children.some(n => n.material === material)) material.dispose();
  const grid = room.group.children.find(n => n.isLineSegments); if (grid) grid.visible = false;
  const green = new THREE.MeshStandardMaterial({ color: 0x355e49, roughness: .76 });
  const clay = new THREE.MeshStandardMaterial({ color: 0xb5785b, roughness: .88 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xe1d7c6, roughness: .85 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23362e, roughness: .62 });
  function box(name, size, position, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.name = name;
    mesh.position.set(...position); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh); return mesh;
  }
  box('capture_rear_baseboard', [4.8, .06, .025], [0, .03, -2.385], trim);
  box('capture_left_baseboard', [.025, .06, 4.8], [-2.385, .03, 0], trim);
  // Small furniture-free room context keeps attention on the item being recorded.
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.145, .11, .29, 32), clay); pot.position.set(-1.78, .145, -1.78); pot.castShadow = true; group.add(pot);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.012, .014, .82, 12), green); stem.position.set(-1.78, .7, -1.78); group.add(stem);
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4, y = .43 + i * .075;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), green);
    leaf.scale.set(.16, .028, .075); leaf.position.set(-1.78 + Math.cos(a) * .12, y, -1.78 + Math.sin(a) * .12); leaf.rotation.set(.2, a, .3); leaf.castShadow = true; group.add(leaf);
  }
  box('capture_art_frame', [.62, .78, .032], [1.4, 1.55, -2.368], trim);
  const art = canvasTexture(256, 320, (c, w, h) => {
    c.fillStyle = '#f0e5d6'; c.fillRect(0, 0, w, h); c.fillStyle = '#b5785b'; c.beginPath(); c.arc(w * .6, h * .35, 67, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#476b56'; c.fillRect(28, h * .5, 90, h * .4); c.fillStyle = '#dac1a0'; c.beginPath(); c.arc(w * .62, h * .78, 50, Math.PI, 0); c.lineTo(w * .62 + 50, h); c.lineTo(w * .62 - 50, h); c.fill();
  });
  const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(.57, .73), new THREE.MeshBasicMaterial({ map: art.texture })); artMesh.position.set(1.4, 1.55, -2.346); group.add(artMesh);
  const checkpointGroup = new THREE.Group(); checkpointGroup.name = 'capture_coverage_checkpoints'; group.add(checkpointGroup);
  const checkpointPositions = [[0, 1.12], [.95, .6], [.98, -.6], [0, -1.12], [-.98, -.6], [-.95, .6]];
  const checkpoints = checkpointPositions.map(([x, z], index) => {
    const material = new THREE.MeshBasicMaterial({ color: 0xc7cfc6, transparent: true, opacity: .6, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(.065, .089, 28), material); ring.rotation.x = -Math.PI / 2; ring.position.set(x, .004, z); checkpointGroup.add(ring);
    const disk = new THREE.Mesh(new THREE.CircleGeometry(.044, 24), new THREE.MeshBasicMaterial({ color: 0x265d43, transparent: true, opacity: .16, depthWrite: false })); disk.rotation.x = -Math.PI / 2; disk.position.set(x, .005, z); checkpointGroup.add(disk);
    return { ring, disk, index };
  });
  const coverageArc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 65 }, (_, i) => new THREE.Vector3(Math.sin(i / 64 * Math.PI * 2) * 1.13, .003, Math.cos(i / 64 * Math.PI * 2) * 1.13))), new THREE.LineDashedMaterial({ color: 0x8b9b8e, dashSize: .045, gapSize: .055, transparent: true, opacity: .45 })); coverageArc.computeLineDistances(); checkpointGroup.add(coverageArc);

  // The authored phone is 11.5 × 23 × 1.1 cm for legibility in the room scene.
  const phone = new THREE.Group(); phone.name = 'capture_phone'; group.add(phone);
  const chassis = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(.115, .23, .017), { depth: .011, bevelEnabled: true, bevelThickness: .0016, bevelSize: .0016, bevelSegments: 3, steps: 1 }), dark);
  chassis.position.z = -.007; chassis.castShadow = true; phone.add(chassis);
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(.108, .222, .014)), new THREE.MeshPhysicalMaterial({ color: 0x131917, metalness: .15, roughness: .18, clearcoat: .8 })); glass.position.z = .0052; phone.add(glass);
  const screenShape = new THREE.ShapeGeometry(roundedShape(.099, .21, .010));
  // ShapeGeometry uses local positions as UVs. Normalize the rounded screen
  // explicitly so the full recording interface spans the small physical phone.
  const screenPositions = screenShape.getAttribute('position'), screenUVs = screenShape.getAttribute('uv');
  for (let i = 0; i < screenPositions.count; i++) screenUVs.setXY(i, (screenPositions.getX(i) + .099 / 2) / .099, (screenPositions.getY(i) + .21 / 2) / .21);
  screenUVs.needsUpdate = true;
  const previewTarget = new THREE.WebGLRenderTarget(384, 480, { depthBuffer: true }); previewTarget.texture.name = 'simulated_cabinet_preview';
  const preview = new THREE.Mesh(new THREE.PlaneGeometry(.099, .120), new THREE.MeshBasicMaterial({ map: previewTarget.texture, toneMapped: false })); preview.position.set(0, .003, .0058); phone.add(preview);
  const overlay = canvasTexture(512, 1080, () => {});
  const screen = new THREE.Mesh(screenShape, new THREE.MeshBasicMaterial({ map: overlay.texture, transparent: true, toneMapped: false })); screen.position.z = .0061; phone.add(screen);
  const cameraPill = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(.025, .0068, .003)), new THREE.MeshBasicMaterial({ color: 0x101410 })); cameraPill.position.set(0, .097, .0065); phone.add(cameraPill);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.0013, 16), new THREE.MeshBasicMaterial({ color: 0x243b45 })); lens.position.set(.007, .097, .0066); phone.add(lens);
  for (const [y, h] of [[.035, .028], [-.007, .024]]) { const button = new THREE.Mesh(new THREE.BoxGeometry(.0018, h, .003), dark); button.position.set(-.0585, y, -.001); phone.add(button); }
  const shutterSide = new THREE.Mesh(new THREE.BoxGeometry(.0018, .037, .003), dark); shutterSide.position.set(.0585, .02, -.001); phone.add(shutterSide);
  const captureCamera = new THREE.PerspectiveCamera(50, 384 / 480, .015, 30);
  let state = { phase: 'prepare', area: 'front', progress: 0 }, pose, phoneMove, lastPreview = -Infinity, active = false;
  const previewClear = new THREE.Color();
  function paintScreen() {
    const c = overlay.canvas.getContext('2d'), w = overlay.canvas.width, h = overlay.canvas.height;
    c.clearRect(0, 0, w, h); c.fillStyle = '#17241d'; c.fillRect(0, 0, w, 218); c.fillRect(0, 835, w, h - 835);
    c.textAlign = 'left'; c.font = '600 23px sans-serif'; c.fillStyle = '#ffffff'; c.fillText('9:41', 30, 50); c.textAlign = 'right'; c.fillText('●  ▰', w - 30, 50);
    c.textAlign = 'left'; c.font = '700 42px sans-serif'; c.fillText('LihatDulu', 30, 129); c.font = '400 23px sans-serif'; c.fillStyle = '#d4ddd5'; c.fillText(PHASE_LABELS[state.phase], 30, 174);
    c.fillStyle = 'rgba(18,35,25,.68)'; c.beginPath(); c.roundRect(25, 244, w - 50, 59, 16); c.fill(); c.fillStyle = '#ffffff'; c.font = '600 24px sans-serif'; c.fillText(AREA_LABELS[state.area] || 'Tampilan keseluruhan', 43, 283);
    c.strokeStyle = 'rgba(255,255,255,.90)'; c.lineWidth = 4;
    for (const [x, y, dx, dy] of [[45, 330, 1, 1], [w - 45, 330, -1, 1], [45, 785, 1, -1], [w - 45, 785, -1, -1]]) { c.beginPath(); c.moveTo(x, y + dy * 28); c.lineTo(x, y); c.lineTo(x + dx * 28, y); c.stroke(); }
    c.fillStyle = '#abbeb0'; c.font = '500 21px sans-serif'; c.fillText(state.phase === 'interior' ? 'FOTO DETAIL BARANG' : 'PANDUAN FOTO BARANG', 30, 880);
    c.fillStyle = '#33493b'; c.beginPath(); c.roundRect(30, 903, w - 60, 7, 4); c.fill(); c.fillStyle = '#a5cbb1'; c.beginPath(); c.roundRect(30, 903, Math.max(7, (w - 60) * state.progress), 7, 4); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, 972, 42, 0, Math.PI * 2); c.stroke(); c.fillStyle = state.phase === 'prepare' || state.phase === 'review' ? '#ffffff' : '#bc7359'; c.beginPath(); c.arc(w / 2, 972, 33, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#d4ddd5'; c.font = '600 21px sans-serif'; c.textAlign = 'center'; c.fillText(Math.round(state.progress * 100) + '%', 83, 981); c.fillText('1×', w - 83, 981);
    c.fillStyle = '#f8faf8'; c.beginPath(); c.roundRect(w / 2 - 68, 1046, 136, 6, 3); c.fill(); overlay.texture.needsUpdate = true;
  }
  function resolvePose(report) {
    const key = state.area === 'rear-lower' ? 'rear' : state.area;
    const preset = report.cameraPresets[key] || report.cameraPresets.front;
    const target = new THREE.Vector3().fromArray(preset.target);
    const source = new THREE.Vector3().fromArray(preset.position);
    if (state.phase === 'prepare' || state.phase === 'review') {
      return { phone: new THREE.Vector3(1.13, .94, .62), phoneTarget: new THREE.Vector3(0, .72, 0), camera: new THREE.Vector3(2.65, 2.02, 3.30), target: new THREE.Vector3(.1, .73, .05) };
    }
    if (key === 'underside') { source.set(.9, .26, 1.42); target.set(0, .2, 0); }
    if (['scratch', 'chip', 'mark'].includes(key)) {
      const condition = report.conditions.find(c => c.id === key);
      // Detail phases use a representative composition. The original evidence photo
      // remains the report's high-resolution condition evidence.
      if (condition?.id === 'mark') { source.set(.72, 1.65, .80); target.set(0, 1.2, 0); }
      else if (condition?.id === 'chip') { source.set(.88, 1.5, .8); target.set(.44, 1.19, .19); }
      else { source.set(.12, .62, 1.2); target.set(0, .65, .2); }
    }
    const toward = source.clone().sub(target).normalize();
    const distance = ['top', 'drawer'].includes(key) ? 1.15 : 1.6;
    const phonePosition = target.clone().add(toward.clone().multiplyScalar(distance));
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toward).normalize();
    phonePosition.add(right.clone().multiplyScalar(.13));
    // A close over-the-shoulder view makes the phone visible while retaining the cabinet.
    const cameraPosition = phonePosition.clone().add(toward.clone().multiplyScalar(.52)).add(right.clone().multiplyScalar(.25));
    return { phone: phonePosition, phoneTarget: target, camera: cameraPosition, target: phonePosition.clone().lerp(target, .35).add(right.clone().multiplyScalar(-.08)) };
  }
  function setState(next, report, instant = false) {
    state = { phase: PHASE_LABELS[next.phase] ? next.phase : 'prepare', area: AREA_LABELS[next.area] ? next.area : 'front', progress: THREE.MathUtils.clamp(Number(next.progress) || 0, 0, 1) };
    active = true; group.visible = true; pose = resolvePose(report);
    const away = pose.phone.clone().sub(pose.phoneTarget).normalize();
    const dummy = new THREE.Object3D(); dummy.position.copy(pose.phone); dummy.lookAt(pose.phone.clone().add(away));
    phoneMove = { start: performance.now(), from: phone.position.clone(), to: pose.phone.clone(), qFrom: phone.quaternion.clone(), qTo: dummy.quaternion.clone(), duration: instant || reduced() ? 0 : 650 };
    if (!phoneMove.duration) { phone.position.copy(phoneMove.to); phone.quaternion.copy(phoneMove.qTo); phoneMove = null; }
    checkpointGroup.visible = state.phase === 'prepare' || state.phase === 'exterior';
    const completed = Math.floor(state.progress * checkpoints.length), current = Math.min(completed, checkpoints.length - 1);
    for (const { ring, disk, index } of checkpoints) { ring.material.color.set(index < completed ? 0x2f7350 : index === current ? 0x8a694f : 0xbac5bc); ring.material.opacity = index === current ? .95 : .55; disk.material.opacity = index < completed ? .45 : .16; }
    paintScreen(); lastPreview = -Infinity;
  }
  function getCameraPose(aspect = 1) {
    if (!pose) return null;
    const target = pose.target.clone(), offset = pose.camera.clone().sub(target);
    if (aspect < .85) offset.multiplyScalar(Math.min(2.2, .9 / Math.max(.25, aspect)));
    return { position: target.clone().add(offset), target };
  }
  function tick(now) {
    if (!active) return;
    if (phoneMove) { const t = phoneMove.duration ? Math.min(1, (now - phoneMove.start) / phoneMove.duration) : 1, s = 1 - (1 - t) ** 3; phone.position.lerpVectors(phoneMove.from, phoneMove.to, s); phone.quaternion.slerpQuaternions(phoneMove.qFrom, phoneMove.qTo, s); if (t === 1) phoneMove = null; }
    captureCamera.position.copy(phone.position);
    if (pose) captureCamera.lookAt(pose.phoneTarget); captureCamera.updateMatrixWorld();
    // The target draws only the authored item and room. It does not request camera access.
    if (now - lastPreview > 100 || phoneMove) { renderPreview(); lastPreview = now; }
  }
  function renderPreview() {
    if (!active) return;
    const target = renderer.getRenderTarget(), alpha = renderer.getClearAlpha(); renderer.getClearColor(previewClear);
    phone.visible = false; checkpointGroup.visible = false; room.setNearWallHidden(true, captureCamera.position);
    renderer.setRenderTarget(previewTarget); renderer.setClearColor(0xe9ede7, 1); renderer.clear(); renderer.render(scene, captureCamera);
    renderer.setRenderTarget(target); renderer.setClearColor(previewClear, alpha); phone.visible = true; checkpointGroup.visible = state.phase === 'prepare' || state.phase === 'exterior';
  }
  function setVisible(visible) { active = Boolean(visible); group.visible = active; if (!active) phoneMove = null; }
  return {
    group, phone, room, setState, getCameraPose, tick, renderPreview, setVisible,
    prepareFrame(camera) { if (active) room.setNearWallHidden(true, camera.position); },
    dispose() { active = false; previewTarget.dispose(); group.removeFromParent(); const gs = new Set(), ms = new Set(), ts = new Set(); group.traverse(n => { if (n.geometry) gs.add(n.geometry); for (const m of Array.isArray(n.material) ? n.material : n.material ? [n.material] : []) { ms.add(m); for (const value of Object.values(m)) if (value?.isTexture && value !== previewTarget.texture) ts.add(value); } }); gs.forEach(g => g.dispose()); ms.forEach(m => m.dispose()); ts.forEach(t => t.dispose()); },
  };
}
