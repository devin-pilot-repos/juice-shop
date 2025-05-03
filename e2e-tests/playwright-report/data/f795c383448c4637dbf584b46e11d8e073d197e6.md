# Test info

- Name: Connectivity Test >> can access public Juice Shop instance
- Location: /home/ubuntu/repos/juice-shop/e2e-tests/tests/connectivity.spec.ts:4:3

# Error details

```
Error: page.goto: Test timeout of 60000ms exceeded.
Call log:
  - navigating to "https://juice-shop.herokuapp.com/", waiting until "load"

    at /home/ubuntu/repos/juice-shop/e2e-tests/tests/connectivity.spec.ts:7:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Connectivity Test', () => {
   4 |   test('can access public Juice Shop instance', async ({ page }) => {
   5 |     test.setTimeout(60000);
   6 |     
>  7 |     await page.goto('https://juice-shop.herokuapp.com');
     |                ^ Error: page.goto: Test timeout of 60000ms exceeded.
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