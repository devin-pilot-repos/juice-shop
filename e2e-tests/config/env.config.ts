import { defineConfig, devices } from '@playwright/test';
import { getCurrentEnvironment } from './environments';
import { loadEnv, getEnv } from './dotenv.config';

loadEnv();

/**
 * Environment-specific configuration for Playwright tests
 * This uses the environment settings from environments.ts and .env file
 */
export default defineConfig({
  testDir: '../tests',
  timeout: parseInt(getEnv('TIMEOUT', '30000')),
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: parseInt(getEnv('RETRIES', '0')),
  workers: parseInt(getEnv('WORKERS', '1')),
  reporter: 'html',
  use: {
    baseURL: getCurrentEnvironment().baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: getEnv('HEADLESS', 'false') === 'true',
    launchOptions: {
      slowMo: parseInt(getEnv('SLOW_MO', '0')),
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
