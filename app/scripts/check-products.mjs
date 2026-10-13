import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';
const server=await createServer({root:'.',server:{host:'127.0.0.1',port:5201,strictPort:true}});await server.listen();
const browser=await chromium.launch({executablePath:await testBrowserPath(),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:860}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>m.type()==='error'&&errors.push(m.text()));
for(const id of ['arca','batu','rimba']){await page.goto(`http://127.0.0.1:5201/barang/${id}`,{waitUntil:'networkidle'});await page.locator('.inspection-stage canvas').waitFor({timeout:30000});await page.locator('.inspection-loading').waitFor({state:'hidden',timeout:30000});const result=await page.evaluate(()=>{const host=document.querySelector('.inspection');const e=host?._engine;return {id:document.querySelector('[data-product-id]')?.dataset.productId,triangles:e?.renderer?.info.render.triangles,model:e?.model?.name,src:[...performance.getEntriesByType('resource')].filter(x=>x.name.endsWith('.glb')).map(x=>x.name)};});console.log('RESULT',id,result);assert.equal(result.id,id);assert.ok(result.triangles>0);assert.ok(result.src.some(x=>x.endsWith(`/${id}.glb`)));console.log('PASS',id,result);}
assert.deepEqual(errors,[]);await browser.close();await server.close();
