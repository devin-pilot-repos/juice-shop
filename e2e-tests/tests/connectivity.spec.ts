import { test, expect } from '@playwright/test';
import { EnvironmentManager } from '../src/utils/environmentManager';
import { BasePage } from '../src/pages/BasePage';

test.describe('Connectivity Test', () => {
  test('can access public Juice Shop instance', async ({ page }: { page: any }) => {
    test.setTimeout(120000); // Increased timeout for fallback attempts
    
    EnvironmentManager.initialize();
    const basePage = new BasePage(page);
    
    console.log('Attempting to connect to a Juice Shop instance...');
    const connected = await EnvironmentManager.setupEnvironment(page);
    
    if (!connected) {
      console.log('Failed to connect to any Juice Shop instance');
      await page.screenshot({ path: `connectivity-failure-${Date.now()}.png` });
      test.fail(true, 'Could not connect to any Juice Shop instance');
      return;
    }
    
    const activeUrl = EnvironmentManager.getBaseUrl();
    console.log(`Successfully connected to: ${activeUrl}`);
    
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
    
    try {
      const navbarText = await page.locator('mat-toolbar.mat-primary').first().textContent();
      console.log(`Navbar text: ${navbarText}`);
      expect(navbarText).toContain('OWASP Juice Shop');
    } catch (error) {
      console.log('Error getting navbar text:', error);
      const pageContent = await page.content();
      expect(pageContent).toContain('OWASP Juice Shop');
    }
    
    const productSelectors = [
      'mat-grid-tile', 
      '.mat-card', 
      'mat-card', 
      'app-product-list mat-grid-tile',
      'app-search-result mat-card',
      'app-search-result .mat-card',
      'app-search-result .product',
      '.product',
      '.item-name',
      'app-product-list .product',
      'app-product-list .item-name',
      'mat-grid-list mat-grid-tile'
    ];
    
    let productCount = 0;
    for (const selector of productSelectors) {
      try {
        const products = page.locator(selector);
        const count = await products.count();
        console.log(`Selector "${selector}" found ${count} products`);
        
        if (count > 0) {
          productCount = count;
          break;
        }
      } catch (error) {
        console.log(`Error with selector "${selector}":`, error);
      }
    }
    
    console.log(`Total products found: ${productCount}`);
    expect(productCount).toBeGreaterThan(0);
    
    await page.screenshot({ path: `connectivity-test-success-${Date.now()}.png` });
    
    console.log(`Connectivity test passed using URL: ${activeUrl}`);
  });
});
