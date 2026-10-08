import './inspection.css';
import { loadViewerSession, saveViewerSession } from './viewer-state.js';
import { decodeReport, encodeReport, escapeHTML, freshReport, loadPlacements, savePlacement, storageAvailable, validateReport } from './state.js';

const conditions = [
  { id: 'scratch', title: 'Goresan pintu kiri', location: 'Permukaan depan', size: 'Panjang 11 cm', image: '/images/wear-scratch.webp', note: 'Goresan tipis terlihat pada pintu kiri. Pilih titik 1 untuk melihat letaknya.' },
  { id: 'chip', title: 'Sudut terkelupas', location: 'Sudut kanan atas', size: '8 × 5 mm', image: '/images/wear-chip.webp', note: 'Lapisan pada sudut kanan atas terkelupas. Pilih titik 2 untuk melihat lebih dekat.' },
  { id: 'mark', title: 'Bekas pada permukaan', location: 'Bagian atas', size: 'Diameter 5,5 cm', image: '/images/wear-mark.webp', note: 'Bekas berbentuk lingkaran tampak samar pada permukaan atas. Pilih titik 3 untuk melihat letaknya.' },
];
const snapshots = new Map();
const roomReports = new Map();
const ROOM_REPORT_KEY = 'lihatdulu:inspection:room-report:v1';
const guideSteps = [
  { phase: 'prepare', title: 'Siapkan barang', note: 'Letakkan barang di tempat terang. Sisakan ruang untuk bergerak mengelilinginya.' },
  { phase: 'exterior', title: 'Foto bagian luar', note: 'Ambil foto depan, sisi, belakang, dan bagian atas. Pastikan seluruh tepi barang masuk ke foto.' },
  { phase: 'interior', title: 'Foto bagian dalam', note: 'Buka pintu dan laci, lalu foto bagian dalam. Tambahkan foto dekat untuk setiap goresan atau kerusakan.' },
  { phase: 'review', title: 'Periksa hasil foto', note: 'Pastikan foto terang dan tajam. Sertakan bagian bawah, ukuran barang, dan catatan kondisi.' },
];
const button = (label, action, extra = '') => `<button type="button" class="inspection-button" data-inspection-action="${action}" ${extra}>${label}</button>`;
const motionControls = () => `<div class="inspection-motion"><div class="inspection-section-heading"><h3>Pintu & laci</h3><div class="inspection-inline-actions">${button('Buka semua', 'open', 'data-engine-control disabled')}${button('Tutup semua', 'close', 'data-engine-control disabled')}</div></div>${[['left', 'Pintu kiri', 100, '°', 1], ['right', 'Pintu kanan', 100, '°', 1], ['drawer', 'Laci', 30, ' cm', 1]].map(([id, name, max, unit, step]) => `<label class="inspection-slider"><span>${name}<output data-motion-output="${id}">0${unit}</output></span><input type="range" min="0" max="${max}" step="${step}" value="0" data-motion="${id}" aria-label="${name}, ${id === 'drawer' ? 'sentimeter' : 'derajat'}" data-engine-control disabled></label>`).join('')}</div>`;
const evidence = () => `<aside class="inspection-evidence" data-inspection-pane><div class="inspection-section-heading"><h3>Detail kondisi</h3><span class="inspection-count">3 detail</span></div><p class="inspection-help">Pilih foto atau titik pada barang.</p><div class="inspection-condition-list">${conditions.map((c, i) => `<button type="button" class="inspection-condition" data-condition="${c.id}" aria-pressed="false"><img src="${c.image}" alt="" width="72" height="56"><span><strong>${c.title}</strong><small>${c.location}</small></span><b aria-hidden="true">${i + 1}</b></button>`).join('')}</div><div class="inspection-detail" data-inspection-detail tabindex="-1"><img src="/images/wear-scratch.webp" alt="Goresan tipis pada permukaan pintu kiri" width="560" height="420"><h4>Goresan pintu kiri</h4><p>Goresan tipis terlihat pada pintu kiri.</p><span>Panjang 11 cm</span></div></aside>`;
const roomPane = () => `<aside class="inspection-room" data-inspection-pane><h3>Ukuran ruangan</h3><div class="inspection-fields">${[['width', 'Lebar', 3.2, 1.2, 10], ['depth', 'Panjang', 3, 1, 10]].map(([id, label, value, min, max]) => `<label>${label}<span class="inspection-input-unit"><input type="number" value="${value}" min="${min}" max="${max}" step="0.1" inputmode="decimal" data-room-field="${id}" aria-label="${label} ruangan dalam meter" data-engine-control disabled><span>m</span></span></label>`).join('')}</div><p class="inspection-validation" data-room-validation role="status"></p><div class="inspection-outcomes" aria-live="polite" aria-atomic="true"><div data-placement="body"><span>Badan furnitur</span><strong>Menunggu ukuran</strong></div><div data-placement="doors"><span>Bukaan pintu</span><strong>Menunggu ukuran</strong></div><div data-placement="drawer"><span>Bukaan laci</span><strong>Menunggu ukuran</strong></div></div><p class="inspection-help" data-placement-source>Berdasarkan ukuran ruangan dan barang: 90 × 47,5 × 120 cm.</p><h3>Posisi barang</h3><p class="inspection-help">Geser barang di ruang atau ubah posisi berikut.</p><div class="inspection-fields">${[['x', 'Kiri / kanan', 0], ['z', 'Depan / belakang', -.4]].map(([id, label, value]) => `<label>${label}<span class="inspection-input-unit"><input type="number" value="${value}" min="-10" max="10" step="0.1" inputmode="decimal" data-room-field="${id}" aria-label="Posisi ${label.toLowerCase()} dalam meter" data-engine-control disabled><span>m</span></span></label>`).join('')}</div><label class="inspection-rotation">Putaran<span class="inspection-input-unit"><input type="number" value="0" min="-180" max="180" step="15" data-room-field="rotation" aria-label="Putaran barang dalam derajat" data-engine-control disabled><span>°</span></span></label><div class="inspection-inline-actions">${button('Putar kiri', 'rotate-left', 'data-engine-control disabled')}${button('Putar kanan', 'rotate-right', 'data-engine-control disabled')}</div><label class="inspection-fixture">Periksa jarak bukaan<select data-room-fixture aria-label="Penghalang di ruangan" data-engine-control disabled><option value="clear">Tanpa penghalang</option><option value="door">Penghalang di depan pintu</option><option value="drawer">Penghalang di depan laci</option><option value="wall">Dekat dinding kanan</option></select></label><div class="inspection-inline-actions">${button('Urungkan', 'undo', 'data-inspection-undo disabled')}${button('Atur ulang ruang', 'reset-room', 'data-engine-control disabled')}</div><section class="inspection-saved-positions"><div class="inspection-section-heading"><h3>Posisi tersimpan</h3>${button('Simpan posisi', 'save-placement', 'data-engine-control disabled')}</div><label>Pilih posisi<select data-saved-placement disabled><option value="">Pilih posisi tersimpan</option></select></label><p class="inspection-help" data-saved-caption>Simpan posisi untuk dibuka kembali nanti.</p></section></aside>`;
const guidePane = (direct = false) => `<aside class="inspection-guide" data-inspection-guide ${direct ? '' : 'hidden'}><div class="inspection-section-heading"><h3>Cara foto barang</h3>${direct ? '<a class="inspection-button" href="/barang/sora?tab=condition" data-nav>Lihat kondisi</a>' : button('Tutup', 'guide-close', 'aria-label="Tutup panduan foto"')}</div><p class="inspection-help">Ikuti panduan sudut foto saat memotret barangmu.</p><div class="inspection-guide-steps">${guideSteps.map((s, i) => `<button type="button" data-guide-step="${i}" class="inspection-guide-step" aria-pressed="${i === 0}" data-engine-control disabled><span>${i + 1}</span>${s.title}</button>`).join('')}</div><h4 data-guide-title>Siapkan barang</h4><p data-guide-note>${guideSteps[0].note}</p><label class="inspection-guide-area">Sudut foto<select data-guide-area disabled><option value="front">Depan</option><option value="left">Sisi kiri</option><option value="right">Sisi kanan</option><option value="rear">Belakang</option><option value="top">Bagian atas</option><option value="underside">Bagian bawah</option><option value="interior">Bagian dalam</option><option value="drawer">Laci</option><option value="scratch">Goresan</option></select></label><div class="inspection-inline-actions">${button('Sebelumnya', 'guide-prev', 'disabled')}${button('Berikutnya', 'guide-next', 'data-engine-control disabled')}</div><p class="inspection-help">Untuk menambahkan foto barangmu, buka Jual furnitur.</p></aside>`;

