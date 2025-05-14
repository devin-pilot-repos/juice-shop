import { Page, Locator } from '@playwright/test';
import { StorageService } from './storageService';

/**
 * Helper utilities for tests
 */
export class Helpers {
  /**
   * Wait for a specific amount of time
   * @param ms Time to wait in milliseconds
   * @returns Promise that resolves after the specified time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry an action until it succeeds or times out
   * @param action The action to retry
   * @param maxAttempts Maximum number of attempts
   * @param interval Interval between attempts in milliseconds
   * @returns Promise that resolves with the result of the action
   */
  static async retry<T>(
    action: () => Promise<T>,
    maxAttempts: number = 3,
    interval: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.wait(interval);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if an element contains text
   * @param locator The element locator
   * @param text The text to check for
   * @returns Promise that resolves to true if the element contains the text
   */
  static async elementContainsText(locator: Locator, text: string): Promise<boolean> {
    const elementText = await locator.textContent() || '';
    return elementText.includes(text);
  }

  /**
   * Get all cookies for the current page
   * @param page Playwright page object
   * @returns Promise that resolves with all cookies
   */
  static async getAllCookies(page: Page): Promise<{ name: string; value: string; domain: string; path: string; expires: number; httpOnly: boolean; secure: boolean; sameSite?: string }[]> {
    return await page.context().cookies();
  }

  /**
   * Clear all cookies for the current page
   * @param page Playwright page object
   * @returns Promise that resolves when cookies are cleared
   */
  static async clearAllCookies(page: Page): Promise<void> {
    await page.context().clearCookies();
  }

  /**
   * Get local storage item
   * @param page Playwright page object
   * @param key The key to get
   * @returns Promise that resolves with the value
   */
  static async getLocalStorageItem(page: Page, key: string): Promise<string | null> {
    const storageService = StorageService.getInstance();
    await storageService.initialize(page);
    return await storageService.getItem(key);
  }

  /**
   * Set local storage item
   * @param page Playwright page object
   * @param key The key to set
   * @param value The value to set
   * @returns Promise that resolves when the item is set
   */
  static async setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
    const storageService = StorageService.getInstance();
    await storageService.initialize(page);
    await storageService.setItem(key, value);
  }

  /**
   * Clear local storage
   * @param page Playwright page object
   * @returns Promise that resolves when local storage is cleared
   */
  static async clearLocalStorage(page: Page): Promise<void> {
    const storageService = StorageService.getInstance();
    await storageService.initialize(page);
    await storageService.clear();
  }
}
