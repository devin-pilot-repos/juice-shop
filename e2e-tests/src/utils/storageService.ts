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

    if (process.env.HEADLESS === 'true') {
      this.headlessMode = true;
      console.log('Detected headless mode from environment variable, using memory storage fallback');
      return;
    }

    if (process.env.CI === 'true') {
      this.headlessMode = true;
      console.log('CI environment detected, using memory storage fallback for safety');
      return;
    }

    try {
      const isHeadlessBrowser = await this.page.evaluate(() => {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('headless') || 
               (ua.includes('chrome') && !(window as any).chrome) ||
               !!navigator.webdriver;
      }).catch(() => true); // Default to headless if evaluation fails
      
      if (isHeadlessBrowser) {
        this.headlessMode = true;
        console.log('Headless browser detected via user agent, using memory storage fallback');
        return;
      }
      
      try {
        const hasLocalStorage = await this.page.evaluate(() => {
          try {
            return typeof window.localStorage !== 'undefined';
          } catch (e) {
            return false;
          }
        });
        
        if (!hasLocalStorage) {
          this.headlessMode = true;
          console.log('localStorage not available, using memory storage fallback');
          return;
        }
        
        const canUseLocalStorage = await this.page.evaluate(() => {
          try {
            const testKey = '__storage_test__';
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
          } catch (e) {
            return false;
          }
        });
        
        this.headlessMode = !canUseLocalStorage;
        
        if (this.headlessMode) {
          console.log('localStorage access denied, using memory storage fallback');
        } else {
          console.log('Browser is running in non-headless mode, using real localStorage');
        }
      } catch (innerError) {
        this.headlessMode = true;
        console.log('Error testing localStorage access, using memory storage fallback:', innerError);
      }
    } catch (error) {
      this.headlessMode = true;
      console.log('Error detecting browser environment, using memory storage fallback:', error);
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
