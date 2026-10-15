// Source-native, isolated catalogue covers. This renders retained GLBs only.
// Run from app/: node scripts/render-transparent-products.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.CUTOUT_RENDER_PORT || 5228);
const products = ['sora', 'arca', 'batu', 'rimba'];
const stem = id => id === 'sora' ? 'cabinet' : id;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const originalHashes = Object.fromEntries(await Promise.all(products.map(async id => [id, hash(await fs.readFile(path.join(root, 'public/assets', `${stem(id)}.glb`)))])));
const html = '<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#stage{position:relative;width:800px;height:800px}.model-marker,.dimension-label{display:none!important}</style></head><body><div id="stage"></div></body></html>';
const server = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true, watch: null },
  plugins: [{ name: 'transparent-asset-render-host', configureServer(vite) {
    vite.middlewares.use((req, res, next) => {
      if (req.url === '/__transparent_asset_render.html') { res.setHeader('Content-Type', 'text/html'); res.end(html); }
      else next();
    });
  } }],
});

let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: await testBrowserPath(), headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/__transparent_asset_render.html`);
  await page.evaluate(async () => {
    // Render individual assets deterministically, without an interactive loop.
    const schedule = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => callback.name === 'render' ? 0 : schedule(callback);
    window.THREE = await import('/node_modules/.vite/deps/three.js').catch(() => import('/node_modules/three/build/three.module.js'));
    const { createEngine } = await import('/src/engine.js');
    window.renderProduct = async id => {
      window.engine?.dispose();
      const stage = document.querySelector('#stage');
      stage.replaceChildren();
      const stem = id === 'sora' ? 'cabinet' : id;
      const engine = window.engine = await createEngine(stage, { listing: { id, asset: {
        modelUrl: `/assets/${stem}.glb`, manifestUrl: `/assets/${stem}-manifest.json`, reportUrl: `/assets/${stem}-report.json`,
      } } });
      engine.scene.background = null;
      engine.renderer.setClearColor(0, 0);
      engine.setMarkersVisible(false);
      engine.setDimensionsVisible(false);
      const snapshot = engine.captureViewState();
      snapshot.motions = { left: 0, right: 0, drawer: 0 };
      engine.restoreViewState(snapshot);
      const bounds = new THREE.Box3();
      engine.model.updateMatrixWorld(true);
      engine.model.traverse(node => {
        if (!node.isMesh) return;
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        bounds.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
      });
      const target = bounds.getCenter(new THREE.Vector3());
      const angle = .55, elevation = .27, margin = .76;
      const direction = new THREE.Vector3(Math.sin(angle), elevation, Math.cos(angle)).normalize();
      const camera = engine.camera.clone();
      const corners = [];
      for (let i = 0; i < 8; i++) corners.push(new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z));
      let distance = .5;
      for (let step = 0; step < 140; step++) {
        camera.position.copy(target).addScaledVector(direction, distance);
        camera.lookAt(target); camera.updateMatrixWorld(true);
        if (corners.every(point => { const p = point.clone().project(camera); return Math.abs(p.x) <= margin && Math.abs(p.y) <= margin && p.z > -1 && p.z < 1; })) break;
        distance *= 1.025;
      }
      // Box3 gives a safe first fit. Refine against the unchanged mesh vertices
      // so a low table and a tall cabinet receive equal visible padding.
      const points = [];
      engine.model.traverse(node => {
        if (!node.isMesh) return;
        const positions = node.geometry.attributes.position;
        for (let index = 0; index < positions.count; index++) points.push(new THREE.Vector3().fromBufferAttribute(positions, index).applyMatrix4(node.matrixWorld));
      });
      for (let step = 0; step < 12; step++) {
        camera.position.copy(target).addScaledVector(direction, distance);
        camera.lookAt(target); camera.updateMatrixWorld(true);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const point of points) { const p = point.clone().project(camera); minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
        const scale = distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        target.addScaledVector(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), (minX + maxX) / 2 * scale);
        target.addScaledVector(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1), (minY + maxY) / 2 * scale);
        distance *= Math.max(maxX - minX, maxY - minY) / (2 * margin);
      }
      camera.position.copy(target).addScaledVector(direction, distance);
      camera.lookAt(target); camera.updateMatrixWorld(true);
      snapshot.camera = { position: camera.position.toArray(), target: target.toArray() };
      if (!engine.restoreViewState(snapshot)) throw new Error(`Invalid asset camera for ${id}`);
      // The original ground is a scene helper, not furniture geometry.
      // Hide it after restoreViewState, which normally restores its visibility.
      engine.scene.children.forEach(node => {
        if (node.isMesh && node.geometry.type === 'PlaneGeometry' && node.material.type === 'ShadowMaterial') node.visible = false;
      });
      engine.controls.update();
      engine.renderer.render(engine.scene, engine.camera);
      return { bounds: { min: bounds.min.toArray(), max: bounds.max.toArray(), size: bounds.getSize(new THREE.Vector3()).toArray() }, camera: snapshot.camera,
        framing: { angle, elevation, maximumProjectedExtent: margin }, manifestDimensions: engine.manifest.dimensions };
    };
  });

  const directory = path.join(root, 'public/images/cutouts');
  await fs.mkdir(directory, { recursive: true });
  const renders = [];
  for (const id of products) {
    const geometry = await page.evaluate(id => window.renderProduct(id), id);
    const output = path.join(directory, `${id}.png`);
    const bytes = await page.screenshot({ path: output, omitBackground: true, clip: { x: 0, y: 0, width: 800, height: 800 } });
    const alpha = await page.evaluate(async bytes => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0, opaque = 0, partial = 0;
      const bounds = { left: canvas.width, top: canvas.height, right: -1, bottom: -1 };
      for (let i = 3; i < pixels.length; i += 4) {
        const a = pixels[i];
        if (a === 0) transparent++; else if (a === 255) opaque++; else partial++;
        if (a > 0) { const p = (i - 3) / 4, x = p % canvas.width, y = Math.floor(p / canvas.width); bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x); bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y); }
      }
      bitmap.close();
      return { width: canvas.width, height: canvas.height, transparentPixels: transparent, opaquePixels: opaque, partialAlphaPixels: partial, visibleBounds: bounds };
    }, Array.from(bytes));
    if (!alpha.transparentPixels || !alpha.opaquePixels || alpha.visibleBounds.left <= 0 || alpha.visibleBounds.top <= 0 || alpha.visibleBounds.right >= 799 || alpha.visibleBounds.bottom >= 799) throw new Error(`Invalid alpha or clipped asset: ${id}`);
    const currentHash = hash(await fs.readFile(path.join(root, 'public/assets', `${stem(id)}.glb`)));
    if (currentHash !== originalHashes[id]) throw new Error(`Source model changed: ${id}`);
    renders.push({ id, source: `public/assets/${stem(id)}.glb`, sourceSha256: currentHash, output: `public/images/cutouts/${id}.png`, outputSha256: hash(bytes), ...geometry, alpha });
    console.log(`Rendered ${id}: transparent 800 × 800 PNG; original GLB unchanged.`);
  }
  if (errors.length) throw new Error(`Asset rendering errors: ${errors.join('; ')}`);
  const provenance = { version: 1, method: 'Retained GLBs rendered by the existing Three.js createEngine with alpha transparency; scene ground hidden; geometry, materials and lighting unchanged.', renderedAt: new Date().toISOString(), renderer: 'Three.js WebGLRenderer, alpha true, original ACESFilmicToneMapping and lighting', modelFilesUnchanged: true, renders };
  await fs.mkdir(path.join(root, 'docs'), { recursive: true });
  await fs.writeFile(path.join(root, 'docs/core-cutout-provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
} finally {
  await browser?.close();
  await server.close();
}
