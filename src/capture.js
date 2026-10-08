import { VIEW_IDS, freshEditableReport, validateReport, readLocalRecord, writeLocalRecord } from './state.js';

export const CAPTURE_AREAS=Object.freeze([
  ['front','Depan','capture-front','exterior','Ambil seluruh bagian depan dengan lemari tetap di tengah bingkai.'],
  ['left','Sisi kiri','capture-left','exterior','Bergerak ke sisi kiri dan sisakan sedikit ruang di tepi gambar.'],
  ['right','Sisi kanan','capture-right','exterior','Pastikan panel kanan dan sudut atas terlihat jelas.'],
  ['rear','Belakang','capture-rear','exterior','Dokumentasikan panel belakang jika kamu dapat mengaksesnya dengan aman.'],
  ['top','Permukaan atas','capture-top','exterior','Arahkan kamera ke panel atas; ambil detail noda secara terpisah.'],
  ['interior','Bagian dalam','capture-interior','interior','Buka pintu dan dokumentasikan rak serta bagian dalam.'],
  ['drawer','Laci','capture-drawer','interior','Tarik laci dan perlihatkan dasar serta ruang penyimpanannya.'],
  ['rear-lower','Belakang bawah','capture-rear','exterior','Ambil sudut belakang bawah tanpa memindahkan barang secara berisiko.'],
  ['underside','Bagian bawah','capture-underside','exterior','Jika bagian bawah tidak dapat dijangkau, tandai area belum didokumentasikan.']
].map(([id,label,image,group,hint])=>Object.freeze({id,label,image,group,hint})));

const LIMIT=20;
const PHASES=['prepare','capture','review','ready'];
const AREA_STATUSES=['pending','captured','skipped','retake'];
const WORKSPACE_STATUSES=['not-started','capturing','review','shared'];
const plain=value=>value!==null && typeof value==='object' && !Array.isArray(value) && (Object.getPrototypeOf(value)===Object.prototype || Object.getPrototypeOf(value)===null);
function exact(value,keys) {if(!plain(value)||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))throw new Error('Data rekaman tidak valid.');}
function validId(value) {if(typeof value!=='string'||! /^[a-z0-9][a-z0-9-]{3,80}$/.test(value))throw new Error('ID rekaman tidak valid.');return value;}
function date(value) {if(typeof value!=='string'||value.length>40||!Number.isFinite(Date.parse(value)))throw new Error('Waktu rekaman tidak valid.');return new Date(value).toISOString();}
const now=()=>new Date().toISOString();
function editable(report) {
  const valid=validateReport(report);
  if(valid.schema===2)return valid;
  return validateReport({...freshEditableReport(),...valid,schema:2});
}
function viewsOf(areas) {return VIEW_IDS.filter(id=>areas[id]==='captured');}
function validateCapture(value) {
  exact(value,['schema','id','createdAt','updatedAt','phase','activeArea','report','areas']);
  if(value.schema!==1||!PHASES.includes(value.phase)||!VIEW_IDS.includes(value.activeArea))throw new Error('Tahap rekaman tidak valid.');
  exact(value.areas,VIEW_IDS);
  if(VIEW_IDS.some(id=>!AREA_STATUSES.includes(value.areas[id])))throw new Error('Status area tidak valid.');
  const areas=Object.fromEntries(VIEW_IDS.map(id=>[id,value.areas[id]]));
  const report=editable(value.report);
  report.views=viewsOf(areas);
  return {schema:1,id:validId(value.id),createdAt:date(value.createdAt),updatedAt:date(value.updatedAt),phase:value.phase,activeArea:value.activeArea,report,areas};
}
function validateItem(value) {
  exact(value,['id','report','captureId','status','isSample','archived','createdAt','updatedAt']);
  if(!WORKSPACE_STATUSES.includes(value.status)||typeof value.isSample!=='boolean'||typeof value.archived!=='boolean')throw new Error('Status laporan tidak valid.');
  return {id:validId(value.id),report:validateReport(value.report),captureId:value.captureId===null?null:validId(value.captureId),status:value.status,isSample:value.isSample,archived:value.archived,createdAt:date(value.createdAt),updatedAt:date(value.updatedAt)};
}
function freshEnvelope() {
  const timestamp=now();
  const samples=[
    {id:'sample-new',name:'Lemari Sora · Rekaman baru',phase:'prepare',captured:[],skipped:[],retake:[],status:'not-started'},
    {id:'sample-capture',name:'Lemari Sora · Rekaman berlanjut',phase:'capture',captured:['front','left'],skipped:[],retake:['right'],status:'capturing'},
    {id:'sample-review',name:'Lemari Sora · Tinjau laporan',phase:'review',captured:VIEW_IDS.slice(0,7),skipped:VIEW_IDS.slice(7),retake:[],status:'review'}
  ];
  const sessions=samples.map(sample=>{
    const report={...freshEditableReport(),name:sample.name,note:'Skenario contoh dari lemari yang sama. Data dan perekaman dalam prototipe ini merupakan simulasi.',views:[...sample.captured]};
    const areas=Object.fromEntries(VIEW_IDS.map(id=>[id,sample.captured.includes(id)?'captured':sample.skipped.includes(id)?'skipped':sample.retake.includes(id)?'retake':'pending']));
    return validateCapture({schema:1,id:sample.id,createdAt:timestamp,updatedAt:timestamp,phase:sample.phase,activeArea:sample.retake[0]??'front',report,areas});
  });
  const items=samples.map((sample,index)=>validateItem({id:sample.id,report:sessions[index].report,captureId:sample.id,status:sample.status,isSample:true,archived:false,createdAt:timestamp,updatedAt:timestamp}));
  return {schema:1,currentId:null,items,sessions};
}
function uniqueValid(values,validator) {
  if(!Array.isArray(values))return [];
  const found=new Set();
  return values.slice(0,LIMIT).flatMap(value=>{try{const valid=validator(value);if(found.has(valid.id))return [];found.add(valid.id);return [valid];}catch{return [];}});
}
function envelope() {
  const raw=readLocalRecord('workspace');
  if(raw===null) {const seed=freshEnvelope();writeLocalRecord('workspace',seed);return seed;}
  try {
    exact(raw,['schema','currentId','items','sessions']);
    if(raw.schema!==1)throw new Error();
    const sessions=uniqueValid(raw.sessions,validateCapture);
    const items=uniqueValid(raw.items,validateItem);
    const currentId=raw.currentId===null?null:validId(raw.currentId);
    return {schema:1,currentId:sessions.some(session=>session.id===currentId)?currentId:null,items,sessions};
  } catch {return {schema:1,currentId:null,items:[],sessions:[]};}
}
function persist(value) {
  value.items=value.items.slice(0,LIMIT);
  const ids=new Set(value.items.map(item=>item.captureId).filter(Boolean));
  value.sessions=value.sessions.filter(session=>ids.has(session.id)).slice(0,LIMIT);
  if(!value.sessions.some(session=>session.id===value.currentId))value.currentId=null;
  return writeLocalRecord('workspace',value);
}
function prepend(list,value) {return [value,...list.filter(entry=>entry.id!==value.id)].slice(0,LIMIT);}
function sessionStatus(session) {return ({prepare:'not-started',capture:'capturing',review:'review',ready:'shared'})[session.phase];}

