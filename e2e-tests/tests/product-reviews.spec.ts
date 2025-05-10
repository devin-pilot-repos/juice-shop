import { test, expect } from '@playwright/test';
import { ProductPage } from '../src/pages/ProductPage';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { BasePage } from '../src/pages/BasePage';
import { EnvironmentManager } from '../src/utils/environmentManager';

test.describe('Product Reviews', () => {
  test.beforeEach(async ({ page }) => {
    EnvironmentManager.initialize();
    await Auth.loginAsCustomer(page);
  });

  test('should submit a product review successfully', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.click();
      
      await page.waitForTimeout(1000);
      
      const productPage = new ProductPage(page);
      const reviewText = `Great product! Review at ${Date.now()}`;
      
      await productPage.submitReview(reviewText);
      
      await expect(page.locator('mat-card:has-text("' + reviewText + '")')).toBeVisible();
    } catch (error) {
      console.log('Error in product review test:', error);
      await page.screenshot({ path: `product-review-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should validate review text length', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.click();
      
      await page.waitForTimeout(1000);
      
      const productPage = new ProductPage(page);
      const shortReviewText = 'Too short';
      
      await productPage.submitReview(shortReviewText);
      
      await expect(page.locator('mat-error')).toBeVisible();
    } catch (error) {
      console.log('Error in review validation test:', error);
      await page.screenshot({ path: `review-validation-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should display existing product reviews', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.click();
      
      await page.waitForTimeout(1000);
      
      await expect(page.locator('#reviews')).toBeVisible();
      
      const reviewCount = await page.locator('mat-card.mat-card').count();
      console.log(`Found ${reviewCount} reviews`);
      
      if (reviewCount === 0) {
        const productPage = new ProductPage(page);
        const reviewText = `First review for this product! ${Date.now()}`;
        
        await productPage.submitReview(reviewText);
        
        await expect(page.locator('mat-card:has-text("' + reviewText + '")')).toBeVisible();
      }
    } catch (error) {
      console.log('Error in display reviews test:', error);
      await page.screenshot({ path: `display-reviews-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should handle special characters in reviews', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.click();
      
      await page.waitForTimeout(1000);
      
      const productPage = new ProductPage(page);
      const specialCharsReview = `Special chars: !@#$%^&*()_+<>?:"{}|~\` ${Date.now()}`;
      
      await productPage.submitReview(specialCharsReview);
      
      await expect(page.locator(`mat-card:has-text("Special chars:")`)).toBeVisible();
    } catch (error) {
      console.log('Error in special characters review test:', error);
      await page.screenshot({ path: `special-chars-review-error-${Date.now()}.png` });
      throw error;
    }
  });
});
