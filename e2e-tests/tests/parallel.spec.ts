import { test, expect } from '@playwright/test';

test.describe('Parallel test execution', () => {
  test.describe.configure({ mode: 'parallel' });

  for (let i = 1; i <= 5; i++) {
    test(`Parallel test ${i}`, async ({ page }) => {
      await page.goto('/');
      
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveTitle(/OWASP Juice Shop/);
      
      switch (i % 3) {
        case 0:
          await page.locator('#searchQuery').fill(`apple ${i}`);
          await page.locator('#searchButton').click();
          await expect(page.locator('.mat-card')).toBeVisible();
          break;
        case 1:
          await page.locator('#navbarAccount').click();
          await page.locator('#navbarLoginButton').click();
          await expect(page).toHaveURL(/.*\/login/);
          break;
        case 2:
          await page.locator('#navbarAccount').click();
          await page.locator('text=About Us').click();
          await expect(page).toHaveURL(/.*\/about/);
          break;
      }
    });
  }
});

test.describe('Sequential tests when needed', () => {
  test.describe.configure({ mode: 'serial' });

  test('First test in sequence', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OWASP Juice Shop/);
  });

  test('Second test in sequence', async ({ page }) => {
    await page.goto('/');
    await page.locator('#navbarAccount').click();
    await page.locator('#navbarLoginButton').click();
    await expect(page).toHaveURL(/.*\/login/);
  });
});
