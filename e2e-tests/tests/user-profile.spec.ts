import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { BasePage } from '../src/pages/BasePage';
import { EnvironmentManager } from '../src/utils/environmentManager';

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    EnvironmentManager.initialize();
    await Auth.loginAsCustomer(page);
  });

  test('should display user profile information', async ({ page }) => {
    try {
      const homePage = new HomePage(page);
      const profileNavigated = await homePage.goToUserProfile();
      
      if (!profileNavigated) {
        console.log('Failed to navigate to profile page, trying direct navigation');
        await page.goto(`${EnvironmentManager.getBaseUrl()}/#/profile`);
      }
      
      await expect(page).toHaveURL(/.*\/profile/);
      
      await expect(page.locator('h1:has-text("User Profile")')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      
      const credentials = EnvironmentManager.getCustomerCredentials();
      const emailField = page.locator('input[name="email"]');
      const emailValue = await emailField.inputValue();
      expect(emailValue).toContain(credentials.email);
    } catch (error) {
      console.log('Error in user profile test:', error);
      await page.screenshot({ path: `user-profile-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should update user profile information', async ({ page }) => {
    try {
      const homePage = new HomePage(page);
      const profileNavigated = await homePage.goToUserProfile();
      
      if (!profileNavigated) {
        console.log('Failed to navigate to profile page, trying direct navigation');
        await page.goto(`${EnvironmentManager.getBaseUrl()}/#/profile`);
      }
      
      const newUsername = `test_user_${Date.now()}`;
      await page.locator('input[name="username"]').fill(newUsername);
      
      await page.locator('button:has-text("Save")').click();
      
      await expect(page.locator('text=Your profile has been updated')).toBeVisible();
      
      await page.reload();
      
      const usernameField = page.locator('input[name="username"]');
      const usernameValue = await usernameField.inputValue();
      expect(usernameValue).toBe(newUsername);
    } catch (error) {
      console.log('Error in update profile test:', error);
      await page.screenshot({ path: `update-profile-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should change user password', async ({ page }) => {
    try {
      const homePage = new HomePage(page);
      const profileNavigated = await homePage.goToUserProfile();
      
      if (!profileNavigated) {
        console.log('Failed to navigate to profile page, trying direct navigation');
        await page.goto(`${EnvironmentManager.getBaseUrl()}/#/profile`);
      }
      
      await page.locator('button:has-text("Change Password")').click();
      
      const credentials = EnvironmentManager.getCustomerCredentials();
      
      await page.locator('input[name="current"]').fill(credentials.password);
      await page.locator('input[name="new"]').fill(credentials.password + '1');
      await page.locator('input[name="repeat"]').fill(credentials.password + '1');
      
      await page.locator('button:has-text("Change")').click();
      
      await expect(page.locator('text=Your password has been changed')).toBeVisible();
      
      await page.locator('input[name="current"]').fill(credentials.password + '1');
      await page.locator('input[name="new"]').fill(credentials.password);
      await page.locator('input[name="repeat"]').fill(credentials.password);
      
      await page.locator('button:has-text("Change")').click();
      
      await expect(page.locator('text=Your password has been changed')).toBeVisible();
    } catch (error) {
      console.log('Error in change password test:', error);
      await page.screenshot({ path: `change-password-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should display order history', async ({ page }) => {
    try {
      console.log('Starting order history test...');
      await page.screenshot({ path: `order-history-test-start-${Date.now()}.png` });
      
      const isLoggedIn = await Auth.isLoggedIn(page);
      if (!isLoggedIn) {
        console.log('Not logged in, logging in first...');
        await Auth.loginAsCustomer(page);
      }
      
      console.log('Navigating directly to order history page...');
      await page.goto(`${EnvironmentManager.getBaseUrl()}/#/order-history`);
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: `order-history-after-direct-nav-${Date.now()}.png` });
      
      const url = page.url();
      console.log(`Current URL: ${url}`);
      
      if (!url.includes('/order-history')) {
        console.log('Not on order history page, trying alternative navigation...');
        
        const homePage = new HomePage(page);
        const profileNavigated = await homePage.goToUserProfile();
        
        if (!profileNavigated) {
          console.log('Failed to navigate to profile page, trying direct navigation');
          await page.goto(`${EnvironmentManager.getBaseUrl()}/#/profile`);
          await page.waitForTimeout(2000);
        }
        
        await page.screenshot({ path: `order-history-after-profile-nav-${Date.now()}.png` });
        
        console.log('Trying to click on Orders & Payment...');
        const orderLinks = [
          'button:has-text("Orders & Payment")',
          'a:has-text("Orders & Payment")',
          'button:has-text("Order History")',
          'a:has-text("Order History")',
          'mat-nav-list a:has-text("Order")',
          '[aria-label="Go to order history"]'
        ];
        
        let clicked = false;
        for (const selector of orderLinks) {
          try {
            const link = page.locator(selector);
            const isVisible = await link.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isVisible) {
              console.log(`Found order link with selector: ${selector}`);
              await link.click({ timeout: 5000, force: true }).catch(e => {
                console.log(`Click failed, but continuing: ${e instanceof Error ? e.message : String(e)}`);
              });
              
              await page.waitForTimeout(2000);
              clicked = true;
              break;
            }
          } catch (error) {
            console.log(`Error with order link selector ${selector}:`, error);
          }
        }
        
        if (!clicked) {
          console.log('Could not find any order links, trying direct navigation again');
          await page.goto(`${EnvironmentManager.getBaseUrl()}/#/order-history`);
          await page.waitForTimeout(2000);
        }
        
        await page.screenshot({ path: `order-history-after-link-click-${Date.now()}.png` });
      }
      
      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      
      expect(finalUrl).toMatch(/order-history|orders|history/);
      
      const headingSelectors = [
        'h1:has-text("Order History")',
        'h1:has-text("Orders")',
        'h2:has-text("Order History")',
        'h2:has-text("Orders")',
        '.mat-card-title:has-text("Order History")',
        '.mat-card-title:has-text("Orders")'
      ];
      
      let headingFound = false;
      for (const selector of headingSelectors) {
        try {
          const isVisible = await page.locator(selector).isVisible({ timeout: 5000 }).catch(() => false);
          if (isVisible) {
            console.log(`Found heading with selector: ${selector}`);
            headingFound = true;
            break;
          }
        } catch (error) {
          console.log(`Error checking heading selector ${selector}:`, error);
        }
      }
      
      if (!headingFound) {
        console.log('Could not find order history heading, checking for other indicators');
        
        const orderIndicators = [
          'mat-table',
          'table',
          'text=No orders placed yet',
          'text=Order ID',
          'text=Order Date',
          'text=Total Price',
          '[aria-label="Orders table"]'
        ];
        
        let indicatorFound = false;
        for (const selector of orderIndicators) {
          try {
            const isVisible = await page.locator(selector).isVisible({ timeout: 5000 }).catch(() => false);
            if (isVisible) {
              console.log(`Found order indicator with selector: ${selector}`);
              indicatorFound = true;
              break;
            }
          } catch (error) {
            console.log(`Error checking indicator selector ${selector}:`, error);
          }
        }
        
        expect(indicatorFound).toBeTruthy();
      } else {
        expect(headingFound).toBeTruthy();
      }
      
      await page.screenshot({ path: `order-history-final-${Date.now()}.png` });
      
    } catch (error) {
      console.log('Error in order history test:', error);
      await page.screenshot({ path: `order-history-error-${Date.now()}.png` });
      throw error;
    }
  });
});
