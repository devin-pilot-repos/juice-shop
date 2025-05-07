import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the home page
 */
export class HomePage extends BasePage {
  /**
   * Account menu button
   */
  private accountMenuButton: Locator;
  
  /**
   * Logout button in the account menu
   */
  private logoutButton: Locator;
  
  /**
   * Login button in the account menu (visible when not logged in)
   */
  private loginButton: Locator;

  /**
   * Search box
   */
  private searchBox: Locator;

  /**
   * Search button
   */
  private searchButton: Locator;
  
  /**
   * Product cards displayed on the page
   */
  private productCards: Locator;
  
  /**
   * Basket button
   */
  private basketButton: Locator;

  /**
   * Constructor
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.accountMenuButton = page.locator('[aria-label="Account"]');
    this.logoutButton = page.locator('#logout-link, #navbarLogoutButton'); // Use both selectors to increase robustness
    this.loginButton = page.locator('#navbarLoginButton');
    this.searchBox = page.locator('#searchQuery input'); // Updated to target the input element
    this.searchButton = page.locator('#searchButton');
    this.productCards = page.locator('.mat-card');
    this.basketButton = page.locator('[aria-label="Show the shopping cart"]');
  }

  /**
   * Navigate to the home page
   */
  async navigate(): Promise<void> {
    await super.navigate('/');
  }

  /**
   * Check if the user is logged in
   * @returns True if the user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    console.log('Checking if user is logged in...');
    await this.page.screenshot({ path: `before-check-login-${Date.now()}.png` });
    
    await this.dismissOverlays();
    
    try {
      const userElements = [
        this.page.locator('[aria-label="Show the shopping cart"]'),
        this.page.locator('#navbarLogoutButton'),
        this.page.locator('#logout-link'),
        this.page.locator('button[aria-label="Go to user profile"]')
      ];
      
      for (const element of userElements) {
        if (await element.isVisible()) {
          console.log('Found logged-in indicator element');
          return true;
        }
      }
    } catch (error) {
      console.log('Error checking for logged-in indicators:', error);
    }
    
    // If no direct indicators, try opening the account menu
    try {
      const accountSelectors = [
        '[aria-label="Account"]',
        '#navbarAccount',
        'button.mat-button[aria-label="Account"]'
      ];
      
      let menuOpened = false;
      for (const selector of accountSelectors) {
        try {
          const button = this.page.locator(selector);
          if (await button.isVisible()) {
            await button.click({ timeout: 5000 });
            await this.page.waitForTimeout(500);
            menuOpened = true;
            break;
          }
        } catch (error) {
          console.log(`Error with account selector ${selector}:`, error);
        }
      }
      
      if (!menuOpened) {
        console.log('Could not open account menu, assuming not logged in');
        return false;
      }
      
      const isLogoutVisible = await this.isVisible(this.logoutButton);
      
      await this.page.mouse.click(10, 10);
      
      return isLogoutVisible;
    } catch (error) {
      console.log('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.openAccountMenu();
    await this.click(this.logoutButton);
  }

  /**
   * Open the account menu
   */
  async openAccountMenu(): Promise<void> {
    await this.page.screenshot({ path: `before-open-account-menu-${Date.now()}.png` });
    
    await this.dismissOverlays(3, 1000);
    
    const selectors = [
      '[aria-label="Account"]',
      '#navbarAccount',
      'button.mat-button[aria-label="Account"]',
      'button.mat-focus-indicator[aria-label="Account"]'
    ];
    
    for (const selector of selectors) {
      try {
        const button = this.page.locator(selector);
        if (await button.isVisible()) {
          console.log(`Found account button with selector: ${selector}`);
          await button.click({ timeout: 5000 });
          await this.page.waitForTimeout(500);
          return;
        }
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error);
      }
    }
    
    console.log('Could not find account menu button with any selector, taking screenshot...');
    await this.page.screenshot({ path: `account-menu-not-found-${Date.now()}.png` });
    
    // Last resort - try JavaScript click on the first button that might be the account menu
    try {
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const accountButton = buttons.find(button => 
          button.textContent?.includes('Account') || 
          button.getAttribute('aria-label')?.includes('Account')
        );
        if (accountButton) (accountButton as HTMLElement).click();
      });
      console.log('Attempted JavaScript click on possible account button');
      await this.page.waitForTimeout(500);
    } catch (jsError) {
      console.log('JavaScript click failed:', jsError);
    }
  }

  /**
   * Close the account menu by clicking elsewhere
   */
  async closeAccountMenu(): Promise<void> {
    await this.page.mouse.click(10, 10);
  }

  /**
   * Search for a product
   * @param query Search query
   */
  async searchProduct(query: string): Promise<void> {
    console.log(`Searching for product: "${query}"`);
    
    await this.dismissOverlays(3, 1000);
    
    try {
      await this.page.screenshot({ path: `before-search-${Date.now()}.png` });
      
      await this.page.locator('#searchQuery').click({ timeout: 10000 });
      console.log('Clicked on search container');
      
      await this.page.waitForSelector('#searchQuery input:not([disabled])', { timeout: 10000 });
      console.log('Search input is ready');
      
      await this.page.evaluate((searchText) => {
        const input = document.querySelector('#searchQuery input');
        if (input) {
          (input as HTMLInputElement).value = searchText;
          (input as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, query);
      console.log('Set search query using JavaScript');
      
      // Click the search button
      await this.searchButton.click({ timeout: 15000 });
      console.log('Clicked search button');
      
      await this.waitForNavigation();
      console.log('Navigation completed after search');
    } catch (error) {
      console.log('Error during product search:', error);
      
      try {
        await this.page.screenshot({ path: `search-error-${Date.now()}.png` });
        
        console.log('Trying alternative search approach...');
        
        await this.page.locator('#searchQuery').click({ force: true, timeout: 10000 });
        await this.page.keyboard.type(query, { delay: 100 });
        console.log('Typed search query using keyboard');
        
        await this.searchButton.click({ force: true, timeout: 15000 });
        
        await this.waitForNavigation();
        console.log('Alternative search approach succeeded');
      } catch (fallbackError) {
        console.log('Both search approaches failed:', fallbackError);
      }
    }
  }
  
  /**
   * Get the number of product cards displayed
   * @returns The number of product cards
   */
  async getProductCount(): Promise<number> {
    try {
      // First dismiss any overlays that might be blocking the product cards
      await this.dismissOverlays();
      
      await this.page.screenshot({ path: `product-count-${Date.now()}.png` });
      
      await this.page.waitForSelector('.mat-card', { timeout: 15000 }).catch(error => {
        console.log('Warning: Timeout waiting for product cards, continuing anyway:', error);
      });
      
      const count = await this.productCards.count();
      console.log(`Found ${count} product cards`);
      return count;
    } catch (error) {
      console.log('Error getting product count:', error);
      return 0;
    }
  }
  
  /**
   * Navigate to the basket page
   */
  async goToBasket(): Promise<void> {
    await this.basketButton.click();
    await this.waitForNavigation();
  }
}
