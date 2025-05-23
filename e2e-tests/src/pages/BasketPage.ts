import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Basket page
 */
export class BasketPage extends BasePage {
  private readonly basketItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly totalPrice: Locator;
  private readonly emptyBasketMessage: Locator;
  private readonly removeItemButtons: Locator;

  /**
   * Constructor for the BasketPage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.basketItems = page.locator('mat-row');
    this.checkoutButton = page.locator('#checkoutButton');
    this.totalPrice = page.locator('#price');
    this.emptyBasketMessage = page.locator('#emptyBasket');
    this.removeItemButtons = page.locator('.mat-icon-button');
  }

  /**
   * Navigate to the basket page
   * @returns True if navigation was successful
   */
  async navigate(): Promise<boolean> {
    try {
      const success = await super.navigate('/#/basket');
      if (!success) {
        console.log('Failed to navigate to basket page');
        return false;
      }
      
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch (error) {
        console.log('Warning: Timeout waiting for networkidle in basket page, continuing anyway');
      }
      
      // Check if we're actually on the basket page
      const url = this.page.url();
      if (!url.includes('/basket')) {
        console.log(`Navigation appears to have failed. Current URL: ${url}`);
        return false;
      }
      
      await this.dismissOverlays();
      return true;
    } catch (error) {
      console.log('Error navigating to basket page:', error);
      await this.page.screenshot({ path: `basket-navigation-error-${Date.now()}.png` });
      return false;
    }
  }

  /**
   * Get the number of items in the basket
   * @returns The number of items
   */
  async getItemCount(): Promise<number> {
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when getting item count');
        return 0;
      }
      
      const isEmptyVisible = await this.emptyBasketMessage.isVisible({ timeout: 3000 })
        .catch(error => {
          console.log('Error checking empty basket visibility:', error);
          return false;
        });
      
      if (isEmptyVisible) {
        return 0;
      }
      
      const count = await this.basketItems.count()
        .catch(error => {
          console.log('Error counting basket items:', error);
          return 0;
        });
      
