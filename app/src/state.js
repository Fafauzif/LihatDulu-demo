export const VIEW_IDS = Object.freeze(['front','left','right','rear','top','interior','drawer','rear-lower','underside']);
export const DEFAULT_REPORT = Object.freeze({schema:1,asset:'cabinet-01-v1',name:'Lemari Kayu Sora',note:'Dipakai di ruang kerja. Silakan periksa tiga detail kondisi yang ditandai.',views:Object.freeze(VIEW_IDS.slice(0,7))});
export const freshReport = () => ({...DEFAULT_REPORT, views:[...DEFAULT_REPORT.views]});
export const CONDITION_IDS = Object.freeze(['scratch','chip','mark']);
const DEFAULT_CONDITION_NOTES = Object.freeze([
  Object.freeze({id:'scratch',note:'Goresan memanjang terlihat pada permukaan pintu kiri. Periksa dari dekat sebelum memutuskan.'}),
  Object.freeze({id:'chip',note:'Bagian kecil pada tepi kanan atas terkelupas. Detail tetap terlihat saat kamu memutar model.'}),
  Object.freeze({id:'mark',note:'Bekas lingkaran samar pada bagian atas lemari. Perhatikan perubahan permukaan pada gambar detail.'})
]);
export const freshEditableReport = () => ({...freshReport(),schema:2,conditionNotes:DEFAULT_CONDITION_NOTES.map(value=>({...value})),dimensionsConfirmed:false});
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
function exact(value, keys) { if (!plain(value) || Object.keys(value).length !== keys.length || keys.some(key=>!Object.hasOwn(value,key))) throw new Error('Data tidak valid.'); }
function unicode(value) { return !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value); }
export function validateReport(value) {
  exact(value,value?.schema===2 ? ['schema','asset','name','note','views','conditionNotes','dimensionsConfirmed'] : ['schema','asset','name','note','views']);
  if(![1,2].includes(value.schema) || value.asset!==DEFAULT_REPORT.asset || typeof value.name!=='string' || typeof value.note!=='string' || !unicode(value.name) || !unicode(value.note)) throw new Error('Laporan tidak valid.');
  const name=value.name.trim();
  if(!name || name.length>80 || value.note.length>1200 || !Array.isArray(value.views) || value.views.length>9 || value.views.some(id=>!VIEW_IDS.includes(id)) || new Set(value.views).size!==value.views.length) throw new Error('Laporan melewati batas yang diizinkan.');
  const report={schema:value.schema,asset:DEFAULT_REPORT.asset,name,note:value.note,views:VIEW_IDS.filter(id=>value.views.includes(id))};
  if(value.schema===2) {
    if(typeof value.dimensionsConfirmed!=='boolean' || !Array.isArray(value.conditionNotes) || value.conditionNotes.length>3) throw new Error('Tinjauan kondisi tidak valid.');
    const notes=value.conditionNotes.map(entry=>{
      exact(entry,['id','note']);
      if(!CONDITION_IDS.includes(entry.id) || typeof entry.note!=='string' || entry.note.length>600 || !unicode(entry.note)) throw new Error('Catatan kondisi tidak valid.');
      return {id:entry.id,note:entry.note};
    });
    if(new Set(notes.map(entry=>entry.id)).size!==notes.length) throw new Error('Catatan kondisi berulang.');
    report.conditionNotes=CONDITION_IDS.flatMap(id=>notes.filter(entry=>entry.id===id));
    report.dimensionsConfirmed=value.dimensionsConfirmed;
    if(new TextEncoder().encode(JSON.stringify(report)).length>9000) throw new Error('Jumlah teks laporan terlalu panjang untuk tautan.');
  }
  return report;
}
export function encodeReport(report) {
  const bytes=new TextEncoder().encode(JSON.stringify(validateReport(report)));
  let binary=''; for(const byte of bytes) binary+=String.fromCharCode(byte);
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeReport(encoded) {
  if(typeof encoded!=='string' || !encoded.length || encoded.length>12000 || !/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length%4===1) throw new Error('Tautan laporan tidak valid.');
  const binary=atob(encoded.replaceAll('-','+').replaceAll('_','/'));
  const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
  const report=validateReport(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
  if(encodeReport(report)!==encoded) throw new Error('Tautan laporan tidak kanonis.');
  return report;
}
export function makeReportURL(report, base=globalThis.location?.href ?? 'http://localhost/') {
  const url=new URL('/laporan',base); url.hash=`r=${encodeReport(report)}`; return url.href;
}
export function readReportURL(input=globalThis.location?.href ?? 'http://localhost/') {
  try { const url=new URL(input); const params=new URLSearchParams(url.hash.slice(1)); if(!params.has('r')) return {report:freshReport(),error:null}; if(params.getAll('r').length!==1) throw new Error(); return {report:decodeReport(params.get('r')),error:null}; }
  catch { return {report:freshReport(),error:'Tautan laporan rusak atau tidak didukung. Laporan contoh ditampilkan.'}; }
}
export const escapeHTML = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const KEYS={draft:'lihatdulu:draft:v1',saved:'lihatdulu:saved:v1',placements:'lihatdulu:placements:v1',workspace:'lihatdulu:workspace:v1',viewer:'lihatdulu:viewer:v1'};
const memory=new Map();
const fallbackKeys=new Set();
function storage() { try { return globalThis.localStorage ?? null; } catch { return null; } }
export function storageAvailable() { const target=storage(); if(!target)return false; try { const key='lihatdulu:probe'; target.setItem(key,'1'); target.removeItem(key); return true; } catch{return false;} }
function read(key) { let raw=memory.get(key); try { const stored=fallbackKeys.has(key) ? null : storage()?.getItem(key); if(stored!==null && stored!==undefined) raw=stored; } catch {} try{return JSON.parse(raw??'null');}catch{return null;} }
function write(key,value) { try {const raw=JSON.stringify(value); memory.set(key,raw); try{const target=storage(); if(target){target.setItem(key,raw); fallbackKeys.delete(key);}else fallbackKeys.add(key);}catch{fallbackKeys.add(key);} return true;}catch{return false;} }
// A single capture/workspace envelope makes saving a session and its task card atomic.
export function readLocalRecord(name) {if(!['workspace','viewer'].includes(name))return null; return read(KEYS[name]);}
export function writeLocalRecord(name,value) {if(!['workspace','viewer'].includes(name))return false; return write(KEYS[name],value);}
export function loadDraft() {try{return validateReport(read(KEYS.draft));}catch{return freshReport();}}
export function saveDraft(report) {try{return write(KEYS.draft,validateReport(report));}catch{return false;}}
function list(key,validator) {const values=read(key); if(!Array.isArray(values))return []; return values.slice(0,20).flatMap(value=>{try{return [validator(value)];}catch{return [];}});}
export const loadSavedReports=()=>list(KEYS.saved,validateReport);
export function saveReport(report) {try {const valid=validateReport(report), encoded=encodeReport(valid); return write(KEYS.saved,[valid,...loadSavedReports().filter(item=>encodeReport(item)!==encoded)].slice(0,20));} catch{return false;}}
export function validateRoom(room) {
  exact(room,['width','depth','x','z','rotation','fixture']);
  for(const [key,min,max] of [['width',1.2,10],['depth',1,10],['x',-10,10],['z',-10,10],['rotation',-180,180]]) if(typeof room[key]!=='number' || !Number.isFinite(room[key]) || room[key]<min || room[key]>max)throw new Error('Ukuran ruang tidak valid.');
  if(!['clear','door','drawer','wall'].includes(room.fixture))throw new Error('Detail ruang tidak valid.');
  return {width:room.width,depth:room.depth,x:room.x,z:room.z,rotation:room.rotation,fixture:room.fixture};
}
export const PLACEMENT_PREVIEW_LIMIT=100000;
export function validatePlacementPreview(value) {
  if(typeof value!=='string'||value.length>PLACEMENT_PREVIEW_LIMIT||!/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw new Error('Pratinjau penempatan tidak valid.');
  const encoded=value.slice(23),binary=atob(encoded);
  if(btoa(binary)!==encoded||binary.length<30||binary.slice(0,4)!=='RIFF'||binary.slice(8,12)!=='WEBP')throw new Error('Pratinjau penempatan tidak valid.');
  const byte=index=>binary.charCodeAt(index),u32=index=>(byte(index)+byte(index+1)*256+byte(index+2)*65536+byte(index+3)*16777216)>>>0;
  if(u32(4)!==binary.length-8)throw new Error('Pratinjau penempatan tidak lengkap.');
  let image=false;
  for(let offset=12;offset<binary.length;){
    if(offset+8>binary.length)throw new Error('Pratinjau penempatan tidak lengkap.');
    const type=binary.slice(offset,offset+4),size=u32(offset+4),start=offset+8,end=start+size;
    if(end>binary.length||end+(size%2)>binary.length)throw new Error('Pratinjau penempatan tidak lengkap.');
    let width,height;
    if(type==='VP8 '){
      if(size<10||binary.slice(start+3,start+6)!=='\x9d\x01\x2a')throw new Error('Pratinjau penempatan tidak valid.');
      const frame=byte(start)+byte(start+1)*256+byte(start+2)*65536,partition=frame>>>5;
      if((frame&1)||!(frame&16)||((frame>>>1)&7)>3||partition<1||size<=10+partition)throw new Error('Pratinjau penempatan tidak memiliki isi gambar.');
      width=(byte(start+6)+byte(start+7)*256)&16383;height=(byte(start+8)+byte(start+9)*256)&16383;image=true;
    }else if(type==='VP8L'){
      if(size<=5||byte(start)!==47)throw new Error('Pratinjau penempatan tidak valid.');
      const bits=u32(start+1);if(bits>>>29)throw new Error('Pratinjau penempatan tidak valid.');width=(bits&16383)+1;height=((bits>>>14)&16383)+1;image=true;
    }else if(type==='VP8X'){
      if(size!==10||(byte(start)&2))throw new Error('Pratinjau penempatan tidak valid.');
      width=1+byte(start+4)+byte(start+5)*256+byte(start+6)*65536;height=1+byte(start+7)+byte(start+8)*256+byte(start+9)*65536;
    }else if(type==='ANIM'||type==='ANMF')throw new Error('Pratinjau penempatan harus berupa gambar diam.');
    if(width!==undefined&&(width<1||height<1||width>400||height>300))throw new Error('Pratinjau penempatan terlalu besar.');
    offset=end+(size%2);
  }
  if(!image)throw new Error('Pratinjau penempatan tidak valid.');
  return value;
}
export function validatePlacementFit(value) {
  exact(value,['closedFits','doorsClear','drawerClear']);
  if(Object.values(value).some(v=>typeof v!=='boolean'))throw new Error('Hasil penempatan tidak valid.');
  return {closedFits:value.closedFits,doorsClear:value.doorsClear,drawerClear:value.drawerClear};
}
function placementFields(value,saved=false) {
  const keys=['report','room',...(saved?['savedAt']:[]),...(Object.hasOwn(value??{},'preview')?['preview']:[]),...(Object.hasOwn(value??{},'fit')?['fit']:[])];
  exact(value,keys);
  return {report:validateReport(value.report),room:validateRoom(value.room),...(Object.hasOwn(value,'preview')?{preview:validatePlacementPreview(value.preview)}:{}),...(Object.hasOwn(value,'fit')?{fit:validatePlacementFit(value.fit)}:{})};
}
function validatePlacement(value) {const fields=placementFields(value,true); if(typeof value.savedAt!=='string' || !Number.isFinite(Date.parse(value.savedAt)))throw new Error(); return {...fields,savedAt:new Date(value.savedAt).toISOString()};}
export const loadPlacements=()=>list(KEYS.placements,validatePlacement);
export function savePlacement(value) {try {const placement={...placementFields(value),savedAt:new Date().toISOString()}; return write(KEYS.placements,[placement,...loadPlacements()].slice(0,20));}catch{return false;}}
function remove(key,items,index) {if(!Number.isInteger(index)||index<0||index>=items.length)return false; items.splice(index,1);return write(key,items);}
export const removeSavedReport=index=>remove(KEYS.saved,loadSavedReports(),index);
export const removePlacement=index=>remove(KEYS.placements,loadPlacements(),index);
export function clearLocalData() {memory.clear(); fallbackKeys.clear(); for(const key of Object.values(KEYS))try{storage()?.removeItem(key);}catch{} return true;}
