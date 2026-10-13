import { test, expect } from '@playwright/test';

const unknown = ['Ukuran belum dikonfirmasi', 'Ukuran belum dikonfirmasi', 'Ukuran belum dikonfirmasi'];
const ready = page => expect(page.locator('.inspection-stage')).toHaveAttribute('aria-busy', 'false');

test('loading an unconfirmed saved position suppresses fit through reload and subsequent saves', async ({ page }) => {
  await page.goto('/barang/sora?tab=room'); await ready(page);
  await expect(page.locator('[data-placement="body"] strong')).toHaveText('✓ Ukuran muat');
  await page.evaluate(async () => {
    const state = await import('/src/state.js');
    state.savePlacement({ report: state.freshEditableReport(), room: { width: 4.2, depth: 3.2, x: .2, z: -.4, rotation: 15, fixture: 'clear' } });
  });
  await page.reload(); await ready(page);
  await page.locator('[data-saved-placement]').selectOption('0');
  await expect(page.locator('[data-placement] strong')).toHaveText(unknown);
  await expect(page.locator('[data-placement][data-clear]')).toHaveCount(0);
  await expect(page.locator('[data-saved-caption]')).toContainText('Ukuran belum dikonfirmasi');
  await page.locator('[data-room-field="rotation"]').fill('30');
  await page.reload(); await ready(page);
  await expect(page.locator('[data-placement] strong')).toHaveText(unknown);
  await expect(page.locator('[data-room-field="rotation"]')).toHaveValue('30');
  await page.locator('[data-inspection-action="save-placement"]').click();
  const latest = await page.evaluate(async () => (await import('/src/state.js')).loadPlacements()[0]);
  expect(latest.report.dimensionsConfirmed).toBe(false);
  expect(latest).not.toHaveProperty('fit');
  await page.locator('[data-inspection-action="reset-room"]').click();
  await expect(page.locator('[data-placement="body"] strong')).toHaveText('✓ Ukuran muat');
  await page.locator('[data-inspection-action="save-placement"]').click();
  await page.locator('[data-saved-placement]').selectOption('1');
  await expect(page.locator('[data-placement] strong')).toHaveText(unknown);
  await page.locator('[data-saved-placement]').selectOption('0');
  await expect(page.locator('[data-placement="body"] strong')).toHaveText('✓ Ukuran muat');
  await expect(page.locator('[data-saved-caption]')).toContainText('Ukuran dikonfirmasi');
});

test('mobile condition selection reveals the model and provides a focused route to its photo', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/barang/sora?tab=condition'); await ready(page);
  const choice = page.locator('[data-condition="chip"]');
  await choice.focus(); await choice.press('Enter');
  await expect(page.locator('.inspection-stage')).toBeFocused();
  const stage = await page.locator('.inspection-stage').boundingBox();
  expect(stage.y).toBeGreaterThanOrEqual(0);
  expect(stage.y + stage.height).toBeLessThanOrEqual(568);
  const jump = await page.locator('[data-inspection-action="detail"]').boundingBox();
  expect(jump.y + jump.height).toBeLessThanOrEqual(568);
  await page.screenshot({ path: testInfo.outputPath('inspection-mobile-selected-stage.png') });
  await page.locator('[data-inspection-action="detail"]').click();
  await expect(page.locator('[data-inspection-detail]')).toBeFocused();
  await expect(page.locator('[data-inspection-detail] img')).toHaveAttribute('src', '/images/wear-chip.webp');
  const photo = await page.locator('[data-inspection-detail] img').boundingBox();
  expect(photo.y).toBeGreaterThanOrEqual(0);
  expect(photo.y + photo.height).toBeLessThanOrEqual(568);
  const returnButton = await page.locator('[data-inspection-action="return-stage"]').boundingBox();
  expect(returnButton.y + returnButton.height).toBeLessThanOrEqual(568);
  await page.screenshot({ path: testInfo.outputPath('inspection-mobile-selected-photo.png') });
  await page.locator('[data-inspection-action="return-stage"]').click();
  await expect(page.locator('.inspection-stage')).toBeFocused();
});

test('malformed room confirmation metadata cannot override the current report', async ({ page }) => {
  await page.goto('/barang/sora?tab=room'); await ready(page);
  await page.waitForFunction(() => localStorage.getItem('lihatdulu:inspection:room-report:v1'));
  const malformed = await page.evaluate(async () => {
    const state = await import('/src/state.js');
    const current = JSON.parse(localStorage.getItem('lihatdulu:inspection:room-report:v1'));
    return JSON.stringify({ ...current, activeReport: state.encodeReport(state.freshEditableReport()), unexpected: true });
  });
  await page.addInitScript(value => localStorage.setItem('lihatdulu:inspection:room-report:v1', value), malformed);
  await page.reload(); await ready(page);
  await expect(page.locator('[data-placement="body"] strong')).toHaveText('✓ Ukuran muat');
});
