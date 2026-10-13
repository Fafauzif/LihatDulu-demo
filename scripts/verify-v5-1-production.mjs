import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';
const server=await createServer({root:'dist',server:{host:'127.0.0.1',port:5203,strictPort:true}});await server.listen();
const browser=await chromium.launch({executablePath:await testBrowserPath(),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>m.type()==='error'&&errors.push(m.text()));
async function open(path,model=false){await page.goto(`http://127.0.0.1:5203${path}`,{waitUntil:'networkidle'});await page.locator('#main').waitFor();if(model){await page.locator('.inspection-stage canvas').waitFor({timeout:30000});await page.locator('.inspection-loading').waitFor({state:'hidden',timeout:30000});}}
await open('/');assert.equal(await page.locator('.role-card').count(),2);await open('/beli');assert.equal(await page.locator('[data-listing]').count(),6);
for(const id of ['arca','batu','rimba']){await open(`/barang/${id}`,true);assert.equal(await page.locator('[data-product-id]').getAttribute('data-product-id'),id);assert.ok(await page.locator('canvas').count());}
await open('/barang/lino');assert.equal(await page.locator('.coming-purchase').count(),1);await open('/cari-dari-foto');assert.equal(await page.locator('.search-result').count(),2);assert.deepEqual(errors,[]);await browser.close();await server.close();console.log('SUMMARY V5.1 production verification passed');
