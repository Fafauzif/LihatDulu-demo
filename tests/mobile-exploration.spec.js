import {test,expect} from '@playwright/test';

test('guided studio keeps model and next action in a short phone viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/studio?mode=guided');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 const box=await page.getByRole('button',{name:'Berikutnya',exact:true}).boundingBox();
 expect(box.y+box.height).toBeLessThanOrEqual(844);
 const stage=await page.locator('#stage').boundingBox();expect(stage.y+stage.height).toBeLessThan(box.y);
});

test('direct exploration bypasses chapters and exposes condition and room tools',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/studio?mode=free');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 expect(await page.evaluate(()=>window.lihatDulu.studio.free)).toBe(true);
 expect(await page.evaluate(()=>window.lihatDulu.engine.getState().captureScene.active)).toBe(false);
 await expect(page.locator('[data-tool="condition"]')).toBeVisible();await expect(page.locator('[data-tool="room"]')).toBeVisible();
 await page.locator('[data-tool="condition"]').click();await page.locator('[data-tool="opening"]').click();expect(await page.evaluate(()=>{const e=window.lihatDulu.engine;return e.camera.position.distanceTo(e.controls.target);})).toBeGreaterThan(1.2);
});

for(const viewport of [{width:320,height:568},{width:375,height:667},{width:390,height:844},{width:412,height:915}]){
 test(`all guided chapters keep scene and navigation accessible at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/studio?mode=guided');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  for(let chapter=0;chapter<10;chapter++){
   const next=page.locator('.studio-navigation .primary');const box=await next.boundingBox();const stage=await page.locator('#stage').boundingBox();
   expect(box.y+box.height,`chapter${chapter} dock`).toBeLessThanOrEqual(viewport.height+1);expect(stage.height,`chapter${chapter} scene`).toBeGreaterThan(100);expect(stage.y+stage.height).toBeLessThanOrEqual(box.y);
   expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),`chapter${chapter} document`).toBe(true);
   if(chapter<9)await next.click();
  }
 });
}

test('guided gestures stay guided and separate free setup survives switching and reload',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/studio?mode=guided');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 await page.locator('[data-chapter="4"]').click();await page.evaluate(()=>window.lihatDulu.engine.controls.dispatchEvent({type:'start'}));expect(await page.evaluate(()=>window.lihatDulu.studio.free)).toBe(false);
 await page.locator('[data-mode="free"]').click();await page.locator('[data-tool="opening"]').click();await page.getByLabel('Pintu kiri',{exact:true}).fill('43');await page.getByLabel('Laci',{exact:true}).fill('18');
 await page.locator('[data-mode="guided"]').click();expect(await page.evaluate(()=>window.lihatDulu.studio.chapter)).toBe(4);
 await page.locator('[data-mode="free"]').click();expect(await page.evaluate(()=>window.lihatDulu.engine.getState().motions)).toMatchObject({left:43,drawer:.18});
 await page.reload();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');expect(await page.evaluate(()=>window.lihatDulu.studio.tool)).toBe('opening');expect(await page.evaluate(()=>window.lihatDulu.engine.getState().motions.left)).toBe(43);
 await page.locator('[data-tool="room"]').click();await page.locator('button[data-room-tab="position"]').click();await page.locator('[data-action="nudge-right"]').click();
 await page.locator('[data-mode="guided"]').click();expect(await page.evaluate(()=>window.lihatDulu.room.x)).toBe(0);await page.locator('[data-mode="free"]').click();expect(await page.evaluate(()=>window.lihatDulu.room.x)).toBe(.1);await page.locator('[data-action="undo-placement"]').click();expect(await page.evaluate(()=>window.lihatDulu.room.x)).toBe(0);
});

test('mobile capture advances explicitly, supports area picker and keeps review values across tabs',async({page})=>{
 await page.setViewportSize({width:375,height:667});await page.goto('/buat');await page.getByLabel('Nama laporan').fill('Draf mobile');await page.locator('[data-action="start-capture"]').click();
 await page.locator('[data-action="capture-photo"]').click();expect(await page.evaluate(()=>window.lihatDulu.capture.activeArea)).toBe('front');await page.locator('[data-action="next-area"]').click();expect(await page.evaluate(()=>window.lihatDulu.capture.activeArea)).toBe('left');
 await page.locator('[data-action="skip-area"]').click();await page.locator('[data-action="area-picker"]').click();await page.getByRole('dialog').locator('[data-area="drawer"]').click();expect(await page.evaluate(()=>window.lihatDulu.capture.activeArea)).toBe('drawer');
 await page.locator('[data-action="review-capture"]').click();await page.locator('button[data-review-tab="notes"]').click();await page.getByLabel('Catatan goresan permukaan').fill('Catatan mobile tersimpan.');
 await page.locator('button[data-review-tab="size"]').click();await page.locator('#dimensions-confirmed').check();await page.locator('button[data-review-tab="notes"]').click();await expect(page.getByLabel('Catatan goresan permukaan')).toHaveValue('Catatan mobile tersimpan.');
 const dock=await page.locator('.capture-action-dock').boundingBox();expect(dock.y+dock.height).toBeLessThanOrEqual(667);await page.reload();await page.locator('button[data-review-tab="notes"]').click();await expect(page.getByLabel('Catatan goresan permukaan')).toHaveValue('Catatan mobile tersimpan.');
});

test('free room edits can be undone and saved as actual scene previews',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/studio?mode=free');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');await page.locator('[data-tool="room"]').click();
 await page.locator('[data-room-tab="position"]').click();await page.locator('[data-action="nudge-right"]').click();expect(await page.evaluate(()=>window.lihatDulu.room.x)).toBe(.1);await page.locator('[data-action="undo-placement"]').click();expect(await page.evaluate(()=>window.lihatDulu.room.x)).toBe(0);
 await page.locator('[data-room-tab="fixtures"]').click();await page.locator('[data-fixture="door"]').click();await expect(page.locator('#fit-doors')).toContainText('Terhalang');await page.locator('[data-action="save-placement"]').click();await page.goto('/tersimpan');
 await expect(page.locator('.placement-preview')).toHaveAttribute('src',/^data:image\/webp;base64,/);await expect(page.locator('.placement-fit-summary')).toContainText('Pintu: terhalang');
});

test('real engine restores complete snapshots, rejects malformed data and captures bounded room image',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/ruang');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 const result=await page.evaluate(async()=>{
  const e=window.lihatDulu.engine;e.setRoom({x:.25,z:-.55,rotation:25,fixture:'drawer'});e.setMotion('left',42);e.setMotion('drawer',.15);e.setDimensionsVisible(true);const saved=e.captureViewState();e.setRoom({x:0});e.setStorage(false);const restored=e.restoreViewState(saved);const after=e.captureViewState();const invalid=e.restoreViewState({...saved,camera:{...saved.camera,position:[Infinity,0,0]}});const afterInvalid=e.captureViewState();const distance=e.camera.position.distanceTo(e.controls.target);e.zoomBy(.8);const zoom=e.camera.position.distanceTo(e.controls.target)/distance;const current=e.captureViewState();const preview=e.capturePlacementPreview();const previewUnchanged=JSON.stringify(current)===JSON.stringify(e.captureViewState());const image=new Image();image.src=preview;await image.decode();return {saved,restored,after,invalid,afterInvalid,zoom,previewLength:preview.length,prefix:preview.slice(0,23),width:image.width,height:image.height,previewUnchanged};
 });
 expect(result.restored).toBe(true);expect(result.after).toEqual(result.saved);expect(result.invalid).toBe(false);expect(result.afterInvalid).toEqual(result.saved);expect(result.zoom).toBeCloseTo(.8);expect(result.prefix).toMatch(/^data:image\/webp;base64,/);expect(result.width).toBeLessThanOrEqual(400);expect(result.height).toBeLessThanOrEqual(300);expect(result.previewLength).toBeLessThanOrEqual(100000);expect(result.previewUnchanged).toBe(true);
});

test('mobile input remains reachable when the visible viewport shrinks',async({page})=>{
 await page.setViewportSize({width:375,height:667});await page.goto('/buat');await page.getByLabel('Nama laporan').focus();await page.setViewportSize({width:375,height:410});
 await page.getByLabel('Nama laporan').fill('Draf papan ketik');await expect(page.locator('body')).toHaveAttribute('data-keyboard','true');const dock=await page.locator('.capture-action-dock').boundingBox();expect(dock.y+dock.height).toBeLessThanOrEqual(410);
 await page.locator('[data-action="start-capture"]').click();await page.setViewportSize({width:375,height:667});await expect(page.locator('.camera-feed')).toBeVisible();expect(await page.evaluate(()=>window.lihatDulu.capture.report.name)).toBe('Draf papan ketik');
});

test('short phone room size inputs stay above the pinned fit results',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const viewport of [{width:320,height:568},{width:375,height:667}]){
  await page.setViewportSize(viewport);await page.goto('/ruang');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  const controls=await page.locator('.room-controls').boundingBox();const fit=await page.locator('.fit-results').boundingBox();
  for(const label of ['Lebar ruang','Panjang ruang']){const box=await page.getByLabel(label).boundingBox();expect(box.y+box.height,label+' bounds').toBeLessThanOrEqual(controls.y+controls.height+1);expect(box.y+box.height,label+' result separation').toBeLessThanOrEqual(fit.y);}
 }
});
