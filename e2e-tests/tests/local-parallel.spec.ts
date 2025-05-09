import { test, expect } from '@playwright/test';

test.describe('Local Parallel Tests', () => {
  for (let i = 1; i <= 8; i++) {
    test(`Local parallel test ${i}`, async ({ page }) => {
      await page.setContent(`<html><body><h1>Test ${i}</h1></body></html>`);
      await expect(page.locator('h1')).toHaveText(`Test ${i}`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Completed test ${i}`);
    });
  }
});
