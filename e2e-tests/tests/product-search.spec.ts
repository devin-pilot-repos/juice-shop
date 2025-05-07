import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { ScoreBoardPage } from '../src/pages/ScoreBoardPage';
import { EnvironmentManager } from '../src/utils/environmentManager';

test.describe('Product Search', () => {
  test.setTimeout(60000);
  
  test('should search for products and display results', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    await page.goto(`${environment.baseUrl}/#/search?q=juice`);
    
    await page.waitForTimeout(2000);
    
    const products = page.locator('.mat-card');
    const count = await products.count();
    console.log(`Found ${count} products for search term 'juice'`);
    
    expect(count).toBeGreaterThan(0);
  });
  
  test('should show no results message for non-existent products', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    await page.goto(`${environment.baseUrl}/#/search?q=nonexistentproduct123456789`);
    
    await page.waitForTimeout(2000);
    
    const products = page.locator('.mat-card');
    const count = await products.count();
    console.log(`Found ${count} products for non-existent search term`);
    
    const searchResultText = await page.locator('app-search-result').textContent();
    console.log(`Search result text: ${searchResultText}`);
    
    if (count === 0) {
      expect(count).toBe(0);
    } else {
      expect(searchResultText?.includes('No results') || count === 0).toBeTruthy();
    }
  });
  
  test('should perform SQL injection attack in search', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    await page.goto(`${environment.baseUrl}/#/search?q=%27%20OR%201%3D1--`); // URL encoded: ' OR 1=1--
    
    await page.waitForTimeout(2000);
    
    const products = page.locator('.mat-card');
    const count = await products.count();
    console.log(`Found ${count} products for SQL injection search`);
    
    expect(count).toBeGreaterThan(1);
    
    const scoreBoardPage = new ScoreBoardPage(page);
    await scoreBoardPage.navigate();
    
    const isSolved = await scoreBoardPage.isChallengeCompleted('SQL Injection');
    expect(isSolved).toBe(true);
  });
});
