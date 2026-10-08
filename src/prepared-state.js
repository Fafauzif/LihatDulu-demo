// These are supplied images of the authored Sora cabinet, not camera output.
export const PREPARED_AREAS = Object.freeze([
  {id:'front',label:'Depan',title:'Bagian depan',phase:'exterior',image:'/images/capture-front.webp',note:'Sertakan seluruh lemari, dari bagian atas sampai kaki.'},
  {id:'right',label:'Samping',title:'Sisi kanan',phase:'exterior',image:'/images/capture-right.webp',note:'Lihat kedalaman lemari dan sambungan di sisinya.'},
  {id:'rear',label:'Belakang',title:'Bagian belakang',phase:'exterior',image:'/images/capture-rear.webp',note:'Bagian belakang melengkapi tampilan barang.'},
  {id:'interior',label:'Dalam',title:'Bagian dalam',phase:'interior',image:'/images/capture-interior.webp',note:'Buka pintu untuk memperlihatkan rak dan ruang penyimpanan.'},
  {id:'drawer',label:'Laci',title:'Bagian laci',phase:'interior',image:'/images/capture-drawer.webp',note:'Tarik laci agar bagian dalamnya terlihat.'},
  {id:'scratch',label:'Kondisi',title:'Detail goresan',phase:'interior',image:'/images/wear-scratch.webp',note:'Tambahkan foto dekat untuk detail pemakaian.'}
].map(Object.freeze));
export const freshPreparedState=()=>({schema:1,area:'front',captured:[],review:false});
export function validatePreparedState(value){
  if(!value||Array.isArray(value)||Object.keys(value).sort().join('|')!=='area|captured|review|schema'||value.schema!==1||typeof value.review!=='boolean')throw Error('Invalid prepared state');
  const ids=PREPARED_AREAS.map(a=>a.id);
  if(!ids.includes(value.area)||!Array.isArray(value.captured)||value.captured.length>ids.length||value.captured.some(a=>!ids.includes(a))||new Set(value.captured).size!==value.captured.length)throw Error('Invalid prepared area');
  return {schema:1,area:value.area,captured:[...value.captured],review:value.review};
}
export function selectPreparedArea(state,area){
  return validatePreparedState({...validatePreparedState(state),area,review:false});
}
export function capturePreparedArea(state){
  const value=validatePreparedState(state);
  if(!value.captured.includes(value.area))value.captured.push(value.area);
  return value;
}
