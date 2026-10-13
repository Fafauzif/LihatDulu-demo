import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {cancelRender, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createRoom} from './product-geometry.js';

export type CabinetPose = {
  camera: [number, number, number];
  target: [number, number, number];
  left: number;
  right: number;
  drawer: number;
  room?: boolean;
  x?: number;
  z?: number;
  yaw?: number;
  obstacle?: boolean;
  obstacleLabel?: number;
  dimensions?: boolean;
  markers?: boolean;
  markerLeaders?: boolean;
  selected?: 'scratch' | 'chip' | 'mark' | null;
};

type Condition = {
  id: 'scratch' | 'chip' | 'mark';
  anchorNodeId: string;
  localPositionM: [number, number, number];
};
type Assets = {
  model: THREE.Group;
  manifest: {motion: {nodeId: string; type: string; axis: string; pivotM: number[]; openValue: number}[]};
  report: {conditions: Condition[]};
};

let assetsPromise: Promise<Assets> | null = null;
const getAssets = (): Promise<Assets> => {
  if (!assetsPromise) {
    assetsPromise = Promise.all([
      new GLTFLoader().loadAsync(staticFile('assets/cabinet.glb')),
      fetch(staticFile('assets/cabinet-manifest.json')).then(async (r) => {
        if (!r.ok) throw new Error('Cabinet motion manifest failed to load');
        return r.json();
      }),
      fetch(staticFile('assets/cabinet-report.json')).then(async (r) => {
        if (!r.ok) throw new Error('Cabinet condition report failed to load');
        return r.json();
      }),
    ]).then(([gltf, manifest, report]) => ({model: gltf.scene, manifest, report}));
  }
  return assetsPromise;
};

const dimensionsSpec = [
  {id: 'width', points: [[-.45, .03, .33], [.45, .03, .33]], text: '90 cm', offset: [18, 34]},
  {id: 'height', points: [[.55, 0, .22], [.55, 1.2, .22]], text: '120 cm', offset: [66, 0]},
  {id: 'depth', points: [[-.55, .03, -.2375], [-.55, .03, .2375]], text: '47,5 cm', offset: [-40, 26]},
];

const createDimensions = () => {
  const group = new THREE.Group();
  group.name = 'film_dimensions';
  const material = new THREE.LineBasicMaterial({color: '#476a55', transparent: true, opacity: .95});
  for (const item of dimensionsSpec) {
    const vectors = item.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vectors), material));
    for (const p of vectors) {
      const tick = item.id === 'height' ? new THREE.Vector3(.04, 0, 0) : new THREE.Vector3(0, .035, 0);
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        p.clone().sub(tick), p.clone().add(tick),
      ]), material));
    }
  }
  return group;
};

/** Frame commits are synchronous. No real-time animation, damping or useFrame. */
const CommitFrame: React.FC<{camera: THREE.PerspectiveCamera; frame: number}> = ({camera, frame}) => {
  const {gl, scene, invalidate} = useThree();
  useLayoutEffect(() => {
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);
    gl.render(scene, camera);
    invalidate();
  }, [camera, frame, gl, scene, invalidate]);
  return null;
};

