import { CONDITION_IDS, VIEW_IDS, readLocalRecord, writeLocalRecord, validateRoom } from './state.js';

export const CAMERA_VIEWS=Object.freeze(['overview','front-left','front-right',...VIEW_IDS]);
export const VIEWER_TOOLS=Object.freeze(['model','condition','opening','size','room']);
export const ROOM_TABS=Object.freeze(['size','position','fixtures']);
const CAPTURE_PHASES=['prepare','exterior','interior','review'];
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
function exact(value,keys){if(!plain(value)||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))throw new Error('Tampilan tidak valid.');}
function number(value,min,max){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new Error('Angka tampilan tidak valid.');return value;}
function vector(value){if(!Array.isArray(value)||value.length!==3)throw new Error('Vektor kamera tidak valid.');return Array.from(value,v=>number(v,-30,30));}
export function validateViewState(value){
  exact(value,['schema','camera','view','condition','motions','dimensionsVisible','inRoom','roomState','captureScene']);
  exact(value.camera,['position','target']);exact(value.motions,['left','right','drawer']);exact(value.captureScene,['active','phase','area','progress']);
  if(value.schema!==1||!CAMERA_VIEWS.includes(value.view)||(value.condition!==null&&!CONDITION_IDS.includes(value.condition))||typeof value.dimensionsVisible!=='boolean'||typeof value.inRoom!=='boolean'||typeof value.captureScene.active!=='boolean'||!CAPTURE_PHASES.includes(value.captureScene.phase)||![...CAMERA_VIEWS,...CONDITION_IDS].includes(value.captureScene.area))throw new Error('Tampilan tidak valid.');
  const camera={position:vector(value.camera.position),target:vector(value.camera.target)};
  const distance=Math.hypot(...camera.position.map((v,i)=>v-camera.target[i]));
  if(distance<.065-1e-7||distance>12+1e-7||Math.hypot(...camera.target)>18+1e-7)throw new Error('Jarak kamera tidak valid.');
  if(value.captureScene.active&&(value.inRoom||value.dimensionsVisible||value.condition!==null))throw new Error('Mode tampilan tidak valid.');
  const result={schema:1,camera,view:value.view,condition:value.condition,motions:{left:number(value.motions.left,0,100),right:number(value.motions.right,0,100),drawer:number(value.motions.drawer,0,.3)},dimensionsVisible:value.dimensionsVisible,inRoom:value.inRoom,roomState:validateRoom(value.roomState),captureScene:{active:value.captureScene.active,phase:value.captureScene.phase,area:value.captureScene.area,progress:number(value.captureScene.progress,0,1)}};
  if(JSON.stringify(result).length>3000)throw new Error('Tampilan terlalu panjang.');
  return result;
}
export function validateViewerSession(value){
  exact(value,['schema','mode','chapter','tool','roomTab','freeView','guidedView','area','taken']);
  if(value.schema!==1||!['guided','free'].includes(value.mode)||!Number.isInteger(value.chapter)||value.chapter<0||value.chapter>9||!VIEWER_TOOLS.includes(value.tool)||!ROOM_TABS.includes(value.roomTab)||!VIEW_IDS.includes(value.area)||!Array.isArray(value.taken)||value.taken.length>9||Array.from(value.taken).some(id=>!VIEW_IDS.includes(id))||new Set(value.taken).size!==value.taken.length)throw new Error('Sesi tampilan tidak valid.');
  const result={schema:1,mode:value.mode,chapter:value.chapter,tool:value.tool,roomTab:value.roomTab,freeView:value.freeView===null?null:validateViewState(value.freeView),guidedView:value.guidedView===null?null:validateViewState(value.guidedView),area:value.area,taken:VIEW_IDS.filter(id=>value.taken.includes(id))};
  if(JSON.stringify(result).length>6000)throw new Error('Sesi tampilan terlalu panjang.');
  return result;
}
function validKey(value){if(typeof value!=='string'||!value.length||value.length>12000||!/^[-_A-Za-z0-9]+$/.test(value))throw new Error('Kunci laporan tidak valid.');return value;}
function entries(){
  const value=readLocalRecord('viewer');
  try{exact(value,['schema','entries']);if(value.schema!==1||!Array.isArray(value.entries)||value.entries.length>20)throw new Error();}catch{return [];}
  const seen=new Set();
  return value.entries.flatMap(entry=>{try{exact(entry,['key','session']);const key=validKey(entry.key),session=validateViewerSession(entry.session);if(seen.has(key))return [];seen.add(key);return [{key,session}];}catch{return [];}});
}
export function loadViewerSession(reportKey){try{const key=validKey(reportKey);return entries().find(entry=>entry.key===key)?.session??null;}catch{return null;}}
export function saveViewerSession(reportKey,session){try{const key=validKey(reportKey),value=validateViewerSession(session);return writeLocalRecord('viewer',{schema:1,entries:[{key,session:value},...entries().filter(entry=>entry.key!==key)].slice(0,20)});}catch{return false;}}
