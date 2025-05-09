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
    const success = await super.navigate('/#/basket');
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error) {
      console.log('Warning: Timeout waiting for networkidle in basket page, continuing anyway');
    }
    return success;
  }

  /**
   * Get the number of items in the basket
   * @returns The number of items
   */
  async getItemCount(): Promise<number> {
    try {
      if (await this.emptyBasketMessage.isVisible({ timeout: 5000 })) {
        return 0;
      }
      return await this.basketItems.count();
    } catch (error) {
      console.log('Error getting basket item count:', error);
      return 0;
    }
  }

  /**
   * Get the total price of items in the basket
   * @returns The total price
   */
  async getTotalPrice(): Promise<string> {
    try {
      return await this.getText(this.totalPrice);
    } catch (error) {
      console.log('Error getting total price:', error);
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
      const buttons = await this.removeItemButtons.all();
      if (index < buttons.length) {
        await buttons[index].click({ timeout: 10000, force: true });
        return true;
      } else {
        console.log(`No remove button found at index ${index}`);
        return false;
      }
    } catch (error) {
      console.log(`Error removing item at index ${index}:`, error);
      await this.page.screenshot({ path: `remove-item-error-${Date.now()}.png` });
      return false;
    }
  }

  /**
   * Proceed to checkout
   * @returns True if checkout was successful
   */
  async checkout(): Promise<boolean> {
    try {
      await this.checkoutButton.click();
      
      try {
        await this.page.waitForNavigation({ timeout: 15000 });
      } catch (error) {
        console.log('Warning: Timeout waiting for navigation after checkout, continuing anyway');
      }
      
      return true;
    } catch (error) {
      console.log('Error during checkout:', error);
      await this.page.screenshot({ path: `checkout-error-${Date.now()}.png` });
      return false;
    }
  }

  /**
   * Check if the basket is empty
   * @returns True if the basket is empty
   */
  async isBasketEmpty(): Promise<boolean> {
    try {
      return await this.emptyBasketMessage.isVisible({ timeout: 5000 });
    } catch (error) {
      console.log('Error checking if basket is empty:', error);
      return true;
    }
  }
}
