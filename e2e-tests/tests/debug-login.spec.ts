import { test } from '@playwright/test';

test('Debug login page loading', async ({ page, browser }) => {
  console.log('Starting debug test...');
  
  console.log('Navigating to login page...');
  await page.goto('/#/login', { timeout: 60000 });
  console.log('Current URL after navigation:', page.url());
  await page.screenshot({ path: 'debug-login-direct.png' });
  
  const emailField = page.locator('input[name="email"]');
  const isEmailVisible = await emailField.isVisible().catch(() => false);
  console.log('Email field visible (direct navigation):', isEmailVisible);
  
  console.log('Creating authenticated context...');
  const context = await browser.newContext({
    httpCredentials: {
      username: 'user',
      password: '6c4e51d892a1c360799100396e7948d7'
    }
  });
  
  const authPage = await context.newPage();
  
  console.log('Navigating to base URL with auth...');
  await authPage.goto('https://local-juice-shop-app-tunnel-lvqj2tij.devinapps.com', {
    timeout: 60000,
    waitUntil: 'domcontentloaded'
  });
  
  console.log('Base URL loaded, current URL:', authPage.url());
  await authPage.screenshot({ path: 'debug-base-url.png' });
  
  console.log('Navigating to login page with auth...');
  await authPage.goto('https://local-juice-shop-app-tunnel-lvqj2tij.devinapps.com/#/login', {
    timeout: 60000,
    waitUntil: 'domcontentloaded'
  });
  
  console.log('Login page loaded, current URL:', authPage.url());
  await authPage.screenshot({ path: 'debug-login-auth.png' });
  
  const authEmailField = authPage.locator('input[name="email"]');
  const isAuthEmailVisible = await authEmailField.isVisible().catch(() => false);
  console.log('Email field visible (with auth):', isAuthEmailVisible);
  
  const selectors = [
    'input[name="email"]',
    '#email',
    'input[type="email"]',
    'mat-form-field input'
  ];
  
  for (const selector of selectors) {
    const field = authPage.locator(selector);
    const isVisible = await field.isVisible().catch(() => false);
    console.log(`Selector "${selector}" visible:`, isVisible);
  }
  
  const html = await authPage.content();
  console.log('Page HTML excerpt:', html.substring(0, 500) + '...');
});
