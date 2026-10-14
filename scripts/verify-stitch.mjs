import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { AVAILABLE_LISTINGS } from '../src/catalogue.js';
import { filterCatalogue, parseFilters } from '../src/discovery.js';
import { testBrowserPath } from './test-browser.js';

// Run from any directory. The report records real browser evidence, rather than
// treating source text or a screenshot alone as proof of behavior.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.env.QA_OUTPUT || path.join(root, 'qa-stitch');
const base = `http://127.0.0.1:${process.env.QA_PORT || '5209'}`;
const selection = process.env.QA_ONLY ? new RegExp(process.env.QA_ONLY, 'i') : null;
await fs.mkdir(output, { recursive: true });
const results = { scope: process.env.QA_ONLY || 'full', started: new Date().toISOString(), checks: [], layouts: [], screenshots: [], pageErrors: [], consoleErrors: [], assetFailures: [], externalRequests: [], mediaCalls: [] };
const sourceFiles = ['src/main.js', 'src/catalogue.js', 'src/components.js', 'src/stitch.css', 'src/brand-tokens.css', 'src/discovery.js', 'src/video-capture.js', 'src/video-capture.css', 'src/video-state.js', 'src/inspection.js', 'src/inspection.css', 'src/engine.js'];
async function sourceManifest() {
  return Object.fromEntries(await Promise.all(sourceFiles.map(async name => [name, createHash('sha256').update(await fs.readFile(path.join(root, name))).digest('hex')])));
}
results.sourceBefore = await sourceManifest();
const server = await createServer({ root, server: { host: '127.0.0.1', port: Number(new URL(base).port), strictPort: true } });
await server.listen();
const browser = await chromium.launch({ executablePath: await testBrowserPath(), headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.exposeBinding('qaRecordMediaCall', (source, call) => results.mediaCalls.push({ url: source.frame.url(), ...call }));
await context.addInitScript(() => {
  window.qaMediaCalls = [];
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = async constraints => {
      window.qaMediaCalls.push({ method: 'getUserMedia', constraints });
      void window.qaRecordMediaCall({ method: 'getUserMedia', constraints });
      throw new Error('Camera and microphone are outside this prepared journey');
    };
    navigator.mediaDevices.getDisplayMedia = async constraints => {
      window.qaMediaCalls.push({ method: 'getDisplayMedia', constraints });
      void window.qaRecordMediaCall({ method: 'getDisplayMedia', constraints });
      throw new Error('Display capture is outside this prepared journey');
    };
  }
});
if (selection && /layout|mobile filter|reduced-motion/.test(process.env.QA_ONLY)) await context.addInitScript(() => {
  // A targeted layout recheck still needs the populated, widest comparison and
  // seller-grouped cart. Seed once per browser context, then let UI state work.
  if (!sessionStorage.getItem('qa-layout-seeded')) {
    localStorage.setItem('lihatdulu:compare:v1', JSON.stringify(['sora', 'arca', 'batu']));
    localStorage.setItem('lihatdulu:marketplace:v1', JSON.stringify({ schema: 1, cart: ['sora', 'arca'], drafts: {}, collections: [], checkout: { delivery: 'delivery', payment: 'bank' } }));
    sessionStorage.setItem('qa-layout-seeded', '1');
  }
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
let expectedAssetFailure = false;
page.on('pageerror', error => results.pageErrors.push({ url: page.url(), message: error.message }));
page.on('console', message => {
  if (message.type() === 'error' && !expectedAssetFailure) results.consoleErrors.push({ url: page.url(), message: message.text() });
});
page.on('response', response => {
  if (response.status() >= 400 && !expectedAssetFailure) results.assetFailures.push({ url: response.url(), status: response.status() });
});
page.on('request', request => {
  if (!request.url().startsWith(base) && !/^(?:blob|data):/.test(request.url())) results.externalRequests.push(request.url());
});
async function check(name, fn) {
  if (selection && !selection.test(name) && !/^(?:QA observed|no |all referenced assets)/.test(name)) return;
  try {
    const evidence = await fn();
    results.checks.push({ name, pass: true, evidence });
    console.log('PASS', name);
  } catch (error) {
    results.checks.push({ name, pass: false, error: error.stack || error.message });
    console.log('FAIL', name, error.message);
  }
  await fs.writeFile(path.join(output, 'progress.json'), JSON.stringify(results, null, 2));
}
async function open(route) {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.locator('#main').waitFor();
  await page.evaluate(async () => { await document.fonts.ready; });
}
async function screenshot(name) {
  const filename = path.join(output, name + '.png');
  await page.screenshot({ path: filename, fullPage: true, timeout: 60000 });
  results.screenshots.push({ name, path: filename });
  return filename;
}
async function ids() {
  return page.locator('[data-listing]').evaluateAll(nodes => nodes.map(node => node.dataset.listing).filter(Boolean));
}
async function readyModel(id) {
  await page.waitForFunction(() => !!window.lihatDulu?.engine?.renderer && document.querySelector('.inspection-stage')?.getAttribute('aria-busy') === 'false', null, { timeout: 45000 });
  const evidence = await page.evaluate(async () => {
    const engine = window.lihatDulu.engine;
    await engine.ready;
    return { id: document.querySelector('[data-product-id]')?.dataset.productId, triangles: engine.renderer.info.render.triangles, glbs: performance.getEntriesByType('resource').filter(entry => entry.name.includes('.glb')).map(entry => entry.name), state: engine.getState() };
  });
  assert.equal(evidence.id, id);
  assert.ok(evidence.triangles > 0, 'WebGL must render actual triangles');
  assert.ok(evidence.glbs.some(url => new URL(url).pathname === `/assets/${id === 'sora' ? 'cabinet' : id}.glb`), 'Retained GLB must load');
  assert.equal(await page.locator('.inspection-error').isVisible(), false);
  return evidence;
}
async function scan(name) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const evidence = await page.evaluate(() => {
    const visible = element => { const box = element.getBoundingClientRect(), style = getComputedStyle(element); return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'; };
    const scrollContainer = element => { for (let parent = element.parentElement; parent; parent = parent.parentElement) if (/(auto|scroll)/.test(getComputedStyle(parent).overflowX)) return parent.className || parent.tagName; return null; };
    const offscreenInteractive = [...document.querySelectorAll('a,button,input,select,textarea,[tabindex="0"]')].filter(visible).map(element => ({ label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 70), box: element.getBoundingClientRect().toJSON(), scrollContainer: scrollContainer(element) })).filter(item => (item.box.left < -.8 || item.box.right > innerWidth + .8) && !item.scrollContainer);
    const brokenImages = [...document.images].filter(image => visible(image) && image.complete && !image.naturalWidth).map(image => image.src);
    const overflowElements = [...document.querySelectorAll('#main *')].filter(visible).map(element => ({ tag: element.tagName, class: element.className?.baseVal ?? element.className, box: element.getBoundingClientRect().toJSON(), scrollContainer: scrollContainer(element) })).filter(item => (item.box.left < -.8 || item.box.right > innerWidth + .8) && !item.scrollContainer).slice(0, 30);
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, offscreenInteractive, overflowElements, brokenImages, mediaCalls: window.qaMediaCalls, mainText: document.querySelector('#main').innerText.slice(0, 300) };
  });
  evidence.name = name;
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  evidence.footerFixedOverlap = await page.evaluate(() => {
    const fixed = [...document.querySelectorAll('body *')].filter(element => {
      const box = element.getBoundingClientRect(), style = getComputedStyle(element);
      return style.position === 'fixed' && style.display !== 'none' && style.visibility !== 'hidden' && style.pointerEvents !== 'none' && box.width > 0 && box.height > 0 && box.top < innerHeight && box.bottom > 0;
    });
    return [...document.querySelectorAll('footer a,footer button')].filter(element => {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height || box.bottom < 0 || box.top > innerHeight) return false;
      return fixed.some(overlay => {
        if (overlay.contains(element) || element.contains(overlay)) return false;
        const target = overlay.getBoundingClientRect();
        return box.left < target.right && box.right > target.left && box.top < target.bottom && box.bottom > target.top;
      });
    }).map(element => element.textContent.trim());
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  results.layouts.push(evidence);
  assert.ok(evidence.scrollWidth <= evidence.width + 1, 'Document horizontal overflow: ' + JSON.stringify(evidence));
  assert.deepEqual(evidence.offscreenInteractive, [], 'Clipped controls: ' + JSON.stringify(evidence));
  assert.deepEqual(evidence.brokenImages, [], 'Broken pictures: ' + JSON.stringify(evidence));
  assert.deepEqual(evidence.footerFixedOverlap, [], 'Fixed navigation covers footer controls: ' + JSON.stringify(evidence));
  assert.deepEqual(evidence.mediaCalls, [], 'Prepared journey must not activate camera or microphone');
  return evidence;
}
async function tab(name) {
  const control = page.getByRole('link', { name }).or(page.getByRole('tab', { name })).or(page.getByRole('button', { name }));
  await control.first().click();
}
async function compare(id) {
  await page.locator(`[data-action="compare"][data-id="${id}"]`).first().click();
}
function expected(query) { return filterCatalogue(AVAILABLE_LISTINGS, parseFilters(new URLSearchParams(query))).map(item => item.id); }

try {
  await check('buyer/seller entry remains the first screen', async () => {
    await open('/');
    assert.equal(await page.locator('.role-card').count(), 2);
    assert.ok(await page.locator('.role-card[href="/beli"]').isVisible());
    assert.ok(await page.locator('.role-card[href="/jual"]').isVisible());
    return { routes: await page.locator('.role-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))) };
  });
  await check('ten active furniture records and two honest coming-soon records', async () => {
    await open('/beli');
    const actual = await ids();
    assert.equal(AVAILABLE_LISTINGS.length, 10);
    assert.equal(new Set(actual).size, actual.length, 'Every displayed card has one identity');
    assert.deepEqual(actual.filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)).sort(), AVAILABLE_LISTINGS.map(item => item.id).sort());
    for (const id of ['lino', 'nara']) {
      await open('/barang/' + id);
      assert.equal(await page.locator('[data-action="add-cart"]').count(), 0);
      assert.equal(await page.locator('.inspection').count(), 0);
      assert.match(await page.locator('#main').innerText(), /Segera hadir|KOLEKSI BERIKUTNYA|sedang disiapkan/i);
    }
    return { active: AVAILABLE_LISTINGS.map(item => item.id), comingSoon: ['lino', 'nara'] };
  });
  await check('shared filter causality URL refresh and empty-state reset', async () => {
    const cases = ['q=Sora', 'min=1500000&max=2450000&sort=price-asc', 'width=90&depth=75&height=120', 'categories=Kursi', 'model=1', 'conditions=Pemakaian+ringan', 'materials=Rotan', 'locations=Jakarta+Selatan', 'q=TidakAdaFurnitureQAZZZ'];
    const evidence = [];
    for (const query of cases) {
      await open('/beli?' + query);
      const actual = (await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id));
      assert.deepEqual(actual, expected(query), query);
      await page.reload({ waitUntil: 'networkidle' });
      assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), expected(query), 'Reload preserves ' + query);
      evidence.push({ query, ids: actual });
    }
    await page.locator('.empty-state [data-action="clear-filters"]').click();
    assert.equal((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)).length, 10);
    return evidence;
  });
  await check('search and sorting controls update the displayed results', async () => {
    await open('/beli');
    const search = page.locator('input[name="q"],#search').first();
    await search.fill('Sora');
    await search.press('Enter');
    assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), ['sora']);
    assert.equal(new URL(page.url()).searchParams.get('q'), 'Sora');
    await open('/beli');
    const sort = page.locator('[data-sort],select[name="sort"],#sort').first();
    await sort.selectOption('price-asc');
    assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), expected('sort=price-asc'));
    await sort.selectOption('price-desc');
    assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), expected('sort=price-desc'));
    await page.goBack({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-sort],select[name="sort"],#sort').first().inputValue(), 'price-asc');
    return { search: 'Sora', sort: 'ascending, descending, browser back' };
  });
  await check('desktop filter fields and facet checkboxes affect actual inventory', async () => {
    await open('/beli');
    let form = page.locator('.filter-rail [data-filters]');
    await form.locator('[name="min"]').fill('780000');
    await form.locator('[name="max"]').fill('950000');
    assert.equal(await form.locator('[data-filter-preview]').innerText(), '2');
    await form.getByRole('button', { name: /Tampilkan.*barang/i }).click();
    assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), ['tala', 'ruji']);
    await open('/beli');
    form = page.locator('.filter-rail [data-filters]');
    await form.locator('[name="materials"][value="Rotan"]').check();
    await form.getByRole('button', { name: /Tampilkan.*barang/i }).click();
    assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), ['tala']);
    assert.equal(new URL(page.url()).searchParams.get('materials'), 'Rotan');
    await page.locator('.filter-rail [data-action="filter-reset"]').click();
    assert.equal(new URL(page.url()).search, '');
    assert.equal((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)).length, 10);
    return { inclusivePriceBoundary: ['tala', 'ruji'], selectedMaterial: 'Rotan', materialResults: ['tala'], desktopResetClearsURLAndInventory: true };
  });
  await check('comparison maximum three survives refresh and shows canonical differences', async () => {
    await open('/beli');
    if (await page.locator('.compare-tray [data-action="clear-compare"]').count()) await page.locator('.compare-tray [data-action="clear-compare"]').click();
    for (const id of ['sora', 'arca', 'batu', 'rimba']) await compare(id);
    await open('/bandingkan');
    const text = await page.locator('#main').innerText();
    for (const id of ['sora', 'arca', 'batu']) assert.ok(text.includes(AVAILABLE_LISTINGS.find(item => item.id === id).title));
    assert.ok(!text.includes('Sideboard Rimba'), 'Fourth product must not enter the comparison');
    for (const term of [/Dimensi|Ukuran|Lebar/i, /Material/i, /Kondisi/i, /Lokasi/i, /Harga/i, /3D/i]) assert.match(text, term);
    await page.reload({ waitUntil: 'networkidle' });
    const refreshed = await page.locator('#main').innerText();
    for (const name of ['Lemari Sora', 'Kursi Arca', 'Meja Batu']) assert.ok(refreshed.includes(name));
    await screenshot('1440-comparison');
    return { selected: ['sora', 'arca', 'batu'], refused: 'rimba', persisted: true };
  });
  await check('mobile comparison tray has 44px clear navigation and per-item removal', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open('/beli');
    if (await page.locator('.compare-tray [data-action="clear-compare"]').count()) await page.locator('.compare-tray [data-action="clear-compare"]').click();
    for (const id of ['sora', 'arca', 'batu']) await compare(id);
    const controls = [];
    for (const locator of [page.locator('.compare-tray [data-action="clear-compare"]'), page.locator('.compare-tray a[href="/bandingkan"]')]) {
      const box = await locator.boundingBox();
      assert.ok(box.width >= 43.5 && box.height >= 43.5, 'Tray action must have a 44px target: ' + JSON.stringify(box));
      controls.push(box);
    }
    assert.equal(await page.locator('.compare-tray .thumb-remove:visible').count(), 0, 'No cramped individual X controls on phones');
    await scan('390-comparison-tray');
    await screenshot('390-comparison-tray');
    await page.locator('.compare-tray [data-action="clear-compare"]').click();
    assert.equal(await page.locator('.compare-tray').count(), 0);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:compare:v1'))), []);
    for (const id of ['sora', 'arca']) await compare(id);
    await page.locator('.compare-tray a[href="/bandingkan"]').click();
    assert.equal(new URL(page.url()).pathname, '/bandingkan');
    assert.equal(await page.locator('.compare-product').count(), 2);
    const remove = page.locator('.compare-product [data-action="compare"][data-id="sora"]');
    const removeBox = await remove.boundingBox();
    assert.ok(removeBox.width >= 43.5 && removeBox.height >= 43.5, 'Per-item page removal retains a 44px target');
    await remove.click();
    assert.equal(await page.locator('.compare-product').count(), 1);
    assert.match(await page.locator('.compare-product').innerText(), /Kursi Arca/);
    await open('/beli');
    await page.locator('.compare-tray [data-action="clear-compare"]').click();
    for (const id of ['sora', 'arca', 'batu']) await compare(id);
    await page.setViewportSize({ width: 1440, height: 900 });
    return { controls, removeBox, clearPersisted: true, granularRemovalOnComparisonPage: true };
  });
  await check('saved items and named collections persist locally', async () => {
    await open('/beli');
    await page.locator('[data-action="save"][data-id="arca"]').click();
    await page.locator('[data-action="save"][data-id="awan"]').click();
    await open('/tersimpan');
    assert.deepEqual((await ids()).sort(), ['arca', 'awan']);
    await page.locator('[data-action="collection"]').click();
    await page.locator('dialog [name="name"]').fill('Ruang baca');
    await page.locator('dialog [data-collection] button[type="submit"]').click();
    assert.match(await page.locator('.collection-row').innerText(), /Ruang baca/);
    await page.reload({ waitUntil: 'networkidle' });
    assert.deepEqual((await ids()).sort(), ['arca', 'awan']);
    assert.match(await page.locator('.collection-row').innerText(), /Kursi Arca.*Sofa Awan/s);
    return { saved: ['arca', 'awan'], collection: 'Ruang baca', persisted: true };
  });
  await check('bounded local offer validates amount and states it is not sent', async () => {
    await open('/barang/sora?tab=photos');
    await page.locator('[data-action="offer"]').click();
    assert.match(await page.locator('dialog').innerText(), /belum dikirim/i);
    const amount = page.locator('dialog [name="amount"]');
    await amount.fill('999999999');
    await page.locator('dialog button[type="submit"]').click();
    assert.equal(await amount.evaluate(input => input.validity.rangeOverflow), true);
    assert.equal(await page.locator('dialog').isVisible(), true);
    await amount.fill('2200000');
    await page.locator('dialog [name="note"]').fill('Pengambilan setelah ukuran diperiksa');
    await page.locator('dialog button[type="submit"]').click();
    assert.equal(await page.locator('dialog').isVisible(), false);
    const offer = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:offer:sora')));
    assert.equal(offer.amount, 2200000);
    assert.equal(offer.note, 'Pengambilan setelah ukuran diperiksa');
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-action="offer"]').click();
    assert.equal(await page.locator('dialog [name="amount"]').inputValue(), '2200000');
    assert.equal(await page.locator('dialog [name="note"]').inputValue(), offer.note);
    await page.keyboard.press('Escape');
    return { offer, rangeValidated: true, localOnly: true, formResumesSavedOffer: true };
  });
  await check('both coming-soon reminders persist as local intent', async () => {
    await open('/beli');
    for (const id of ['lino', 'nara']) await page.locator(`.coming-grid [data-action="remind"][data-id="${id}"]`).click();
    await page.reload({ waitUntil: 'networkidle' });
    const reminders = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:reminders:v1')));
    assert.deepEqual(reminders.sort(), ['lino', 'nara']);
    for (const id of reminders) assert.match(await page.locator(`.coming-grid [data-action="remind"][data-id="${id}"]`).innerText(), /Minat tersimpan/);
    return { reminders, scope: 'local saved intent, no notification service' };
  });
  await check('prepared photo search changes source and filters example furniture', async () => {
    await open('/cari-dari-foto');
    const first = await page.locator('.photo-search-source>img').getAttribute('src');
    await page.locator('[data-photo-source]').selectOption('tala');
    const second = await page.locator('.photo-search-source>img').getAttribute('src');
    assert.notEqual(second, first);
    assert.equal(second, '/images/examples/tala.webp');
    await page.locator('[data-photo-limits] [name="width"]').fill('55');
    await page.locator('[data-photo-limits] button[type="submit"]').click();
    assert.equal(await page.locator('.search-result').count(), 0);
    assert.match(await page.locator('#main').innerText(), /Ukuran ini belum cocok/);
    await page.getByRole('link', { name: 'Reset ukuran', exact: true }).click();
    assert.equal(await page.locator('.search-result').count(), 3);
    await screenshot('1440-photo-search');
    return { first, second, maxWidth: 55, emptyRecovered: true, liveImageSearchClaimed: false };
  });
  await check('photo listings retain honest media and unavailable model actions', async () => {
    const evidence = [];
    for (const id of ['awan', 'tala', 'loka', 'nusa', 'senja', 'ruji']) {
      await open('/barang/' + id);
      assert.equal(await page.locator('.inspection').count(), 0);
      assert.equal(await page.locator('canvas').count(), 0);
      assert.equal(await page.getByRole('link', { name: /Coba di ruang/i }).count(), 0);
      assert.equal(await page.getByRole('button', { name: /Coba di ruang/i }).count(), 0);
      assert.match(await page.locator('#main').innerText(), /Foto/i);
      const images = await page.locator('#main img').evaluateAll(nodes => nodes.map(node => ({ src: node.getAttribute('src'), naturalWidth: node.naturalWidth })));
      assert.ok(images.some(image => image.src === `/images/examples/${id}.webp` && image.naturalWidth > 0));
      evidence.push({ id, images });
    }
    return evidence;
  });
  await check('all four retained GLBs render orbit camera controls and dimensions', async () => {
    const evidence = [];
    for (const id of ['sora', 'arca', 'batu', 'rimba']) {
      await open('/barang/' + id + '?tab=model');
      const loaded = await readyModel(id);
      const camera = await page.evaluate(() => window.lihatDulu.engine.captureViewState());
      await page.locator('[data-inspection-action="view"][data-view="rear"]').click();
      await page.waitForTimeout(720);
      const rear = await page.evaluate(() => window.lihatDulu.engine.captureViewState());
      assert.notDeepEqual(rear.camera, camera.camera, 'View button changes camera');
      const bounds = await page.locator('.inspection-stage canvas').boundingBox();
      await page.mouse.move(bounds.x + bounds.width * .5, bounds.y + bounds.height * .5);
      await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width * .7, bounds.y + bounds.height * .55, { steps: 6 });
      await page.mouse.up();
      const orbit = await page.evaluate(() => window.lihatDulu.engine.captureViewState());
      assert.notDeepEqual(orbit.camera, rear.camera, 'Pointer orbit changes camera');
      await page.locator('.inspection-view-tools summary').click();
      await page.locator('[data-inspection-action="dimensions"]').click();
      assert.equal(await page.evaluate(() => window.lihatDulu.engine.getState().dimensionsVisible), true);
      const dimensions = await page.evaluate(() => window.lihatDulu.engine.getState().dimensions);
      for (const key of ['width', 'depth', 'height']) assert.ok(Math.abs(dimensions[key] - AVAILABLE_LISTINGS.find(item => item.id === id).dimensions[key]) <= .2, id + ':' + key + ' canonical dimensions agree with the retained model');
      await screenshot('1440-' + id + '-3d');
      evidence.push({ id, triangles: loaded.triangles, glbs: loaded.glbs, rear, orbit, dimensionsVisible: true, dimensions });
    }
    return evidence;
  });
  await check('Sora independent doors drawer and three wear markers remain interactive', async () => {
    await open('/barang/sora?tab=model');
    await readyModel('sora');
    await page.locator('.inspection-view-tools summary').click();
    await page.locator('[data-inspection-action="reset"]').click();
    await page.waitForTimeout(720);
    const before = await page.evaluate(() => {
      const model = window.lihatDulu.engine.model;
      return { left: model.getObjectByName('left_door_pivot').rotation.y, right: model.getObjectByName('right_door_pivot').rotation.y, drawer: model.getObjectByName('drawer_slide').position.z };
    });
    await page.locator('[data-motion-toggle="left"]').click();
    let state = await page.evaluate(() => window.lihatDulu.engine.getState());
    assert.equal(state.motions.left, 100);
    assert.equal(state.motions.right, 0);
    assert.equal(state.motions.drawer, 0);
    await page.locator('[data-motion-toggle="right"]').click();
    await page.locator('[data-motion-toggle="drawer"]').click();
    state = await page.evaluate(() => window.lihatDulu.engine.getState());
    assert.equal(state.motions.left, 100);
    assert.equal(state.motions.right, 100);
    assert.ok(Math.abs(state.motions.drawer - .3) < .0001);
    await page.waitForTimeout(620);
    const transformed = await page.evaluate(() => {
      const model = window.lihatDulu.engine.model;
      return { left: model.getObjectByName('left_door_pivot').rotation.y, right: model.getObjectByName('right_door_pivot').rotation.y, drawer: model.getObjectByName('drawer_slide').position.z };
    });
    assert.ok(Math.abs(Math.abs(transformed.left - before.left) * 180 / Math.PI - 100) < .1, 'Left door mesh rotates 100 degrees');
    assert.ok(Math.abs(Math.abs(transformed.right - before.right) * 180 / Math.PI - 100) < .1, 'Right door mesh rotates 100 degrees');
    assert.ok(Math.abs(transformed.drawer - before.drawer - .3) < .001, 'Drawer mesh translates 30 cm');
    if (!await page.locator('[data-condition-panel]').evaluate(node => node.open)) await page.locator('[data-condition-panel] summary').click();
    const conditions = [];
    for (const id of ['scratch', 'chip', 'mark']) {
      await page.locator(`.inspection-condition[data-condition="${id}"]`).click();
      assert.equal(await page.locator(`.inspection-condition[data-condition="${id}"]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => window.lihatDulu.engine.getState().condition), id);
      const text = await page.locator('[data-inspection-detail]').innerText();
      assert.ok(text.length > 15);
      conditions.push({ id, text });
    }
    await screenshot('1440-sora-wear');
    return { motions: state.motions, before, transformed, conditions };
  });
  await check('all retained models can enter a real room and change their position', async () => {
    const evidence = [];
    for (const id of ['sora', 'arca', 'batu', 'rimba']) {
      await open(`/barang/${id}?tab=room`);
      await readyModel(id);
      assert.equal(await page.evaluate(() => window.lihatDulu.engine.getState().inRoom), true);
      await page.locator('[data-room-custom] summary').click();
      await page.locator('[data-room-field="x"]').fill('0.3');
      await page.locator('[data-room-field="x"]').dispatchEvent('change');
      await page.locator('[data-room-field="rotation"]').fill('30');
      await page.locator('[data-room-field="rotation"]').dispatchEvent('change');
      const state = await page.evaluate(() => ({ state: window.lihatDulu.engine.getState(), x: window.lihatDulu.engine.model.position.x, rotation: window.lihatDulu.engine.model.rotation.y * 180 / Math.PI }));
      assert.equal(state.x, .3);
      assert.ok(Math.abs(state.rotation - 30) < .001);
      assert.equal(state.state.roomState.x, .3);
      const placement = await page.locator('[data-placement="body"]').innerText();
      assert.match(placement, /muat|melew|ruang/i);
      const caption = (await page.locator('[data-placement-source]').innerText()).replaceAll(',', '.');
      for (const dimension of Object.values(AVAILABLE_LISTINGS.find(item => item.id === id).dimensions)) assert.ok(caption.includes(String(dimension)), 'Room caption must use canonical ' + id + ' dimensions: ' + caption);
      if (['arca', 'batu'].includes(id)) assert.equal(await page.locator('[data-motion-toggle]').count(), 0, 'Furniture without articulation must not display door/drawer controls');
      if (id === 'rimba') assert.equal(await page.locator('[data-motion-toggle="drawer"]').count(), 0, 'Rimba has no drawer');
      evidence.push({ id, state, placement, caption });
    }
    await screenshot('1440-room-rimba');
    return evidence;
  });
  await check('mobile 3D and room layouts retain real models across phone tablet widths', async () => {
    const evidence = [];
    for (const [width, height, id, mode] of [[320, 568, 'sora', 'model'], [320, 568, 'sora', 'room'], [390, 844, 'sora', 'model'], [390, 844, 'sora', 'room'], [390, 844, 'arca', 'model'], [390, 844, 'arca', 'room'], [390, 844, 'batu', 'model'], [390, 844, 'batu', 'room'], [390, 844, 'rimba', 'model'], [390, 844, 'rimba', 'room'], [430, 932, 'sora', 'model'], [430, 932, 'sora', 'room'], [768, 1024, 'sora', 'room']]) {
      if (process.env.QA_SCENE && process.env.QA_SCENE !== `${width}-${id}-${mode}`) continue;
      await page.setViewportSize({ width, height });
      await open(`/barang/${id}?tab=${mode}`);
      const model = await readyModel(id);
      if (mode === 'room') assert.equal(model.state.inRoom, true);
      const cameraTools = page.locator('.inspection-view-tools');
      if (!await cameraTools.evaluate(node => node.open)) await cameraTools.locator('summary').click();
      const touchTargets = await page.locator('.inspection button[data-engine-control]:visible').evaluateAll(nodes => nodes.map(node => ({ action: node.dataset.inspectionAction || node.dataset.roomPreset || node.dataset.motionToggle, label: node.getAttribute('aria-label') || node.textContent.trim(), box: node.getBoundingClientRect().toJSON() })));
      const outcomes = mode === 'room' ? await page.locator('[data-placement]').evaluateAll(nodes => nodes.map(node => ({ kind: node.dataset.placement, text: node.textContent.trim(), clear: node.dataset.clear }))) : [];
      if (mode === 'room') {
        assert.ok(outcomes.some(outcome => outcome.kind === 'body' && ['true', 'false'].includes(outcome.clear)), 'Room fit must show a computed outcome');
        if (['arca', 'batu'].includes(id)) assert.ok(outcomes.filter(outcome => outcome.kind !== 'body').every(outcome => outcome.clear === 'na'), 'Static furniture cannot claim door/drawer clearance');
      }
      const layout = await scan(`${width}-${id}-${mode}`);
      await screenshot(`${width}-${id}-${mode}`);
      for (const target of touchTargets) assert.ok(target.box.width >= 43.5 && target.box.height >= 43.5, 'Core inspection action requires a 44px target: ' + JSON.stringify(target));
      evidence.push({ width, height, id, mode, triangles: model.triangles, layout, touchTargets, outcomes });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    return evidence;
  });
  await check('partial buyer preview keeps six honest groups at short phone widths', async () => {
    await open('/jual/sora/rekam');
    await page.locator('[data-video-action="reset"]').click();
    await page.locator('[data-video-action="chapter"][data-area="front"]').click();
    await page.locator('[data-video-action="capture"]').click();
    const evidence = [];
    for (const [width, height] of [[320, 568], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await open('/barang/sora?preview=1&tab=photos');
      assert.equal(await page.locator('.preview-evidence').count(), 6);
      assert.equal(await page.locator('.preview-evidence.is-selected').count(), 1);
      assert.equal(await page.locator('.preview-evidence:not(.is-selected)').count(), 5);
      assert.match(await page.locator('.preview-notice').innerText(), /1 \/ 6/);
      const layout = await scan(`${width}-partial-preview`);
      await screenshot(`${width}-partial-preview`);
      evidence.push(layout);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await open('/jual/sora/rekam');
    await page.locator('[data-video-action="reset"]').click();
    return { selected: 1, missing: 5, layouts: evidence };
  });
  await check('prepared seller workspace video pause resume selection retake and review', async () => {
    await open('/jual');
    assert.match(await page.locator('.video-journey').innerText(), /Sora/);
    assert.equal(await page.locator('[data-video-count]').first().innerText(), '0 dari 6 dipilih');
    await open('/jual/sora/rekam');
    const video = page.locator('[data-video-player]');
    await page.waitForFunction(() => document.querySelector('[data-video-player]')?.readyState >= 1, null, { timeout: 30000 });
    const start = await video.evaluate(node => ({ duration: node.duration, paused: node.paused, source: node.currentSrc }));
    assert.ok(Math.abs(start.duration - 18) < .3, JSON.stringify(start));
    assert.equal(start.paused, true, 'No autoplay before explicit input');
    await page.locator('[data-video-action="play"]').first().click();
    await page.waitForFunction(() => document.querySelector('[data-video-player]').currentTime > .6);
    await page.locator('[data-video-action="play"]').first().click();
    const paused = await video.evaluate(node => ({ time: node.currentTime, paused: node.paused }));
    assert.equal(paused.paused, true);
    await page.locator('[data-video-action="capture"]').click();
    assert.equal(await page.locator('[data-video-count]').first().innerText(), '1 dari 6 dipilih');
    await open('/jual/sora/tinjau');
    assert.match(await page.locator('.vj-review-summary').innerText(), /1 dari 6/);
    await page.setViewportSize({ width: 390, height: 844 });
    await open('/barang/sora?preview=1&tab=photos');
    assert.equal(await page.locator('.preview-evidence').count(), 6);
    assert.equal(await page.locator('.preview-evidence.is-selected').count(), 1);
    assert.equal(await page.locator('.preview-evidence:not(.is-selected)').count(), 5);
    assert.match(await page.locator('.preview-notice').innerText(), /1 \/ 6/);
    assert.equal(await page.locator('[data-action="add-cart"]').first().isDisabled(), true);
    await scan('390-partial-buyer-preview');
    await screenshot('390-partial-buyer-preview');
    await page.setViewportSize({ width: 1440, height: 900 });
    await open('/jual/sora/rekam');
    const resumed = await video.evaluate(node => ({ time: node.currentTime, paused: node.paused }));
    assert.equal(resumed.paused, true);
    assert.ok(Math.abs(resumed.time - paused.time) < .3, 'Exit/resume keeps media position');
    for (const id of ['right', 'rear', 'interior', 'drawer', 'scratch']) {
      await page.locator(`[data-video-action="chapter"][data-area="${id}"]`).click();
      await page.locator('[data-video-action="capture"]').click();
    }
    assert.equal(await page.locator('[data-video-count]').first().innerText(), '6 dari 6 dipilih');
    await page.locator('[data-video-action="chapter"][data-area="front"]').click();
    await page.locator('[data-video-action="capture"]').click();
    assert.equal(await page.locator('[data-video-count]').first().innerText(), '6 dari 6 dipilih', 'Replacing front does not invent a seventh area');
    await open('/jual/sora/tinjau');
    assert.equal(await page.locator('.vj-review-row.is-selected').count(), 6);
    await page.locator('[data-video-action="remove"][data-area="scratch"]').click();
    assert.equal(await page.locator('.vj-review-row.is-selected').count(), 5);
    await page.locator('[data-video-action="undo"]').click();
    assert.equal(await page.locator('.vj-review-row.is-selected').count(), 6);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('.vj-review-row.is-selected').count(), 6);
    await screenshot('1440-seller-review-complete');
    await open('/barang/sora?preview=1&tab=photos');
    assert.match(await page.locator('#main').innerText(), /Pratinjau/i);
    assert.match(await page.locator('#main').innerText(), /2\.450\.000/);
    assert.deepEqual(await page.evaluate(() => window.qaMediaCalls), []);
    return { start, paused, resumed, selectedAreas: 6, replacementDeduplicated: true, reviewRemoveUndo: true, noCamera: true };
  });
  await check('natural prepared video checkpoints select six areas and retake replaces one', async () => {
    await open('/jual/sora/rekam');
    await page.waitForFunction(() => document.querySelector('[data-video-player]')?.readyState >= 1, null, { timeout: 30000 });
    await page.locator('[data-video-action="reset"]').click();
    assert.equal(await page.locator('[data-video-count]').first().innerText(), '0 dari 6 dipilih');
    await page.locator('[data-video-player]').evaluate(video => { video.playbackRate = 3; });
    await page.locator('[data-video-action="play"]').click();
    await page.waitForFunction(() => document.querySelector('[data-video-player]').ended, null, { timeout: 25000 });
    assert.equal(await page.locator('[data-video-count]').first().innerText(), '6 dari 6 dipilih');
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1')));
    assert.equal(before.selected.length, 6);
    assert.ok(before.selected.every(record => record.take === 1));
    await page.locator('[data-video-action="chapter"][data-area="front"]').click();
    await page.locator('[data-video-action="retake"]').click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1')).selected.find(record => record.id === 'front').take === 2, null, { timeout: 12000 });
    await page.locator('[data-video-action="stop"]').click();
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:video-sora:v1')));
    assert.equal(after.selected.length, 6);
    assert.equal(after.selected.find(record => record.id === 'front').take, 2);
    assert.ok(after.selected.filter(record => record.id !== 'front').every(record => record.take === 1));
    return { naturalCheckpoints: before.selected, retaken: after.selected.find(record => record.id === 'front'), uniqueAreaCount: after.selected.length, playbackRateForQA: 3 };
  });
  await check('one-off cart deduplicates items and retains two sellers', async () => {
    for (const id of ['sora', 'arca', 'sora']) {
      await open(`/barang/${id}?tab=photos`);
      await page.locator('[data-action="add-cart"]').first().click();
    }
    await open('/keranjang');
    assert.equal(await page.locator('.cart-line').count(), 2);
    let text = await page.locator('#main').innerText();
    assert.ok(text.includes('Lemari Sora') && text.includes('Kursi Arca'));
    assert.match(text, /3\.730\.000/);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('.cart-line').count(), 2);
    await screenshot('1440-cart');
    assert.equal(await page.locator('.seller-cart').count(), 2, 'Fulfilment costs must group per seller');
    assert.match(await page.locator('.cart-summary .total').innerText(), /4\.005\.000/);
    await page.locator('[name="cart-delivery"][value="delivery"]').check();
    assert.match(await page.locator('.cart-summary .total').innerText(), /4\.305\.000/);
    await page.getByRole('link', { name: /Tinjau pilihan/i }).click();
    assert.ok(new URL(page.url()).pathname === '/tinjau-pesanan');
    assert.equal(await page.locator('[name="cart-delivery"][value="delivery"]').isChecked(), true);
    assert.match(await page.locator('.cart-summary .total').innerText(), /4\.305\.000/);
    await page.locator('[data-action="save-summary"]').click();
    const summary = await page.evaluate(() => JSON.parse(localStorage.getItem('lihatdulu:summary:v1')));
    assert.deepEqual(summary.ids, ['sora', 'arca']);
    assert.equal(summary.delivery, 'delivery');
    assert.equal(summary.total, 4305000);
    assert.match(await page.locator('.commerce-note').innerText(), /Tidak membayar.*menghubungi.*pesanan/i);
    await screenshot('1440-local-review');
    return { items: ['sora', 'arca'], itemTotal: 3730000, preparedFees: 275000, shippingFees: 300000, localReviewTotal: 4305000, duplicatesPrevented: true, summary };
  });
  await check('3D load failure retains useful picture and retry recovery', async () => {
    expectedAssetFailure = true;
    await page.route('**/assets/cabinet.glb', route => route.abort('failed'));
    await open('/barang/sora?tab=model');
    await page.locator('.inspection-error').waitFor({ state: 'visible', timeout: 45000 });
    assert.ok(await page.locator('.inspection-poster').isVisible());
    assert.ok(await page.locator('.inspection-poster').evaluate(image => image.naturalWidth > 0));
    await page.unroute('**/assets/cabinet.glb');
    expectedAssetFailure = false;
    await page.locator('[data-inspection-action="retry"]').click();
    await readyModel('sora');
    return { posterRetained: true, retryLoadsActualModel: true };
  });

  const routes = [['gateway', '/'], ['catalogue', '/beli'], ['comparison', '/bandingkan'], ['product-photo', '/barang/sora?tab=photos'], ['photo-item', '/barang/awan'], ['seller', '/jual'], ['capture', '/jual/sora/rekam'], ['review', '/jual/sora/tinjau'], ['cart', '/keranjang']];
  for (const [width, height] of [[320, 568], [390, 844], [430, 932], [768, 1024], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    for (const [name, route] of routes) await check(`layout ${width} ${name}`, async () => {
      await open(route);
      const evidence = await scan(`${width}-${name}`);
      if ([390, 1440].includes(width) || width === 320 && ['gateway', 'catalogue', 'capture', 'review'].includes(name) || [430, 768].includes(width) && name === 'catalogue') await screenshot(`${width}-${name}`);
      return evidence;
    });
  }
  await check('mobile filter dialog fits short phones keyboard Escape and URL state', async () => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open('/beli');
    await page.getByRole('button', { name: /Filter/i }).first().click();
    const dialog = page.locator('dialog:visible');
    await dialog.waitFor();
    assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog')));
    const bound = await dialog.boundingBox();
    assert.ok(bound.x >= -1 && bound.x + bound.width <= 321 && bound.y >= -1 && bound.y + bound.height <= 569, JSON.stringify(bound));
    await dialog.locator('[name="width"]').fill('90');
    await dialog.locator('[name="depth"]').fill('75');
    await dialog.locator('[name="height"]').fill('120');
    await screenshot('320-mobile-filters');
    await dialog.getByRole('button', { name: /(?:Terapkan|Lihat|Tampilkan).*?(?:barang|hasil|filter)/i }).click();
    assert.equal(new URL(page.url()).searchParams.get('width'), '90');
    assert.deepEqual((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)), expected('width=90&depth=75&height=120'));
    await page.getByRole('button', { name: /Filter/i }).first().click();
    await page.locator('dialog [data-action="filter-reset"]').click();
    for (const name of ['q', 'width', 'depth', 'height', 'min', 'max']) assert.equal(await page.locator(`dialog [name="${name}"]`).inputValue(), '');
    await page.locator('dialog button[type="submit"]').click();
    assert.equal(new URL(page.url()).search, '');
    assert.equal((await ids()).filter(id => AVAILABLE_LISTINGS.some(item => item.id === id)).length, 10);
    await page.getByRole('button', { name: /Filter/i }).first().click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog:visible').count(), 0);
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Filter/i);
    return { bounds: bound, dimensions: 'width=90,depth=75,height=120', mobileResetClearsDraftAndAppliesFullReset: true, escapeRestoresFilter: true };
  });
  await check('reduced-motion interaction and 200 percent layout remain usable', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    const evidence = [];
    for (const route of ['/beli', '/jual/sora/rekam', '/bandingkan']) {
      await open(route);
      assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
      await page.evaluate(() => document.documentElement.style.zoom = '2');
      evidence.push(await scan('zoom-200 ' + route));
      await page.evaluate(() => document.documentElement.style.zoom = '');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    return evidence;
  });
} finally {
  results.sourceAfter = await sourceManifest();
  await check('QA observed a frozen implementation', async () => { assert.deepEqual(results.sourceAfter, results.sourceBefore); return results.sourceAfter; });
  await check('no JavaScript page errors', async () => { assert.deepEqual(results.pageErrors, []); return results.pageErrors; });
  await check('no unexpected console errors', async () => { assert.deepEqual(results.consoleErrors, []); return results.consoleErrors; });
  await check('all referenced assets load', async () => { assert.deepEqual(results.assetFailures, []); return results.assetFailures; });
  await check('no backend payment or external UI requests', async () => { assert.deepEqual(results.externalRequests, []); return results.externalRequests; });
  await check('no camera microphone or display capture activation', async () => { assert.deepEqual(results.mediaCalls, []); return results.mediaCalls; });
  results.finished = new Date().toISOString();
  results.summary = { total: results.checks.length, passed: results.checks.filter(check => check.pass).length, failed: results.checks.filter(check => !check.pass).length };
  results.pass = results.summary.failed === 0;
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  const failures = results.checks.filter(check => !check.pass);
  const viewports = [...new Set(results.layouts.map(layout => `${layout.width}×${layout.height}`))].join(', ');
  const report = `# Stitch implementation browser verification\n\n${results.pass ? 'PASS' : 'FAIL'}: ${results.summary.passed}/${results.summary.total} checks passed. Scope: ${results.scope}.\n\nExecuted ${results.started} to ${results.finished}. Actual Chromium with SwiftShader, Playwright, and local Vite.\n\n## Observed defects\n\n${failures.length ? failures.map(check => '- **' + check.name + '**: ' + check.error).join('\n') : 'None observed by these checks.'}\n\n## Evidence\n\n${results.checks.filter(check => !check.name.startsWith('layout ')).map(check => '- ' + (check.pass ? 'PASS' : 'FAIL') + ' **' + check.name + '**: ' + JSON.stringify(check.evidence ?? check.error)).join('\n')}\n\n## Screenshots\n\n${results.screenshots.map(shot => '- [' + shot.name + '](' + shot.path + ')').join('\n')}\n\nDetailed machine-readable evidence: ${path.join(output, 'results.json')}. This run inspected layouts at ${viewports || 'no layout viewports'}. Software WebGL and any CSS zoom checks are local approximations; physical hardware, Safari and real fulfilment are outside the verified scope. Any capture verification recorded above concerns prepared video playback and local evidence selection; it does not verify reconstruction.\n`;
  await fs.writeFile(path.join(output, 'report.md'), report);
  if (process.env.QA_REPORT) {
    await fs.mkdir(path.dirname(process.env.QA_REPORT), { recursive: true });
    await fs.writeFile(process.env.QA_REPORT, report);
  }
  await browser.close();
  await server.close();
  console.log('SUMMARY', JSON.stringify(results.summary));
  if (!results.pass) process.exitCode = 1;
}
