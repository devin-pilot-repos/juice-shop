# Test info

- Name: Connectivity Test >> can access public Juice Shop instance
- Location: /home/ubuntu/repos/juice-shop/e2e-tests/tests/connectivity.spec.ts:4:3

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

╔════════════════════════════════════════════════════════════════════════════════════════════════╗
║ Looks like you launched a headed browser without having a XServer running.                     ║
║ Set either 'headless: true' or use 'xvfb-run <your-playwright-app>' before running Playwright. ║
║                                                                                                ║
║ <3 Playwright Team                                                                             ║
╚════════════════════════════════════════════════════════════════════════════════════════════════╝
Call log:
  - <launching> /home/ubuntu/.cache/ms-playwright/firefox-1482/firefox/firefox -no-remote -wait-for-browser -foreground -profile /tmp/playwright_firefoxdev_profile-ldOcih -juggler-pipe -silent
  - <launched> pid=26584
  - [pid=26584][err] Error: no DISPLAY environment variable specified
  - [pid=26584] <process did exit: exitCode=1, signal=null>
  - [pid=26584] starting temporary directories cleanup

```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Connectivity Test', () => {
>  4 |   test('can access public Juice Shop instance', async ({ page }) => {
     |   ^ Error: browserType.launch: Target page, context or browser has been closed
   5 |     test.setTimeout(60000);
   6 |     
   7 |     await page.goto('https://juice-shop.herokuapp.com');
   8 |     
   9 |     const title = await page.title();
  10 |     console.log(`Page title: ${title}`);
  11 |     
  12 |     const logo = page.locator('.logo');
  13 |     if (await logo.isVisible()) {
  14 |       console.log('Logo is visible');
  15 |     } else {
  16 |       console.log('Logo is not visible');
  17 |     }
  18 |     
  19 |     await page.screenshot({ path: 'connectivity-test.png' });
  20 |     
  21 |     await expect(page).toHaveTitle(/Juice Shop/);
  22 |   });
  23 | });
  24 |
```