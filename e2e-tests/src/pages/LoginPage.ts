import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Login page
 */
export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly errorMessage: Locator;

  /**
   * Constructor for the LoginPage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#loginButton');
    this.rememberMeCheckbox = page.locator('#rememberMe');
    this.errorMessage = page.locator('.error');
  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    await super.navigate('/#/login');
    await this.waitForElement(this.emailInput);
  }

  /**
   * Login with the provided credentials
   * @param email User email
   * @param password User password
   * @param rememberMe Whether to check the "Remember Me" checkbox
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    try {
      const overlay = this.page.locator('.cdk-overlay-container');
      if (await overlay.isVisible()) {
        const dismissButton = overlay.locator('button[aria-label="Close Welcome Banner"]');
        if (await dismissButton.isVisible()) {
          await dismissButton.click();
          await this.page.waitForTimeout(500); // Wait for overlay to disappear
        } else {
          await this.page.mouse.click(10, 10);
          await this.page.waitForTimeout(500);
        }
      }
    } catch (error) {
      console.log('No overlay found or error dismissing overlay:', error);
    }
    
    try {
      await this.loginButton.click({ force: true });
    } catch (error) {
      console.log('Force click failed, trying regular click:', error);
      await this.loginButton.click();
    }
    
    await this.page.waitForNavigation({ timeout: 60000 }).catch(() => {
      console.log('Navigation timeout, continuing test...');
    });
  }

  /**
   * Get the error message text if login fails
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if the login was successful
   * @returns True if login was successful
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.url().includes('/#/search');
  }
}
