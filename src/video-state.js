// Scripted evidence from the supplied Sora clip; no device/sensor inference.
export const VIDEO_STATE_KEY='lihatdulu:video-sora:v1';
export const VIDEO_DURATION=18;
export const PREPARED_AREAS=Object.freeze([
  {id:'front',label:'Depan',title:'Tampak depan',detail:'Pintu tertutup',image:'/images/capture-front.webp',note:'Perlihatkan seluruh lemari, dari panel atas sampai kaki. Pintu tetap tertutup.',start:0,end:3},
  {id:'right',label:'Samping',title:'Sisi kanan',detail:'Profil & kedalaman',image:'/images/capture-right.webp',note:'Lihat panel samping, kedalaman lemari, dan sambungan di sudutnya.',start:3,end:6},
  {id:'rear',label:'Belakang',title:'Panel belakang & kaki',detail:'Bagian belakang',image:'/images/capture-rear.webp',note:'Sertakan panel belakang dan kaki untuk melengkapi tampilan luar barang.',start:6,end:9},
  {id:'interior',label:'Dalam',title:'Bagian dalam & rak',detail:'Pintu terbuka',image:'/images/capture-interior.webp',note:'Pintu terbuka memperlihatkan rak, ruang penyimpanan, dan engsel.',start:9,end:12},
  {id:'drawer',label:'Laci',title:'Rel & bagian dalam laci',detail:'Laci ditarik',image:'/images/capture-drawer.webp',note:'Perhatikan dasar laci, ruang simpan, dan rel saat laci ditarik.',start:12,end:15},
  {id:'scratch',label:'Kondisi',title:'Detail goresan',detail:'Jejak pemakaian',image:'/images/wear-scratch.webp',note:'Lihat goresan pada pintu kiri dari dekat agar jejak pemakaian terlihat jelas.',start:15,end:18}
].map(Object.freeze));
const ids=PREPARED_AREAS.map(a=>a.id);
const exact=(value,keys)=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
const bounded=time=>Math.min(VIDEO_DURATION,Math.max(0,time));
const areaOf=id=>PREPARED_AREAS.find(area=>area.id===id);
export const freshVideoState=()=>({schema:1,area:'front',elapsed:0,paused:true,selected:[]});

export function validateVideoState(value){
  if(!exact(value,['schema','area','elapsed','paused','selected'])||value.schema!==1||!ids.includes(value.area)||typeof value.paused!=='boolean'||typeof value.elapsed!=='number'||!Number.isFinite(value.elapsed)||!Array.isArray(value.selected)||value.selected.length>ids.length)throw Error('Data video contoh tidak valid.');
  const found=new Set();
  const selected=value.selected.map(record=>{
    if(!exact(record,['id','time','take'])||!ids.includes(record.id)||found.has(record.id)||typeof record.time!=='number'||!Number.isFinite(record.time)||!Number.isInteger(record.take)||record.take<1||record.take>1000000)throw Error('Pilihan bukti tidak valid.');
    found.add(record.id);return {id:record.id,time:bounded(record.time),take:record.take};
  });
  return {schema:1,area:value.area,elapsed:bounded(value.elapsed),paused:value.paused,selected};
}

export function selectVideoArea(state,id){
  const area=areaOf(id);if(!area)throw Error('Bagian video tidak dikenal.');
  return {...validateVideoState(state),area:id,elapsed:area.start,paused:true};
}
export function restartVideoPlayback(state){
  return {...validateVideoState(state),area:'front',elapsed:0,paused:true};
}
export function setVideoProgress(state,time,paused=state.paused){
  if(typeof time!=='number'||!Number.isFinite(time)||typeof paused!=='boolean')throw Error('Waktu video tidak valid.');
  return {...validateVideoState(state),elapsed:bounded(time),paused};
}
export function captureVideoArea(state,id=state.area,time=state.elapsed){
  const value=validateVideoState(state);if(!ids.includes(id)||typeof time!=='number'||!Number.isFinite(time))throw Error('Bagian bukti tidak dikenal.');
  const old=value.selected.find(record=>record.id===id);
  const replacement={id,time:bounded(time),take:Math.min(1000000,(old?.take??0)+1)};
  value.selected=old?value.selected.map(record=>record.id===id?replacement:record):[...value.selected,replacement];
  return value;
}
export function removeVideoArea(state,id){
  if(!ids.includes(id))throw Error('Bagian bukti tidak dikenal.');
  const value=validateVideoState(state);return {...value,selected:value.selected.filter(record=>record.id!==id)};
}
export const resetVideoState=()=>freshVideoState();
export function videoCoverage(state=readVideoState()){
  const value=validateVideoState(state),selected=ids.filter(id=>value.selected.some(record=>record.id===id)),missing=ids.filter(id=>!selected.includes(id));
  return {count:selected.length,total:ids.length,percent:Math.round(selected.length/ids.length*100),complete:missing.length===0,selected,missing};
}
const defaultStorage=()=>{try{return globalThis.localStorage;}catch{return null;}};
const defaultLegacy=()=>{try{return globalThis.sessionStorage;}catch{return null;}};
const recovery=new WeakMap();let unavailableState=null;
const storageObject=value=>value!==null&&(typeof value==='object'||typeof value==='function');
function legacy(value){
  if(!exact(value,['schema','area','captured','review'])||value.schema!==1||!ids.includes(value.area)||typeof value.review!=='boolean'||!Array.isArray(value.captured)||value.captured.length>6||value.captured.some(id=>!ids.includes(id))||new Set(value.captured).size!==value.captured.length)throw Error('Data foto contoh tidak valid.');
  return {schema:1,area:value.area,elapsed:areaOf(value.area).start,paused:true,selected:value.captured.map(id=>({id,time:areaOf(id).start,take:1}))};
}
export function readVideoState(storage=defaultStorage()){
  try{
    const recovered=storageObject(storage)?recovery.get(storage):unavailableState;
    if(recovered)return validateVideoState(recovered);
    const raw=storage?.getItem(VIDEO_STATE_KEY);
    if(raw!==null&&raw!==undefined)return validateVideoState(JSON.parse(raw));
    const prior=storage?.getItem('lihatdulu:prepared-sora:v1')??(storage===defaultStorage()?defaultLegacy()?.getItem('lihatdulu:prepared-sora:v1'):null);
    if(prior)return validateVideoState(legacy(JSON.parse(prior)));
  }catch{}
  return freshVideoState();
}
export function writeVideoState(state,storage=defaultStorage()){
  let valid;try{valid=validateVideoState(state);}catch{return false;}
  try{if(!storage)throw Error('Storage unavailable');storage.setItem(VIDEO_STATE_KEY,JSON.stringify(valid));if(storageObject(storage))recovery.delete(storage);else unavailableState=null;return true;}
  catch{if(storageObject(storage))recovery.set(storage,valid);else unavailableState=valid;return false;}
}
