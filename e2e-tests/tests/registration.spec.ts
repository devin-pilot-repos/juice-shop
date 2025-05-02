import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../src/pages/RegistrationPage';
import { LoginPage } from '../src/pages/LoginPage';
import { HomePage } from '../src/pages/HomePage';
import { Navigation } from '../src/utils/navigation';
import { TestData } from '../src/utils/testData';

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    const email = TestData.generateRandomEmail();
    const password = TestData.generateRandomPassword();
    const securityAnswer = 'Test Answer';
    
    const registrationPage = await Navigation.goToRegistrationPage(page);
    
    await registrationPage.register(email, password, 1, securityAnswer);
    
    const loginPage = new LoginPage(page);
    await expect(page).toHaveURL(/.*\/login/);
    
    await loginPage.login(email, password);
    
    const homePage = new HomePage(page);
    await homePage.openAccountMenu();
    await expect(page.locator('#navbarLogoutButton')).toBeVisible();
  });
  
  test('should show error when registering with existing email', async ({ page }) => {
    const email = 'test1@example.com'; // From TestData.getTestUsers()
    const password = TestData.generateRandomPassword();
    const securityAnswer = 'Test Answer';
    
    const registrationPage = await Navigation.goToRegistrationPage(page);
    
    await registrationPage.register(email, password, 1, securityAnswer);
    
    const errorMessage = await registrationPage.getErrorMessage();
    expect(errorMessage).toContain('already exists');
  });
  
  test('should show error when passwords do not match', async ({ page }) => {
    const email = TestData.generateRandomEmail();
    const password = TestData.generateRandomPassword();
    const differentPassword = password + '!';
    const securityAnswer = 'Test Answer';
    
    const registrationPage = await Navigation.goToRegistrationPage(page);
    
    await page.locator('#emailControl').fill(email);
    await page.locator('#passwordControl').fill(password);
    await page.locator('#repeatPasswordControl').fill(differentPassword);
    await registrationPage.selectSecurityQuestion(1);
    await page.locator('#securityAnswerControl').fill(securityAnswer);
    await page.locator('#registerButton').click();
    
    const errorMessage = await registrationPage.getErrorMessage();
    expect(errorMessage).toContain('do not match');
  });
});
