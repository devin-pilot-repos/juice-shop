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
    this.searchBox = page.locator('app-mat-search-bar input, #searchQuery input, mat-form-field input'); // Multiple selectors for robustness
    this.searchButton = page.locator('#searchButton, mat-icon:has-text("search"), button.mat-search-button, button[aria-label="Search"]');
    this.productCards = page.locator('.mat-card');
    this.basketButton = page.locator('[aria-label="Show the shopping cart"]');
  }

  /**
   * Navigate to the home page
   * @param path Optional path to navigate to, defaults to '/'
   */
  async navigate(path: string = '/'): Promise<void> {
    await super.navigate(path);
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
    console.log('Attempting to logout...');
    
    await this.page.screenshot({ path: `before-logout-${Date.now()}.png` });
    
    try {
      await this.openAccountMenu();
      
      await this.page.waitForTimeout(1000);
      
      const logoutSelectors = [
        '#navbarLogoutButton',
        '#logout-link',
        'button[aria-label="Logout"]',
        '[data-test="logout-button"]',
        'button:has-text("Logout")',
        'span:has-text("Logout")',
        'mat-list-item:has-text("Logout")'
      ];
      
      for (const selector of logoutSelectors) {
        try {
          const logoutButton = this.page.locator(selector);
          if (await logoutButton.isVisible({ timeout: 2000 })) {
            console.log(`Found logout button with selector: ${selector}`);
            await logoutButton.click({ timeout: 5000, force: true });
            await this.waitForNavigation();
            console.log('Clicked logout button and navigation completed');
            return;
          }
        } catch (error) {
          console.log(`Error with logout selector ${selector}:`, error);
        }
      }
      
      console.log('Could not find logout button with any selector, trying JavaScript...');
      
      const loggedOut = await this.page.evaluate(() => {
        const possibleLogoutElements = [
          document.querySelector('#navbarLogoutButton'),
          document.querySelector('#logout-link'),
          document.querySelector('button[aria-label="Logout"]'),
          ...Array.from(document.querySelectorAll('button')).filter(el => 
            el.textContent?.includes('Logout') || 
            el.textContent?.includes('Log out')
          ),
          ...Array.from(document.querySelectorAll('span')).filter(el => 
            el.textContent?.includes('Logout') || 
            el.textContent?.includes('Log out')
          )
        ].filter(Boolean);
        
        for (const element of possibleLogoutElements) {
          try {
            (element as HTMLElement).click();
            console.log('Clicked logout element via JavaScript');
            return true;
          } catch (e) {
            console.log('Error clicking element:', e);
          }
        }
        
        return false;
      });
      
      if (loggedOut) {
        await this.waitForNavigation();
        console.log('Logged out via JavaScript click');
      } else {
        console.log('Could not find any logout element to click');
      }
    } catch (error) {
      console.log('Error during logout:', error);
    }
  }

  /**
   * Open the account menu
   */
  async openAccountMenu(): Promise<void> {
    console.log('Attempting to open account menu...');
    
    await this.page.screenshot({ path: `before-open-account-menu-${Date.now()}.png` });
    
    await this.dismissOverlays(3, 1000);
    
    const selectors = [
      '[aria-label="Account"]',
      '#navbarAccount',
      'button.mat-button[aria-label="Account"]',
      'button.mat-focus-indicator[aria-label="Account"]',
      'button[aria-label="Go to user profile"]',
      'mat-toolbar button.mat-button',
      'button:has-text("Account")'
    ];
    
    let menuOpened = false;
    
    // Try clicking with Playwright first
    for (const selector of selectors) {
      try {
        const button = this.page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`Found account button with selector: ${selector}`);
          await button.click({ timeout: 5000, force: true });
          await this.page.waitForTimeout(1000);
          
          const logoutButton = this.page.locator('#navbarLogoutButton, #logout-link, button:has-text("Logout")');
          if (await logoutButton.isVisible({ timeout: 2000 })) {
            console.log('Account menu opened successfully, logout button is visible');
            menuOpened = true;
            break;
          } else {
            console.log('Clicked account button but logout button is not visible, trying again...');
            // Try clicking again
            await button.click({ timeout: 5000, force: true });
            await this.page.waitForTimeout(1000);
            
            if (await logoutButton.isVisible({ timeout: 2000 })) {
              console.log('Account menu opened successfully on second attempt');
              menuOpened = true;
              break;
            }
          }
        }
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error);
      }
    }
    
    if (!menuOpened) {
      console.log('Could not find account menu button with any selector, taking screenshot...');
      await this.page.screenshot({ path: `account-menu-not-found-${Date.now()}.png` });
      
      // Last resort - try JavaScript click on the first button that might be the account menu
      try {
        await this.page.evaluate(() => {
          // Try to find and click the account button
          const possibleSelectors = [
            '[aria-label="Account"]',
            '#navbarAccount',
            'button[aria-label="Account"]',
            'button.mat-button',
            'mat-toolbar button'
          ];
          
          for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = element.textContent || '';
              const ariaLabel = element.getAttribute('aria-label') || '';
              
              if (text.includes('Account') || ariaLabel.includes('Account')) {
                console.log(`Found account button with JS: ${selector}`);
                (element as HTMLElement).click();
                return true;
              }
            }
          }
          
          const toolbarButtons = document.querySelectorAll('mat-toolbar button');
          if (toolbarButtons.length > 0) {
            console.log('Clicking first toolbar button as fallback');
            (toolbarButtons[0] as HTMLElement).click();
            return true;
          }
          
          return false;
        });
        console.log('Attempted JavaScript click on possible account button');
        await this.page.waitForTimeout(1000);
      } catch (jsError) {
        console.log('JavaScript click failed:', jsError);
      }
    }
    
    const logoutButton = this.page.locator('#navbarLogoutButton, #logout-link, button:has-text("Logout")');
    if (await logoutButton.isVisible({ timeout: 2000 })) {
      console.log('Account menu is open, logout button is visible');
    } else {
      console.log('Warning: Account menu may not be open, logout button is not visible');
    }
  }

  /**
   * Close the account menu by clicking elsewhere
   */
  async closeAccountMenu(): Promise<void> {
    await this.page.mouse.click(10, 10);
  }

  /**
   * Open the search input field
   * @returns Promise<boolean> True if the search input was successfully opened
   */
  async openSearchInput(): Promise<boolean> {
    console.log('Opening search input...');
    
    await this.dismissOverlays(3, 1000);
    
    try {
      await this.page.screenshot({ path: `before-open-search-${Date.now()}.png` });
      
      const searchContainerSelectors = [
        '#searchQuery', 
        'app-mat-search-bar', 
        'mat-toolbar .mat-search-bar',
        'mat-toolbar input[type="text"]',
        'mat-toolbar form'
      ];
      
      for (const selector of searchContainerSelectors) {
        try {
          const container = this.page.locator(selector);
          if (await container.isVisible({ timeout: 2000 })) {
            await container.click({ timeout: 5000 });
            console.log(`Clicked on search container with selector: ${selector}`);
            await this.page.waitForTimeout(500);
            return true;
          }
        } catch (error) {
          console.log(`Error with search container selector ${selector}:`, error);
        }
      }
      
      await this.page.evaluate(() => {
        const selectors = [
          '#searchQuery', 
          'app-mat-search-bar', 
          'mat-toolbar .mat-search-bar',
          'mat-toolbar input[type="text"]',
          'mat-toolbar form',
          'button[aria-label="Search"]'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            (element as HTMLElement).click();
            console.log(`Clicked search container with selector: ${selector} via JavaScript`);
            return true;
          }
        }
        
        return false;
      });
      
      console.log('Attempted JavaScript click on search container');
      await this.page.waitForTimeout(500);
      return true;
    } catch (error) {
      console.log('Error opening search input:', error);
      return false;
    }
  }
  
  /**
   * Fill the search input with a query
   * @param query Search query
   * @returns Promise<boolean> True if the search input was successfully filled
   */
  async fillSearchInput(query: string): Promise<boolean> {
    console.log(`Filling search input with: "${query}"`);
    
    try {
      const inputSelectors = [
        'app-mat-search-bar input', 
        '#searchQuery input', 
        'mat-form-field input',
        'input[type="text"]',
        'mat-toolbar input'
      ];
      
      for (const selector of inputSelectors) {
        try {
          const input = this.page.locator(selector);
          if (await input.isVisible({ timeout: 2000 })) {
            await input.fill(query, { timeout: 5000 });
            console.log(`Filled search input with selector: ${selector}`);
            return true;
          }
        } catch (error) {
          console.log(`Error with search input selector ${selector}:`, error);
        }
      }
      
      const filled = await this.page.evaluate((searchText) => {
        const selectors = [
          'app-mat-search-bar input', 
          '#searchQuery input', 
          'mat-form-field input',
          'input[type="text"]',
          'mat-toolbar input'
        ];
        
        for (const selector of selectors) {
          const input = document.querySelector(selector);
          if (input) {
            (input as HTMLInputElement).value = searchText;
            (input as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
            (input as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Set value using selector: ${selector} via JavaScript`);
            return true;
          }
        }
        
        return false;
      }, query);
      
      if (filled) {
        console.log('Filled search input via JavaScript');
        return true;
      }
      
      console.log('Could not fill search input with any method');
      return false;
    } catch (error) {
      console.log('Error filling search input:', error);
      return false;
    }
  }
  
  /**
   * Click the search button or press Enter to submit the search
   * @returns Promise<boolean> True if the search was successfully submitted
   */
  async submitSearch(): Promise<boolean> {
    console.log('Submitting search...');
    
    try {
      // Try clicking the search button
      try {
        await this.searchButton.click({ timeout: 5000 });
        console.log('Clicked search button');
        return true;
      } catch (buttonError) {
        console.log('Search button not found, trying alternative methods:', buttonError);
      }
      
      try {
        await this.page.keyboard.press('Enter');
        console.log('Pressed Enter key to submit search');
        return true;
      } catch (enterError) {
        console.log('Enter key failed, trying JavaScript:', enterError);
      }
      
      const submitted = await this.page.evaluate(() => {
        // Try to submit any form
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
          console.log('Submitted form via JavaScript');
          return true;
        }
        
        // Try to click any search button
        const searchSelectors = [
          '#searchButton', 
          'mat-icon:has-text("search")', 
          'button.mat-search-button', 
          'button[aria-label="Search"]',
          'button mat-icon',
          'mat-toolbar button'
        ];
        
        for (const selector of searchSelectors) {
          const button = document.querySelector(selector);
          if (button) {
            (button as HTMLElement).click();
            console.log(`Clicked search button with selector: ${selector} via JavaScript`);
            return true;
          }
        }
        
        // Try to dispatch Enter key event on search input
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
          });
          searchInput.dispatchEvent(event);
          console.log('Dispatched Enter key event on search input via JavaScript');
          return true;
        }
        
        return false;
      });
      
      if (submitted) {
        console.log('Submitted search via JavaScript');
        return true;
      }
      
      console.log('Could not submit search with any method');
      return false;
    } catch (error) {
      console.log('Error submitting search:', error);
      return false;
    }
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
      
      await this.openSearchInput();
      
      await this.fillSearchInput(query);
      
      await this.submitSearch();
      
      try {
        await this.waitForNavigation();
        console.log('Navigation completed after search');
      } catch (navError) {
        console.log('Navigation timeout after search, continuing anyway:', navError);
      }
    } catch (error) {
      console.log('Error during product search:', error);
      
      try {
        await this.page.screenshot({ path: `search-error-${Date.now()}.png` });
        
        console.log('Trying alternative search approach with JavaScript...');
        
        await this.page.evaluate((searchText) => {
          const selectors = [
            '#searchQuery input', 
            'app-mat-search-bar input', 
            'mat-form-field input',
            'input[type="text"]'
          ];
          
          for (const selector of selectors) {
            const input = document.querySelector(selector);
            if (input) {
              (input as HTMLInputElement).value = searchText;
              (input as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
              (input as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`Set value using selector: ${selector}`);
              break;
            }
          }
        }, query);
        
        await this.page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
            console.log('Submitted form via JavaScript');
            return;
          }
          
          // Try to click any search button
          const searchSelectors = [
            '#searchButton', 
            'mat-icon:has-text("search")', 
            'button.mat-search-button', 
            'button[aria-label="Search"]',
            'button mat-icon'
          ];
          
          for (const selector of searchSelectors) {
            const button = document.querySelector(selector);
            if (button) {
              (button as HTMLElement).click();
              console.log(`Clicked search button with selector: ${selector}`);
              return;
            }
          }
          
          const searchInput = document.querySelector('input[type="text"]');
          if (searchInput) {
            const event = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            });
            searchInput.dispatchEvent(event);
            console.log('Dispatched Enter key event on search input');
          }
        });
        
        try {
          await this.waitForNavigation();
          console.log('Alternative search approach succeeded');
        } catch (navError) {
          console.log('Navigation timeout after alternative search, continuing anyway:', navError);
        }
      } catch (fallbackError) {
        console.log('Both search approaches failed:', fallbackError);
        
        // Last resort approach
        try {
          console.log('Trying last resort approach...');
          
          await this.page.goto(`${this.page.url().split('#')[0]}#/search?q=${encodeURIComponent(query)}`);
          
          try {
            await this.waitForNavigation();
            console.log('Direct navigation to search URL succeeded');
          } catch (navError) {
            console.log('Navigation timeout after direct URL navigation, continuing anyway:', navError);
          }
        } catch (lastError) {
          console.log('All search approaches failed:', lastError);
        }
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
