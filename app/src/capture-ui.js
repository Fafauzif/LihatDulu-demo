import { CAPTURE_AREAS } from './capture.js';
import { conditions } from './data.js';
import { header, nav, button, image, icon, pill, esc } from './ui.js';

const phases = [['prepare','Persiapan'],['capture','Rekam area'],['review','Tinjau bukti'],['ready','Bagikan']];
const areaLabels = {pending:'Belum direkam',captured:'Terekam',skipped:'Dilewati',retake:'Perlu ulang'};
const capturedCount = session => CAPTURE_AREAS.filter(area=>session.areas[area.id]==='captured').length;

function progress(session) {
  const captured = capturedCount(session);
  return `<div class="capture-progress"><span>Dokumentasi area</span><strong>${captured}/9</strong><div class="small-progress"><i style="width:${captured/9*100}%"></i></div></div>`;
}

function captureStepper(session) {
  const current = phases.findIndex(([id])=>id===session.phase);
  return `<nav class="capture-stepper" aria-label="Langkah pembuatan laporan">${phases.map(([id,label],i)=>`<button class="capture-step ${i===current?'active':''} ${i<current?'done':''}" data-phase="${id}" ${i>current?'disabled':''} ${i===current?'aria-current="step"':''}><span>${i<current?icon('check'):i+1}</span><strong>${label}</strong></button>`).join('')}</nav>`;
}

function mobileHeader(session) {
  const phase = phases.findIndex(([id])=>id===session.phase);
  return `<header class="mobile-workspace-header">${nav('Keluar','/platform','workspace-back')}<div class="mobile-workspace-title"><strong>${session.phase==='ready'?'Bagikan laporan':'Rekam barang'}</strong><small>${phase+1}/4 · ${phases[phase][1]}</small></div><span class="mobile-workspace-meta">${capturedCount(session)}/9 area</span></header>`;
}

function prepare(session) {
  return `<div class="prepare-layout"><section class="prepare-form"><span class="eyebrow">LANGKAH 01 / PERSIAPAN</span><h2>Mulai dari barangnya.</h2><p class="lead-copy">Siapkan cahaya yang cukup dan ruang untuk melihat setiap sisi.</p><label class="field">Nama laporan<input id="report-name" aria-label="Nama laporan" maxlength="80" required value="${esc(session.report.name)}"></label><label class="field">Catatan pemilik<textarea id="report-note" aria-label="Catatan pemilik" maxlength="1200" rows="3" placeholder="Ceritakan pemakaian atau hal yang perlu diperhatikan.">${esc(session.report.note)}</textarea></label><div class="prep-checklist"><h3>Sebelum merekam</h3><div>${icon('sun')}<span><strong>Cahaya merata</strong><small>Hindari pantulan terang dan bayangan yang menutupi detail.</small></span></div><div>${icon('room')}<span><strong>Sisi barang dapat dijangkau</strong><small>Tandai area yang tidak bisa kamu dokumentasikan.</small></span></div><div>${icon('camera')}<span><strong>Bentuk dulu, detail kemudian</strong><small>Rekam bagian luar. Ambil foto dalam dan bekas pemakaian secara terpisah.</small></span></div></div><div class="notice neutral">${icon('info')}<p>Demo ini memakai gambar dan model Lemari Sora. Perekaman tidak mengaktifkan kamera perangkat.</p></div></section><aside class="prepare-preview">${image('room-cabinet-detail','Lemari Sora siap direkam dalam ruang','',true)}<div class="prepare-preview-caption"><span class="eyebrow">BARANG CONTOH</span><h3>Lemari Sora</h3><p>90 × 47,5 × 120 cm · 2 pintu, 1 laci</p>${pill('9 area dokumentasi')}</div></aside></div>`;
}

function areaList(session, group) {
  return CAPTURE_AREAS.filter(x=>x.group===group).map(area=>`<button class="area-row ${session.activeArea===area.id?'active':''} ${session.areas[area.id]}" data-area="${area.id}" aria-current="${session.activeArea===area.id?'step':'false'}"><span class="area-thumb">${session.areas[area.id]==='captured'?image(area.image,area.label):icon(session.areas[area.id]==='retake'?'reset':'camera')}</span><span><strong>${area.label}</strong><small>${areaLabels[session.areas[area.id]]}</small></span><span class="area-status">${icon(session.areas[area.id]==='captured'?'check':session.areas[area.id]==='retake'?'reset':'camera')}</span></button>`).join('');
}

