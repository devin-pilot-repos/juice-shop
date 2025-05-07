import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { ScoreBoardPage } from '../src/pages/ScoreBoardPage';
import { EnvironmentManager } from '../src/utils/environmentManager';
import { BasePage } from '../src/pages/BasePage';

test.describe('Product Search', () => {
  test.setTimeout(60000);
  
  test('should search for products and display results', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    
    await page.goto(`${environment.baseUrl}/#/search?q=juice`);
    console.log(`Navigated to search URL: ${page.url()}`);
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(5000); // Give more time for rendering
    
    await page.screenshot({ path: 'search-results-juice.png' });
    
    const productSelectors = [
      '.mat-card', 
      'mat-card', 
      'app-product-list mat-grid-tile',
      'app-search-result mat-card',
      'app-search-result .mat-card',
      'app-search-result .product'
    ];
    
    let productCount = 0;
    let productsFound = false;
    
    for (const selector of productSelectors) {
      try {
        const products = page.locator(selector);
        const count = await products.count();
        console.log(`Selector "${selector}" found ${count} products`);
        
        if (count > 0) {
          productCount = count;
          productsFound = true;
          break;
        }
      } catch (error) {
        console.log(`Error with selector "${selector}":`, error);
      }
    }
    
    await basePage.dismissOverlays(3, 1000);
    
    const pageContent = await page.content();
    console.log(`Page contains "juice": ${pageContent.includes('juice')}`);
    console.log(`Page contains "mat-card": ${pageContent.includes('mat-card')}`);
    
    expect(productsFound).toBe(true);
    expect(productCount).toBeGreaterThan(0);
  });
  
  test('should show no results message for non-existent products', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    
    await page.goto(`${environment.baseUrl}/#/search?q=nonexistentproduct123456789`);
    console.log(`Navigated to search URL: ${page.url()}`);
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(5000); // Give more time for rendering
    
    await page.screenshot({ path: 'search-results-nonexistent.png' });
    
    await basePage.dismissOverlays(3, 1000);
    
    const searchResultText = await page.locator('app-search-result').textContent();
    console.log(`Search result text: ${searchResultText}`);
    
    expect(searchResultText?.includes('No results')).toBe(true);
  });
  
  test('should perform SQL injection attack in search', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    
    await page.goto(`${environment.baseUrl}/#/search?q=%27%20OR%201%3D1--`); // URL encoded: ' OR 1=1--
    console.log(`Navigated to SQL injection search URL: ${page.url()}`);
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(5000); // Give more time for rendering
    
    await page.screenshot({ path: 'search-results-sql-injection.png' });
    
    await basePage.dismissOverlays(3, 1000);
    
    const productSelectors = [
      '.mat-card', 
      'mat-card', 
      'app-product-list mat-grid-tile',
      'app-search-result mat-card',
      'app-search-result .mat-card',
      'app-search-result .product'
    ];
    
    let productCount = 0;
    let productsFound = false;
    
    for (const selector of productSelectors) {
      try {
        const products = page.locator(selector);
        const count = await products.count();
        console.log(`Selector "${selector}" found ${count} products for SQL injection`);
        
        if (count > 0) {
          productCount = count;
          productsFound = true;
          break;
        }
      } catch (error) {
        console.log(`Error with selector "${selector}":`, error);
      }
    }
    
    const pageContent = await page.content();
    console.log(`Page contains product elements: ${pageContent.includes('mat-card') || pageContent.includes('product')}`);
    
    expect(productsFound).toBe(true);
    expect(productCount).toBeGreaterThan(0);
    
    console.log('SQL injection test passed - found products with injection');
  });
});
