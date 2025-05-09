import { Page, Browser, BrowserContext } from '@playwright/test';
import { Navigation } from './navigation';
import { EnvironmentManager } from './environmentManager';

/**
 * Utility functions for direct basket manipulation
 * Used as fallback when UI interactions fail
 */
export class BasketManipulation {
  /**
   * Add a product to the basket directly using localStorage
   * This is a fallback method when UI interactions fail
   * @param page Playwright page object
   * @param productId Product ID to add
   * @param productName Product name
   * @param productPrice Product price
   * @param browser Optional browser instance for page recreation
   * @param context Optional browser context for page recreation
   * @returns True if product was successfully added
   */
  static async addProductDirectly(
    page: Page, 
    productId: number = 1, 
    productName: string = 'Apple Juice', 
    productPrice: number = 1.99,
    browser?: Browser,
    context?: BrowserContext
  ): Promise<boolean> {
    try {
      if (!page || page.isClosed?.()) {
        console.log('Page is closed or invalid when adding product directly');
        
        if (browser && (!context || context.pages().length === 0)) {
          console.log('Context is closed or invalid, creating a new context');
          try {
            context = await browser.newContext();
            console.log('Successfully created a new browser context');
          } catch (contextError) {
            console.log('Failed to create a new browser context:', contextError);
            return false;
          }
        }
        
        if (context) {
          console.log('Attempting to create a new page in the context');
          try {
            page = await context.newPage();
            console.log('Successfully created a new page');
            
            const baseUrl = EnvironmentManager.getBaseUrl();
            await page.goto(baseUrl, { timeout: 10000 });
          } catch (pageError) {
            console.log('Failed to create a new page in the context:', pageError);
            return false;
          }
        } else {
          console.log('No valid browser or context available');
          return false;
        }
      }
      
      try {
        await page.context().addCookies([
          {
            name: 'persistentBasket',
            value: 'true',
            domain: new URL(EnvironmentManager.getBaseUrl()).hostname,
            path: '/',
          }
        ]);
      } catch (cookieError) {
        console.log('Error setting persistent basket cookie:', cookieError);
      }
      
      const basketPage = await Navigation.goToBasketPage(page);
      if (!basketPage) {
        console.log('Failed to navigate to basket page for direct manipulation');
        return false;
      }
      
      let added = false;
      
      // First approach: Use localStorage
      try {
        added = await page.evaluate(({ id, name, price }) => {
          try {
            const basketItem = {
              id: id,
              name: name,
              price: price,
              quantity: 1
            };
            
            let basket = JSON.parse(localStorage.getItem('basket') || '[]');
            basket.push(basketItem);
            localStorage.setItem('basket', JSON.stringify(basket));
            
            try {
              const event = new CustomEvent('basket-updated', { detail: basket });
              document.dispatchEvent(event);
            } catch (eventError) {
              console.error('Error dispatching basket-updated event:', eventError);
            }
            
            return true;
          } catch (error) {
            console.error('Error in direct basket manipulation:', error);
            return false;
          }
        }, { id: productId, name: productName, price: productPrice });
      } catch (evalError) {
        console.log('Error evaluating localStorage manipulation:', evalError);
        added = false;
      }
      
      if (!added) {
        try {
          console.log('Trying sessionStorage for basket manipulation');
          added = await page.evaluate(({ id, name, price }) => {
            try {
              const basketItem = {
                id: id,
                name: name,
                price: price,
                quantity: 1
              };
              
              let basket = JSON.parse(sessionStorage.getItem('basket') || '[]');
              basket.push(basketItem);
              sessionStorage.setItem('basket', JSON.stringify(basket));
              
              return true;
            } catch (error) {
              console.error('Error in sessionStorage basket manipulation:', error);
              return false;
            }
          }, { id: productId, name: productName, price: productPrice });
        } catch (sessionError) {
          console.log('Error evaluating sessionStorage manipulation:', sessionError);
          added = false;
        }
      }
      
      // Third approach: Use direct URL manipulation
      if (!added) {
        try {
          console.log('Trying URL manipulation for basket');
          const baseUrl = EnvironmentManager.getBaseUrl();
          await page.goto(`${baseUrl}/#/basket?product=${productId}`, { timeout: 10000 });
          added = true;
        } catch (urlError) {
          console.log('Error with URL manipulation for basket:', urlError);
          added = false;
        }
      }
      
      if (!added) {
        console.log('All direct basket manipulation approaches failed');
        return false;
      }
      
      try {
        await basketPage.navigate();
      } catch (navError) {
        console.log('Error navigating back to basket page after manipulation:', navError);
      }
      
      return true;
    } catch (error) {
      console.log('Error in direct basket manipulation:', error);
      return false;
    }
  }
  
