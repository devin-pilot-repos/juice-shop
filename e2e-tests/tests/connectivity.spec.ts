import { test, expect } from '@playwright/test';
import { EnvironmentManager } from '../src/utils/environmentManager';
import { BasePage } from '../src/pages/BasePage';

test.describe('Connectivity Test', () => {
  test('can access public Juice Shop instance', async ({ page }) => {
    test.setTimeout(60000);
    
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    
    await page.goto(environment.baseUrl, { 
      timeout: 60000,
      waitUntil: 'domcontentloaded' 
    });
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    try {
      const dismissButton = page.locator('button:has-text("Dismiss")');
      if (await dismissButton.isVisible({ timeout: 5000 })) {
        await dismissButton.click();
        console.log('Dismissed welcome banner');
      }
    } catch (error) {
      console.log('No welcome banner to dismiss or error dismissing it:', error);
    }
    
    const navbarText = await page.locator('mat-toolbar.mat-primary').first().textContent();
    console.log(`Navbar text: ${navbarText}`);
    expect(navbarText).toContain('OWASP Juice Shop');
    
    const products = page.locator('mat-grid-tile');
    const productCount = await products.count();
    console.log(`Found ${productCount} products`);
    expect(productCount).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'connectivity-test.png' });
  });
});
