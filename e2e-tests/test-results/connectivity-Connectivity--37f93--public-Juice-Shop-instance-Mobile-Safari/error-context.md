# Test info

- Name: Connectivity Test >> can access public Juice Shop instance
- Location: /home/ubuntu/repos/juice-shop/e2e-tests/tests/connectivity.spec.ts:4:3

# Error details

```
Error: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Missing libraries:                                   ║
║     libgtk-4.so.1                                    ║
║     libgraphene-1.0.so.0                             ║
║     libxslt.so.1                                     ║
║     libwoff2dec.so.1.0.2                             ║
║     libvpx.so.7                                      ║
║     libevent-2.1.so.7                                ║
║     libopus.so.0                                     ║
║     libgstallocators-1.0.so.0                        ║
║     libgstapp-1.0.so.0                               ║
║     libgstpbutils-1.0.so.0                           ║
║     libgstaudio-1.0.so.0                             ║
║     libgsttag-1.0.so.0                               ║
║     libgstvideo-1.0.so.0                             ║
║     libgstgl-1.0.so.0                                ║
║     libgstcodecparsers-1.0.so.0                      ║
║     libgstfft-1.0.so.0                               ║
║     libflite.so.1                                    ║
║     libflite_usenglish.so.1                          ║
║     libflite_cmu_grapheme_lang.so.1                  ║
║     libflite_cmu_grapheme_lex.so.1                   ║
║     libflite_cmu_indic_lang.so.1                     ║
║     libflite_cmu_indic_lex.so.1                      ║
║     libflite_cmulex.so.1                             ║
║     libflite_cmu_time_awb.so.1                       ║
║     libflite_cmu_us_awb.so.1                         ║
║     libflite_cmu_us_kal16.so.1                       ║
║     libflite_cmu_us_kal.so.1                         ║
║     libflite_cmu_us_rms.so.1                         ║
║     libflite_cmu_us_slt.so.1                         ║
║     libwebpdemux.so.2                                ║
║     libavif.so.13                                    ║
║     libharfbuzz-icu.so.0                             ║
║     libwebpmux.so.3                                  ║
║     libenchant-2.so.2                                ║
║     libsecret-1.so.0                                 ║
║     libhyphen.so.0                                   ║
║     libmanette-0.2.so.0                              ║
║     libGLESv2.so.2                                   ║
║     libx264.so                                       ║
╚══════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Connectivity Test', () => {
>  4 |   test('can access public Juice Shop instance', async ({ page }) => {
     |   ^ Error: browserType.launch: 
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