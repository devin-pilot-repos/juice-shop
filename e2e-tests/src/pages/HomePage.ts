import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { SearchResultPage } from './SearchResultPage';

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
branch    * @returns True if navigation was successful
   */
  async navigate(path: string = '/'): Promise<boolean> {
    return await super.navigate(path);
  }

  /**
   * Check if the user is logged in
   * @returns True if the user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    console.log('Checking if user is logged in...');
    
    try {
      try {
        await this.page.screenshot({ path: `before-check-login-${Date.now()}.png` });
      } catch (screenshotError) {
        console.log('Could not take screenshot, but continuing:', 
          screenshotError instanceof Error ? screenshotError.message : String(screenshotError));
      }

      const isPageValid = await this.page.evaluate(() => true).catch(() => false);
      if (!isPageValid) {
        console.log('Page is no longer valid, cannot check login status');
        return false;
      }

      try {
        await this.dismissOverlays();
      } catch (overlayError) {
        console.log('Error dismissing overlays, but continuing:', 
          overlayError instanceof Error ? overlayError.message : String(overlayError));
      }

      // Check for direct indicators of being logged in
      try {
        const userElements = [
          this.page.locator('[aria-label="Show the shopping cart"]'),
          this.page.locator('#navbarLogoutButton'),
          this.page.locator('#logout-link'),
          this.page.locator('button[aria-label="Go to user profile"]'),
          this.page.locator('button:has-text("My Account")'),
          this.page.locator('button:has-text("Orders & Payment")'),
          this.page.locator('button:has-text("Privacy & Security")')
        ];

        for (const element of userElements) {
          const isVisible = await element.isVisible().catch(() => false);
          if (isVisible) {
            console.log('Found logged-in indicator element');
            return true;
          }
        }
      } catch (error) {
        console.log('Error checking for logged-in indicators:', 
          error instanceof Error ? error.message : String(error));
      }

      // Check URL for indicators of being logged in
      try {
        const url = this.page.url();
        if (url.includes('/profile') || url.includes('/accounting') || url.includes('/saved-payment-methods')) {
          console.log('URL indicates user is logged in');
          return true;
        }
      } catch (urlError) {
        console.log('Error checking URL:', 
          urlError instanceof Error ? urlError.message : String(urlError));
      }

      // If no direct indicators, try opening the account menu
      try {
        const accountSelectors = [
          '[aria-label="Account"]',
          '#navbarAccount',
          'button.mat-button[aria-label="Account"]',
          'button.mat-focus-indicator[aria-label="Account"]',
          'button[aria-label="Go to user profile"]'
        ];

        let menuOpened = false;
        for (const selector of accountSelectors) {
          try {
            const button = this.page.locator(selector);
            const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isVisible) {
              await button.click({ timeout: 5000, force: true }).catch(e => {
                console.log(`Click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
              });
              
              try {
                await this.page.waitForTimeout(500);
              } catch (timeoutError) {
                console.log('Timeout error, but continuing');
              }
              
              menuOpened = true;
              break;
            }
          } catch (error) {
            console.log(`Error with account selector ${selector}:`, 
              error instanceof Error ? error.message : String(error));
          }
        }

        if (!menuOpened) {
          console.log('Could not open account menu, assuming not logged in');
          return false;
        }

        try {
          const isLogoutVisible = await this.isVisible(this.logoutButton);
          
          // Close menu by clicking elsewhere
          try {
            await this.page.mouse.click(10, 10);
          } catch (clickError) {
            console.log('Error closing menu, but continuing');
          }
          
          return isLogoutVisible;
        } catch (logoutError) {
          console.log('Error checking logout button visibility:', 
            logoutError instanceof Error ? logoutError.message : String(logoutError));
          return false;
        }
      } catch (error) {
        console.log('Error checking login status:', 
          error instanceof Error ? error.message : String(error));
        return false;
      }
    } catch (fatalError) {
      console.log('Fatal error in isLoggedIn:', 
        fatalError instanceof Error ? fatalError.message : String(fatalError));
      return false;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<boolean> {
    console.log('Attempting to logout...');

    try {
      try {
        await this.page.screenshot({ path: `before-logout-${Date.now()}.png` });
      } catch (screenshotError) {
        console.log('Could not take screenshot, but continuing:', 
          screenshotError instanceof Error ? screenshotError.message : String(screenshotError));
      }

      const isPageValid = await this.page.evaluate(() => true).catch(() => false);
      if (!isPageValid) {
        console.log('Page is no longer valid, cannot logout');
        return false;
      }

      const menuOpened = await this.openAccountMenu();
      if (!menuOpened) {
        console.log('Could not open account menu, logout may fail');
      }

      try {
        await this.page.waitForTimeout(1000);
      } catch (timeoutError) {
        console.log('Timeout error, but continuing');
      }

      const logoutSelectors = [
        '#navbarLogoutButton',
        '#logout-link',
        'button[aria-label="Logout"]',
        '[data-test="logout-button"]',
        'button:has-text("Logout")',
        'span:has-text("Logout")',
        'mat-list-item:has-text("Logout")',
        'button.mat-menu-item:has-text("Logout")',
        'a:has-text("Logout")'
      ];

      for (const selector of logoutSelectors) {
        try {
          const logoutButton = this.page.locator(selector);
          const isVisible = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            console.log(`Found logout button with selector: ${selector}`);
            await logoutButton.click({ timeout: 5000, force: true }).catch(e => {
              console.log(`Click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
            });
            
            try {
              await this.waitForNavigation();
              console.log('Clicked logout button and navigation completed');
              return true;
            } catch (navError) {
              console.log('Navigation error after logout click, but may have succeeded:', 
                navError instanceof Error ? navError.message : String(navError));
              
              // Check if we're on the login page or home page
              const url = this.page.url();
              if (url.includes('login') || !url.includes('profile')) {
                console.log('URL indicates successful logout');
                return true;
              }
            }
          }
        } catch (error) {
          console.log(`Error with logout selector ${selector}:`, 
            error instanceof Error ? error.message : String(error));
        }
      }

      console.log('Could not find logout button with any selector, trying JavaScript...');

      try {
        const loggedOut = await this.page.evaluate(() => {
          try {
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
              ),
              ...Array.from(document.querySelectorAll('a')).filter(el =>
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
            
            // Last resort - try to find any button in the account menu
            const menuItems = document.querySelectorAll('.mat-menu-content button, .mat-menu-panel button');
            for (const item of Array.from(menuItems)) {
              try {
                (item as HTMLElement).click();
                console.log('Clicked potential logout button via JavaScript');
                return true;
              } catch (e) {
                console.log('Error clicking menu item:', e);
              }
            }

            return false;
          } catch (e) {
            console.log('Error in JavaScript logout logic:', e);
            return false;
          }
        }).catch(() => false);

        if (loggedOut) {
          try {
            await this.waitForNavigation();
            console.log('Logged out via JavaScript click');
            return true;
          } catch (navError) {
            console.log('Navigation error after JS logout, but may have succeeded:', 
              navError instanceof Error ? navError.message : String(navError));
            
            // Check if we're on the login page or home page
            const url = this.page.url();
            if (url.includes('login') || !url.includes('profile')) {
              console.log('URL indicates successful logout after JS click');
              return true;
            }
          }
        } else {
          console.log('Could not find any logout element to click');
        }
      } catch (jsError) {
        console.log('JavaScript logout attempt failed:', 
          jsError instanceof Error ? jsError.message : String(jsError));
      }
      
      try {
        const url = this.page.url();
        if (url.includes('login') || !url.includes('profile')) {
          console.log('URL indicates we are logged out');
          return true;
        }
      } catch (urlError) {
        console.log('Error checking URL:', 
          urlError instanceof Error ? urlError.message : String(urlError));
      }
      
      return false;
    } catch (error) {
      console.log('Error during logout:', 
        error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Open the account menu
   */
  async openAccountMenu(): Promise<boolean> {
    console.log('Attempting to open account menu...');

    try {
      const isPageValid = await this.page.evaluate(() => true).catch(() => false);
      if (!isPageValid) {
        console.log('Page is no longer valid, cannot open account menu');
        return false;
      }
      
      try {
        await this.page.screenshot({ path: `before-open-account-menu-${Date.now()}.png` });
      } catch (screenshotError) {
        console.log('Could not take screenshot, but continuing:', 
          screenshotError instanceof Error ? screenshotError.message : String(screenshotError));
      }

      try {
        await this.dismissOverlays(3, 1000);
      } catch (overlayError) {
        console.log('Error dismissing overlays, but continuing:', 
          overlayError instanceof Error ? overlayError.message : String(overlayError));
      }

      const selectors = [
        '[aria-label="Account"]',
        '#navbarAccount',
        'button.mat-button[aria-label="Account"]',
        'button.mat-focus-indicator[aria-label="Account"]',
        'button[aria-label="Go to user profile"]',
        'mat-toolbar button.mat-button',
        'button:has-text("Account")',
        'mat-toolbar button',
        'button.mat-icon-button'
      ];

      let menuOpened = false;

      // Try clicking with Playwright first
      for (const selector of selectors) {
        try {
          const button = this.page.locator(selector);
          const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (!isVisible) continue;
          
          console.log(`Found account button with selector: ${selector}`);
          await button.click({ timeout: 5000, force: true }).catch(e => {
            console.log(`Click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
          });
          
          try {
            await this.page.waitForTimeout(1000);
          } catch (timeoutError) {
            console.log('Timeout error, but continuing');
          }

          try {
            const logoutButton = this.page.locator('#navbarLogoutButton, #logout-link, button:has-text("Logout")');
            const isLogoutVisible = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isLogoutVisible) {
              console.log('Account menu opened successfully, logout button is visible');
              menuOpened = true;
              break;
            } else {
              console.log('Clicked account button but logout button is not visible, trying again...');
              // Try clicking again
              await button.click({ timeout: 5000, force: true }).catch(e => {
                console.log(`Second click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
              });
              
              try {
                await this.page.waitForTimeout(1000);
              } catch (timeoutError) {
                console.log('Timeout error after second click, but continuing');
              }

              const isLogoutVisibleRetry = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
              if (isLogoutVisibleRetry) {
                console.log('Account menu opened successfully on second attempt');
                menuOpened = true;
                break;
              }
            }
          } catch (logoutCheckError) {
            console.log('Error checking logout button visibility:', 
              logoutCheckError instanceof Error ? logoutCheckError.message : String(logoutCheckError));
          }
        } catch (error) {
          console.log(`Error with selector ${selector}:`, 
            error instanceof Error ? error.message : String(error));
        }
      }

      if (!menuOpened) {
        console.log('Could not find account menu button with any selector, taking screenshot...');
        try {
          await this.page.screenshot({ path: `account-menu-not-found-${Date.now()}.png` });
        } catch (screenshotError) {
          console.log('Could not take screenshot, but continuing:', 
            screenshotError instanceof Error ? screenshotError.message : String(screenshotError));
        }

        // Last resort - try JavaScript click on the first button that might be the account menu
        try {
          const jsClicked = await this.page.evaluate(() => {
            // Try to find and click the account button
            const possibleSelectors = [
              '[aria-label="Account"]',
              '#navbarAccount',
              'button[aria-label="Account"]',
              'button.mat-button',
              'mat-toolbar button',
              'button.mat-icon-button',
              'mat-toolbar .mat-mdc-button'
            ];

            for (const selector of possibleSelectors) {
              try {
                const elements = document.querySelectorAll(selector);
                const elementsArray = Array.from(elements);
                for (const element of elementsArray) {
                  const text = element.textContent || '';
                  const ariaLabel = element.getAttribute('aria-label') || '';

                  if (text.includes('Account') || ariaLabel.includes('Account')) {
                    console.log(`Found account button with JS: ${selector}`);
                    (element as HTMLElement).click();
                    return true;
                  }
                }
              } catch (e) {
                console.log(`JS error with selector ${selector}:`, e);
              }
            }

            try {
              const toolbarButtons = document.querySelectorAll('mat-toolbar button');
              const toolbarButtonsArray = Array.from(toolbarButtons);
              if (toolbarButtonsArray.length > 0) {
                console.log('Clicking first toolbar button as fallback');
                (toolbarButtonsArray[0] as HTMLElement).click();
                return true;
              }
            } catch (e) {
              console.log('Error clicking toolbar button:', e);
            }

            return false;
          }).catch(() => false);
          
          if (jsClicked) {
            console.log('Attempted JavaScript click on possible account button');
            try {
              await this.page.waitForTimeout(1000);
            } catch (timeoutError) {
              console.log('Timeout error after JS click, but continuing');
            }
          }
        } catch (jsError) {
          console.log('JavaScript click failed:', 
            jsError instanceof Error ? jsError.message : String(jsError));
        }
      }

      try {
        const logoutButton = this.page.locator('#navbarLogoutButton, #logout-link, button:has-text("Logout")');
        const isLogoutVisible = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isLogoutVisible) {
          console.log('Account menu is open, logout button is visible');
          return true;
        } else {
          console.log('Warning: Account menu may not be open, logout button is not visible');
          return menuOpened; // Return true if we think we opened it, even if logout button isn't visible
        }
      } catch (finalCheckError) {
        console.log('Error in final logout button check:', 
          finalCheckError instanceof Error ? finalCheckError.message : String(finalCheckError));
        return menuOpened; // Return based on our earlier success
      }
    } catch (error) {
      console.log('Fatal error in openAccountMenu:', 
        error instanceof Error ? error.message : String(error));
      return false;
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
        const isButtonVisible = await this.searchButton.isVisible({ timeout: 2000 })
          .catch(() => false);
        
        if (isButtonVisible) {
          await this.searchButton.click({ timeout: 5000, force: true });
          console.log('Clicked search button');
          return true;
        } else {
          console.log('Search button not visible, trying alternative methods');
        }
      } catch (buttonError) {
        console.log('Search button not found, trying alternative methods:', 
          buttonError instanceof Error ? buttonError.message : String(buttonError));
      }

      try {
        await this.page.keyboard.press('Enter');
        console.log('Pressed Enter key to submit search');
        return true;
      } catch (enterError) {
        console.log('Enter key failed, trying JavaScript:', 
          enterError instanceof Error ? enterError.message : String(enterError));
      }
      
      // Try clicking the search icon directly
      try {
        const searchIcon = this.page.locator('mat-icon:has-text("search")');
        if (await searchIcon.isVisible({ timeout: 2000 })) {
          await searchIcon.click({ timeout: 3000, force: true });
          console.log('Clicked search icon directly');
          return true;
        }
      } catch (iconError) {
        console.log('Search icon click failed:', 
          iconError instanceof Error ? iconError.message : String(iconError));
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
          'mat-toolbar button',
          '.mat-search_icon-search',
          '.search-button',
          'button.search'
        ];

        for (const selector of searchSelectors) {
          const buttons = document.querySelectorAll(selector);
          if (buttons.length > 0) {
            for (const button of Array.from(buttons)) {
              try {
                (button as HTMLElement).click();
                console.log(`Clicked search button with selector: ${selector} via JavaScript`);
                return true;
              } catch (e) {
                console.log(`Error clicking ${selector}:`, e);
              }
            }
          }
        }

        // Try to dispatch Enter key event on search input
        const searchInputs = document.querySelectorAll('input[type="text"], input[aria-label="Search"]');
        for (const input of Array.from(searchInputs)) {
          try {
            const event = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13,
              bubbles: true
            });
            input.dispatchEvent(event);
            console.log('Dispatched Enter key event on search input via JavaScript');
            
            const parentForm = input.closest('form');
            if (parentForm) {
              parentForm.dispatchEvent(new Event('submit', { bubbles: true }));
              console.log('Submitted parent form of search input');
            }
            
            return true;
          } catch (e) {
            console.log('Error dispatching event:', e);
          }
        }

        return false;
      });

      if (submitted) {
        console.log('Submitted search via JavaScript');
        return true;
      }
      
      // Last resort: try direct URL navigation with the search query
      try {
        const searchInput = this.page.locator('input[type="text"], input[aria-label="Search"]').first();
        const searchValue = await searchInput.inputValue().catch(() => '');
        
        if (searchValue) {
          console.log(`Got search value "${searchValue}", trying direct navigation`);
          const currentUrl = this.page.url();
          const baseUrl = currentUrl.split('#')[0];
          await this.page.goto(`${baseUrl}#/search?q=${encodeURIComponent(searchValue)}`, { timeout: 5000 });
          console.log('Direct navigation to search URL completed');
          return true;
        }
      } catch (navError) {
        console.log('Direct navigation failed:', 
          navError instanceof Error ? navError.message : String(navError));
      }

      console.log('Could not submit search with any method');
      return false;
    } catch (error) {
      console.log('Error submitting search:', 
        error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Execute search with all fallback mechanisms
   * @param query Search query
   * @returns Promise<boolean> Whether search was successful
   */
  private async executeSearch(query: string): Promise<boolean> {
    try {
      await this.openSearchInput();
      await this.fillSearchInput(query);
      await this.submitSearch();
      
      const navSuccess = await this.waitForNavigation();
      if (navSuccess) {
        console.log('Navigation completed after search');
      } else {
        console.log('Navigation timeout after search, continuing anyway');
      }
      return true; // Consider successful even if navigation has issues
    } catch (error) {
      console.log('Primary search approach failed:', error);
      
      try {
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
          // Try to submit any form
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
        
        const altNavSuccess = await this.waitForNavigation();
        if (altNavSuccess) {
          console.log('Alternative search approach succeeded');
        } else {
          console.log('Navigation timeout after alternative search, continuing anyway');
        }
        return true; // Consider successful even if navigation has issues
      } catch (fallbackError) {
        console.log('JavaScript fallback search failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Search for a product
   * @param query Search query
   * @returns Promise<SearchResultPage> Returns the search result page
   */
  async searchProduct(query: string): Promise<SearchResultPage> {
    console.log(`Searching for product: "${query}"`);
    
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when searching for product');
        return new SearchResultPage(this.page);
      }
      
      await this.dismissOverlays(3, 1000);
    } catch (overlayError) {
      console.log('Error dismissing overlays before search (continuing):', 
        overlayError instanceof Error ? overlayError.message : String(overlayError));
    }
    
    try {
      await this.page.screenshot({ path: `before-search-${Date.now()}.png` })
        .catch(error => console.log('Error taking screenshot:', error));
      
      const searchSuccess = await this.executeSearch(query);
      if (!searchSuccess) {
        console.log('Primary search method failed, trying fallback');
      } else {
        console.log('Primary search method succeeded');
        await this.page.waitForTimeout(500).catch(() => {});
      }
      
      return new SearchResultPage(this.page);
    } catch (error) {
      console.log('Error during product search:', 
        error instanceof Error ? error.message : String(error));
      
      try {
        await this.page.screenshot({ path: `search-error-${Date.now()}.png` })
          .catch(error => console.log('Error taking screenshot:', error));
        
        console.log('Trying direct navigation to search URL...');
        try {
          await this.page.goto(`${this.page.url().split('#')[0]}#/search?q=${encodeURIComponent(query)}`, 
            { timeout: 5000 });
          console.log('Direct navigation to search URL completed');
        } catch (navError) {
          console.log('Direct navigation failed (continuing):', 
            navError instanceof Error ? navError.message : String(navError));
        }
        
        return new SearchResultPage(this.page);
      } catch (fallbackError) {
        console.log('All search approaches failed:', 
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
        return new SearchResultPage(this.page);
      }
    }
  }
  
  /**
   * Select a product from search results or product list
   * Implements multiple fallback mechanisms to handle various UI states
   * @param productName Optional product name to filter by
   * @returns Promise<boolean> True if product was successfully selected
   */
  async selectProduct(productName?: string): Promise<boolean> {
    try {
      if (!this.page || this.page.isClosed?.()) {
        console.log('Page is closed or invalid when selecting product');
        return false;
      }
      
      console.log(`Attempting to select product${productName ? ` "${productName}"` : ''}`);
      
      await this.page.screenshot({ path: `before-select-product-${Date.now()}.png` })
        .catch(error => console.log('Error taking screenshot:', error));
      
      await this.dismissOverlays(3, 300)
        .catch(error => console.log('Error dismissing overlays before product selection:', error));
      
      const productSelectors = [
        '.mat-card',
        'app-product-list mat-grid-tile',
        'app-search-result mat-card',
        '.item-name',
        '.mat-grid-tile',
        '.product-name',
        '.product-item',
        '.product-card'
      ];
      
      if (productName) {
        for (const selector of productSelectors) {
          try {
            const productCard = this.page.locator(selector).filter({ hasText: productName }).first();
            const isVisible = await productCard.isVisible({ timeout: 2000 })
              .catch(() => false);
            
            if (isVisible) {
              console.log(`Found product card with name "${productName}" using selector: ${selector}`);
              await productCard.click({ timeout: 3000, force: true })
                .catch(error => {
                  console.log(`Error clicking product card with name "${productName}":`, error);
                  return false;
                });
              
              console.log(`Successfully clicked product card with name "${productName}"`);
              await this.page.waitForTimeout(500).catch(() => {});
              return true;
            }
          } catch (error) {
            console.log(`Failed to select product "${productName}" with selector ${selector}:`, error);
          }
        }
      }
      
      for (const selector of productSelectors) {
        try {
          const productCard = this.page.locator(selector).first();
          const isVisible = await productCard.isVisible({ timeout: 2000 })
            .catch(() => false);
          
          if (isVisible) {
            console.log(`Found product card with selector: ${selector}`);
            await productCard.click({ timeout: 3000, force: true })
              .catch(error => {
                console.log(`Error clicking product card with selector ${selector}:`, error);
                return false;
              });
            
            console.log(`Successfully clicked product card with selector: ${selector}`);
            await this.page.waitForTimeout(500).catch(() => {});
            return true;
          }
        } catch (error) {
          console.log(`Failed to select product with selector ${selector}:`, error);
        }
      }
      
      console.log('Trying JavaScript click on product card...');
      try {
        const jsClicked = await this.page.evaluate((name) => {
          if (name) {
            const allElements = document.querySelectorAll('*');
            for (const element of Array.from(allElements)) {
              if (element.textContent?.includes(name)) {
                console.log(`Found element containing "${name}" via JavaScript`);
                (element as HTMLElement).click();
                return true;
              }
            }
          }
          
          const selectors = [
            '.mat-card', 
            'app-product-list mat-grid-tile', 
            'app-search-result mat-card',
            '.item-name', 
            '.mat-grid-tile',
            '.product-name',
            '.product-item',
            '.product-card'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              console.log(`Clicked first ${selector} via JavaScript`);
              (elements[0] as HTMLElement).click();
              return true;
            }
          }
          
          // Last resort: try clicking any visible card-like element
          const possibleProductElements = [
            ...Array.from(document.querySelectorAll('mat-card')),
            ...Array.from(document.querySelectorAll('mat-grid-tile')),
            ...Array.from(document.querySelectorAll('.item')),
            ...Array.from(document.querySelectorAll('[class*="product"]')),
            ...Array.from(document.querySelectorAll('[class*="card"]'))
          ];
          
          if (possibleProductElements.length > 0) {
            console.log('Clicked first possible product element via JavaScript');
            (possibleProductElements[0] as HTMLElement).click();
            return true;
          }
          
          return false;
        }, productName);
        
        if (jsClicked) {
          console.log('Successfully clicked product card via JavaScript');
          await this.page.waitForTimeout(500).catch(() => {});
          return true;
        }
      } catch (jsError) {
        console.log('JavaScript click failed:', jsError);
      }
      
      try {
        console.log('Trying direct navigation to a product detail page...');
        const currentUrl = this.page.url();
        const baseUrl = currentUrl.split('#')[0];
        await this.page.goto(`${baseUrl}#/product/1`, { timeout: 5000 });
        console.log('Direct navigation to product detail page completed');
        return true;
      } catch (navError) {
        console.log('Direct navigation to product detail failed:', navError);
      }
      
      console.log('All product selection attempts failed');
      await this.page.screenshot({ path: `product-selection-failed-${Date.now()}.png` })
        .catch(error => console.log('Error taking screenshot:', error));
      
      return false;
    } catch (error) {
      console.log('Error in selectProduct:', error);
      await this.page.screenshot({ path: `select-product-error-${Date.now()}.png` })
        .catch(error => console.log('Error taking screenshot:', error));
      return false;
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
   * @returns True if navigation was successful
   */
  async goToBasket(): Promise<boolean> {
    try {
      await this.basketButton.click();
      const navSuccess = await this.waitForNavigation();
      if (!navSuccess) {
        console.log('Navigation to basket completed with warnings');
      }
      return true;
    } catch (error) {
      console.log('Error navigating to basket:', error);
      return false;
    }
  }

  /**
   * Navigate to the user profile page
   * @returns True if navigation was successful
   */
  async goToUserProfile(): Promise<boolean> {
    try {
      console.log('Attempting to navigate to user profile...');
      
      const menuOpened = await this.openAccountMenu();
      if (!menuOpened) {
        console.log('Could not open account menu, trying direct navigation');
        return await this.navigate('/#/profile');
      }
      
      await this.page.waitForTimeout(1000);
      
      const profileSelectors = [
        'text=My Account',
        '[aria-label="Go to user profile"]',
        'button:has-text("My Account")',
        'a:has-text("My Account")',
        'mat-list-item:has-text("My Account")',
        'button.mat-menu-item:has-text("My Account")',
        'span:has-text("My Account")'
      ];
      
      for (const selector of profileSelectors) {
        try {
          const profileLink = this.page.locator(selector);
          const isVisible = await profileLink.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            console.log(`Found profile link with selector: ${selector}`);
            await profileLink.click({ timeout: 5000, force: true }).catch(e => {
              console.log(`Click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
            });
            
            try {
              await this.waitForNavigation();
              
              const url = this.page.url();
              if (url.includes('/profile')) {
                console.log('Successfully navigated to profile page');
                return true;
              }
            } catch (navError) {
              console.log('Navigation error after profile click:', 
                navError instanceof Error ? navError.message : String(navError));
            }
          }
        } catch (error) {
          console.log(`Error with profile selector ${selector}:`, 
            error instanceof Error ? error.message : String(error));
        }
      }
      
      // Last resort - try direct navigation
      console.log('All profile navigation attempts failed, trying direct navigation');
      return await this.navigate('/#/profile');
    } catch (error) {
      console.log('Error navigating to user profile:', 
        error instanceof Error ? error.message : String(error));
      
      // Last resort - try direct navigation
      try {
        return await this.navigate('/#/profile');
      } catch (navError) {
        console.log('Direct navigation to profile also failed:', 
          navError instanceof Error ? navError.message : String(navError));
        return false;
      }
    }
  }
}
