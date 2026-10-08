import './prepared-capture.css';
import { PREPARED_AREAS, freshPreparedState, validatePreparedState, selectPreparedArea, capturePreparedArea } from './prepared-state.js';

const KEY='lihatdulu:prepared-sora:v1';
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const camera='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 1-3h6l1 3"/><circle cx="12" cy="13" r="4"/></svg>';
const action=(label,name,extra='')=>'<button type="button" class="prepared-button" data-prepared-action="'+name+'" '+extra+'>'+label+'</button>';

export function renderPreparedCapture(){
  return '<section class="prepared-capture" aria-label="Foto barang Sora">'+
    '<div class="prepared-top"><a href="/barang/sora" data-nav class="back-link">← Kembali ke barang</a><span class="prepared-example">Contoh: Lemari Sora</span></div>'+
    '<div class="prepared-title"><div><p class="item-category">Jual furnitur</p><h1>Mulai dari setiap sudut.</h1><p>Lihat cara menyiapkan foto yang membantu pembeli mengenal barang.</p></div><a href="/barang/sora" data-nav class="text-link">Lihat barang '+arrow+'</a></div>'+
    '<div class="prepared-workspace" data-prepared-workspace>'+
      '<div class="prepared-scene-column"><div class="prepared-stage" data-prepared-stage aria-busy="true"><img class="prepared-poster" src="/images/studio-capture-scene.webp" width="1600" height="1000" alt="Lemari Sora dan panduan sudut foto di dalam ruang"><div class="prepared-loading" role="status">Menyiapkan tampilan…</div><span class="prepared-stage-area" data-prepared-stage-label>Bagian depan</span><span class="prepared-shutter-flash" aria-hidden="true"></span><div class="prepared-stage-error" hidden><p>Panduan 3D belum tersedia. Foto contoh tetap bisa dijelajahi.</p>'+action('Coba lagi','retry')+'</div></div><div class="prepared-stage-caption"><span>Jelajahi sudut foto</span><span data-prepared-count aria-live="polite">0 / 6 sudut</span></div><div class="prepared-areas" aria-label="Sudut foto">'+PREPARED_AREAS.map((area,i)=>'<button type="button" data-prepared-area="'+area.id+'" aria-pressed="'+(i===0)+'"><span class="prepared-area-index">'+(i+1)+'</span>'+area.label+'<span data-area-check="'+area.id+'" class="prepared-area-check" aria-label="Foto sudah dipilih" hidden>✓</span></button>').join('')+'</div></div>'+
      '<aside class="prepared-photo-panel"><div class="prepared-photo-heading"><div><span data-prepared-step>Sudut 1 dari 6</span><h2 data-prepared-heading>Bagian depan</h2></div><span class="prepared-photo-status" data-prepared-photo-status>Foto contoh</span></div><div class="prepared-photo-frame"><img data-prepared-preview src="/images/capture-front.webp" width="1000" height="1000" alt="Foto contoh bagian depan Lemari Sora"><span class="prepared-frame-corner corner-a"></span><span class="prepared-frame-corner corner-b"></span><span class="prepared-frame-corner corner-c"></span><span class="prepared-frame-corner corner-d"></span><span class="prepared-shutter-flash" aria-hidden="true"></span></div><p data-prepared-note>Sertakan seluruh lemari, dari bagian atas sampai kaki.</p><div class="prepared-shutter-row">'+action(camera+'<span>Ambil foto</span>','capture','')+action('Ambil ulang','retake','hidden')+'</div><div class="prepared-photo-bottom">'+action('Sudut berikutnya '+arrow,'next')+action('Tinjau foto '+arrow,'review')+'</div></aside>'+
    '</div><div class="prepared-bottom"><p>Nama, ukuran, dan foto Sora sudah tersedia untuk kamu jelajahi.</p><div>'+action('Mulai lagi','reset')+action('Urungkan','undo','hidden')+'</div><span class="sr-only" data-prepared-announcement role="status" aria-live="polite"></span></div>'+
    '<section class="prepared-review" data-prepared-review hidden tabindex="-1"><div class="prepared-review-heading"><div><p class="item-category">Foto & detail barang</p><h2>Sora, dari dekat.</h2><p>Enam foto contoh untuk mengenal bentuk, bagian dalam, dan kondisinya.</p></div>'+action('Kembali ke foto','back')+'</div><div class="prepared-review-photos">'+PREPARED_AREAS.map(area=>'<figure><img src="'+area.image+'" width="1000" height="1000" alt="Foto contoh '+area.title.toLowerCase()+' Lemari Sora" loading="lazy"><figcaption>'+area.title+'</figcaption></figure>').join('')+'</div><div class="prepared-review-facts"><div><span>Barang</span><strong>Lemari Sora</strong><p>Panel kayu dengan finishing serat kayu terang.</p></div><div><span>Ukuran</span><strong>90 × 47,5 × 120 cm</strong><p>Lebar × dalam × tinggi.</p></div><div><span>Kondisi</span><strong>Bekas</strong><p>Goresan pada pintu, sudut terkelupas, dan bekas pada bagian atas.</p></div></div><div class="prepared-review-actions"><a href="/barang/sora" data-nav class="btn primary">Jelajahi barang dalam 3D '+arrow+'</a><a href="/barang/sora?tab=room" data-nav class="text-link">Coba di ruang '+arrow+'</a></div></section>'+
  '</section>';
}

