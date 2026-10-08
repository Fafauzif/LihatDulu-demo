import test from 'node:test';
import assert from 'node:assert/strict';
import { PREPARED_AREAS, freshPreparedState, validatePreparedState, capturePreparedArea, selectPreparedArea } from '../src/prepared-state.js';

test('supplied capture can be explored and retaken without duplicate frames or mutations',()=>{
 const first=freshPreparedState();const shot=capturePreparedArea(first);const repeated=capturePreparedArea(shot);
 assert.equal(first.captured.length,0);assert.deepEqual(repeated.captured,['front']);
 const rear=capturePreparedArea(selectPreparedArea(repeated,'rear'));
 assert.deepEqual(rear.captured,['front','rear']);assert.equal(rear.area,'rear');
 assert.equal(PREPARED_AREAS.length,6);
});
test('invalid stored sample state cannot become a photo, route or unknown area',()=>{
 for(const state of [{...freshPreparedState(),area:'<img>'},{...freshPreparedState(),captured:['unknown']},{...freshPreparedState(),captured:['front','front']},{...freshPreparedState(),review:'yes'},{...freshPreparedState(),secret:1}])assert.throws(()=>validatePreparedState(state));
 assert.throws(()=>selectPreparedArea(freshPreparedState(),'unknown'));
 assert.deepEqual(validatePreparedState(JSON.parse(JSON.stringify(freshPreparedState()))),freshPreparedState());
});
