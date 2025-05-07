import { test, expect } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environments';

test.describe('Connectivity Test', () => {
  test('can access public Juice Shop instance', async ({ page }) => {
    test.setTimeout(60000);
    
    const environment = getCurrentEnvironment();
    await page.goto(environment.baseUrl);
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const logo = page.locator('.logo');
    if (await logo.isVisible()) {
      console.log('Logo is visible');
    } else {
      console.log('Logo is not visible');
    }
    
    await page.screenshot({ path: 'connectivity-test.png' });
    
    await expect(page).toHaveTitle(/Juice Shop/);
  });
});
