import { Page } from '@playwright/test';

/**
 * StorageService provides a consistent interface for accessing localStorage
 * that works in both headless and non-headless browser environments.
 * 
 * It automatically detects headless mode and uses an in-memory Map as a fallback
 * when localStorage isn't accessible.
 */
export class StorageService {
  private static instance: StorageService;
  private page: Page | null = null;
  private inMemoryStorage: Map<string, string> = new Map();
  private isHeadless: boolean = false;
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of StorageService
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize the StorageService with a Playwright page
   * @param page Playwright page object
   */
  public async initialize(page: Page): Promise<void> {
    this.page = page;
    this.isHeadless = await this.detectHeadlessMode();
    this.initialized = true;
    console.log(`StorageService initialized. Headless mode: ${this.isHeadless}`);
  }

  /**
   * Detect if the browser is running in headless mode
   * @returns true if headless, false otherwise
   */
  private async detectHeadlessMode(): Promise<boolean> {
    if (process.env.HEADLESS === 'true' || process.env.CI === 'true') {
      console.log('Headless mode detected via environment variables');
      return true;
    }

    if (!this.page) {
      console.log('No page available, assuming non-headless mode');
      return false;
    }

    try {
      const hasLocalStorage = await this.page.evaluate(() => {
        try {
          return typeof window.localStorage !== 'undefined';
        } catch (e) {
          console.log('Error checking localStorage:', e);
          return false;
        }
      }).catch(e => {
        console.log('Error in evaluate call:', e);
        return false;
      });

      if (!hasLocalStorage) {
        console.log('localStorage not available, assuming headless mode');
        return true;
      }

      const isHeadless = await this.page.evaluate(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const hasHeadlessIndicators = 
          userAgent.includes('headless') || 
          userAgent.includes('phantomjs') || 
          userAgent.includes('selenium');
          
        const hasWebDriver = navigator.webdriver;
        
        return hasHeadlessIndicators || hasWebDriver;
      }).catch(e => {
        console.log('Error in headless detection:', e);
        return true; // Assume headless on error
      });

      console.log(`Headless detection result: ${isHeadless}`);
      return isHeadless;
    } catch (error) {
      console.log('Error in detectHeadlessMode:', error);
      return true; // Assume headless on error
    }
  }

  /**
   * Get an item from storage
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  public async getItem(key: string): Promise<string | null> {
    if (!this.initialized) {
      console.warn('StorageService not initialized. Call initialize() first.');
      return null;
    }

    try {
      if (this.isHeadless) {
        return this.inMemoryStorage.get(key) || null;
      }

      if (!this.page) {
        console.warn('Page not available for localStorage access');
        return null;
      }

      return await this.page.evaluate((k) => {
        try {
          return window.localStorage.getItem(k);
        } catch (e) {
          console.log(`Error getting item ${k} from localStorage:`, e);
          return null;
        }
      }, key).catch(e => {
        console.log(`Error in getItem for key ${key}:`, e);
        return this.inMemoryStorage.get(key) || null;
      });
    } catch (error) {
      console.log(`Error in getItem for key ${key}:`, error);
      return this.inMemoryStorage.get(key) || null;
    }
  }

  /**
   * Set an item in storage
   * @param key The key to store
   * @param value The value to store
   */
  public async setItem(key: string, value: string): Promise<void> {
    if (!this.initialized) {
      console.warn('StorageService not initialized. Call initialize() first.');
      return;
    }

    this.inMemoryStorage.set(key, value);

    if (this.isHeadless) {
      return;
    }

    try {
      if (!this.page) {
        console.warn('Page not available for localStorage access');
        return;
      }

      await this.page.evaluate(({ k, v }) => {
        try {
          window.localStorage.setItem(k, v);
        } catch (e) {
          console.log(`Error setting item ${k} in localStorage:`, e);
        }
      }, { k: key, v: value }).catch(e => {
        console.log(`Error in setItem for key ${key}:`, e);
      });
    } catch (error) {
      console.log(`Error in setItem for key ${key}:`, error);
    }
  }

  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  public async removeItem(key: string): Promise<void> {
    if (!this.initialized) {
      console.warn('StorageService not initialized. Call initialize() first.');
      return;
    }

    this.inMemoryStorage.delete(key);

    if (this.isHeadless) {
      return;
    }

    try {
      if (!this.page) {
        console.warn('Page not available for localStorage access');
        return;
      }

      await this.page.evaluate((k) => {
        try {
          window.localStorage.removeItem(k);
        } catch (e) {
          console.log(`Error removing item ${k} from localStorage:`, e);
        }
      }, key).catch(e => {
        console.log(`Error in removeItem for key ${key}:`, e);
      });
    } catch (error) {
      console.log(`Error in removeItem for key ${key}:`, error);
    }
  }

  /**
   * Clear all items from storage
   */
  public async clear(): Promise<void> {
    if (!this.initialized) {
      console.warn('StorageService not initialized. Call initialize() first.');
      return;
    }

    this.inMemoryStorage.clear();

    if (this.isHeadless) {
      return;
    }

    try {
      if (!this.page) {
        console.warn('Page not available for localStorage access');
        return;
      }

      await this.page.evaluate(() => {
        try {
          window.localStorage.clear();
        } catch (e) {
          console.log('Error clearing localStorage:', e);
        }
      }).catch(e => {
        console.log('Error in clear:', e);
      });
    } catch (error) {
      console.log('Error in clear:', error);
    }
  }

  /**
   * Set multiple items in storage at once
   * @param items Object with key-value pairs to store
   */
  public async setItems(items: Record<string, string>): Promise<void> {
    if (!this.initialized) {
      console.warn('StorageService not initialized. Call initialize() first.');
      return;
    }

    for (const [key, value] of Object.entries(items)) {
      await this.setItem(key, value);
    }
  }
}
