import { views, conditions } from './data.js';
import { header, nav, button, image, icon, pill, esc, stageMarkup, fitHTML, conditionDetailHTML } from './ui.js';

export const studioChapters = [
  {title:'Siapkan barang',label:'Persiapan',text:'Letakkan barang di ruang terang dan pastikan setiap sisinya dapat dijangkau.',hint:'Ponsel, barang, dan rekaman dalam demo merupakan contoh.'},
  {title:'Rekam bagian luar',label:'Rekam luar',text:'Pilih sisi barang, lalu ambil foto contoh. Putar tampak untuk mengikuti arah perekaman.',hint:'Cakupan area lebih berarti daripada jumlah foto saja.'},
  {title:'Lihat sampai ke dalam',label:'Rekam dalam',text:'Buka pintu dan laci. Rekam bagian dalam yang tidak terlihat dari depan.',hint:'Foto dekat melengkapi bentuk 3D.'},
  {title:'Tinjau hasil rekaman',label:'Tinjau bukti',text:'Periksa gambar dan area yang masih kurang sebelum membagikan laporan.',hint:'Model 3D sudah disiapkan. Bukti yang belum ada tetap ditandai.'},
  {title:'Periksa detail kondisi',label:'Kondisi',text:'Pilih catatan untuk melihat foto detail dan posisi yang sama pada model.',hint:'Penanda mengikuti bagian lemari saat bergerak.'},
  {title:'Periksa ruang penyimpanan',label:'Buka barang',text:'Atur bukaan kedua pintu dan tarikan laci secara terpisah.',hint:'Dua pintu hingga 100° · laci hingga 30 cm.'},
  {title:'Konfirmasi ukurannya',label:'Ukuran',text:'Lihat lebar, kedalaman, dan tinggi. Ukuran tertutup mencakup handle.',hint:'Ukuran contoh 90 × 47,5 × 120 cm.'},
  {title:'Lihat sebagai pembeli',label:'Bagikan',text:'Buka laporan untuk memeriksa kondisi, dokumentasi, dan ukuran sebagai pembeli.',hint:'Laporan mempertahankan bukti barang yang kamu buka.'},
  {title:'Coba di ruangmu',label:'Penempatan',text:'Atur ukuran ruang, lalu geser dan putar lemari untuk mencari posisi yang sesuai.',hint:'Geser lemari di lantai atau gunakan kontrol posisi.'},
  {title:'Periksa ruang bukanya',label:'Ruang buka',text:'Coba penghalang. Periksa badan lemari, ayunan pintu, dan tarikan laci secara terpisah.',hint:'Hasil memakai batas bagian model contoh. Ukur kembali ruang sebenarnya.'}
];

const toolLabels={model:'Model',condition:'Kondisi',opening:'Bukaan',size:'Ukuran',room:'Ruang'};
const toolIcons={model:'cube',condition:'eye',opening:'report',size:'ruler',room:'room'};
const toolTitles={model:'Lihat dari sudutmu.',condition:'Periksa bekas pemakaian.',opening:'Buka sampai ke dalam.',size:'Pahami ukuran barang.',room:'Cari posisi yang cocok.'};
const toolText={model:'Putar model atau pilih sudut tampak. Semua alat dapat kamu buka langsung.',condition:'Bandingkan foto detail dengan bagian yang sama pada model.',opening:'Kedua pintu dan laci dapat kamu atur secara terpisah.',size:'Dimensi barang tertutup sudah termasuk handle.',room:'Atur ruang, posisi, dan penghalang. Tiga hasil diperiksa terpisah.'};
const defaultRoom={width:3.2,depth:3,x:0,z:-.4,rotation:0,fixture:'clear'};
const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;
const isFree=context=>context.mode?context.mode==='free':!!context.free;
const chapterIndex=value=>Math.round(clamp(value,0,studioChapters.length-1,0));
const selectedTool=value=>Object.hasOwn(toolLabels,value)?value:'model';
const selectedRoomTab=value=>['size','position','fixtures'].includes(value)?value:'size';

export function studioModeHTML(context={}) {
  const free=isFree(context);
  return `<div class="studio-mode-switch segmented" role="group" aria-label="Mode studio"><button data-mode="guided" class="${free?'':'active'}" aria-pressed="${!free}">${icon('camera')}<span>Ikuti panduan</span></button><button data-mode="free" class="${free?'active':''}" aria-pressed="${free}">${icon('cube')}<span>Eksplorasi bebas</span></button></div><span class="studio-mode-note">${free?'Pilih alat. Jelajahi sesukamu.':'10 langkah · lanjutkan dengan ritmemu'}</span>`;
}

