import './inspection.css';
import { loadViewerSession, saveViewerSession } from './viewer-state.js';
import { decodeReport, encodeReport, escapeHTML, freshReport, loadPlacements, savePlacement, storageAvailable, validateReport } from './state.js';
import { ROOM_PRESETS, roomForPreset, matchRoomPreset } from './room-presets.js';

const conditions = [
  { id: 'scratch', title: 'Goresan pintu kiri', location: 'Permukaan depan', size: 'Panjang 11 cm', image: '/images/wear-scratch.webp', note: 'Goresan tipis terlihat pada pintu kiri. Pilih titik 1 untuk melihat letaknya.' },
  { id: 'chip', title: 'Sudut terkelupas', location: 'Sudut kanan atas', size: '8 × 5 mm', image: '/images/wear-chip.webp', note: 'Lapisan pada sudut kanan atas terkelupas. Pilih titik 2 untuk melihat lebih dekat.' },
  { id: 'mark', title: 'Bekas pada permukaan', location: 'Bagian atas', size: 'Diameter 5,5 cm', image: '/images/wear-mark.webp', note: 'Bekas berbentuk lingkaran tampak samar pada permukaan atas. Pilih titik 3 untuk melihat letaknya.' },
];
const snapshots = new Map();
const roomReports = new Map();
const ROOM_REPORT_KEY = 'lihatdulu:inspection:room-report:v1';
const button = (label, action, extra = '') => `<button type="button" class="inspection-button" data-inspection-action="${action}" ${extra}>${label}</button>`;
const motionKinds = [['left', 'Pintu kiri', 100, '°'], ['right', 'Pintu kanan', 100, '°'], ['drawer', 'Laci', 30, ' cm']];
const listingMotionKinds = listing => !listing || listing.id === 'sora' ? motionKinds : listing.id === 'rimba' && listing.capabilities?.articulation !== false ? motionKinds.filter(([kind]) => kind !== 'drawer').map(([kind,name]) => [kind,name,60.2,'°']) : [];
const hasMotion = (listing, kind) => listingMotionKinds(listing).some(([id]) => id === kind);
const dimensionText = listing => listing?.dimensions ? ['width','depth','height'].map(key => Number(listing.dimensions[key]).toLocaleString('id-ID')).join(' × ') + ' cm' : !listing ? '90 × 47,5 × 120 cm' : 'Belum dicantumkan';
const motionControls = (listing = null) => !listingMotionKinds(listing).length ? '' : `<div class="inspection-motion"><div class="inspection-motion-toggles" role="group" aria-label="Bukaan penyimpanan">${listingMotionKinds(listing).map(([id, name]) => `<button type="button" class="inspection-motion-toggle" data-motion-toggle="${id}" aria-label="Buka ${name.toLowerCase()}" aria-pressed="false" data-engine-control disabled><span>${name}</span><small data-motion-status="${id}">Tertutup</small><span class="inspection-toggle-icon" aria-hidden="true">+</span></button>`).join('')}</div><details class="inspection-precise"><summary>Atur bukaan</summary><div class="inspection-inline-actions">${button('Buka semua', 'open', 'data-engine-control disabled')}${button('Tutup semua', 'close', 'data-engine-control disabled')}</div>${listingMotionKinds(listing).map(([id, name, max, unit]) => `<label class="inspection-slider"><span>${name}<output data-motion-output="${id}">0${unit}</output></span><input type="range" min="0" max="${max}" step="1" value="0" data-motion="${id}" aria-label="${name}, ${id === 'drawer' ? 'sentimeter' : 'derajat'}" data-engine-control disabled></label>`).join('')}</details></div>`;
const evidence = (expanded) => `<details class="inspection-evidence" data-inspection-pane data-condition-panel ${expanded ? 'open' : ''}><summary><span>Catatan kondisi</span><span class="inspection-count">3 detail</span></summary><div class="inspection-condition-list">${conditions.map((c, i) => `<button type="button" class="inspection-condition" data-condition="${c.id}" aria-pressed="false"><img src="${c.image}" alt="" width="72" height="56"><span><strong>${c.title}</strong><small>${c.location}</small></span><b aria-hidden="true">${i + 1}</b></button>`).join('')}</div><p class="inspection-help">Pilih catatan atau titik pada barang untuk melihat letaknya.</p><div class="inspection-detail" data-inspection-detail tabindex="-1" hidden></div></details>`;
const cameraControls = () => `<details class="inspection-view-tools"><summary>Zoom & ukuran</summary><div class="inspection-camera-actions">${button('−', 'zoom-out', 'aria-label="Perkecil tampilan" data-engine-control disabled')}${button('+', 'zoom-in', 'aria-label="Perbesar tampilan" data-engine-control disabled')}${button('Ukuran', 'dimensions', 'aria-pressed="false" data-engine-control disabled')}${button('Atur ulang', 'reset', 'aria-label="Atur ulang tampilan dan bukaan" data-engine-control disabled')}</div></details>`;
const roomPane = (listing = null) => {
  const doors = hasMotion(listing, 'left') || hasMotion(listing, 'right'), drawer = hasMotion(listing, 'drawer');
  const presets = ROOM_PRESETS.filter(preset => preset.id === 'clear' || preset.id === 'door' && doors || preset.id === 'drawer' && drawer);
  return `<aside class="inspection-room" data-inspection-pane>
    <div class="inspection-section-heading"><h3>${doors || drawer ? 'Periksa ruang & bukaan' : 'Periksa ukuran ruang'}</h3><span class="inspection-count" data-room-size>3,2 × 3 m</span></div>
    <div class="inspection-room-presets" role="group" aria-label="Pilihan ruang">${presets.map(preset => `<button type="button" class="inspection-room-preset" data-room-preset="${preset.id}" aria-pressed="false" data-engine-control disabled><strong>${preset.name}</strong><span>3,2 × 3 m</span><small>${preset.note}</small></button>`).join('')}</div>
    <div class="inspection-outcomes" aria-live="polite" aria-atomic="true"><div data-placement="body"><span>Badan furnitur</span><strong>Menunggu ukuran</strong></div>${doors ? '<div data-placement="doors"><span>Bukaan pintu</span><strong>Menunggu ukuran</strong></div>' : ''}${drawer ? '<div data-placement="drawer"><span>Bukaan laci</span><strong>Menunggu ukuran</strong></div>' : ''}</div>
    <p class="inspection-help" data-placement-source>Berdasarkan ukuran ruangan dan barang: ${dimensionText(listing)}.</p>
    <div class="inspection-room-actions">${button('Simpan posisi', 'save-placement', 'data-engine-control disabled')}${button('Urungkan', 'undo', 'data-inspection-undo disabled')}${button('Atur ulang ruang', 'reset-room', 'data-engine-control disabled')}</div>
    ${motionControls(listing)}
    <details class="inspection-custom-room" data-room-custom><summary>Sesuaikan ukuran & posisi</summary><h3>Ukuran ruangan</h3><div class="inspection-fields">${[['width', 'Lebar', 3.2, 1.2, 10], ['depth', 'Panjang', 3, 1, 10]].map(([id, label, value, min, max]) => `<label>${label}<span class="inspection-input-unit"><input type="number" value="${value}" min="${min}" max="${max}" step="0.1" inputmode="decimal" data-room-field="${id}" aria-label="${label} ruangan dalam meter" data-engine-control disabled><span>m</span></span></label>`).join('')}</div><p class="inspection-validation" data-room-validation role="status"></p><h3>Posisi barang</h3><p class="inspection-help">Geser furnitur di ruang atau ubah posisi berikut.</p><div class="inspection-fields">${[['x', 'Kiri / kanan', 0], ['z', 'Depan / belakang', -.4]].map(([id, label, value]) => `<label>${label}<span class="inspection-input-unit"><input type="number" value="${value}" min="-10" max="10" step="0.1" inputmode="decimal" data-room-field="${id}" aria-label="Posisi ${label.toLowerCase()} dalam meter" data-engine-control disabled><span>m</span></span></label>`).join('')}</div><label class="inspection-rotation">Putaran<span class="inspection-input-unit"><input type="number" value="0" min="-180" max="180" step="15" data-room-field="rotation" aria-label="Putaran barang dalam derajat" data-engine-control disabled><span>°</span></span></label><div class="inspection-inline-actions">${button('Putar kiri', 'rotate-left', 'data-engine-control disabled')}${button('Putar kanan', 'rotate-right', 'data-engine-control disabled')}</div><label class="inspection-fixture">Penghalang di ruang<select data-room-fixture aria-label="Penghalang di ruangan" data-engine-control disabled><option value="clear">Tanpa penghalang</option>${doors ? '<option value="door">Di depan pintu</option>' : ''}${drawer ? '<option value="drawer">Di depan laci</option>' : ''}<option value="wall">Dekat dinding kanan</option></select></label></details>
    <details class="inspection-saved-positions" data-saved-details><summary>Posisi tersimpan</summary><label>Pilih posisi<select data-saved-placement disabled><option value="">Pilih posisi tersimpan</option></select></label><p class="inspection-help" data-saved-caption>Simpan posisi untuk dibuka kembali nanti.</p></details>
  </aside>`;
};

