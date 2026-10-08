import test from 'node:test';
import assert from 'node:assert/strict';
const media = await import('../src/media-store.js').catch(() => ({}));
function api(name) { assert.equal(typeof media[name], 'function', `${name} must be implemented`); return media[name]; }

test('photo validation rejects wrong formats, empty and oversized files and impossible pixel sizes', () => {
  const validate = api('validatePhoto');
  assert.equal(validate({type:'image/png', size:1000}, {width:640,height:480}), null);
  assert.match(validate({type:'image/svg+xml', size:1000}), /JPG|PNG/);
  assert.match(validate({type:'image/jpeg', size:0}), /kosong/);
  assert.match(validate({type:'image/jpeg', size:21*1024*1024}), /20 MB/);
  assert.match(validate({type:'image/jpeg', size:1000}, {width:0,height:300}), /dibaca/);
  assert.match(validate({type:'image/jpeg', size:1000}, {width:40000,height:40000}), /besar/);
});

test('retake replaces only the selected area and cannot assign one photo to two areas', () => {
  const create = api('createDraft'), assign = api('assignPhoto');
  const first = create(), other = create();
  assert.notEqual(first.id, other.id);
  const front = {id:'photo-front', blob:new Blob(['front'],{type:'image/jpeg'}), width:640,height:480};
  const rear = {id:'photo-rear', blob:new Blob(['rear'],{type:'image/jpeg'}), width:640,height:480};
  const withFront = assign(first,'front',front);
  const two = assign(withFront,'rear',rear);
  const retaken = assign(two,'front',{...front,id:'photo-retaken',blob:new Blob(['retaken'],{type:'image/jpeg'})});
  assert.equal(Object.keys(first.photos).length,0);
  assert.equal(Object.keys(retaken.photos).length,2);
  assert.equal(retaken.photos.rear.id,'photo-rear');
  assert.equal(retaken.photos.front.id,'photo-retaken');
  assert.throws(() => assign(retaken,'side',rear), /foto/i);
  assert.throws(() => assign(other,'unknown',front), /bagian/i);
});

test('unavailable storage reports recoverable memory state while retaining original Blob bytes and listing identity', async () => {
  const draft = api('createDraft')();
  const photographed = api('assignPhoto')(draft,'front',{id:'persistent-photo',blob:new Blob(['actual-image-bytes'],{type:'image/jpeg'}),width:800,height:600});
  const result = await api('saveDraft')({...photographed,name:'Kursi milik saya'});
  assert.equal(result.persistent,false);
  assert.equal(result.reason,'unavailable');
  const restored = await api('getDraft')(draft.id);
  assert.equal(restored.id,draft.id);
  assert.equal(restored.photos.front.id,'persistent-photo');
  assert.equal(await restored.photos.front.blob.text(),'actual-image-bytes');
  const another = api('createDraft')();
  assert.deepEqual(another.photos,{});
  assert.ok((await api('getDrafts')()).some(item => item.id === draft.id));
});

test('confirmed measurements require all three finite positive centimetre values', () => {
  const validate = api('validateDimensions');
  assert.equal(validate({width:80,depth:40,height:120}),null);
  assert.match(validate({width:80,depth:0,height:120}),/kedalaman/i);
  assert.match(validate({width:80,depth:40,height:'Infinity'}),/tinggi/i);
  assert.match(validate({width:1001,depth:40,height:120}),/lebar/i);
});

test('measurements below the displayed one centimetre minimum cannot be confirmed', () => {
  assert.match(api('validateDimensions')({width:0.5,depth:40,height:120}),/lebar/i);
});

test('identical image bytes with different IDs cannot inflate coverage, while retakes of the same area are allowed', async () => {
  const unique = api('assignUniquePhoto');
  const first = api('createDraft')();
  const photo = {id:'first-content-id',blob:new Blob(['same-original-image-bytes'],{type:'image/jpeg'}),width:640,height:480};
  const front = await unique(first,'front',photo);
  await assert.rejects(unique(front,'rear',{...photo,id:'different-content-id',blob:new Blob(['same-original-image-bytes'],{type:'image/jpeg'})}), /foto.*bagian depan/i);
  assert.equal(Object.keys(front.photos).length,1);
  const retaken = await unique(front,'front',{...photo,id:'new-retake-id'});
  assert.equal(retaken.photos.front.id,'new-retake-id');
  assert.equal(Object.keys(retaken.photos).length,1);
  const different = await unique(retaken,'rear',{...photo,id:'distinct-bytes-id',blob:new Blob(['a-different-original-image'],{type:'image/jpeg'})});
  assert.equal(Object.keys(different.photos).length,2);
});
