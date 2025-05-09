import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Product page
 */
export class ProductPage extends BasePage {
  private readonly productTitle: Locator;
  private readonly productDescription: Locator;
  private readonly productPrice: Locator;
  private readonly addToBasketButton: Locator;
  private readonly reviewsSection: Locator;
  private readonly reviewTextArea: Locator;
  private readonly submitReviewButton: Locator;

  /**
   * Constructor for the ProductPage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.productTitle = page.locator('.mat-dialog-title');
    this.productDescription = page.locator('#description');
    this.productPrice = page.locator('.item-price');
    this.addToBasketButton = page.locator('#addToBasketButton');
    this.reviewsSection = page.locator('#reviews');
    this.reviewTextArea = page.locator('#reviewText');
    this.submitReviewButton = page.locator('#submitButton');
  }

  /**
   * Get the product title
   * @returns The product title
   */
  async getProductTitle(): Promise<string> {
    return await this.getText(this.productTitle);
  }

  /**
   * Get the product description
   * @returns The product description
   */
  async getProductDescription(): Promise<string> {
    return await this.getText(this.productDescription);
  }

  /**
   * Get the product price
   * @returns The product price
   */
  async getProductPrice(): Promise<string> {
    return await this.getText(this.productPrice);
  }

  /**
   * Add the product to the basket
   * @returns True if product was successfully added to basket
   */
  async addToBasket(): Promise<boolean> {
    try {
      await this.dismissOverlays();
      
      await this.page.waitForSelector('#addToBasketButton', { timeout: 5000 })
        .catch(error => {
          console.log('Warning: Timeout waiting for add to basket button, trying anyway:', error);
        });
      
      await this.page.screenshot({ path: `before-add-to-basket-${Date.now()}.png` });
      
      try {
        await this.addToBasketButton.click({ timeout: 5000, force: true });
      } catch (clickError) {
        console.log('Error clicking add to basket button, trying JavaScript click:', clickError);
        
        const jsClicked = await this.page.evaluate(() => {
          const button = document.querySelector('#addToBasketButton');
          if (button) {
            (button as HTMLElement).click();
            return true;
          }
          return false;
        });
        
        if (!jsClicked) {
          console.log('JavaScript click also failed, product may not be available');
          return false;
        }
      }
      
      await this.page.waitForTimeout(1000).catch(() => {});
      
      return true;
    } catch (error) {
      console.log('Error adding product to basket:', error);
      await this.page.screenshot({ path: `add-to-basket-error-${Date.now()}.png` });
      return false;
    }
  }

  /**
   * Submit a review for the product
   * @param reviewText The review text
   */
  async submitReview(reviewText: string): Promise<void> {
    await this.reviewTextArea.fill(reviewText);
    await this.submitReviewButton.click();
  }
}
