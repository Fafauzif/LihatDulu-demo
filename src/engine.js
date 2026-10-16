import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createRoom, evaluatePlacement } from "./geometry.js";
import { createCaptureScene } from "./capture-scene.js";
import { validateViewState } from "./viewer-state.js";
import { validatePlacementPreview } from "./state.js";

const MOTION_NODES = {
  left: "left_door_pivot",
  right: "right_door_pivot",
  drawer: "drawer_slide",
};

// Measure the retained physical meshes, not catalogue-era cabinet constants.
// GLTFLoader uniquifies repeated names (leg, leg_1, ...); include every such part.
export function getProductGeometry(model, sourceManifest = {}) {
  const physical = [];
  model.traverse((node) => {
    if (node.isMesh && !node.name.startsWith("wear_")) physical.push(node);
  });
  const used = new Set();
  physical.forEach((node, index) => {
    let name = node.name || `physical_${index}`;
    while (used.has(name)) name += `_${index}`;
    node.name = name;
    used.add(name);
  });
  const motion = (sourceManifest.motion || [])
    .filter(
      (value) =>
        model.getObjectByName(value.nodeId) &&
        ["rotation", "translation"].includes(value.type) &&
        ["x", "y", "z"].includes(value.axis) &&
        Number.isFinite(value.openValue),
    )
    .map((value) => {
      const node = model.getObjectByName(value.nodeId);
      return {
        ...value,
        closedValue: value.closedValue || 0,
        pivotM: Array.isArray(value.pivotM)
          ? [...value.pivotM]
          : node.position.toArray(),
      };
    });
  const saved = motion.map((value) => {
    const node = model.getObjectByName(value.nodeId);
    return {
      node,
      position: node.position.clone(),
      rotation: node.rotation.clone(),
    };
  });
  const bounds = new THREE.Box3();
  try {
    motion.forEach((value, index) => {
      const node = saved[index].node;
      if (value.type === "rotation")
        node.rotation[value.axis] = value.closedValue;
      else
        node.position[value.axis] =
          value.pivotM[{ x: 0, y: 1, z: 2 }[value.axis]] + value.closedValue;
    });
    model.updateMatrixWorld(true);
    const inverse = model.matrixWorld.clone().invert();
    for (const node of physical) {
      node.geometry.computeBoundingBox();
      const box = node.geometry.boundingBox,
        matrix = new THREE.Matrix4().multiplyMatrices(
          inverse,
          node.matrixWorld,
        );
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z])
            bounds.expandByPoint(
              new THREE.Vector3(x, y, z).applyMatrix4(matrix),
            );
    }
  } finally {
    saved.forEach(({ node, position, rotation }) => {
      node.position.copy(position);
      node.rotation.copy(rotation);
    });
    model.updateMatrixWorld(true);
  }
  const size = bounds.getSize(new THREE.Vector3()),
    roundCm = (value) => Math.round(value * 1000) / 10;
  const motionLimits = {};
  for (const [kind, nodeId] of Object.entries(MOTION_NODES)) {
    const value = motion.find((entry) => entry.nodeId === nodeId);
    if (!value) continue;
    motionLimits[kind] = {
      nodeId,
      type: value.type,
      axis: value.axis,
      direction: Math.sign(value.openValue) || 1,
      max:
        value.type === "rotation"
          ? THREE.MathUtils.radToDeg(Math.abs(value.openValue))
          : Math.abs(value.openValue),
    };
  }
  return {
    bounds,
    dimensions: {
      width: roundCm(size.x),
      depth: roundCm(size.z),
      height: roundCm(size.y),
    },
    manifest: {
      ...sourceManifest,
      partIds: physical.map((node) => node.name),
      motion,
    },
    motionLimits,
  };
}

export function productDimensionGuides({ bounds, dimensions }) {
  const { min, max } = bounds,
    gap = Math.max(0.08, (max.x - min.x) * 0.1),
    low = min.y + 0.03;
  return [
    {
      key: "width",
      start: new THREE.Vector3(min.x, low, max.z + gap),
      end: new THREE.Vector3(max.x, low, max.z + gap),
    },
    {
      key: "height",
      start: new THREE.Vector3(max.x + gap, min.y, max.z),
      end: new THREE.Vector3(max.x + gap, max.y, max.z),
    },
    {
      key: "depth",
      start: new THREE.Vector3(min.x - gap, low, min.z),
      end: new THREE.Vector3(min.x - gap, low, max.z),
    },
  ].map((value) => ({
    ...value,
    label: `${dimensions[value.key].toLocaleString("id-ID")} cm`,
  }));
}