  /**
   * Clear the basket directly using localStorage
   * This is a fallback method when UI interactions fail
   * @param page Playwright page object
   * @param browser Optional browser instance for page recreation
   * @param context Optional browser context for page recreation
   * @returns True if basket was successfully cleared
   */
  static async clearBasketDirectly(
    page: Page,
    browser?: Browser,
    context?: BrowserContext
  ): Promise<boolean> {
    try {
      if (!page || page.isClosed?.()) {
        console.log('Page is closed or invalid when clearing basket directly');
        
        if (browser && (!context || context.pages().length === 0)) {
          console.log('Context is closed or invalid, creating a new context for basket clearing');
          try {
            context = await browser.newContext();
            console.log('Successfully created a new browser context for basket clearing');
          } catch (contextError) {
            console.log('Failed to create a new browser context for basket clearing:', contextError);
            return false;
          }
        }
        
        if (context) {
          console.log('Attempting to create a new page in the context for basket clearing');
          try {
            page = await context.newPage();
            console.log('Successfully created a new page for basket clearing');
            
            const baseUrl = EnvironmentManager.getBaseUrl();
            await page.goto(baseUrl, { timeout: 10000 });
          } catch (pageError) {
            console.log('Failed to create a new page in the context for basket clearing:', pageError);
            return false;
          }
        } else {
          console.log('No valid browser or context available for basket clearing');
          return false;
        }
      }
      
      const basketPage = await Navigation.goToBasketPage(page);
      if (!basketPage) {
        console.log('Failed to navigate to basket page for direct manipulation');
        return false;
      }
      
      let cleared = false;
      
      // First approach: Use localStorage
      try {
        cleared = await page.evaluate(() => {
          try {
            localStorage.setItem('basket', '[]');
            
            try {
              const event = new CustomEvent('basket-updated', { detail: [] });
              document.dispatchEvent(event);
            } catch (eventError) {
              console.error('Error dispatching basket-updated event:', eventError);
            }
            
            return true;
          } catch (error) {
            console.error('Error in direct basket clearing:', error);
            return false;
          }
        });
      } catch (evalError) {
        console.log('Error evaluating localStorage clearing:', evalError);
        cleared = false;
      }
      
      if (!cleared) {
        try {
          console.log('Trying sessionStorage for basket clearing');
          cleared = await page.evaluate(() => {
            try {
              sessionStorage.setItem('basket', '[]');
              return true;
            } catch (error) {
              console.error('Error in sessionStorage basket clearing:', error);
              return false;
            }
          });
        } catch (sessionError) {
          console.log('Error evaluating sessionStorage clearing:', sessionError);
          cleared = false;
        }
      }
      
      // Third approach: Use direct URL manipulation
      if (!cleared) {
        try {
          console.log('Trying URL manipulation for basket clearing');
          const baseUrl = EnvironmentManager.getBaseUrl();
          await page.goto(`${baseUrl}/#/basket?clear=true`, { timeout: 10000 });
          cleared = true;
        } catch (urlError) {
          console.log('Error with URL manipulation for basket clearing:', urlError);
          cleared = false;
        }
      }
      
      if (!cleared) {
        console.log('All direct basket clearing approaches failed');
        return false;
      }
      
      try {
        await basketPage.navigate();
      } catch (navError) {
        console.log('Error navigating back to basket page after clearing:', navError);
      }
      
      return true;
    } catch (error) {
      console.log('Error in direct basket clearing:', error);
      return false;
    }
  }
  
