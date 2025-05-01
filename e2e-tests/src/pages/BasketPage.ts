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
   */
  async navigate(): Promise<void> {
    await super.navigate('/#/basket');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the number of items in the basket
   * @returns The number of items
   */
  async getItemCount(): Promise<number> {
    if (await this.emptyBasketMessage.isVisible()) {
      return 0;
    }
    return await this.basketItems.count();
  }

  /**
   * Get the total price of items in the basket
   * @returns The total price
   */
  async getTotalPrice(): Promise<string> {
    return await this.getText(this.totalPrice);
  }

  /**
   * Remove an item from the basket
   * @param index The index of the item to remove (0-based)
   */
  async removeItem(index: number): Promise<void> {
    const buttons = await this.removeItemButtons.all();
    if (index < buttons.length) {
      await buttons[index].click();
    }
  }

  /**
   * Proceed to checkout
   */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForNavigation();
  }

  /**
   * Check if the basket is empty
   * @returns True if the basket is empty
   */
  async isBasketEmpty(): Promise<boolean> {
    return await this.emptyBasketMessage.isVisible();
  }
}