function groupedAreaList(session) {
  return `<div class="area-group-title"><h4>Bagian luar</h4><span>7 area</span></div>${areaList(session,'exterior')}<div class="area-group-title"><h4>Bagian dalam</h4><span>2 area</span></div>${areaList(session,'interior')}`;
}

export function captureAreaPickerHTML(session) {
  return `<div class="capture-area-picker"><span class="eyebrow">PILIH AREA</span><h2>Rekam sesuai kebutuhanmu.</h2><p>Area yang dilewati atau perlu diulang tetap ditandai sebagai bukti yang belum tersedia.</p>${progress(session)}<div class="area-checklist">${groupedAreaList(session)}</div></div>`;
}

function capture(session) {
  const area = CAPTURE_AREAS.find(x=>x.id===session.activeArea) || CAPTURE_AREAS[0];
  const status = session.areas[area.id];
  const captured = CAPTURE_AREAS.filter(x=>session.areas[x.id]==='captured');
  const index = CAPTURE_AREAS.findIndex(x=>x.id===area.id);
  const guide = status==='captured'?icon('check')+' Foto contoh tersimpan':status==='retake'?icon('reset')+' Ambil ulang foto yang jelas':status==='skipped'?icon('info')+' Area dilewati · belum ada bukti':icon('camera')+' Jaga area tetap di dalam bingkai';
  return `<div class="recording-layout"><section class="recording-visual"><div class="recording-top"><div><span class="eyebrow">AREA ${index+1} / 9 · SIMULASI</span><h2>${area.label}</h2></div><div class="recording-shortcuts">${button(icon('grid')+' Pilih area','area-picker','secondary small recording-area-picker')}${button(icon('report'),'review-capture','icon-only quiet','aria-label="Tinjau rekaman"')}</div></div><div class="phone-camera"><div class="camera-topbar"><span>${icon('camera')} LIHATDULU</span><span class="camera-simulation">SIMULASI</span></div><div class="camera-feed ${status==='retake'?'retake':''}">${image(area.image,area.label,'',true)}<div class="camera-frame"><i></i><i></i><i></i><i></i></div><div class="camera-guide">${guide}</div><span class="camera-photo-label">TAMPILAN DARI FOTO CONTOH</span></div><div class="camera-controls"><span class="last-capture" aria-label="${captured.length} foto tersimpan">${captured.length?image(captured.at(-1).image,'Foto terakhir'):icon('report')}<span>${captured.length}</span></span><span class="camera-status">${areaLabels[status]}</span><span class="camera-area-count">${index+1}/9</span></div></div><p class="recording-note">${icon('info')} ${area.hint}</p><p class="recording-simulation-note">Foto dan model dalam demo sudah disiapkan. Kamera perangkat tidak aktif.</p></section><aside class="capture-area-panel">${progress(session)}<div class="area-guidance"><span class="eyebrow">AREA YANG DIPILIH</span><h3>${area.label}</h3><p>${area.hint}</p>${status==='retake'?'<div class="inline-warning">Foto sebelumnya perlu diambil ulang agar detail terlihat jelas.</div>':status==='skipped'?'<div class="inline-warning">Area ini dilewati dan tidak dihitung sebagai bukti foto.</div>':''}</div><div class="area-checklist">${groupedAreaList(session)}</div><div class="capture-panel-footer">${button('Contoh foto buram','blur-example','text-button')}</div></aside></div>`;
}

