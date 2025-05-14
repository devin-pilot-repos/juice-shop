import { Page } from '@playwright/test';

/**
 * Storage Service to handle localStorage operations with fallbacks for headless mode
 */
export class StorageService {
  private static instance: StorageService;
  private memoryStorage: Map<string, string> = new Map();
  private headlessMode: boolean = false;
  private page: Page | null = null;

  /**
   * Get singleton instance
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize the storage service with a page context
   */
  public async initialize(page: Page): Promise<void> {
    this.page = page;
    await this.detectHeadlessMode();
  }

  /**
   * Detect if browser is running in headless mode
   */
  private async detectHeadlessMode(): Promise<void> {
    if (!this.page) return;

    if (process.env.HEADLESS === 'true' || process.env.CI === 'true') {
      this.headlessMode = true;
      console.log('Detected headless mode from environment variables, using memory storage fallback');
      return;
    }

    try {
      const isSecureContext = await this.page.evaluate(() => {
        return window.isSecureContext;
      }).catch(() => false);

      if (!isSecureContext) {
        console.log('Not in a secure context, using memory storage fallback');
        this.headlessMode = true;
        return;
      }

      const isHeadless = await this.page.evaluate(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const hasHeadlessIndicators = 
          userAgent.includes('headless') || 
          navigator.webdriver || 
          !navigator.plugins.length || 
          !navigator.languages || 
          !navigator.languages.length;
        
        return hasHeadlessIndicators;
      }).catch(() => true);

      if (isHeadless) {
        console.log('Detected headless browser characteristics, using memory storage fallback');
        this.headlessMode = true;
        return;
      }

      const canAccessStorage = await this.page.evaluate(() => {
        try {
          localStorage.setItem('__storage_test__', 'test');
          localStorage.removeItem('__storage_test__');
          return true;
        } catch (e) {
          console.error('Cannot access localStorage:', e);
          return false;
        }
      }).catch((error) => {
        console.error('Error evaluating localStorage access:', error);
        return false;
      });

      if (canAccessStorage) {
        console.log('Browser can access localStorage, using real localStorage');
        this.headlessMode = false;
      } else {
        console.log('Browser cannot access localStorage, using memory storage fallback');
        this.headlessMode = true;
      }
    } catch (error) {
      console.log('Error testing localStorage access, using memory storage fallback:', error);
      this.headlessMode = true;
    }
  }

  /**
   * Set an item in storage
   */
  public async setItem(key: string, value: string): Promise<void> {
    if (!this.page) {
      console.log('Page not initialized, using memory storage');
      this.memoryStorage.set(key, value);
      return;
    }

    if (this.headlessMode) {
      this.memoryStorage.set(key, value);
      return;
    }

    try {
      await this.page.evaluate(({ key, value }) => {
        localStorage.setItem(key, value);
      }, { key, value });
    } catch (error) {
      console.log(`Error setting item in localStorage: ${error}. Using memory storage fallback.`);
      this.memoryStorage.set(key, value);
    }
  }

  /**
   * Get an item from storage
   */
  public async getItem(key: string): Promise<string | null> {
    if (!this.page) {
      console.log('Page not initialized, using memory storage');
      return this.memoryStorage.get(key) || null;
    }

    if (this.headlessMode) {
      return this.memoryStorage.get(key) || null;
    }

    try {
      return await this.page.evaluate((key) => {
        return localStorage.getItem(key);
      }, key);
    } catch (error) {
      console.log(`Error getting item from localStorage: ${error}. Using memory storage fallback.`);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Remove an item from storage
   */
  public async removeItem(key: string): Promise<void> {
    if (!this.page) {
      console.log('Page not initialized, using memory storage');
      this.memoryStorage.delete(key);
      return;
    }

    if (this.headlessMode) {
      this.memoryStorage.delete(key);
      return;
    }

    try {
      await this.page.evaluate((key) => {
        localStorage.removeItem(key);
      }, key);
    } catch (error) {
      console.log(`Error removing item from localStorage: ${error}. Using memory storage fallback.`);
      this.memoryStorage.delete(key);
    }
  }

  /**
   * Clear all storage
   */
  public async clear(): Promise<void> {
    if (!this.page) {
      console.log('Page not initialized, using memory storage');
      this.memoryStorage.clear();
      return;
    }

    if (this.headlessMode) {
      this.memoryStorage.clear();
      return;
    }

    try {
      await this.page.evaluate(() => {
        localStorage.clear();
      });
    } catch (error) {
      console.log(`Error clearing localStorage: ${error}. Using memory storage fallback.`);
      this.memoryStorage.clear();
    }
  }

  /**
   * Set multiple items at once
   */
  public async setItems(items: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      await this.setItem(key, value);
    }
  }

  /**
   * Get all storage keys
   */
  public async getKeys(): Promise<string[]> {
    if (!this.page) {
      console.log('Page not initialized, using memory storage');
      return Array.from(this.memoryStorage.keys());
    }

    if (this.headlessMode) {
      return Array.from(this.memoryStorage.keys());
    }

    try {
      return await this.page.evaluate(() => {
        return Object.keys(localStorage);
      });
    } catch (error) {
      console.log(`Error getting keys from localStorage: ${error}. Using memory storage fallback.`);
      return Array.from(this.memoryStorage.keys());
    }
  }
}
