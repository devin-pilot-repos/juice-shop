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
    this.logoutButton = page.locator('#logout-link');
    this.loginButton = page.locator('#navbarLoginButton');
    this.searchBox = page.locator('#searchQuery');
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
    
    try {
      const welcomeBanner = this.page.locator('.cdk-overlay-container');
      if (await welcomeBanner.isVisible()) {
        console.log('Overlay detected, attempting to dismiss...');
        await this.page.mouse.click(10, 10);
        await this.page.waitForTimeout(500);
      }
    } catch (error) {
      console.log('Error handling overlay:', error);
    }
    
    try {
      const userElements = [
        this.page.locator('[aria-label="Show the shopping cart"]'),
        this.page.locator('#navbarLogoutButton'),
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
    
    try {
      const welcomeBanner = this.page.locator('.cdk-overlay-container');
      if (await welcomeBanner.isVisible()) {
        console.log('Welcome banner detected on home page, attempting to dismiss...');
        
        const closeButton = this.page.locator('button[aria-label="Close Welcome Banner"]');
        if (await closeButton.isVisible()) {
          console.log('Close button found, clicking it...');
          await closeButton.click({ force: true });
        } else {
          const xButton = this.page.locator('.close-dialog');
          if (await xButton.isVisible()) {
            console.log('X button found, clicking it...');
            await xButton.click({ force: true });
          } else {
            console.log('No close buttons found, clicking outside dialog...');
            await this.page.mouse.click(10, 10);
          }
        }
        
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('Error handling welcome dialog:', error);
    }
    
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
    try {
      await this.page.locator('#searchQuery').click();
      await this.page.waitForSelector('#searchQuery input:not([disabled])', { timeout: 5000 });
      await this.searchBox.fill(query);
      await this.searchButton.click();
      await this.waitForNavigation();
    } catch (error) {
      console.log('Error during product search:', error);
      const searchInput = this.page.locator('#searchQuery input');
      await searchInput.fill(query);
      await this.searchButton.click();
      await this.waitForNavigation();
    }
  }
  
  /**
   * Get the number of product cards displayed
   * @returns The number of product cards
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }
  
  /**
   * Navigate to the basket page
   */
  async goToBasket(): Promise<void> {
    await this.basketButton.click();
    await this.waitForNavigation();
  }
}
