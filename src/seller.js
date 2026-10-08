import './seller.css';
import {PHOTO_AREAS,createDraft,makeId,validatePhoto,validateDimensions,assignPhoto,assignUniquePhoto,saveDraft,getDrafts as listDrafts,getDraft,deleteDraft} from './media-store.js';
export {getDrafts} from './media-store.js';
const steps = ['Barang','Foto','Kondisi','Ukuran','Tinjau'];
const escape = value => String(value ?? '').replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const rupiah = value => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value)||0);
const icon = (name) => {
  const shapes = {camera:'<path d="M8 6l2-3h4l2 3h4v14H4V6z"/><circle cx="12" cy="12" r="4"/>',upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',check:'<path d="m5 12 4 4L19 6"/>',arrow:'<path d="m14 5-7 7 7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',box:'<path d="m12 3 9 5-9 5-9-5zM3 8v9l9 5 9-5V8M12 13v9"/>',ruler:'<path d="m3 17 14-14 4 4L7 21zM13 7l3 3M9 11l3 3M5 15l3 3"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>'};
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.box}</svg>`;
};
export function renderSeller() {return '<section class="seller-page" data-seller-view="flow"><div class="seller-loading" role="status">Menyiapkan barang kamu…</div></section>';}
export function renderSellerDrafts() {return '<section class="seller-page" data-seller-view="drafts"><div class="seller-loading" role="status">Memuat barang kamu…</div></section>';}

export function mountSeller(root,{onComplete,onToast} = {}) {
  const page = root.matches?.('.seller-page') ? root : root.querySelector('.seller-page');
  if (!page) return () => {};
  let draft = createDraft(), activeArea = 'front', stream = null, disposed = false, cameraGeneration = 0, busy = false;
  let view = page.dataset.sellerView || 'flow', allDrafts = [], error = '', storageWarning = '', savedLabel = '', timer = null, saveChain = Promise.resolve();
  const urls = new Map();
  const toast = message => {if (!disposed) onToast?.(message);};
  const photoUrl = photo => {
    if (!photo?.blob) return '';
    const old = urls.get(photo.id);
    if (old && old.blob === photo.blob) return old.url;
    if (old) URL.revokeObjectURL(old.url);
    const url = URL.createObjectURL(photo.blob); urls.set(photo.id,{url,blob:photo.blob}); return url;
  };
  const stopCamera = () => {
    cameraGeneration++;
    stream?.getTracks().forEach(track => track.stop()); stream = null;
    const video = page.querySelector('video'); if (video) video.srcObject = null;
  };
  const showError = message => {
    error = message;
    const target = page.querySelector('[data-seller-error]');
    if (target) {target.textContent=message;target.hidden=!message;}
  };
  const updateStorage = () => {
    const target = page.querySelector('[data-seller-storage]');
    if (target) {target.innerHTML=storageWarning ? `<span>${escape(storageWarning)}</span><button type="button" class="seller-text-button" data-seller-action="retry-save">Coba simpan lagi</button>` : '';target.hidden=!storageWarning;}
    const label = page.querySelector('[data-seller-save-label]'); if (label) label.textContent = savedLabel;
    const summaryLabel=page.querySelector('[data-seller-summary-save]'); if(summaryLabel) summaryLabel.textContent=savedLabel || 'Belum disimpan';
  };
  const persist = () => {
    clearTimeout(timer);
    const snapshot = structuredClone(draft);
    savedLabel='Menyimpan…';updateStorage();
    saveChain=saveChain.catch(()=>{}).then(async () => {
      const result = await saveDraft(snapshot);
      if (!disposed && draft.id === snapshot.id) {
        savedLabel = result.persistent ? 'Perubahan tersimpan' : 'Perubahan belum tersimpan';
        storageWarning = result.persistent ? '' : result.reason === 'full' ? 'Penyimpanan penuh. Foto masih ada di halaman ini. Kosongkan ruang lalu coba simpan lagi, atau unduh foto sebelum menutup halaman.' : 'Foto belum tersimpan di perangkat. Jangan tutup halaman ini. Coba simpan lagi, atau unduh foto kamu di langkah Tinjau.';
        updateStorage();
      }
      return result;
    });
    return saveChain;
  };
  const scheduleSave = () => {savedLabel='Ada perubahan';updateStorage();clearTimeout(timer);timer=setTimeout(persist,450);};
  const field = (label,name,value,extra='') => `<label class="seller-field"><span>${label}</span><input name="${name}" value="${escape(value)}" ${extra}></label>`;
  const photoCount = () => Object.keys(draft.photos).length;
  const progress = () => `<nav class="seller-steps" aria-label="Langkah menambahkan barang">${steps.map((label,i) => `<button type="button" data-seller-step="${i}" ${i===draft.phase?'aria-current="step"':''} class="${i===draft.phase?'is-current':i<draft.phase?'is-done':''}"><span class="seller-step-number">${i<draft.phase?icon('check'):i+1}</span><span>${label}</span></button>`).join('')}</nav>`;
  function sidebar() {
    return `<aside class="seller-aside" data-seller-summary aria-label="Detail barang"><h2>Detail barang</h2><div class="seller-mini-item">${draft.photos.front ? `<img src="${photoUrl(draft.photos.front)}" alt="Foto bagian depan ${escape(draft.name || 'barang')}"/>` : `<div class="seller-mini-placeholder">${icon('box')}</div>`}<div><strong>${escape(draft.name || 'Nama belum diisi')}</strong><span>${escape(draft.category)}</span></div></div><dl class="seller-summary-details"><div><dt>Lokasi</dt><dd>${escape(draft.location || 'Belum diisi')}</dd></div><div><dt>Harga</dt><dd>${draft.price ? rupiah(draft.price) : 'Belum diisi'}</dd></div><div><dt>Foto</dt><dd>${photoCount()} foto</dd></div><div><dt>Status</dt><dd data-seller-summary-save>${escape(savedLabel || 'Belum disimpan')}</dd></div></dl></aside>`;
  }
  function updateSummary() {
    const summary=page.querySelector('[data-seller-summary]');
    if(summary) summary.outerHTML=sidebar();
  }
  function basic() {
    return `<div class="seller-section-head"><h2>Detail barang</h2><p>Mulai dari nama dan beberapa detail singkat.</p></div><div class="seller-form-grid">${field('Nama barang','name',draft.name,'required maxlength="100" autocomplete="off" placeholder="Contoh: Lemari kayu dua pintu"')}<label class="seller-field"><span>Kategori</span><select name="category" aria-label="Kategori">${['Lemari','Kursi','Meja','Sofa','Rak','Tempat tidur','Lainnya'].map(cat => `<option ${draft.category===cat?'selected':''}>${cat}</option>`).join('')}</select></label>${field('Harga (Rp)','price',draft.price,'type="number" min="0" max="999999999" inputmode="numeric" placeholder="Contoh: 850000"')}${field('Lokasi','location',draft.location,'maxlength="100" autocomplete="address-level2" placeholder="Contoh: Bandung"')}<label class="seller-field seller-wide"><span>Tentang barang <span class="seller-optional">(opsional)</span></span><textarea name="description" rows="4" maxlength="1000" placeholder="Bahan, lama pemakaian, dan detail lain tentang barang.">${escape(draft.description)}</textarea></label></div>`;
  }
  function photos() {
    const area = PHOTO_AREAS.find(item => item.id===activeArea), photo = draft.photos[activeArea];
    return `<div class="seller-section-head"><h2>Foto barang</h2><p>Ambil foto baru atau pilih foto yang sudah ada.</p></div><div class="seller-photo-tabs" aria-label="Bagian yang difoto">${PHOTO_AREAS.map(item => `<button type="button" data-seller-area="${item.id}" class="${activeArea===item.id?'is-active':''}" ${activeArea===item.id?'aria-pressed="true"':'aria-pressed="false"'}>${draft.photos[item.id]?icon('check'):''}${item.label}${draft.skipped[item.id]?'<span class="seller-area-skipped">Belum ada</span>':''}</button>`).join('')}</div><div class="seller-photo-title"><h3>Foto ${area.label.toLowerCase()}</h3><p>${area.hint}</p></div><div class="seller-capture-stage" data-seller-stage>${photo ? `<img class="seller-captured-image" src="${photoUrl(photo)}" alt="${escape(area.label)} ${escape(draft.name)}"/><span class="seller-photo-state">${icon('check')} Foto ditambahkan</span>` : `<div class="seller-capture-empty">${icon('camera')}<strong>${draft.skipped[activeArea]?'Bagian ini belum ada fotonya':'Belum ada foto'}</strong><span>${draft.skipped[activeArea]?'kamu bisa menambahkan foto nanti.':'Foto seluruh barang, lalu lengkapi sudut lainnya.'}</span></div>`}</div><div class="seller-camera-controls" data-seller-camera-controls><button type="button" class="seller-button seller-primary" data-seller-action="camera">${icon('camera')}${photo?'Ambil ulang':'Buka kamera'}</button><button type="button" class="seller-button seller-secondary" data-seller-action="upload">${icon('upload')}Pilih foto</button></div><input class="seller-file-input" type="file" accept="image/jpeg,image/png,image/webp" data-seller-file aria-label="Pilih foto barang"/><div class="seller-photo-under"><span>JPG, PNG, atau WebP · Maksimal 20 MB</span><button type="button" class="seller-text-button" data-seller-action="skip">${photo?'Hapus foto bagian ini':'Bagian ini sulit difoto'}</button></div>`;
  }
  function conditions() {
    return `<div class="seller-section-head"><h2>Bagaimana kondisinya?</h2><p>Tambahkan catatan untuk bagian yang perlu diperhatikan.</p></div><div class="seller-condition-list">${draft.conditions.length?draft.conditions.map((condition,i) => `<div class="seller-condition-card"><div class="seller-condition-number">${i+1}</div><div class="seller-condition-fields"><label class="seller-field"><span>Bagian barang</span><select name="condition-area-${i}" aria-label="Bagian barang"><option value="">Barang secara keseluruhan</option>${PHOTO_AREAS.map(area => `<option value="${area.id}" ${condition.area===area.id?'selected':''}>${area.label}${draft.photos[area.id]?' · Ada foto':''}</option>`).join('')}</select></label><label class="seller-field"><span>Catatan kondisi</span><textarea name="condition-note-${i}" rows="3" maxlength="500" placeholder="Contoh: Goresan tipis di pintu sebelah kanan.">${escape(condition.note)}</textarea></label></div><button type="button" class="seller-icon-button" data-seller-remove-condition="${i}" aria-label="Hapus catatan ${i+1}">${icon('close')}</button></div>`).join(''):`<div class="seller-condition-empty">${icon('box')}<h3>Belum ada catatan kondisi</h3><p>Tambahkan catatan tentang goresan, noda, atau bagian yang perlu diperhatikan.</p></div>`}</div><button type="button" class="seller-button seller-secondary" data-seller-action="add-condition">${icon('plus')}Tambah catatan kondisi</button><p class="seller-form-note">Jika belum ada catatan, bagian kondisi tetap bisa dilengkapi nanti.</p>`;
  }
  function dimensions() {
    return `<div class="seller-section-head"><h2>Ukur ruang yang dibutuhkan.</h2><p>Masukkan ukuran barang dalam sentimeter.</p></div><div class="seller-measure-illustration" aria-hidden="true"><svg viewBox="0 0 430 230" fill="none"><path d="m111 60 138-32 82 56-137 37z" fill="#e2e8df" stroke="#718371"/><path d="M111 60v107l83 39V121z" fill="#eef2e8" stroke="#718371"/><path d="m194 121 137-37v112l-137 10z" fill="#d5dfd1" stroke="#718371"/><path d="M214 125v67m73-87v90" stroke="#a3b3a0"/><path d="M99 186 185 226m16-3 142-17M355 87v111" stroke="#173f32"/><path d="m99 186 8 1-4 6m82 33-8-1 4-6m20 4 8-5v9m134-21-8-3v9m20-125-4 8h8m-4 103-4-8h8" stroke="#173f32"/><text x="110" y="224" fill="#687068" font-size="13">Kedalaman</text><text x="260" y="225" fill="#687068" font-size="13">Lebar</text><text x="368" y="150" fill="#687068" font-size="13">Tinggi</text></svg></div><div class="seller-dimensions-grid">${[['width','Lebar'],['depth','Kedalaman'],['height','Tinggi']].map(([key,label]) => `<label class="seller-field"><span>${label}</span><div class="seller-unit-input"><input type="number" name="dimension-${key}" aria-label="${label}" value="${escape(draft.dimensions[key])}" min="1" max="1000" step="0.1" inputmode="decimal" placeholder="0"><span>cm</span></div></label>`).join('')}</div><label class="seller-checkbox"><input type="checkbox" name="dimensionsConfirmed" ${draft.dimensionsConfirmed?'checked':''}><span>Saya sudah mengukur langsung barang ini.</span></label><button type="button" class="seller-text-button" data-seller-action="skip-dimensions">Saya belum bisa mengukur</button><p class="seller-form-note">Ukuran yang belum diukur akan ditandai belum dikonfirmasi.</p>`;
  }
  function review() {
    return `<div class="seller-section-head"><h2>Tinjau barang</h2><p>Periksa foto dan detail sebelum menyimpan.</p></div><div class="seller-review-heading"><div><span class="seller-small-label">${escape(draft.category)}</span><h3>${escape(draft.name)}</h3><p>${draft.price?rupiah(draft.price):'Harga belum diisi'}${draft.location?` · ${escape(draft.location)}`:''}</p></div><button type="button" class="seller-text-button" data-seller-step="0">Ubah detail</button></div><div class="seller-review-photos">${PHOTO_AREAS.map(area => {const photo=draft.photos[area.id];return `<div class="seller-review-photo">${photo?`<img src="${photoUrl(photo)}" alt="${escape(area.label)} ${escape(draft.name)}">`:`<div class="seller-missing-photo">${icon('camera')}<span>Belum ada foto</span></div>`}<div class="seller-review-photo-caption"><strong>${area.label}</strong><button type="button" class="seller-text-button" data-seller-retake="${area.id}">${photo?'Ambil ulang':'Tambah foto'}</button>${photo?`<a href="${photoUrl(photo)}" download="${escape(draft.name.replace(/[^a-zA-Z0-9]/g,'-'))}-${area.id}.${photo.blob.type==='image/png'?'png':photo.blob.type==='image/webp'?'webp':'jpg'}" class="seller-download">Unduh foto</a>`:''}</div></div>`;}).join('')}</div><div class="seller-review-details"><div><div class="seller-review-row"><h3>Kondisi</h3><button type="button" class="seller-text-button" data-seller-step="2">Ubah</button></div>${draft.conditions.filter(item=>item.note.trim()).length?draft.conditions.filter(item=>item.note.trim()).map(item => `<p><strong>${PHOTO_AREAS.find(area=>area.id===item.area)?.label || 'Barang secara keseluruhan'}</strong><br>${escape(item.note)}</p>`).join(''):'<p>Belum ada catatan kondisi.</p>'}</div><div><div class="seller-review-row"><h3>Ukuran</h3><button type="button" class="seller-text-button" data-seller-step="3">Ubah</button></div>${draft.dimensionsConfirmed?`<p>${escape(draft.dimensions.width)} × ${escape(draft.dimensions.depth)} × ${escape(draft.dimensions.height)} cm</p><span class="seller-confirmed">${icon('check')} Diukur langsung</span>`:'<p>Ukuran belum dikonfirmasi.</p>'}</div></div>${draft.description?`<div class="seller-review-description"><h3>Tentang barang</h3><p>${escape(draft.description)}</p></div>`:''}`;
  }
  function renderFlow(focus=false) {
    if (disposed) return;
    page.innerHTML=`<div class="seller-topline"><button type="button" class="seller-text-button seller-back" data-seller-action="drafts">${icon('arrow')}Barang saya</button><span class="seller-save-label" data-seller-save-label>${escape(savedLabel)}</span></div><div class="seller-title"><h1>Jual furnitur</h1><p>Foto, ceritakan kondisinya, dan lengkapi ukurannya.</p></div>${progress()}<div class="seller-storage-warning" data-seller-storage role="status" ${storageWarning?'':'hidden'}></div><div class="seller-workspace"><form class="seller-form" novalidate>${[basic,photos,conditions,dimensions,review][draft.phase]()}<p class="seller-error" data-seller-error role="alert" ${error?'':'hidden'}>${escape(error)}</p><div class="seller-actions"><button type="button" class="seller-button seller-secondary" data-seller-action="previous">${draft.phase===0?'Simpan dan lanjutkan nanti':'Kembali'}</button><button type="submit" class="seller-button seller-primary">${draft.phase===4?'Simpan barang':`Lanjut ke ${steps[draft.phase+1].toLowerCase()}`}</button></div></form>${sidebar()}</div>`;
    updateStorage();
    if (focus) {const heading=page.querySelector('.seller-section-head h2');heading.tabIndex=-1;heading.focus({preventScroll:true});page.scrollIntoView({behavior:'instant',block:'start'});}
  }
  async function renderDrafts() {
    stopCamera(); view='drafts'; if(draft.name || photoCount()) await persist(); allDrafts=await listDrafts(); if(disposed)return;
    for(const item of allDrafts) for(const photo of Object.values(item.photos)) photoUrl(photo);
    page.innerHTML=`<div class="seller-topline"><a class="seller-text-button seller-back" href="/" data-nav>${icon('arrow')}Kembali ke katalog</a></div><div class="seller-drafts-title"><div class="seller-title"><h1>Barang saya.</h1><p>Lanjutkan foto atau perbarui detail furnitur kamu.</p></div><button type="button" class="seller-button seller-primary" data-seller-action="new">${icon('plus')}Tambah barang</button></div>${allDrafts.length?`<div class="seller-drafts-grid">${allDrafts.map(item => `<article class="seller-draft-card">${item.photos.front?`<img src="${photoUrl(item.photos.front)}" alt="${escape(item.name || 'Barang baru')}">`:`<div class="seller-draft-placeholder">${icon('box')}<span>Tambahkan foto pertama</span></div>`}<div class="seller-draft-info"><span class="seller-small-label">${item.status==='saved'?'Barang tersimpan':'Belum selesai'}</span><h2>${escape(item.name || 'Barang baru')}</h2><p>${Object.keys(item.photos).length} foto${item.location?` · ${escape(item.location)}`:''}</p><div class="seller-draft-actions"><button class="seller-button seller-secondary" type="button" data-seller-resume="${escape(item.id)}">${item.status==='saved'?'Lihat dan ubah':'Lanjutkan'}</button><button type="button" class="seller-text-button" data-seller-delete="${escape(item.id)}">Hapus</button></div></div></article>`).join('')}</div>`:`<div class="seller-drafts-empty">${icon('box')}<h2>Belum ada barang</h2><p>Mulai dengan satu foto dan beberapa detail barang.</p><button type="button" class="seller-button seller-primary" data-seller-action="new">Tambah barang pertama</button></div>`}`;
  }
  function syncField(target) {
    if (!target.name) return;
    const {name,value}=target;
    if (name.startsWith('dimension-')) {draft.dimensions[name.slice(10)]=value;draft.dimensionsConfirmed=false;const check=page.querySelector('[name="dimensionsConfirmed"]');if(check)check.checked=false;}
    else if(name==='dimensionsConfirmed') draft.dimensionsConfirmed=target.checked;
    else if(name.startsWith('condition-area-')) draft.conditions[Number(name.slice(15))].area=value;
    else if(name.startsWith('condition-note-')) draft.conditions[Number(name.slice(15))].note=value;
    else if(['name','category','price','location','description'].includes(name)) draft[name]=value;
    draft.updatedAt=Date.now(); error='';showError('');scheduleSave();updateSummary();
  }
  function validatePhase(phase) {
    if(phase===0) {
      if(!draft.name.trim()) return 'Isi nama barang terlebih dahulu.';
      if(draft.price && (!Number.isFinite(Number(draft.price)) || Number(draft.price)<0 || Number(draft.price)>999999999)) return 'Isi harga antara Rp0 dan Rp999.999.999.';
    }
    if(phase===1 && !photoCount()) return 'Tambahkan setidaknya satu foto barang. kamu bisa menggunakan kamera atau memilih foto.';
    if(phase===3 && draft.dimensionsConfirmed) return validateDimensions(draft.dimensions);
    return null;
  }
  function goTo(phase) {
    const message=phase>draft.phase?validatePhase(draft.phase):null;
    if(message){showError(message);const invalid=page.querySelector('[name="name"]');if(!draft.name.trim())invalid?.focus();return;}
    if(phase>0 && !draft.name.trim()){showError('Isi nama barang terlebih dahulu.');return;}
    stopCamera();error='';draft.phase=phase;view='flow';persist();renderFlow(true);
  }
  async function openCamera() {
    if(busy)return;
    showError('');stopCamera();
    if(!navigator.mediaDevices?.getUserMedia){showError('Kamera tidak tersedia di browser ini. Gunakan Pilih foto untuk melanjutkan.');return;}
    const generation=cameraGeneration;
    const stage=page.querySelector('[data-seller-stage]');
    stage.innerHTML='<div class="seller-capture-empty" role="status">Membuka kamera…</div>';
    try {
      const acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}}});
      if(disposed || cameraGeneration!==generation || draft.phase!==1){acquired.getTracks().forEach(track=>track.stop());return;}
      stream=acquired;
      stage.innerHTML=`<video autoplay muted playsinline aria-label="Pratinjau kamera untuk ${escape(PHOTO_AREAS.find(area=>area.id===activeArea).label.toLowerCase())}"></video><div class="seller-framing-guide" aria-hidden="true"></div>`;
      const video=stage.querySelector('video');video.srcObject=stream;await video.play();
      const controls=page.querySelector('[data-seller-camera-controls]');
      controls.innerHTML=`<button type="button" class="seller-button seller-primary" data-seller-action="capture">${icon('camera')}Ambil foto</button><button type="button" class="seller-button seller-secondary" data-seller-action="upload">${icon('upload')}Pilih foto</button><button type="button" class="seller-text-button" data-seller-action="close-camera">Tutup kamera</button>`;
    } catch(reason) {
      if(disposed || generation!==cameraGeneration)return;
      stopCamera();renderFlow();
      showError(reason.name==='NotAllowedError'?'Akses kamera belum diizinkan. Izinkan kamera di browser atau gunakan Pilih foto.':reason.name==='NotFoundError'?'Kamera tidak ditemukan. Gunakan Pilih foto untuk melanjutkan.':'Kamera belum dapat dibuka. Tutup aplikasi kamera lain, lalu coba lagi atau pilih foto.');
    }
  }
  async function addPhoto(blob,area=activeArea,pixels) {
    const problem=validatePhoto(blob,pixels);if(problem){showError(problem);return false;}
    const previous=draft.photos[area];
    const listingId=draft.id;
    let assigned;
    try {assigned=await assignUniquePhoto(draft,area,{id:makeId(),blob,width:pixels.width,height:pixels.height,orientation:pixels.width>pixels.height?'landscape':pixels.width<pixels.height?'portrait':'square',createdAt:Date.now()});}
    catch(reason) {showError(reason.message || 'Foto belum dapat ditambahkan. Pilih foto lain.');return false;}
    if(disposed || draft.id!==listingId || draft.phase!==1)return false;
    draft=assignPhoto(draft,area,assigned.photos[area]);
    if(previous){const old=urls.get(previous.id);if(old){URL.revokeObjectURL(old.url);urls.delete(previous.id);}}
    stopCamera();error='';await persist();if(!disposed){renderFlow();toast('Foto ditambahkan');}return true;
  }
  async function capture() {
    const video=page.querySelector('video');if(!video || !video.videoWidth || !video.videoHeight){showError('Kamera sedang disiapkan. Tunggu sebentar lalu ambil foto.');return;}
    if(busy)return;busy=true;
    const width=video.videoWidth,height=video.videoHeight,area=activeArea,id=draft.id;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    canvas.getContext('2d').drawImage(video,0,0,width,height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.94));
    if(disposed || id!==draft.id || draft.phase!==1){busy=false;return;}
    if(!blob){busy=false;showError('Foto belum berhasil diambil. Coba lagi atau pilih foto.');return;}
    try {await addPhoto(blob,area,{width,height});}finally{busy=false;}
  }
  async function upload(file) {
    if(!file)return;const problem=validatePhoto(file);if(problem){showError(problem);return;}
    if(busy)return;busy=true;const area=activeArea,id=draft.id;
    let bitmap;
    try {
      if(globalThis.createImageBitmap) bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
      else {const url=URL.createObjectURL(file);try{bitmap=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;});}finally{URL.revokeObjectURL(url);}}
      const pixels={width:bitmap.width || bitmap.naturalWidth,height:bitmap.height || bitmap.naturalHeight};
      bitmap.close?.();
      if(disposed || id!==draft.id || draft.phase!==1)return;
      await addPhoto(file,area,pixels);
    } catch {if(!disposed)showError('Foto tidak dapat dibaca. Pilih foto JPG, PNG, atau WebP yang lain.');}
    finally{busy=false;}
  }
  async function submit(event) {
    event.preventDefault();if(busy)return;
    const problem=validatePhase(draft.phase);if(problem){showError(problem);return;}
    if(draft.phase<4){goTo(draft.phase+1);return;}
    const allProblems=validatePhase(0)||validatePhase(1)||validatePhase(3);if(allProblems){showError(allProblems);return;}
    draft.status='saved';busy=true;
    const button=page.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Menyimpan barang…';
    const result=await persist();busy=false;if(disposed)return;
    if(!result.persistent){draft.status='draft';renderFlow();showError('Barang belum tersimpan. Coba simpan lagi sebelum meninggalkan halaman.');return;}
    toast('Barang tersimpan');onComplete?.(result.draft);if(!disposed)await renderDrafts();
  }
  async function handleClick(event) {
    const button=event.target.closest('button');if(!button || !page.contains(button))return;
    if(button.dataset.sellerStep!==undefined){goTo(Number(button.dataset.sellerStep));return;}
    if(button.dataset.sellerArea){stopCamera();activeArea=button.dataset.sellerArea;error='';renderFlow();return;}
    if(button.dataset.sellerRetake){activeArea=button.dataset.sellerRetake;goTo(1);return;}
    if(button.dataset.sellerResume){clearTimeout(timer);stopCamera();const loaded=await getDraft(button.dataset.sellerResume);if(loaded && !disposed){draft=loaded;view='flow';error='';savedLabel='';storageWarning='';renderFlow(true);}return;}
    if(button.dataset.sellerDelete){
      const id=button.dataset.sellerDelete;
      if(button.dataset.confirm!=='true'){button.dataset.confirm='true';button.textContent='Hapus barang ini?';return;}
      const deleted=await deleteDraft(id);if(draft.id===id)draft=createDraft();
      if(!deleted)toast('Barang dihapus dari halaman ini. Penyimpanan perangkat belum dapat diperbarui.');else toast('Barang dihapus');
      await renderDrafts();return;
    }
    if(button.dataset.sellerRemoveCondition!==undefined){draft.conditions.splice(Number(button.dataset.sellerRemoveCondition),1);persist();renderFlow();return;}
    switch(button.dataset.sellerAction){
      case 'camera':await openCamera();break;
      case 'capture':await capture();break;
      case 'upload':page.querySelector('[data-seller-file]').click();break;
      case 'close-camera':stopCamera();renderFlow();break;
      case 'skip':{stopCamera();const previous=draft.photos[activeArea];if(previous){const old=urls.get(previous.id);if(old)URL.revokeObjectURL(old.url);urls.delete(previous.id);}delete draft.photos[activeArea];draft.skipped[activeArea]=true;persist();renderFlow();break;}
      case 'previous':if(draft.phase)goTo(draft.phase-1);else await renderDrafts();break;
      case 'drafts':await renderDrafts();break;
      case 'retry-save':await persist();break;
      case 'add-condition':draft.conditions.push({id:makeId(),area:draft.photos.detail?'detail':'',note:''});persist();renderFlow();page.querySelector(`[name="condition-note-${draft.conditions.length-1}"]`)?.focus();break;
      case 'skip-dimensions':draft.dimensionsConfirmed=false;goTo(4);break;
      case 'new':if(draft.name || photoCount())await persist();stopCamera();draft=createDraft();activeArea='front';view='flow';error='';storageWarning='';savedLabel='';renderFlow(true);break;
    }
  }
  function change(event) {if(event.target.matches('[data-seller-file]')){const file=event.target.files?.[0];event.target.value='';upload(file);}else if(event.target.matches('select,input[type="checkbox"]'))syncField(event.target);}
  function input(event) {if(event.target.matches('input:not([type="file"]):not([type="checkbox"]),textarea'))syncField(event.target);}
  function hideCamera() {if(document.hidden && stream){stopCamera();if(view==='flow')renderFlow();}}
  function pageHide(){stopCamera();persist();}
  page.addEventListener('click',handleClick);page.addEventListener('input',input);page.addEventListener('change',change);page.addEventListener('submit',submit);
  document.addEventListener('visibilitychange',hideCamera);window.addEventListener('pagehide',pageHide);
  if(view==='drafts') {listDrafts().then(items=>{allDrafts=items;if(!disposed){if(items.length)draft=items[0];renderDrafts();}});}else renderFlow();
  return () => {
    if(disposed)return;clearTimeout(timer);if(draft.name || photoCount())persist();disposed=true;stopCamera();
    page.removeEventListener('click',handleClick);page.removeEventListener('input',input);page.removeEventListener('change',change);page.removeEventListener('submit',submit);
    document.removeEventListener('visibilitychange',hideCamera);window.removeEventListener('pagehide',pageHide);
    for(const {url} of urls.values())URL.revokeObjectURL(url);urls.clear();
  };
}
