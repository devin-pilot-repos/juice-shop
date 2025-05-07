import { test, expect } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environments';

test('Handle welcome dialog and login', async ({ page }) => {
  console.log('Starting overlay handling test...');
  const env = getCurrentEnvironment();
  console.log(`Using environment: ${env.name} with baseUrl: ${env.baseUrl}`);
  
  await page.goto('/#/login');
  console.log('Current URL after navigation:', page.url());
  await page.screenshot({ path: 'before-dismiss-overlay.png' });
  
  try {
    const welcomeBanner = page.locator('.cdk-overlay-container');
    if (await welcomeBanner.isVisible()) {
      console.log('Welcome banner detected, attempting to dismiss...');
      
      const closeButton = page.locator('button[aria-label="Close Welcome Banner"]');
      if (await closeButton.isVisible()) {
        console.log('Close button found, clicking it...');
        await closeButton.click({ force: true });
      } else {
        console.log('No close button found, clicking outside dialog...');
        await page.mouse.click(10, 10);
      }
      
      await page.waitForTimeout(1000);
      console.log('After dismissal attempt, overlay still visible:', await welcomeBanner.isVisible());
    } else {
      console.log('No welcome banner detected');
    }
  } catch (error) {
    console.log('Error handling overlay:', error);
  }
  
  await page.screenshot({ path: 'after-dismiss-overlay.png' });
  
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginButton = page.locator('button[id="loginButton"]');
  
  console.log('Email input visible:', await emailInput.isVisible());
  console.log('Password input visible:', await passwordInput.isVisible());
  console.log('Login button visible:', await loginButton.isVisible());
  
  if (await emailInput.isVisible()) {
    await emailInput.fill('admin@juice-sh.op');
    await passwordInput.fill('admin123');
    
    await page.screenshot({ path: 'before-login-click.png' });
    
    try {
      await loginButton.click({ force: true, timeout: 10000 });
      console.log('Login button clicked successfully');
    } catch (error) {
      console.log('Error clicking login button:', error);
      
      await page.evaluate(() => {
        const button = document.querySelector('button[id="loginButton"]');
        if (button) (button as HTMLElement).click();
      });
      console.log('Attempted JavaScript click on login button');
    }
    
    await page.screenshot({ path: 'after-login-attempt.png' });
  }
});
