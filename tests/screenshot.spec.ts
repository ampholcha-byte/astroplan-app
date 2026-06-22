import { test, expect } from '@playwright/test';

test('screenshot homepage', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
  console.log('Screenshot saved');
});