function review(session, reviewTab) {
  const captured = CAPTURE_AREAS.filter(x=>session.areas[x.id]==='captured');
  const missing = CAPTURE_AREAS.filter(x=>session.areas[x.id]!=='captured');
  return `<div class="review-layout"><section class="review-main"><span class="eyebrow">LANGKAH 03 / TINJAU BUKTI</span><h2>Periksa sebelum dibagikan.</h2><p class="lead-copy">Simpan foto yang jelas. Tambahkan catatan yang menjelaskan kondisi barang.</p><nav class="capture-review-tabs" aria-label="Bagian tinjauan">${[['photos','Foto area'],['notes','Kondisi'],['size','Ukuran']].map(([id,label])=>`<button data-review-tab="${id}" class="review-tab-button ${reviewTab===id?'active':''}" aria-pressed="${reviewTab===id}">${label}</button>`).join('')}</nav><section class="review-photos-panel" data-review-panel="photos"><div class="section-title"><h3>Foto area</h3>${pill(`${captured.length}/9 terekam`,missing.length?'amber':'success')}</div><div class="review-photo-grid">${CAPTURE_AREAS.map(area=>`<article class="review-photo ${session.areas[area.id]==='captured'?'':'missing'}">${session.areas[area.id]==='captured'?`<button data-image="${area.id}" aria-label="Lihat foto ${area.label}">${image(area.image,area.label)}</button>`:`<div class="review-missing">${icon(session.areas[area.id]==='retake'?'reset':'camera')}</div>`}<div><strong>${area.label}</strong><small>${areaLabels[session.areas[area.id]]}</small><button data-retake="${area.id}" class="text-button">${session.areas[area.id]==='captured'?'Ambil ulang':'Rekam area'}</button></div></article>`).join('')}</div>${missing.length?`<div class="notice amber">${icon('info')}<div><strong>${missing.length} area belum memiliki bukti</strong><p>${missing.map(a=>a.label).join(', ')}. Area ini tetap terlihat sebagai dokumentasi yang belum lengkap pada laporan pembeli.</p></div></div>`:`<div class="notice neutral">${icon('check')}<p>9 area contoh sudah direkam. Periksa foto dan catatan sebelum membagikan laporan.</p></div>`}</section><section class="review-notes-panel" data-review-panel="notes"><div class="section-title spaced"><h3>Catatan kondisi</h3>${pill('Bukti contoh')}</div><p class="section-description">Foto detail berikut berasal dari model contoh. Kamu dapat mengubah catatannya.</p><div class="editable-conditions">${conditions.map(c=>`<article class="editable-condition">${image(c.image,c.title)}<div><h4>${c.short}</h4><p>${c.location} · ${c.size}</p><label class="field">Catatan ${c.short.toLowerCase()}<textarea aria-label="Catatan ${c.short.toLowerCase()}" data-condition-note="${c.id}" maxlength="600" rows="3">${esc(session.report.conditionNotes.find(n=>n.id===c.id)?.note||'')}</textarea></label></div></article>`).join('')}</div></section></section><aside class="review-summary" data-review-panel="size"><span class="eyebrow">RINGKASAN LAPORAN</span>${image('cabinet-closed','Pratinjau model Lemari Sora')}<h3>${esc(session.report.name)}</h3>${progress(session)}<div class="summary-dimensions"><strong>90 × 47,5 × 120 <span>cm</span></strong><small>Ukuran tertutup, termasuk handle</small></div><dl class="compact-facts review-size-facts"><div><dt>Bukaan pintu</dt><dd>Hingga 100°</dd></div><div><dt>Tarikan laci</dt><dd>Hingga 30 cm</dd></div></dl><label class="confirm-check"><input id="dimensions-confirmed" type="checkbox" ${session.report.dimensionsConfirmed?'checked':''}><span><strong>Konfirmasi ukuran contoh</strong><small>Tandai bahwa ukuran model sudah kamu tinjau dalam demo.</small></span></label><p class="fine-print">Konfirmasi ini opsional dan merupakan pernyataan pemilik dalam demo. Barang asli perlu diukur kembali.</p></aside></div>`;
}

export function shareResultHTML(url) {
  return `<label class="field">Tautan laporan<input aria-label="Tautan laporan" readonly value="${esc(url)}"></label>${button(icon('link')+' Salin tautan','copy-link','secondary full')}<p class="fine-print">Tautan menyimpan salinan laporan saat dibuat. Perubahan berikutnya menghasilkan tautan baru.</p>`;
}

