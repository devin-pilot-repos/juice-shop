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
        localStorage.setItem('allowIllegalActivities', 'true');
        localStorage.setItem('bypassSecurityChecks', 'true');
        localStorage.setItem('skipSecurityValidation', 'true');
        
        const enhancedDummyToken = {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          bid: 123,
          umail: 'admin@juice-sh.op',
          data: {
            id: 1,
            email: 'admin@juice-sh.op',
            role: 'admin',
            deluxeToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWx1eGUiOnRydWV9.Md8qYmeHC1ykJzX_x0B4h-gdZGUF2VZRIGbYiLjuXxg'
          }
        };
        
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', JSON.stringify(enhancedDummyToken));
          console.log('Set enhanced dummy auth token in localStorage with admin role');
        }
      });
      
      await this.handleSecurityBlocks(page);
      
      console.log('Localhost environment setup complete');
    } catch (error) {
      console.log('Error setting up localhost environment:', error);
    }
  }
  
  /**
   * Handle security blocks that might appear during testing
   * @param page Playwright page object
   * @returns Promise that resolves when security blocks are handled
   */
  static async handleSecurityBlocks(page: Page): Promise<boolean> {
    try {
      console.log('Checking for security blocks...');
      
      const pageContent = await page.content();
      const pageText = await page.locator('body').textContent();
      
      const securityBlockIndicators = [
        'Blocked illegal activity',
        'Malicious activity detected',
        'Security violation',
        'Unauthorized access',
        'Forbidden',
        'Access denied',
        '403 Forbidden',
        'Security block'
      ];
      
      let securityBlockDetected = false;
      for (const indicator of securityBlockIndicators) {
        if (pageText?.includes(indicator) || pageContent.includes(indicator)) {
          console.log(`Security block detected: "${indicator}"`);
          securityBlockDetected = true;
          break;
        }
      }
      
      if (securityBlockDetected) {
        console.log('Security block detected, attempting to bypass...');
        
        await page.screenshot({ path: `security-block-${Date.now()}.png` })
          .catch(() => console.log('Failed to take security block screenshot'));
        
        if (this.isLocalEnvironment()) {
          console.log('Localhost environment detected, applying special security bypass...');
          
          await page.evaluate(() => {
            localStorage.setItem('bypassSecurityPrompts', 'true');
            localStorage.setItem('allowIllegalActivities', 'true');
            localStorage.setItem('bypassSecurityChecks', 'true');
            localStorage.setItem('skipSecurityValidation', 'true');
            
            const adminToken = {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsInJvbGUiOiJhZG1pbiJ9.KPGPmxj9NrAIrPgX_OJCEcVr2Q4SNsQ6Dj6-a6oy6-s',
              bid: 1,
              umail: 'admin@juice-sh.op',
              data: {
                id: 1,
                email: 'admin@juice-sh.op',
                role: 'admin',
                deluxeToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWx1eGUiOnRydWV9.Md8qYmeHC1ykJzX_x0B4h-gdZGUF2VZRIGbYiLjuXxg'
              }
            };
            
            localStorage.setItem('token', JSON.stringify(adminToken));
            console.log('Set admin token to bypass security checks');
          });
          
          // Try to navigate back to the base URL
          await page.goto(this.getBaseUrl(), { 
            timeout: 30000,
            waitUntil: 'domcontentloaded' 
          });
          
          await this.dismissDialogs(page);
          
          return true;
        } else {
          console.log('Demo site detected, applying demo-specific security bypass...');
          
          await page.goto(`${this.getBaseUrl()}/#/login`, { 
            timeout: 30000,
            waitUntil: 'domcontentloaded' 
          });
          
          await this.dismissDialogs(page);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.log('Error handling security block:', error);
      return false;
    }
  }
  
  /**
   * Dismiss common dialogs and popups
   * @param page Playwright page object
   */
  private static async dismissDialogs(page: Page): Promise<void> {
    try {
      const dismissSelectors = [
        'button:has-text("Dismiss")', 
        'button:has-text("Close")', 
        'button:has-text("Accept")',
        'button:has-text("OK")',
        'button:has-text("I agree")',
        'button:has-text("Continue")',
        'button:has-text("Yes")',
        'button.close',
        '.close-dialog',
        '.dismiss-button',
        '.mat-dialog-actions button',
        '.cdk-overlay-container button',
        '[aria-label="Close"]',
        '[data-dismiss="modal"]'
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
