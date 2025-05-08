import { Environment, getCurrentEnvironment } from '@config/environments';
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
        await page.goto(url, { 
          timeout: 30000,
          waitUntil: 'domcontentloaded' 
        });
        
        const title = await page.title();
        console.log(`Successfully connected to ${url} - Page title: ${title}`);
        
        this.setActiveBaseUrl(url);
        connected = true;
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
      await page.evaluate((environment) => {
        localStorage.setItem('environment', environment);
      }, env);
    } catch (error) {
      console.log('Error setting up environment storage:', error);
    }
  }
}
