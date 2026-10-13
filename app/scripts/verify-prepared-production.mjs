import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=process.env.QA_OUTPUT||path.join(root,'qa-output/prepared-production');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5299';
await fs.mkdir(output,{recursive:true});
const results={started:new Date().toISOString(),checks:[],mediaAttempts:[],errors:[],missing:[],external:[],javascript:[],screenshots:[]};
const server=process.env.QA_BASE_URL?null:await preview({root,preview:{host:'127.0.0.1',port:5299,strictPort:true}});
const browser=await chromium.launch({executablePath:await testBrowserPath(),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.exposeBinding('__productionMediaAttempt',({page},attempt)=>results.mediaAttempts.push({url:page.url(),...attempt}));
await context.addInitScript(()=>{
  const record=api=>void window.__productionMediaAttempt({api});const deny=api=>(...args)=>{record(api);return Promise.reject(new DOMException('Media blocked during prepared production QA.','NotAllowedError'));};
  let devices=navigator.mediaDevices;if(!devices){devices={};Object.defineProperty(navigator,'mediaDevices',{value:devices,configurable:true});}
  for(const name of ['getUserMedia','getDisplayMedia'])Object.defineProperty(devices,name,{value:deny('mediaDevices.'+name),configurable:true});
  if(navigator.permissions)for(const name of ['query','request'])Object.defineProperty(navigator.permissions,name,{value:deny('permissions.'+name),configurable:true});
  const click=HTMLInputElement.prototype.click;HTMLInputElement.prototype.click=function(...args){if(this.type==='file'){record('fileInput.click');return;}return click.apply(this,args);};
  const picker=HTMLInputElement.prototype.showPicker;if(picker)HTMLInputElement.prototype.showPicker=function(...args){if(this.type==='file'){record('fileInput.showPicker');return;}return picker.apply(this,args);};
  document.addEventListener('click',e=>{if(e.target.matches?.('input[type="file"]')){record('fileInput.userClick');e.preventDefault();}},true);
});
const page=await context.newPage();page.setDefaultTimeout(15000);const pending=new Set();
page.on('pageerror',e=>results.errors.push({url:page.url(),message:e.message}));page.on('console',m=>{if(m.type()==='error')results.errors.push({url:page.url(),message:m.text()});});page.on('filechooser',()=>results.mediaAttempts.push({url:page.url(),api:'filechooser'}));
page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))results.external.push(r.url());});
page.on('response',r=>{if(r.status()>=400)results.missing.push({url:r.url(),status:r.status()});if(/\.js(?:\?|$)/.test(r.url())&&r.url().startsWith(base)){const task=r.text().then(code=>results.javascript.push({url:r.url(),bytes:code.length,forbidden:code.match(/getUserMedia|getDisplayMedia|type\s*=\s*["']file["']/g)||[]})).catch(()=>{});pending.add(task);task.finally(()=>pending.delete(task));}});
async function check(name,fn){try{results.checks.push({name,pass:true,evidence:await fn()});console.log('PASS',name);}catch(e){results.checks.push({name,pass:false,error:e.stack||e.message});console.log('FAIL',name,e.message);}}
async function ready(){await page.locator('#main').waitFor();if(await page.locator('.inspection-stage').count()){await page.locator('.inspection-stage canvas').waitFor({timeout:60000});await page.locator('.inspection-loading').waitFor({state:'hidden',timeout:60000});assert.equal(await page.locator('.inspection-error').isVisible(),false);}if(await page.locator('[data-prepared-workspace]').isVisible()){await page.locator('[data-prepared-stage] canvas').waitFor({timeout:60000});await page.locator('.prepared-loading').waitFor({state:'hidden',timeout:60000});assert.equal(await page.locator('.prepared-stage-error').isVisible(),false);}}
async function open(route){await page.goto(base+route,{waitUntil:'networkidle'});await ready();}
async function scan(){return page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>getComputedStyle(i).display!=='none'&&i.getBoundingClientRect().width>0&&i.complete&&!i.naturalWidth).map(i=>i.src),forbidden:document.body.innerText.match(/\b(?:prototype|prototipe|demo|simulasi|engine)\b|—|minta\s+foto\s+(?:tambahan|lagi)/gi)||[],fileInputs:document.querySelectorAll('input[type="file"]').length}));}
try{
  for(const route of ['/','/beli','/barang/sora','/barang/sora?tab=condition','/barang/sora?tab=room','/barang/sora?tab=guide','/checkout/sora','/checkout/sora/tinjau','/jual','/buat','/barang-saya','/tersimpan','/barang/arca'])await check('compiled direct load and refresh '+route,async()=>{await open(route);await page.reload({waitUntil:'networkidle'});await ready();const layout=await scan();assert.ok(layout.scrollWidth<=layout.width+1,JSON.stringify(layout));assert.deepEqual(layout.broken,[]);assert.deepEqual(layout.forbidden,[]);assert.equal(layout.fileInputs,0);return{route,refresh:true,layout};});
  await check('compiled role chooser, buyer marketplace and seller entry',async()=>{
    await open('/');
    assert.equal(await page.getByRole('heading',{name:'Pilih cara kamu menemukan barang.',exact:true}).count(),1);
    assert.equal(await page.locator('.role-card').count(),2);
    assert.equal(await page.locator('a.role-card-buyer[href="/beli"]').count(),1);
    assert.equal(await page.locator('a.role-card-seller[href="/jual"]').count(),1);
    await page.locator('a.role-card-buyer').click();await ready();
    assert.equal(new URL(page.url()).pathname,'/beli');
    assert.equal(await page.getByRole('heading',{name:'Pilih barang, lalu lihat lebih dekat.',exact:true}).count(),1);
    assert.equal(await page.locator('.featured-marketplace-card[data-listing="sora"]').count(),1);
    const placeholders=page.locator('.marketplace-card');
    assert.equal(await placeholders.count(),5);
    for(let i=0;i<await placeholders.count();i++){
      const card=placeholders.nth(i);
      assert.equal(await card.getByText('Segera hadir',{exact:true}).count(),1);
      assert.equal(await card.locator('img').count(),1);
      await card.locator('.card-media').click();await ready();
      assert.equal(new URL(page.url()).pathname,'/barang/sora');
      assert.equal(await page.getByRole('heading',{name:'Lemari Sora',exact:true}).count(),1);
      await open('/beli');
    }
    await open('/');await page.locator('a.role-card-seller').click();await ready();
    assert.equal(new URL(page.url()).pathname,'/jual');
    assert.equal(await page.locator('[data-prepared-workspace]').count(),1);
    return{chooserCards:2,marketplacePlaceholders:5,placeholderDestination:'/barang/sora',sellerDestination:'/jual'};
  });
  await check('compiled canonical product uses authored WebGL model and actual camera',async()=>{await open('/barang/sora');await page.locator('[data-view="rear"]').click();await page.waitForTimeout(750);const actual=await page.evaluate(()=>{const e=window.lihatDulu.engine;return{mode:document.querySelector('[data-inspection-mode]').dataset.inspectionMode,camera:e.camera.position.toArray(),target:e.controls.target.toArray(),triangles:e.renderer.info.render.triangles};});assert.equal(actual.mode,'model');assert.ok(actual.camera[2]-actual.target[2]<-.3);assert.ok(actual.triangles>0);return actual;});
  await check('compiled unknown saved dimension confidence survives reload',async()=>{
    await open('/barang/sora?tab=room');const saved={report:{schema:2,asset:'cabinet-01-v1',name:'Lemari ukuran belum dikonfirmasi',note:'',views:['front'],conditionNotes:[],dimensionsConfirmed:false},room:{width:4.2,depth:3.2,x:.2,z:-.4,rotation:15,fixture:'clear'},savedAt:'2026-10-08T00:00:00.000Z'};
    await page.evaluate(record=>localStorage.setItem('lihatdulu:placements:v1',JSON.stringify([record])),saved);await page.reload({waitUntil:'networkidle'});await ready();await page.locator('[data-saved-details] > summary').click();await page.locator('[data-saved-placement]').selectOption('0');assert.deepEqual(await page.locator('[data-placement] strong').allTextContents(),Array(3).fill('Ukuran belum dikonfirmasi'));await page.locator('[data-inspection-action="save-placement"]').click();const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('lihatdulu:placements:v1'))[0]);assert.equal(persisted.report.dimensionsConfirmed,false);assert.equal(Object.hasOwn(persisted,'fit'),false);await page.reload({waitUntil:'networkidle'});await ready();assert.deepEqual(await page.locator('[data-placement] strong').allTextContents(),Array(3).fill('Ukuran belum dikonfirmasi'));return{confidenceRemainsUnknown:true,savedWithoutFit:true};
  });
  await check('compiled capture persists original prepared frame across aliases and reload',async()=>{await open('/jual');await page.locator('[data-prepared-action="reset"]').click();await page.locator('[data-prepared-area="rear"]').click();await page.locator('[data-prepared-action="capture"]').click();const src=await page.locator('[data-prepared-preview]').getAttribute('src');assert.ok(src.endsWith('/capture-rear.webp'));await open('/buat');assert.ok((await page.locator('[data-prepared-count]').textContent()).includes('1 / 6'));await page.reload({waitUntil:'networkidle'});await page.locator('[data-prepared-count]').waitFor();assert.ok((await page.locator('[data-prepared-count]').textContent()).includes('1 / 6'));return{src,aliasesRetainCount:1};});
  await check('compiled delivery can review without personal details',async()=>{await open('/checkout/sora');await page.locator('[name="delivery"][value="delivery"]').check();assert.equal(await page.locator('[required],[name="name"],[name="phone"],[name="address"],[name="city"]').count(),0);assert.ok((await page.locator('.order-total').textContent()).includes('2.600.000'));await page.locator('.checkout-submit').click();assert.ok(page.url().endsWith('/checkout/sora/tinjau'));assert.ok((await page.locator('.order-total').textContent()).includes('2.600.000'));return{total:2600000,noTyping:true};});
  await check('compiled saved Sora survives reload',async()=>{await open('/barang/sora');const b=page.locator('[data-action="save"][data-id="sora"]').first();if(await b.getAttribute('aria-pressed')==='true')await b.click();await b.click();await page.reload({waitUntil:'networkidle'});await ready();assert.equal(await b.getAttribute('aria-pressed'),'true');await open('/tersimpan');assert.equal(await page.locator('[data-action="save"][data-id="sora"]').count(),1);return{savedAcrossReload:true};});
  for(const [name,route]of [['production-role-chooser','/'],['production-marketplace','/beli'],['production-model','/barang/sora'],['production-room','/barang/sora?tab=room'],['production-capture','/jual'],['production-checkout','/checkout/sora']]){await open(route);const lazy=page.locator('img[loading="lazy"]');for(let i=0;i<await lazy.count();i++){const img=lazy.nth(i);if(await img.isVisible()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode().catch(()=>{}));}}await page.evaluate(()=>window.scrollTo(0,0));const filename=path.join(output,name+'.png');await page.screenshot({path:filename,fullPage:true});results.screenshots.push({name,path:filename});}
}finally{
  await Promise.allSettled([...pending]);await check('compiled graph has no media/upload code',async()=>{assert.ok(results.javascript.length);assert.deepEqual(results.javascript.filter(e=>e.forbidden.length),[]);return{modules:results.javascript.length};});await check('compiled zero media permission and file-opening attempts',async()=>{assert.deepEqual(results.mediaAttempts,[]);return{attempts:0};});await check('compiled clean runtime assets and network',async()=>{assert.deepEqual(results.errors,[]);assert.deepEqual(results.missing,[]);assert.deepEqual(results.external,[]);return{errors:0,missing:0,external:0};});results.finished=new Date().toISOString();results.pass=results.checks.every(c=>c.pass);results.summary={total:results.checks.length,passed:results.checks.filter(c=>c.pass).length,failed:results.checks.filter(c=>!c.pass).length};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));await fs.writeFile(path.join(output,'report.md'),`# Prepared Sora production QA\n\nResult: ${results.pass?'PASS':'FAIL'} (${results.summary.passed}/${results.summary.total}).\n\nExecuted ${results.started} to ${results.finished}. Vite production preview, Playwright Chromium with SwiftShader. Direct entry and refresh exercise the compiled SPA rather than the development module graph.\n\n${results.checks.map(c=>'- '+(c.pass?'PASS':'FAIL')+' **'+c.name+'**: '+JSON.stringify(c.evidence??c.error)).join('\n')}\n\nActual rendered screenshots: ${results.screenshots.map(s=>s.path).join(', ')}. Machine-readable details: ${path.join(output,'results.json')}. Native Safari and physical mobile testing remain separate.\n`);await browser.close();if(server)await new Promise(resolve=>server.httpServer.close(resolve));console.log('SUMMARY',JSON.stringify(results.summary));if(!results.pass)process.exitCode=1;
}
