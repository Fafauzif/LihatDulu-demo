import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { testBrowserPath } from './test-browser.js';

// Runs against the deployable production bundle. Reports and screenshots live
// outside the release tree; no test fixture changes the authored catalogue.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.env.QA_OUTPUT || path.resolve(root, '../../../qa-v8');
const base = process.env.QA_BASE || `http://127.0.0.1:${process.env.QA_PORT || 5228}`;
const selection = process.env.QA_ONLY ? new RegExp(process.env.QA_ONLY, 'i') : null;
const report = { started: new Date().toISOString(), bundle: 'app/dist', checks: [], layouts: [], screenshots: [], pageErrors: [], consoleErrors: [], failedResponses: [], externalRequests: [], mediaCalls: [] };
await fs.mkdir(output, { recursive: true });
const server = process.env.QA_BASE ? null : await preview({ root, preview: { host: '127.0.0.1', port: Number(new URL(base).port), strictPort: true } });
const browser = await chromium.launch({ executablePath: await testBrowserPath(), headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.exposeBinding('qaMediaCall', (_source, call) => report.mediaCalls.push(call));
await context.addInitScript(() => {
  if (navigator.mediaDevices) for (const method of ['getUserMedia', 'getDisplayMedia']) navigator.mediaDevices[method] = async constraints => {
    void window.qaMediaCall({ method, constraints });
    throw new Error('Prepared examples cannot acquire device media');
  };
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
let expectedFailure = false;
page.on('pageerror', error => report.pageErrors.push({ url: page.url(), message: error.message }));
page.on('console', message => { if (message.type() === 'error' && !expectedFailure) report.consoleErrors.push({ url: page.url(), message: message.text() }); });
page.on('response', response => { if (response.status() >= 400 && !expectedFailure) report.failedResponses.push({ url: response.url(), status: response.status() }); });
page.on('request', request => { if (!request.url().startsWith(base) && !/^(?:data|blob):/.test(request.url())) report.externalRequests.push(request.url()); });
async function persist() { await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2)); }
async function check(name, run) {
  if (selection && !selection.test(name)) return;
  try { report.checks.push({ name, pass: true, evidence: await run() }); console.log('PASS', name); }
  catch (error) { report.checks.push({ name, pass: false, error: error.stack || error.message }); console.error('FAIL', name, error.message); }
  await persist();
}
async function open(route) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.locator('#main').waitFor();
  await page.evaluate(async () => { await document.fonts.ready; });
}
async function listingIds(scope = page.locator('.catalogue-results')) {
  return scope.locator('[data-listing]').evaluateAll(nodes => nodes.map(node => node.dataset.listing).filter(id => !['lino', 'nara'].includes(id)));
}
async function resetState() { await open('/beli'); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); }
async function shot(name) {
  // Resolve below-the-fold lazy images before a full-page capture. This affects
  // delivery scheduling only; media sources and layout remain the application’s.
  await page.evaluate(async () => { await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })); });
  const filename = path.join(output, name + '.png'); await page.screenshot({ path: filename, fullPage: true }); report.screenshots.push(filename);
}
async function filters() { await page.locator('[data-action="open-filters"]').click(); return page.locator('dialog[open]'); }
async function cancelDialog() { await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog[open]').count(), 0); }
async function applyFilters(dialog) { await dialog.locator('[data-filters] button[type="submit"]').click(); }
async function assertDialogContract() {
  const state = await page.locator('dialog[open]').evaluate(dialog => {
    const label = dialog.getAttribute('aria-label');
    const by = dialog.getAttribute('aria-labelledby');
    return { label: label || by?.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim(), modal: dialog.matches(':modal'), focusInside: dialog.contains(document.activeElement) };
  });
  assert.ok(state.label, 'Dialog needs an accessible name');
  assert.equal(state.modal, true, 'Native modal blocks background focus and pointer interaction');
  assert.equal(state.focusInside, true);
  for (let n = 0; n < 12; n++) { await page.keyboard.press('Tab'); assert.ok(await page.locator('dialog[open]').evaluate(dialog => dialog.contains(document.activeElement)), 'Tab must stay inside the active dialog'); }
  return state;
}
async function layout(name) {
  const facts = await page.evaluate(() => {
    const visible = element => { const box = element.getBoundingClientRect(); const style = getComputedStyle(element); return box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'; };
    const scroller = element => { for (let parent = element.parentElement; parent; parent = parent.parentElement) if (/(auto|scroll)/.test(getComputedStyle(parent).overflowX)) return true; return false; };
    const clipped = [...document.querySelectorAll('#main a,#main button,#main input,#main select,#main textarea')].filter(visible).map(element => ({ label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 60), box: element.getBoundingClientRect().toJSON(), allowedScroll: scroller(element) })).filter(item => (item.box.left < -1 || item.box.right > innerWidth + 1) && !item.allowedScroll);
    const broken = [...document.images].filter(image => visible(image) && image.complete && !image.naturalWidth && !image.dataset.failed).map(image => image.src);
    return { viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth, clipped, broken };
  });
  report.layouts.push({ name, ...facts });
  assert.ok(facts.scrollWidth <= facts.viewport.width + 1, name + ': document overflow');
  assert.deepEqual(facts.clipped, [], name + ': unbounded clipped controls');
  assert.deepEqual(facts.broken, [], name + ': broken visible images');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const overlaps = await page.evaluate(() => {
    const fixed = [...document.querySelectorAll('body *')].filter(element => { const b = element.getBoundingClientRect(), s = getComputedStyle(element); return s.position === 'fixed' && s.pointerEvents !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && b.top < innerHeight && b.bottom > 0; });
    return [...document.querySelectorAll('footer a,footer button')].filter(element => {
      const box = element.getBoundingClientRect(); if (!box.width || !box.height || box.top >= innerHeight || box.bottom <= 0) return false;
      return fixed.some(surface => { if (surface.contains(element) || element.contains(surface)) return false; const target = surface.getBoundingClientRect(); return box.left < target.right && box.right > target.left && box.top < target.bottom && box.bottom > target.top; });
    }).map(element => element.textContent.trim());
  });
  facts.footerOverlaps = overlaps;
  await persist();
  assert.deepEqual(overlaps, [], name + ': fixed surfaces obscure footer actions');
  await page.evaluate(() => window.scrollTo(0, 0));
  return facts;
}

try {
  await check('ET01 root gateway and complete priced first catalogue row', async () => {
    await resetState(); await page.setViewportSize({ width: 1440, height: 900 }); await open('/');
    assert.ok(await page.locator('a[href="/beli"]').count()); assert.ok(await page.locator('a[href="/jual"]').count());
    assert.ok(await page.locator('[data-listing] .card-price,[data-listing] .card-asking-price').count(), 'Root exposes priced furniture');
    await shot('root-desktop'); await open('/beli');
    assert.equal(await page.locator('form[data-search]:visible input[name="q"]').count(), 1, 'One catalogue search surface');
    const cards = page.locator('.catalogue-results .product-grid [data-listing]');
    assert.equal((await listingIds()).length, 10);
    const firstRow = await cards.evaluateAll(nodes => nodes.slice(0, 4).map(node => ({ id: node.dataset.listing, box: node.getBoundingClientRect().toJSON(), price: node.querySelector('.card-asking-price,.card-price')?.getBoundingClientRect().toJSON() })));
    assert.equal(firstRow.length, 4); assert.ok(firstRow.every(card => card.price && card.price.bottom <= 900), 'Four complete first-row prices visible at desktop');
    assert.ok(firstRow.every(card => card.box.height <= 490), 'Cards stay compact enough for row comparison');
    await shot('catalogue-desktop');
    await page.setViewportSize({ width: 390, height: 844 }); await open('/beli');
    const phoneRow = await page.locator('.catalogue-results .product-grid [data-listing]').evaluateAll(nodes => nodes.slice(0, 2).map(node => {
      const price = node.querySelector('.card-asking-price,.card-price'), number = price?.querySelector('strong') || price, title = node.querySelector('h3');
      return { id: node.dataset.listing, price: price?.getBoundingClientRect().toJSON(), priceSize: number ? parseFloat(getComputedStyle(number).fontSize) : 0, titleSize: title ? parseFloat(getComputedStyle(title).fontSize) : 0 };
    }));
    assert.ok(phoneRow.every(card => card.price && card.price.bottom <= 844), 'First phone row prices fit at normal text scale');
    assert.ok(phoneRow.every(card => card.priceSize >= 16 && card.titleSize >= 15), 'Phone card title and price meet the documented type targets');
    return { desktop: firstRow, phone: phoneRow };
  });
  await check('ET02 ET03 filter edits cancel and one criterion removal retain query', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await open('/beli?q=meja+kerja');
    assert.deepEqual(await listingIds(), ['loka']); const initial = page.url();
    let dialog = await filters(); await dialog.locator('[name="locations"][value="Bandung"]').check();
    assert.equal(page.url(), initial); await assertDialogContract(); await cancelDialog();
    assert.equal(page.url(), initial); assert.deepEqual(await listingIds(), ['loka']);
    dialog = await filters(); assert.equal(await dialog.locator('[name="locations"][value="Bandung"]').isChecked(), false);
    await dialog.locator('[name="locations"][value="Bandung"]').check(); await applyFilters(dialog);
    assert.deepEqual(await listingIds(), []); assert.equal(new URL(page.url()).searchParams.get('q'), 'meja kerja');
    await page.locator('[data-action="remove-filter"][data-key="locations"]').click(); assert.deepEqual(await listingIds(), ['loka']);
    return { restored: await listingIds(), url: page.url() };
  });
  await check('ET04 ET05 reset draft preserves query sort and invalid range cannot commit', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await open('/beli?q=meja+kerja&locations=Bandung&sort=price-desc');
    const initial = page.url(); let dialog = await filters(); await dialog.locator('[data-action="filter-reset"]').click(); await cancelDialog(); assert.equal(page.url(), initial);
    dialog = await filters(); await dialog.locator('[data-action="filter-reset"]').click(); await applyFilters(dialog);
    let params = new URL(page.url()).searchParams; assert.equal(params.get('q'), 'meja kerja'); assert.equal(params.get('sort'), 'price-desc'); assert.equal(params.has('locations'), false); assert.deepEqual(await listingIds(), ['loka']);
    const before = { url: page.url(), history: await page.evaluate(() => history.length) };
    dialog = await filters(); await dialog.locator('[name="min"]').fill('2000000'); await dialog.locator('[name="max"]').fill('1000000'); await applyFilters(dialog);
    assert.equal(page.url(), before.url); assert.equal(await page.evaluate(() => history.length), before.history); assert.ok(await page.locator('dialog[open]').count());
    assert.match(await dialog.innerText(), /minimum|minimal|maksimum|lebih kecil|lebih besar|rentang.*tidak|perbaiki|tidak valid/i); await cancelDialog();
    return { before, after: page.url() };
  });
  await check('ET08 ET09 exact model eligibility and deterministic prices', async () => {
    const evidence = {};
    for (const [query, expected] of [['model=1', ['sora','arca','batu','rimba']], ['sort=price-asc', ['ruji','tala']], ['sort=price-desc', ['rimba','awan']]]) {
      await open('/beli?' + query); const actual = await listingIds(); evidence[query] = actual;
      assert.deepEqual(query === 'model=1' ? actual : actual.slice(0, 2), expected);
      await page.reload({ waitUntil: 'networkidle' }); assert.deepEqual(await listingIds(), actual);
    }
    return evidence;
  });
  await check('ET11 category directory destinations match actual collection members', async () => {
    await open('/');
    const expected = [['Tempat duduk',['arca','tala','awan','senja','ruji']], ['Meja',['batu','loka']], ['Penyimpanan',['sora','rimba','nusa']]];
    const evidence = [];
    for (const [label, members] of expected) {
      await open('/'); const tile = page.locator('.category-tile').filter({ hasText: label }).first(); assert.match(await tile.innerText(), new RegExp(members.length + ' barang'));
      await tile.click(); const actual = await listingIds(); assert.deepEqual([...actual].sort(), [...members].sort()); evidence.push({ label, actual });
    }
    await open('/'); await page.locator('.quick-collection[href="/beli?max=1500000"]').click(); assert.deepEqual((await listingIds()).sort(), ['arca','tala','nusa','ruji'].sort());
    return evidence;
  });
  await check('ET12 save and compare buttons do not navigate and compare caps at three', async () => {
    await resetState(); await open('/beli'); const origin = page.url();
    await page.locator('[data-action="save"][data-id="sora"]').first().click(); assert.equal(page.url(), origin);
    for (const id of ['sora','arca','batu','rimba']) await page.locator(`[data-action="compare"][data-id="${id}"]`).first().click();
    assert.equal(page.url(), origin); assert.equal(await page.locator('[data-action="compare"][aria-pressed="true"]').count(), 3);
    return { saved: await page.locator('[data-action="save"][data-id="sora"]').first().getAttribute('aria-pressed'), compared: await page.locator('[data-action="compare"][aria-pressed="true"]').evaluateAll(nodes => nodes.map(node => node.dataset.id)) };
  });
  await check('collection lifecycle four-item detail explicit compare membership Undo and named update', async () => {
    await resetState(); await page.setViewportSize({ width: 390, height: 844 }); await open('/beli');
    for (const id of ['sora','arca','batu','rimba']) await page.locator(`[data-action="save"][data-id="${id}"]`).click();
    await open('/tersimpan?view=barang'); await page.locator('[data-action="collection"]').click(); let form = page.locator('dialog[open] [data-collection]');
    await form.locator('[name="name"]').fill('Ruang keluarga uji'); await form.locator('[type="submit"]').click();
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:marketplace:v1')).collections[0]); assert.deepEqual(before.ids, ['sora','arca','batu','rimba']);
    await page.getByRole('link', { name: 'Buka koleksi', exact: true }).click(); const detailUrl = page.url();
    const members = () => page.locator('.buyer-collection-detail article[data-listing]').evaluateAll(nodes => nodes.map(node => node.dataset.listing)); assert.deepEqual(await members(), before.ids);
    await page.locator('[data-action="collection-compare"]').click(); form = page.locator('dialog[open] [data-collection-compare]'); assert.equal(await form.count(), 1); assert.equal(await form.locator('[name="ids"]').count(), 4);
    assert.equal(await form.locator('[name="ids"]:checked').count(), 0, 'A four-item collection requires an explicit selection');
    for (const id of ['sora','arca','batu']) await form.locator(`[name="ids"][value="${id}"]`).check(); await form.locator('[type="submit"]').click();
    assert.equal(new URL(page.url()).pathname, '/bandingkan'); assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:compare:v1'))), ['sora','arca','batu']);
    await open(new URL(detailUrl).pathname + new URL(detailUrl).search); await page.locator('[data-action="remove-from-collection"][data-listing="sora"]').click(); assert.deepEqual(await members(), ['arca','batu','rimba']);
    await page.locator('[data-action="undo-local-delete"]').click(); assert.deepEqual(await members(), before.ids);
    await page.locator('[data-action="remove-from-collection"][data-listing="sora"]').click(); const addForm = page.locator('[data-collection-members]'); await addForm.locator('[name="listing"]').selectOption('sora'); await addForm.locator('[type="submit"]').click(); assert.deepEqual((await members()).sort(), [...before.ids].sort());
    await page.locator('[data-action="save"][data-id="rimba"]').click(); await open('/tersimpan?view=barang'); await page.locator('[data-action="collection"]').click(); form = page.locator('dialog[open] [data-collection]');
    await form.locator('[name="name"]').fill('Ruang keluarga uji'); await form.locator('[type="submit"]').click(); assert.equal(await page.locator('dialog[open]').count(), 1); assert.match(await form.locator('#collection-error').innerText(), /sudah ada|mengganti/i);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:marketplace:v1')).collections[0].ids.length), 4, 'Initial same-name submission does not replace members');
    await form.getByRole('button', { name: 'Perbarui koleksi', exact: true }).click();
    const updated = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:marketplace:v1')).collections[0]); assert.equal(updated.id, before.id); assert.deepEqual(updated.ids, ['sora','arca','batu']);
    return { original: before, updated, explicitThreeItemComparison: true, memberUndo: true, selectMemberAddition: true };
  });
  await check('ET10 browser Back restores ordered results and useful listing position', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await resetState(); await page.evaluate(() => localStorage.setItem('lihatdulu:compare:v1', JSON.stringify(['sora','arca','batu']))); await open('/beli?sort=price-desc');
    const url = page.url(), ids = await listingIds(), attempts = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      const target = page.locator('[data-listing="ruji"] .card-image'); await target.scrollIntoViewIfNeeded();
      const beforeAction = await page.evaluate(() => scrollY); assert.ok(beforeAction > 200, 'Return-position case starts below the first row');
      await target.evaluate(anchor => anchor.addEventListener('click', () => { window.qaReturnPosition = { scrollY, card: anchor.getBoundingClientRect().toJSON() }; }, { capture: true, once: true }));
      await target.click(); await page.waitForURL('**/barang/ruji'); const atClick = await page.evaluate(() => window.qaReturnPosition); assert.ok(Number.isFinite(atClick?.scrollY), 'Record actual navigation position after click actionability scrolling');
      await page.goBack({ waitUntil: 'networkidle' }); assert.equal(page.url(), url); assert.deepEqual(await listingIds(), ids);
      const after = await page.evaluate(() => ({ scrollY, state: history.state, card: document.querySelector('[data-listing="ruji"] .card-image').getBoundingClientRect().toJSON() }));
      assert.ok(Math.abs(after.scrollY - atClick.scrollY) <= 160, 'Return keeps the opened item near its navigation position: ' + JSON.stringify({ attempt, beforeAction, atClick, after }));
      attempts.push({ attempt, beforeAction, atClick, after });
    }
    return { attempts, url, ids, compared: 3 };
  });
  await check('ET13 ET14 ET15 offer draft create refresh find edit delete and Undo', async () => {
    await resetState(); await page.setViewportSize({ width: 390, height: 844 }); await open('/barang/sora?tab=photos');
    await page.locator('[data-action="offer"][data-id="sora"]').click(); await assertDialogContract(); let form = page.locator('dialog[open] [data-offer]');
    assert.equal(await form.locator('[name="amount"]').inputValue(), '', 'New amount is an explicit choice'); assert.match(await form.innerText(), /Studio Sora/); assert.match(await form.innerText(), /1 barang/); assert.match(await form.innerText(), /belum dikirim/);
    await form.locator('[name="amount"]').fill('2.200.000'); await form.locator('[name="note"]').fill('Rencana ambil sendiri.\nPeriksa pintu kiri terlebih dahulu.');
    assert.match(await form.locator('[data-offer-preview]').innerText(), /2[.]200[.]000/); await form.locator('button[type="submit"]').click();
    assert.equal(await page.locator('dialog[open]').count(), 0); assert.match(await page.locator('[data-product-offer]').innerText(), /Lihat draf penawaran/); assert.match(await page.locator('[data-product-offer]').innerText(), /2[.]200[.]000/);
    await open('/tersimpan?view=draf'); await page.reload({ waitUntil: 'networkidle' }); assert.match(await page.locator('#main').innerText(), /Periksa pintu kiri terlebih dahulu/);
    await page.locator('[data-action="offer"][data-id="sora"]').click(); form = page.locator('dialog[open] [data-offer]'); assert.equal(await form.locator('[name="amount"]').inputValue(), '2200000');
    await form.locator('[name="amount"]').fill('2150000'); await form.locator('button[type="submit"]').click();
    await page.locator('[data-action="delete-offer"][data-id="sora"]').click(); assert.equal(await page.locator('[data-action="offer"][data-id="sora"]').count(), 0);
    await page.locator('[data-action="undo-buyer-delete"]').first().click(); assert.match(await page.locator('#main').innerText(), /2[.]150[.]000/); assert.match(await page.locator('#main').innerText(), /Periksa pintu kiri terlebih dahulu/);
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:buyer-records:v1')).offers.sora);
    assert.equal(record.amountIdr, 2150000); assert.equal(record.referencePriceIdr, 2450000); assert.ok(record.updatedAt); return record;
  });
  await check('ET16 invalid offer amount keeps note and shows visible inline error', async () => {
    await open('/barang/sora?tab=photos'); await page.locator('[data-action="offer"][data-id="sora"]').click();
    const form = page.locator('dialog[open] [data-offer]'), note = 'Jangan hilangkan catatan ini.'; await form.locator('[name="note"]').fill(note);
    for (const amount of ['0','2.20','2450001']) {
      await form.locator('[name="amount"]').fill(amount); await form.locator('button[type="submit"]').click();
      assert.equal(await page.locator('dialog[open]').count(), 1); assert.equal(await form.locator('[name="note"]').inputValue(), note); assert.equal(await form.locator('[name="amount"]').getAttribute('aria-invalid'), 'true');
      const visibleErrors = await form.locator('#offer-amount-error:visible,[data-offer-error]:visible').allTextContents(); assert.ok(visibleErrors.some(text => text.trim()), 'Invalid amount has a visible explanation');
    }
    await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog[open]').count(), 1, 'Dirty offer gets a chance to keep writing'); await page.locator('[data-action="keep-editing"]').click(); assert.equal(await form.locator('[name="note"]').inputValue(), note);
    await page.keyboard.press('Escape'); await page.locator('[data-action="discard-edit"]').click(); return { invalid: ['0','2.20','2450001'], retainedNote: true, dirtyEscape: true };
  });
  await check('ET17 old-format draft retains useful text and unknown original history', async () => {
    await resetState(); await page.evaluate(() => localStorage.setItem('lihatdulu:offer:sora', JSON.stringify({ amount: 2100000, note: 'Catatan dari versi sebelumnya' }))); await open('/tersimpan?view=draf');
    assert.match(await page.locator('#main').innerText(), /Catatan dari versi sebelumnya/); assert.match(await page.locator('#main').innerText(), /waktu awal tidak tercatat/i); assert.match(await page.locator('#main').innerText(), /Harga.*awal.*tidak tercatat/i);
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:buyer-records:v1')).offers.sora); assert.equal(record.amountIdr, 2100000); assert.equal(record.referencePriceIdr, null); assert.equal(record.createdAt, null); return record;
  });
  await check('ET18 changed price and unavailable item keep offer readable', async () => {
    await resetState(); await open('/barang/sora?tab=photos'); await page.locator('[data-action="offer"][data-id="sora"]').click();
    const form = page.locator('dialog[open] [data-offer]'); await form.locator('[name="amount"]').fill('2100000'); await form.locator('[name="note"]').fill('Catatan yang harus tetap tersedia.'); await form.locator('button[type="submit"]').click();
    await page.evaluate(() => localStorage.setItem('lihatdulu:marketplace:v1', JSON.stringify({ schema:1, cart:[], drafts:{sora:{price:2000000,status:'reserved'}}, collections:[], checkout:{delivery:'pickup',payment:'bank'} }))); await open('/tersimpan?view=draf');
    assert.match(await page.locator('#main').innerText(), /harga.*berubah/i); assert.match(await page.locator('#main').innerText(), /tidak tersedia/i); assert.match(await page.locator('#main').innerText(), /Catatan yang harus tetap tersedia/);
    await open('/barang/sora?tab=photos'); assert.equal(await page.locator('[data-action="add-cart"]:enabled').count(), 0); assert.ok(await page.locator('[data-action="offer"][data-id="sora"]').count());
    await resetState(); return { notePreserved: true, purchaseDisabled: true };
  });
  await check('unavailable saved listing retains known facts and legacy seller identity', async () => {
    await resetState(); await page.evaluate(() => {
      localStorage.setItem('lihatdulu:favourites:v2', JSON.stringify(['sora']));
      localStorage.setItem('lihatdulu:marketplace:v1', JSON.stringify({ schema:1, cart:[], drafts:{sora:{status:'reserved'}}, collections:[], checkout:{delivery:'pickup',payment:'bank'} }));
    });
    await open('/tersimpan?view=barang'); const card = page.locator('.product-card[data-listing="sora"]');
    assert.match(await card.innerText(), /2[.]450[.]000/); assert.match(await card.innerText(), /tidak tersedia/i); assert.doesNotMatch(await card.innerText(), /segera hadir|simpan minat/i);
    assert.equal(await card.locator('[data-action="save"]:enabled').count(), 1); assert.equal(await card.locator('[data-action="compare"]:enabled').count(), 0);
    await open('/barang/sora?tab=photos'); assert.match(await page.locator('.product-identity').innerText(), /2[.]450[.]000/); assert.equal(await page.locator('[data-action="add-cart"]:enabled').count(), 0);
    await open('/toko/sora'); assert.match(await page.locator('#main').innerText(), /Studio Sora/); assert.match(await page.locator('#main').innerText(), /0 furnitur tersedia/); assert.doesNotMatch(await page.locator('#main h1').innerText(), /tidak ditemukan/i);
    await resetState(); return { fixtureStatus: 'reserved', knownPrice: 2450000, saveAvailable: true, comparisonDisabled: true, legacySellerAlias: true };
  });
  await check('R01 R02 PDP cart readonly review and saved snapshot costs agree', async () => {
    await resetState(); await open('/barang/sora?tab=photos'); assert.match(await page.locator('.buyer-price-breakdown .total').innerText(), /2[.]600[.]000/);
    await page.locator('[name="fulfilment"][value="delivery"]').check(); assert.match(await page.locator('.buyer-price-breakdown .total').innerText(), /2[.]750[.]000/);
    await page.locator('.purchase-panel [data-action="add-cart"]').click(); await page.locator('.purchase-panel [data-action="add-cart"]').click();
    await open('/keranjang'); assert.equal(await page.locator('.cart-line').count(), 1); assert.match(await page.locator('.buyer-total-list .total').innerText(), /2[.]750[.]000/);
    await page.locator('[name="cart-delivery"][value="pickup"]').check(); assert.match(await page.locator('.buyer-total-list .total').innerText(), /2[.]600[.]000/);
    await page.locator('a[href="/tinjau-pesanan"]').click(); assert.equal(await page.locator('[name="cart-delivery"],[data-action="remove-cart"]').count(), 0); assert.match(await page.locator('.buyer-total-list .total').innerText(), /2[.]600[.]000/);
    await page.locator('[data-action="save-summary"]').click(); const url = page.url(); assert.ok(new URL(url).searchParams.get('summary')); assert.match(await page.locator('.buyer-snapshot-heading').innerText(), /Ringkasan tersimpan di perangkat ini/);
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:buyer-records:v1')).summaries[0]); assert.equal(record.total, 2600000); assert.equal(record.items[0].priceIdr, 2450000);
    await page.reload({ waitUntil: 'networkidle' }); assert.match(await page.locator('.buyer-total-list .total').innerText(), /2[.]600[.]000/);
    await open('/keranjang'); await page.locator('[name="cart-delivery"][value="delivery"]').check(); await page.locator('[data-action="remove-cart"]').click();
    await open('/tersimpan?view=ringkasan'); await page.locator('.buyer-summary-card a').click(); assert.equal(page.url(), url); assert.match(await page.locator('.buyer-total-list .total').innerText(), /2[.]600[.]000/);
    const unchanged = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:buyer-records:v1')).summaries[0]); assert.deepEqual(unchanged, record);
    await shot('saved-summary-phone');
    await page.locator('[data-action="delete-summary"]').click(); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:buyer-records:v1')).summaries.length), 0);
    await page.locator('[data-action="undo-buyer-delete"]').first().click(); assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:buyer-records:v1')).summaries[0]), record);
    return { url, snapshot: record, deleteUndo: true };
  });
  await check('ET19 blocked storage labels temporary draft and keeps it through local navigation', async () => {
    await resetState(); const blocked = await context.newPage(); const errors = []; blocked.on('pageerror', error => errors.push(error.message));
    try {
      await blocked.addInitScript(() => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === 'lihatdulu:buyer-records:v1') throw new DOMException('QA quota fixture', 'QuotaExceededError'); return original.call(this, key, value); }; });
      await blocked.goto(base + '/barang/sora?tab=photos', { waitUntil: 'networkidle' }); await blocked.locator('[data-action="offer"][data-id="sora"]').click();
      const form = blocked.locator('dialog[open] [data-offer]'); await form.locator('[name="amount"]').fill('2200000'); await form.locator('[name="note"]').fill('Draf tetap tersedia pada tab ini.'); await form.locator('button[type="submit"]').click();
      assert.match(await blocked.locator('[data-product-offer]').innerText(), /selama sesi ini|selama tab ini|sementara/i); assert.equal(await blocked.evaluate(() => localStorage.getItem('lihatdulu:buyer-records:v1')), null);
      await blocked.getByRole('link', { name: 'Pilihan tersimpan', exact: true }).click(); await blocked.locator('a[href="/tersimpan?view=draf"]').click();
      assert.match(await blocked.locator('#main').innerText(), /Draf tetap tersedia pada tab ini/); assert.match(await blocked.locator('#main').innerText(), /selama sesi ini|selama tab ini|sementara/i); assert.deepEqual(errors, []);
      return { temporaryOutcomeVisible: true, noteSurvivesInternalNavigation: true, durableWrite: false };
    } finally { await blocked.close(); }
  });
  await check('ET23 ET24 ET25 original gallery sources condition notes and single-photo truth', async () => {
    await open('/barang/sora?tab=photos');
    assert.equal(await page.locator('.gallery-thumb').count(), 7);
    const firstSource = await page.locator('.gallery-main img').getAttribute('src'); assert.equal(firstSource, '/images/products/sora/hero.webp');
    await page.locator('[data-action="enlarge-photo"]').click(); await assertDialogContract(); assert.equal(await page.locator('dialog[open] img').first().getAttribute('src'), firstSource); await cancelDialog();
    const notes = await page.locator('.condition-card').evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.id, image: node.querySelector('img')?.getAttribute('src') })));
    assert.equal(notes.length, 3); assert.equal(new Set(notes.map(note => note.id)).size, 3);
    for (const note of notes) {
      await page.locator(`.condition-card[data-id="${note.id}"]`).click(); await assertDialogContract();
      assert.equal(await page.locator('dialog[open] img').first().getAttribute('src'), note.image); assert.match(await page.locator('dialog[open]').innerText(), /(?:cm|mm)/); await cancelDialog();
      assert.equal(await page.locator(`.condition-card[data-id="${note.id}"]`).evaluate(node => node === document.activeElement), true, 'Condition reader returns focus to its note');
    }
    await open('/barang/tala?tab=photos'); assert.equal(await page.locator('.gallery-main img').getAttribute('src'), '/images/examples/tala.webp');
    assert.equal(await page.locator('[data-action="photo-next"],[data-action="photo-prev"]').count(), 0); assert.equal(await page.locator('.inspection').count(), 0); assert.match(await page.locator('#main').innerText(), /satu foto|1 foto|gambar dekat.*belum|foto contoh/i);
    return { firstSource, notes };
  });
  await check('ET26 ET27 ET28 prepared width edges and both resets retain Tala', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); const evidence = [];
    for (const [width, expected] of [[60,['tala']], [50,[]], [72,['tala','senja']], [73,['arca','tala','senja']]]) {
      await open(`/cari-dari-foto?source=tala&width=${width}`); const actual = await listingIds(page.locator('#camera-results')); assert.deepEqual([...actual].sort(), [...expected].sort()); evidence.push({ width, actual });
      assert.equal(await page.locator('[data-photo-source]').inputValue(), 'tala'); assert.match(await page.locator('.camera-selected-reference').innerText(), /Tala/);
    }
    await open('/cari-dari-foto?source=tala&width=60'); const unchangedUrl = page.url(), widthForm = page.locator('[data-photo-limits]');
    await widthForm.locator('[name="width"]').fill('501'); await widthForm.locator('[type="submit"]').click(); assert.equal(page.url(), unchangedUrl); assert.equal(await widthForm.locator('[name="width"]').inputValue(), '501');
    assert.equal(await widthForm.locator('[name="width"]').getAttribute('aria-invalid'), 'true'); assert.ok(await widthForm.locator('[data-width-error]').isVisible()); assert.match(await widthForm.locator('[data-width-error]').innerText(), /1.*500/);
    await widthForm.locator('[name="width"]').fill('72.6'); await widthForm.locator('[type="submit"]').click(); assert.equal(new URL(page.url()).searchParams.get('width'), '72.6'); assert.equal((await listingIds(page.locator('#camera-results'))).length, 3);
    await open('/cari-dari-foto?source=tala&width=60'); await page.locator('[data-action="photo-reset"]').click();
    assert.equal(new URL(page.url()).searchParams.get('source'), 'tala'); assert.equal(new URL(page.url()).searchParams.has('width'), false); assert.equal((await listingIds(page.locator('#camera-results'))).length, 3);
    await open('/cari-dari-foto?source=tala&width=50'); await page.locator('#camera-results .empty-state [data-action="photo-reset"]').click();
    assert.equal(new URL(page.url()).searchParams.get('source'), 'tala'); assert.equal(new URL(page.url()).searchParams.has('width'), false);
    await shot('reference-tala-phone'); return evidence;
  });
  await check('ET20 honest single-item seller and legacy store alias', async () => {
    await open('/toko/sora'); assert.match(await page.locator('#main').innerText(), /Studio Sora/); assert.match(await page.locator('#main').innerText(), /1 barang|1 furnitur/);
    const inventory = page.locator('[data-seller-inventory],.store-inventory,.store-page > .product-grid,.store-products').first();
    const ids = await listingIds(await inventory.count() ? inventory : page.locator('#main'));
    assert.ok(ids.includes('sora')); assert.equal(await page.locator('#main form[data-search]').count(), 0);
    assert.doesNotMatch(await page.locator('#main').innerText(), /bintang|\b[0-5][,.][0-9]\s*\(|terjual\s*\d|respons\s*\d/i);
    return { ids };
  });
  await check('ET29 model failure keeps picture facts and purchase recovery useful', async () => {
    expectedFailure = true; await page.route('**/assets/cabinet.glb', route => route.abort('failed'));
    try {
      await open('/barang/sora?tab=model'); await page.locator('.inspection-error').waitFor({ state: 'visible', timeout: 45000 });
      assert.ok(await page.locator('.purchase-panel').isVisible()); assert.match(await page.locator('.purchase-panel').innerText(), /2[.]450[.]000/);
      assert.ok(await page.locator('.inspection img').count(), 'Model failure keeps its poster');
      assert.ok(await page.locator('.inspection').getByRole('button', { name: /coba|ulang|retry/i }).count(), 'Model failure exposes retry');
      await shot('model-failure-phone'); return { poster: true, facts: true, retry: true };
    } finally { await page.unroute('**/assets/cabinet.glb'); expectedFailure = false; }
  });
  await check('real model pauses offscreen and context loss recovers through retry', async () => {
    await page.setViewportSize({ width: 1440, height: 900 }); await open('/barang/sora?tab=model'); await page.locator('.inspection-stage').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => window.lihatDulu?.engine?.renderer?.info.render.triangles > 0, null, { timeout: 45000 });
    const triangles = await page.evaluate(() => window.lihatDulu.engine.renderer.info.render.triangles); assert.ok(triangles > 0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForFunction(() => document.querySelector('.inspection-stage').getBoundingClientRect().bottom < 0); await page.waitForTimeout(150);
    const before = await page.evaluate(() => window.lihatDulu.engine.renderer.info.render.frame); await page.waitForTimeout(1200); const after = await page.evaluate(() => window.lihatDulu.engine.renderer.info.render.frame); assert.equal(after, before, 'Offscreen model stops producing frames');
    await page.locator('.inspection-stage').scrollIntoViewIfNeeded(); await page.waitForFunction(frame => window.lihatDulu?.engine?.renderer?.info.render.frame > frame, after);
    expectedFailure = true;
    try {
      const supported = await page.evaluate(() => { const extension = window.lihatDulu.engine.renderer.getContext().getExtension('WEBGL_lose_context'); if (!extension) return false; extension.loseContext(); return true; }); assert.equal(supported, true, 'Test renderer supports explicit context-loss exercise');
      await page.locator('.inspection[data-engine-state="error"]').waitFor(); assert.ok(await page.locator('.inspection-error').isVisible()); assert.ok(await page.locator('.inspection-poster').isVisible());
      assert.equal(await page.locator('.inspection [data-engine-control]:enabled').count(), 0); assert.equal(await page.evaluate(() => Boolean(window.lihatDulu.engine)), false);
      await page.locator('[data-inspection-action="retry"]').click(); await page.waitForFunction(() => window.lihatDulu?.engine?.renderer?.info.render.triangles > 0, null, { timeout: 45000 });
      const recovered = await page.evaluate(() => window.lihatDulu.engine.renderer.info.render.triangles); assert.ok(recovered > 0); assert.ok(await page.locator('.inspection [data-engine-control]:enabled').count());
      return { triangles, offscreenFrames: after - before, retryTriangles: recovered };
    } finally { expectedFailure = false; }
  });
  await check('ET33 malformed source width and sort show safe supported state', async () => {
    await open('/cari-dari-foto?source=untrusted&width=NaN'); assert.equal(await page.locator('[data-photo-source]').inputValue(), 'arca'); assert.equal(await page.locator('[data-photo-limits] [name="width"]').inputValue(), ''); assert.equal((await listingIds(page.locator('#camera-results'))).length, 3);
    await open('/beli?sort=untrusted&width=NaN'); assert.equal(await page.locator('[data-sort]').inputValue(), 'relevance'); assert.equal((await listingIds()).length, 10);
    return { source: 'arca', width: 'unbounded', sort: 'relevance' };
  });
  await check('R44 long Indonesian listing seller and condition text remain readable', async () => {
    await page.setViewportSize({ width: 320, height: 568 }); await open('/beli');
    await page.locator('[data-listing="sora"]').evaluate(card => {
      card.querySelector('h3 a').textContent = 'Lemari penyimpanan ruang keluarga dengan pintu ganda dan laci perlengkapan rumah';
      card.querySelector('.card-seller a').textContent = 'Studio furnitur keluarga dan perlengkapan rumah Jakarta Selatan';
      card.querySelector('.card-condition').textContent = 'Goresan pemakaian terlihat di pintu kiri, sudut kanan atas, dan permukaan bagian atas.';
    });
    const text = await page.locator('[data-listing="sora"] h3,[data-listing="sora"] .card-seller,[data-listing="sora"] .card-condition,[data-listing="sora"] .card-asking-price').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent.trim(), clientWidth: node.clientWidth, scrollWidth: node.scrollWidth, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight })));
    assert.ok(text.every(item => item.scrollWidth <= item.clientWidth + 1 && item.scrollHeight <= item.clientHeight + 1), 'Important text is not clipped');
    await layout('320 long-name DOM fixture'); await shot('long-name-fixture-phone'); return { fixture: 'Text-only DOM layout stress; no authored inventory changes', text };
  });
  await check('ET32 ET36 responsive pages and footer controls above fixed surfaces', async () => {
    await open('/beli'); await page.evaluate(() => {
      localStorage.setItem('lihatdulu:compare:v1', JSON.stringify(['sora','arca','batu']));
      localStorage.setItem('lihatdulu:marketplace:v1', JSON.stringify({ schema:1, cart:['sora','arca'], drafts:{}, collections:[], checkout:{delivery:'delivery',payment:'bank'} }));
    });
    const states = [[320,568],[390,844],[430,932],[768,1024],[1024,768],[1280,800],[1440,900]];
    const routes = ['/','/beli','/barang/sora?tab=photos','/barang/tala','/tersimpan','/keranjang','/tinjau-pesanan','/bandingkan','/cari-dari-foto?source=tala&width=50','/toko/sora','/jual'];
    for (const [width,height] of states) {
      await page.setViewportSize({ width,height });
      for (const route of routes) { await open(route); await layout(`${width}x${height} ${route}`); }
      if ([320,390,1440].includes(width)) { await open('/beli'); await shot('catalogue-' + width); }
    }
    await page.setViewportSize({ width: 390, height: 844 }); await open('/beli'); await page.evaluate(() => { document.documentElement.style.zoom = '2'; }); await layout('390 CSS zoom 200%');
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    return { sizes: states, routes, note: 'CSS zoom is a layout approximation; physical phone keyboard and Safari remain unverified.' };
  });
  await check('ET30 ET31 phone modal last fields and return focus', async () => {
    await page.setViewportSize({ width: 390, height: 568 }); await open('/beli'); const trigger = page.locator('[data-action="open-filters"]'); await trigger.click(); const dialog = page.locator('dialog[open]');
    const contract = await assertDialogContract(); const submit = dialog.locator('[data-filters] button[type="submit"]'); await submit.scrollIntoViewIfNeeded(); const box = await submit.boundingBox();
    assert.ok(box.y >= 0 && box.y + box.height <= 568, 'Last filter action is reachable within short viewport');
    await cancelDialog(); assert.equal(await trigger.evaluate(node => node === document.activeElement), true); return contract;
  });
  await check('prepared seller playback restart retains evidence and preview disables purchases', async () => {
    await open('/jual/sora/rekam'); const video = page.locator('video'); await video.waitFor(); await page.waitForFunction(() => document.querySelector('video')?.duration > 0);
    assert.equal(await video.evaluate(node => node.duration), 18); assert.equal(await video.evaluate(node => node.paused), true);
    await page.locator('[data-video-action="capture"]:visible').first().click(); await page.locator('[data-video-action="chapter"][data-area="right"]').click(); await page.locator('[data-video-action="capture"]:visible').first().click();
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1'))); assert.equal(before.selected.length, 2);
    await page.locator('[data-video-action="play"]').click(); await page.waitForFunction(() => document.querySelector('video')?.currentTime > 3.2);
    await page.locator('[data-video-action="restart"]').click();
    const restarted = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1'))); assert.deepEqual(restarted.selected, before.selected); assert.equal(restarted.elapsed, 0); assert.equal(restarted.paused, true);
    await page.locator('[data-video-action="reset"]').click(); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1')).selected.length), 0);
    await page.locator('[data-video-action="undo"]').click(); assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1')).selected), before.selected);
    const controls = await page.locator('[data-video-action]').evaluateAll(nodes => nodes.map(node => ({ action: node.dataset.videoAction, text: node.textContent.trim() })));
    await open('/barang/sora?preview=1&tab=photos'); assert.equal(await page.locator('[data-action="add-cart"]:enabled,[data-action="offer"]:enabled').count(), 0); assert.match(await page.locator('#main').innerText(), /pratinjau/i);
    return { duration: 18, controls, before, restarted };
  });
  await check('no unexpected script asset external or device-media requests', async () => {
    assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.consoleErrors, []); assert.deepEqual(report.failedResponses, []); assert.deepEqual(report.externalRequests, []); assert.deepEqual(report.mediaCalls, []);
    return { pageErrors: 0, consoleErrors: 0, failedResponses: 0, externalRequests: 0, mediaCalls: 0 };
  });
} finally {
  report.finished = new Date().toISOString(); report.passed = report.checks.filter(check => check.pass).length; report.failed = report.checks.filter(check => !check.pass).length;
  await persist(); await browser.close(); if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
console.log(`V8 browser acceptance: ${report.passed} passed, ${report.failed} failed; report: ${path.join(output, 'report.json')}`);
if (report.failed) process.exitCode = 1;