function ready(session, shareURL) {
  const missing = 9-session.report.views.length;
  return `<div class="share-layout"><section class="share-card"><span class="share-check">${icon('check')}</span><span class="eyebrow">LANGKAH 04 / BAGIKAN</span><h2>Laporan siap dilihat.</h2><p>Pembeli dapat melihat dokumentasi, memeriksa detail, dan mencoba barang di ruangnya.</p><div class="share-item">${image('cabinet-closed','Lemari Sora')}<div><h3>${esc(session.report.name)}</h3><span>${session.report.views.length}/9 area · 3 detail kondisi</span></div></div><div id="share-result">${shareURL?shareResultHTML(shareURL):button(icon('link')+' Buat tautan laporan','make-link','primary full')}</div><p class="fine-print">${missing?`${missing} area belum didokumentasikan dan tetap ditandai pada laporan.`:'Seluruh 9 area contoh sudah direkam.'}</p></section><aside class="share-preview">${image('room-cabinet-hero','Lemari Sora dalam ruang')}<div><span class="eyebrow">DARI PENJUAL KE PEMBELI</span><h3>Satu barang,<br>bukti yang bisa diperiksa.</h3><p>${missing?`${missing} area belum didokumentasikan. Laporan akan menampilkan kekurangan tersebut.`:'Dokumentasi contoh lengkap. Bukti foto dan catatan tetap dapat diperiksa.'}</p><span>${icon('eye')} Bukti foto</span><span>${icon('cube')} Model contoh 3D</span><span>${icon('room')} Penempatan ruang</span></div></aside></div>`;
}

function actionDock(session) {
  let summary = '', actions = '';
  if(session.phase==='prepare') {
    summary = 'Draf disimpan pada browser ini.';
    actions = `${nav('Simpan & keluar','/platform','btn secondary')}${button('Mulai rekaman contoh','start-capture','primary')}`;
  } else if(session.phase==='capture') {
    const area = CAPTURE_AREAS.find(x=>x.id===session.activeArea) || CAPTURE_AREAS[0];
    const status = session.areas[area.id];
    const decided = status==='captured'||status==='skipped';
    const last = area.id===CAPTURE_AREAS.at(-1).id;
    summary = `${area.label} · ${areaLabels[status]}`;
    actions = decided?`${button(status==='captured'?'Ambil ulang':'Rekam area ini','mark-active-retake','secondary')}${button(last?'Selesai merekam':'Area berikutnya','next-area','primary')}`:`${button('Lewati area','skip-area','secondary')}${button(status==='retake'?'Ambil ulang foto':'Ambil foto contoh','capture-photo','primary')}`;
  } else if(session.phase==='review') {
    const missing = 9-capturedCount(session);
    summary = missing?`${missing} area belum memiliki bukti. Tetap boleh dibagikan.`:'9 area contoh sudah direkam.';
    actions = `${button('Kembali merekam','return-capture','secondary')}${button('Siapkan laporan','publish-capture','primary')}`;
  } else {
    summary = 'Lihat salinan laporan dari sisi pembeli.';
    actions = `${button('Tinjau lagi','return-review','secondary')}${button('Buka sebagai pembeli','preview-draft','primary')}`;
  }
  return `<footer class="capture-action-dock"><span class="capture-dock-summary">${summary}</span><div class="capture-dock-actions">${actions}</div></footer>`;
}

export function captureHTML(session, shareURL = '', options = {}) {
  const reviewTab = ['photos','notes','size'].includes(options.reviewTab)?options.reviewTab:'photos';
  const body = session.phase==='prepare'?prepare(session):session.phase==='capture'?capture(session):session.phase==='review'?review(session,reviewTab):ready(session,shareURL);
  return `${header('platform')}<main id="main" class="capture-page page-width">${mobileHeader(session)}<div class="capture-page-heading"><div>${nav('Barang saya / Laporan','/platform','breadcrumb')}<h1>${session.phase==='ready'?'Bagikan laporan':'Rekam barang'}</h1></div><div class="draft-label">${icon('check')} <span id="draft-status">Draf tersimpan</span> ${nav('Simpan & keluar','/platform','text-link')}</div></div>${captureStepper(session)}<div class="capture-content" data-review-tab="${reviewTab}">${body}</div>${actionDock(session)}</main>`;
}
