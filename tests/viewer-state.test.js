import test from 'node:test';
import assert from 'node:assert/strict';
import { clearLocalData } from '../src/state.js';
const viewer = await import('../src/viewer-state.js').catch(()=>({}));
function api(name) { assert.equal(typeof viewer[name],'function',`viewer API ${name} must exist`); return viewer[name]; }
const room = {width:3.2,depth:3,x:.2,z:-.4,rotation:35,fixture:'drawer'};
const snapshot = () => ({schema:1,camera:{position:[2,2,3],target:[.2,.65,-.4]},view:'front',condition:'scratch',motions:{left:30,right:20,drawer:.2},dimensionsVisible:true,inRoom:true,roomState:{...room},captureScene:{active:false,phase:'prepare',area:'front',progress:0}});
const session = () => ({schema:1,mode:'free',chapter:5,tool:'room',roomTab:'fixtures',freeView:snapshot(),guidedView:{...snapshot(),inRoom:false,condition:null},area:'rear-lower',taken:['drawer','front']});
function store() {
  const data=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}});
  clearLocalData(); return data;
}
test('view snapshots retain camera target and independent physical state without sharing mutable input', () => {
  const source=snapshot(), value=api('validateViewState')(source);
  assert.deepEqual(value.camera,{position:[2,2,3],target:[.2,.65,-.4]});
  assert.deepEqual(value.motions,{left:30,right:20,drawer:.2});
  assert.deepEqual(value.roomState,room);
  source.camera.target[0]=99; source.roomState.x=99;
  assert.equal(value.camera.target[0],.2); assert.equal(value.roomState.x,.2);
  assert.deepEqual(JSON.parse(JSON.stringify(value)),value);
});
test('malformed vectors, impossible camera distance and arbitrary snapshot fields are rejected', () => {
  const validate=api('validateViewState');
  for(const camera of [{position:[1,2],target:[0,0,0]},{position:Array(3),target:[0,0,0]},{position:[NaN,2,3],target:[0,0,0]},{position:[0,0,0],target:[0,0,0]},{position:[100,0,0],target:[0,0,0]},{position:[26,0,0],target:[25,0,0]},{position:[2,2,3],target:[0,Infinity,0]}]) assert.throws(()=>validate({...snapshot(),camera}));
  for(const patch of [{html:'<script>'},{view:'javascript:alert(1)'},{condition:'<img>'},{motions:{left:101,right:0,drawer:0}},{roomState:{...room,fixture:'https://evil.test'}},{captureScene:{active:true,phase:'free',area:'front',progress:0}},{captureScene:{active:true,phase:'review',area:'front',progress:2}}]) assert.throws(()=>validate({...snapshot(),...patch}));
});
test('viewer sessions preserve independent guided/free setup and normalize recorded areas', () => {
  const value=api('validateViewerSession')(session());
  assert.equal(value.mode,'free'); assert.equal(value.chapter,5); assert.equal(value.tool,'room'); assert.equal(value.roomTab,'fixtures');
  assert.equal(value.freeView.inRoom,true); assert.equal(value.guidedView.inRoom,false);
  assert.deepEqual(value.taken,['front','drawer']);
  assert.throws(()=>viewer.validateViewerSession({...session(),mode:'orbit'}));
  assert.throws(()=>viewer.validateViewerSession({...session(),chapter:10}));
  assert.throws(()=>viewer.validateViewerSession({...session(),tool:'https://evil.test'}));
  assert.throws(()=>viewer.validateViewerSession({...session(),roomTab:'html'}));
  assert.throws(()=>viewer.validateViewerSession({...session(),taken:['front','front']}));
  assert.throws(()=>viewer.validateViewerSession({...session(),taken:Array(1)}));
  assert.throws(()=>viewer.validateViewerSession({...session(),taken:Array(10).fill('front')}));
  assert.throws(()=>viewer.validateViewerSession({...session(),area:'<script>'}));
  assert.throws(()=>viewer.validateViewerSession({...session(),arbitrary:'x'}));
});
test('viewer persistence survives reload, remains report scoped and rejects URL keys', async () => {
  store(); const save=api('saveViewerSession'), load=api('loadViewerSession');
  assert.equal(save('report_one',session()),true);
  assert.equal(save('report_two',{...session(),mode:'guided',chapter:2}),true);
  assert.equal(load('report_one').mode,'free'); assert.equal(load('report_two').chapter,2); assert.equal(load('missing'),null);
  const reload=await import(`../src/viewer-state.js?reload=${Date.now()}`);
  assert.equal(reload.loadViewerSession('report_one').freeView.roomState.rotation,35);
  for(const key of ['', 'a'.repeat(12001), 'https://evil.test', '<img src=x>']) {assert.equal(save(key,session()),false); assert.equal(load(key),null);}
});
test('viewer records are bounded and corrupt storage never becomes a session', () => {
  const data=store(); const save=api('saveViewerSession'),load=api('loadViewerSession');
  for(let i=0;i<23;i++) assert.equal(save(`report_${i}`,session()),true);
  assert.equal(load('report_0'),null); assert.equal(load('report_22').chapter,5);
  assert.equal(save('report_22',{...session(),mode:'broken'}),false);
  assert.equal(load('report_22').mode,'free');
  const key=[...data.keys()].find(value=>value.includes('viewer')); assert.ok(key);
  data.set(key,'{"schema":1,"entries":[{"key":"bad","session":{"html":"<script>"}}]}');
  assert.equal(load('bad'),null);
  clearLocalData(); assert.equal(load('report_22'),null);
});
test('blocked storage and quota failure keep the newest viewer setup in memory', () => {
  const data=store(); const save=api('saveViewerSession'),load=api('loadViewerSession');
  save('report_one',session());
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>data.get(key)??null,setItem(){throw new Error('quota');},removeItem:key=>data.delete(key)}});
  assert.equal(save('report_one',{...session(),chapter:9}),true); assert.equal(load('report_one').chapter,9);
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('blocked');}});
  assert.equal(save('report_two',{...session(),chapter:8}),true); assert.equal(load('report_two').chapter,8);
});

