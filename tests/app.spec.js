import { test, expect } from '@playwright/test';

const capturePhoto = page => page.locator('[data-action="capture-photo"]').click();
async function newCapture(page, name = 'Lemari Nara') {
  await page.goto('/platform');
  await page.getByRole('button',{name:'Rekam barang',exact:true}).click();
  await page.getByLabel('Nama laporan').fill(name);
  await page.getByRole('button',{name:'Mulai rekaman contoh',exact:true}).click();
}

test('capture evidence, edit notes and share an immutable Unicode snapshot to a fresh buyer',async({page,browser})=>{
  await newCapture(page,'Lemari Nara 🌿');
  for(const id of ['front','left','right','rear','top','interior','drawer']){
    await page.locator(`[data-area="${id}"]`).click();await capturePhoto(page);
  }
  for(const id of ['rear-lower','underside']){
    await page.locator(`[data-area="${id}"]`).click();await page.getByRole('button',{name:'Lewati area',exact:true}).click();
  }
  await page.getByRole('button',{name:'Tinjau rekaman',exact:true}).click();
  const note='Goresan terlihat. <img src=x onerror=alert(1)>';
  await page.getByLabel('Catatan goresan permukaan').fill(note);
  await page.locator('#dimensions-confirmed').check();
  await page.getByRole('button',{name:'Siapkan laporan',exact:true}).click();
  await page.getByRole('button',{name:'Buat tautan laporan',exact:true}).click();
  const url=await page.getByLabel('Tautan laporan').inputValue();
  const ctx=await browser.newContext();const buyer=await ctx.newPage();await buyer.goto(url);
  await expect(buyer.getByRole('heading',{name:'Lemari Nara 🌿',exact:true})).toBeVisible();
  await expect(buyer.getByText('7 dari 9 area',{exact:true})).toBeVisible();
  expect(await buyer.evaluate(()=>window.lihatDulu.report.dimensionsConfirmed)).toBe(true);
  await buyer.getByRole('button',{name:'Goresan pada pintu kiri',exact:true}).click();
  await expect(buyer.locator('#condition-detail')).toContainText(note);
  expect(await buyer.locator('#condition-detail img[src="x"]').count()).toBe(0);
  await buyer.getByRole('tab',{name:'Dokumentasi',exact:true}).click();
  await expect(buyer.locator('.evidence-tile.missing')).toHaveCount(2);
  await page.getByRole('button',{name:'Tinjau lagi',exact:true}).click();
  await page.getByLabel('Catatan goresan permukaan').fill('Catatan yang lebih baru.');
  await page.getByRole('button',{name:'Siapkan laporan',exact:true}).click();
  await expect(page.getByLabel('Tautan laporan')).toHaveCount(0);
  await page.getByRole('button',{name:'Buat tautan laporan',exact:true}).click();
  expect(await page.getByLabel('Tautan laporan').inputValue()).not.toBe(url);
  await buyer.reload();expect(await buyer.evaluate(()=>window.lihatDulu.report.conditionNotes[0].note)).toBe(note);
  await ctx.close();
});

test('retakes and skipped areas survive reload, continuation is distinct from new capture',async({page})=>{
  await newCapture(page,'Draf berlanjut');const firstId=new URL(page.url()).searchParams.get('id');
  await capturePhoto(page);
  await page.getByRole('button',{name:'Contoh foto buram',exact:true}).click();
  await page.getByRole('button',{name:'Tandai area untuk diulang',exact:true}).click();
  await page.reload();await expect(page.locator('.camera-guide')).toContainText('Ambil ulang');
  expect(await page.evaluate(()=>window.lihatDulu.capture.report.views.includes('front'))).toBe(false);
  await capturePhoto(page);await page.locator('[data-area="rear"]').click();
  await page.getByRole('button',{name:'Lewati area',exact:true}).click();
  await page.getByRole('link',{name:'Simpan & keluar',exact:true}).first().click();
  await page.locator(`.item-actions [data-action="continue-item"][data-item="${firstId}"]`).click();
  expect(await page.evaluate(()=>window.lihatDulu.capture.areas.rear)).toBe('skipped');
  expect(await page.evaluate(()=>window.lihatDulu.capture.areas.front)).toBe('captured');
  await page.getByRole('link',{name:'Simpan & keluar',exact:true}).first().click();
  await page.getByRole('button',{name:'Rekam barang',exact:true}).click();
  expect(new URL(page.url()).searchParams.get('id')).not.toBe(firstId);
  expect(await page.evaluate(()=>window.lihatDulu.capture.report.views.length)).toBe(0);
});

