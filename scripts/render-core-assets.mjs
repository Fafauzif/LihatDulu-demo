// Render gallery assets and the prepared Sora walkthrough from the retained GLBs.
// Run from app/: node scripts/render-core-assets.mjs
// The script never rewrites a model, manifest or report.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const temporary = process.env.ASSET_RENDER_TEMP || await fs.mkdtemp(path.join(os.tmpdir(), 'lihatdulu-asset-render-'));
const port = Number(process.env.ASSET_RENDER_PORT || 5218);
const html = '<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#eef2e8}#stage{position:relative;width:800px;height:800px}#evidence{display:none;width:100%;height:100%;object-fit:cover}.model-marker,.dimension-label{display:none!important}</style></head><body><div id="stage"></div><img id="evidence" alt="Detail goresan Lemari Sora"></body></html>';
const server = await createServer({
  root, server: { host: '127.0.0.1', port, strictPort: true, watch: null },
  plugins: [{ name: 'asset-render-host', configureServer(vite) {
    vite.middlewares.use((req, res, next) => {
      if (req.url === '/__asset_render.html') { res.setHeader('Content-Type', 'text/html'); res.end(html); }
      else next();
    });
  } }],
});

function run(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    process.stdout.on('data', value => { stdout += value; });
    process.stderr.on('data', value => { stderr += value; });
    process.on('error', reject);
    process.on('close', code => code === 0 ? resolve(stdout) : reject(new Error(`${command} exited ${code}: ${stderr}`)));
  });
}

