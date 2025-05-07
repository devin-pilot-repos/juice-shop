import { defineConfig } from '@playwright/test';
import { getCurrentEnvironment } from './environments';

const env = getCurrentEnvironment();

export default defineConfig({
  testDir: '../tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: env.baseUrl,
    httpCredentials: env.name === 'Tunnel Environment' ? {
      username: process.env.TUNNEL_USERNAME || 'user',
      password: process.env.TUNNEL_PASSWORD || 'password'
    } : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
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
});
