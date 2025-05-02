import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { ProductPage } from '../src/pages/ProductPage';
import { BasketPage } from '../src/pages/BasketPage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';

test.describe('Basket and Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await Auth.loginAsCustomer(page);
  });
  
  test('should add product to basket', async ({ page }) => {
    const homePage = await Navigation.goToHomePage(page);
    
    await homePage.searchProduct('apple');
    
    await page.locator('.mat-card').first().click();
    
    const productPage = new ProductPage(page);
    await productPage.addToBasket();
    
    const basketPage = await Navigation.goToBasketPage(page);
    
    const itemCount = await basketPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
  });
  
  test('should remove product from basket', async ({ page }) => {
    const homePage = await Navigation.goToHomePage(page);
    
    await homePage.searchProduct('apple');
    
    await page.locator('.mat-card').first().click();
    
    const productPage = new ProductPage(page);
    await productPage.addToBasket();
    
    const basketPage = await Navigation.goToBasketPage(page);
    
    let itemCount = await basketPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
    
    await basketPage.removeItem(0);
    
    itemCount = await basketPage.getItemCount();
    expect(itemCount).toBe(0);
    
    const isBasketEmpty = await basketPage.isBasketEmpty();
    expect(isBasketEmpty).toBe(true);
  });
  
  test('should proceed to checkout', async ({ page }) => {
    const homePage = await Navigation.goToHomePage(page);
    
    await homePage.searchProduct('apple');
    
    await page.locator('.mat-card').first().click();
    
    const productPage = new ProductPage(page);
    await productPage.addToBasket();
    
    const basketPage = await Navigation.goToBasketPage(page);
    
    const itemCount = await basketPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
    
    const totalPrice = await basketPage.getTotalPrice();
    expect(totalPrice).not.toBe('');
    
    await basketPage.checkout();
    
    await expect(page).toHaveURL(/.*\/address\/select/);
  });
  
  test('should show empty basket message when basket is empty', async ({ page }) => {
    const basketPage = await Navigation.goToBasketPage(page);
    
    const isBasketEmpty = await basketPage.isBasketEmpty();
    expect(isBasketEmpty).toBe(true);
  });
});
