import { defineConfig, devices } from '@playwright/test';
import { getCurrentEnvironment } from './environments';
import { loadEnv, getEnv } from './dotenv.config';

loadEnv();

/**
 * Environment-specific configuration for Playwright tests
 * This uses the environment settings from environments.ts and .env file
 * 
 * For localhost testing:
 * - Set ENV=local in environment variables
 * - Optionally override with BASE_URL=http://localhost:3000
 * - Increased timeouts for CI environment to handle application startup
 */
export default defineConfig({
  testDir: '../tests',
  timeout: parseInt(getEnv('TIMEOUT', process.env.CI ? '180000' : '30000')),
  expect: {
    timeout: process.env.CI ? 15000 : 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: parseInt(getEnv('RETRIES', process.env.CI ? '2' : '0')),
  workers: parseInt(getEnv('WORKERS', process.env.CI ? '1' : '4')), // Reduce workers in CI for localhost
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || getCurrentEnvironment().baseUrl,
    trace: 'on-first-retry',
    screenshot: process.env.CI ? 'on' : 'only-on-failure', // Capture more screenshots in CI
    headless: getEnv('HEADLESS', 'false') === 'true',
    launchOptions: {
      slowMo: parseInt(getEnv('SLOW_MO', '0')),
    },
    navigationTimeout: process.env.CI ? 60000 : 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],
});
