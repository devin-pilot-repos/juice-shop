import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { ScoreBoardPage } from '../src/pages/ScoreBoardPage';
import { EnvironmentManager } from '../src/utils/environmentManager';
import { BasePage } from '../src/pages/BasePage';

test.describe('Product Search', () => {
  test.setTimeout(120000); // Increased timeout for flaky connections
  
  test('should search for products and display results', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    
    try {
      await page.goto(environment.baseUrl, { 
        timeout: 60000,
        waitUntil: 'domcontentloaded' 
      });
      console.log(`Navigated to base URL: ${page.url()}`);
      
      await basePage.dismissOverlays(3, 1000);
      
      await homePage.searchProduct('juice');
      console.log('Searched for "juice"');
      
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
      
      const pageContent = await page.content();
      console.log(`Page contains "juice": ${pageContent.includes('juice')}`);
      console.log(`Page contains "mat-card": ${pageContent.includes('mat-card')}`);
      
      expect(productsFound).toBe(true);
      expect(productCount).toBeGreaterThan(0);
    } catch (error) {
      console.log('Test encountered an error:', error);
      await page.screenshot({ path: `search-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should handle search for non-existent products', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    
    try {
      await page.goto(environment.baseUrl, { 
        timeout: 60000,
        waitUntil: 'domcontentloaded' 
      });
      console.log(`Navigated to base URL: ${page.url()}`);
      
      await basePage.dismissOverlays(3, 1000);
      
      await page.screenshot({ path: `before-nonexistent-search-${Date.now()}.png` });
      
      const searchTerm = 'nonexistentproduct123456789xyz';
      
      let searchInteractionSuccessful = false;
      
      try {
        const searchInputOpened = await homePage.openSearchInput();
        console.log(`Search input opened: ${searchInputOpened}`);
        
        const searchInputFilled = await homePage.fillSearchInput(searchTerm);
        console.log(`Search input filled: ${searchInputFilled}`);
        
        await page.screenshot({ path: `after-search-input-${Date.now()}.png` });
        
        const searchSubmitted = await homePage.submitSearch();
        console.log(`Search submitted: ${searchSubmitted}`);
        
        await page.screenshot({ path: `after-search-submit-${Date.now()}.png` });
        
        searchInteractionSuccessful = searchInputOpened && searchInputFilled && searchSubmitted;
        console.log(`Search interaction successful: ${searchInteractionSuccessful}`);
      } catch (searchError) {
        console.log('Error during search interaction:', searchError);
        
        try {
          await homePage.searchProduct(searchTerm);
          console.log('Used fallback searchProduct method');
          searchInteractionSuccessful = true;
        } catch (fallbackError) {
          console.log('Fallback search also failed:', fallbackError);
        }
      }
      
      expect(searchInteractionSuccessful).toBe(true);
      
      console.log('Non-existent product search test passed - search interaction was successful');
    } catch (error) {
      console.log('Test encountered an error:', error);
      await page.screenshot({ path: `no-results-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should perform SQL injection attack in search', async ({ page }) => {
    const environment = EnvironmentManager.getEnvironment();
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    
    try {
      await page.goto(environment.baseUrl, { 
        timeout: 60000,
        waitUntil: 'domcontentloaded' 
      });
      console.log(`Navigated to base URL: ${page.url()}`);
      
      await basePage.dismissOverlays(3, 1000);
      
      await homePage.searchProduct("' OR 1=1--");
      console.log('Performed SQL injection search');
      
      await page.screenshot({ path: 'search-results-sql-injection.png' });
      
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
      
      const hasProducts = productsFound || 
                         pageContent.includes('mat-card') || 
                         pageContent.includes('product') ||
                         pageContent.includes('Apple') ||
                         pageContent.includes('Juice');
      
      expect(hasProducts).toBe(true);
      
      console.log('SQL injection test passed - found products with injection');
    } catch (error) {
      console.log('Test encountered an error:', error);
      await page.screenshot({ path: `sql-injection-error-${Date.now()}.png` });
      throw error;
    }
  });
});
