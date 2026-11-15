import { test, expect } from '@playwright/test';

test('complete judge flow challenges, hides and restores the actual connection', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Inspect mapped Stony Brook station' }).click();
  await expect(page.locator('.claim-text')).toContainText('USGS maps');
  await page.getByRole('button', { name: 'Inspect possible road-to-stream connection' }).click();
  await page.getByRole('button', { name: 'Challenge This Connection' }).click();
  await expect(page.locator('.result')).toContainText('NOT PROVEN');
  await expect(page.locator('.result')).toContainText('does not mean the hypothesis is false');
  await expect(page.locator('#scene')).toHaveClass(/challenged/);
  await page.getByRole('checkbox', { name: 'Documented Only' }).check();
  await expect(page.locator('#candidate-link-001')).toBeHidden();
  await expect(page.locator('#select-connection')).toBeHidden();
  await expect(page.locator('#station-01401000')).toBeVisible();
  await expect(page.locator('#feature-count')).toHaveText('1 / 2 features visible');
  await expect(page.locator('.next-evidence')).toContainText('drainage-network');
  await page.getByRole('checkbox', { name: 'Documented Only' }).uncheck();
  await expect(page.locator('#candidate-link-001')).toBeVisible();
  await expect(page.locator('#select-connection')).toBeVisible();
  expect(errors).toEqual([]);
});
test('source links point to original records and no empty or unsafe link is rendered', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#claim-detail a');
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveAttribute('href', 'https://waterdata.usgs.gov/monitoring-location/USGS-01401000/');
  await expect(links.nth(1)).toHaveAttribute('href', 'https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=1309897');
  for (const link of await links.all()) await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});
test('selecting different claims changes recommendations and mapped audit result', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-claim-id="scenario-assumption-001"]').click();
  await expect(page.locator('.next-evidence')).toContainText('road-safety');
  await expect(page.locator('.next-evidence')).not.toContainText('drainage-network');
  await page.locator('[data-claim-id="station-location-001"]').click();
  await page.getByRole('button', { name: 'Challenge This Connection' }).click();
  await expect(page.locator('.result strong')).toHaveText('SUPPORTED');
  await expect(page.locator('.data-gap')).toContainText('Chloride monitoring gap');
});
test('downloaded evidence brief reflects current filter, selected claim and challenge', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Challenge This Connection' }).click();
  await page.getByRole('checkbox', { name: 'Documented Only' }).check();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export evidence brief' }).click();
  const download = await downloadPromise; const stream = await download.createReadStream(); const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const brief = JSON.parse(Buffer.concat(chunks).toString());
  expect(brief.mode).toBe('documented'); expect(brief.selectedClaimId).toBe('hypothesis-runoff-001'); expect(brief.challenged).toBe(true);
  expect(brief.visibleFeatureIds).toEqual(['station-01401000']); expect(brief.claims[0].evaluation.result).toBe('NOT PROVEN');
});
for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
  test(`responsive demo and keyboard access at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport); await page.goto('/');
    await expect(page.locator('#workspace')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('#challenge').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('.result strong')).toHaveText('NOT PROVEN');
    await page.locator('#documented-only').focus(); await page.keyboard.press('Space');
    await expect(page.locator('#candidate-link-001')).toBeHidden();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.screenshot({ path: `/private/tmp/saltshadow-${viewport.width}.png`, fullPage: true });
  });
}
test('case loading failure gives a clear error and retry control', async ({ page }) => {
  await page.route('**/data/case_study.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/'); await expect(page.locator('#loading')).toContainText('HTTP 503');
  await expect(page.getByRole('button', { name: 'Retry loading case' })).toBeVisible();
  await expect(page.locator('#workspace')).toBeHidden();
});
test('evidence-change event supplies a map adapter with selected IDs and visible features', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#workspace')).toBeVisible();
  await page.evaluate(() => document.addEventListener('saltshadow:evidence-change', event => { window.lastEvidenceChange = event.detail; }));
  await page.getByRole('checkbox', { name: 'Documented Only' }).check();
  const detail = await page.evaluate(() => window.lastEvidenceChange);
  expect(detail.mode).toBe('documented'); expect(detail.visibleFeatureIds).toEqual(['station-01401000']);
  expect(detail.evaluation.result).toBe('NOT PROVEN');
});
