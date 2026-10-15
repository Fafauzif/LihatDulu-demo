import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './camera-search.css';

const DURATION = 12;
const STEPS = [
  { title: 'Bingkai kursinya', copy: 'Sisakan ruang di sekeliling kursi agar bentuknya terlihat utuh.', time: 0 },
  { title: 'Bergerak perlahan', copy: 'Ikuti kursi dari beberapa sisi. Ponsel tetap mengarah ke barang.', time: 4.7 },
  { title: 'Jelajahi pilihannya', copy: 'Contoh acuan sudah siap. Bandingkan bentuk, ukuran, dan kondisi di bawah.', time: 12 }
];
const PLAY = '<path d="m8 5 11 7-11 7Z"/>', PAUSE = '<path d="M9 5v14M15 5v14"/>', RESTART = '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>';
const svg = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const playbackControls = className => `<div class="camera-search-controls ${className}"><button type="button" class="camera-search-play" data-cs-toggle disabled>${svg(PLAY)}<span>Mulai demo</span></button><button type="button" class="camera-search-restart" data-cs-restart disabled>${svg(RESTART)}<span>Putar dari awal</span></button></div>`;

export function renderCameraSearch() {
  return `<section class="camera-search" data-camera-search aria-labelledby="camera-search-heading">
    <div class="camera-search-stage" data-cs-stage aria-busy="true">
      <img class="camera-search-poster" src="/images/cutouts/arca.webp" width="1000" height="1000" alt="Kursi Arca, contoh barang dalam demonstrasi pencarian kamera" data-cs-poster>
      <div class="camera-search-canvas" data-cs-canvas role="img" aria-label="Demonstrasi tiga dimensi ponsel bergerak mengelilingi Kursi Arca"></div>
      <div class="camera-search-stage-top"><span class="camera-search-object">${svg('<path d="M6 11V4h12v7M4 11h16v5H4Zm2 5v5m12-5v5"/>')}Kursi Arca</span><span class="camera-search-demo">Demo 3D</span></div>
      <div class="camera-search-pov" data-cs-pov hidden><span>Sudut kamera</span><i aria-hidden="true"></i></div>
      <div class="camera-search-stage-note"><span class="camera-search-state-dot" aria-hidden="true"></span><span data-cs-scene-status>Menyiapkan contoh 3D…</span></div>
      ${playbackControls('camera-search-stage-dock')}
      <div class="camera-search-recovery" data-cs-error hidden><strong>Pratinjau 3D belum tersedia.</strong><p>Foto dan pilihan kursi tetap bisa dijelajahi.</p><button type="button" data-cs-retry>Coba 3D lagi ${svg(RESTART)}</button></div>
    </div>
    <div class="camera-search-guide">
      <div class="camera-search-kicker">CARI DENGAN KAMERA <span>12 detik</span></div>
      <h2 id="camera-search-heading">Suka bentuknya?<br>Mulai dari sini.</h2>
      <p class="camera-search-intro">Lihat bagaimana ponsel mengamati kursi dari beberapa sisi sebelum menjelajahi pilihan furnitur.</p>
      <div class="camera-search-steps" role="group" aria-label="Langkah demonstrasi">${['Bingkai', 'Gerakkan', 'Lihat pilihan'].map((name, index) => `<button type="button" data-cs-step="${index}" aria-pressed="${index === 0}" disabled><span>${String(index + 1).padStart(2, '0')}</span>${name}</button>`).join('')}</div>
      <div class="camera-search-instruction"><span data-cs-step-count>01 / 03</span><h3 data-cs-instruction>${STEPS[0].title}</h3><p data-cs-copy>${STEPS[0].copy}</p></div>
      <div class="camera-search-timeline"><progress max="${DURATION}" value="0" aria-label="Waktu pemutaran demo" data-cs-progress></progress><span data-cs-time>00:00 / 00:12</span></div>
      ${playbackControls('camera-search-guide-controls')}
      <a class="camera-search-results" href="#camera-results" data-cs-results>Lihat pilihan kursi ${svg('<path d="M4 12h16m-6-6 6 6-6 6"/>')}</a>
      <p class="camera-search-disclosure">Demo disiapkan. Kamera perangkat tidak aktif. Pilihan di bawah merupakan contoh, bukan hasil pencarian langsung.</p>
      <p class="camera-search-motion" data-cs-motion hidden>Gerak dikurangi. Pilih langkah untuk melihat setiap sudut.</p>
      <span class="camera-search-sr" role="status" aria-live="polite" data-cs-announcement></span>
    </div>
  </section>`;
}

function disposeObject(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root?.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [].concat(object.material || [])) {
      materials.add(material);
      Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
    }
  });
  textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose());
}

