import { defineConfig, devices } from '@playwright/test';
import { EnvironmentManager } from './src/utils/environmentManager';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const env = EnvironmentManager.getEnvironment();

export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 20 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 3000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: env.baseUrl,
    
    httpCredentials: env.name === 'Development Environment' ? {
      username: process.env.TUNNEL_USERNAME || 'user',
      password: process.env.TUNNEL_PASSWORD || 'password'
    } : undefined,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Add headless setting from environment */
    headless: process.env.HEADLESS !== 'false',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
      },
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
      },
    },
    {
      name: 'webkit',
      use: { 
        browserName: 'webkit',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
});
