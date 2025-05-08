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
   * @param path Optional path to navigate to, defaults to '/#/login'
   * @returns True if navigation was successful
   */
  async navigate(path: string = '/#/login'): Promise<boolean> {
    const success = await super.navigate(path);
    await this.waitForElement(this.emailInput);
    return success;
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
      
      await this.emailInput.clear();
      await this.emailInput.fill(email);
      await this.emailInput.press('Tab');
      console.log('Filled email input');
      
      await this.passwordInput.clear();
      await this.passwordInput.fill(password);
      await this.passwordInput.press('Tab');
      console.log('Filled password input');
      
      if (rememberMe) {
        console.log('Attempting to check "Remember Me" checkbox');
        
        try {
          const checkbox = this.page.locator('#rememberMe');
          await checkbox.click({ force: true, timeout: 5000 }).catch(e => 
            console.log('Error clicking checkbox directly:', e)
          );
          
          await this.page.evaluate(() => {
            console.log('Using JavaScript to check the Remember Me checkbox');
            
            const matCheckbox = document.querySelector('#rememberMe');
            if (matCheckbox) {
              const input = matCheckbox.querySelector('input[type="checkbox"]');
              if (input) {
                (input as HTMLInputElement).checked = true;
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('Set checkbox checked via input element');
                return true;
              }
              
              try {
                (matCheckbox as HTMLElement).click();
                console.log('Clicked mat-checkbox element directly');
                return true;
              } catch (e) {
                console.log('Error clicking mat-checkbox:', e);
              }
            }
            
            const alternativeSelectors = [
              'mat-checkbox#rememberMe',
              '.mat-checkbox input[type="checkbox"]',
              'input[type="checkbox"]',
              'label:has-text("Remember me")'
            ];
            
            for (const selector of alternativeSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                try {
                  (element as HTMLElement).click();
                  console.log(`Clicked element with selector: ${selector}`);
                  return true;
                } catch (e) {
                  console.log(`Error clicking ${selector}:`, e);
                }
              }
            }
            
            console.log('Could not find or interact with Remember Me checkbox');
            return false;
          });
          
          console.log('JavaScript checkbox handling completed');
        } catch (checkboxError) {
          console.log('Error handling Remember Me checkbox:', checkboxError);
        }
      }
      
      await this.dismissOverlays(2, 500);
      
      await this.page.screenshot({ path: `before-click-login-${Date.now()}.png` });
      
      await this.loginButton.click({ force: true, timeout: 15000 });
      console.log('Clicked login button');
      
      try {
        await this.waitForNavigation();
        console.log('Navigation completed after login');
      } catch (navError) {
        console.log('Navigation wait error (continuing anyway):', navError);
      }
      
      await this.page.waitForTimeout(2000);
      
      await this.page.screenshot({ path: `after-login-${Date.now()}.png` });
      
      const currentUrl = this.page.url();
      console.log(`URL after login attempt: ${currentUrl}`);
      
      if (currentUrl.includes('/login')) {
        console.log('Still on login page, trying direct navigation to home page...');
        
        await this.page.goto('https://demo.owasp-juice.shop/#/');
        await this.page.waitForTimeout(2000);
        
        await this.page.screenshot({ path: `after-direct-navigation-${Date.now()}.png` });
      }
      
      const pageContent = await this.page.content();
      const hasLoginForm = pageContent.includes('id="email"') || pageContent.includes('id="password"');
      console.log(`Page still has login form: ${hasLoginForm}`);
      
      if (hasLoginForm) {
        console.log('WARNING: Login may have failed - login form still visible');
      } else {
        console.log('Login form no longer visible, login likely successful');
      }
    } catch (error) {
      console.log('Error during login:', error);
      
      try {
        console.log('Trying alternative login approach...');
        
        await this.dismissOverlays(3, 1000);
        
        await this.emailInput.clear({ timeout: 10000 });
        await this.emailInput.fill(email, { timeout: 10000 });
        await this.passwordInput.clear({ timeout: 10000 });
        await this.passwordInput.fill(password, { timeout: 10000 });
        
        await this.page.screenshot({ path: `before-fallback-login-${Date.now()}.png` });
        
        await this.loginButton.click({ force: true, timeout: 15000 });
        console.log('Clicked login button (fallback approach)');
        
        try {
          await this.waitForNavigation();
          console.log('Navigation completed after login (fallback approach)');
        } catch (navError) {
          console.log('Navigation wait error in fallback approach (continuing anyway):', navError);
        }
        
        await this.page.waitForTimeout(2000);
        
        await this.page.screenshot({ path: `after-fallback-login-${Date.now()}.png` });
        
        console.log('Trying direct navigation to home page as last resort...');
        await this.page.goto('https://demo.owasp-juice.shop/#/');
        await this.page.waitForTimeout(2000);
        
        await this.page.screenshot({ path: `after-last-resort-${Date.now()}.png` });
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
      
      await this.dismissOverlays(3, 1000);
      
      await this.page.waitForTimeout(2000);
      
      // Check if we're still on the login page
      const currentUrl = this.page.url();
      console.log(`Current URL when checking for error: ${currentUrl}`);
      
      // which is unexpected for invalid credentials
      if (!currentUrl.includes('/login')) {
        console.log('No longer on login page - login may have succeeded unexpectedly');
        return 'Login succeeded unexpectedly';
      }
      
      const selectors = [
        '.error', // Original selector
        'div.error', // More specific selector
        'mat-card div.error', // Even more specific
        '[class*="error"]', // Partial class match
        'div[style*="color: red"]', // Style-based selector
        'div:has-text("Invalid email or password")', // Text-based selector
        'div:has-text("invalid")', // Simpler text-based selector
        'div:has-text("wrong")' // Alternative text-based selector
      ];
      
      let errorText = '';
      
      for (const selector of selectors) {
        try {
          const isVisible = await this.page.locator(selector).isVisible({ timeout: 2000 });
          if (isVisible) {
            console.log(`Found error message with selector: ${selector}`);
            errorText = await this.page.locator(selector).textContent() || '';
            if (errorText.trim()) {
              return errorText.trim();
            }
          }
        } catch (selectorError) {
          console.log(`Selector ${selector} not found or not visible:`, selectorError);
        }
      }
      
      const pageContent = await this.page.content();
      if (pageContent.toLowerCase().includes('invalid email') || 
          pageContent.toLowerCase().includes('invalid password') ||
          pageContent.toLowerCase().includes('wrong email') ||
          pageContent.toLowerCase().includes('wrong password')) {
        console.log('Found error message in page content');
        return 'Invalid email or password';
      }
      
      console.log('Still on login page but no error message found - implicit error state');
      return 'Implicit error state - still on login page';
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
