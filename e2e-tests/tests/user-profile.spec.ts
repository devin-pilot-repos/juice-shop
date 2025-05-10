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
      await homePage.openAccountMenu();
      
      await page.locator('text=My Account').click();
      
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
      await homePage.openAccountMenu();
      
      await page.locator('text=My Account').click();
      
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
      await homePage.openAccountMenu();
      
      await page.locator('text=My Account').click();
      
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
      const homePage = new HomePage(page);
      await homePage.openAccountMenu();
      
      await page.locator('text=Order History').click();
      
      await expect(page).toHaveURL(/.*\/order-history/);
      
      await expect(page.locator('h1:has-text("Order History")')).toBeVisible();
      
      const hasOrders = await page.locator('mat-table').isVisible().catch(() => false);
      const noOrdersMessage = await page.locator('text=No orders placed yet').isVisible().catch(() => false);
      
      expect(hasOrders || noOrdersMessage).toBeTruthy();
    } catch (error) {
      console.log('Error in order history test:', error);
      await page.screenshot({ path: `order-history-error-${Date.now()}.png` });
      throw error;
    }
  });
});
