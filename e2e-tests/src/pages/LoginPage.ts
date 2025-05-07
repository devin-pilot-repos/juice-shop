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
    console.log(`Attempting to login with email: ${email}`);
    
    try {
      await this.page.screenshot({ path: `before-login-${Date.now()}.png` });
      
      await this.dismissOverlays(3, 1000);
      
      await this.emailInput.fill(email);
      console.log('Filled email input');
      
      await this.passwordInput.fill(password);
      console.log('Filled password input');
      
      if (rememberMe) {
        await this.rememberMeCheckbox.check();
        console.log('Checked "Remember Me" checkbox');
      }
      
      await this.dismissOverlays(2, 500);
      
      await this.loginButton.click({ force: true, timeout: 15000 });
      console.log('Clicked login button');
      
      await this.waitForNavigation();
      console.log('Navigation completed after login');
      
      await this.page.screenshot({ path: `after-login-${Date.now()}.png` }).catch(error => {
        console.log('Error taking screenshot after login:', error);
      });
    } catch (error) {
      console.log('Error during login:', error);
      
      try {
        console.log('Trying alternative login approach...');
        await this.emailInput.fill(email, { timeout: 10000 });
        await this.passwordInput.fill(password, { timeout: 10000 });
        
        if (rememberMe) {
          await this.rememberMeCheckbox.check({ timeout: 10000 });
        }
        
        await this.loginButton.click({ force: true, timeout: 15000 });
        await this.waitForNavigation();
        console.log('Alternative login approach succeeded');
      } catch (fallbackError) {
        console.log('Both login approaches failed:', fallbackError);
      }
    }
  }

  /**
   * Get the error message text if login fails
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      await this.page.screenshot({ path: `error-message-${Date.now()}.png` }).catch(error => {
        console.log('Error taking screenshot for error message:', error);
      });
      
      await this.page.waitForSelector('.error', { timeout: 10000 }).catch(error => {
        console.log('Warning: Timeout waiting for error message, continuing anyway:', error);
      });
      
      return await this.getText(this.errorMessage);
    } catch (error) {
      console.log('Error getting error message:', error);
      return 'Error retrieving message';
    }
  }

  /**
   * Check if the login was successful
   * @returns True if login was successful
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.url().includes('/#/search');
  }
}
