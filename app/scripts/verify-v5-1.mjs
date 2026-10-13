import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';
const base='http://127.0.0.1:5202';
const server=await createServer({root:'.',server:{host:'127.0.0.1',port:5202,strictPort:true}});await server.listen();
const browser=await chromium.launch({executablePath:await testBrowserPath(),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>m.type()==='error'&&errors.push(m.text()));
async function open(path, expectModel=false){await page.goto(base+path,{waitUntil:'networkidle'});await page.locator('#main').waitFor();if(expectModel){await page.locator('.inspection-stage canvas').waitFor({timeout:30000});await page.locator('.inspection-loading').waitFor({state:'hidden',timeout:30000});}}
await open('/');assert.equal(await page.locator('.role-card').count(),2);console.log('PASS role chooser');
await open('/beli');assert.equal(await page.locator('[data-listing]').count(),6);assert.equal(await page.locator('[data-listing][data-listing="sora"]').count(),1);console.log('PASS marketplace six listings');
for(const id of ['sora','arca','batu','rimba']){await open(`/barang/${id}`,true);const result=await page.evaluate(()=>{const e=document.querySelector('.inspection')?._engine;return {id:document.querySelector('[data-product-id]')?.dataset.productId,triangles:e?.renderer?.info.render.triangles,glb:[...performance.getEntriesByType('resource')].map(x=>x.name).find(x=>x.endsWith('.glb'))};});assert.equal(result.id,id);assert.ok(result.triangles>0);assert.ok(result.glb?.endsWith(`/${id==='sora'?'cabinet':id}.glb`));console.log('PASS product',id,result.triangles);}
await open('/barang/lino');assert.equal(await page.locator('.coming-purchase').count(),1);assert.equal(await page.locator('[data-action="add-cart"]').count(),0);console.log('PASS coming-soon honesty');
await open('/beli');await page.locator('[data-action="save"][data-id="arca"]').click();await page.locator('[data-action="add-cart"]').first().count().catch(()=>{});await page.locator('[data-listing="arca"] .card-media').click();await page.locator('[data-action="add-cart"]').click();await open('/keranjang');assert.equal(await page.locator('.cart-line').count(),1);console.log('PASS save and cart');
await open('/cari-dari-foto');assert.equal(await page.locator('.photo-search-source img').count(),1);assert.equal(await page.locator('.search-result').count(),2);console.log('PASS prepared photo search');
await open('/jual');assert.ok((await page.locator('[data-prepared-count]').textContent()).includes('0 / 6'));console.log('PASS seller capture workspace');
for(const path of ['/','/beli','/barang/arca','/cari-dari-foto','/jual']){await page.setViewportSize({width:390,height:844});await open(path,false);const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));assert.ok(metrics.scrollWidth<=metrics.width+1,`${path} overflow ${JSON.stringify(metrics)}`);console.log('PASS mobile',path);}
assert.deepEqual(errors,[]);await browser.close();await server.close();console.log('SUMMARY V5.1 verification passed');