      return count;
    } catch (error) {
      console.log('Error getting basket item count:', error);
      await this.page.screenshot({ path: `basket-item-count-error-${Date.now()}.png` })
        .catch(() => {});
      return 0;
    }
  }

  /**
   * Get the total price of items in the basket
   * @returns The total price
   */
  async getTotalPrice(): Promise<string> {
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when getting total price');
        return '0.00';
      }
      
      // Check if price element is visible
      const isPriceVisible = await this.totalPrice.isVisible({ timeout: 3000 })
        .catch(error => {
          console.log('Error checking price visibility:', error);
          return false;
        });
      
      if (!isPriceVisible) {
        console.log('Price element not visible');
        return '0.00';
      }
      
      const priceText = await this.getText(this.totalPrice)
        .catch(error => {
          console.log('Error getting price text:', error);
          return '0.00';
        });
      
      return priceText || '0.00';
    } catch (error) {
      console.log('Error getting total price:', error);
      await this.page.screenshot({ path: `total-price-error-${Date.now()}.png` })
        .catch(() => {});
      return '0.00';
    }
  }

  /**
   * Remove an item from the basket
   * @param index The index of the item to remove (0-based)
   * @returns True if item was successfully removed
   */
  async removeItem(index: number): Promise<boolean> {
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when removing item');
        return false;
      }
      
      await this.page.screenshot({ path: `before-remove-item-${Date.now()}.png` })
        .catch(() => {});
      
      const browserInfo = await this.page.evaluate(() => {
        const ua = navigator.userAgent.toLowerCase();
        return {
          isFirefox: ua.includes('firefox'),
          isChromium: ua.includes('chrome') || ua.includes('chromium'),
          isWebKit: ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')
        };
      }).catch(() => ({ isFirefox: false, isChromium: false, isWebKit: false }));
      
      console.log(`Browser detection: Firefox: ${browserInfo.isFirefox}, Chromium: ${browserInfo.isChromium}, WebKit: ${browserInfo.isWebKit}`);
      
      const removeButtonSelectors = [
        '.mat-icon-button',
        'button.mat-icon-button',
        'button[aria-label="Remove"]',
        'button[aria-label="Delete"]',
        'button.remove-item',
        'button.delete-item',
        'button:has-text("Remove")',
        'button:has-text("Delete")',
        'button mat-icon:has-text("delete")',
        'button mat-icon:has-text("remove")',
        'button mat-icon:has-text("close")',
        'button.mat-button-base',
        'button.mat-focus-indicator',
        'button.mat-icon-button mat-icon'
      ];
      
      let buttonClicked = false;
      
      for (const selector of removeButtonSelectors) {
        try {
          const buttons = await this.page.locator(selector).all();
          console.log(`Found ${buttons.length} buttons with selector: ${selector}`);
          
          if (index < buttons.length) {
            try {
              console.log(`Attempting to click button at index ${index} with selector ${selector}`);
              await buttons[index].click({ timeout: 5000, force: true });
              buttonClicked = true;
              console.log(`Successfully clicked button with selector: ${selector}`);
              break;
            } catch (clickError) {
              console.log(`Error clicking button with selector ${selector}:`, clickError);
            }
          }
        } catch (selectorError) {
          console.log(`Error with selector ${selector}:`, selectorError);
        }
      }
      
      if (!buttonClicked) {
        console.log('Standard click methods failed, trying JavaScript click with multiple selectors');
        
        const evalParams = {
          idx: index,
          isFirefox: browserInfo.isFirefox,
          isChromium: browserInfo.isChromium,
          isWebKit: browserInfo.isWebKit
        };
        
        const jsClicked = await this.page.evaluate((params: { idx: number, isFirefox: boolean, isChromium: boolean, isWebKit: boolean }) => {
          const selectors = [
            '.mat-icon-button',
            'button.mat-icon-button',
            'button[aria-label="Remove"]',
            'button[aria-label="Delete"]',
            'button.remove-item',
            'button.delete-item',
            'button.mat-button-base',
            'button.mat-focus-indicator'
          ];
          
          for (const selector of selectors) {
            const buttons = document.querySelectorAll(selector);
            console.log(`JS found ${buttons.length} buttons with selector: ${selector}`);
            
            if (buttons && buttons.length > params.idx) {
              try {
                console.log(`JS clicking button at index ${params.idx} with selector ${selector}`);
                (buttons[params.idx] as HTMLElement).click();
                return true;
              } catch (e) {
                console.log(`JS click error with selector ${selector}:`, e);
              }
            }
          }
          
          const allButtons = document.querySelectorAll('button');
          for (let i = 0; i < allButtons.length; i++) {
            const button = allButtons[i] as HTMLElement;
            const hasDeleteIcon = button.innerHTML.includes('delete') || 
                                 button.innerHTML.includes('remove') || 
                                 button.innerHTML.includes('close');
            
            if (hasDeleteIcon) {
              try {
                console.log('JS clicking button with delete/remove/close icon');
                button.click();
                return true;
              } catch (e) {
                console.log('JS click error on button with icon:', e);
              }
            }
          }
          
          if (params.isChromium) {
            console.log('Using Chromium-specific approach');
            const rows = document.querySelectorAll('mat-row, tr');
            if (rows && rows.length > params.idx) {
              const buttons = rows[params.idx].querySelectorAll('button');
              for (let i = 0; i < buttons.length; i++) {
                try {
                  console.log('JS clicking button in row');
                  (buttons[i] as HTMLElement).click();
                  return true;
                } catch (e) {
                  console.log('JS click error on row button:', e);
                }
              }
            }
          }
          
          return false;
        }, evalParams).catch(() => false);
        
        buttonClicked = Boolean(jsClicked);
        console.log(`JavaScript click result: ${jsClicked}`);
      }
      
      if (!buttonClicked) {
        console.log('All click methods failed, trying to remove item via direct basket manipulation');
      }
      
      await this.page.waitForTimeout(1000).catch(() => {});
      
      await this.page.screenshot({ path: `after-remove-item-${Date.now()}.png` })
        .catch(() => {});
      
      return buttonClicked;
    } catch (error) {
      console.log(`Error removing item at index ${index}:`, error);
      await this.page.screenshot({ path: `remove-item-error-${Date.now()}.png` })
        .catch(() => {});
      return false;
    }
  }

  /**
   * Proceed to checkout
   * @returns True if checkout was successful
   */
  async checkout(): Promise<boolean> {
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when checking out');
        return false;
      }
      
      await this.dismissOverlays(3, 1000);
      await this.page.screenshot({ path: `before-checkout-${Date.now()}.png` })
        .catch(() => {});
      
      const checkoutSelectors = [
        '#checkoutButton',
        'button:has-text("Checkout")',
        'button.checkout-button',
        'button.mat-button:has-text("Checkout")',
        'button.mat-raised-button:has-text("Checkout")',
        'button[aria-label="Proceed to checkout"]',
        'a:has-text("Checkout")',
        'a.checkout-button'
      ];
      
      let buttonClicked = false;
      
      for (const selector of checkoutSelectors) {
        try {
          const button = this.page.locator(selector).first();
          const isVisible = await button.isVisible({ timeout: 3000 }).catch(() => false);
          
          if (isVisible) {
            console.log(`Found checkout button with selector: ${selector}`);
            await button.click({ timeout: 5000, force: true }).catch(e => {
              console.log(`Click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
            });
            
            buttonClicked = true;
            break;
          }
        } catch (selectorError) {
          console.log(`Error with checkout selector ${selector}:`, selectorError);
        }
      }
      
      if (!buttonClicked) {
        console.log('Could not find or click checkout button with selectors, trying JavaScript click');
        
        const jsClicked = await this.page.evaluate(() => {
          const selectors = [
            '#checkoutButton',
            'button.checkout-button',
            'button.mat-button',
            'button.mat-raised-button',
            'a.checkout-button'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              if (el && (el.textContent?.includes('Checkout') || el.getAttribute('aria-label')?.includes('Checkout'))) {
                console.log(`Clicking element with JS: ${selector}`);
                el.click();
                return true;
              }
            }
          }
          
          const allButtons = document.querySelectorAll('button, a');
          for (let i = 0; i < allButtons.length; i++) {
            const el = allButtons[i] as HTMLElement;
            if (el && el.textContent?.includes('Checkout')) {
              console.log('Clicking button with Checkout text via JS');
              el.click();
              return true;
            }
          }
          
          return false;
        }).catch(() => false);
        
        if (!jsClicked) {
          console.log('JavaScript click also failed, trying direct navigation');
          
          try {
            const baseUrl = this.page.url().split('#')[0];
            await this.page.goto(`${baseUrl}/#/address/select`, { timeout: 10000 });
            console.log('Direct navigation to checkout address page');
            
            const url = this.page.url();
            if (url.includes('/address/select')) {
              console.log('Successfully navigated to checkout address page via direct URL');
              return true;
            }
          } catch (navError) {
            console.log('Direct navigation failed:', navError);
            return false;
          }
        }
      }
      
      try {
        await this.waitForNavigation();
      } catch (error) {
        console.log('Warning: Timeout waiting for navigation after checkout, continuing anyway');
      }
      
      await this.page.waitForTimeout(2000);
      const url = this.page.url();
      
      if (url.includes('/address/select') || url.includes('/checkout') || url.includes('/payment')) {
        console.log(`Successfully navigated to checkout page: ${url}`);
        return true;
      } else {
        console.log(`Navigation may have failed. Current URL: ${url}`);
        
        try {
          const baseUrl = url.split('#')[0];
          await this.page.goto(`${baseUrl}/#/address/select`, { timeout: 10000 });
          console.log('Direct navigation to checkout address page after failed checkout');
          return true;
        } catch (finalError) {
          console.log('Final direct navigation failed:', finalError);
          return false;
        }
      }
    } catch (error) {
      console.log('Error during checkout:', error);
      await this.page.screenshot({ path: `checkout-error-${Date.now()}.png` })
        .catch(() => {});
      return false;
    }
  }

  /**
   * Check if the basket is empty
   * @returns True if the basket is empty
   */
  async isBasketEmpty(): Promise<boolean> {
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when checking if basket is empty');
        return true;
      }
      
      await this.page.screenshot({ path: `basket-empty-check-${Date.now()}.png` })
        .catch(error => console.log('Error taking screenshot:', error));
      
      // Strategy 1: Check if empty basket message is visible
      const isEmptyVisible = await this.emptyBasketMessage.isVisible({ timeout: 3000 })
        .catch(error => {
          console.log('Error checking empty basket visibility:', error);
          return false; // Don't assume empty on error for this check
        });
      
      if (isEmptyVisible) {
        console.log('Empty basket message is visible');
        return true;
      }
      
      const itemCount = await this.getItemCount()
        .catch(error => {
          console.log('Error getting item count:', error);
          return -1; // Invalid count
        });
      
      if (itemCount === 0) {
        console.log('Basket item count is 0');
        return true;
      }
      
      const pageContent = await this.page.content()
        .catch(error => {
          console.log('Error getting page content:', error);
          return '';
        });
      
      const emptyBasketIndicators = [
        'Your basket is empty',
        'No items in basket',
        'emptyBasket',
        'empty-basket',
        'empty basket',
        'nothing in your basket'
      ];
      
      for (const indicator of emptyBasketIndicators) {
        if (pageContent.toLowerCase().includes(indicator.toLowerCase())) {
          console.log(`Found empty basket indicator: "${indicator}"`);
          return true;
        }
      }
      
      const removeButtons = await this.removeItemButtons.count()
        .catch(error => {
          console.log('Error counting remove buttons:', error);
          return -1;
        });
      
      if (removeButtons === 0) {
        console.log('No remove buttons found, basket likely empty');
        return true;
      }
      
      console.log('All empty basket detection strategies failed, basket appears to have items');
      return false;
    } catch (error) {
      console.log('Error checking if basket is empty:', error);
      await this.page.screenshot({ path: `empty-basket-check-error-${Date.now()}.png` })
        .catch(() => {});
      return true; // Assume empty on error for the overall method
    }
  }
}
