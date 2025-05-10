import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { getCurrentEnvironment } from '../../config/environments';

/**
 * Authentication utilities for tests
 */
export class Auth {
  /**
   * Login as an admin user
   * @param page Playwright page object
   * @returns Promise that resolves to boolean indicating if login was successful
   */
  static async loginAsAdmin(page: Page): Promise<boolean> {
    const env = getCurrentEnvironment();
    const loginPage = new LoginPage(page);
    
    const success = await loginPage.navigate();
    if (!success) {
      console.log('Failed to navigate to login page for admin login');
      return false;
    }
    await loginPage.login(
      env.credentials.admin.email,
      env.credentials.admin.password
    );
    return true;
  }

  /**
   * Login as a customer user
   * @param page Playwright page object
   * @returns Promise that resolves to boolean indicating if login was successful
   */
  static async loginAsCustomer(page: Page): Promise<boolean> {
    const env = getCurrentEnvironment();
    const loginPage = new LoginPage(page);
    
    const success = await loginPage.navigate();
    if (!success) {
      console.log('Failed to navigate to login page for customer login');
      return false;
    }
    await loginPage.login(
      env.credentials.customer.email,
      env.credentials.customer.password
    );
    return true;
  }

  /**
   * Login with custom credentials
   * @param page Playwright page object
   * @param email User email
   * @param password User password
   * @returns Promise that resolves to boolean indicating if login was successful
   */
  static async loginWithCredentials(page: Page, email: string, password: string): Promise<boolean> {
    const loginPage = new LoginPage(page);
    
    const success = await loginPage.navigate();
    if (!success) {
      console.log(`Failed to navigate to login page for credentials: ${email}`);
      return false;
    }
    await loginPage.login(email, password);
    return true;
  }

  /**
   * Logout the current user
   * @param page Playwright page object
   * @returns Promise that resolves to boolean indicating if logout was successful
   */
  static async logout(page: Page): Promise<boolean> {
    try {
      console.log('Attempting to logout user...');
      
      await page.evaluate(() => {
        const overlays = document.querySelectorAll('.cdk-overlay-container');
        overlays.forEach(overlay => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        });
      }).catch(error => console.log('Error removing overlays:', error));
      
      const accountSelectors = [
        '#navbarAccount',
        'button[aria-label="Account"]',
        'button.mat-button:has-text("Account")',
        'button:has-text("Account")'
      ];
      
      let menuOpened = false;
      for (const selector of accountSelectors) {
        try {
          const accountButton = page.locator(selector);
          if (await accountButton.isVisible({ timeout: 2000 })) {
            await accountButton.click({ timeout: 5000, force: true });
            console.log(`Clicked account menu with selector: ${selector}`);
            await page.waitForTimeout(500);
            menuOpened = true;
            break;
          }
        } catch (error) {
          console.log(`Error clicking account menu with selector ${selector}:`, error);
        }
      }
      
      if (!menuOpened) {
        console.log('Could not open account menu with standard selectors, trying JavaScript...');
        
        await page.evaluate(() => {
          const possibleSelectors = [
            '#navbarAccount',
            'button[aria-label="Account"]',
            'button.mat-button:has-text("Account")',
            'button:has-text("Account")'
          ];
          
          for (const selector of possibleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              (element as HTMLElement).click();
              console.log(`Clicked account menu with selector: ${selector} via JavaScript`);
              return true;
            }
          }
          
          return false;
        }).catch(error => console.log('Error with JavaScript click:', error));
        
        await page.waitForTimeout(500);
      }
      
      const logoutSelectors = [
        '#navbarLogoutButton',
        'button[aria-label="Logout"]',
        'button:has-text("Logout")',
        'button.mat-menu-item:has-text("Logout")',
        'mat-menu-item:has-text("Logout")'
      ];
      
      let logoutClicked = false;
      for (const selector of logoutSelectors) {
        try {
          const logoutButton = page.locator(selector);
          if (await logoutButton.isVisible({ timeout: 2000 })) {
            await logoutButton.click({ timeout: 5000, force: true });
            console.log(`Clicked logout button with selector: ${selector}`);
            logoutClicked = true;
            break;
          }
        } catch (error) {
          console.log(`Error clicking logout button with selector ${selector}:`, error);
        }
      }
      
      if (!logoutClicked) {
        console.log('Could not click logout button with standard selectors, trying JavaScript...');
        
        await page.evaluate(() => {
          const possibleSelectors = [
            '#navbarLogoutButton',
            'button[aria-label="Logout"]',
            'button:has-text("Logout")',
            'button.mat-menu-item:has-text("Logout")',
            'mat-menu-item:has-text("Logout")'
          ];
          
          for (const selector of possibleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              (element as HTMLElement).click();
              console.log(`Clicked logout button with selector: ${selector} via JavaScript`);
              return true;
            }
          }
          
          return false;
        }).catch(error => console.log('Error with JavaScript logout click:', error));
      }
      
      try {
        await page.waitForNavigation({ timeout: 5000 });
        console.log('Navigation completed after logout');
      } catch (navError) {
        console.log('Navigation timeout after logout (continuing anyway):', navError);
      }
      
      await page.waitForTimeout(1000);
      
      // Verify logout was successful
      const currentUrl = page.url();
      console.log(`URL after logout attempt: ${currentUrl}`);
      
      const isStillLoggedIn = await this.isLoggedIn(page).catch(() => false);
      if (isStillLoggedIn) {
        console.log('Logout appears to have failed - user still logged in');
        return false;
      }
      
      console.log('Logout successful');
      return true;
    } catch (error) {
      console.log('Error during logout:', error);
      return false;
    }
  }

  /**
   * Check if user is logged in
   * @param page Playwright page object
   * @returns Promise that resolves to true if user is logged in
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    try {
      console.log('Checking if user is logged in...');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('Currently on login page, user is not logged in');
        return false;
      }
      
      const userElements = [
        '#navbarLogoutButton',
        'button:has-text("Logout")',
        'button.mat-menu-item:has-text("Logout")',
        'mat-menu-item:has-text("Logout")'
      ];
      
      for (const selector of userElements) {
        try {
          const element = page.locator(selector);
          const isVisible = await element.isVisible({ timeout: 500 })
            .catch(() => false);
          
          if (isVisible) {
            console.log(`Found logged-in indicator with selector: ${selector}`);
            return true;
          }
        } catch (error) {
        }
      }
      
      const accountSelectors = [
        '#navbarAccount',
        'button[aria-label="Account"]',
        'button.mat-button:has-text("Account")',
        'button:has-text("Account")'
      ];
      
      for (const selector of accountSelectors) {
        try {
          const accountButton = page.locator(selector);
          if (await accountButton.isVisible({ timeout: 2000 })) {
            await accountButton.click({ timeout: 5000, force: true });
            console.log(`Clicked account menu with selector: ${selector}`);
            await page.waitForTimeout(500);
            break;
          }
        } catch (error) {
        }
      }
      
      for (const selector of userElements) {
        try {
          const element = page.locator(selector);
          const isVisible = await element.isVisible({ timeout: 2000 })
            .catch(() => false);
          
          if (isVisible) {
            console.log(`Found logged-in indicator after menu click: ${selector}`);
            return true;
          }
        } catch (error) {
        }
      }
      
      console.log('No logged-in indicators found, user is likely not logged in');
      return false;
    } catch (error) {
      console.log('Error checking login status:', error);
      return false;
    }
  }
}