test('workspace filtering, search and seller/buyer perspectives are operational',async({page})=>{
  await page.goto('/platform');await expect(page.locator('.item-card')).toHaveCount(3);
  await page.getByRole('tab',{name:'Perlu tinjauan',exact:true}).click();await expect(page.locator('.item-card')).toHaveCount(1);
  await page.getByRole('tab',{name:/Semua/}).click();await page.getByLabel('Cari laporan').fill('berlanjut');
  await expect(page.locator('.item-card')).toHaveCount(1);await page.getByLabel('Cari laporan').fill('');
  await page.getByRole('button',{name:'Saya pembeli',exact:true}).click();
  await expect(page.getByRole('button',{name:'Buka laporan contoh',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Buka tautan laporan',exact:true}).click();
  await page.getByLabel('Tautan laporan yang diterima').fill('javascript:alert(1)');
  await page.getByRole('dialog').getByRole('button',{name:'Buka laporan',exact:true}).click();
  await expect(page.locator('#toast')).toContainText('Tautan tidak dikenali');
});

test('3D evidence and room checks distinguish cabinet, door and drawer then restore saved placement',async({page})=>{
  await page.goto('/laporan');await page.getByRole('tab',{name:'Model 3D',exact:true}).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Goresan pada pintu kiri',exact:true}).click();
  await expect(page.locator('#condition-detail')).toContainText('11 cm');
  await page.getByRole('button',{name:'Coba di ruangmu',exact:true}).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Penghalang pintu',exact:true}).click();
  await expect(page.locator('#fit-body')).toContainText('Muat');await expect(page.locator('#fit-doors')).toContainText('Terhalang');await expect(page.locator('#fit-drawer')).toContainText('Bebas');
  await page.getByRole('button',{name:'Penghalang laci',exact:true}).click();
  await expect(page.locator('#fit-doors')).toContainText('Bebas');await expect(page.locator('#fit-drawer')).toContainText('Terhalang');
  await page.getByRole('button',{name:'Simpan posisi',exact:true}).click();
  const before=await page.evaluate(()=>window.lihatDulu.room);
  await page.getByRole('link',{name:'Platform',exact:true}).click();await page.getByRole('link',{name:'Tersimpan',exact:true}).click();
  await page.getByRole('button',{name:'Buka penempatan',exact:true}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  expect(await page.evaluate(()=>window.lihatDulu.room)).toEqual(before);
});

test('studio starts in capture context and preserves guided room controls during interaction',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/studio');
  await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  expect(await page.evaluate(()=>window.lihatDulu.engine.getState().captureScene)).toMatchObject({active:true,phase:'prepare'});
  await page.getByRole('button',{name:'Berikutnya',exact:true}).click();
  await page.getByRole('button',{name:'Ambil foto contoh',exact:true}).click();
  expect(await page.evaluate(()=>window.lihatDulu.studio.taken)).toEqual(['front']);
  await page.locator('[data-studio-area="left"]').click();await page.getByRole('button',{name:'Ambil foto contoh',exact:true}).click();
  await page.getByRole('button',{name:'Berikutnya',exact:true}).click();
  expect(await page.evaluate(()=>window.lihatDulu.engine.getState().captureScene.phase)).toBe('interior');
  await page.getByRole('button',{name:'Berikutnya',exact:true}).click();
  expect(await page.evaluate(()=>window.lihatDulu.engine.getState().captureScene.active)).toBe(false);
  await page.locator('[data-chapter="8"]').click();
  await page.evaluate(()=>window.lihatDulu.engine.controls.dispatchEvent({type:'start'}));
  await expect(page.getByLabel('Lebar ruang')).toBeVisible();expect(await page.evaluate(()=>window.lihatDulu.studio.free)).toBe(false);
  await page.locator('[data-chapter="9"]').click();await expect(page.locator('#fit-doors')).toContainText('Terhalang');
  await page.getByRole('button',{name:'Eksplorasi bebas',exact:true}).click();await expect(page.locator('[data-mode="guided"]')).toBeVisible();
});

test('fallback preserves evidence and never claims a computed room result',async({page})=>{
  await page.route('**/assets/cabinet.glb',request=>request.abort());await page.goto('/laporan');
  await page.getByRole('tab',{name:'Model 3D',exact:true}).click();await expect(page.getByText('Tampilan gambar aktif',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Coba di ruangmu',exact:true}).click();
  await expect(page.locator('#fit-body')).toContainText('Belum dapat diperiksa');
  await page.getByRole('button',{name:'Simpan posisi',exact:true}).click();await expect(page.locator('#toast')).toContainText('Muat model 3D');
});

test('shared report survives studio reload and keyboard skip navigation',async({page})=>{
  await page.goto('/laporan');const url=await page.evaluate(()=>import('/src/state.js').then(m=>m.makeReportURL({...m.freshEditableReport(),name:'Lemari konteks'})));
  await page.goto(url);await page.getByRole('link',{name:'Studio 3D',exact:true}).click();expect(page.url()).toContain('#r=');
  await page.reload();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');expect(await page.evaluate(()=>window.lihatDulu.report.name)).toBe('Lemari konteks');
  const before=page.url();await page.locator('.skip-link').focus();await page.keyboard.press('Enter');expect(page.url()).toBe(before);
  await page.locator('.studio-heading').getByRole('button',{name:'Buka laporan',exact:true}).click();await expect(page.getByRole('heading',{name:'Lemari konteks',exact:true})).toBeVisible();
});

test('documentation chooses the matching model camera and interior articulation',async({page})=>{
  await page.goto('/laporan');await page.getByRole('tab',{name:'Model 3D',exact:true}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  await page.locator('.gallery-side [data-image="right"]').click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Tutup gambar',exact:true}).click();
  await page.evaluate(()=>window.lihatDulu.engine.setView('interior'));
  expect(await page.evaluate(()=>window.lihatDulu.engine.getState().motions.left)).toBe(100);
});

test('user names remain text on report and room breadcrumb',async({page})=>{
  await page.goto('/laporan');const url=await page.evaluate(()=>import('/src/state.js').then(m=>m.makeReportURL({...m.freshEditableReport(),name:'<img src=x onerror="window.__nameXSS=1">'})));
  await page.goto(url);await page.getByRole('button',{name:'Coba di ruangmu',exact:true}).click();
  await page.waitForTimeout(200);expect(await page.evaluate(()=>window.__nameXSS)).toBeUndefined();
  await expect(page.locator('.breadcrumb')).toContainText('<img src=x');
});

test('studio coverage examples never replace evidence in an imported report',async({page})=>{
  await page.goto('/laporan');
  const url=await page.evaluate(()=>import('/src/state.js').then(m=>m.makeReportURL({...m.freshEditableReport(),name:'Raport satu area',views:['front']})));
  await page.goto(url);await page.getByRole('link',{name:'Studio 3D',exact:true}).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
  await page.locator('[data-chapter="3"]').click();await page.locator('[data-action="studio-complete"]').click();
  expect(await page.evaluate(()=>window.lihatDulu.report.views)).toEqual(['front']);
  await page.locator('.studio-heading [data-action="open-current"]').click();await expect(page.getByText('1 dari 9 area',{exact:true})).toBeVisible();
});

test('phone layouts and reduced-motion chapter navigation remain contained',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});
    for(const path of ['/','/platform','/buat','/laporan','/tersimpan']){await page.goto(path);await page.waitForTimeout(80);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} at ${width}`).toBe(true);}
    await page.goto('/studio?mode=guided');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
    await page.locator('[data-action="chapters-modal"]').click();await page.getByRole('dialog').locator('[data-chapter="0"]').click();
    for(let i=0;i<9;i++)await page.getByRole('button',{name:'Berikutnya',exact:true}).click();
    await expect(page.locator('#chapter-title')).toHaveText('Periksa ruang bukanya');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await newCapture(page,'Draf ponsel');
    await page.locator('[data-action="area-picker"]').click();await page.getByRole('dialog').locator('[data-area="drawer"]').click();
    const action=await page.locator('.capture-action-dock').boundingBox();expect(action.y+action.height).toBeLessThanOrEqual(844);expect(await page.locator('.recording-visual').evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThan(action.y);
    await page.getByRole('button',{name:'Tinjau rekaman',exact:true}).click();
    await page.locator('[data-retake="rear"]').click();
    expect(await page.evaluate(()=>window.lihatDulu.capture.activeArea)).toBe('rear');
    const retakeDock=await page.locator('.capture-action-dock').boundingBox();expect(retakeDock.y+retakeDock.height).toBeLessThanOrEqual(844);expect(await page.locator('.recording-visual').evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThan(retakeDock.y);
  }
});

test('storage failure uses session fallback while capture remains usable',async({page})=>{
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked')};});
  await newCapture(page,'Draf sesi');await capturePhoto(page);
  expect(await page.evaluate(()=>window.lihatDulu.capture.areas.front)).toBe('captured');
  await page.getByRole('button',{name:'Tinjau rekaman',exact:true}).click();await page.getByRole('button',{name:'Siapkan laporan',exact:true}).click();
  await page.getByRole('button',{name:'Buat tautan laporan',exact:true}).click();await expect(page.getByLabel('Tautan laporan')).toHaveValue(/#r=/);
});