export function renderInspection(mode = 'model', listing = null) {
  mode = ['model', 'condition', 'room'].includes(mode) ? mode : 'model';
  const room = mode === 'room';
  const name = listing?.title || 'Lemari Sora';
  const poster = listing?.photos?.[0]?.src || '/images/cabinet-closed.webp';
  const alt = listing?.photos?.[0]?.alt || `${name} dalam tampilan 3D`;
  const kind = listing?.id === 'sora' ? 'lemari' : 'furnitur';
  const isSora = !listing || listing.id === 'sora';
  return `<section class="inspection" data-inspection-mode="${mode}" data-product-id="${listing?.id || 'sora'}" aria-label="${room ? `Coba ${name} di ruangan` : `Periksa ${name}`}"><div class="inspection-layout"><div class="inspection-main"><div class="inspection-stage" data-inspection-stage aria-busy="true" tabindex="0" aria-label="Tampilan 3D ${name}. Gunakan tombol di bawah untuk mengubah tampilan."><img class="inspection-poster" src="${poster}" alt="${alt}" width="1000" height="1000"><span class="inspection-stage-label" aria-hidden="true">${room ? 'Coba di ruang' : 'Putar 3D'}</span><div class="inspection-loading" role="status"><span class="inspection-loading-dot" aria-hidden="true"></span><p data-loading-label>Menyiapkan tampilan 3D…</p><progress max="1" value="0" aria-label="Memuat tampilan 3D"></progress></div><div class="inspection-error" hidden><strong>Tampilan 3D belum tersedia</strong><p>Foto ${room ? `${kind} tetap tersedia. Hasil kecocokan akan muncul setelah tampilan 3D terbuka.` : 'dan catatan kondisi tetap dapat dilihat.'} Coba muat kembali.</p>${button('Coba lagi', 'retry')}</div></div><div class="inspection-toolbar" aria-label="Kontrol tampilan">${room ? `<div class="inspection-room-view">${button('Lihat seluruh ruang', 'room-view', 'data-engine-control disabled')}${cameraControls()}</div>` : `<div class="inspection-view-actions" role="group" aria-label="Sudut pandang">${[['front', 'Depan'], ['left', 'Kiri'], ['rear', 'Belakang'], ['top', 'Atas'], ['interior', 'Dalam']].filter(([id]) => id !== 'interior' || listingMotionKinds(listing).length).map(([id, label]) => button(label, 'view', `data-view="${id}" aria-label="Lihat ${id === 'interior' ? 'bagian dalam' : id === 'left' ? 'sisi kiri' : label.toLowerCase()}" data-engine-control disabled aria-pressed="false"`)).join('')}</div>${button('Lihat foto detail', 'detail', 'data-inspection-detail-jump hidden')}`}</div><p class="inspection-canvas-help">${room ? `Geser ${kind} untuk memindahkan. Geser ruang untuk melihat sudut lain.` : 'Geser ke samping untuk memutar. Cubit untuk memperbesar.'}</p>${room ? '' : `${motionControls(listing)}${cameraControls()}`}</div>${room ? roomPane(listing) : isSora ? evidence(mode === 'condition') : `<aside class="inspection-evidence static-evidence"><summary><span>Informasi inspeksi</span><span class="inspection-count">${listing?.capabilities?.room ? 'Bisa dicoba di ruang' : 'Foto tersedia'}</span></summary><p class="inspection-help">Ukuran barang: ${dimensionText(listing)}. Jelajahi bentuknya dan coba penempatannya di ruang.</p></aside>`}</div></section>`;
}

