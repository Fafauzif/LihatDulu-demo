import test from 'node:test';
import assert from 'node:assert/strict';
import { clearLocalData, freshReport, loadPlacements, savePlacement } from '../src/state.js';
const preview='data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoCAAIAAUAmJaACdLoB+AADsAD+82mX/mwIGaH0wf+mkeNI8aR8poAA';
const room={width:3,depth:4,x:.3,z:-.5,rotation:45,fixture:'door'};
const fit={closedFits:true,doorsClear:false,drawerClear:true};
function store() { const data=new Map(); Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}}); clearLocalData(); return data; }
test('saved authored room previews and independent fit results survive reload', async () => {
  store(); assert.equal(savePlacement({report:freshReport(),room,preview,fit}),true);
  const reload=await import(`../src/state.js?placement=${Date.now()}`);
  assert.equal(reload.loadPlacements()[0].preview,preview); assert.deepEqual(reload.loadPlacements()[0].fit,fit);
  assert.deepEqual(reload.loadPlacements()[0].room,room);
});
test('legacy placements stay readable and absent fit remains uncomputed', () => {
  const data=store(); data.set('lihatdulu:placements:v1',JSON.stringify([{report:freshReport(),room,savedAt:'2025-01-01T12:00:00Z'}]));
  assert.equal(loadPlacements().length,1); assert.equal(Object.hasOwn(loadPlacements()[0],'preview'),false); assert.equal(Object.hasOwn(loadPlacements()[0],'fit'),false);
  assert.equal(savePlacement({report:freshReport(),room,preview}),true);
  assert.equal(Object.hasOwn(loadPlacements()[0],'fit'),false);
});
test('preview permits only bounded valid local WebP and rejects DOM/URL payloads', () => {
  store(); assert.equal(savePlacement({report:freshReport(),room,preview}),true);
  for(const value of ['https://evil.test/image.webp','javascript:alert(1)','data:image/svg+xml,<svg onload=alert(1)>','data:text/html;base64,PHNjcmlwdD4=','data:image/webp;base64,PHNjcmlwdD4=','data:image/webp;base64,UklGRjoAAABXRUJQ',preview+'<script>','data:image/webp;base64,'+'A'.repeat(100001),null]) assert.equal(savePlacement({report:freshReport(),room,preview:value}),false,value?.slice(0,60));
  assert.equal(loadPlacements().length,1);
});
test('WebP headers without compressed image content cannot become saved thumbnails', () => {
  store();
  const header=Buffer.alloc(30);header.write('RIFF',0);header.writeUInt32LE(22,4);header.write('WEBP',8);header.write('VP8 ',12);header.writeUInt32LE(10,16);header.set([0x9d,1,0x2a],23);header.writeUInt16LE(2,26);header.writeUInt16LE(2,28);
  assert.equal(savePlacement({report:freshReport(),room,preview:'data:image/webp;base64,'+header.toString('base64')}),false);
  const lossless=Buffer.alloc(26);lossless.write('RIFF',0);lossless.writeUInt32LE(18,4);lossless.write('WEBP',8);lossless.write('VP8L',12);lossless.writeUInt32LE(5,16);lossless[20]=0x2f;
  assert.equal(savePlacement({report:freshReport(),room,preview:'data:image/webp;base64,'+lossless.toString('base64')}),false);
  assert.equal(loadPlacements().length,0);
});
test('fit requires exact independent booleans and unknown placement fields are rejected', () => {
  store(); assert.equal(savePlacement({report:freshReport(),room,fit}),true);
  for(const value of [{closedFits:1,doorsClear:false,drawerClear:true},{closedFits:true,doorsClear:false},{...fit,conflicts:[]},null]) assert.equal(savePlacement({report:freshReport(),room,fit:value}),false);
  assert.equal(savePlacement({report:freshReport(),room,preview,fit,html:'<img>'}),false);
  assert.deepEqual(loadPlacements()[0].fit,fit);
});
test('malformed optional fields in durable placements cannot be rendered as previews', () => {
  const data=store(); const item={report:freshReport(),room,savedAt:'2025-01-01T12:00:00Z'};
  data.set('lihatdulu:placements:v1',JSON.stringify([{...item,preview:'javascript:alert(1)'},{...item,fit:{...fit,doorsClear:'true'}},{...item,preview,fit}]));
  assert.equal(loadPlacements().length,1); assert.equal(loadPlacements()[0].preview,preview);
});
