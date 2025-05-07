import { test, expect } from '@playwright/test';
import { EnvironmentManager } from '../src/utils/environmentManager';

test.describe('Connectivity Test', () => {
  test('can access public Juice Shop instance', async ({ page }) => {
    test.setTimeout(60000);
    
    const environment = EnvironmentManager.getEnvironment();
    await page.goto(environment.baseUrl);
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const logo = page.locator('.logo');
    const isLogoVisible = await logo.isVisible();
    console.log(`Logo is ${isLogoVisible ? 'visible' : 'not visible'}`);
    
    await page.screenshot({ path: 'connectivity-test.png' });
    
    await expect(page).toHaveTitle(/Juice Shop/);
  });
});