export function createCapture(report) {
  const timestamp=now();
  const source=report===undefined?{...freshEditableReport(),views:[]}:editable(report);
  const id=`cap-${globalThis.crypto?.randomUUID?.()??`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`}`;
  return validateCapture({schema:1,id,createdAt:timestamp,updatedAt:timestamp,phase:'prepare',activeArea:'front',report:source,areas:Object.fromEntries(VIEW_IDS.map(id=>[id,source.views.includes(id)?'captured':'pending']))});
}
export function loadCapture(id) {
  if(id!==undefined)try{validId(id);}catch{return null;}
  const data=envelope(),target=id??data.currentId;
  const session=data.sessions.find(value=>value.id===target);
  return session?validateCapture(session):null;
}
export function saveCapture(session) {
  try {
    const valid=validateCapture(session);valid.updatedAt=now();
    const data=envelope();
    const old=data.items.find(item=>item.captureId===valid.id);
    const item=validateItem({id:old?.id??valid.id,report:valid.report,captureId:valid.id,status:sessionStatus(valid),isSample:old?.isSample??false,archived:old?.archived??false,createdAt:old?.createdAt??valid.createdAt,updatedAt:valid.updatedAt});
    data.sessions=prepend(data.sessions,valid);data.items=prepend(data.items,item);data.currentId=valid.id;
    return persist(data);
  }catch{return false;}
}
export function markArea(session,id,status) {
  if(!VIEW_IDS.includes(id)||!['captured','skipped','retake'].includes(status))throw new Error('Pilihan area tidak valid.');
  const valid=validateCapture(session);
  valid.areas[id]=status;valid.activeArea=id;valid.updatedAt=now();
  if(valid.phase==='prepare'||valid.phase==='ready')valid.phase='capture';
  valid.report.views=viewsOf(valid.areas);
  return valid;
}
export function captureReport(session) {return validateCapture(session).report;}
export function listWorkspace() {return envelope().items.filter(item=>!item.archived).map(validateItem);}
export function upsertWorkspace(item) {
  try {
    const valid=validateItem(item),data=envelope();valid.updatedAt=now();
    if(valid.captureId!==null) {
      const session=data.sessions.find(entry=>entry.id===valid.captureId);
      if(!session)return false;
      session.report=editable(valid.report);session.report.views=viewsOf(session.areas);
      session.phase=({ 'not-started':'prepare',capturing:'capture',review:'review',shared:'ready'})[valid.status];
      session.updatedAt=valid.updatedAt;valid.report=validateReport(session.report);
      data.sessions=prepend(data.sessions,validateCapture(session));
    }
    data.items=prepend(data.items,valid);return persist(data);
  }catch{return false;}
}
export function archiveWorkspace(id) {
  try {
    validId(id);const data=envelope(),item=data.items.find(entry=>entry.id===id);
    if(!item||item.archived)return false;
    item.archived=true;item.updatedAt=now();return persist(data);
  }catch{return false;}
}
export function workspaceSummary(item) {
  const valid=validateItem(item),captured=valid.report.views.length,missing=VIEW_IDS.filter(id=>!valid.report.views.includes(id));
  const labels={'not-started':'Belum direkam',capturing:'Rekaman belum lengkap',review:'Perlu ditinjau',shared:'Siap dibagikan'};
  const actions={'not-started':'Mulai rekaman',capturing:'Lanjutkan rekaman',review:'Tinjau laporan',shared:'Lihat laporan'};
  return {label:labels[valid.status],nextAction:actions[valid.status],progress:Math.round(captured/VIEW_IDS.length*100),captured,missing};
}