export function renderInspection(mode = 'condition') {
  const room = mode === 'room';
  const directGuide = mode === 'guide';
  return `<section class="inspection${directGuide ? ' inspection-guiding' : ''}" data-inspection-mode="${mode}" aria-label="${directGuide ? 'Panduan foto furnitur' : room ? 'Coba furnitur di ruangan' : 'Periksa kondisi furnitur'}"><div class="inspection-heading"><div><h2>${directGuide ? 'Foto yang membantu pembeli' : room ? 'Coba di ruangmu' : 'Kenali setiap detail'}</h2><p>${directGuide ? 'Lihat sudut foto yang perlu disiapkan sebelum menjual furnitur.' : room ? 'Masukkan ukuran, lalu periksa ruang untuk pintu dan laci.' : 'Putar barang, buka penyimpanannya, dan lihat kondisi lebih dekat.'}</p></div>${button('Cara foto barang', 'guide', 'data-engine-control disabled')}</div><div class="inspection-layout"><div class="inspection-main"><div class="inspection-stage" data-inspection-stage aria-busy="true" tabindex="0" aria-label="Tampilan 3D lemari Sora. Gunakan tombol di bawah untuk mengubah tampilan."><img class="inspection-poster" src="/images/cabinet-closed.webp" alt="Lemari Sora dengan dua pintu dan satu laci" width="1000" height="1000"><div class="inspection-loading" role="status"><span class="inspection-loading-dot" aria-hidden="true"></span><p data-loading-label>Menyiapkan tampilan 3D…</p><progress max="1" value="0" aria-label="Memuat tampilan 3D"></progress></div><div class="inspection-error" hidden><strong>Tampilan 3D belum tersedia</strong><p>Foto dan detail kondisi tetap dapat dilihat. Coba muat kembali.</p>${button('Coba lagi', 'retry')}</div></div><div class="inspection-toolbar" aria-label="Kontrol tampilan"><div class="inspection-view-actions">${room ? button('Lihat ruang', 'room-view', 'data-engine-control disabled') : [['front', 'Depan'], ['rear', 'Belakang'], ['top', 'Atas']].map(([id, label]) => button(label, 'view', `data-view="${id}" data-engine-control disabled aria-pressed="false"`)).join('')}${room ? '' : button('Lihat foto detail', 'detail', 'data-inspection-detail-jump hidden')}</div><div class="inspection-camera-actions">${button('−', 'zoom-out', 'aria-label="Perkecil tampilan" data-engine-control disabled')}${button('+', 'zoom-in', 'aria-label="Perbesar tampilan" data-engine-control disabled')}${button('Ukuran', 'dimensions', 'aria-pressed="false" data-engine-control disabled')}${button('Atur ulang', 'reset', 'aria-label="Atur ulang tampilan dan bukaan" data-engine-control disabled')}</div></div><p class="inspection-canvas-help">${room ? 'Geser barang untuk memindahkan. Geser ruang untuk melihat dari sudut lain.' : 'Geser untuk memutar. Cubit atau gunakan tombol + dan − untuk memperbesar.'}</p>${motionControls()}</div>${directGuide ? evidence().replace('data-inspection-pane', 'data-inspection-pane hidden') : room ? roomPane() : evidence()}${guidePane(directGuide)}</div></section>`;
}

