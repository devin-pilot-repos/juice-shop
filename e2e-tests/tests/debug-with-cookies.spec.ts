import { test } from '@playwright/test';
import { getCurrentEnvironment } from '../config/environments';

test('Debug login with cookie handling', async ({ page, context }) => {
  console.log('Starting debug test with cookie handling...');
  const env = getCurrentEnvironment();
  console.log(`Using environment: ${env.name} with baseUrl: ${env.baseUrl}`);
  
  await context.addCookies([
    {
      name: 'welcomebanner_status',
      value: 'dismiss',
      domain: new URL(env.baseUrl).hostname,
      path: '/',
    },
    {
      name: 'cookieconsent_status',
      value: 'dismiss',
      domain: new URL(env.baseUrl).hostname,
      path: '/',
    }
  ]);
  
  await page.goto('/');
  console.log('Current URL after navigation to home:', page.url());
  await page.screenshot({ path: 'debug-home-with-cookies.png' });
  
  await page.goto('/#/login');
  console.log('Current URL after navigation to login:', page.url());
  await page.screenshot({ path: 'debug-login-with-cookies.png' });
  
  const emailInput = page.locator('input[name="email"]');
  console.log('Email input visible:', await emailInput.isVisible());
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(env.credentials.admin.email);
    await page.locator('input[name="password"]').fill(env.credentials.admin.password);
    
    await page.screenshot({ path: 'debug-before-login-click.png' });
    
    await page.locator('button[id="loginButton"]').click({ timeout: 10000 });
    
    await page.waitForTimeout(2000);
    console.log('Current URL after login attempt:', page.url());
    await page.screenshot({ path: 'debug-after-login.png' });
    
    const accountMenu = page.locator('[aria-label="Account"]');
    console.log('Account menu visible:', await accountMenu.isVisible());
    
    const loggedInIndicators = [
      '[aria-label="Show the shopping cart"]',
      '#navbarLogoutButton',
      'button[aria-label="Go to user profile"]',
      '[aria-label="Account"]'
    ];
    
    for (const selector of loggedInIndicators) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      console.log(`Indicator "${selector}" visible:`, isVisible);
      
      if (isVisible) {
        console.log(`Found logged-in indicator with selector: ${selector}`);
        await element.highlight();
        await page.screenshot({ path: `debug-found-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
      }
    }
  }
});
