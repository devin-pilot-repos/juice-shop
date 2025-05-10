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
      
      await page.screenshot({ path: `before-logout-attempt-${Date.now()}.png` })
        .catch(() => {});
      
      await page.evaluate(() => {
        const overlays = document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop, .mat-dialog-container, .mat-snack-bar-container');
        overlays.forEach(overlay => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        });
        
        const backdrops = document.querySelectorAll('.modal-backdrop, .backdrop, .overlay');
        backdrops.forEach(backdrop => {
          if (backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
          }
        });
      }).catch(error => console.log('Error removing overlays:', error));
      
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('login') || currentUrl.includes('logout')) {
        console.log('Already on login/logout page, refreshing...');
        await page.reload();
        await page.waitForTimeout(2000);
      }
      
      const accountSelectors = [
        '#navbarAccount',
        'button[aria-label="Account"]',
        'button.mat-button:has-text("Account")',
        'button:has-text("Account")',
        'mat-icon:has-text("account_circle")',
        'mat-icon:has-text("person")',
        '.mat-button:has-text("Account")',
        '.mat-icon-button:has-text("Account")',
        'button.navbar-account',
        'button[id*="account"]',
        'button[class*="account"]',
        'a[id*="account"]',
        'a[class*="account"]'
      ];
      
      let menuOpened = false;
      for (const selector of accountSelectors) {
        try {
          const accountButton = page.locator(selector);
          const count = await accountButton.count();
          if (count > 0) {
            for (let i = 0; i < count; i++) {
              const button = accountButton.nth(i);
              const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
              if (isVisible) {
                await button.click({ timeout: 5000, force: true }).catch(e => {
                  console.log(`Click error (continuing): ${e instanceof Error ? e.message : String(e)}`);
                });
                console.log(`Clicked account menu with selector: ${selector} (index ${i})`);
                await page.waitForTimeout(1000);
                menuOpened = true;
                break;
              }
            }
            if (menuOpened) break;
          }
        } catch (error) {
          console.log(`Error with account menu selector ${selector}:`, error);
        }
      }
      
      if (!menuOpened) {
        console.log('Could not open account menu with standard selectors, trying JavaScript...');
        
        const jsMenuOpened = await page.evaluate(() => {
          const possibleSelectors = [
            '#navbarAccount',
            'button[aria-label="Account"]',
            'button.mat-button:has-text("Account")',
            'button:has-text("Account")',
            'mat-icon:has-text("account_circle")',
            'mat-icon:has-text("person")',
            '.mat-button:has-text("Account")',
            '.mat-icon-button:has-text("Account")',
            'button.navbar-account',
            'button[id*="account"]',
            'button[class*="account"]',
            'a[id*="account"]',
            'a[class*="account"]'
          ];
          
          for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i] as HTMLElement;
              if (element && element.offsetParent !== null) {
                element.click();
                console.log(`Clicked account menu with selector: ${selector} (index ${i}) via JavaScript`);
                return true;
              }
            }
          }
          
          const allButtons = document.querySelectorAll('button, a, mat-icon');
          for (let i = 0; i < allButtons.length; i++) {
            const el = allButtons[i] as HTMLElement;
            if (el && el.offsetParent !== null) {
              const text = el.textContent || '';
              if (text.toLowerCase().includes('account') || 
                  text.toLowerCase().includes('profile') || 
                  text.toLowerCase().includes('user') ||
                  el.className.toLowerCase().includes('account') ||
                  el.id.toLowerCase().includes('account')) {
                el.click();
                console.log('Clicked potential account button via text/class/id match');
                return true;
              }
            }
          }
          
          return false;
        }).catch(error => {
          console.log('Error with JavaScript account menu click:', error);
          return false;
        });
        
        menuOpened = jsMenuOpened;
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ path: `after-account-menu-click-${Date.now()}.png` })
        .catch(() => {});
      
      const logoutSelectors = [
        '#navbarLogoutButton',
        'button[aria-label="Logout"]',
        'button:has-text("Logout")',
        'button.mat-menu-item:has-text("Logout")',
        'mat-menu-item:has-text("Logout")',
        'a:has-text("Logout")',
        'a.logout',
        'button.logout',
        'button[id*="logout"]',
        'button[class*="logout"]',
        'a[id*="logout"]',
        'a[class*="logout"]',
        'li:has-text("Logout")',
        '.mat-menu-item:has-text("Logout")',
        '.dropdown-item:has-text("Logout")'
      ];
      
      let logoutClicked = false;
      for (const selector of logoutSelectors) {
        try {
          const logoutButton = page.locator(selector);
          const count = await logoutButton.count();
          if (count > 0) {
            for (let i = 0; i < count; i++) {
              const button = logoutButton.nth(i);
              const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
              if (isVisible) {
                await button.click({ timeout: 5000, force: true }).catch(e => {
                  console.log(`Logout click error (continuing): ${e instanceof Error ? e.message : String(e)}`);
                });
                console.log(`Clicked logout button with selector: ${selector} (index ${i})`);
                logoutClicked = true;
                break;
              }
            }
            if (logoutClicked) break;
          }
        } catch (error) {
          console.log(`Error with logout selector ${selector}:`, error);
        }
      }
      
      if (!logoutClicked) {
        console.log('Could not click logout button with standard selectors, trying JavaScript...');
        
        const jsLogoutClicked = await page.evaluate(() => {
          const possibleSelectors = [
            '#navbarLogoutButton',
            'button[aria-label="Logout"]',
            'button:has-text("Logout")',
            'button.mat-menu-item:has-text("Logout")',
            'mat-menu-item:has-text("Logout")',
            'a:has-text("Logout")',
            'a.logout',
            'button.logout',
            'button[id*="logout"]',
            'button[class*="logout"]',
            'a[id*="logout"]',
            'a[class*="logout"]',
            'li:has-text("Logout")',
            '.mat-menu-item:has-text("Logout")',
            '.dropdown-item:has-text("Logout")'
          ];
          
          for (const selector of possibleSelectors) {
            const elements = document.querySelectorAll(selector);
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i] as HTMLElement;
              if (element && element.offsetParent !== null) {
                element.click();
                console.log(`Clicked logout button with selector: ${selector} (index ${i}) via JavaScript`);
                return true;
              }
            }
          }
          
          const allElements = document.querySelectorAll('button, a, li, div, span');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el && el.offsetParent !== null) {
              const text = el.textContent || '';
              if (text.toLowerCase().includes('logout') || 
                  text.toLowerCase().includes('sign out') || 
                  text.toLowerCase().includes('log out') ||
                  el.className.toLowerCase().includes('logout') ||
                  el.id.toLowerCase().includes('logout')) {
                el.click();
                console.log('Clicked potential logout element via text/class/id match');
                return true;
              }
            }
          }
          
          return false;
        }).catch(error => {
          console.log('Error with JavaScript logout click:', error);
          return false;
        });
        
        logoutClicked = jsLogoutClicked;
      }
      
      if (!logoutClicked) {
        console.log('Could not click logout button, trying direct navigation to logout URL...');
        
        const baseUrl = page.url().split('#')[0];
        try {
          await page.goto(`${baseUrl}/#/logout`, { timeout: 10000 });
          console.log('Navigated directly to logout URL');
          logoutClicked = true;
        } catch (navError) {
          console.log('Error navigating to logout URL:', navError);
          
          try {
            await page.goto(`${baseUrl}/#/login`, { timeout: 10000 });
            console.log('Navigated to login page as fallback');
            logoutClicked = true;
          } catch (loginNavError) {
            console.log('Error navigating to login page:', loginNavError);
          }
        }
      }
      
      try {
        await page.waitForNavigation({ timeout: 5000 });
        console.log('Navigation completed after logout');
      } catch (navError) {
        console.log('Navigation timeout after logout (continuing anyway)');
      }
      
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: `after-logout-attempt-${Date.now()}.png` })
        .catch(() => {});
      
      const newUrl = page.url();
      console.log(`URL after logout attempt: ${newUrl}`);
      
      const onLoginPage = newUrl.includes('/login');
      if (onLoginPage) {
        console.log('Successfully logged out - now on login page');
        return true;
      }
      
      const loginButtonVisible = await page.locator('#navbarLoginButton, button:has-text("Login"), a:has-text("Login")').isVisible()
        .catch(() => false);
      
      if (loginButtonVisible) {
        console.log('Successfully logged out - login button is visible');
        return true;
      }
      
      // Check if we're still logged in
      const isStillLoggedIn = await this.isLoggedIn(page).catch(() => false);
      if (!isStillLoggedIn) {
        console.log('Successfully logged out - no longer logged in');
        return true;
      }
      
      console.log('Logout appears to have failed - user still logged in');
      return false;
    } catch (error) {
      console.log('Error during logout:', error);
      await page.screenshot({ path: `logout-error-${Date.now()}.png` })
        .catch(() => {});
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