export function mountPreparedCapture(root,{onToast=()=>{}}={}){
  const host=root.querySelector('.prepared-capture');if(!host)return()=>{};
  const q=s=>host.querySelector(s),qa=s=>[...host.querySelectorAll(s)];
  const controller=new AbortController();let state=freshPreparedState(),undo=null,engine=null,disposed=false,loading=false,flashTimer;
  try{const value=sessionStorage.getItem(KEY);if(value)state=validatePreparedState(JSON.parse(value));}catch{}
  const alive=()=>!disposed&&host.isConnected;
  const persist=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(state));}catch{}};
  const announce=message=>{q('[data-prepared-announcement]').textContent=message;};
  function update(){
    const area=PREPARED_AREAS.find(a=>a.id===state.area),index=PREPARED_AREAS.indexOf(area),taken=state.captured.includes(area.id);
    host._state=validatePreparedState(state);q('[data-prepared-count]').textContent=state.captured.length+' / 6 sudut';
    q('[data-prepared-step]').textContent='Sudut '+(index+1)+' dari 6';q('[data-prepared-heading]').textContent=area.title;q('[data-prepared-stage-label]').textContent=area.title;
    q('[data-prepared-note]').textContent=area.note;const img=q('[data-prepared-preview]');img.src=area.image;img.alt='Foto contoh '+area.title.toLowerCase()+' Lemari Sora';
    q('[data-prepared-photo-status]').textContent=taken?'Foto ditambahkan':'Foto contoh';
    q('[data-prepared-photo-status]').classList.toggle('is-selected',taken);
    q('[data-prepared-action="capture"]').hidden=taken;q('[data-prepared-action="retake"]').hidden=!taken;
    qa('[data-prepared-area]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.preparedArea===area.id));q('[data-area-check="'+button.dataset.preparedArea+'"]').hidden=!state.captured.includes(button.dataset.preparedArea);});
    q('[data-prepared-action="next"]').textContent=index===PREPARED_AREAS.length-1?'Kembali ke depan':'Sudut berikutnya';
    q('[data-prepared-action="undo"]').hidden=!undo;
    q('[data-prepared-workspace]').hidden=state.review;q('[data-prepared-review]').hidden=!state.review;
    q('.prepared-bottom').hidden=state.review;
    if(engine&&!state.review)engine.setCaptureScene({phase:area.phase,area:area.id,progress:state.captured.length/PREPARED_AREAS.length});
    persist();
  }
  async function load(){
    if(loading||engine||!alive()||state.review)return;loading=true;
    q('.prepared-loading').hidden=false;q('.prepared-stage-error').hidden=true;q('[data-prepared-stage]').setAttribute('aria-busy','true');
    try{
      const {createEngine}=await import('./engine.js');if(!alive())return;
      const created=await createEngine(q('[data-prepared-stage]'));
      if(!alive()||state.review){created.dispose();return;}engine=created;host._engine=engine;
      q('.prepared-poster').hidden=true;q('.prepared-loading').hidden=true;q('[data-prepared-stage]').setAttribute('aria-busy','false');
      engine.renderer.domElement.setAttribute('aria-hidden','true');update();
    }catch{if(alive()){q('.prepared-loading').hidden=true;q('.prepared-stage-error').hidden=false;q('[data-prepared-stage]').setAttribute('aria-busy','false');}}
    finally{loading=false;}
  }
  function openReview(){
    state={...state,review:true};engine?.dispose();engine=null;host._engine=null;update();
    q('[data-prepared-review]').focus({preventScroll:true});q('[data-prepared-review]').scrollIntoView({block:'start',behavior:'instant'});
  }
  host.addEventListener('click',event=>{
    const area=event.target.closest('[data-prepared-area]');
    if(area&&host.contains(area)){state=selectPreparedArea(state,area.dataset.preparedArea);update();return;}
    const target=event.target.closest('[data-prepared-action]');if(!target||!host.contains(target))return;
    const action=target.dataset.preparedAction;
    if(action==='capture'||action==='retake'){
      state=capturePreparedArea(state);update();qa('.prepared-photo-frame,.prepared-stage').forEach(e=>e.classList.add('is-capturing'));clearTimeout(flashTimer);flashTimer=setTimeout(()=>qa('.prepared-photo-frame,.prepared-stage').forEach(e=>e.classList.remove('is-capturing')),230);
      announce('Foto contoh '+PREPARED_AREAS.find(a=>a.id===state.area).title.toLowerCase()+' ditambahkan.');
      q('[data-prepared-action="retake"]').focus({preventScroll:true});
    }else if(action==='next'){const i=PREPARED_AREAS.findIndex(a=>a.id===state.area);state=selectPreparedArea(state,PREPARED_AREAS[(i+1)%PREPARED_AREAS.length].id);update();}
    else if(action==='review')openReview();
    else if(action==='back'){state={...state,review:false};update();q('.prepared-poster').hidden=false;void load();q('[data-prepared-action="review"]').focus({preventScroll:true});}
    else if(action==='reset'){undo=validatePreparedState(state);state=freshPreparedState();update();announce('Contoh foto dimulai lagi. Kamu bisa mengurungkannya.');q('[data-prepared-action="undo"]').focus({preventScroll:true});}
    else if(action==='undo'&&undo){state=undo;undo=null;update();announce('Pilihan foto dikembalikan.');q('[data-prepared-action="reset"]').focus({preventScroll:true});}
    else if(action==='retry')void load();
  },{signal:controller.signal});
  update();if(!state.review)void load();
  return()=>{persist();disposed=true;controller.abort();clearTimeout(flashTimer);engine?.dispose();engine=null;host._engine=null;};
}
