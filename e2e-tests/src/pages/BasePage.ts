import { Page, Locator } from '@playwright/test';
import { EnvironmentManager } from '../utils/environmentManager';

/**
 * Base Page Object class that all page objects should extend
 */
export class BasePage {
  /**
   * Constructor for the BasePage
   * @param page Playwright page object
   */
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL path
   * @param path The path to navigate to (will be appended to the base URL)
   * @param retries Number of retries if navigation fails
   */
  async navigate(path: string = '', retries: number = 2): Promise<boolean> {
    const baseUrl = EnvironmentManager.getBaseUrl();
    const url = new URL(path, baseUrl).toString();
    
    let success = false;
    let attempts = 0;
    
    while (!success && attempts <= retries) {
      try {
        console.log(`Navigating to ${url} (attempt ${attempts + 1}/${retries + 1})`);
        await this.page.goto(url, { 
          timeout: 30000,
          waitUntil: 'domcontentloaded'
        });
        success = true;
      } catch (error) {
        console.log(`Navigation error (attempt ${attempts + 1}/${retries + 1}):`, error);
        
        if (attempts === retries) {
          console.log('All retries failed, attempting to use fallback URLs...');
          success = await EnvironmentManager.setupEnvironment(this.page);
          
          if (success && path) {
            const newBaseUrl = EnvironmentManager.getBaseUrl();
            const newUrl = new URL(path, newBaseUrl).toString();
            
            try {
              console.log(`Navigating to ${newUrl} with fallback URL`);
              await this.page.goto(newUrl, { 
                timeout: 30000,
                waitUntil: 'domcontentloaded'
              });
            } catch (pathError) {
              console.log(`Failed to navigate to path with fallback URL:`, pathError);
              success = false;
            }
          }
        }
        
        attempts++;
      }
    }
    
    return success;
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('networkidle', { timeout: 10000 }),
      this.page.waitForLoadState('domcontentloaded', { timeout: 5000 })
    ]).catch(error => {
      console.log('Navigation wait error (continuing anyway):', error);
    });
    
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the page title
   * @returns The page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if an element is visible
   * @param locator The element locator
   * @returns True if the element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Wait for an element to be visible
   * @param locator The element locator
   * @param timeout Optional timeout in milliseconds
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click on an element
   * @param locator The element locator
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Fill a form field
   * @param locator The form field locator
   * @param value The value to fill
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Get text from an element
   * @param locator The element locator
   * @returns The element text
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Take a screenshot
   * @param name Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Dismiss any overlays or dialogs that might be blocking UI interactions
   * This handles welcome banners, cookie notices, and other modal dialogs
   * @param maxAttempts Maximum number of attempts to dismiss overlays
   * @param timeout Timeout between attempts in milliseconds
   */
  async dismissOverlays(maxAttempts: number = 3, timeout: number = 500): Promise<boolean> {
    let dismissed = false;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const overlay = this.page.locator('.cdk-overlay-container');
        
        if (await overlay.isVisible()) {
          console.log(`Overlay detected (attempt ${attempt + 1}), attempting to dismiss...`);
          
          const closeButtons = [
            this.page.locator('button[aria-label="Close Welcome Banner"]'),
            this.page.locator('.close-dialog'),
            this.page.locator('button.mat-dialog-close'),
            this.page.locator('button[aria-label="Close"]')
          ];
          
          let buttonClicked = false;
          for (const button of closeButtons) {
            if (await button.isVisible()) {
              console.log('Close button found, clicking it...');
              await button.click({ force: true });
              buttonClicked = true;
              break;
            }
          }
          
          if (!buttonClicked) {
            console.log('No close buttons found, clicking outside dialog...');
            await this.page.mouse.click(10, 10);
          }
          
          await this.page.waitForTimeout(timeout);
          dismissed = true;
        } else {
          return true;
        }
      } catch (error) {
        console.log(`Error dismissing overlay (attempt ${attempt + 1}):`, error);
      }
    }
    
    return dismissed;
  }
}