export function mountInspection(root, { mode = 'model', onToast = () => {}, report = null, listing = null } = {}) {
  mode = ['model', 'condition', 'room'].includes(mode) ? mode : 'model';
  const host = root.querySelector('.inspection');
  if (!host) return () => {};
  host._engine = null;
  const stage = host.querySelector('[data-inspection-stage]');
  const controller = new AbortController();
  let disposed = false, engine = null, loading = false, selected = null, lastRoom = null, lastFit = null, undoing = false, persistTimer = null;
  const viewerKey = `inspection-${listing?.id || 'sora'}-${mode}`;
  const defaultReport = { ...freshReport(), ...(listing ? { name: listing.title, note: listing.description, views: listingMotionKinds(listing).length ? [...freshReport().views].filter(view => view !== 'drawer' || hasMotion(listing,'drawer')) : ['front','left','rear','top'] } : {}), schema: 2, dimensionsConfirmed: true, conditionNotes: !listing || listing.id === 'sora' ? conditions.map(({ id, note }) => ({ id, note })) : [] };
  let suppliedReport = defaultReport, suppliedReportValid = !report;
  if (report) { try { suppliedReport = validateReport(report); suppliedReportValid = true; } catch {} }
  const sourceConfirmed = suppliedReportValid && (!report || report.dimensionsConfirmed === true || report.dimsConfirmed === true);
  const sourceReportKey = encodeReport(suppliedReport);
  let dimensionsConfirmed = sourceConfirmed;
  let lastRoomConfirmed = dimensionsConfirmed;
  let savedPlacements = [];
  const history = [];
  const roomMode = mode === 'room';
  const alive = () => !disposed && root.contains(host) && host.contains(stage);
  const q = selector => host.querySelector(selector);
  const qa = selector => [...host.querySelectorAll(selector)];
  const setPressed = (selector, key, value) => qa(selector).forEach(el => el.setAttribute('aria-pressed', String(el.dataset[key] === value)));
  const conditionPanel = q('[data-condition-panel]');
  function syncMarkers() {
    if (engine && conditionPanel) engine.setMarkersVisible(Boolean(conditionPanel.open));
  }
  conditionPanel?.addEventListener('toggle', syncMarkers, { signal: controller.signal });
  function showCondition(id) {
    if (!conditionPanel) { selected = null; return; }
    selected = conditions.some(c => c.id === id) ? id : null;
    setPressed('[data-condition]', 'condition', selected);
    const c = conditions.find(c => c.id === selected) || conditions[0];
    const detail = q('[data-inspection-detail]');
    const jump = q('[data-inspection-detail-jump]');
    if (jump) jump.hidden = !selected;
    const note = suppliedReport.conditionNotes?.find(entry => entry.id === c.id)?.note ?? c.note;
    if (selected) q('[data-condition-panel]').open = true;
    syncMarkers();
    if (detail) { detail.hidden = !selected; detail.innerHTML = `<img src="${c.image}" alt="${c.title}, ${c.location.toLowerCase()}" width="560" height="420"><h4>${c.title}</h4><p>${escapeHTML(note)}</p><span>${c.size}</span>${button('Kembali ke barang', 'return-stage', 'data-inspection-return-stage')}`; }
    if (selected && engine) { engine.setDimensionsVisible(false); q('[data-inspection-action="dimensions"]').setAttribute('aria-pressed', 'false'); setPressed('[data-view]', 'view', null); }
  }
  function syncMotions() {
    if (!engine) return;
    const { motions, motionLimits } = engine.getState();
    qa('[data-motion]').forEach(el => { const limit = motionLimits[el.dataset.motion]; if (!limit) { el.disabled = true; return; } el.max = limit.max * (el.dataset.motion === 'drawer' ? 100 : 1); const value = el.dataset.motion === 'drawer' ? Math.round(motions.drawer * 100) : Math.round(motions[el.dataset.motion]); el.value = value; q(`[data-motion-output="${el.dataset.motion}"]`).textContent = `${value}${el.dataset.motion === 'drawer' ? ' cm' : '°'}`; });
    qa('[data-motion-toggle]').forEach(el => {
      const id = el.dataset.motionToggle, open = motions[id] > 0;
      const name = motionKinds.find(([kind]) => kind === id)[1];
      el.setAttribute('aria-pressed', String(open));
      el.setAttribute('aria-label', `${open ? 'Tutup' : 'Buka'} ${name.toLowerCase()}`);
      q(`[data-motion-status="${id}"]`).textContent = open ? 'Terbuka' : 'Tertutup';
      el.querySelector('.inspection-toggle-icon').textContent = open ? '−' : '+';
    });
  }
  function placement({ state, result }) {
    if (!alive() || !roomMode) return;
    if (lastRoom && !undoing && (JSON.stringify(lastRoom) !== JSON.stringify(state) || lastRoomConfirmed !== dimensionsConfirmed)) { history.push({ room: { ...lastRoom }, dimensionsConfirmed: lastRoomConfirmed }); if (history.length > 25) history.shift(); }
    lastRoom = { ...state };
    lastRoomConfirmed = dimensionsConfirmed;
    lastFit = { closedFits: result.closedFits, doorsClear: result.doorsClear, drawerClear: result.drawerClear };
    qa('[data-room-field]').forEach(el => { if (document.activeElement !== el) el.value = state[el.dataset.roomField]; });
    q('[data-room-fixture]').value = state.fixture;
    setPressed('[data-room-preset]', 'roomPreset', matchRoomPreset(state));
    q('[data-inspection-undo]').disabled = !history.length;
    const savedIndex = savedPlacements.findIndex(value => JSON.stringify(value.room) === JSON.stringify(state) && (value.report.dimensionsConfirmed === true) === dimensionsConfirmed);
    const positionSelect = q('[data-saved-placement]');
    if (positionSelect.value && savedIndex < 0) q('[data-saved-caption]').textContent = 'Posisi telah diubah. Simpan untuk dibuka kembali nanti.';
    positionSelect.value = savedIndex < 0 ? '' : String(savedIndex);
    const measured = engine?.getState().dimensions || listing?.dimensions;
    const actualDimensions = measured ? ['width','depth','height'].map(key => measured[key].toLocaleString('id-ID')).join(' × ') + ' cm' : dimensionText(listing);
    q('[data-room-size]').textContent = `${state.width.toLocaleString('id-ID')} × ${state.depth.toLocaleString('id-ID')} m`;
    q('[data-placement-source]').textContent = dimensionsConfirmed ? `Berdasarkan ukuran ruangan dan barang: ${actualDimensions}.` : 'Ukuran barang belum dikonfirmasi. Konfirmasi ukuran sebelum menilai kecocokan ruang.';
    if (!dimensionsConfirmed) { qa('[data-placement]').forEach(el => { delete el.dataset.clear; el.querySelector('strong').textContent = 'Ukuran belum dikonfirmasi'; }); schedulePersist(); return; }
    const entries = [['body', result.closedFits, 'Ukuran muat', 'Ukuran melewati ruang'], ['doors', result.doorsClear, 'Pintu bisa dibuka', 'Pintu terhalang'], ['drawer', result.drawerClear, 'Laci bisa dibuka', 'Laci terhalang']];
    entries.forEach(([key, clear, yes, no]) => { const el = q(`[data-placement="${key}"]`); if (!el) return; el.dataset.clear = String(clear); el.querySelector('strong').textContent = `${clear ? '✓' : '!'} ${clear ? yes : no}`; });
    schedulePersist();
  }
  function validateRoom() {
    const inputs = qa('[data-room-field]');
    const invalid = inputs.find(el => el.value.trim() === '' || !el.validity.valid || !Number.isFinite(Number(el.value)));
    inputs.forEach(el => el.setAttribute('aria-invalid', String(el === invalid)));
    q('[data-room-validation]').textContent = invalid ? `Isi ${invalid.closest('label').childNodes[0].textContent.toLowerCase()} antara ${invalid.min} dan ${invalid.max}.` : '';
    if (invalid) { q('[data-room-custom]').open = true; qa('[data-placement]').forEach(el => { delete el.dataset.clear; el.querySelector('strong').textContent = 'Periksa ukuran dan posisi'; }); }
    return invalid ? null : Object.fromEntries(inputs.map(el => [el.dataset.roomField, Number(el.value)]));
  }
  function clearRoomValidation() {
    qa('[data-room-field]').forEach(el => el.removeAttribute('aria-invalid'));
    q('[data-room-validation]').textContent = '';
  }
  function persist() {
    if (!engine) return;
    const snapshot = engine.captureViewState();
    if (!snapshot) return;
    snapshots.set(viewerKey, snapshot);
    saveViewerSession(viewerKey, { schema: 1, mode: 'free', chapter: 0, tool: roomMode ? 'room' : mode === 'condition' ? 'condition' : 'model', roomTab: 'position', freeView: snapshot, guidedView: null, area: 'front', taken: [] });
    if (roomMode) {
      const activeReport = validateReport({ ...suppliedReport, schema: 2, conditionNotes: suppliedReport.conditionNotes || [], dimensionsConfirmed });
      roomReports.set(sourceReportKey, activeReport);
      if (roomReports.size > 20) roomReports.delete(roomReports.keys().next().value);
      try { localStorage.setItem(ROOM_REPORT_KEY, JSON.stringify({ schema: 1, sourceReport: sourceReportKey, activeReport: encodeReport(activeReport) })); } catch {}
    }
  }
  function readRoomReport() {
    if (roomReports.has(sourceReportKey)) return roomReports.get(sourceReportKey);
    try {
      const raw = localStorage.getItem(ROOM_REPORT_KEY);
      if (typeof raw !== 'string' || raw.length > 30000) return null;
      const value = JSON.parse(raw);
      if (!value || Array.isArray(value) || Object.keys(value).length !== 3 || value.schema !== 1 || value.sourceReport !== sourceReportKey || !Object.hasOwn(value, 'activeReport')) return null;
      return decodeReport(value.activeReport);
    } catch { return null; }
  }
  function revealStage(force = false) {
    if (!force && !matchMedia('(max-width: 767px)').matches) return;
    stage.scrollIntoView({ block: 'start', behavior: 'instant' });
    stage.focus({ preventScroll: true });
  }
  function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { if (alive()) persist(); }, 800);
  }
  function refreshSavedPositions() {
    if (!roomMode) return;
    savedPlacements = loadPlacements().filter(value => value.report.name === suppliedReport.name || (!listing || listing.id === 'sora') && ['Lemari Kayu Sora','Lemari Sora'].includes(value.report.name));
    const select = q('[data-saved-placement]');
    select.innerHTML = '<option value="">Pilih posisi tersimpan</option>' + savedPlacements.map((value, index) => `<option value="${index}">${escapeHTML(value.report.name)} · ${value.room.width.toLocaleString('id-ID')} × ${value.room.depth.toLocaleString('id-ID')} m · ${new Date(value.savedAt).toLocaleDateString('id-ID')}</option>`).join('');
    select.disabled = !savedPlacements.length;
    q('[data-saved-caption]').textContent = savedPlacements.length ? `${savedPlacements.length} posisi tersimpan ${storageAvailable() ? 'di perangkat ini' : 'selama halaman ini terbuka'}.` : 'Simpan posisi untuk dibuka kembali nanti.';
    const index = savedPlacements.findIndex(value => JSON.stringify(value.room) === JSON.stringify(lastRoom) && (value.report.dimensionsConfirmed === true) === dimensionsConfirmed);
    if (index >= 0) { select.value = String(index); q('[data-saved-caption]').textContent = dimensionsConfirmed ? 'Posisi tersimpan dibuka. Ukuran dikonfirmasi.' : 'Posisi dibuka. Ukuran belum dikonfirmasi.'; }
  }
  const cleanup = () => {
    if (disposed) return;
    persist(); disposed = true; clearTimeout(persistTimer); controller.abort();
    if (engine) { engine.dispose(); engine = null; }
    host._engine = null;
  };
  async function load() {
    if (loading || !alive()) return;
    loading = true; q('.inspection-error').hidden = true; q('.inspection-loading').hidden = false; stage.setAttribute('aria-busy', 'true');
    try {
      const { createEngine } = await import('./engine.js');
      if (!alive()) return;
      const created = await createEngine(stage, { listing, onInteraction: schedulePersist, onCondition: id => { if (alive() && (engine || id)) { showCondition(id); schedulePersist(); } }, onPlacement: placement, onLoadProgress: value => { if (!alive()) return; const progress = q('progress'); if (value === null) progress.removeAttribute('value'); else progress.value = value; q('[data-loading-label]').textContent = value > 0 ? `Menyiapkan tampilan 3D… ${Math.round(value * 100)}%` : 'Menyiapkan tampilan 3D…'; } });
      if (!alive()) { created.dispose(); return; }
      engine = created;
      host._engine = engine;
      const pendingCondition = selected;
      const saved = snapshots.get(viewerKey) || loadViewerSession(viewerKey)?.freeView;
      const activeRoomReport = roomMode && saved ? readRoomReport() : null;
      if (activeRoomReport) dimensionsConfirmed = sourceConfirmed && activeRoomReport.dimensionsConfirmed === true;
      if (saved && saved.inRoom === roomMode && saved.captureScene.active === false) engine.restoreViewState(saved); else if (roomMode) engine.enterRoom();
      if (pendingCondition) engine.selectCondition(pendingCondition);
      syncMarkers();
      syncMotions();
      qa('[data-engine-control]').forEach(el => el.disabled = false);
      const state = engine.getState(); q('[data-inspection-action="dimensions"]').setAttribute('aria-pressed', String(state.dimensionsVisible)); setPressed('[data-view]', 'view', state.view);
      refreshSavedPositions();
      history.length = 0;
      if (roomMode) q('[data-inspection-undo]').disabled = true;
      q('.inspection-loading').hidden = true; q('.inspection-poster').hidden = true; stage.setAttribute('aria-busy', 'false');
      const canvas = stage.querySelector('canvas'); if (canvas) canvas.setAttribute('aria-hidden', 'true');
    } catch { if (alive()) { q('.inspection-loading').hidden = true; q('.inspection-error').hidden = false; stage.setAttribute('aria-busy', 'false'); } }
    finally { loading = false; }
  }
  host.addEventListener('click', event => {
    const condition = event.target.closest('[data-condition]');
    if (condition && host.contains(condition)) { showCondition(condition.dataset.condition); if (engine) engine.selectCondition(condition.dataset.condition); revealStage(); schedulePersist(); return; }
    if (event.target.closest('.model-marker')) { revealStage(); return; }
    const motionToggle = event.target.closest('[data-motion-toggle]');
    if (motionToggle && engine) {
      const id = motionToggle.dataset.motionToggle;
      const state = engine.getState();
      engine.setMotion(id, state.motions[id] > 0 ? 0 : state.motionLimits[id]?.max || 0);
      syncMotions(); schedulePersist(); return;
    }
    const preset = event.target.closest('[data-room-preset]');
    if (preset && engine && roomMode) {
      const room = roomForPreset(preset.dataset.roomPreset);
      if (room) { clearRoomValidation(); engine.setRoom(room); engine.resetCamera(); syncMotions(); schedulePersist(); }
      return;
    }
    const target = event.target.closest('[data-inspection-action]'); if (!target || !host.contains(target)) return;
    const action = target.dataset.inspectionAction;
    if (action === 'retry') { load(); return; }
    if (action === 'detail') { const detail = q('[data-inspection-detail]'); if (detail) { q('[data-condition-panel]').open = true; syncMarkers(); detail.scrollIntoView({ block: 'start', behavior: 'instant' }); detail.focus({ preventScroll: true }); } return; }
    if (action === 'return-stage') { revealStage(true); return; }
    if (!engine) return;
    if (action === 'view') { engine.setView(target.dataset.view); setPressed('[data-view]', 'view', target.dataset.view); syncMotions(); }
    else if (action === 'room-view') engine.resetCamera();
    else if (action === 'zoom-in' || action === 'zoom-out') engine.zoomBy(action === 'zoom-in' ? .8 : 1.25);
    else if (action === 'dimensions') { const next = target.getAttribute('aria-pressed') !== 'true'; if (next && selected) engine.resetCamera(); engine.setDimensionsVisible(next); target.setAttribute('aria-pressed', String(next)); }
    else if (action === 'open' || action === 'close') { engine.setStorage(action === 'open'); syncMotions(); }
    else if (action === 'reset') { engine.setStorage(false); engine.setDimensionsVisible(false); engine.resetCamera(); q('[data-inspection-action="dimensions"]').setAttribute('aria-pressed', 'false'); setPressed('[data-view]', 'view', 'overview'); syncMotions(); }
    else if (action === 'rotate-left' || action === 'rotate-right') { if (validateRoom()) engine.setRoom({ rotation: Math.max(-180, Math.min(180, lastRoom.rotation + (action === 'rotate-left' ? -15 : 15))) }); }
    else if (action === 'undo' && history.length) { const previous = history.pop(); dimensionsConfirmed = previous.dimensionsConfirmed; clearRoomValidation(); undoing = true; engine.setRoom(previous.room); undoing = false; syncMotions(); q('[data-inspection-undo]').disabled = !history.length; onToast('Posisi sebelumnya dikembalikan'); }
    else if (action === 'reset-room') { dimensionsConfirmed = sourceConfirmed; clearRoomValidation(); engine.setRoom(roomForPreset('clear')); qa('[data-room-field]').forEach(el => el.value = lastRoom[el.dataset.roomField]); engine.setStorage(false); engine.resetCamera(); syncMotions(); }
    else if (action === 'save-placement' && validateRoom()) {
      const placementReport = { ...suppliedReport, schema: 2, conditionNotes: suppliedReport.conditionNotes || [], dimensionsConfirmed };
      const preview = engine.capturePlacementPreview();
      const saved = savePlacement({ report: placementReport, room: engine.getState().roomState, ...(preview ? { preview } : {}), ...(dimensionsConfirmed && lastFit ? { fit: lastFit } : {}) });
      if (saved) { refreshSavedPositions(); q('[data-saved-details]').open = true; const durable = storageAvailable(); q('[data-saved-caption]').textContent = durable ? 'Posisi tersimpan di perangkat ini.' : 'Posisi tersimpan selama halaman ini terbuka.'; onToast(durable ? 'Posisi tersimpan' : 'Posisi tersimpan selama halaman ini terbuka'); }
      else onToast('Posisi belum dapat disimpan. Coba lagi.');
    }
    schedulePersist();
  }, { signal: controller.signal });
  host.addEventListener('input', event => {
    if (!engine) return;
    if (event.target.matches('[data-motion]')) {
      const el = event.target, kind = el.dataset.motion; engine.setMotion(kind, Number(el.value) / (kind === 'drawer' ? 100 : 1)); syncMotions();
    } else if (event.target.matches('[data-room-field]')) {
      const patch = validateRoom(); if (patch) engine.setRoom(patch);
    }
    schedulePersist();
  }, { signal: controller.signal });
  host.addEventListener('change', event => {
    if (!engine) return;
    if (event.target.matches('[data-room-field]')) { const patch = validateRoom(); if (patch) engine.setRoom(patch); }
    else if (event.target.matches('[data-room-fixture]')) { if (validateRoom()) { engine.setFixture(event.target.value); syncMotions(); } }
    else if (event.target.matches('[data-saved-placement]') && event.target.value !== '') {
      const saved = savedPlacements[Number(event.target.value)];
      if (saved) { dimensionsConfirmed = sourceConfirmed && saved.report.dimensionsConfirmed === true; clearRoomValidation(); engine.setRoom(saved.room); engine.resetCamera(); syncMotions(); q('[data-saved-caption]').textContent = dimensionsConfirmed ? 'Posisi tersimpan dibuka. Ukuran dikonfirmasi.' : 'Posisi dibuka. Ukuran belum dikonfirmasi.'; onToast('Posisi tersimpan dibuka'); }
    }
    schedulePersist();
  }, { signal: controller.signal });
  host.addEventListener('pointerup', schedulePersist, { signal: controller.signal });
  window.addEventListener('pagehide', persist, { signal: controller.signal });
  window.addEventListener('beforeunload', persist, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); }, { signal: controller.signal });
  showCondition(null);
  host.addEventListener('keydown', event => {
    if (event.target !== stage || !engine) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); engine.zoomBy(.8); }
    else if (event.key === '-') { event.preventDefault(); engine.zoomBy(1.25); }
    else if (roomMode && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); if (validateRoom()) engine.setRoom({ x: lastRoom.x + (event.key === 'ArrowRight' ? .1 : event.key === 'ArrowLeft' ? -.1 : 0), z: lastRoom.z + (event.key === 'ArrowDown' ? .1 : event.key === 'ArrowUp' ? -.1 : 0) }); }
  }, { signal: controller.signal });
  // Return disposal immediately so a tab switch can cancel this mount while assets load.
  void load();
  return cleanup;
}
