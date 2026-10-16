import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';

// Verify built assets and SPA routes against the production bundle, not the dev server.
const root=new URL('..',import.meta.url).pathname;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function files(path){const result=[];for(const entry of await fs.readdir(path,{withFileTypes:true})){const child=path+'/'+entry.name;result.push(...entry.isDirectory()?await files(child):[child]);}return result;}
const publicFiles=await files(root+'public');
for(const source of publicFiles){const relative=source.slice((root+'public').length), target=root+'dist'+relative;assert.equal(hash(await fs.readFile(source)),hash(await fs.readFile(target)),relative+' copied exactly');}
const server=await preview({root,preview:{host:'127.0.0.1',port:5215,strictPort:true}});
const browser=await chromium.launch({executablePath:await testBrowserPath(),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/beli?model=1','/barang/sora?tab=model','/barang/arca?tab=room','/barang/awan','/bandingkan','/jual','/jual/sora/rekam?area=drawer','/jual/sora/tinjau','/barang/sora?preview=1','/keranjang','/tinjau-pesanan','/cari-dari-foto']){
  await page.goto('http://127.0.0.1:5215'+path,{waitUntil:'networkidle'});await page.locator('#main').waitFor();
  if(path==='/barang/sora?tab=model'||path==='/barang/arca?tab=room'){
   await page.waitForFunction(()=>window.lihatDulu?.engine?.ready===true,null,{timeout:45000});
   assert.ok(await page.evaluate(()=>window.lihatDulu.engine.renderer.info.render.triangles>0));
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' has no page overflow');
  assert.ok((await page.locator('#main').innerText()).length>20,path+' renders');
  if(path==='/jual/sora/rekam?area=drawer')assert.equal(await page.locator('video').evaluate(v=>v.duration),18);
  console.log('PASS production',path);
 }
 assert.deepEqual(errors,[]);console.log('PASS production asset parity',publicFiles.length,'files; deep routes, real 3D and video');
}finally{await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
