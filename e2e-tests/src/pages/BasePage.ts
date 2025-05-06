import { Locator, Page } from '@playwright/test';
import { getCurrentEnvironment } from '../../config/environments';

/**
 * Base page class that all page objects inherit from
 */
export class BasePage {
  /**
   * The Playwright page object
   */
  protected page: Page;

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a page
   * @param path Path to navigate to (will be appended to baseUrl)
   */
  async navigate(path: string = ''): Promise<void> {
    const env = getCurrentEnvironment();
    const url = env.baseUrl + path;
    console.log(`Navigating to: ${url}`);
    
    try {
      await this.page.goto(url, { 
        timeout: 60000,
        waitUntil: 'domcontentloaded' // Less strict than 'load'
      });
      console.log(`Navigation complete, current URL: ${this.page.url()}`);
      
      await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(e => {
        console.log('Navigation did not reach networkidle, continuing anyway');
      });
    } catch (error) {
      console.error(`Navigation to ${url} failed:`, error);
      await this.page.screenshot({ path: `navigation-error-${Date.now()}.png` });
    }
  }

  /**
   * Get the page title
   * @returns The page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for an element to be visible
   * @param locator Element locator
   * @param timeout Timeout in milliseconds
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click an element
   * @param locator Element locator
   */
  async click(locator: Locator): Promise<void> {
    try {
      const overlay = this.page.locator('.cdk-overlay-container');
      if (await overlay.isVisible()) {
        console.log('Overlay detected, attempting to dismiss...');
        
        const closeButton = this.page.locator('button[aria-label="Close Welcome Banner"]');
        if (await closeButton.isVisible()) {
          console.log('Close button found, clicking it...');
          await closeButton.click({ force: true });
        } else {
          console.log('No close button found, clicking outside dialog...');
          await this.page.mouse.click(10, 10);
        }
        
        await this.page.waitForTimeout(1000);
      }
      
      await locator.click({ timeout: 10000 });
    } catch (error) {
      console.log(`Error clicking element: ${error}`);
      
      try {
        await locator.click({ force: true, timeout: 5000 });
        console.log('Force click successful');
      } catch (forceError) {
        console.log(`Force click also failed: ${forceError}`);
        
        try {
          await this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) (element as HTMLElement).click();
          }, locator.toString());
          console.log('JavaScript click attempted');
        } catch (jsError) {
          console.log(`JavaScript click failed: ${jsError}`);
          throw error; // Re-throw the original error
        }
      }
    }
  }

  /**
   * Fill a form field
   * @param locator Element locator
   * @param value Value to fill
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Check if an element is visible
   * @param locator Element locator
   * @returns True if the element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Get text from an element
   * @param locator Element locator
   * @returns The element text
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.innerText();
  }
}