export function getProductFixture(
  model,
  geometry,
  kind,
  state = { x: 0, z: -0.4, rotation: 0 },
) {
  const motionKind =
    kind === "door"
      ? geometry.motionLimits.left
        ? "left"
        : "right"
      : kind === "drawer"
        ? "drawer"
        : null;
  const limit = geometry.motionLimits[motionKind];
  if (!limit) return null;
  // Keep the established Sora scenarios and their independently checked outcomes.
  if (geometry.manifest.id === "oak-cabinet-01")
    return kind === "door"
      ? {
          center: new THREE.Vector3(-0.3, 0.62, -0.02),
          size: new THREE.Vector3(0.14, 0.24, 0.1),
        }
      : {
          center: new THREE.Vector3(0, 1.09, 0.075),
          size: new THREE.Vector3(0.24, 0.1, 0.15),
        };
  const node = model.getObjectByName(limit.nodeId),
    rootPosition = model.position.clone(),
    rootRotation = model.rotation.clone(),
    position = node.position.clone(),
    rotation = node.rotation.clone();
  try {
    model.position.set(state.x || 0, 0, state.z || 0);
    model.rotation.y = THREE.MathUtils.degToRad(state.rotation || 0);
    const definition = geometry.manifest.motion.find(
      (value) => value.nodeId === limit.nodeId,
    );
    if (limit.type === "rotation")
      node.rotation[limit.axis] = definition.openValue * 0.8;
    else
      node.position[limit.axis] =
        definition.pivotM[{ x: 0, y: 1, z: 2 }[limit.axis]] +
        definition.openValue * 0.8;
    model.updateMatrixWorld(true);
    const inverse = model.matrixWorld.clone().invert();
    let candidate = null;
    node.traverse((part) => {
      if (!part.isMesh || !geometry.manifest.partIds.includes(part.name))
        return;
      part.geometry.computeBoundingBox();
      const box = part.geometry.boundingBox,
        center = box.getCenter(new THREE.Vector3());
      for (const x of [box.min.x, box.max.x])
        for (const z of [box.min.z, box.max.z]) {
          const point = new THREE.Vector3(x, center.y, z)
            .lerp(center, 0.08)
            .applyMatrix4(part.matrixWorld)
            .applyMatrix4(inverse);
          if (!candidate || point.z > candidate.z) candidate = point;
        }
    });
    if (!candidate) return null;
    return {
      center: candidate.applyMatrix4(model.matrixWorld),
      size: new THREE.Vector3(0.04, 0.12, 0.04),
    };
  } finally {
    model.position.copy(rootPosition);
    model.rotation.copy(rootRotation);
    node.position.copy(position);
    node.rotation.copy(rotation);
    model.updateMatrixWorld(true);
  }
}

const productMaterials = {
  walnut: new THREE.MeshStandardMaterial({
    color: 0x7f5b45,
    roughness: 0.7,
    metalness: 0.02,
  }),
  oak: new THREE.MeshStandardMaterial({
    color: 0xc6965d,
    roughness: 0.76,
    metalness: 0.01,
  }),
  sage: new THREE.MeshStandardMaterial({
    color: 0x6f8067,
    roughness: 0.72,
    metalness: 0.02,
  }),
  ink: new THREE.MeshStandardMaterial({
    color: 0x243833,
    roughness: 0.66,
    metalness: 0.03,
  }),
  linen: new THREE.MeshStandardMaterial({
    color: 0xd6c8b2,
    roughness: 0.92,
    metalness: 0,
  }),
  brass: new THREE.MeshStandardMaterial({
    color: 0xa88658,
    roughness: 0.34,
    metalness: 0.42,
  }),
};
function box(parent, name, size, position, material, rotation = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.y = rotation;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function cylinder(
  parent,
  name,
  radius,
  height,
  position,
  material,
  segments = 24,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, segments),
    material,
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function createProceduralProduct(type = "arca") {
  const root = new THREE.Group();
  root.name = `${type}_model`;
  const body = new THREE.Group();
  body.name = "body";
  root.add(body);
  const left = new THREE.Group();
  left.name = "left_door_pivot";
  root.add(left);
  const right = new THREE.Group();
  right.name = "right_door_pivot";
  root.add(right);
  const drawer = new THREE.Group();
  drawer.name = "drawer_slide";
  root.add(drawer);
  const motion = [];
  let parts = [];
  if (type === "batu") {
    box(
      body,
      "tabletop",
      [1.22, 0.12, 0.78],
      [0, 0.78, 0],
      productMaterials.walnut,
    );
    for (const [i, x] of [
      [0, -0.5],
      [1, 0.5],
    ])
      for (const z of [-0.27, 0.27])
        parts.push(
          box(
            body,
            `leg_${i}_${z}`,
            [0.1, 0.78, 0.1],
            [x, 0.39, z],
            productMaterials.ink,
          ),
        );
    parts.push(
      box(
        body,
        "shelf",
        [0.84, 0.08, 0.38],
        [0, 0.27, 0],
        productMaterials.brass,
      ),
    );
  } else if (type === "rimba") {
    parts.push(
      box(
        body,
        "sideboard_body",
        [1.32, 0.74, 0.42],
        [0, 0.55, 0],
        productMaterials.sage,
      ),
    );
    for (const x of [-0.38, 0.38]) {
      const pivot = x < 0 ? left : right;
      pivot.position.set(x, 0, 0.23);
      parts.push(
        box(
          pivot,
          x < 0 ? "door_left" : "door_right",
          [0.52, 0.57, 0.035],
          [0, 0.55, 0],
          productMaterials.oak,
        ),
      );
      cylinder(
        pivot,
        "knob",
        0.022,
        0.04,
        [x < 0 ? 0.18 : -0.18, 0.56, 0.03],
        productMaterials.brass,
        16,
      ).rotation.x = Math.PI / 2;
    }
    for (const x of [-0.5, 0.5])
      for (const z of [-0.12, 0.12])
        parts.push(
          box(
            body,
            "foot",
            [0.1, 0.32, 0.1],
            [x, 0.16, z],
            productMaterials.ink,
          ),
        );
  } else {
    box(
      body,
      "seat",
      [0.78, 0.12, 0.72],
      [0, 0.63, 0],
      productMaterials.walnut,
    );
    box(
      body,
      "back",
      [0.78, 0.68, 0.1],
      [0, 0.98, -0.28],
      productMaterials.oak,
    );
    for (const x of [-0.3, 0.3])
      for (const z of [-0.26, 0.26])
        parts.push(
          box(
            body,
            "leg",
            [0.08, 0.62, 0.08],
            [x, 0.31, z],
            productMaterials.ink,
          ),
        );
    box(
      body,
      "brace",
      [0.58, 0.07, 0.07],
      [0, 0.32, 0],
      productMaterials.brass,
    );
  }
  const manifest = { partIds: parts.map((p) => p.name), motion: [] };
  if (type === "rimba")
    manifest.motion = [
      {
        nodeId: "left_door_pivot",
        type: "rotation",
        axis: "y",
        openValue: -1.05,
        pivotM: { x: -0.38, y: 0, z: 0 },
      },
      {
        nodeId: "right_door_pivot",
        type: "rotation",
        axis: "y",
        openValue: 1.05,
        pivotM: { x: 0.38, y: 0, z: 0 },
      },
    ];
  else manifest.motion = [];
  root.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = true;
      n.receiveShadow = true;
    }
  });
  return { model: root, manifest };
}
function proceduralReport(type) {
  const anchor = "body";
  const cameraPresets = {
    overview: { position: [1.9, 1.45, 2.45], target: [0, 0.55, 0] },
    front: { position: [0, 1.1, 2.7], target: [0, 0.6, 0] },
    left: { position: [-2.4, 1.25, 0.5], target: [0, 0.6, 0] },
    rear: { position: [0, 1.15, -2.55], target: [0, 0.6, 0] },
    top: { position: [1.8, 3.0, 1.8], target: [0, 0.45, 0] },
    interior: { position: [0, 1.0, 2.0], target: [0, 0.72, 0] },
  };
  return {
    cameraPresets,
    conditions: [
      {
        id: "scratch",
        title: "Detail permukaan",
        localPositionM: [-0.22, 0.7, 0.22],
        anchorNodeId: anchor,
      },
      {
        id: "chip",
        title: "Sudut material",
        localPositionM: [0.22, 0.98, 0.18],
        anchorNodeId: anchor,
      },
      {
        id: "mark",
        title: "Bekas pemakaian",
        localPositionM: [0, 0.8, 0],
        anchorNodeId: anchor,
      },
    ],
    partIds: [],
    motion: [],
  };
}

