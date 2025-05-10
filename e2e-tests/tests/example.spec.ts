import { test, expect } from '@playwright/test';

test.describe('Example test suite', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/OWASP Juice Shop/);
  });

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('#navbarAccount').click();
    
    await page.locator('#navbarLoginButton').click();
    
    await expect(page).toHaveURL(/.*\/login/);
    
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});

test.describe('Headless mode tests', () => {
  test('can search for products', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('#searchQuery').fill('apple');
    await page.locator('#searchButton').click();
    
    await expect(page.locator('.mat-card')).toBeVisible();
  });
});