let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: await testBrowserPath(), headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/__asset_render.html`);
  await page.evaluate(async () => {
    // The application engine normally renders continuously for interaction.
    // Offline assets need one deliberate render per pose, avoiding duplicate GPU work.
    const schedule = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => callback.name === 'render' ? 0 : schedule(callback);
    window.THREE = await import('/node_modules/.vite/deps/three.js').catch(() => import('/node_modules/three/build/three.module.js'));
    const { createEngine } = await import('/src/engine.js');
    window.loadProduct = async id => {
      window.engine?.dispose();
      document.querySelector('#stage').replaceChildren();
      const stem = id === 'sora' ? 'cabinet' : id;
      window.engine = await createEngine(document.querySelector('#stage'), { listing: { id,
        asset: { modelUrl: `/assets/${stem}.glb`, manifestUrl: `/assets/${stem}-manifest.json`, reportUrl: `/assets/${stem}-report.json` } } });
      window.engine.scene.background = new THREE.Color('#eef2e8');
      window.engine.setMarkersVisible(false);
      const bounds = new THREE.Box3();
      window.engine.model.updateMatrixWorld(true);
      window.engine.model.traverse(node => {
        if (!node.isMesh) return;
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        bounds.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
      });
      window.productBounds = bounds;
      return { id, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray(), size: bounds.getSize(new THREE.Vector3()).toArray() }, manifestDimensions: window.engine.manifest.dimensions,
        meshNames: [...window.engine.model.children].map(node => node.name), triangles: window.engine.renderer.info.render.triangles };
    };
    window.pose = ({ angle = .58, elevation = .3, open = false, drawer = 0, margin = .79 }) => {
      const engine = window.engine;
      let snapshot = engine.captureViewState();
      snapshot.motions = { left: open ? 100 : 0, right: open ? 100 : 0, drawer };
      engine.restoreViewState(snapshot);
      const bounds = new THREE.Box3();
      engine.model.traverse(node => { if (node.isMesh) bounds.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld)); });
      const target = bounds.getCenter(new THREE.Vector3());
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
      snapshot.camera = { position: camera.position.toArray(), target: target.toArray() };
      engine.restoreViewState(snapshot);
      engine.controls.update();
      engine.renderer.render(engine.scene, engine.camera);
      return snapshot.camera;
    };
    window.exactPose = (camera, motions) => {
      const engine = window.engine;
      const snapshot = engine.captureViewState();
      snapshot.camera = camera; snapshot.motions = motions;
      if (!engine.restoreViewState(snapshot)) throw new Error('Invalid walkthrough camera pose');
      engine.controls.update(); engine.renderer.render(engine.scene, engine.camera);
    };
  });

  const measurements = [];
  for (const id of process.env.ASSET_RENDER_SKIP_PHOTOS ? [] : ['sora', 'arca', 'batu', 'rimba']) {
    const result = await page.evaluate(id => window.loadProduct(id), id);
    measurements.push(result);
    const directory = path.join(root, 'public/images/products', id);
    await fs.mkdir(directory, { recursive: true });
    const views = {
      hero: { angle: .55, elevation: .32 },
      front: { angle: 0, elevation: .08 },
      rear: { angle: Math.PI - .35, elevation: .25 },
      detail: { angle: -.32, elevation: id === 'batu' ? .8 : .38, open: ['sora', 'rimba'].includes(id), drawer: id === 'sora' ? .3 : 0 },
    };
    for (const [name, pose] of Object.entries(views)) {
      await page.evaluate(pose => window.pose(pose), pose);
      const png = path.join(temporary, `${id}-${name}.png`);
      await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 800, height: 800 } });
      await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', png, '-quality', '88', path.join(directory, `${name}.webp`)]);
    }
    console.log(`Rendered ${id}: four 800 × 800 views from its retained GLB; bounds ${result.bounds.size.map(n => (n * 100).toFixed(1)).join(' × ')} cm`);
  }

  await page.setViewportSize({ width: 960, height: 720 });
  await page.evaluate(() => { document.querySelector('#stage').style.cssText = 'position:relative;width:960px;height:720px'; });
  await page.evaluate(() => window.loadProduct('sora'));
  const videoDirectory = path.join(root, 'public/videos');
  await fs.mkdir(videoDirectory, { recursive: true });
  const frameDirectory = path.join(temporary, 'frames');
  await fs.mkdir(frameDirectory, { recursive: true });
  const fps = 12, count = 18 * fps;
  for (let frame = Number(process.env.ASSET_RENDER_START_FRAME || 0); frame < count; frame++) {
    const segment = Math.floor(frame / (3 * fps));
    const progress = (frame % (3 * fps)) / (3 * fps - 1);
    if (segment < 5) {
      const settings = [
        { angle: -.22 + progress * .44, elevation: .18 },
        { angle: .52 + progress * 1.05, elevation: .23 },
        { angle: 2.45 + progress * .70, elevation: .22 },
        { angle: -.20 + progress * .40, elevation: .24, open: true },
        { angle: .34 - progress * .68, elevation: .45, open: true, drawer: .3 },
      ][segment];
      await page.evaluate(pose => window.pose({ ...pose, margin: .84 }), settings);
    } else {
      await page.evaluate(async progress => {
        document.querySelector('#stage').style.display = 'none';
        const image = document.querySelector('#evidence');
        if (!image.src) { image.src = '/images/wear-scratch.webp'; await image.decode(); }
        image.style.display = 'block'; image.style.width = '960px'; image.style.height = '720px';
        image.style.transform = `scale(${1.02 + progress * .06}) translateX(${(progress - .5) * -1.8}%)`;
      }, progress);
    }
    await page.screenshot({ path: path.join(frameDirectory, `frame-${String(frame).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 960, height: 720 } });
    if (frame % 36 === 0) console.log(`Walkthrough segment ${segment + 1}/6 rendered`);
  }
  const video = path.join(videoDirectory, 'sora-walkthrough.mp4');
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(frameDirectory, 'frame-%04d.png'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', video]);
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', video, '-frames:v', '1', '-quality', '88', path.join(videoDirectory, 'sora-poster.webp')]);
  const metadata = JSON.parse(await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,nb_frames,r_frame_rate', '-of', 'json', video]));
  if (Number(metadata.format.duration) !== 18 || metadata.streams[0].nb_frames !== String(count)) throw new Error(`Unexpected clip duration/frames: ${JSON.stringify(metadata)}`);
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', video, '-f', 'null', '-']);
  for (const id of ['sora', 'arca', 'batu', 'rimba']) for (const view of ['hero', 'front', 'rear', 'detail'])
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', path.join(root, 'public/images/products', id, `${view}.webp`), '-f', 'null', '-']);
  if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
  console.log(JSON.stringify({ measurements, video: metadata, verification: 'All 16 gallery images and every video frame decoded successfully.' }, null, 2));
} finally {
  await browser?.close();
  await server.close();
  await fs.rm(temporary, { recursive: true, force: true });
}
