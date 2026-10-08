/** Export the actual runtime capture room and phone as a static preview. */
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { testBrowserPath } from './test-browser.js';
import fs from 'node:fs/promises';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const vite=await createServer({root,server:{middlewareMode:true}});
const html=`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#eeeae1}#stage{width:1600px;height:1000px;position:relative}.model-marker,.dimension-label{display:none!important}</style></head><body><div id="stage"></div><script type="module">
import * as THREE from 'three';
import { createEngine } from '/src/engine.js';
const engine=await createEngine(document.querySelector('#stage'));
engine.scene.background=new THREE.Color(0xeeeae1);
engine.setCaptureScene({phase:'prepare',area:'front',progress:0});
window.previewEngine=engine;
await new Promise(r=>setTimeout(r,750));
engine.renderer.render(engine.scene,engine.camera);
window.renderedCapturePreview={data:engine.renderer.domElement.toDataURL('image/webp',.94),width:1600,height:1000,state:engine.getState()};
</script></body></html>`;
const server=http.createServer(async(req,res)=>{
  if(req.url==='/__capture_preview'){
    res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml(req.url,html));
  }else vite.middlewares(req,res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:await testBrowserPath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try {
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/__capture_preview');
  await page.waitForFunction(()=>window.renderedCapturePreview,{timeout:60000});
  const result=await page.evaluate(()=>window.renderedCapturePreview);
  if(errors.length)throw Error(errors.join('\n'));
  const name='studio-capture-scene.webp';await fs.writeFile(path.join(root,'public/images',name),Buffer.from(result.data.split(',')[1],'base64'));
  console.log(JSON.stringify({name,width:result.width,height:result.height,state:result.state.captureScene}));
  await page.evaluate(()=>window.previewEngine.dispose());
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await vite.close();}