export async function mountInspection(root, { mode = 'condition', onToast = () => {}, report = null } = {}) {
  const host = root.querySelector('.inspection');
  if (!host) return () => {};
  const stage = host.querySelector('[data-inspection-stage]');
  const controller = new AbortController();
  let disposed = false, engine = null, loading = false, selected = null, guide = false, guideStep = 0, guideSnapshot = null, lastRoom = null, lastFit = null, undoing = false, persistTimer = null;
  const viewerKey = `inspection-sora-${mode}`;
  const defaultReport = { ...freshReport(), schema: 2, dimensionsConfirmed: true, conditionNotes: conditions.map(({ id, note }) => ({ id, note })) };
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
  if (mode === 'guide') {
    const returnLink = q('.inspection-guide a');
    if (returnLink) returnLink.setAttribute('href', `/barang/sora?tab=condition${location.hash}`);
  }
  function showCondition(id) {
    selected = conditions.some(c => c.id === id) ? id : null;
    setPressed('[data-condition]', 'condition', selected);
    const c = conditions.find(c => c.id === selected) || conditions[0];
    const detail = q('[data-inspection-detail]');
    const jump = q('[data-inspection-detail-jump]');
    if (jump) jump.hidden = !selected;
    const note = suppliedReport.conditionNotes?.find(entry => entry.id === c.id)?.note ?? c.note;
    if (detail) detail.innerHTML = `<img src="${c.image}" alt="${c.title}, ${c.location.toLowerCase()}" width="560" height="420"><h4>${c.title}</h4><p>${escapeHTML(note)}</p><span>${c.size}</span>${button('Kembali ke barang', 'return-stage', 'data-inspection-return-stage')}`;
    if (selected && engine) { engine.setDimensionsVisible(false); q('[data-inspection-action="dimensions"]').setAttribute('aria-pressed', 'false'); }
  }
  function syncMotions() {
    if (!engine) return;
    const { motions } = engine.getState();
    qa('[data-motion]').forEach(el => { const value = el.dataset.motion === 'drawer' ? Math.round(motions.drawer * 100) : Math.round(motions[el.dataset.motion]); el.value = value; q(`[data-motion-output="${el.dataset.motion}"]`).textContent = `${value}${el.dataset.motion === 'drawer' ? ' cm' : '°'}`; });
  }
  function placement({ state, result }) {
    if (!alive() || !roomMode) return;
    if (lastRoom && !undoing && (JSON.stringify(lastRoom) !== JSON.stringify(state) || lastRoomConfirmed !== dimensionsConfirmed)) { history.push({ room: { ...lastRoom }, dimensionsConfirmed: lastRoomConfirmed }); if (history.length > 25) history.shift(); }
    lastRoom = { ...state };
    lastRoomConfirmed = dimensionsConfirmed;
    lastFit = { closedFits: result.closedFits, doorsClear: result.doorsClear, drawerClear: result.drawerClear };
    qa('[data-room-field]').forEach(el => { if (document.activeElement !== el) el.value = state[el.dataset.roomField]; });
    q('[data-room-fixture]').value = state.fixture;
    q('[data-inspection-undo]').disabled = !history.length;
    const savedIndex = savedPlacements.findIndex(value => JSON.stringify(value.room) === JSON.stringify(state) && (value.report.dimensionsConfirmed === true) === dimensionsConfirmed);
    const positionSelect = q('[data-saved-placement]');
    if (positionSelect.value && savedIndex < 0) q('[data-saved-caption]').textContent = 'Posisi telah diubah. Simpan untuk dibuka kembali nanti.';
    positionSelect.value = savedIndex < 0 ? '' : String(savedIndex);
    q('[data-placement-source]').textContent = dimensionsConfirmed ? 'Berdasarkan ukuran ruangan dan barang: 90 × 47,5 × 120 cm.' : 'Ukuran barang belum dikonfirmasi. Konfirmasi ukuran sebelum menilai kecocokan ruang.';
    if (!dimensionsConfirmed) { qa('[data-placement]').forEach(el => { delete el.dataset.clear; el.querySelector('strong').textContent = 'Ukuran belum dikonfirmasi'; }); schedulePersist(); return; }
    const entries = [['body', result.closedFits, 'Ukuran muat', 'Ukuran melewati ruang'], ['doors', result.doorsClear, 'Pintu bisa dibuka', 'Pintu terhalang'], ['drawer', result.drawerClear, 'Laci bisa dibuka', 'Laci terhalang']];
    entries.forEach(([key, clear, yes, no]) => { const el = q(`[data-placement="${key}"]`); el.dataset.clear = String(clear); el.querySelector('strong').textContent = `${clear ? '✓' : '!'} ${clear ? yes : no}`; });
    schedulePersist();
  }
  function validateRoom() {
    const inputs = qa('[data-room-field]');
    const invalid = inputs.find(el => el.value.trim() === '' || !el.validity.valid || !Number.isFinite(Number(el.value)));
    inputs.forEach(el => el.setAttribute('aria-invalid', String(el === invalid)));
    q('[data-room-validation]').textContent = invalid ? `Isi ${invalid.closest('label').childNodes[0].textContent.toLowerCase()} antara ${invalid.min} dan ${invalid.max}.` : '';
    if (invalid) qa('[data-placement]').forEach(el => { delete el.dataset.clear; el.querySelector('strong').textContent = 'Periksa ukuran dan posisi'; });
    return invalid ? null : Object.fromEntries(inputs.map(el => [el.dataset.roomField, Number(el.value)]));
  }
  function updateGuide() {
    const step = guideSteps[guideStep];
    qa('[data-guide-step]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.guideStep) === guideStep)));
    q('[data-guide-title]').textContent = step.title; q('[data-guide-note]').textContent = step.note;
    q('[data-inspection-action="guide-prev"]').disabled = guideStep === 0;
    q('[data-inspection-action="guide-next"]').disabled = guideStep === guideSteps.length - 1;
    const select = q('[data-guide-area]');
    select.disabled = guideStep === 0 || guideStep === 3;
    engine.setCaptureScene({ phase: step.phase, area: select.value, progress: guideStep / 3 });
  }
  function goGuideStep(next) {
    guideStep = Math.max(0, Math.min(guideSteps.length - 1, next));
    q('[data-guide-area]').value = guideStep === 2 ? 'interior' : 'front';
    updateGuide();
  }
  function closeGuide() {
    if (!guide || !engine) return;
    guide = false; host.classList.remove('inspection-guiding'); q('[data-inspection-guide]').hidden = true; q('[data-inspection-pane]').hidden = false;
    engine.leaveCaptureScene(); if (guideSnapshot) engine.restoreViewState(guideSnapshot); syncMotions();
    q('[data-inspection-action="guide"]').focus();
  }
  function persist() {
    if (!engine) return;
    const snapshot = guide && mode !== 'guide' && guideSnapshot ? guideSnapshot : engine.captureViewState();
    if (!snapshot) return;
    snapshots.set(mode, snapshot);
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
  function revealStage() {
    if (!matchMedia('(max-width: 767px)').matches) return;
    stage.scrollIntoView({ block: 'start', behavior: 'instant' });
    stage.focus({ preventScroll: true });
  }
  function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { if (alive()) persist(); }, 800);
  }
  function refreshSavedPositions() {
    if (!roomMode) return;
    savedPlacements = loadPlacements();
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
  };
  async function load() {
    if (loading || !alive()) return;
    loading = true; q('.inspection-error').hidden = true; q('.inspection-loading').hidden = false; stage.setAttribute('aria-busy', 'true');
    try {
      const { createEngine } = await import('./engine.js');
      if (!alive()) return;
      const created = await createEngine(stage, { onInteraction: schedulePersist, onCondition: id => { if (alive() && (engine || id)) { showCondition(id); schedulePersist(); } }, onPlacement: placement, onLoadProgress: value => { if (!alive()) return; const progress = q('progress'); if (value === null) progress.removeAttribute('value'); else progress.value = value; q('[data-loading-label]').textContent = value > 0 ? `Menyiapkan tampilan 3D… ${Math.round(value * 100)}%` : 'Menyiapkan tampilan 3D…'; } });
      if (!alive()) { created.dispose(); return; }
      engine = created;
      const pendingCondition = selected;
      const saved = snapshots.get(mode) || loadViewerSession(viewerKey)?.freeView;
      const activeRoomReport = roomMode && saved ? readRoomReport() : null;
      if (activeRoomReport) dimensionsConfirmed = activeRoomReport.dimensionsConfirmed === true;
      if (saved && saved.inRoom === roomMode && saved.captureScene.active === (mode === 'guide')) engine.restoreViewState(saved); else if (roomMode) engine.enterRoom();
      if (pendingCondition) engine.selectCondition(pendingCondition);
      syncMotions();
      qa('[data-engine-control]').forEach(el => el.disabled = false);
      if (mode === 'guide') { guide = true; guideStep = Math.max(0, guideSteps.findIndex(step => step.phase === engine.getState().captureScene.phase)); q('[data-guide-area]').value = engine.getState().captureScene.area; updateGuide(); }
      else { const state = engine.getState(); q('[data-inspection-action="dimensions"]').setAttribute('aria-pressed', String(state.dimensionsVisible)); setPressed('[data-view]', 'view', state.view); }
      refreshSavedPositions();
      q('.inspection-loading').hidden = true; q('.inspection-poster').hidden = true; stage.setAttribute('aria-busy', 'false');
      const canvas = stage.querySelector('canvas'); if (canvas) canvas.setAttribute('aria-hidden', 'true');
    } catch { if (alive()) { q('.inspection-loading').hidden = true; q('.inspection-error').hidden = false; stage.setAttribute('aria-busy', 'false'); } }
    finally { loading = false; }
  }
  host.addEventListener('click', event => {
    const condition = event.target.closest('[data-condition]');
    if (condition && host.contains(condition)) { showCondition(condition.dataset.condition); if (engine) engine.selectCondition(condition.dataset.condition); revealStage(); schedulePersist(); return; }
    if (event.target.closest('.model-marker')) { revealStage(); return; }
    const step = event.target.closest('[data-guide-step]'); if (step && engine) { goGuideStep(Number(step.dataset.guideStep)); schedulePersist(); return; }
    const target = event.target.closest('[data-inspection-action]'); if (!target || !host.contains(target)) return;
    const action = target.dataset.inspectionAction;
    if (action === 'retry') { load(); return; }
    if (action === 'detail') { const detail = q('[data-inspection-detail]'); if (detail) { detail.scrollIntoView({ block: 'start', behavior: 'instant' }); detail.focus({ preventScroll: true }); } return; }
    if (action === 'return-stage') { revealStage(); return; }
    if (!engine) return;
    if (action === 'guide') { guideSnapshot = engine.captureViewState(); guide = true; guideStep = 0; host.classList.add('inspection-guiding'); q('[data-inspection-guide]').hidden = false; q('[data-inspection-pane]').hidden = true; updateGuide(); q('[data-inspection-action="guide-close"]').focus(); }
    else if (action === 'guide-close') closeGuide();
    else if (action === 'guide-prev' || action === 'guide-next') goGuideStep(guideStep + (action === 'guide-next' ? 1 : -1));
    else if (action === 'view') { engine.setView(target.dataset.view); setPressed('[data-view]', 'view', target.dataset.view); }
    else if (action === 'room-view') engine.resetCamera();
    else if (action === 'zoom-in' || action === 'zoom-out') engine.zoomBy(action === 'zoom-in' ? .8 : 1.25);
    else if (action === 'dimensions') { const next = target.getAttribute('aria-pressed') !== 'true'; if (next && selected) engine.resetCamera(); engine.setDimensionsVisible(next); target.setAttribute('aria-pressed', String(next)); }
    else if (action === 'open' || action === 'close') { engine.setStorage(action === 'open'); syncMotions(); }
    else if (action === 'reset') { engine.setStorage(false); engine.setDimensionsVisible(false); engine.resetCamera(); q('[data-inspection-action="dimensions"]').setAttribute('aria-pressed', 'false'); setPressed('[data-view]', 'view', 'overview'); syncMotions(); }
    else if (action === 'rotate-left' || action === 'rotate-right') { if (validateRoom()) engine.setRoom({ rotation: Math.max(-180, Math.min(180, lastRoom.rotation + (action === 'rotate-left' ? -15 : 15))) }); }
    else if (action === 'undo' && history.length) { const previous = history.pop(); dimensionsConfirmed = previous.dimensionsConfirmed; undoing = true; engine.setRoom(previous.room); undoing = false; syncMotions(); q('[data-inspection-undo]').disabled = !history.length; onToast('Posisi sebelumnya dikembalikan'); }
    else if (action === 'reset-room') { dimensionsConfirmed = sourceConfirmed; qa('[data-room-field]').forEach(el => el.removeAttribute('aria-invalid')); q('[data-room-validation]').textContent = ''; engine.setRoom({ width: 3.2, depth: 3, x: 0, z: -.4, rotation: 0, fixture: 'clear' }); qa('[data-room-field]').forEach(el => el.value = lastRoom[el.dataset.roomField]); engine.setStorage(false); engine.resetCamera(); syncMotions(); }
    else if (action === 'save-placement' && validateRoom()) {
      const placementReport = { ...suppliedReport, schema: 2, conditionNotes: suppliedReport.conditionNotes || [], dimensionsConfirmed };
      const preview = engine.capturePlacementPreview();
      const saved = savePlacement({ report: placementReport, room: engine.getState().roomState, ...(preview ? { preview } : {}), ...(dimensionsConfirmed && lastFit ? { fit: lastFit } : {}) });
      if (saved) { refreshSavedPositions(); const durable = storageAvailable(); q('[data-saved-caption]').textContent = durable ? 'Posisi tersimpan di perangkat ini.' : 'Posisi tersimpan selama halaman ini terbuka.'; onToast(durable ? 'Posisi tersimpan' : 'Posisi tersimpan selama halaman ini terbuka'); }
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
    else if (event.target.matches('[data-guide-area]')) updateGuide();
    else if (event.target.matches('[data-saved-placement]') && event.target.value !== '') {
      const saved = savedPlacements[Number(event.target.value)];
      if (saved) { dimensionsConfirmed = saved.report.dimensionsConfirmed === true; engine.setRoom(saved.room); engine.resetCamera(); syncMotions(); q('[data-saved-caption]').textContent = dimensionsConfirmed ? 'Posisi tersimpan dibuka. Ukuran dikonfirmasi.' : 'Posisi dibuka. Ukuran belum dikonfirmasi.'; onToast('Posisi tersimpan dibuka'); }
    }
    schedulePersist();
  }, { signal: controller.signal });
  host.addEventListener('pointerup', schedulePersist, { signal: controller.signal });
  window.addEventListener('pagehide', persist, { signal: controller.signal });
  window.addEventListener('beforeunload', persist, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); }, { signal: controller.signal });
  showCondition(null);
  host.addEventListener('keydown', event => {
    if (event.key === 'Escape' && guide && mode !== 'guide') { closeGuide(); return; }
    if (event.target !== stage || !engine || guide) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); engine.zoomBy(.8); }
    else if (event.key === '-') { event.preventDefault(); engine.zoomBy(1.25); }
    else if (roomMode && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); if (validateRoom()) engine.setRoom({ x: lastRoom.x + (event.key === 'ArrowRight' ? .1 : event.key === 'ArrowLeft' ? -.1 : 0), z: lastRoom.z + (event.key === 'ArrowDown' ? .1 : event.key === 'ArrowUp' ? -.1 : 0) }); }
  }, { signal: controller.signal });
  // Return disposal immediately so a tab switch can cancel this mount while assets load.
  void load();
  return cleanup;
}
