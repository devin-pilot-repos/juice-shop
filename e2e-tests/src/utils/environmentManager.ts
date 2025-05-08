import { Environment, getCurrentEnvironment } from '@config/environments';
import { Page } from '@playwright/test';

/**
 * Environment Manager utility for handling environment-specific operations
 */
export class EnvironmentManager {
  private static currentEnvironment: Environment;

  /**
   * Initialize the environment manager
   * @returns The current environment configuration
   */
  static initialize(): Environment {
    this.currentEnvironment = getCurrentEnvironment();
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
   * Get the base URL for the current environment
   * @returns The base URL
   */
  static getBaseUrl(): string {
    return this.getEnvironment().baseUrl;
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
  static async setupEnvironment(page: Page): Promise<void> {
    await page.goto(this.getBaseUrl());
    
    await this.setupEnvironmentStorage(page);
  }

  /**
   * Set up environment-specific storage (cookies, localStorage)
   * @param page Playwright page object
   * @returns Promise that resolves when setup is complete
   */
  private static async setupEnvironmentStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.setItem('language', 'en');
    });
    
    const env = this.getEnvironment().name.toLowerCase();
    await page.evaluate((environment) => {
      localStorage.setItem('environment', environment);
    }, env);
  }
}