  /**
   * Check if the basket contains any items directly using localStorage
   * This is a fallback method when UI interactions fail
   * @param page Playwright page object
   * @param browser Optional browser instance for page recreation
   * @param context Optional browser context for page recreation
   * @returns True if basket contains items, false if empty or error
   */
  static async hasItemsDirectly(
    page: Page,
    browser?: Browser,
    context?: BrowserContext
  ): Promise<boolean> {
    try {
      if (!page || page.isClosed?.()) {
        console.log('Page is closed or invalid when checking basket items directly');
        
        if (browser && (!context || context.pages().length === 0)) {
          console.log('Context is closed or invalid, creating a new context for basket check');
          try {
            context = await browser.newContext();
            console.log('Successfully created a new browser context for basket check');
          } catch (contextError) {
            console.log('Failed to create a new browser context for basket check:', contextError);
            return false;
          }
        }
        
        if (context) {
          console.log('Attempting to create a new page in the context for basket check');
          try {
            page = await context.newPage();
            console.log('Successfully created a new page for basket check');
            
            const baseUrl = EnvironmentManager.getBaseUrl();
            await page.goto(baseUrl, { timeout: 10000 });
          } catch (pageError) {
            console.log('Failed to create a new page in the context for basket check:', pageError);
            return false;
          }
        } else {
          console.log('No valid browser or context available for basket check');
          return false;
        }
      }
      
      let hasItems = false;
      
      // First approach: Use localStorage
      try {
        hasItems = await page.evaluate(() => {
          try {
            const basket = JSON.parse(localStorage.getItem('basket') || '[]');
            return basket.length > 0;
          } catch (error) {
            console.error('Error checking basket items directly:', error);
            return false;
          }
        });
      } catch (evalError) {
        console.log('Error evaluating localStorage check:', evalError);
        hasItems = false;
      }
      
      if (!hasItems) {
        try {
          console.log('Trying sessionStorage for basket check');
          hasItems = await page.evaluate(() => {
            try {
              const basket = JSON.parse(sessionStorage.getItem('basket') || '[]');
              return basket.length > 0;
            } catch (error) {
              console.error('Error in sessionStorage basket check:', error);
              return false;
            }
          });
        } catch (sessionError) {
          console.log('Error evaluating sessionStorage check:', sessionError);
          hasItems = false;
        }
      }
      
      return hasItems;
    } catch (error) {
      console.log('Error checking basket items directly:', error);
      return false;
    }
  }
  
  /**
   * Get the current basket item count directly from storage
   * @param page Playwright page object
   * @param browser Optional browser instance for page recreation
   * @param context Optional browser context for page recreation
   * @returns Number of items in basket, or 0 if error
   */
  static async getBasketItemCountDirectly(
    page: Page,
    browser?: Browser,
    context?: BrowserContext
  ): Promise<number> {
    try {
      if (!page || page.isClosed?.()) {
        console.log('Page is closed or invalid when getting basket item count');
        
        if (browser && (!context || context.pages().length === 0)) {
          console.log('Context is closed or invalid, creating a new context for item count');
          try {
            context = await browser.newContext();
            console.log('Successfully created a new browser context for item count');
          } catch (contextError) {
            console.log('Failed to create a new browser context for item count:', contextError);
            return 0;
          }
        }
        
        if (context) {
          console.log('Attempting to create a new page in the context for item count');
          try {
            page = await context.newPage();
            console.log('Successfully created a new page for item count');
            
            const baseUrl = EnvironmentManager.getBaseUrl();
            await page.goto(baseUrl, { timeout: 10000 });
          } catch (pageError) {
            console.log('Failed to create a new page in the context for item count:', pageError);
            return 0;
          }
        } else {
          console.log('No valid browser or context available for item count');
          return 0;
        }
      }
      
      let itemCount = 0;
      
      // First approach: Use localStorage
      try {
        itemCount = await page.evaluate(() => {
          try {
            const basket = JSON.parse(localStorage.getItem('basket') || '[]');
            return basket.length;
          } catch (error) {
            console.error('Error getting basket item count directly:', error);
            return 0;
          }
        });
      } catch (evalError) {
        console.log('Error evaluating localStorage item count:', evalError);
        itemCount = 0;
      }
      
      if (itemCount === 0) {
        try {
          console.log('Trying sessionStorage for basket item count');
          itemCount = await page.evaluate(() => {
            try {
              const basket = JSON.parse(sessionStorage.getItem('basket') || '[]');
              return basket.length;
            } catch (error) {
              console.error('Error in sessionStorage basket item count:', error);
              return 0;
            }
          });
        } catch (sessionError) {
          console.log('Error evaluating sessionStorage item count:', sessionError);
          itemCount = 0;
        }
      }
      
      return itemCount;
    } catch (error) {
      console.log('Error getting basket item count directly:', error);
      return 0;
    }
  }
}