export async function createEngine(
  container,
  {
    onCondition = () => {},
    onPlacement = () => {},
    onInteraction = () => {},
    onLoadProgress = () => {},
    onContextLost = () => {},
    listing = null,
  } = {},
) {
  const progress = (value) => {
    try {
      onLoadProgress(value);
    } catch {}
  };
  progress(0);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    progress(null);
    throw error;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.style.cssText =
    "display:block;width:100%;height:100%;touch-action:none";
  container.append(canvas);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(38, 1, 0.005, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.minDistance = 0.065;
  controls.maxDistance = 12;
  controls.maxTargetRadius = 18;
  controls.maxPolarAngle = Math.PI;
  canvas.style.touchAction = "pan-y";
  scene.add(new THREE.HemisphereLight(0xfffcf4, 0x8b8877, 2.1));
  const key = new THREE.DirectionalLight(0xfff5e6, 3.2);
  key.position.set(-2, 7, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.normalBias = 0.001;
  key.shadow.bias = -0.00002;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xeef2ff, 1);
  fill.position.set(4, 2, -2);
  scene.add(fill);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ opacity: 0.18 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.001;
  ground.receiveShadow = true;
  scene.add(ground);
  let model, manifest, report;
  let loadingFinished = false;
  const loaded = [0, 0, 0],
    updateLoad = (index, value) => {
      if (loadingFinished) return;
      loaded[index] = value;
      progress(
        loaded.some((v) => v === null)
          ? null
          : Math.min(0.99, loaded.reduce((sum, v) => sum + v, 0) / 3),
      );
    };
  try {
    const asset = listing?.asset;
    if (asset?.modelUrl && asset?.manifestUrl && asset?.reportUrl) {
      [model, manifest, report] = await Promise.all([
        new GLTFLoader()
          .loadAsync(asset.modelUrl, (event) =>
            updateLoad(
              0,
              event.lengthComputable && event.total > 0
                ? THREE.MathUtils.clamp(event.loaded / event.total, 0, 1)
                : null,
            ),
          )
          .then((g) => {
            updateLoad(0, 1);
            return g.scene;
          }),
        ...[asset.manifestUrl, asset.reportUrl].map(async (url, index) => {
          const r = await fetch(url);
          if (!r.ok) throw Error("Asset gagal dimuat");
          const value = await r.json();
          updateLoad(index + 1, 1);
          return value;
        }),
      ]);
    } else if (listing?.id && listing.id !== "sora") {
      const generated = createProceduralProduct(
        listing.modelType || listing.id,
      );
      model = generated.model;
      manifest = generated.manifest;
      report = proceduralReport(listing.modelType || listing.id);
      updateLoad(0, 1);
      updateLoad(1, 1);
      updateLoad(2, 1);
    } else {
      [model, manifest, report] = await Promise.all([
        new GLTFLoader()
          .loadAsync("/assets/cabinet.glb", (event) =>
            updateLoad(
              0,
              event.lengthComputable && event.total > 0
                ? THREE.MathUtils.clamp(event.loaded / event.total, 0, 1)
                : null,
            ),
          )
          .then((g) => {
            updateLoad(0, 1);
            return g.scene;
          }),
        ...["cabinet-manifest.json", "cabinet-report.json"].map(
          async (name, index) => {
            const r = await fetch("/assets/" + name);
            if (!r.ok) throw Error("Asset " + name + " gagal dimuat");
            const value = await r.json();
            updateLoad(index + 1, 1);
            return value;
          },
        ),
      ]);
    }
  } catch (error) {
    loadingFinished = true;
    progress(null);
    controls.dispose();
    ground.geometry.dispose();
    ground.material.dispose();
    key.shadow.map?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    throw error;
  }
  model.traverse((n) => {
    if (n.isMesh) {
      n.castShadow = !n.name.startsWith("wear_");
      n.receiveShadow = true;
      if (n.material.transparent) n.material.depthWrite = false;
    }
  });
  scene.add(model);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let markerVisibility = false,
    selected = null,
    view = "overview",
    active = false,
    dimensionVisible = false,
    disposed = false,
    cameraMove = null,
    raf = 0,
    drag = null;
  let inViewport = true,
    contextLost = false,
    visibilityObserver = null;
  const captureState = {
    active: false,
    phase: "prepare",
    area: "front",
    progress: 0,
  };
  const productGeometry = getProductGeometry(model, manifest);
  manifest = productGeometry.manifest;
  const motionLimits = productGeometry.motionLimits;
  const motions = { left: 0, right: 0, drawer: 0 },
    motionAnimations = new Map();
  const nodes = Object.fromEntries(
    Object.entries(motionLimits).map(([kind, value]) => [
      kind,
      model.getObjectByName(value.nodeId),
    ]),
  );
  const bases = Object.fromEntries(
    Object.entries(nodes).map(([k, n]) => [
      k,
      { position: n.position.clone(), rotation: n.rotation.clone() },
    ]),
  );
  const roomState = {
    width: 3.2,
    depth: 3,
    x: 0,
    z: -0.4,
    rotation: 0,
    fixture: "clear",
  };
  const room = createRoom({ ...roomState, height: 2.6 });
  room.group.visible = false;
  scene.add(room.group);
  const captureScene = createCaptureScene({ scene, renderer, reduced });
  const obstacle = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xd19e65,
      transparent: true,
      opacity: 0.6,
      roughness: 0.7,
    }),
  );
  obstacle.visible = false;
  scene.add(obstacle);
  let boxes = [];
  const markers = report.conditions.map((condition, index) => {
    const point = new THREE.Object3D();
    point.position.fromArray(condition.localPositionM);
    model.getObjectByName(condition.anchorNodeId).add(point);
    const button = document.createElement("button");
    button.className = "model-marker";
    button.textContent = index + 1;
    button.title = [
      "Goresan permukaan",
      "Sudut terkelupas",
      "Bekas pada permukaan",
    ][index];
    button.setAttribute("aria-label", button.title);
    button.addEventListener("click", () => selectCondition(condition.id));
    container.append(button);
    return { condition, point, button };
  });
  const dimensions = new THREE.Group();
  model.add(dimensions);
  dimensions.visible = false;
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x557d69 });
  const labels = [];
  for (const guide of productDimensionGuides(productGeometry)) {
    const path = [guide.start, guide.end];
    dimensions.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(path),
        lineMaterial,
      ),
    );
    for (const v of path)
      dimensions.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            v.clone().addScalar(0.009),
            v.clone().addScalar(-0.009),
          ]),
          lineMaterial,
        ),
      );
    const point = new THREE.Object3D();
    point.position.copy(guide.start).add(guide.end).multiplyScalar(0.5);
    dimensions.add(point);
    const el = document.createElement("span");
    el.className = "dimension-label";
    el.textContent = guide.label;
    el.hidden = true;
    container.append(el);
    labels.push({ point, el });
  }
  function moveCamera(position, target, instant = false) {
    cameraMove = {
      start: performance.now(),
      from: camera.position.clone(),
      to: position,
      targetFrom: controls.target.clone(),
      targetTo: target,
      duration: instant || reduced() ? 0 : 650,
    };
    if (!cameraMove.duration) {
      camera.position.copy(position);
      controls.target.copy(target);
      cameraMove = null;
      controls.update();
    }
  }
  function fit(position, target) {
    const offset = position.clone().sub(target);
    if (camera.aspect < 1)
      offset.multiplyScalar(Math.max(1, (1 / camera.aspect) * 0.85));
    return offset.add(target);
  }
  function selectCondition(id) {
    if (id && captureState.active) deactivateCapture();
    const m = markers.find((m) => m.condition.id === id);
    selected = m ? id : null;
    onCondition(selected);
    if (!m) return;
    model.updateMatrixWorld(true);
    const target = m.point.getWorldPosition(new THREE.Vector3());
    const offset =
      id === "scratch"
        ? new THREE.Vector3(0.12, 0.08, 0.38)
        : id === "chip"
          ? new THREE.Vector3(0.12, 0.09, 0.12)
          : new THREE.Vector3(0.07, 0.28, 0.08);
    offset.applyQuaternion(
      m.point.parent.getWorldQuaternion(new THREE.Quaternion()),
    );
    moveCamera(fit(target.clone().add(offset), target), target);
  }
  function setView(preset = "overview", instant = false) {
    if (captureState.active) deactivateCapture();
    view = preset;
    selectCondition(null);
    const p =
      preset === "underside"
        ? { position: [1.3, -0.75, 1.9], target: [0, 0.18, 0] }
        : report.cameraPresets[preset === "rear-lower" ? "rear" : preset] ||
          report.cameraPresets.overview;
    ground.visible = !active && preset !== "underside";
    if (preset === "interior") setStorage(true);
    if (preset === "drawer") setMotion("drawer", 0.3);
    const target = new THREE.Vector3().fromArray(p.target),
      position = new THREE.Vector3().fromArray(p.position);
    moveCamera(fit(position, target), target, instant);
  }
  function applyMotion(kind, value) {
    const n = nodes[kind],
      b = bases[kind],
      limit = motionLimits[kind];
    if (!n) return;
    if (limit.type === "translation")
      n.position[limit.axis] = b.position[limit.axis] + value * limit.direction;
    else
      n.rotation[limit.axis] =
        b.rotation[limit.axis] +
        THREE.MathUtils.degToRad(value * limit.direction);
  }
  function setMotion(kind, value) {
    if (!nodes[kind]) return;
    const limit = motionLimits[kind];
    value = THREE.MathUtils.clamp(Number(value) || 0, 0, limit.max);
    motions[kind] = value;
    if (reduced()) {
      motionAnimations.delete(kind);
      applyMotion(kind, value);
      model.updateMatrixWorld(true);
    } else
      motionAnimations.set(kind, {
        start: performance.now(),
        from:
          limit.type === "translation"
            ? (nodes[kind].position[limit.axis] -
                bases[kind].position[limit.axis]) *
              limit.direction
            : THREE.MathUtils.radToDeg(
                nodes[kind].rotation[limit.axis] -
                  bases[kind].rotation[limit.axis],
              ) * limit.direction,
        to: value,
        duration: 500,
      });
    if (selected) selectCondition(null);
  }
  function setStorage(open) {
    for (const kind of Object.keys(nodes))
      setMotion(kind, open ? motionLimits[kind].max : 0);
  }
  function placement() {
    model.position.set(roomState.x, 0, roomState.z);
    model.rotation.y = THREE.MathUtils.degToRad(roomState.rotation);
    model.updateMatrixWorld(true);
    const result = evaluatePlacement({
      bounds: room.bounds,
      model,
      manifest,
      obstacles: boxes,
    });
    onPlacement({ state: { ...roomState }, result });
    return result;
  }
  function configureFixture(id) {
    const fixture = getProductFixture(model, productGeometry, id, roomState);
    roomState.fixture =
      (id === "door" || id === "drawer") && !fixture ? "clear" : id;
    boxes = [];
    obstacle.visible = false;
    setStorage(false);
    if (id === "door" || id === "drawer") {
      if (!fixture) return;
      const { size, center } = fixture;
      obstacle.position.copy(center);
      obstacle.scale.copy(size);
      obstacle.visible = active;
      boxes = [
        new THREE.Box3(
          center.clone().sub(size.clone().multiplyScalar(0.5)),
          center.clone().add(size.clone().multiplyScalar(0.5)),
        ),
      ];
      const kind = id === "door" ? (nodes.left ? "left" : "right") : "drawer";
      setMotion(
        kind,
        id === "door"
          ? Math.min(60, motionLimits[kind].max)
          : motionLimits[kind].max,
      );
    }
  }
  function setRoom(patch = {}) {
    const oldWidth = roomState.width,
      oldDepth = roomState.depth;
    for (const k of ["width", "depth", "x", "z", "rotation"])
      if (Number.isFinite(Number(patch[k]))) roomState[k] = Number(patch[k]);
    roomState.width = THREE.MathUtils.clamp(roomState.width, 1.2, 10);
    roomState.depth = THREE.MathUtils.clamp(roomState.depth, 1, 10);
    roomState.x = THREE.MathUtils.clamp(roomState.x, -10, 10);
    roomState.z = THREE.MathUtils.clamp(roomState.z, -10, 10);
    roomState.rotation = THREE.MathUtils.clamp(roomState.rotation, -180, 180);
    if (oldWidth !== roomState.width || oldDepth !== roomState.depth)
      room.setDimensions(roomState);
    if (
      ["clear", "door", "drawer", "wall"].includes(patch.fixture) &&
      patch.fixture !== roomState.fixture
    )
      configureFixture(patch.fixture);
    placement();
  }
  function setFixture(id) {
    if (!["clear", "door", "drawer", "wall"].includes(id)) return;
    Object.assign(roomState, {
      x: id === "wall" ? roomState.width / 2 - 0.1 : 0,
      z: -0.4,
      rotation: 0,
    });
    configureFixture(id);
    placement();
  }
  function roomCamera() {
    moveCamera(
      fit(new THREE.Vector3(4.5, 4.7, 5.5), new THREE.Vector3(0, 0.65, 0)),
      new THREE.Vector3(0, 0.65, 0),
    );
  }
  function enterRoom(state) {
    if (captureState.active) deactivateCapture();
    active = true;
    selectCondition(null);
    room.group.visible = true;
    ground.visible = false;
    if (state) setRoom(state);
    else placement();
    obstacle.visible = boxes.length > 0;
    roomCamera();
  }
  function leaveRoom() {
    active = false;
    room.group.visible = false;
    obstacle.visible = false;
    model.position.set(0, 0, 0);
    model.rotation.y = 0;
    setView("overview");
  }
  function deactivateCapture() {
    captureState.active = false;
    captureScene.setVisible(false);
    controls.enabled = true;
    ground.visible = !active;
    cameraMove = null;
    motionAnimations.clear();
    for (const kind of Object.keys(nodes)) {
      motions[kind] = 0;
      applyMotion(kind, 0);
    }
  }
  // Fit the authored cabinet's real, articulated mesh bounds in every capture viewport.
  // Keep the chosen angle and target, moving back only when the composition is clipped.
  function capturePose() {
    const pose = captureScene.getCameraPose(camera.aspect);
    if (!pose) return null;
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    model.traverse((node) => {
      if (node.isMesh) {
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        bounds.union(
          node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld),
        );
      }
    });
    const corners = [];
    for (let i = 0; i < 8; i++)
      corners.push(
        new THREE.Vector3(
          i & 1 ? bounds.max.x : bounds.min.x,
          i & 2 ? bounds.max.y : bounds.min.y,
          i & 4 ? bounds.max.z : bounds.min.z,
        ),
      );
    const framingCamera = new THREE.PerspectiveCamera(
        camera.fov,
        camera.aspect,
        camera.near,
        camera.far,
      ),
      offset = pose.position.clone().sub(pose.target);
    for (let step = 0; step < 36; step++) {
      framingCamera.position.copy(pose.target).add(offset);
      framingCamera.lookAt(pose.target);
      framingCamera.updateMatrixWorld(true);
      if (
        corners.every((point) => {
          const projected = point.clone().project(framingCamera);
          return (
            Math.abs(projected.x) <= 0.92 &&
            Math.abs(projected.y) <= 0.92 &&
            projected.z >= -1 &&
            projected.z <= 1
          );
        })
      )
        break;
      offset.multiplyScalar(1.08);
    }
    return { position: pose.target.clone().add(offset), target: pose.target };
  }
  function setCaptureScene({
    phase = "prepare",
    area = "front",
    progress = 0,
  } = {}) {
    if (listing?.capabilities?.capture === false) return false;
    const first = !captureState.active;
    active = false;
    room.group.visible = false;
    obstacle.visible = false;
    end();
    captureState.active = true;
    captureState.phase = ["prepare", "exterior", "interior", "review"].includes(
      phase,
    )
      ? phase
      : "prepare";
    captureState.area =
      Object.hasOwn(report.cameraPresets, area) ||
      ["rear-lower", "underside", "scratch", "chip", "mark"].includes(area)
        ? area
        : "front";
    captureState.progress = THREE.MathUtils.clamp(Number(progress) || 0, 0, 1);
    selected = null;
    onCondition(null);
    dimensionVisible = false;
    dimensions.visible = false;
    labels.forEach((l) => {
      l.el.hidden = true;
      l.el.style.display = "none";
    });
    markers.forEach((m) => {
      m.button.hidden = true;
      m.button.style.display = "none";
    });
    model.position.set(0, 0, 0);
    model.rotation.y = 0;
    ground.visible = false;
    controls.enabled = false;
    // Outside recording stays stationary. Opening happens only in the separate interior phase.
    motionAnimations.clear();
    for (const kind of Object.keys(nodes)) {
      const value =
        captureState.phase === "interior" ? motionLimits[kind].max : 0;
      motions[kind] = value;
      applyMotion(kind, value);
    }
    model.updateMatrixWorld(true);
    captureScene.setState(captureState, report, first);
    const pose = capturePose();
    if (pose) moveCamera(pose.position, pose.target, first && reduced());
  }
  function leaveCaptureScene() {
    if (!captureState.active) return;
    deactivateCapture();
    setStorage(false);
    setView("overview");
  }
  function captureViewState() {
    if (disposed) return null;
    return validateViewState({
      schema: 1,
      camera: {
        position: camera.position.toArray(),
        target: controls.target.toArray(),
      },
      view,
      condition: selected,
      motions: { ...motions },
      dimensionsVisible: dimensionVisible,
      inRoom: active,
      roomState: { ...roomState },
      captureScene: { ...captureState },
    });
  }
  // Consume remaining orbit damping before applying an exact saved pose.
  function stopOrbit() {
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = damping;
  }
  function restoreViewState(input) {
    let snapshot;
    try {
      snapshot = validateViewState(input);
    } catch {
      return false;
    }
    if (
      snapshot.captureScene.active &&
      listing?.capabilities?.capture === false
    )
      return false;
    if (disposed) return false;
    end();
    cameraMove = null;
    motionAnimations.clear();
    stopOrbit();
    if (captureState.active) deactivateCapture();
    active = snapshot.inRoom;
    room.group.visible = active;
    setRoom(snapshot.roomState);
    if (snapshot.captureScene.active) setCaptureScene(snapshot.captureScene);
    else {
      captureScene.setVisible(false);
      Object.assign(captureState, snapshot.captureScene);
      controls.enabled = true;
      ground.visible = !active && snapshot.view !== "underside";
      obstacle.visible = active && boxes.length > 0;
      model.position.set(active ? roomState.x : 0, 0, active ? roomState.z : 0);
      model.rotation.y = active
        ? THREE.MathUtils.degToRad(roomState.rotation)
        : 0;
    }
    cameraMove = null;
    motionAnimations.clear();
    view = snapshot.view;
    selected = markers.some(
      (marker) => marker.condition.id === snapshot.condition,
    )
      ? snapshot.condition
      : null;
    onCondition(selected);
    for (const kind of Object.keys(motions)) {
      motions[kind] = nodes[kind]
        ? THREE.MathUtils.clamp(
            snapshot.motions[kind],
            0,
            motionLimits[kind].max,
          )
        : 0;
      if (nodes[kind]) applyMotion(kind, motions[kind]);
    }
    dimensionVisible = snapshot.dimensionsVisible;
    dimensions.visible = dimensionVisible;
    camera.position.fromArray(snapshot.camera.position);
    controls.target.fromArray(snapshot.camera.target);
    camera.lookAt(controls.target);
    camera.updateMatrixWorld();
    model.updateMatrixWorld(true);
    if (active) room.setNearWallHidden(true, camera.position);
    return true;
  }
  function zoomBy(factor) {
    if (
      disposed ||
      captureState.active ||
      typeof factor !== "number" ||
      !Number.isFinite(factor) ||
      factor <= 0
    )
      return false;
    const position = camera.position.clone(),
      target = controls.target.clone();
    stopOrbit();
    camera.position.copy(position);
    controls.target.copy(target);
    const offset = position.sub(target),
      distance = offset.length();
    if (!distance) return false;
    cameraMove = null;
    camera.position
      .copy(target)
      .add(
        offset.multiplyScalar(
          THREE.MathUtils.clamp(
            distance * factor,
            controls.minDistance,
            controls.maxDistance,
          ) / distance,
        ),
      );
    camera.lookAt(target);
    camera.updateMatrixWorld();
    onInteraction();
    return true;
  }
  function capturePlacementPreview() {
    if (disposed || !active || captureState.active) return null;
    const width = 400,
      height = 300,
      target = new THREE.WebGLRenderTarget(width, height);
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const previous = {
      target: renderer.getRenderTarget(),
      viewport: renderer.getViewport(new THREE.Vector4()),
      scissor: renderer.getScissor(new THREE.Vector4()),
      scissorTest: renderer.getScissorTest(),
      autoClear: renderer.autoClear,
    };
    const wallVisibility = room.group.children.map((node) => [
      node,
      node.visible,
    ]);
    try {
      const thumbnailCamera = camera.clone();
      thumbnailCamera.aspect = width / height;
      thumbnailCamera.updateProjectionMatrix();
      thumbnailCamera.updateMatrixWorld();
      room.setNearWallHidden(true, thumbnailCamera.position);
      renderer.setRenderTarget(target);
      renderer.setViewport(0, 0, width, height);
      renderer.setScissorTest(false);
      renderer.autoClear = true;
      renderer.render(scene, thumbnailCamera);
      const pixels = new Uint8Array(width * height * 4);
      renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      const thumbnail = document.createElement("canvas");
      thumbnail.width = width;
      thumbnail.height = height;
      const context = thumbnail.getContext("2d");
      if (!context) return null;
      const image = context.createImageData(width, height),
        row = width * 4;
      for (let y = 0; y < height; y++)
        image.data.set(
          pixels.subarray((height - 1 - y) * row, (height - y) * row),
          y * row,
        );
      context.putImageData(image, 0, 0);
      for (const quality of [0.78, 0.6, 0.45, 0.3]) {
        const value = thumbnail.toDataURL("image/webp", quality);
        try {
          return validatePlacementPreview(value);
        } catch {}
      }
      return null;
    } catch {
      return null;
    } finally {
      wallVisibility.forEach(([node, visible]) => {
        node.visible = visible;
      });
      renderer.setRenderTarget(previous.target);
      renderer.setViewport(previous.viewport);
      renderer.setScissor(previous.scissor);
      renderer.setScissorTest(previous.scissorTest);
      renderer.autoClear = previous.autoClear;
      target.dispose();
    }
  }
  const raycaster = new THREE.Raycaster(),
    plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function floorPoint(e) {
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      ),
      camera,
    );
    return raycaster.ray.intersectPlane(plane, new THREE.Vector3());
  }
  function down(e) {
    if (!active || e.button !== 0) return;
    const point = floorPoint(e);
    if (point && raycaster.intersectObject(model, true).length) {
      drag = { point, position: model.position.clone(), pointer: e.pointerId };
      controls.enabled = false;
      cameraMove = null;
      canvas.setPointerCapture(e.pointerId);
      onInteraction();
    }
  }
  function move(e) {
    if (!drag) return;
    const p = floorPoint(e);
    if (p)
      setRoom({
        x: drag.position.x + p.x - drag.point.x,
        z: drag.position.z + p.z - drag.point.z,
      });
  }
  function end() {
    if (drag && canvas.hasPointerCapture(drag.pointer))
      canvas.releasePointerCapture(drag.pointer);
    drag = null;
    controls.enabled = !captureState.active;
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  const interaction = () => {
    cameraMove = null;
    onInteraction();
  };
  controls.addEventListener("start", interaction);
  let hadSize = false;
  function resize() {
    const r = container.getBoundingClientRect(),
      previousAspect = camera.aspect;
    camera.aspect = Math.max(1, r.width) / Math.max(1, r.height);
    camera.updateProjectionMatrix();
    renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
    if (!hadSize) {
      hadSize = true;
      setView(view, true);
    } else if (
      captureState.active &&
      Math.abs(previousAspect - camera.aspect) > 0.08
    ) {
      const pose = capturePose();
      if (pose) moveCamera(pose.position, pose.target, true);
    }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  function project(point, el, show) {
    const p = point.getWorldPosition(new THREE.Vector3()).project(camera);
    el.style.left = (p.x * 0.5 + 0.5) * canvas.clientWidth + "px";
    el.style.top = (-p.y * 0.5 + 0.5) * canvas.clientHeight + "px";
    el.hidden =
      !show || p.z < -1 || p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1;
    el.style.display = el.hidden ? "none" : "";
    return p;
  }
  // Rendering stays continuous while the optional stage is visible so orbit
  // damping and articulation keep their established behavior. Suspend all frame
  // work when the tab or stage is hidden; resume without changing geometry.
  function canRender() {
    return !disposed && !contextLost && !document.hidden && inViewport;
  }
  function startRendering() {
    if (canRender() && !raf) raf = requestAnimationFrame(render);
  }
  function stopRendering() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function syncVisibility() {
    if (canRender()) startRendering();
    else stopRendering();
  }
  function handleContextLoss(event) {
    event.preventDefault();
    contextLost = true;
    stopRendering();
    controls.enabled = false;
    try {
      onContextLost();
    } catch {}
  }
  function render(now) {
    raf = 0;
    if (!canRender()) return;
    startRendering();
    if (cameraMove) {
      const t = cameraMove.duration
          ? Math.min(1, (now - cameraMove.start) / cameraMove.duration)
          : 1,
        s = 1 - (1 - t) ** 3;
      camera.position.lerpVectors(cameraMove.from, cameraMove.to, s);
      controls.target.lerpVectors(
        cameraMove.targetFrom,
        cameraMove.targetTo,
        s,
      );
      if (t === 1) cameraMove = null;
    }
    for (const [kind, a] of motionAnimations) {
      const t = a.duration ? Math.min(1, (now - a.start) / a.duration) : 1;
      applyMotion(kind, THREE.MathUtils.lerp(a.from, a.to, 1 - (1 - t) ** 3));
      if (t === 1) motionAnimations.delete(kind);
    }
    controls.update();
    model.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    for (const m of markers) {
      const p = project(
        m.point,
        m.button,
        markerVisibility && !active && !captureState.active && !selected,
      );
      if (!m.button.hidden) {
        raycaster.setFromCamera(new THREE.Vector2(p.x, p.y), camera);
        const world = m.point.getWorldPosition(new THREE.Vector3()),
          hit = raycaster
            .intersectObject(model, true)
            .find((h) => h.object.isMesh);
        if (hit && hit.distance < camera.position.distanceTo(world) - 0.006) {
          m.button.hidden = true;
          m.button.style.display = "none";
        }
      }
    }
    for (const l of labels)
      project(l.point, l.el, dimensionVisible && !captureState.active);
    if (active) room.setNearWallHidden(true, camera.position);
    if (captureState.active) {
      captureScene.tick(now);
      captureScene.prepareFrame(camera);
    }
    renderer.render(scene, camera);
  }
  canvas.addEventListener("webglcontextlost", handleContextLoss);
  document.addEventListener("visibilitychange", syncVisibility);
  if (typeof IntersectionObserver !== "undefined") {
    visibilityObserver = new IntersectionObserver((entries) => {
      inViewport = entries.some((entry) => entry.isIntersecting);
      syncVisibility();
    });
    visibilityObserver.observe(container);
  }
  startRendering();
  function dispose() {
    if (disposed) return;
    disposed = true;
    stopRendering();
    observer.disconnect();
    visibilityObserver?.disconnect();
    document.removeEventListener("visibilitychange", syncVisibility);
    canvas.removeEventListener("webglcontextlost", handleContextLoss);
    end();
    for (const [event, fn] of [
      ["pointerdown", down],
      ["pointermove", move],
      ["pointerup", end],
      ["pointercancel", end],
    ])
      canvas.removeEventListener(event, fn);
    controls.removeEventListener("start", interaction);
    controls.dispose();
    markers.forEach((m) => m.button.remove());
    labels.forEach((l) => l.el.remove());
    captureScene.dispose();
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    scene.traverse((n) => {
      if (n.geometry) geometries.add(n.geometry);
      for (const m of Array.isArray(n.material)
        ? n.material
        : n.material
          ? [n.material]
          : []) {
        materials.add(m);
        for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    key.shadow.map?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }
  loadingFinished = true;
  progress(1);
  return {
    ready: true,
    model,
    manifest,
    report,
    camera,
    controls,
    scene,
    renderer,
    setView,
    selectCondition,
    setStorage,
    setMotion,
    setCaptureScene,
    leaveCaptureScene,
    captureViewState,
    restoreViewState,
    zoomBy,
    capturePlacementPreview,
    setMarkersVisible(v) {
      markerVisibility = Boolean(v);
      if (!markerVisibility)
        for (const m of markers) {
          m.button.hidden = true;
          m.button.style.display = "none";
        }
    },
    setDimensionsVisible(v) {
      dimensionVisible = !captureState.active && Boolean(v);
      dimensions.visible = dimensionVisible;
    },
    enterRoom,
    leaveRoom,
    setRoom,
    setFixture,
    resetCamera() {
      if (captureState.active) {
        const pose = capturePose();
        if (pose) moveCamera(pose.position, pose.target);
      } else active ? roomCamera() : setView("overview");
    },
    dispose,
    getState() {
      return {
        roomState: { ...roomState },
        condition: selected,
        motions: { ...motions },
        motionLimits: structuredClone(motionLimits),
        dimensions: { ...productGeometry.dimensions },
        view,
        dimensionsVisible: dimensionVisible,
        inRoom: active,
        captureScene: { ...captureState },
        camera: camera.position.toArray(),
      };
    },
  };
}
