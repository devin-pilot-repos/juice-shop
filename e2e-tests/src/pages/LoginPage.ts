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
    this.emailInput = page.locator('input[name="email"], input#email, input[id="email"]').first();
    this.passwordInput = page.locator('input[name="password"], input#password, input[id="password"]').first();
    this.loginButton = page.locator('button[id="loginButton"], #loginButton, button:has-text("Log in")').first();
    this.rememberMeCheckbox = page.locator('mat-checkbox[id="rememberMe"], #rememberMe, input[id="rememberMe-input"]').first();
    this.errorMessage = page.locator('div.error, .error-message, mat-error').first();
  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    await this.page.context().addCookies([
      {
        name: 'welcomebanner_status',
        value: 'dismiss',
        domain: new URL(this.page.url()).hostname || 'demo.owasp-juice.shop',
        path: '/',
      },
      {
        name: 'cookieconsent_status',
        value: 'dismiss',
        domain: new URL(this.page.url()).hostname || 'demo.owasp-juice.shop',
        path: '/',
      }
    ]);
    
    await super.navigate('/#/login');
    
    try {
      await this.page.screenshot({ path: `login-page-navigation-${Date.now()}.png` });
    } catch (error) {
      console.log('Failed to take screenshot during navigation:', error);
    }
    
    try {
      await this.waitForElement(this.emailInput, 15000);
    } catch (error) {
      console.log(`Error waiting for email input: ${error}`);
      
      try {
        const overlay = this.page.locator('.cdk-overlay-container');
        const isOverlayVisible = await overlay.isVisible().catch(() => false);
        
        if (isOverlayVisible) {
          console.log('Overlay detected during navigation, attempting to dismiss...');
          
          const closeButton = this.page.locator('button[aria-label="Close Welcome Banner"]');
          const isCloseButtonVisible = await closeButton.isVisible().catch(() => false);
          
          if (isCloseButtonVisible) {
            console.log('Close button found, clicking it...');
            await closeButton.click({ force: true }).catch(e => {
              console.log(`Error clicking close button: ${e}`);
            });
          } else {
            console.log('No close button found, clicking outside dialog...');
            await this.page.mouse.click(10, 10).catch(e => {
              console.log(`Error clicking outside dialog: ${e}`);
            });
          }
          
          await this.page.waitForTimeout(1000).catch(e => {
            console.log(`Error waiting timeout: ${e}`);
          });
          
          await this.waitForElement(this.emailInput, 10000).catch(e => {
            console.log(`Still couldn't find email input after dismissing overlay: ${e}`);
          });
        }
      } catch (overlayError) {
        console.log(`Error handling overlay: ${overlayError}`);
      }
    }
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
    try {
      await this.page.screenshot({ path: `before-login-click-${Date.now()}.png` });
    } catch (error) {
      console.log('Failed to take screenshot before login click:', error);
    }
    
    try {
      await this.loginButton.click({ timeout: 10000 });
    } catch (error) {
      console.log('Error clicking login button, trying force click:', error);
      await this.loginButton.click({ force: true, timeout: 5000 });
    }
    
    try {
      await this.page.screenshot({ path: `after-login-attempt-${Date.now()}.png` });
    } catch (error) {
      console.log('Failed to take screenshot after login attempt:', error);
    }
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