function motionControls(motions={},opened=false) {
  return `<div class="motion-controls">${[['left','Pintu kiri',100,'°'],['right','Pintu kanan',100,'°'],['drawer','Laci',30,' cm']].map(([id,label,max,unit])=>{
    const value=clamp(id==='drawer'?Number(motions[id])*100:motions[id],0,max,opened?max:0);
    return `<label class="field range-field"><span>${label}<small data-motion-output="${id}">${Number(value.toFixed(1))}${unit}</small></span><input data-motion="${id}" type="range" aria-label="${label}" min="0" max="${max}" step="1" value="${Number(value.toFixed(1))}"></label>`;
  }).join('')}</div>`;
}

function measurements(report) {
  return `<div class="studio-measurements"><div><strong>90</strong><span>Lebar · cm</span></div><div><strong>47,5</strong><span>Dalam · cm</span></div><div><strong>120</strong><span>Tinggi · cm</span></div></div><div class="studio-size-status">${icon('ruler')}<span>${report?.dimensionsConfirmed?'Ukuran dikonfirmasi pemilik dalam demo.':'Ukuran model contoh. Barang asli belum dikonfirmasi.'}</span></div>`;
}

function conditionControls(report,selected) {
  return `<div class="studio-condition-list">${conditions.map((c,i)=>`<button data-condition="${c.id}" class="studio-condition ${selected===c.id?'selected':''}" aria-label="${c.title}" aria-pressed="${selected===c.id}">${image(c.image,c.title)}<span><strong>${c.short}</strong><small>${c.location} · ${c.size}</small></span><b>${i+1}</b></button>`).join('')}</div><div id="condition-detail" class="studio-evidence-comparison">${selected?conditionDetailHTML(report,selected):'<p class="fine-print">Pilih detail untuk membandingkan foto dengan model.</p>'}</div>`;
}

function roomControls(room,tab) {
  room={...defaultRoom,...room};tab=selectedRoomTab(tab);
  const size=`<div class="room-field-grid"><label class="field">Lebar ruang <span class="unit">m</span><input aria-label="Lebar ruang" data-room="width" type="number" min="1.2" max="10" step="0.1" value="${clamp(room.width,1.2,10,3.2)}"></label><label class="field">Panjang ruang <span class="unit">m</span><input aria-label="Panjang ruang" data-room="depth" type="number" min="1" max="10" step="0.1" value="${clamp(room.depth,1,10,3)}"></label></div>`;
  const position=`<label class="field range-field"><span>Rotasi barang <strong id="rotation-output">${clamp(room.rotation,-180,180,0)}°</strong></span><input aria-label="Rotasi barang" data-room="rotation" type="range" min="-180" max="180" step="5" value="${clamp(room.rotation,-180,180,0)}"></label><div class="position-buttons" aria-label="Geser posisi barang">${button('Kiri','nudge-left','small secondary')}${button('Kanan','nudge-right','small secondary')}${button('Maju','nudge-forward','small secondary')}${button('Mundur','nudge-back','small secondary')}</div>`;
  const fixtures=`<div class="fixture-buttons">${[['clear','Ruang kosong'],['door','Penghalang pintu'],['drawer','Penghalang laci'],['wall','Dekat dinding']].map(([id,label])=>`<button data-fixture="${id}" class="btn small secondary ${room.fixture===id?'active':''}" aria-pressed="${room.fixture===id}">${label}</button>`).join('')}</div>`;
  const sections={size,position,fixtures};
  return `<div class="room-controls" data-room-tab="${tab}"><div class="room-tool-tabs room-tabs" role="tablist" aria-label="Pengaturan ruang">${[['size','Ukuran'],['position','Posisi'],['fixtures','Penghalang']].map(([id,label])=>`<button data-room-tab="${id}" role="tab" aria-selected="${tab===id}" class="${tab===id?'active':''}">${label}</button>`).join('')}</div>${Object.entries(sections).map(([id,html])=>`<div class="room-tab-panel room-control-panel" data-room-panel="${id}">${html}</div>`).join('')}${fitHTML()}<div class="studio-room-history">${button(icon('reset')+' Reset posisi','reset-placement','small quiet')}${button('Urungkan','undo-placement','small quiet')}</div></div>`;
}

function freeInteraction({tool,report,selected,motions,dimensions,room,roomTab}) {
  if(tool==='condition')return conditionControls(report,selected);
  if(tool==='opening')return motionControls(motions);
  if(tool==='size')return `${measurements(report)}${button(icon('ruler')+' '+(dimensions?'Sembunyikan ukuran':'Tampilkan ukuran'),'dimensions','small secondary full','aria-pressed="'+!!dimensions+'"')}`;
  if(tool==='room')return roomControls(room,roomTab);
  return `<div class="explorer-model-controls"><div class="view-pills" aria-label="Sudut model">${[['overview','Perspektif'],['front','Depan'],['rear','Belakang'],['top','Atas']].map(([id,label])=>`<button data-view="${id}" class="btn small secondary">${label}</button>`).join('')}</div><div class="studio-quick-scenarios"><span class="field-label">Coba langsung</span>${button(icon('eye')+' Periksa goresan','quick-scratch','small secondary')}${button(icon('report')+' Buka laci','quick-drawer','small secondary')}${button(icon('room')+' Pintu terhalang','quick-door','small secondary')}</div><p class="studio-notice">${icon('info')} Model, foto, dan pemeriksaan memakai barang contoh yang sama.</p></div>`;
}

