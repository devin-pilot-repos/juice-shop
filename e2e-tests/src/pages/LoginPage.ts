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
    
    await this.loginButton.click();
    await this.page.waitForNavigation();
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
