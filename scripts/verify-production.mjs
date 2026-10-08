import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';
import { freshEditableReport } from '../src/state.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=process.env.QA_OUTPUT||path.join(root,'qa-output');
await fs.mkdir(output,{recursive:true});
const server=await preview({root,preview:{host:'127.0.0.1',port:5298,strictPort:true}});
const browser=await chromium.launch({executablePath:await testBrowserPath(),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[],missing=[],external=[],checks=[];
const base='http://127.0.0.1:5298';
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
page.on('request',request=>{if(!request.url().startsWith(base)&&!request.url().startsWith('blob:')&&!request.url().startsWith('data:'))external.push(request.url());});
async function open(route){
  await page.goto(base+route,{waitUntil:'networkidle'});
  await page.locator('#main').waitFor();
  if(route.includes('tab='))await page.locator('.inspection-stage[aria-busy="false"]').waitFor({timeout:60000});
  if(route==='/jual')await page.locator('.seller-form').waitFor();
  if(route==='/barang-saya')await page.locator('.seller-drafts-title').waitFor();
}
try{
  for(const route of ['/','/barang/sora','/barang/arca','/barang/sora?tab=condition','/barang/sora?tab=room','/barang/sora?tab=guide','/checkout/sora','/jual','/barang-saya','/tersimpan']){
    await open(route);await page.reload({waitUntil:'networkidle'});
    if(route.includes('tab='))await page.locator('.inspection-stage[aria-busy="false"]').waitFor({timeout:60000});
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),forbidden:document.body.innerText.match(/\b(?:prototype|prototipe|simulasi|engine)\b|—/gi)||[]}));
    assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));assert.deepEqual(layout.broken,[]);assert.deepEqual(layout.forbidden,[]);
    checks.push({route,directLoad:true,refresh:true,layout});
  }
  await open('/barang/sora?tab=room');
  const saved={report:freshEditableReport(),room:{width:4.2,depth:3.2,x:.2,z:-.4,rotation:15,fixture:'clear'},savedAt:new Date().toISOString()};
  await page.evaluate(record=>{localStorage.clear();localStorage.setItem('lihatdulu:placements:v1',JSON.stringify([record]));},saved);
  await page.reload({waitUntil:'networkidle'});await page.locator('.inspection-stage[aria-busy="false"]').waitFor({timeout:60000});
  await page.locator('[data-saved-placement]').selectOption('0');
  assert.deepEqual(await page.locator('[data-placement] strong').allTextContents(),Array(3).fill('Ukuran belum dikonfirmasi'));
  await page.reload({waitUntil:'networkidle'});await page.locator('.inspection-stage[aria-busy="false"]').waitFor({timeout:60000});
  assert.deepEqual(await page.locator('[data-placement] strong').allTextContents(),Array(3).fill('Ukuran belum dikonfirmasi'));
  checks.push({name:'compiled unknown saved placement remains unknown through reload',pass:true});
  await open('/');await page.locator('[data-action="save"][data-id="arca"]').click();await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-action="save"][data-id="arca"]').getAttribute('aria-pressed'),'true');
  await page.screenshot({path:path.join(output,'production-home.png'),fullPage:true});
  checks.push({name:'compiled saved-item storage and actual catalogue image',pass:true});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.deepEqual(external,[]);
  const result={pass:true,checks,errors,missing,external,finished:new Date().toISOString()};
  await fs.writeFile(path.join(output,'production-results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({pass:true,checks:checks.length,pageErrors:errors.length,missing:missing.length,external:external.length}));
}finally{await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
