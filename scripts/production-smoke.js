import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { testBrowserPath } from './test-browser.js';
import assert from 'node:assert/strict';
const project=new URL('../',import.meta.url).pathname;
const server=await preview({root:project,preview:{host:'127.0.0.1',port:5189,strictPort:true}});
const base='http://127.0.0.1:5189';
const browser=await chromium.launch({executablePath:await testBrowserPath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const errors=[],consoleErrors=[],failedRequests=[],routeResults=[],externalRequests=new Set();
const wire=(page)=>{page.on('pageerror',error=>errors.push(error.message));page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});page.on('requestfailed',request=>failedRequests.push({url:request.url(),failure:request.failure()?.errorText}));page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(base))externalRequests.add(request.url())});};
const page=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:1});wire(page);
try {
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const route of ['/','/platform','/studio','/laporan','/ruang','/tersimpan','/buat']){
  const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);
  assert.equal(await page.locator('#main').count(),1,route);
  assert.ok((await page.locator('h1').first().innerText()).length>0,route);
  let engine=null;if(['/studio','/ruang'].includes(route)){await page.locator('#stage[data-ready="true"]').waitFor({timeout:30000});engine=await page.evaluate(()=>window.lihatDulu.engine.getState());}
  const refreshed=await page.reload({waitUntil:'networkidle'});assert.equal(refreshed.status(),200,route+' refresh');
  if(['/studio','/ruang'].includes(route))await page.locator('#stage[data-ready="true"]').waitFor({timeout:30000});
  routeResults.push({route,status:response.status(),refreshStatus:refreshed.status(),title:await page.title(),engine:engine?{capture:engine.captureScene.active,room:engine.inRoom}:null});
 }
 const assetResults=[];
 for(const path of ['/fonts/plus-jakarta-sans-latin.woff2','/assets/cabinet.glb','/assets/cabinet-manifest.json','/assets/cabinet-report.json']){
  const response=await page.request.get(base+path);const body=await response.body();assert.equal(response.status(),200,path);assert.ok(body.length>500,path);
  assetResults.push({path,status:response.status(),contentType:response.headers()['content-type'],bytes:body.length});
 }
 const font=await page.evaluate(async()=>{await document.fonts.ready;return {loaded:document.fonts.check('16px "Plus Jakarta Sans"'),bodyFont:getComputedStyle(document.body).fontFamily}});assert.equal(font.loaded,true);
 await page.goto(base+'/laporan');await page.getByRole('tab',{name:'Model 3D',exact:true}).click();await page.locator('#stage[data-ready="true"]').waitFor({timeout:30000});
 await page.getByRole('button',{name:'Buka lemari',exact:true}).click();const articulation=await page.evaluate(()=>window.lihatDulu.engine.getState().motions);assert.deepEqual(articulation,{left:100,right:100,drawer:.3});
 await page.getByRole('button',{name:'Ukuran',exact:true}).click();assert.equal(await page.evaluate(()=>window.lihatDulu.engine.getState().dimensionsVisible),true);
 await page.getByRole('button',{name:'Belakang',exact:true}).click();assert.equal(await page.evaluate(()=>window.lihatDulu.engine.getState().view),'rear');
 await page.getByRole('button',{name:'Coba di ruangmu',exact:true}).click();await page.locator('#stage[data-ready="true"]').waitFor({timeout:30000});await page.getByRole('button',{name:'Penghalang pintu',exact:true}).click();assert.equal((await page.locator('#fit-body strong').innerText()),'Muat');assert.equal((await page.locator('#fit-doors strong').innerText()),'Terhalang');
 await page.goto(base+'/platform');await page.getByRole('button',{name:'Rekam barang',exact:true}).click();await page.getByLabel('Nama laporan').fill('Produksi QA 🌿');await page.getByRole('button',{name:'Mulai rekaman contoh',exact:true}).click();
 await page.locator('[data-action="capture-photo"]').click();assert.equal(await page.evaluate(()=>window.lihatDulu.capture.areas.front),'captured');
 await page.getByRole('button',{name:'Tinjau rekaman',exact:true}).click();await page.locator('#dimensions-confirmed').check();await page.getByRole('button',{name:'Siapkan laporan',exact:true}).click();await page.getByRole('button',{name:'Buat tautan laporan',exact:true}).click();const shareURL=await page.getByLabel('Tautan laporan').inputValue();assert.ok(shareURL.startsWith(base+'/laporan#r='));
 const context=await browser.newContext({viewport:{width:390,height:844}});const buyer=await context.newPage();wire(buyer);await buyer.goto(shareURL,{waitUntil:'networkidle'});
 assert.equal((await buyer.getByRole('heading',{name:'Produksi QA 🌿',exact:true}).count()),1);assert.equal((await buyer.getByText('1 dari 9 area',{exact:true}).count()),1);assert.equal(await buyer.evaluate(()=>window.lihatDulu.report.dimensionsConfirmed),true);
 await buyer.getByRole('tab',{name:'Dokumentasi',exact:true}).click();assert.equal(await buyer.locator('.evidence-tile.missing').count(),8);
 await buyer.reload({waitUntil:'networkidle'});assert.equal(await buyer.evaluate(()=>window.lihatDulu.report.name),'Produksi QA 🌿');assert.deepEqual(await buyer.evaluate(()=>window.lihatDulu.report.views),['front']);await context.close();
 await page.setViewportSize({width:375,height:667});await page.goto(base+'/studio?mode=free');await page.locator('#stage[data-ready="true"]').waitFor();
 assert.equal(await page.evaluate(()=>window.lihatDulu.studio.free),true);await page.locator('[data-tool="opening"]').click();await page.getByLabel('Pintu kiri',{exact:true}).fill('37');await page.locator('[data-mode="guided"]').click();await page.locator('[data-mode="free"]').click();await page.reload();await page.locator('#stage[data-ready="true"]').waitFor();assert.equal(await page.evaluate(()=>window.lihatDulu.engine.getState().motions.left),37);
 await page.locator('[data-tool="room"]').click();await page.locator('button[data-room-tab="fixtures"]').click();await page.locator('[data-fixture="door"]').click();await page.locator('[data-action="save-placement"]').click();await page.goto(base+'/tersimpan');assert.ok((await page.locator('.placement-preview').getAttribute('src')).startsWith('data:image/webp;base64,'));
 await page.goto(base+'/platform');await page.locator('[data-action="create"]').click();await page.getByLabel('Nama laporan').fill('Draf produksi mobile');await page.locator('[data-action="start-capture"]').click();await page.locator('[data-action="capture-photo"]').click();assert.equal(await page.evaluate(()=>window.lihatDulu.capture.activeArea),'front');await page.locator('[data-action="next-area"]').click();assert.equal(await page.evaluate(()=>window.lihatDulu.capture.activeArea),'left');
 const dock=await page.locator('.capture-action-dock').boundingBox();assert.ok(dock.y+dock.height<=667);await page.locator('[data-action="review-capture"]').click();await page.locator('button[data-review-tab="notes"]').click();await page.getByLabel('Catatan goresan permukaan').fill('Catatan produksi mobile.');await page.locator('button[data-review-tab="size"]').click();await page.locator('#dimensions-confirmed').check();await page.locator('button[data-review-tab="notes"]').click();assert.equal(await page.getByLabel('Catatan goresan permukaan').inputValue(),'Catatan produksi mobile.');
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(failedRequests,[]);assert.equal(externalRequests.size,0);
 const record={passed:true,mode:'production dist Vite preview',routes:routeResults,assets:assetResults,font,articulation,room:'cabinet fits, door obstruction detected',sharing:'one-area Unicode report in fresh buyer context,8 missing areas and dimensions confirmation survive reload',errors,consoleErrors,failedRequests,externalRequests:[...externalRequests],mobile:'375x667 free mode reload, actual saved room preview, explicit capture advance and review values',generatedAt:new Date().toISOString()};await import('node:fs/promises').then(fs=>fs.writeFile(new URL('../docs/v3-production-smoke.json',import.meta.url),JSON.stringify(record,null,2)+'\n'));console.log(JSON.stringify(record,null,2));
} finally {await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
