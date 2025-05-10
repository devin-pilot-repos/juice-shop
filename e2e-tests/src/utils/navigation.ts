import { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { BasketPage } from '../pages/BasketPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ScoreBoardPage } from '../pages/ScoreBoardPage';

/**
 * Navigation utilities for tests
 */
export class Navigation {
  /**
   * Navigate to the home page
   * @param page Playwright page object
   * @returns Promise that resolves to HomePage if navigation is successful, or null if it fails
   */
  static async goToHomePage(page: Page): Promise<HomePage | null> {
    const homePage = new HomePage(page);
    const success = await homePage.navigate();
    if (!success) {
      console.log('Failed to navigate to home page');
      return null;
    }
    return homePage;
  }

  /**
   * Navigate to the login page
   * @param page Playwright page object
   * @returns Promise that resolves to LoginPage if navigation is successful, or null if it fails
   */
  static async goToLoginPage(page: Page): Promise<LoginPage | null> {
    const loginPage = new LoginPage(page);
    const success = await loginPage.navigate();
    if (!success) {
      console.log('Failed to navigate to login page');
      return null;
    }
    return loginPage;
  }

  /**
   * Navigate to the basket page
   * @param page Playwright page object
   * @returns Promise that resolves to BasketPage if navigation is successful, or null if it fails
   */
  static async goToBasketPage(page: Page): Promise<BasketPage | null> {
    const basketPage = new BasketPage(page);
    const success = await basketPage.navigate();
    if (!success) {
      console.log('Failed to navigate to basket page');
      return null;
    }
    return basketPage;
  }

  /**
   * Navigate to a specific product page by ID
   * @param page Playwright page object
   * @param productId The ID of the product
   * @returns Promise that resolves to boolean indicating if navigation was successful
   */
  static async goToProductPage(page: Page, productId: number): Promise<boolean> {
    try {
      await page.goto(`/#/product/${productId}`);
      await page.waitForLoadState('networkidle');
      return true;
    } catch (error) {
      console.log(`Failed to navigate to product page for product ID ${productId}: ${error}`);
      return false;
    }
  }

  /**
   * Navigate to the search results page with a query
   * @param page Playwright page object
   * @param query The search query
   * @returns Promise that resolves to boolean indicating if navigation was successful
   */
  static async searchProducts(page: Page, query: string): Promise<boolean> {
    const homePage = new HomePage(page);
    const success = await homePage.navigate();
    if (!success) {
      console.log(`Failed to navigate to home page for search: ${query}`);
      return false;
    }
    await homePage.searchProduct(query);
    return true;
  }

  /**
   * Navigate to a specific URL path
   * @param page Playwright page object
   * @param path The path to navigate to
   * @returns Promise that resolves to boolean indicating if navigation was successful
   */
  static async goToPath(page: Page, path: string): Promise<boolean> {
    try {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      return true;
    } catch (error) {
      console.log(`Failed to navigate to path ${path}: ${error}`);
      return false;
    }
  }

  /**
   * Navigate to the registration page
   * @param page Playwright page object
   * @returns Promise that resolves to RegistrationPage if navigation is successful, or null if it fails
   */
  static async goToRegistrationPage(page: Page): Promise<RegistrationPage | null> {
    const registrationPage = new RegistrationPage(page);
    const success = await registrationPage.navigate();
    if (!success) {
      console.log('Failed to navigate to registration page');
      return null;
    }
    return registrationPage;
  }

  /**
   * Navigate to the score board page
   * @param page Playwright page object
   * @returns Promise that resolves to ScoreBoardPage if navigation is successful, or null if it fails
   */
  static async goToScoreBoard(page: Page): Promise<ScoreBoardPage | null> {
    const scoreBoardPage = new ScoreBoardPage(page);
    const success = await scoreBoardPage.navigate();
    if (!success) {
      console.log('Failed to navigate to score board page');
      return null;
    }
    return scoreBoardPage;
  }
}
