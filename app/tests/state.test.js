import test from 'node:test';
import assert from 'node:assert/strict';
import * as state from '../src/state.js';

test('Unicode snapshots round-trip and views normalize to canonical order', () => {
  const report = {...state.freshReport(), name:'  Lemari 🌿 日本語  ', note:'Kondisi café — retak kecil 🪵', views:['drawer','front']};
  const actual = state.decodeReport(state.encodeReport(report));
  assert.equal(actual.name,'Lemari 🌿 日本語');
  assert.equal(actual.note,report.note);
  assert.deepEqual(actual.views,['front','drawer']);
  const url = state.makeReportURL(report,'https://example.test/path?q=1');
  assert.equal(new URL(url).pathname,'/laporan');
  assert.equal(new URL(url).search,'');
  assert.deepEqual(state.readReportURL(url).report,actual);
});
test('rejects unknown fields, duplicates, excessive input and broken UTF8', () => {
  assert.throws(()=>state.validateReport({...state.freshReport(), html:'x'}));
  assert.throws(()=>state.validateReport({...state.freshReport(), views:['front','front']}));
  assert.throws(()=>state.validateReport({...state.freshReport(), name:'\ud800'}));
  for (const input of ['!', 'a'.repeat(12001), '_w', 'e30']) assert.throws(()=>state.decodeReport(input));
  const result=state.readReportURL('https://example.test/laporan#r=!');
  assert.ok(result.error); assert.deepEqual(result.report,state.DEFAULT_REPORT);
});
test('defaults are fresh and escaping covers every HTML delimiter', () => {
  const report=state.freshReport(); report.views.pop();
  assert.equal(state.freshReport().views.length,7);
  assert.equal(state.escapeHTML('<a "x" \'y\'>&'), '&lt;a &quot;x&quot; &#39;y&#39;&gt;&amp;');
});
test('unavailable storage falls back, deduplicates, caps and validates placements', () => {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('disabled');}});
  state.clearLocalData(); assert.equal(state.storageAvailable(),false);
  assert.equal(state.saveDraft(state.freshReport()),true);
  assert.deepEqual(state.loadDraft(),state.freshReport());
  state.saveReport(state.freshReport()); state.saveReport(state.freshReport());
  assert.equal(state.loadSavedReports().length,1);
  for(let i=0;i<25;i++) state.saveReport({...state.freshReport(),name:`Report ${i}`});
  assert.equal(state.loadSavedReports().length,20);
  const room={width:3,depth:4,x:0,z:0,rotation:90,fixture:'door'};
  assert.equal(state.savePlacement({report:state.freshReport(),room}),true);
  assert.equal(state.savePlacement({report:state.freshReport(),room:{...room,width:99}}),false);
  const placement=state.loadPlacements()[0]; assert.deepEqual(placement.room,room);
  assert.ok(Number.isFinite(Date.parse(placement.savedAt)));
  state.removePlacement(0); assert.equal(state.loadPlacements().length,0);
  state.removeSavedReport(0); assert.equal(state.loadSavedReports().length,19);
});
test('corrupted stored records cannot inject report fields', () => {
  const data=new Map(); Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}});
  state.clearLocalData(); state.saveDraft(state.freshReport());
  for(const key of data.keys()) data.set(key,'{"schema":1,"html":"<script>"}');
  assert.deepEqual(state.loadDraft(),state.freshReport());
});
test('quota failures retain newest draft in memory despite stale durable data', () => {
  const data=new Map(); let quota=false;
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)??null,setItem(k,v){if(quota)throw new Error('QuotaExceeded');data.set(k,v);},removeItem:k=>data.delete(k)}});
  state.clearLocalData(); state.saveDraft(state.freshReport()); quota=true;
  assert.equal(state.saveDraft({...state.freshReport(),name:'Newest'}),true);
  assert.equal(state.loadDraft().name,'Newest');
  assert.equal(state.storageAvailable(),false);
});
test('numeric room boundaries and malformed snapshots are enforced', () => {
  const room={width:1.2,depth:1,x:-10,z:10,rotation:-180,fixture:'clear'};
  assert.equal(state.savePlacement({report:state.freshReport(),room}),true);
  assert.equal(state.savePlacement({report:state.freshReport(),room:{...room,x:NaN}}),false);
  assert.equal(state.savePlacement({report:state.freshReport(),room:{...room,fixture:'script'}}),false);
  assert.ok(state.readReportURL('https://example.test/#r=x&r=y').error);
  assert.equal(state.readReportURL('https://example.test/').error,null);
});

