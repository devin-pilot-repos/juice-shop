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
   * @returns Promise that resolves when navigation is complete
   */
  static async goToHomePage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page);
    await homePage.navigate();
    return homePage;
  }

  /**
   * Navigate to the login page
   * @param page Playwright page object
   * @returns Promise that resolves when navigation is complete
   */
  static async goToLoginPage(page: Page): Promise<LoginPage> {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    return loginPage;
  }

  /**
   * Navigate to the basket page
   * @param page Playwright page object
   * @returns Promise that resolves when navigation is complete
   */
  static async goToBasketPage(page: Page): Promise<BasketPage> {
    const basketPage = new BasketPage(page);
    await basketPage.navigate();
    return basketPage;
  }

  /**
   * Navigate to a specific product page by ID
   * @param page Playwright page object
   * @param productId The ID of the product
   * @returns Promise that resolves when navigation is complete
   */
  static async goToProductPage(page: Page, productId: number): Promise<void> {
    await page.goto(`/#/product/${productId}`);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to the search results page with a query
   * @param page Playwright page object
   * @param query The search query
   * @returns Promise that resolves when navigation is complete
   */
  static async searchProducts(page: Page, query: string): Promise<void> {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.searchProduct(query);
  }

  /**
   * Navigate to a specific URL path
   * @param page Playwright page object
   * @param path The path to navigate to
   * @returns Promise that resolves when navigation is complete
   */
  static async goToPath(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to the registration page
   * @param page Playwright page object
   * @returns Promise that resolves when navigation is complete
   */
  static async goToRegistrationPage(page: Page): Promise<RegistrationPage> {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();
    return registrationPage;
  }

  /**
   * Navigate to the score board page
   * @param page Playwright page object
   * @returns Promise that resolves when navigation is complete
   */
  static async goToScoreBoard(page: Page): Promise<ScoreBoardPage> {
    const scoreBoardPage = new ScoreBoardPage(page);
    await scoreBoardPage.navigate();
    return scoreBoardPage;
  }
}