test('Sora inspection modes survive reload without replacing existing viewer sessions', async () => {
  const data = store();
  const legacy = session();
  assert.equal(viewer.saveViewerSession('legacy_report', legacy), true);
  const condition = { ...snapshot(), inRoom: false, dimensionsVisible: false, motions: { left: 35, right: 100, drawer: .3 } };
  const roomView = { ...snapshot(), condition: null, roomState: { ...room, width: 4.1, rotation: 60 } };
  const guideView = { ...condition, condition: null, captureScene: { active: true, phase: 'interior', area: 'drawer', progress: 2 / 3 } };
  for (const [mode, freeView] of [['condition', condition], ['room', roomView], ['guide', guideView]]) {
    assert.equal(viewer.saveViewerSession(`inspection-sora-${mode}`, { schema: 1, mode: 'free', chapter: 0, tool: mode === 'room' ? 'room' : mode === 'condition' ? 'condition' : 'model', roomTab: 'position', freeView, guidedView: null, area: 'front', taken: [] }), true);
  }
  const reloaded = await import(`../src/viewer-state.js?inspection-reload=${Date.now()}`);
  assert.deepEqual(reloaded.loadViewerSession('inspection-sora-condition').freeView.motions, condition.motions);
  assert.deepEqual(reloaded.loadViewerSession('inspection-sora-room').freeView.roomState, roomView.roomState);
  assert.deepEqual(reloaded.loadViewerSession('inspection-sora-guide').freeView.captureScene, guideView.captureScene);
  assert.deepEqual(reloaded.loadViewerSession('legacy_report'), viewer.validateViewerSession(legacy));
  const records = JSON.parse(data.get('lihatdulu:viewer:v1'));
  records.entries.find(entry => entry.key === 'inspection-sora-room').session.freeView.roomState.width = 1000;
  data.set('lihatdulu:viewer:v1', JSON.stringify(records));
  assert.equal(reloaded.loadViewerSession('inspection-sora-room'), null);
  assert.deepEqual(reloaded.loadViewerSession('legacy_report'), viewer.validateViewerSession(legacy));
});
