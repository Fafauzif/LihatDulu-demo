import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { testBrowserPath } from './test-browser.js';
import fs from 'node:fs/promises';

// Reproducible previews of the actual application, not separate mockups.
const server = await createServer({server:{host:'127.0.0.1',port:5184,strictPort:true}});
await server.listen();
const browser = await chromium.launch({executablePath:await testBrowserPath(),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors = [], screenshots = [];
page.on('pageerror', error => errors.push(error.message));
await fs.mkdir('previews',{recursive:true});
const base = 'http://127.0.0.1:5184';
async function ready3D(){await page.locator('#stage[data-ready="true"]').waitFor();}
async function shot(name){
  // Full-page screenshots must load images below the initial viewport too.
  await page.evaluate(async()=>{
    document.querySelectorAll('img').forEach(img=>{img.loading='eager';});
    await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));
    await document.fonts.ready;
    await new Promise(resolve=>{let frames=0;function next(){++frames>6?resolve():requestAnimationFrame(next);}requestAnimationFrame(next);});
  });
  const width = await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
  if(width.document>width.viewport)throw new Error(`${name}: horizontal overflow ${width.document}/${width.viewport}`);
  await page.screenshot({path:`previews/${name}.png`,fullPage:true});
  screenshots.push(name);
}
try{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);
  await page.evaluate(()=>localStorage.clear());await page.reload();
  await shot('home-desktop');
  await page.goto(base+'/platform');await shot('platform-desktop');
  await page.getByRole('button',{name:'Saya pembeli',exact:true}).click();await shot('buyer-workspace-desktop');
  await page.getByRole('button',{name:'Saya penjual',exact:true}).click();
  await page.getByRole('button',{name:'Rekam barang',exact:true}).click();await shot('capture-prepare-desktop');
  await page.getByLabel('Nama laporan').fill('Lemari Sora · ruang Nara');
  await page.getByLabel('Catatan pemilik').fill('Dipakai untuk penyimpanan di ruang keluarga. Perhatikan goresan pintu kiri dan sudut kanan atas.');
  await page.getByRole('button',{name:'Mulai rekaman contoh',exact:true}).click();await shot('capture-recording-desktop');
  for(const id of ['front','left','right','rear','top','interior','drawer']){
    await page.locator(`[data-area="${id}"]`).click();await page.locator('[data-action="capture-photo"]').click();
  }
  for(const id of ['rear-lower','underside']){
    await page.locator(`[data-area="${id}"]`).click();await page.getByRole('button',{name:'Lewati area',exact:true}).click();
  }
  await page.getByRole('button',{name:'Tinjau rekaman',exact:true}).click();
  await page.locator('#dimensions-confirmed').check();await shot('capture-review-desktop');
  await page.getByRole('button',{name:'Siapkan laporan',exact:true}).click();
  await page.getByRole('button',{name:'Buat tautan laporan',exact:true}).click();await shot('capture-share-desktop');
  const buyerURL = await page.getByLabel('Tautan laporan').inputValue();
  await page.goto(buyerURL);await shot('report-desktop');
  await page.getByRole('tab',{name:'Model 3D',exact:true}).click();await ready3D();
  await page.getByRole('button',{name:'Goresan pada pintu kiri',exact:true}).click();await shot('report-condition-3d-desktop');
  await page.getByRole('button',{name:'Coba di ruangmu',exact:true}).click();await ready3D();await shot('room-desktop');
  await page.locator('[data-fixture="door"]').click();await shot('room-door-clearance-desktop');
  await page.goto(base+'/studio');await ready3D();await shot('studio-desktop');
  await page.locator('[data-chapter="1"]').click();await shot('studio-capture-desktop');
  await page.locator('[data-chapter="2"]').click();await shot('studio-interior-desktop');
  await page.setViewportSize({width:390,height:844});
  await page.goto(base);await shot('home-mobile');
  await page.goto(base+'/platform');await shot('platform-mobile');
  await page.getByRole('button',{name:'Rekam barang',exact:true}).click();
  await page.getByRole('button',{name:'Mulai rekaman contoh',exact:true}).click();await shot('capture-recording-mobile');
  await page.locator('[data-action="capture-photo"]').click();await page.locator('[data-action="review-capture"]').click();await shot('capture-review-mobile');
  await page.locator('button[data-review-tab="notes"]').click();await shot('capture-notes-mobile');
  await page.locator('button[data-review-tab="size"]').click();await shot('capture-size-mobile');
  await page.goto(buyerURL);await shot('report-mobile');
  await page.goto(base+'/studio');await ready3D();await shot('studio-mobile');
  await page.locator('[data-action="chapters-modal"]').click();await page.getByRole('dialog').locator('[data-chapter="8"]').click();await shot('studio-room-mobile');
  await page.goto(base+'/studio?mode=free');await ready3D();await shot('studio-free-mobile');
  await page.locator('[data-tool="condition"]').click();await shot('studio-free-condition-mobile');
  await page.locator('[data-tool="opening"]').click();await page.getByLabel('Pintu kiri',{exact:true}).fill('42');await shot('studio-free-opening-mobile');
  await page.locator('[data-tool="room"]').click();await page.locator('[data-room-tab="fixtures"]').click();await page.locator('[data-fixture="door"]').click();await shot('studio-free-room-mobile');
  await page.locator('[data-action="save-placement"]').click();await page.goto(base+'/tersimpan');await shot('saved-placement-mobile');
  await page.setViewportSize({width:320,height:568});await page.goto(base+'/studio?mode=guided');await ready3D();await shot('studio-small-phone');
  await page.goto(base+'/ruang');await ready3D();await shot('room-small-phone');
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/studio?mode=free');await ready3D();await shot('studio-free-desktop');
  await fs.writeFile('previews/verification.json',JSON.stringify({generatedAt:new Date().toISOString(),desktop:{width:1440,height:1000},mobile:{width:390,height:844},reducedMotion:true,screenshots,errors},null,2)+'\n');
  console.log(JSON.stringify({screenshots:screenshots.length,errors}));
  if(errors.length)process.exitCode=1;
}finally{
  await browser.close();await server.close();
}
