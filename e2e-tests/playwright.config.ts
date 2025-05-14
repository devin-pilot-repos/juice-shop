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
  timeout: 120 * 1000, // Increased from 60s to 120s to handle slow operations
  /* Exclude non-functional tests and example/parallel tests */
  testIgnore: [
    '**/api-integration.spec.ts', 
    '**/connectivity.spec.ts', 
    '**/environment.spec.ts',
    '**/example.spec.ts',
    '**/parallel.spec.ts',
    '**/local-parallel.spec.ts'
  ],
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 30000 // Increased from 10s to 30s for element expectations
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Configure parallel test execution */
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['json', { outputFile: 'playwright-report/results.json' }]],
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
