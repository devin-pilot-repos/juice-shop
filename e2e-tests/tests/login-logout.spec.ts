import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { getCurrentEnvironment } from '../config/environments';

const env = getCurrentEnvironment();

test.describe('Login and Logout', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'home-page-before-login.png' });
    console.log('Current URL before login:', page.url());
    
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    await page.screenshot({ path: 'login-page-loaded.png' });
    console.log('Current URL after navigation:', page.url());
    
    await loginPage.login(env.credentials.admin.email, env.credentials.admin.password);
    
    const homePage = new HomePage(page);
    expect(await homePage.isLoggedIn()).toBe(true);
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid email or password');
  });
  
  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.credentials.admin.email, env.credentials.admin.password);
    
    const homePage = new HomePage(page);
    await homePage.logout();
    
    expect(await homePage.isLoggedIn()).toBe(false);
  });
  
  test('should remember user when "Remember Me" is checked', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.credentials.admin.email, env.credentials.admin.password, true);
    
    const homePage = new HomePage(page);
    expect(await homePage.isLoggedIn()).toBe(true);
    
    const cookies = await context.cookies();
    
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    const newHomePage = new HomePage(newPage);
    expect(await newHomePage.isLoggedIn()).toBe(true);
  });
});
