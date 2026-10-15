import test from 'node:test';
import assert from 'node:assert/strict';

const video = await import('../src/video-state.js').catch(() => null);
const api = () => { assert.ok(video, 'prepared video state implementation exists'); return video; };
const store = () => { const data = new Map(); return { getItem:key => data.get(key) ?? null, setItem:(key,value) => data.set(key,value), removeItem:key => data.delete(key), data }; };

test('six prepared chapters share a bounded eighteen-second timeline', () => {
  const { PREPARED_AREAS, VIDEO_DURATION, freshVideoState, videoCoverage } = api();
  assert.equal(VIDEO_DURATION,18);
  assert.deepEqual(PREPARED_AREAS.map(a => a.id), ['front','right','rear','interior','drawer','scratch']);
  assert.deepEqual(PREPARED_AREAS.map(a => [a.start,a.end]), [[0,3],[3,6],[6,9],[9,12],[12,15],[15,18]]);
  const state = freshVideoState();
  assert.deepEqual(state,{schema:1,area:'front',elapsed:0,paused:true,selected:[]});
  assert.deepEqual(videoCoverage(state).missing,PREPARED_AREAS.map(a => a.id));
});

test('progress clamps finite media time without changing a manually chosen chapter', () => {
  const { freshVideoState, setVideoProgress, selectVideoArea } = api();
  const original=freshVideoState();
  assert.equal(setVideoProgress(original,100,false).elapsed,18);
  assert.equal(setVideoProgress(original,-2,true).elapsed,0);
  assert.equal(setVideoProgress(original,7.25,false).paused,false);
  assert.equal(original.elapsed,0);
  assert.throws(() => setVideoProgress(original,NaN,false));
  assert.throws(() => setVideoProgress(original,Infinity,false));
  const selected=selectVideoArea(original,'drawer');
  assert.equal(selected.elapsed,12);
  assert.equal(selected.paused,true);
  assert.equal(setVideoProgress(selected,13,false).area,'drawer');
});

test('restarting playback pauses at the front while preserving selected evidence', () => {
  const { freshVideoState, selectVideoArea, captureVideoArea, setVideoProgress, restartVideoPlayback, videoCoverage } = api();
  assert.equal(typeof restartVideoPlayback,'function');
  const state=setVideoProgress(captureVideoArea(selectVideoArea(captureVideoArea(freshVideoState()),'drawer')),14.5,false);
  const restarted=restartVideoPlayback(state);
  assert.equal(restarted.area,'front');
  assert.equal(restarted.elapsed,0);
  assert.equal(restarted.paused,true);
  assert.deepEqual(restarted.selected,state.selected);
  assert.deepEqual(videoCoverage(restarted).selected,['front','drawer']);
  assert.notEqual(restarted.selected,state.selected);
  assert.equal(state.elapsed,14.5);
  assert.equal(state.paused,false);
  assert.throws(() => restartVideoPlayback({...state,area:'unknown'}));
});

test('capture and retake replace unique evidence without mutating earlier state', () => {
  const { freshVideoState, captureVideoArea, selectVideoArea, videoCoverage } = api();
  const empty=freshVideoState();
  const first=captureVideoArea(empty);
  const retake=captureVideoArea(first);
  assert.equal(empty.selected.length,0);
  assert.equal(first.selected[0].take,1);
  assert.equal(retake.selected[0].take,2);
  assert.equal(videoCoverage(retake).count,1);
  const two=captureVideoArea(selectVideoArea(retake,'rear'));
  assert.deepEqual(videoCoverage(two).selected,['front','rear']);
  assert.equal(videoCoverage(two).percent,33);
  assert.equal(videoCoverage(two).complete,false);
});

test('removal, complete coverage and reset have accurate unique counts', () => {
  const { PREPARED_AREAS, freshVideoState, selectVideoArea, captureVideoArea, removeVideoArea, resetVideoState, videoCoverage } = api();
  let state=freshVideoState();
  for (const area of PREPARED_AREAS) state=captureVideoArea(selectVideoArea(state,area.id));
  assert.equal(videoCoverage(state).complete,true);
  assert.equal(videoCoverage(state).count,6);
  const removed=removeVideoArea(state,'drawer');
  assert.equal(videoCoverage(removed).count,5);
  assert.deepEqual(videoCoverage(removed).missing,['drawer']);
  assert.equal(videoCoverage(state).count,6);
  assert.deepEqual(resetVideoState(removed),freshVideoState());
  assert.throws(() => removeVideoArea(state,'unknown'));
});

test('malformed state cannot introduce unknown evidence, arbitrary assets or duplicate groups', () => {
  const { freshVideoState, validateVideoState, selectVideoArea, captureVideoArea } = api();
  const good=captureVideoArea(freshVideoState());
  const bad=[null,[],{}, {...good,schema:2}, {...good,area:'<img>'}, {...good,paused:'yes'}, {...good,elapsed:'4'}, {...good,elapsed:Infinity}, {...good,secret:1}, {...good,selected:['front']}, {...good,selected:[...good.selected,...good.selected]}, {...good,selected:[{id:'unknown',time:0,take:1}]}, {...good,selected:[{id:'front',time:0,take:0}]}, {...good,selected:[{id:'front',time:0,take:1,image:'https://example.com'}]}];
  for (const value of bad) assert.throws(() => validateVideoState(value));
  assert.throws(() => selectVideoArea(good,'unknown'));
  assert.deepEqual(validateVideoState(JSON.parse(JSON.stringify(good))),good);
  assert.notEqual(validateVideoState(good).selected,good.selected);
});

test('read and write retain elapsed time for a paused resume, with corrupt storage recovery', () => {
  const { VIDEO_STATE_KEY, freshVideoState, selectVideoArea, captureVideoArea, setVideoProgress, readVideoState, writeVideoState } = api();
  const storage=store();
  const state=setVideoProgress(captureVideoArea(selectVideoArea(freshVideoState(),'interior')),11.25,true);
  assert.equal(writeVideoState(state,storage),true);
  assert.deepEqual(readVideoState(storage),state);
  storage.setItem(VIDEO_STATE_KEY,'{bad');
  assert.deepEqual(readVideoState(storage),freshVideoState());
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(readVideoState(blocked),freshVideoState());
  assert.equal(writeVideoState(state,blocked),false);
  assert.deepEqual(readVideoState(blocked),state);
  const quota=store();quota.setItem(VIDEO_STATE_KEY,JSON.stringify(freshVideoState()));quota.setItem=()=>{throw Error('quota');};
  assert.equal(writeVideoState(state,quota),false);
  assert.deepEqual(readVideoState(quota),state);
});

test('legacy prepared selections migrate safely and unrelated shopping records remain intact', () => {
  const { VIDEO_STATE_KEY, readVideoState, writeVideoState, videoCoverage } = api();
  const storage=store();
  storage.setItem('lihatdulu:prepared-sora:v1',JSON.stringify({schema:1,area:'drawer',captured:['front','rear'],review:false}));
  storage.setItem('lihatdulu:saved:v1','["arca"]');
  storage.setItem('lihatdulu:cart:v1','["batu"]');
  const state=readVideoState(storage);
  assert.equal(state.area,'drawer');
  assert.equal(state.elapsed,12);
  assert.deepEqual(videoCoverage(state).selected,['front','rear']);
  assert.equal(writeVideoState(state,storage),true);
  assert.ok(storage.getItem(VIDEO_STATE_KEY));
  assert.equal(storage.getItem('lihatdulu:saved:v1'),'["arca"]');
  assert.equal(storage.getItem('lihatdulu:cart:v1'),'["batu"]');
});
