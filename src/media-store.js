// Photo bytes stay in IndexedDB. Memory fallback is deliberately reported to callers.
export const PHOTO_AREAS = [
  {id:'front',label:'Bagian depan',hint:'Tampilkan seluruh barang, termasuk kaki dan tepinya.'},
  {id:'rear',label:'Bagian belakang',hint:'Foto dari belakang agar sambungan dan permukaan terlihat.'},
  {id:'side',label:'Bagian samping',hint:'Tampilkan kedalaman barang dari sisi kiri atau kanan.'},
  {id:'interior',label:'Bagian dalam',hint:'Buka pintu atau laci. Untuk kursi dan meja, foto bagian bawah.'},
  {id:'detail',label:'Detail kondisi',hint:'Dekatkan kamera ke goresan, noda, atau bagian yang ingin dijelaskan.'},
];
const memoryKey = Symbol.for('lihatdulu.media.memory');
const memory = globalThis[memoryKey] || (globalThis[memoryKey] = new Map());
let database;
export const makeId = () => globalThis.crypto?.randomUUID?.() || `barang-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function createDraft() {
  return {schema:1,id:makeId(),name:'',category:'Lemari',price:'',location:'',description:'',photos:{},skipped:{},conditions:[],dimensions:{width:'',depth:'',height:''},dimensionsConfirmed:false,phase:0,status:'draft',createdAt:Date.now(),updatedAt:Date.now()};
}
export function validatePhoto(file, pixels) {
  if (!['image/jpeg','image/png','image/webp'].includes(file?.type)) return 'Pilih foto JPG, PNG, atau WebP.';
  if (!file.size) return 'Foto kosong. Pilih foto lain.';
  if (file.size > 20*1024*1024) return 'Ukuran foto maksimal 20 MB. Pilih foto yang lebih kecil.';
  if (pixels && (!Number.isFinite(pixels.width) || !Number.isFinite(pixels.height) || pixels.width < 1 || pixels.height < 1)) return 'Foto tidak dapat dibaca. Pilih foto lain.';
  if (pixels && pixels.width * pixels.height > 80000000) return 'Resolusi foto terlalu besar. Pilih foto dengan resolusi lebih kecil.';
  return null;
}
export function validateDimensions(values) {
  for (const [key,label] of [['width','lebar'],['depth','kedalaman'],['height','tinggi']]) {
    const n = Number(values?.[key]);
    if (!Number.isFinite(n) || n < 1 || n > 1000) return `Isi ${label} antara 1 dan 1.000 cm.`;
  }
  return null;
}
export function assignPhoto(draft, area, photo) {
  if (!PHOTO_AREAS.some(item => item.id === area)) throw new Error('Bagian foto tidak dikenal.');
  if (!(photo?.blob instanceof Blob) || !photo.id) throw new Error('Foto tidak dapat disimpan.');
  if (Object.entries(draft.photos).some(([key,value]) => key !== area && value.id === photo.id)) throw new Error('Foto ini sudah digunakan untuk bagian lain.');
  const skipped = {...draft.skipped}; delete skipped[area];
  return {...draft,photos:{...draft.photos,[area]:{...photo,area,listingId:draft.id}},skipped,updatedAt:Date.now()};
}
// Compare original bytes, including older drafts without any digest metadata.
export async function assignUniquePhoto(draft, area, photo) {
  const assigned = assignPhoto(draft, area, photo);
  let incoming;
  for (const [otherArea, existing] of Object.entries(draft.photos)) {
    if (otherArea === area || existing.blob.size !== photo.blob.size) continue;
    incoming ||= new Uint8Array(await photo.blob.arrayBuffer());
    const stored = new Uint8Array(await existing.blob.arrayBuffer());
    if (incoming.every((byte, index) => byte === stored[index])) {
      const label = PHOTO_AREAS.find(item => item.id === otherArea)?.label.toLowerCase() || 'bagian lain';
      throw new Error(`Foto ini sudah ditambahkan untuk ${label}. Pilih foto dari sudut yang berbeda.`);
    }
  }
  return assigned;
}
function openDatabase() {
  if (!globalThis.indexedDB) return Promise.reject(Object.assign(new Error('unavailable'),{reason:'unavailable'}));
  if (!database) database = new Promise((resolve,reject) => {
    const request = indexedDB.open('lihatdulu-photo-drafts',1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts',{keyPath:'id'});
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {db.close();database = undefined;};
      resolve(db);
    };
    request.onerror = () => {database = undefined;reject(request.error);};
    request.onblocked = () => {database = undefined;reject(Object.assign(new Error('blocked'),{reason:'blocked'}));};
  });
  return database;
}
async function transaction(mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve,reject) => {
    const tx = db.transaction('drafts',mode);
    const request = operation(tx.objectStore('drafts'));
    let result;
    request.onsuccess = () => {result = request.result;};
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error || request.error);
    tx.onabort = () => reject(tx.error || request.error || new Error('aborted'));
  });
}
export async function saveDraft(draft) {
  const saved = structuredClone({...draft,updatedAt:Date.now()});
  memory.set(saved.id,saved);
  try { await transaction('readwrite',store => store.put(saved)); return {draft:saved,persistent:true}; }
  catch (error) { return {draft:saved,persistent:false,reason:error?.name === 'QuotaExceededError' ? 'full' : error?.reason || 'unavailable'}; }
}
export async function getDrafts() {
  try {
    const saved = await transaction('readonly',store => store.getAll());
    const merged = new Map(saved.map(draft => [draft.id,draft]));
    for (const draft of memory.values()) if (!merged.has(draft.id) || draft.updatedAt >= merged.get(draft.id).updatedAt) merged.set(draft.id,draft);
    return [...merged.values()].sort((a,b) => b.updatedAt - a.updatedAt).map(draft => structuredClone(draft));
  } catch { return [...memory.values()].sort((a,b) => b.updatedAt-a.updatedAt).map(draft => structuredClone(draft)); }
}
export async function getDraft(id) {return (await getDrafts()).find(draft => draft.id === id) || null;}
export async function deleteDraft(id) {
  memory.delete(id);
  try {await transaction('readwrite',store => store.delete(id));return true;} catch {return false;}
}