export function mountCameraSearch(host) {
  const root = host.matches?.('[data-camera-search]') ? host : host.querySelector('[data-camera-search]');
  if (!root) return () => {};
  const $ = selector => root.querySelector(selector);
  const stage = $('[data-cs-stage]'), canvasHost = $('[data-cs-canvas]');
  const toggles = [...root.querySelectorAll('[data-cs-toggle]')], restarts = [...root.querySelectorAll('[data-cs-restart]')];
  const stepButtons = [...root.querySelectorAll('[data-cs-step]')], motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false, playing = false, ready = false, failed = false, elapsed = 0, lastTime = 0, frame = 0, activeStep = -1, generation = 0;
  let renderer, scene, camera, phoneCamera, phone, pathGroup, renderTarget, target, sceneSize, observer, requestController;
  let width = 0, height = 0, inset = null;
  const phoneStart = 0.38;
  function announce(message) { $('[data-cs-announcement]').textContent = message; }
  function phase() { return elapsed >= 10.8 ? 2 : elapsed >= 2.4 ? 1 : 0; }
  function sync(shouldAnnounce = false) {
    const step = phase(), complete = elapsed >= DURATION;
    if (step !== activeStep) {
      activeStep = step;
      $('[data-cs-step-count]').textContent = `${String(step + 1).padStart(2, '0')} / 03`;
      $('[data-cs-instruction]').textContent = STEPS[step].title; $('[data-cs-copy]').textContent = STEPS[step].copy;
      stepButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === step)));
      if (shouldAnnounce) announce(STEPS[step].title);
    }
    $('[data-cs-progress]').value = elapsed;
    $('[data-cs-time]').textContent = `00:${String(Math.floor(elapsed)).padStart(2, '0')} / 00:12`;
    const label = playing ? 'Jeda' : complete ? 'Ulangi demo' : motionQuery.matches && elapsed > 0 ? 'Lanjut langkah' : elapsed > 0 ? 'Lanjutkan demo' : 'Mulai demo';
    toggles.forEach(button => { if (button.dataset.label !== label) { button.innerHTML = `${svg(playing ? PAUSE : PLAY)}<span>${label}</span>`; button.dataset.label = label; } });
    $('[data-cs-scene-status]').textContent = failed ? 'Foto acuan tetap tersedia' : !ready ? 'Menyiapkan contoh 3D…' : playing ? 'Ponsel bergerak mengelilingi kursi' : complete ? 'Acuan siap · Lihat pilihan di bawah' : elapsed ? 'Demo dijeda' : 'Siap dimulai · Tekan Mulai demo';
    $('[data-cs-motion]').hidden = !motionQuery.matches;
    root.classList.toggle('is-playing', playing); root.classList.toggle('is-complete', complete); $('[data-cs-results]').classList.toggle('is-ready', complete);
  }
  function stop() { playing = false; cancelAnimationFrame(frame); frame = 0; sync(); }
  function positionScene() {
    if (!ready || !phone) return;
    const orbit = THREE.MathUtils.clamp((elapsed - 2.4) / 8.4, 0, 1), angle = phoneStart + orbit * Math.PI * 2, radius = 1.75 * sceneSize;
    phone.position.set(Math.sin(angle) * radius, target.y + sceneSize * .12, Math.cos(angle) * radius);
    phone.lookAt(target); phone.rotateY(Math.PI);
    phoneCamera.position.copy(phone.position); phoneCamera.lookAt(target);
    pathGroup.children.forEach((marker, index) => { const selected = index / pathGroup.children.length <= orbit; marker.material.color.set(selected ? 0x63836a : 0xbfcab8); marker.material.opacity = selected ? .92 : .5; });
  }
  function draw() {
    if (!ready || !renderer || !width || !height || disposed) return;
    positionScene(); phone.visible = false; pathGroup.visible = false;
    phoneCamera.aspect = .6; phoneCamera.updateProjectionMatrix();
    renderer.setScissorTest(false); renderer.setRenderTarget(renderTarget); renderer.render(scene, phoneCamera); renderer.setRenderTarget(null);
    phone.visible = true; pathGroup.visible = true; renderer.setViewport(0, 0, width, height); renderer.render(scene, camera);
    if (inset) {
      phone.visible = false; pathGroup.visible = false;
      renderer.setScissorTest(true); renderer.setScissor(inset.x, inset.y, inset.width, inset.height); renderer.setViewport(inset.x, inset.y, inset.width, inset.height);
      phoneCamera.aspect = inset.width / inset.height; phoneCamera.updateProjectionMatrix(); renderer.render(scene, phoneCamera);
      phone.visible = true; pathGroup.visible = true; renderer.setScissorTest(false); renderer.setViewport(0, 0, width, height);
    }
  }
  function resize() {
    if (!renderer || !camera || disposed) return;
    width = Math.max(1, stage.clientWidth); height = Math.max(1, stage.clientHeight); renderer.setSize(width, height, false); camera.aspect = width / height;
    const preview = $('[data-cs-pov]'), box = preview.getBoundingClientRect(), parent = stage.getBoundingClientRect();
    inset = preview.hidden ? null : { x: box.left - parent.left + 5, y: parent.bottom - box.bottom + 5, width: Math.max(1, box.width - 10), height: Math.max(1, box.height - 10) };
    const scale = width / height < 1.15 ? 1.19 : 1;
    camera.position.set(sceneSize * 3.05 * scale, sceneSize * 2.6 * scale, sceneSize * 3.8 * scale); camera.lookAt(0, sceneSize * .48, 0); camera.updateProjectionMatrix(); draw();
  }
  function tick(now) {
    frame = 0; if (!playing || disposed || document.hidden) return;
    elapsed = Math.min(DURATION, elapsed + Math.min(.08, (now - lastTime) / 1000)); lastTime = now;
    if (elapsed >= DURATION) playing = false;
    sync(true); draw();
    if (playing) frame = requestAnimationFrame(tick); else if (elapsed >= DURATION) announce('Demo selesai. Pilihan kursi tersedia di bawah.');
  }
  function start() {
    if (!ready) return;
    if (elapsed >= DURATION) elapsed = 0;
    if (motionQuery.matches) { elapsed = phase() === 0 ? STEPS[1].time : DURATION; playing = false; sync(true); draw(); return; }
    playing = true; lastTime = performance.now(); sync(); frame = requestAnimationFrame(tick);
  }
  function onToggle() { if (playing) { stop(); announce('Demo dijeda.'); } else start(); }
  function onRestart() { stop(); elapsed = 0; activeStep = -1; sync(); draw(); announce('Demo dimulai dari awal.'); if (!motionQuery.matches) start(); }
  function onStep(event) { stop(); elapsed = STEPS[Number(event.currentTarget.dataset.csStep)].time; sync(true); draw(); }
  function onVisibility() { if (document.hidden && playing) { stop(); announce('Demo dijeda saat halaman tidak aktif.'); } }
  function onMotionChange() { stop(); sync(); draw(); }
  function onContextLost(event) { event.preventDefault(); showError(); }
  function releaseScene() {
    cancelAnimationFrame(frame); frame = 0;
    if (renderer) renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    disposeObject(scene); renderTarget?.dispose();
    if (renderer) { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
    renderer = scene = camera = phoneCamera = phone = pathGroup = renderTarget = null; ready = false;
  }
  function showError() {
    if (disposed) return;
    playing = false; failed = true; ready = false; cancelAnimationFrame(frame); frame = 0;
    canvasHost.hidden = true; $('[data-cs-poster]').hidden = false; $('[data-cs-error]').hidden = false; $('[data-cs-pov]').hidden = true; stage.setAttribute('aria-busy', 'false');
    [...toggles, ...restarts, ...stepButtons].forEach(button => { button.disabled = true; }); root.classList.remove('is-loaded'); sync();
    announce('Pratinjau 3D belum tersedia. Foto dan pilihan kursi tetap bisa dijelajahi.');
  }
  async function initialize() {
    const attempt = ++generation; requestController?.abort(); requestController = new AbortController();
    releaseScene(); failed = false; playing = false; elapsed = 0; activeStep = -1;
    canvasHost.hidden = false; stage.setAttribute('aria-busy', 'true'); $('[data-cs-error]').hidden = true; $('[data-cs-poster]').hidden = false; sync();
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.domElement.setAttribute('aria-hidden', 'true'); renderer.domElement.addEventListener('webglcontextlost', onContextLost); canvasHost.appendChild(renderer.domElement);
      scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9eee1); scene.fog = new THREE.Fog(0xe9eee1, 7, 15);
      scene.add(new THREE.HemisphereLight(0xfffcf0, 0x9cafa0, 2.6));
      const key = new THREE.DirectionalLight(0xfff2dc, 4); key.position.set(3.5, 6, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0005;
      key.shadow.camera.left = key.shadow.camera.bottom = -4; key.shadow.camera.right = key.shadow.camera.top = 4; key.shadow.camera.far = 18; scene.add(key);
      const rim = new THREE.DirectionalLight(0xd9e5dd, 2); rim.position.set(-4, 3, -3); scene.add(rim);
      const response = await fetch('/assets/arca.glb', { signal: requestController.signal });
      if (!response.ok) throw new Error('Model unavailable');
      const model = (await new GLTFLoader().parseAsync(await response.arrayBuffer(), '/assets/')).scene;
      if (disposed || attempt !== generation) { disposeObject(model); return; }
      const bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
      sceneSize = Math.max(size.y, size.x, size.z);
      model.position.x -= center.x; model.position.z -= center.z; model.position.y -= bounds.min.y;
      model.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } }); scene.add(model);
      target = new THREE.Vector3(0, size.y * .51, 0);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(sceneSize * 200, sceneSize * 200), new THREE.MeshStandardMaterial({ color: 0xe9eee1, roughness: 1 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = -.003 * sceneSize; floor.receiveShadow = true; scene.add(floor);
      const grid = new THREE.GridHelper(sceneSize * 8, 24, 0xc2ccb9, 0xd4ddcb); grid.position.y = .001 * sceneSize; grid.material.transparent = true; grid.material.opacity = .4; scene.add(grid);
      const path = new THREE.Mesh(new THREE.RingGeometry(sceneSize * 1.71, sceneSize * 1.74, 96), new THREE.MeshBasicMaterial({ color: 0xa3b69b, side: THREE.DoubleSide, transparent: true, opacity: .6 }));
      path.rotation.x = -Math.PI / 2; path.position.y = sceneSize * .004; scene.add(path);
      pathGroup = new THREE.Group();
      for (let index = 0; index < 12; index++) {
        const angle = phoneStart + index / 12 * Math.PI * 2;
        const marker = new THREE.Mesh(new THREE.CylinderGeometry(sceneSize * .022, sceneSize * .022, sceneSize * .008, 16), new THREE.MeshBasicMaterial({ color: 0xbfcab8, transparent: true, opacity: .5 }));
        marker.position.set(Math.sin(angle) * sceneSize * 1.725, sceneSize * .008, Math.cos(angle) * sceneSize * 1.725); pathGroup.add(marker);
      }
      scene.add(pathGroup); phone = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(sceneSize * .27, sceneSize * .51, sceneSize * .035), new THREE.MeshStandardMaterial({ color: 0x153d30, roughness: .4, metalness: .25 })); body.castShadow = true; phone.add(body);
      renderTarget = new THREE.WebGLRenderTarget(240, 400); renderTarget.texture.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(sceneSize * .235, sceneSize * .435), new THREE.MeshBasicMaterial({ map: renderTarget.texture, toneMapped: false })); screen.position.z = sceneSize * .0185; phone.add(screen);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(sceneSize * .008, 16), new THREE.MeshBasicMaterial({ color: 0x060e0a })); lens.position.set(0, sceneSize * .236, sceneSize * .019); phone.add(lens);
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(sceneSize * .075, sceneSize * .006), new THREE.MeshBasicMaterial({ color: 0xcad8ca })); bar.position.set(0, -sceneSize * .238, sceneSize * .019); phone.add(bar); scene.add(phone);
      camera = new THREE.PerspectiveCamera(38, 1, sceneSize * .01, sceneSize * 250); phoneCamera = new THREE.PerspectiveCamera(44, .6, sceneSize * .02, sceneSize * 100);
      ready = true; failed = false; [...toggles, ...restarts, ...stepButtons].forEach(button => { button.disabled = false; });
      $('[data-cs-poster]').hidden = true; $('[data-cs-pov]').hidden = false; stage.setAttribute('aria-busy', 'false'); root.classList.add('is-loaded'); resize(); sync();
    } catch (error) { if (disposed || attempt !== generation || error.name === 'AbortError') return; releaseScene(); showError(); }
  }
  toggles.forEach(button => button.addEventListener('click', onToggle)); restarts.forEach(button => button.addEventListener('click', onRestart)); stepButtons.forEach(button => button.addEventListener('click', onStep)); $('[data-cs-retry]').addEventListener('click', initialize);
  document.addEventListener('visibilitychange', onVisibility); motionQuery.addEventListener('change', onMotionChange); observer = new ResizeObserver(resize); observer.observe(stage); initialize();
  return () => {
    disposed = true; generation++; playing = false; requestController?.abort(); observer.disconnect();
    toggles.forEach(button => button.removeEventListener('click', onToggle)); restarts.forEach(button => button.removeEventListener('click', onRestart)); stepButtons.forEach(button => button.removeEventListener('click', onStep)); $('[data-cs-retry]').removeEventListener('click', initialize);
    document.removeEventListener('visibilitychange', onVisibility); motionQuery.removeEventListener('change', onMotionChange); releaseScene();
  };
}
