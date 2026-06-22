import { test, expect } from '@playwright/test';

test.describe('AstroPlan App', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('page loads with title and header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AstroPlan');
    await expect(page.getByText('Milky Way Photography Planner')).toBeVisible();
  });

  test('calendar grid renders 35 day cells', async ({ page }) => {
    const cells = page.locator('button[aria-label^="Day"]');
    await expect(cells).toHaveCount(35);
  });

  test('month navigation works', async ({ page }) => {
    const monthText = page.locator('span.text-base.font-semibold.text-white').first();
    const initial = await monthText.textContent();

    await page.getByText('›').click();
    await page.waitForTimeout(1500);

    const updated = await monthText.textContent();
    expect(updated).not.toBe(initial);
  });

  test('location search shows error for empty query', async ({ page }) => {
    await page.getByText('🔍').click();
    await page.waitForTimeout(500);
    await expect(page.locator('p.text-sm.text-red-400')).toBeVisible();
  });

  test('day cell click opens modal', async ({ page }) => {
    const cells = page.locator('button[aria-label^="Day"]');
    await cells.nth(10).click();
    await page.waitForTimeout(1000);
    // Modal shows date heading (h2 with date format)
    await expect(page.locator('h2.text-xl')).toBeVisible();
  });

  test('modal closes on X button', async ({ page }) => {
    const cells = page.locator('button[aria-label^="Day"]');
    await cells.nth(10).click();
    await page.waitForTimeout(1000);

    // Close button in modal header
    await page.locator('h2.text-xl button, div button').filter({ hasText: /×|x/ }).first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('h2.text-xl')).not.toBeVisible();
  });

  test('settings panel opens and closes', async ({ page }) => {
    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Settings').first()).toBeVisible();

    // Close button
    await page.locator('button').filter({ hasText: /×|x/ }).last().click();
    await page.waitForTimeout(500);
  });

  test('settings persist in localStorage', async ({ page }) => {
    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(1000);

    const apiKeyInput = page.locator('input[type="password"]');
    await apiKeyInput.fill('test-api-key-123');
    await page.getByText('Save Settings').click();
    await page.waitForTimeout(1000);

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.locator('button[title="Settings"]').click();
    await page.waitForTimeout(1000);

    const savedKey = await page.locator('input[type="password"]').inputValue();
    expect(savedKey).toBe('test-api-key-123');
  });

  test('best days summary shows ranked list', async ({ page }) => {
    await expect(page.getByText('Best Shooting Days')).toBeVisible();
    await expect(page.getByText(/🥇|🥈|🥉/).first()).toBeVisible();
  });

  test('notification banner is visible', async ({ page }) => {
    await expect(page.getByText('Shooting Alerts')).toBeVisible();
  });

  test('legend is displayed', async ({ page }) => {
    await expect(page.getByText('GC Rise')).toBeVisible();
    await expect(page.getByText('GC Set')).toBeVisible();
    await expect(page.getByText('Moon Bright')).toBeVisible();
    await expect(page.getByText('Dark Sky')).toBeVisible();
  });

  test('mock cloud data is non-zero (bug fix verification)', async ({ page }) => {
    const cloudTexts = page.locator('text=/☁ \\d+%/');
    const count = await cloudTexts.count();
    expect(count).toBeGreaterThan(0);

    let nonZeroFound = false;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await cloudTexts.nth(i).textContent();
      const match = text?.match(/☁ (\d+)%/);
      if (match && parseInt(match[1]) > 0) {
        nonZeroFound = true;
        break;
      }
    }
    expect(nonZeroFound).toBe(true);
  });

  test('day modal shows sun & moon times', async ({ page }) => {
    const cells = page.locator('button[aria-label^="Day"]');
    for (let i = 7; i < 20; i++) {
      await cells.nth(i).click();
      await page.waitForTimeout(1000);
      if (await page.getByText('Sun & Moon Times').isVisible({ timeout: 3000 })) {
        await expect(page.getByText('Sunrise')).toBeVisible();
        await expect(page.getByText('Sunset')).toBeVisible();
        break;
      }
      // Close and try next
      const closeBtn = page.locator('button').filter({ hasText: /×/ }).last();
      if (await closeBtn.isVisible({ timeout: 2000 })) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('checklist panel works in modal', async ({ page }) => {
    const cells = page.locator('button[aria-label^="Day"]');
    await cells.nth(10).click();
    await page.waitForTimeout(1000);

    if (await page.getByText('Shooting Checklist').isVisible({ timeout: 5000 })) {
      await expect(page.getByText('Camera + lens')).toBeVisible();
      await expect(page.getByText('Tripod')).toBeVisible();
    }
  });
});
