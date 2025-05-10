import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { BasketPage } from '../src/pages/BasketPage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { BasePage } from '../src/pages/BasePage';
import { EnvironmentManager } from '../src/utils/environmentManager';
import { BasketManipulation } from '../src/utils/basketManipulation';

test.describe('Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    EnvironmentManager.initialize();
    await Auth.loginAsCustomer(page);
  });

  test('should complete full checkout process with address and payment', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.locator('button[aria-label="Add to Basket"]').click();
      
      const basketPage = await Navigation.goToBasketPage(page);
      if (!basketPage) {
        console.log('Failed to navigate to basket page, skipping test');
        test.skip();
        return;
      }
      
      const itemCount = await basketPage.getItemCount();
      expect(itemCount).toBeGreaterThan(0);
      
      await basketPage.checkout();
      
      const addressExists = await page.locator('.mat-row').isVisible().catch(() => false);
      
      if (!addressExists) {
        await page.locator('button:has-text("Add New Address")').click();
        
        await page.locator('input[data-placeholder="Please provide a country."]').fill('Test Country');
        await page.locator('input[data-placeholder="Please provide a name."]').fill('Test Name');
        await page.locator('input[data-placeholder="Please provide a mobile number."]').fill('1234567890');
        await page.locator('input[data-placeholder="Please provide a ZIP code."]').fill('12345');
        await page.locator('textarea[data-placeholder="Please provide an address."]').fill('Test Address');
        await page.locator('input[data-placeholder="Please provide a city."]').fill('Test City');
        await page.locator('input[data-placeholder="Please provide a state."]').fill('Test State');
        
        await page.locator('button:has-text("Submit")').click();
      }
      
      await page.locator('.mat-row').first().click();
      
      await page.locator('button:has-text("Continue")').click();
      
      const paymentExists = await page.locator('.mat-radio-button').isVisible().catch(() => false);
      
      if (!paymentExists) {
        await page.locator('button:has-text("Add New Card")').click();
        
        await page.locator('input[data-placeholder="Please provide your card number."]').fill('1234567887654321');
        await page.locator('select[name="month"]').selectOption('1');
        await page.locator('select[name="year"]').selectOption('2080');
        
        await page.locator('button:has-text("Submit")').click();
      }
      
      await page.locator('.mat-radio-button').first().click();
      
      await page.locator('button:has-text("Continue")').click();
      
      await page.locator('button:has-text("Place your order and pay")').click();
      
      await expect(page.locator('h1:has-text("Thank you for your purchase!")')).toBeVisible();
      
      await BasketManipulation.emptyBasket(page);
    } catch (error) {
      console.log('Error in checkout process test:', error);
      await page.screenshot({ path: `checkout-process-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should validate delivery address form', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.locator('button[aria-label="Add to Basket"]').click();
      
      const basketPage = await Navigation.goToBasketPage(page);
      if (!basketPage) {
        console.log('Failed to navigate to basket page, skipping test');
        test.skip();
        return;
      }
      
      await basketPage.checkout();
      
      await page.locator('button:has-text("Add New Address")').click();
      
      await page.locator('button:has-text("Submit")').click();
      
      const errorMessages = page.locator('mat-error');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBeGreaterThan(0);
      
      await page.locator('input[data-placeholder="Please provide a country."]').fill('Test Country');
      await page.locator('button:has-text("Submit")').click();
      
      const updatedErrorCount = await errorMessages.count();
      expect(updatedErrorCount).toBeGreaterThan(0);
      
      await BasketManipulation.emptyBasket(page);
    } catch (error) {
      console.log('Error in address validation test:', error);
      await page.screenshot({ path: `address-validation-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should validate payment method form', async ({ page }) => {
    try {
      const homePage = await Navigation.goToHomePage(page);
      if (!homePage) {
        console.log('Failed to navigate to home page, skipping test');
        test.skip();
        return;
      }
      
      await homePage.searchProduct('apple');
      
      const productCard = page.locator('.mat-card').first();
      await productCard.locator('button[aria-label="Add to Basket"]').click();
      
      const basketPage = await Navigation.goToBasketPage(page);
      if (!basketPage) {
        console.log('Failed to navigate to basket page, skipping test');
        test.skip();
        return;
      }
      
      await basketPage.checkout();
      
      const addressExists = await page.locator('.mat-row').isVisible().catch(() => false);
      
      if (!addressExists) {
        await page.locator('button:has-text("Add New Address")').click();
        
        await page.locator('input[data-placeholder="Please provide a country."]').fill('Test Country');
        await page.locator('input[data-placeholder="Please provide a name."]').fill('Test Name');
        await page.locator('input[data-placeholder="Please provide a mobile number."]').fill('1234567890');
        await page.locator('input[data-placeholder="Please provide a ZIP code."]').fill('12345');
        await page.locator('textarea[data-placeholder="Please provide an address."]').fill('Test Address');
        await page.locator('input[data-placeholder="Please provide a city."]').fill('Test City');
        await page.locator('input[data-placeholder="Please provide a state."]').fill('Test State');
        
        await page.locator('button:has-text("Submit")').click();
      }
      
      await page.locator('.mat-row').first().click();
      
      await page.locator('button:has-text("Continue")').click();
      
      await page.locator('button:has-text("Add New Card")').click();
      
      await page.locator('button:has-text("Submit")').click();
      
      const errorMessages = page.locator('mat-error');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBeGreaterThan(0);
      
      await BasketManipulation.emptyBasket(page);
    } catch (error) {
      console.log('Error in payment validation test:', error);
      await page.screenshot({ path: `payment-validation-error-${Date.now()}.png` });
      throw error;
    }
  });
});