function guidedInteraction({chapter,report,area,taken,selected,motions,room,roomTab}) {
  if(chapter===0)return `<div class="studio-prep-list"><span>${icon('sun')} Cahaya merata</span><span>${icon('room')} Semua sisi terjangkau</span><span>${icon('camera')} Barang tetap diam</span></div>`;
  if(chapter===1||chapter===2) {
    const areas=views.filter(v=>chapter===1?!['interior','drawer'].includes(v.id):['interior','drawer'].includes(v.id));
    const current=areas.find(v=>v.id===area)||areas[0];
    return `<div class="studio-capture-box"><div><strong>${current.label}</strong>${pill(taken.includes(current.id)?'Terekam':'Simulasi')}</div><div class="studio-area-pills">${areas.map(v=>`<button data-studio-area="${v.id}" class="${current.id===v.id?'active':''}" aria-pressed="${current.id===v.id}">${taken.includes(v.id)?icon('check'):icon('camera')}${v.label}</button>`).join('')}</div>${button(icon('camera')+' Ambil foto contoh','studio-take','primary full')}<div class="studio-thumbnails">${taken.slice(-5).map(id=>{const v=views.find(v=>v.id===id);return image(v.image,v.label);}).join('')}</div><span class="fine-print">${taken.length}/9 area dicoba · rekaman simulasi.</span></div>`;
  }
  if(chapter===3)return `<div class="studio-evidence-preview">${views.slice(0,3).map(v=>image(v.image,v.label)).join('')}</div><div class="notice amber">${icon('camera')}<div><strong>${report.views.length}/9 area pada tampilan contoh</strong><p>${report.views.length<9?'Area tanpa gambar tetap membutuhkan bukti tambahan.':'Semua area contoh memiliki gambar.'}</p></div></div><div class="studio-inline-actions">${button('Contoh 7 area','studio-incomplete','small secondary')}${button('Contoh 9 area','studio-complete','small secondary')}</div><p class="fine-print">Perbandingan ini tidak mengubah bukti laporan yang kamu buka.</p>`;
  if(chapter===4)return conditionControls(report,selected);
  if(chapter===5)return motionControls(motions,true);
  if(chapter===6)return measurements(report);
  if(chapter===7)return `<div class="studio-report-preview">${image('cabinet-closed',report.name)}<div><strong>${esc(report.name)}</strong><small>${report.views.length}/9 area · 3 catatan kondisi</small>${pill('Pratinjau pembeli')}</div></div>${button('Buka laporan','open-current','primary full')}`;
  return roomControls(room,roomTab||(chapter===9?'fixtures':'size'))+(chapter===9?button('Simpan penempatan','save-placement','secondary full'):'');
}

export function studioPanelHTML(context) {
  const free=isFree(context),chapter=chapterIndex(context.chapter),c=studioChapters[chapter],tool=selectedTool(context.tool);
  const report=context.report||{name:'Lemari Sora',views:[]};
  const taken=[...new Set((context.taken||[]).filter(id=>views.some(v=>v.id===id)))];
  const current={...context,chapter,tool,report,taken,area:context.area||'front'};
  const tools=free?`<div class="explorer-tools" role="tablist" aria-label="Alat eksplorasi">${Object.entries(toolLabels).map(([id,label])=>`<button data-tool="${id}" role="tab" aria-selected="${tool===id}" class="${tool===id?'active':''}">${icon(toolIcons[id])}<span>${label}</span></button>`).join('')}</div>`:'';
  const meta=free?`<div class="studio-step-meta"><span class="eyebrow">EKSPLORASI BEBAS</span><span>Model contoh</span></div>`:`<div class="studio-step-meta"><span class="eyebrow">${c.label}</span><span>${String(chapter+1).padStart(2,'0')} / ${studioChapters.length}</span></div><div class="studio-step-progress"><i style="width:${(chapter+1)/studioChapters.length*100}%"></i></div>`;
  const body=`<div class="studio-panel-body">${meta}<div class="studio-panel-heading"><h2 id="chapter-title">${free?toolTitles[tool]:c.title}</h2><p>${free?toolText[tool]:c.text}</p></div>${tools}<div class="studio-interaction" data-studio-tool="${free?tool:'guided'}">${free?freeInteraction(current):guidedInteraction(current)}</div>${free?'':`<div class="studio-tip">${icon('info')}<span>${c.hint}</span></div><div class="studio-secondary-actions">${button('Detail langkah','studio-details','text-button')}${button('Ulangi langkah','repeat-chapter','text-button')}</div>`}</div>`;
  const dock=free?`<div class="explorer-dock">${button(icon('info')+' Detail','studio-details','secondary')}${tool==='room'?button(icon('save')+' Simpan posisi','save-placement','primary'):button(icon('report')+' Buka laporan','open-current','primary')}</div>`:`<div class="studio-navigation">${button('Sebelumnya','prev-chapter','secondary',chapter===0?'disabled':'')}${button(chapter===9?'Ulangi demo':'Berikutnya',chapter===9?'restart-studio':'next-chapter','primary')}</div>`;
  return body+dock;
}