export const CabinetScene: React.FC<{width: number; height: number; pose: CabinetPose}> = ({width, height, pose}) => {
  const frame = useCurrentFrame();
  const [loadHandle] = useState(() => delayRender('Loading the authored Sora cabinet and condition anchors'));
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => {
    let active = true;
    getAssets().then((value) => {
      if (active) setAssets(value);
    }).catch((error) => cancelRender(error));
    return () => {
      active = false;
      continueRender(loadHandle);
    };
  }, [loadHandle]);
  useLayoutEffect(() => {
    if (assets) continueRender(loadHandle);
  }, [assets, loadHandle]);

  const model = useMemo(() => {
    if (!assets) return null;
    const copy = assets.model.clone(true);
    const textures = new Map<THREE.Texture, THREE.Texture>();
    copy.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = !node.name.startsWith('wear_');
      node.receiveShadow = true;
      const missingNormals = !node.geometry.getAttribute('normal');
      if (missingNormals) {
        // The GLB omits normals. Explicit face normals avoid software-renderer
        // derivative seams, retaining every authored triangle and hard edge.
        // Expanding the indices duplicates the same positions and UVs; it never
        // smooths shared vertices or changes the stored asset or its surfaces.
        node.geometry = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
        node.geometry.computeVertexNormals();
      }
      // Clone materials so video-specific render state never mutates the cache.
      if (Array.isArray(node.material)) node.material = node.material.map((m) => m.clone());
      else node.material = node.material.clone();
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if (material instanceof THREE.MeshStandardMaterial) {
          if (missingNormals) material.flatShading = false;
          if (material.map) {
            const original = material.map;
            let sampler = textures.get(original);
            if (!sampler) {
              sampler = original.clone();
              sampler.userData = {...sampler.userData, filmOriginalMinFilter: original.minFilter};
              textures.set(original, sampler);
            }
            material.map = sampler;
          }
        }
        if (material.transparent) material.depthWrite = false;
        if (node.name.startsWith('wear_')) {
          // The authored wear meshes are just 20 micrometres above the wood.
          // Resolve their depth ordering without changing geometry or severity.
          material.polygonOffset = true;
          material.polygonOffsetFactor = -1;
          material.polygonOffsetUnits = -1;
          node.renderOrder = 2;
        }
      }
    });
    return copy;
  }, [assets]);
  const room = useMemo(() => {
    const sourceRoom = createRoom({width: 3.2, depth: 3, height: 2.6});
    sourceRoom.group.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      // The cutaway architecture frames the cabinet. Removing wall-cast shadows
      // prevents the omitted near wall from producing a large triangular shade.
      // Source dimensions, bounds and clearance geometry remain unchanged.
      node.castShadow = false;
      node.receiveShadow = true;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        if (node.name === 'floor') material.color.set('#d8ddcf');
        else if (node.name !== 'window_view') material.color.set('#e5e6da');
      }
    });
    return sourceRoom;
  }, []);
  const dimensionLines = useMemo(createDimensions, []);
  const camera = useMemo(() => new THREE.PerspectiveCamera(38, width / height, .005, 60), [width, height]);

  camera.position.fromArray(pose.camera);
  camera.lookAt(new THREE.Vector3().fromArray(pose.target));
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  if (model && assets) {
    const sampledTextures = new Set<THREE.Texture>();
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if (!(material instanceof THREE.MeshStandardMaterial) || !material.map || sampledTextures.has(material.map)) continue;
        const sampler = material.map;
        sampledTextures.add(sampler);
        // Implicit mip LOD leaves a faint coplanar seam in extreme close-ups.
        // Sample the unchanged original image linearly only for condition macros;
        // retain authored mip filtering in overviews and room shots.
        const filter = pose.selected != null ? THREE.LinearFilter : sampler.userData.filmOriginalMinFilter as THREE.MinificationTextureFilter;
        if (sampler.minFilter !== filter) {
          sampler.minFilter = filter;
          sampler.needsUpdate = true;
        }
      }
    });
    model.position.set(pose.x ?? 0, 0, pose.z ?? (pose.room ? -.4 : 0));
    model.rotation.y = THREE.MathUtils.degToRad(pose.yaw ?? 0);
    for (const motion of assets.manifest.motion) {
      const node = model.getObjectByName(motion.nodeId);
      if (!node) throw new Error(`Missing articulation node ${motion.nodeId}`);
      if (motion.nodeId === 'left_door_pivot') node.rotation.y = -THREE.MathUtils.degToRad(THREE.MathUtils.clamp(pose.left, 0, 100));
      if (motion.nodeId === 'right_door_pivot') node.rotation.y = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(pose.right, 0, 100));
      if (motion.nodeId === 'drawer_slide') node.position.z = motion.pivotM[2] + THREE.MathUtils.clamp(pose.drawer, 0, .3);
    }
    model.updateMatrixWorld(true);
    dimensionLines.position.copy(model.position);
    dimensionLines.rotation.copy(model.rotation);
    dimensionLines.visible = Boolean(pose.dimensions);
    dimensionLines.updateMatrixWorld(true);
  }
  room.group.visible = Boolean(pose.room);
  room.setNearWallHidden(true, camera.position);
  room.group.updateMatrixWorld(true);

  const project = (world: THREE.Vector3) => {
    const p = world.clone().project(camera);
    return {
      x: (p.x * .5 + .5) * width,
      y: (-p.y * .5 + .5) * height,
      visible: p.z >= -1 && p.z <= 1 && Math.abs(p.x) < 1 && Math.abs(p.y) < 1,
      ndc: p,
    };
  };
  const markers = model && assets && pose.markers ? assets.report.conditions.map((condition, index) => {
    const node = model.getObjectByName(condition.anchorNodeId);
    if (!node) throw new Error(`Missing condition anchor ${condition.anchorNodeId}`);
    const world = new THREE.Vector3().fromArray(condition.localPositionM).applyMatrix4(node.matrixWorld);
    const screen = project(world);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(screen.ndc.x, screen.ndc.y), camera);
    const hit = raycaster.intersectObject(model, true).find((item) => item.object instanceof THREE.Mesh);
    const occluded = Boolean(hit && hit.distance < camera.position.distanceTo(world) - .006);
    const leader = Boolean(pose.markerLeaders && pose.selected === condition.id);
    const badgeX = leader ? THREE.MathUtils.clamp(screen.x + 56, 26, width - 26) : screen.x;
    const badgeY = leader ? THREE.MathUtils.clamp(screen.y - 56, 26, height - 26) : screen.y;
    return {id: condition.id, number: index + 1, ...screen, badgeX, badgeY, leader, visible: screen.visible && !occluded && (!pose.selected || condition.id === pose.selected)};
  }) : [];
  const obstacleOpacity = THREE.MathUtils.clamp(pose.obstacleLabel ?? 0, 0, 1);
  const obstaclePoint = pose.room && pose.obstacle && obstacleOpacity > 0
    ? project(new THREE.Vector3(-.3, .62, -.02))
    : null;
  const obstacleBadge = obstaclePoint ? {
    x: THREE.MathUtils.clamp(obstaclePoint.x - 175, 108, width - 108),
    y: THREE.MathUtils.clamp(obstaclePoint.y - 72, 50, height - 50),
  } : null;

  return <div style={{position: 'relative', width, height, pointerEvents: 'none'}}>
    {model ? <ThreeCanvas
      width={width}
      height={height}
      camera={camera}
      shadows="percentage"
      dpr={1}
      gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}}
      onCreated={({gl}) => {
        gl.setClearColor('#000000', 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = .95;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
      style={{width, height, background: 'transparent'}}
    >
      <hemisphereLight args={[0xfffcf4, 0x8b8877, 1]} />
      <directionalLight
        color={0xfff1df}
        intensity={2.05}
        position={[-3, 6, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-normalBias={.001}
        shadow-bias={-.00002}
        shadow-radius={4}
      />
      <directionalLight color={0xfff9ed} intensity={.65} position={[4, 2, -2]} />
      <primitive object={model} dispose={null} />
      <primitive object={room.group} dispose={null} />
      <primitive object={dimensionLines} dispose={null} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.001, 0]} receiveShadow visible={!pose.room}>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={.15} />
      </mesh>
      {pose.room && pose.obstacle ? <mesh position={[-.3, .62, -.02]} castShadow receiveShadow>
        <boxGeometry args={[.14, .24, .1]} />
        <meshStandardMaterial color="#d19e65" transparent opacity={.66} roughness={.7} />
      </mesh> : null}
      <CommitFrame camera={camera} frame={frame} />
    </ThreeCanvas> : null}
    {obstaclePoint?.visible && obstacleBadge ? <>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden', opacity: obstacleOpacity}}>
        <g data-qa="obstacle-leader" data-qa-id="room-obstacle-leader" data-qa-role="note" data-qa-overlap-group="room-obstacle">
          <line x1={obstaclePoint.x} y1={obstaclePoint.y} x2={obstacleBadge.x} y2={obstacleBadge.y} stroke="#956127" strokeWidth={2} strokeOpacity={.7} />
          <circle cx={obstaclePoint.x} cy={obstaclePoint.y} r={2.2} fill="#956127" />
        </g>
      </svg>
      <div data-qa="obstacle-label" data-qa-id="room-obstacle-label" data-qa-role="note" data-qa-overlap-group="room-obstacle" style={{position: 'absolute', left: obstacleBadge.x, top: obstacleBadge.y, width: 168, height: 48, boxSizing: 'border-box', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d9be98', borderRadius: 12, background: '#faf5e8', color: '#956127', fontSize: 23, fontWeight: 600, fontFamily: 'Jakarta, Arial, sans-serif', opacity: obstacleOpacity}}>Penghalang</div>
    </> : null}
    {markers.some((marker) => marker.visible && marker.leader) ? <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      {markers.filter((marker) => marker.visible && marker.leader).map((marker) => <g key={marker.id} data-qa="condition-leader" data-qa-id={`leader-${marker.id}`} data-qa-role="note" data-qa-overlap-group={`condition-${marker.id}`}>
        <line x1={marker.x} y1={marker.y} x2={marker.badgeX} y2={marker.badgeY} stroke="#476a55" strokeOpacity={.65} strokeWidth={2} />
        <circle cx={marker.x} cy={marker.y} r={1.8} fill="#254c39" />
      </g>)}
    </svg> : null}
    {markers.filter((marker) => marker.visible).map((marker) => <div key={marker.id} data-qa="condition-marker" data-qa-id={`marker-${marker.id}`} data-qa-role="note" data-qa-overlap-group={`condition-${marker.id}`} style={{
      position: 'absolute', left: marker.badgeX, top: marker.badgeY, width: 44, height: 44,
      transform: 'translate(-50%, -50%)', borderRadius: '50%', background: '#254c39',
      color: '#fffdf6', border: '3px solid #fffdf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, fontWeight: 700, boxShadow: '0 3px 10px #20332324', fontFamily: 'Jakarta, Arial, sans-serif',
    }}>{marker.number}</div>)}
    {pose.dimensions && model ? dimensionsSpec.map((item) => {
      const middle = new THREE.Vector3().fromArray(item.points[0]).add(new THREE.Vector3().fromArray(item.points[1])).multiplyScalar(.5).applyMatrix4(model.matrixWorld);
      const p = project(middle);
      if (!p.visible) return null;
      return <div key={item.id} data-qa="dimension-label" data-qa-id={`dimension-${item.id}`} data-qa-role="note" style={{position: 'absolute', left: p.x + item.offset[0], top: p.y + item.offset[1], transform: 'translate(-50%, -50%)', padding: '9px 15px', background: '#f9f6edee', color: '#325640', fontSize: 32, fontWeight: 650, lineHeight: 1, borderRadius: 7, whiteSpace: 'nowrap', border: '1px solid #c6d1c3', fontFamily: 'Jakarta, Arial, sans-serif'}}>{item.text}</div>;
    }) : null}
  </div>;
};
