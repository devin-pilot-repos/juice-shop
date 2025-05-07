import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Home page
 */
export class HomePage extends BasePage {
  private readonly navbarAccount: Locator;
  private readonly searchBox: Locator;
  private readonly searchButton: Locator;
  private readonly productCards: Locator;
  private readonly basketButton: Locator;
  private readonly logoutButton: Locator;

  /**
   * Constructor for the HomePage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.navbarAccount = page.locator('#navbarAccount');
    this.searchBox = page.locator('#searchQuery input');
    this.searchButton = page.locator('#searchButton');
    this.productCards = page.locator('.mat-card');
    this.basketButton = page.locator('[aria-label="Show the shopping cart"]');
    this.logoutButton = page.locator('#navbarLogoutButton');
  }

  /**
   * Navigate to the home page
   */
  async navigate(): Promise<void> {
    await super.navigate('/');
    await this.waitForElement(this.page.locator('#searchQuery'));
  }

  /**
   * Search for a product
   * @param query Search query
   */
  async searchProduct(query: string): Promise<void> {
    await this.page.locator('#searchQuery').click();
    await this.page.waitForSelector('#searchQuery input:not([disabled])');
    // Now fill the search query
    await this.searchBox.fill(query);
    await this.searchButton.click();
    await this.waitForNavigation();
  }

  /**
   * Get the number of product cards displayed
   * @returns The number of product cards
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Open the user account menu
   */
  async openAccountMenu(): Promise<void> {
    await this.navbarAccount.click();
  }

  /**
   * Navigate to the basket page
   */
  async goToBasket(): Promise<void> {
    await this.basketButton.click();
    await this.waitForNavigation();
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await this.openAccountMenu();
    await this.logoutButton.click();
    await this.waitForNavigation();
  }
}
