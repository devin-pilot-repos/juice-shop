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
   */
  async addToBasket(): Promise<void> {
    await this.addToBasketButton.click();
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