test('schema 2 snapshots preserve Unicode condition evidence and dimension confirmation', () => {
  const report = {...state.freshReport(), schema:2, name:'Lemari 日本語 🪵', conditionNotes:[{id:'mark',note:'Bekas café terlihat'},{id:'scratch',note:'Goresan 11 cm 🌿'}], dimensionsConfirmed:true};
  const actual=state.decodeReport(state.encodeReport(report));
  assert.equal(actual.schema,2);
  assert.deepEqual(actual.conditionNotes,[{id:'scratch',note:'Goresan 11 cm 🌿'},{id:'mark',note:'Bekas café terlihat'}]);
  assert.equal(actual.dimensionsConfirmed,true);
  assert.deepEqual(state.readReportURL(state.makeReportURL(report,'https://example.test')).report,actual);
});
test('schema 2 rejects unbounded, duplicated or malformed condition annotations', () => {
  const report={...state.freshReport(),schema:2,conditionNotes:[],dimensionsConfirmed:false};
  assert.deepEqual(state.validateReport(report).conditionNotes,[]);
  assert.throws(()=>state.validateReport({...report,dimensionsConfirmed:'yes'}));
  assert.throws(()=>state.validateReport({...report,conditionNotes:[{id:'scratch',note:'x'.repeat(601)}]}));
  assert.throws(()=>state.validateReport({...report,conditionNotes:[{id:'scratch',note:'\ud800'}]}));
  assert.throws(()=>state.validateReport({...report,conditionNotes:[{id:'scratch',note:'a'},{id:'scratch',note:'b'}]}));
  assert.throws(()=>state.validateReport({...report,conditionNotes:[{id:'unknown',note:'a'}]}));
  assert.throws(()=>state.validateReport({...report,conditionNotes:[{id:'scratch',note:'a',html:'x'}]}));
  assert.throws(()=>state.validateReport({...state.freshReport(),conditionNotes:[]}));
});
test('schema 2 aggregate byte bounds guarantee URL length and reject oversized Unicode', () => {
  const report={...state.freshReport(),schema:2,name:'A'.repeat(80),note:'🪵'.repeat(600),conditionNotes:['scratch','chip','mark'].map(id=>({id,note:'語'.repeat(500)})),dimensionsConfirmed:false};
  const encoded=state.encodeReport(report);
  assert.ok(encoded.length<=12000);
  assert.deepEqual(state.decodeReport(encoded),state.validateReport(report));
  assert.throws(()=>state.validateReport({...report,name:'語'.repeat(80),note:'語'.repeat(1200),conditionNotes:['scratch','chip','mark'].map(id=>({id,note:'語'.repeat(600)}))}));
  assert.throws(()=>state.decodeReport('a'.repeat(12001)));
});
test('editable defaults isolate condition notes and local collections retain schema 2', () => {
  state.clearLocalData();
  const report=state.freshEditableReport();
  report.conditionNotes[0].note='Edited only here';
  assert.notEqual(state.freshEditableReport().conditionNotes[0].note,'Edited only here');
  assert.equal(state.saveDraft(report),true);
  assert.deepEqual(state.loadDraft(),report);
  assert.equal(state.saveReport(report),true);
  assert.deepEqual(state.loadSavedReports(),[report]);
  assert.equal(state.savePlacement({report,room:{width:3,depth:4,x:0,z:0,rotation:0,fixture:'clear'}}),true);
  assert.deepEqual(state.loadPlacements()[0].report,report);
});
