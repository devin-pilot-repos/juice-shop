import { test, expect } from '@playwright/test';
import { EnvironmentManager } from '../src/utils/environmentManager';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { Auth } from '../src/utils/auth';
import { StorageService } from '../src/utils/storageService';

test.describe('Environment-specific tests', () => {
  test.beforeEach(async () => {
    EnvironmentManager.initialize();
  });

  test('should use correct base URL for current environment', async ({ page }) => {
    const baseUrl = EnvironmentManager.getBaseUrl();
    
    await page.goto(baseUrl);
    
    await expect(page).toHaveTitle(/OWASP Juice Shop/);
  });

  test('should login with environment-specific credentials', async ({ page }) => {
    const adminCredentials = EnvironmentManager.getAdminCredentials();
    
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    await loginPage.login(adminCredentials.email, adminCredentials.password);
    
    const homePage = new HomePage(page);
    await homePage.openAccountMenu();
    
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
  });

  test('should use environment-specific storage settings', async ({ page }) => {
    await EnvironmentManager.setupEnvironment(page);
    
    const storageService = StorageService.getInstance();
    await storageService.initialize(page);
    const environment = await storageService.getItem('environment');
    
    expect(environment).toBe(EnvironmentManager.getEnvironment().name.toLowerCase());
  });

  test('should use Auth utility with environment credentials', async ({ page }) => {
    await Auth.loginAsAdmin(page);
    
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
    
    await Auth.logout(page);
    
    await expect(page.locator('#navbarLoginButton')).toBeVisible();
  });
});