export function studioChapterPickerHTML(context={}) {
  const chapter=chapterIndex(context.chapter);
  return `<div class="studio-chapter-picker"><p class="section-description">Langsung ke bagian yang ingin kamu coba.</p>${studioChapters.map((c,i)=>`<button data-chapter="${i}" class="${i===chapter?'active':''}" aria-current="${i===chapter?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span><strong>${c.title}</strong>${i===chapter?icon('check'):''}</button>`).join('')}</div>`;
}

export function studioDetailsHTML(context={}) {
  const chapter=chapterIndex(context.chapter),tool=selectedTool(context.tool),free=isFree(context),report=context.report||{name:'Lemari Sora',views:[]};
  const c=studioChapters[chapter];
  const chosen=conditions.find(item=>item.id===context.selected);
  return `<div class="studio-details-sheet"><span class="eyebrow">${free?'EKSPLORASI BEBAS':`LANGKAH ${chapter+1} / ${studioChapters.length}`}</span><h2>${free?toolTitles[tool]:c.title}</h2><p>${free?toolText[tool]:c.text}</p>${free?'':`<div class="notice neutral">${icon('info')}<p>${c.hint}</p></div>`}${chosen?`<div class="condition-detail-card">${image(chosen.image,chosen.title)}<div><h3>${chosen.title}</h3><p>${esc(report.conditionNotes?.find(x=>x.id===chosen.id)?.note??chosen.description)}</p><p class="fine-print">${chosen.location} · ${chosen.size} · bukti contoh</p></div></div>`:''}<div class="studio-detail-facts"><p><strong>Barang contoh</strong><br>${esc(report.name)} · 90 × 47,5 × 120 cm</p><p><strong>Gerakan</strong><br>Dua pintu hingga 100° dan satu laci hingga 30 cm.</p><p><strong>Dokumentasi laporan</strong><br>${report.views.length} dari 9 area memiliki gambar. Rekaman percobaan pada panduan tidak mengubah bukti laporan.</p></div><p class="fine-print">Kamera, foto, dan model merupakan simulasi. Pemeriksaan ruang memakai batas bagian model. Periksa barang, ukuran, dan ruang sebenarnya sebelum membeli.</p></div>`;
}

export function studioHTML(context) {
  const chapter=chapterIndex(context.chapter),free=isFree(context),hash=context.hash||'';
  const stage=stageMarkup(chapter<3&&!free?'SIMULASI PEREKAMAN / SORA':'MODEL CONTOH / SORA');
  return `${header('studio',hash)}<main id="main" class="studio-page page-width"><div class="mobile-workspace-header"><a href="/" data-nav class="mobile-workspace-back" aria-label="Kembali ke beranda">‹</a><div><span>STUDIO 3D</span><strong id="studio-mobile-title">${free?'Eksplorasi bebas':studioChapters[chapter].label}</strong></div>${button(icon('grid'),'chapters-modal','icon-only quiet','aria-label="Pilih langkah panduan"')}</div><div class="studio-heading"><div><span class="eyebrow">STUDIO INTERAKTIF</span><h1>Lihat lebih dekat. Coba lebih bebas.</h1></div>${button('Buka laporan','open-current','secondary')}</div><div id="studio-mode-bar" class="studio-mode-bar">${studioModeHTML(context)}</div><div class="studio-layout"><section class="studio-model">${stage}<div id="studio-free-tools"></div></section><aside id="studio-panel" class="studio-panel">${studioPanelHTML(context)}</aside></div><div class="studio-chapters" role="tablist" aria-label="Bab demo">${studioChapters.map((c,i)=>`<button data-chapter="${i}" role="tab" aria-selected="${!free&&i===chapter}" class="${!free&&i===chapter?'active':''}"><span>${String(i+1).padStart(2,'0')}</span><strong>${c.label}</strong></button>`).join('')}</div></main>`;
}
