import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { ScoreBoardPage } from '../src/pages/ScoreBoardPage';

test.describe('Product Search', () => {
  test.setTimeout(60000);
  test('should search for products and display results', async ({ page }) => {
    const homePage = await Navigation.goToHomePage(page);
    
    await homePage.searchProduct('juice');
    
    const productCount = await homePage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });
  
  test('should show no results message for non-existent products', async ({ page }) => {
    const homePage = await Navigation.goToHomePage(page);
    
    await homePage.searchProduct('nonexistentproduct123456789');
    
    const productCount = await homePage.getProductCount();
    expect(productCount).toBe(0);
    
    await expect(page.locator('app-search-result')).toContainText('No results found');
  });
  
  test('should perform SQL injection attack in search', async ({ page }) => {
    const homePage = await Navigation.goToHomePage(page);
    
    await homePage.searchProduct("' OR 1=1--");
    
    const productCount = await homePage.getProductCount();
    expect(productCount).toBeGreaterThan(1);
    
    const scoreBoardPage = new ScoreBoardPage(page);
    await scoreBoardPage.navigate();
    
    const isSolved = await scoreBoardPage.isChallengeCompleted('SQL Injection');
    expect(isSolved).toBe(true);
  });
});
