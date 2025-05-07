import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { TestData } from '../src/utils/testData';
import { BasePage } from '../src/pages/BasePage';
import * as fs from 'fs';
import * as path from 'path';

const userCredentialsFile = path.resolve('./test-data/registered-user.json');

function getRegisteredUser() {
  try {
    if (fs.existsSync(userCredentialsFile)) {
      const data = fs.readFileSync(userCredentialsFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error reading registered user credentials:', error);
  }
  
  return TestData.getTestUsers()[0];
}

test.describe('Login and Logout', () => {
  test.setTimeout(120000); // Increased timeout for flaky connections
  
  test.beforeAll(async () => {
    if (!fs.existsSync(userCredentialsFile)) {
      console.log('No registered user found. Run registration test first.');
      test.skip();
    }
  });
  
  test('should login successfully with valid credentials', async ({ page }) => {
    try {
      const registeredUser = getRegisteredUser();
      console.log(`Using registered user: ${registeredUser.email}`);
      
      const loginPage = await Navigation.goToLoginPage(page);
      await page.screenshot({ path: `before-login-valid-${Date.now()}.png` });
      
      await loginPage.login(registeredUser.email, registeredUser.password);
      await page.screenshot({ path: `after-login-valid-${Date.now()}.png` });
      
      const homePage = new HomePage(page);
      const basePage = new BasePage(page);
      
      await basePage.dismissOverlays(3, 1000);
      
      console.log('Attempting to open account menu...');
      await page.screenshot({ path: `before-open-account-menu-valid-${Date.now()}.png` });
      
      try {
        await homePage.openAccountMenu();
        console.log('Account menu opened successfully');
        
        await page.screenshot({ path: `after-open-account-menu-valid-${Date.now()}.png` });
        
        let isLoggedIn = false;
        
        try {
          const logoutSelectors = [
            '#navbarLogoutButton',
            'button:has-text("Logout")',
            'span:has-text("Logout")',
            'mat-list-item:has-text("Logout")',
            '[aria-label="Logout"]'
          ];
          
          for (const selector of logoutSelectors) {
            const logoutElement = page.locator(selector).first();
            if (await logoutElement.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log(`Found logout button with selector: ${selector}`);
              isLoggedIn = true;
              break;
            }
          }
        } catch (error) {
          console.log('Error checking logout button visibility:', error);
        }
        
        if (!isLoggedIn) {
          try {
            if (await page.locator(`text=${registeredUser.email}`).first().isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('User email is visible in the page');
              isLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking user email visibility:', error);
          }
        }
        
        if (!isLoggedIn) {
          const pageContent = await page.content();
          if (pageContent.includes('Logout') || pageContent.includes('Log out')) {
            console.log('Found "Logout" text in page content');
            isLoggedIn = true;
          }
        }
        
        if (!isLoggedIn) {
          try {
            const loginVisible = await page.locator('#navbarLoginButton, button:has-text("Login")').first()
              .isVisible({ timeout: 2000 }).catch(() => false);
            if (!loginVisible) {
              console.log('Login button is not visible, assuming logged in');
              isLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking login button visibility:', error);
          }
        }
        
        await page.screenshot({ path: `login-state-final-${Date.now()}.png` });
        
        console.log(`Login state detected: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
        expect(isLoggedIn).toBe(true);
      } catch (error) {
        console.log('Error opening account menu:', error);
        await page.screenshot({ path: `account-menu-error-${Date.now()}.png` });
        throw error;
      }
    } catch (error) {
      console.log('Error in login test:', error);
      await page.screenshot({ path: `login-test-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    try {
      const loginPage = await Navigation.goToLoginPage(page);
      await page.screenshot({ path: `before-login-invalid-${Date.now()}.png` });
      
      await loginPage.login('invalid@example.com', 'invalidPassword');
      await page.screenshot({ path: `after-login-invalid-${Date.now()}.png` });
      
      const errorMessage = await loginPage.getErrorMessage();
      console.log(`Error message: "${errorMessage}"`);
      
      const validErrorMessages = [
        'Invalid email or password',
        'Invalid credentials',
        'Wrong email or password',
        'Invalid login'
      ];
      
      const hasValidError = validErrorMessages.some(msg => 
        errorMessage.toLowerCase().includes(msg.toLowerCase())
      );
      
      expect(hasValidError).toBe(true);
    } catch (error) {
      console.log('Error in invalid credentials test:', error);
      await page.screenshot({ path: `invalid-login-test-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should logout successfully', async ({ page }) => {
    try {
      const registeredUser = getRegisteredUser();
      console.log(`Logging in with registered user: ${registeredUser.email}`);
      
      const loginPage = await Navigation.goToLoginPage(page);
      await loginPage.login(registeredUser.email, registeredUser.password);
      await page.screenshot({ path: `after-custom-login-${Date.now()}.png` });
      
      const homePage = new HomePage(page);
      const basePage = new BasePage(page);
      
      await basePage.dismissOverlays(3, 1000);
      
      console.log('Attempting to open account menu before logout...');
      await page.screenshot({ path: `before-logout-${Date.now()}.png` });
      
      try {
        await homePage.openAccountMenu();
        console.log('Account menu opened successfully before logout');
        
        await page.screenshot({ path: `after-open-account-menu-logout-${Date.now()}.png` });
        
        let isLoggedIn = false;
        
        try {
          const logoutSelectors = [
            '#navbarLogoutButton',
            'button:has-text("Logout")',
            'span:has-text("Logout")',
            'mat-list-item:has-text("Logout")',
            '[aria-label="Logout"]'
          ];
          
          for (const selector of logoutSelectors) {
            const logoutElement = page.locator(selector).first();
            if (await logoutElement.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log(`Found logout button with selector: ${selector}`);
              isLoggedIn = true;
              break;
            }
          }
        } catch (error) {
          console.log('Error checking logout button visibility:', error);
        }
        
        if (!isLoggedIn) {
          try {
            if (await page.locator(`text=${registeredUser.email}`).first().isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('User email is visible in the page');
              isLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking user email visibility:', error);
          }
        }
        
        if (!isLoggedIn) {
          const pageContent = await page.content();
          if (pageContent.includes('Logout') || pageContent.includes('Log out')) {
            console.log('Found "Logout" text in page content');
            isLoggedIn = true;
          }
        }
        
        if (!isLoggedIn) {
          try {
            const loginVisible = await page.locator('#navbarLoginButton, button:has-text("Login")').first()
              .isVisible({ timeout: 2000 }).catch(() => false);
            if (!loginVisible) {
              console.log('Login button is not visible, assuming logged in');
              isLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking login button visibility:', error);
          }
        }
        
        await page.screenshot({ path: `login-state-before-logout-final-${Date.now()}.png` });
        
        console.log(`Login state before logout: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
        expect(isLoggedIn).toBe(true);
      } catch (error) {
        console.log('Error opening account menu before logout:', error);
        await page.screenshot({ path: `account-menu-error-before-logout-${Date.now()}.png` });
        throw error;
      }
      
      await homePage.logout();
      await page.screenshot({ path: `after-logout-${Date.now()}.png` });
      
      await page.waitForTimeout(2000);
      
      console.log('Verifying successful logout...');
      
      const currentUrl = page.url();
      console.log(`Current URL after logout: ${currentUrl}`);
      const isOnLoginPage = currentUrl.includes('/login');
      
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');
      const loginFormVisible = await emailInput.isVisible({ timeout: 5000 })
        .catch(() => false) || await passwordInput.isVisible({ timeout: 5000 })
        .catch(() => false);
      
      console.log(`Login form visible: ${loginFormVisible}`);
      
      let logoutButtonVisible = false;
      try {
        await homePage.openAccountMenu();
        await page.screenshot({ path: `after-logout-menu-${Date.now()}.png` });
        
        const logoutSelectors = [
          '#navbarLogoutButton',
          'button:has-text("Logout")',
          'span:has-text("Logout")',
          'mat-list-item:has-text("Logout")',
          '[aria-label="Logout"]'
        ];
        
        for (const selector of logoutSelectors) {
          const logoutElement = page.locator(selector).first();
          if (await logoutElement.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`Found logout button after logout with selector: ${selector}`);
            logoutButtonVisible = true;
            break;
          }
        }
      } catch (error) {
        console.log('Error checking logout button visibility after logout:', error);
      }
      
      console.log(`Logout button visible after logout: ${logoutButtonVisible}`);
      
      const logoutSuccessful = isOnLoginPage || loginFormVisible || !logoutButtonVisible;
      console.log(`Logout successful: ${logoutSuccessful}`);
      
      expect(logoutSuccessful).toBe(true);
    } catch (error) {
      console.log('Error in logout test:', error);
      await page.screenshot({ path: `logout-test-error-${Date.now()}.png` });
      throw error;
    }
  });
  
  test('should remember user when "Remember Me" is checked', async ({ page }) => {
    try {
      const registeredUser = getRegisteredUser();
      console.log(`Logging in with registered user and Remember Me: ${registeredUser.email}`);
      
      const loginPage = await Navigation.goToLoginPage(page);
      await page.screenshot({ path: `before-remember-login-${Date.now()}.png` });
      
      await loginPage.login(registeredUser.email, registeredUser.password, true);
      await page.screenshot({ path: `after-remember-login-${Date.now()}.png` });
      
      const homePage = new HomePage(page);
      const basePage = new BasePage(page);
      
      await basePage.dismissOverlays(3, 1000);
      
      console.log('Attempting to open account menu before reload...');
      await page.screenshot({ path: `before-reload-${Date.now()}.png` });
      
      try {
        await homePage.openAccountMenu();
        console.log('Account menu opened successfully before reload');
        
        await page.screenshot({ path: `after-open-account-menu-reload-${Date.now()}.png` });
        
        let isLoggedIn = false;
        
        try {
          const logoutSelectors = [
            '#navbarLogoutButton',
            'button:has-text("Logout")',
            'span:has-text("Logout")',
            'mat-list-item:has-text("Logout")',
            '[aria-label="Logout"]'
          ];
          
          for (const selector of logoutSelectors) {
            const logoutElement = page.locator(selector).first();
            if (await logoutElement.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log(`Found logout button with selector: ${selector}`);
              isLoggedIn = true;
              break;
            }
          }
        } catch (error) {
          console.log('Error checking logout button visibility:', error);
        }
        
        if (!isLoggedIn) {
          try {
            if (await page.locator(`text=${registeredUser.email}`).first().isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('User email is visible in the page');
              isLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking user email visibility:', error);
          }
        }
        
        if (!isLoggedIn) {
          const pageContent = await page.content();
          if (pageContent.includes('Logout') || pageContent.includes('Log out')) {
            console.log('Found "Logout" text in page content');
            isLoggedIn = true;
          }
        }
        
        if (!isLoggedIn) {
          try {
            const loginVisible = await page.locator('#navbarLoginButton, button:has-text("Login")').first()
              .isVisible({ timeout: 2000 }).catch(() => false);
            if (!loginVisible) {
              console.log('Login button is not visible, assuming logged in');
              isLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking login button visibility:', error);
          }
        }
        
        await page.screenshot({ path: `login-state-before-reload-final-${Date.now()}.png` });
        
        console.log(`Login state before reload: ${isLoggedIn ? 'Logged in' : 'Not logged in'}`);
        expect(isLoggedIn).toBe(true);
      } catch (error) {
        console.log('Error opening account menu before reload:', error);
        await page.screenshot({ path: `account-menu-error-before-reload-${Date.now()}.png` });
        throw error;
      }
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      await basePage.dismissOverlays(3, 1000);
      
      console.log('Attempting to open account menu after reload...');
      await page.screenshot({ path: `before-open-account-menu-after-reload-${Date.now()}.png` });
      
      try {
        await homePage.openAccountMenu();
        console.log('Account menu opened successfully after reload');
        
        await page.screenshot({ path: `after-open-account-menu-after-reload-${Date.now()}.png` });
        
        let isStillLoggedIn = false;
        
        try {
          const logoutSelectors = [
            '#navbarLogoutButton',
            'button:has-text("Logout")',
            'span:has-text("Logout")',
            'mat-list-item:has-text("Logout")',
            '[aria-label="Logout"]'
          ];
          
          for (const selector of logoutSelectors) {
            const logoutElement = page.locator(selector).first();
            if (await logoutElement.isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log(`Found logout button after reload with selector: ${selector}`);
              isStillLoggedIn = true;
              break;
            }
          }
        } catch (error) {
          console.log('Error checking logout button visibility after reload:', error);
        }
        
        if (!isStillLoggedIn) {
          try {
            if (await page.locator(`text=${registeredUser.email}`).first().isVisible({ timeout: 2000 }).catch(() => false)) {
              console.log('User email is visible in the page after reload');
              isStillLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking user email visibility after reload:', error);
          }
        }
        
        if (!isStillLoggedIn) {
          const pageContent = await page.content();
          if (pageContent.includes('Logout') || pageContent.includes('Log out')) {
            console.log('Found "Logout" text in page content after reload');
            isStillLoggedIn = true;
          }
        }
        
        if (!isStillLoggedIn) {
          try {
            const loginVisible = await page.locator('#navbarLoginButton, button:has-text("Login")').first()
              .isVisible({ timeout: 2000 }).catch(() => false);
            if (!loginVisible) {
              console.log('Login button is not visible after reload, assuming still logged in');
              isStillLoggedIn = true;
            }
          } catch (error) {
            console.log('Error checking login button visibility after reload:', error);
          }
        }
        
        await page.screenshot({ path: `login-state-after-reload-final-${Date.now()}.png` });
        
        console.log(`Login state after reload: ${isStillLoggedIn ? 'Still logged in' : 'Not logged in'}`);
        expect(isStillLoggedIn).toBe(true);
      } catch (error) {
        console.log('Error opening account menu after reload:', error);
        await page.screenshot({ path: `account-menu-error-after-reload-${Date.now()}.png` });
        throw error;
      }
    } catch (error) {
      console.log('Error in remember me test:', error);
      await page.screenshot({ path: `remember-test-error-${Date.now()}.png` });
      throw error;
    }
  });
});
