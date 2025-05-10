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
  - <launching> /home/ubuntu/.cache/ms-playwright/chromium-1169/chrome-linux/chrome --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DeferRendererTasksAfterInput,DestroyProfileOnBrowserClose,DialMediaRouteProvider,ExtensionManifestV2Disabled,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-227KaF --remote-debugging-pipe --no-startup-window
  - <launched> pid=26588
  - [pid=26588][err] [26588:26588:0503/085335.981190:ERROR:ui/ozone/platform/x11/ozone_platform_x11.cc:249] Missing X server or $DISPLAY
  - [pid=26588][err] [26588:26588:0503/085335.981936:ERROR:ui/aura/env.cc:257] The platform failed to initialize.  Exiting.

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