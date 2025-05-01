import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { getCurrentEnvironment } from '../../config/environments';

/**
 * Authentication utilities for tests
 */
export class Auth {
  /**
   * Login as an admin user
   * @param page Playwright page object
   * @returns Promise that resolves when login is complete
   */
  static async loginAsAdmin(page: Page): Promise<void> {
    const env = getCurrentEnvironment();
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login(
      env.credentials.admin.email,
      env.credentials.admin.password
    );
  }

  /**
   * Login as a customer user
   * @param page Playwright page object
   * @returns Promise that resolves when login is complete
   */
  static async loginAsCustomer(page: Page): Promise<void> {
    const env = getCurrentEnvironment();
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login(
      env.credentials.customer.email,
      env.credentials.customer.password
    );
  }

  /**
   * Login with custom credentials
   * @param page Playwright page object
   * @param email User email
   * @param password User password
   * @returns Promise that resolves when login is complete
   */
  static async loginWithCredentials(page: Page, email: string, password: string): Promise<void> {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login(email, password);
  }

  /**
   * Logout the current user
   * @param page Playwright page object
   * @returns Promise that resolves when logout is complete
   */
  static async logout(page: Page): Promise<void> {
    await page.locator('#navbarAccount').click();
    
    await page.locator('#navbarLogoutButton').click();
    
    await page.waitForNavigation();
  }

  /**
   * Check if user is logged in
   * @param page Playwright page object
   * @returns Promise that resolves to true if user is logged in
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    await page.locator('#navbarAccount').click();
    return await page.locator('#navbarLogoutButton').isVisible();
  }
}
