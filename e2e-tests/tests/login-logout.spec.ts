import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { TestData } from '../src/utils/testData';

test.describe('Login and Logout', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const testUsers = TestData.getTestUsers();
    const testUser = testUsers[0];
    
    const loginPage = await Navigation.goToLoginPage(page);
    
    await loginPage.login(testUser.email, testUser.password);
    
    const homePage = new HomePage(page);
    await homePage.openAccountMenu();
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = await Navigation.goToLoginPage(page);
    
    await loginPage.login('invalid@example.com', 'invalidPassword');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid email or password');
  });
  
  test('should logout successfully', async ({ page }) => {
    await Auth.loginAsAdmin(page);
    
    const homePage = new HomePage(page);
    await homePage.openAccountMenu();
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
    
    await homePage.logout();
    
    await homePage.openAccountMenu();
    await expect(page.locator('#navbarLoginButton')).toBeVisible();
  });
  
  test('should remember user when "Remember Me" is checked', async ({ page }) => {
    const testUsers = TestData.getTestUsers();
    const testUser = testUsers[0];
    
    const loginPage = await Navigation.goToLoginPage(page);
    
    await loginPage.login(testUser.email, testUser.password, true);
    
    const homePage = new HomePage(page);
    await homePage.openAccountMenu();
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
    
    await page.reload();
    await homePage.openAccountMenu();
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
  });
});
