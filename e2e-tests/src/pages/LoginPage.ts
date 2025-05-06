import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the login page
 */
export class LoginPage extends BasePage {
  /**
   * Email input field
   */
  private emailInput: Locator;

  /**
   * Password input field
   */
  private passwordInput: Locator;

  /**
   * Login button
   */
  private loginButton: Locator;

  /**
   * Remember me checkbox
   */
  private rememberMeCheckbox: Locator;

  /**
   * Error message
   */
  private errorMessage: Locator;

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[id="loginButton"]');
    this.rememberMeCheckbox = page.locator('mat-checkbox[id="rememberMe"]');
    this.errorMessage = page.locator('div.error');
  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    await super.navigate('/#/login');
    await this.waitForElement(this.emailInput);
  }

  /**
   * Login with the given credentials
   * @param email Email
   * @param password Password
   * @param rememberMe Whether to check the remember me checkbox
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    try {
      const welcomeBanner = this.page.locator('.cdk-overlay-container');
      if (await welcomeBanner.isVisible()) {
        console.log('Welcome banner detected before login, attempting to dismiss...');
        
        const closeButton = this.page.locator('button[aria-label="Close Welcome Banner"]');
        if (await closeButton.isVisible()) {
          console.log('Close button found, clicking it...');
          await closeButton.click({ force: true });
        } else {
          const xButton = this.page.locator('.close-dialog');
          if (await xButton.isVisible()) {
            console.log('X button found, clicking it...');
            await xButton.click({ force: true });
          } else {
            console.log('No close buttons found, clicking outside dialog...');
            await this.page.mouse.click(10, 10);
          }
        }
        
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('Error handling welcome dialog:', error);
    }
    
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    
    if (rememberMe) {
      await this.click(this.rememberMeCheckbox);
    }
    
    // Take screenshot before clicking login button
    await this.page.screenshot({ path: `before-login-click-${Date.now()}.png` });
    
    try {
      await this.loginButton.click({ timeout: 10000 });
    } catch (error) {
      console.log('Error clicking login button, trying force click:', error);
      await this.loginButton.click({ force: true, timeout: 5000 });
    }
    
    await this.page.screenshot({ path: `after-login-attempt-${Date.now()}.png` });
  }

  /**
   * Get the error message
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if the error message is visible
   * @returns True if the error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }
}
