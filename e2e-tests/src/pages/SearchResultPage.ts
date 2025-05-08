import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Search Results page
 */
export class SearchResultPage extends BasePage {
  private readonly productCards: Locator;
  private readonly productTitles: Locator;
  private readonly productDescriptions: Locator;
  private readonly productPrices: Locator;
  private readonly noResultsMessage: Locator;

  /**
   * Constructor for the SearchResultPage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('.mat-card, app-product-list mat-grid-tile, app-search-result mat-card');
    this.productTitles = page.locator('.mat-card .item-name, app-product-list .item-name, app-search-result .item-name');
    this.productDescriptions = page.locator('.mat-card .item-description, app-product-list .item-description, app-search-result .item-description');
    this.productPrices = page.locator('.mat-card .item-price, app-product-list .item-price, app-search-result .item-price');
    this.noResultsMessage = page.locator('div.no-results, app-search-result .no-results, text="No results found"');
  }

  /**
   * Get the count of products found in search results
   * @returns Number of products found
   */
  async getProductCount(): Promise<number> {
    await this.dismissOverlays();
    
    try {
      await this.page.screenshot({ path: `search-results-count-${Date.now()}.png` });
      
      await Promise.race([
        this.productCards.first().waitFor({ timeout: 10000 }).catch(() => {}),
        this.noResultsMessage.waitFor({ timeout: 10000 }).catch(() => {})
      ]);
      
      const count = await this.productCards.count();
      console.log(`Found ${count} products in search results`);
      return count;
    } catch (error) {
      console.log('Error getting product count:', error);
      return 0;
    }
  }

  /**
   * Check if search returned any results
   * @returns True if products were found, false otherwise
   */
  async hasResults(): Promise<boolean> {
    await this.dismissOverlays();
    
    try {
      const noResultsVisible = await this.noResultsMessage.isVisible().catch(() => false);
      if (noResultsVisible) {
        console.log('No results message is visible');
        return false;
      }
      
      const count = await this.getProductCount();
      return count > 0;
    } catch (error) {
      console.log('Error checking for results:', error);
      return false;
    }
  }

  /**
   * Get the names of products in search results
   * @returns Array of product names
   */
  async getProductNames(): Promise<string[]> {
    try {
      const count = await this.productTitles.count();
      const names: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const name = await this.productTitles.nth(i).textContent();
        if (name) names.push(name.trim());
      }
      
      return names;
    } catch (error) {
      console.log('Error getting product names:', error);
      return [];
    }
  }

  /**
   * Check if a specific product is in the search results
   * @param productName Name of the product to check for
   * @returns True if the product is found
   */
  async hasProduct(productName: string): Promise<boolean> {
    try {
      const names = await this.getProductNames();
      return names.some(name => name.toLowerCase().includes(productName.toLowerCase()));
    } catch (error) {
      console.log(`Error checking for product "${productName}":`, error);
      return false;
    }
  }

  /**
   * Get search query parameter from URL
   * @returns The search query or empty string if not found
   */
  async getSearchQuery(): Promise<string> {
    try {
      const url = this.page.url();
      console.log(`Getting search query from URL: ${url}`);
      
      const patterns = [
        /[?&]q=([^&]*)/, // Standard query parameter
        /[?&]search=([^&]*)/, // Alternative parameter name
        /\/search\/(.+?)(?:\/|$)/, // Path-based search
        /#\/search\?q=([^&]*)/ // Angular route with query
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1]);
          console.log(`Found search query: ${decoded}`);
          return decoded;
        }
      }
      
      if (url.includes('search')) {
        const searchInput = this.page.locator('#searchQuery, input[name="q"], input[aria-label="Search"]');
        const inputValue = await searchInput.inputValue().catch(() => '');
        if (inputValue) {
          console.log(`Found search query in input field: ${inputValue}`);
          return inputValue;
        }
      }
      
      console.log('No search query found in URL');
      return '';
    } catch (error) {
      console.log('Error getting search query:', error);
      return '';
    }
  }

  /**
   * Click on a product by name
   * @param productName Name of the product to click
   * @returns True if product was found and clicked
   */
  async clickProduct(productName: string): Promise<boolean> {
    try {
      const productLink = this.page.locator('.mat-card').filter({ hasText: productName }).first();
      await productLink.click();
      return true;
    } catch (error) {
      console.log(`Error clicking product "${productName}":`, error);
      return false;
    }
  }
}
