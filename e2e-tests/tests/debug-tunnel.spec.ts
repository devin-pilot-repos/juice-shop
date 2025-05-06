import { test } from '@playwright/test';

test('Debug tunnel URL connection', async ({ page, browser }) => {
  console.log('Starting debug test for tunnel URL...');
  
  console.log('Navigating to tunnel URL with explicit auth...');
  
  const context = await browser.newContext({
    httpCredentials: {
      username: 'user',
      password: '6c4e51d892a1c360799100396e7948d7'
    }
  });
  
  const authPage = await context.newPage();
  
  try {
    console.log('Navigating to tunnel base URL...');
    await authPage.goto('https://local-juice-shop-app-tunnel-lvqj2tij.devinapps.com', {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    
    console.log('Base URL loaded, current URL:', authPage.url());
    await authPage.screenshot({ path: 'debug-tunnel-base.png' });
    
    console.log('Navigating to login page...');
    await authPage.goto('https://local-juice-shop-app-tunnel-lvqj2tij.devinapps.com/#/login', {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });
    
    console.log('Login page loaded, current URL:', authPage.url());
    await authPage.screenshot({ path: 'debug-tunnel-login.png' });
    
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
      
      if (isVisible) {
        console.log(`Found working selector: ${selector}`);
        await field.highlight();
        await authPage.screenshot({ path: `debug-tunnel-found-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
      }
    }
    
    const html = await authPage.content();
    console.log('Page HTML excerpt:', html.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('Error during tunnel navigation:', error);
    await authPage.screenshot({ path: 'debug-tunnel-error.png' });
  }
});
