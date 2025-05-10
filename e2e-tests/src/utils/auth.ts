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
   * @returns Promise that resolves to boolean indicating if login was successful
   */
  static async loginAsAdmin(page: Page): Promise<boolean> {
    const env = getCurrentEnvironment();
    const loginPage = new LoginPage(page);
    
    const success = await loginPage.navigate();
    if (!success) {
      console.log('Failed to navigate to login page for admin login');
      return false;
    }
    await loginPage.login(
      env.credentials.admin.email,
      env.credentials.admin.password
    );
    return true;
  }

  /**
   * Login as a customer user
   * @param page Playwright page object
   * @returns Promise that resolves to boolean indicating if login was successful
   */
  static async loginAsCustomer(page: Page): Promise<boolean> {
    const env = getCurrentEnvironment();
    const loginPage = new LoginPage(page);
    
    const success = await loginPage.navigate();
    if (!success) {
      console.log('Failed to navigate to login page for customer login');
      return false;
    }
    await loginPage.login(
      env.credentials.customer.email,
      env.credentials.customer.password
    );
    return true;
  }

  /**
   * Login with custom credentials
   * @param page Playwright page object
   * @param email User email
   * @param password User password
   * @returns Promise that resolves to boolean indicating if login was successful
   */
  static async loginWithCredentials(page: Page, email: string, password: string): Promise<boolean> {
    const loginPage = new LoginPage(page);
    
    const success = await loginPage.navigate();
    if (!success) {
      console.log(`Failed to navigate to login page for credentials: ${email}`);
      return false;
    }
    await loginPage.login(email, password);
    return true;
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
