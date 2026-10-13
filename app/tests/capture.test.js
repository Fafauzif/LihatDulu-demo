import test from 'node:test';
import assert from 'node:assert/strict';
import * as state from '../src/state.js';
const capture=await import('../src/capture.js').catch(()=>({}));
function requireAPI(name) {assert.equal(typeof capture[name],'function',`capture API ${name} must exist`);return capture[name];}
function resetStorage() {
  const data=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)}});
  state.clearLocalData(); return data;
}
function create(report) {return requireAPI('createCapture')(report);}

test('a new capture starts empty and never silently resumes another item', () => {
  resetStorage(); const first=create(), second=create();
  assert.notEqual(first.id,second.id);
  assert.equal(first.phase,'prepare');
  assert.equal(first.report.schema,2);
  assert.equal(first.report.dimensionsConfirmed,false);
  assert.deepEqual(first.report.views,[]);
  assert.equal(Object.values(first.areas).filter(status=>status==='pending').length,9);
  assert.equal(requireAPI('loadCapture')(),null);
});
test('capture areas cover existing exterior, interior and lower surfaces', () => {
  assert.ok(Array.isArray(capture.CAPTURE_AREAS));
  assert.deepEqual(capture.CAPTURE_AREAS.map(area=>area.id),state.VIEW_IDS);
  assert.equal(capture.CAPTURE_AREAS.find(area=>area.id==='interior').group,'interior');
  assert.equal(capture.CAPTURE_AREAS.find(area=>area.id==='front').group,'exterior');
  assert.ok(capture.CAPTURE_AREAS.every(area=>area.label && area.hint && area.image));
});
test('captured, skipped and retake statuses remain separate in an immutable report', () => {
  resetStorage(); const original=create();
  const mark=requireAPI('markArea');
  let session=mark(original,'front','captured');
  session=mark(session,'rear','skipped');
  session=mark(session,'left','captured');
  session=mark(session,'left','retake');
  assert.equal(original.areas.front,'pending');
  assert.equal(session.phase,'capture');
  assert.equal(session.areas.rear,'skipped');
  assert.equal(session.areas.left,'retake');
  const report=requireAPI('captureReport')(session);
  assert.deepEqual(report.views,['front']);
  assert.equal(session.report.views.includes('rear'),false);
  assert.throws(()=>mark(session,'unknown','captured'));
  assert.throws(()=>mark(session,'front','verified'));
});
test('session persistence resumes current or selected report after a module reload', async () => {
  resetStorage(); let session=create();
  session=requireAPI('markArea')(session,'front','captured');
  session={...session,activeArea:'right',phase:'review',report:{...session.report,name:'Lemari 日本語 🪵',conditionNotes:[{id:'scratch',note:'Goresan café 🌿'}]}};
  assert.equal(requireAPI('saveCapture')(session),true);
  const second=create(); assert.equal(capture.saveCapture(second),true);
  const reloaded=await import(`../src/capture.js?reload=${Date.now()}`);
  assert.equal(reloaded.loadCapture().id,second.id);
  assert.equal(reloaded.loadCapture(session.id).activeArea,'right');
  assert.deepEqual(reloaded.captureReport(reloaded.loadCapture(session.id)).conditionNotes,[{id:'scratch',note:'Goresan café 🌿'}]);
  assert.equal(reloaded.loadCapture('missing-item'),null);
});
test('workspace sample states have separate resumable sessions and useful next actions', () => {
  resetStorage(); const items=requireAPI('listWorkspace')();
  assert.equal(items.length,3);
  assert.deepEqual(new Set(items.map(item=>item.status)),new Set(['not-started','capturing','review']));
  assert.ok(items.every(item=>item.isSample && !item.archived));
  for(const item of items) {
    const session=requireAPI('loadCapture')(item.captureId);
    assert.ok(session);
    assert.deepEqual(requireAPI('captureReport')(session),item.report);
    const summary=requireAPI('workspaceSummary')(item);
    assert.ok(summary.label && summary.nextAction);
  }
  const incomplete=items.find(item=>item.status==='capturing');
  const review=items.find(item=>item.status==='review');
  assert.notEqual(incomplete.captureId,review.captureId);
  const session=capture.markArea(capture.loadCapture(incomplete.captureId),'front','retake');
  capture.saveCapture(session);
  assert.deepEqual(capture.loadCapture(review.captureId).report,review.report);
});
test('saving a session synchronizes its task card and publishing preserves missing coverage', () => {
  resetStorage(); let session=create();
  session=requireAPI('markArea')(session,'front','captured');
  session=requireAPI('markArea')(session,'rear','skipped');
  session={...session,phase:'review'};
  assert.equal(requireAPI('saveCapture')(session),true);
  let item=capture.listWorkspace().find(item=>item.id===session.id);
  assert.equal(item.status,'review');
  assert.deepEqual(item.report.views,['front']);
  assert.equal(requireAPI('upsertWorkspace')({...item,status:'shared',report:{...item.report,dimensionsConfirmed:true}}),true);
  item=capture.listWorkspace().find(item=>item.id===session.id);
  assert.equal(item.status,'shared');
  assert.deepEqual(state.decodeReport(state.encodeReport(item.report)).views,['front']);
});
test('archiving survives reload and does not recreate the sample task', async () => {
  resetStorage(); const items=requireAPI('listWorkspace')();
  assert.equal(requireAPI('archiveWorkspace')(items[0].id),true);
  assert.equal(capture.archiveWorkspace('does-not-exist'),false);
  const reloaded=await import(`../src/capture.js?archive=${Date.now()}`);
  assert.equal(reloaded.listWorkspace().some(item=>item.id===items[0].id),false);
  assert.equal(reloaded.listWorkspace().length,2);
});
test('invalid input cannot corrupt capture persistence or inject workspace fields', () => {
  const data=resetStorage(); const session=create();
  assert.equal(requireAPI('saveCapture')(session),true);
  assert.equal(capture.saveCapture({...session,report:{...session.report,name:''}}),false);
  assert.equal(capture.saveCapture({...session,activeArea:'script'}),false);
  assert.equal(capture.saveCapture({...session,areas:{...session.areas,front:'verified'}}),false);
  assert.equal(capture.saveCapture({...session,html:'<script>'}),false);
  assert.equal(capture.saveCapture({...session,report:{...session.report,note:'\ud800'}}),false);
  const item=capture.listWorkspace().find(item=>item.id===session.id);
  assert.equal(requireAPI('upsertWorkspace')({...item,report:{...item.report,asset:'remote-url'}}),false);
  assert.equal(capture.upsertWorkspace({...item,html:'<script>'}),false);
  assert.equal(capture.loadCapture(session.id).report.name,session.report.name);
  data.set('lihatdulu:workspace:v1','{"schema":1,"currentId":"evil","items":[{"html":"<script>"}],"sessions":[{"html":"<script>"}]}');
  assert.deepEqual(capture.listWorkspace(),[]);
  assert.equal(capture.loadCapture('evil'),null);
});
test('workspace stays bounded and clearLocalData resets capture and sample fixtures', () => {
  resetStorage(); requireAPI('listWorkspace')();
  for(let i=0;i<25;i++) {
    const session=create(); session.report.name=`Item ${i}`;
    assert.equal(requireAPI('saveCapture')(session),true);
  }
  assert.equal(capture.listWorkspace().length,20);
  assert.equal(capture.loadCapture().report.name,'Item 24');
  state.clearLocalData();
  assert.equal(capture.loadCapture(),null);
  assert.equal(capture.listWorkspace().length,3);
});
test('blocked durable storage retains capture progress in the same session', () => {
  resetStorage(); let session=create(); requireAPI('saveCapture')(session);
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('disabled');}});
  session=requireAPI('markArea')(session,'right','captured');
  assert.equal(capture.saveCapture(session),true);
  assert.equal(capture.loadCapture(session.id).areas.right,'captured');
  assert.equal(state.storageAvailable(),false);
});
