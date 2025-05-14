import { Environment, getCurrentEnvironment } from '../../config/environments';
import { Page } from '@playwright/test';

/**
 * Environment Manager utility for handling environment-specific operations
 */
export class EnvironmentManager {
  private static currentEnvironment: Environment;
  private static activeBaseUrl: string;

  /**
   * Initialize the environment manager
   * @returns The current environment configuration
   */
  static initialize(): Environment {
    this.currentEnvironment = getCurrentEnvironment();
    this.activeBaseUrl = this.currentEnvironment.baseUrl;
    return this.currentEnvironment;
  }

  /**
   * Get the current environment configuration
   * @returns The current environment configuration
   */
  static getEnvironment(): Environment {
    if (!this.currentEnvironment) {
      return this.initialize();
    }
    return this.currentEnvironment;
  }

  /**
   * Get the active base URL for the current environment
   * This may be the primary URL or a fallback URL if the primary failed
   * @returns The active base URL
   */
  static getBaseUrl(): string {
    if (!this.activeBaseUrl) {
      this.activeBaseUrl = this.getEnvironment().baseUrl;
    }
    return this.activeBaseUrl;
  }
  
  /**
   * Check if the current environment is using the demo site
   * @returns boolean indicating if we're using the demo site
   */
  static isDemoSite(): boolean {
    const baseUrl = this.getBaseUrl();
    return baseUrl.includes('demo.owasp-juice.shop');
  }
  
  /**
   * Check if the current environment is using localhost
   * @returns boolean indicating if we're using localhost
   */
  static isLocalEnvironment(): boolean {
    const baseUrl = this.getBaseUrl();
    return baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  }

  /**
   * Set the active base URL
   * @param url The URL to set as active
   */
  static setActiveBaseUrl(url: string): void {
    this.activeBaseUrl = url;
    console.log(`Switched to base URL: ${url}`);
  }

  /**
   * Get all available URLs for the current environment (primary + fallbacks)
   * @returns Array of URLs
   */
  static getAllUrls(): string[] {
    const env = this.getEnvironment();
    const urls = [env.baseUrl];
    
    if (env.fallbackUrls && env.fallbackUrls.length > 0) {
      urls.push(...env.fallbackUrls);
    }
    
    return urls;
  }

  /**
   * Get admin credentials for the current environment
   * @returns Admin credentials
   */
  static getAdminCredentials(): { email: string; password: string } {
    return this.getEnvironment().credentials.admin;
  }

  /**
   * Get customer credentials for the current environment
   * @returns Customer credentials
   */
  static getCustomerCredentials(): { email: string; password: string } {
    return this.getEnvironment().credentials.customer;
  }

  /**
   * Set up the environment for a test
   * @param page Playwright page object
   * @returns Promise that resolves when setup is complete
   */
  static async setupEnvironment(page: Page): Promise<boolean> {
    const urls = this.getAllUrls();
    let connected = false;
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        console.log(`Attempting to connect to: ${url}`);
        
        const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
        if (isLocalhost) {
          console.log('Localhost environment detected - using special handling');
          
          await page.evaluate(() => {
            localStorage.setItem('continueCode', 'yesplease');
            localStorage.setItem('welcomebanner_status', 'dismiss');
            localStorage.setItem('cookieconsent_status', 'dismiss');
          }).catch(error => console.log('Error setting up localStorage before navigation:', error));
        }
        
        await page.goto(url, { 
          timeout: process.env.CI === 'true' ? 60000 : 30000, // 60 seconds for CI, 30 seconds for local
          waitUntil: 'domcontentloaded' 
        });
        
        const title = await page.title();
        console.log(`Successfully connected to ${url} - Page title: ${title}`);
        
        this.setActiveBaseUrl(url);
        connected = true;
        
        if (isLocalhost) {
          await this.setupLocalhostEnvironment(page);
        }
        
        break;
      } catch (error) {
        console.log(`Failed to connect to ${url}: ${error}`);
        
        if (i === urls.length - 1) {
          console.log('All URLs failed to connect');
        }
      }
    }
    
    if (connected) {
      await this.setupEnvironmentStorage(page);
    }
    
    return connected;
  }
  
  /**
   * Set up localhost-specific environment settings
   * @param page Playwright page object
   * @returns Promise that resolves when setup is complete
   */
  private static async setupLocalhostEnvironment(page: Page): Promise<void> {
    try {
      console.log('Setting up localhost environment');
      
      await page.evaluate(() => {
        localStorage.setItem('continueCode', 'yesplease');
        localStorage.setItem('welcomebanner_status', 'dismiss');
        localStorage.setItem('cookieconsent_status', 'dismiss');
        
        localStorage.setItem('testMode', 'true');
        localStorage.setItem('bypassSecurityPrompts', 'true');
        
        const dummyToken = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          bid: 123,
          umail: 'test@example.com'
        };
        
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', JSON.stringify(dummyToken));
          console.log('Set dummy auth token in localStorage');
        }
      });
      
      try {
        const dismissSelectors = [
          'button:has-text("Dismiss")', 
          'button:has-text("Close")', 
          'button:has-text("Accept")',
          'button:has-text("OK")',
          'button:has-text("I agree")',
          'button.close',
          '.close-dialog',
          '.dismiss-button'
        ];
        
        for (const selector of dismissSelectors) {
          const button = page.locator(selector);
          const isVisible = await button.isVisible().catch(() => false);
          if (isVisible) {
            await button.click().catch(() => {});
            console.log(`Clicked dismiss button with selector: ${selector}`);
            await page.waitForTimeout(500);
          }
        }
      } catch (dismissError) {
        console.log('Error dismissing dialogs:', dismissError);
      }
      
      console.log('Localhost environment setup complete');
    } catch (error) {
      console.log('Error setting up localhost environment:', error);
    }
  }

  /**
   * Set up environment-specific storage (cookies, localStorage)
   * @param page Playwright page object
   * @returns Promise that resolves when setup is complete
   */
  private static async setupEnvironmentStorage(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        localStorage.setItem('language', 'en');
      });
      
      const env = this.getEnvironment().name.toLowerCase();
      await page.evaluate((environment: string) => {
        localStorage.setItem('environment', environment);
      }, env);
      
      if (this.isLocalEnvironment()) {
        await page.evaluate(() => {
          localStorage.setItem('testMode', 'true');
        });
      }
    } catch (error) {
      console.log('Error setting up environment storage:', error);
    }
  }
}
