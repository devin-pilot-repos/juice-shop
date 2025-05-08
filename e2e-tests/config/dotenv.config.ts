/**
 * Load environment variables from .env file
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load environment variables from .env file
 * This function tries multiple possible paths to find the .env file
 */
export function loadEnv(): void {
  const possiblePaths = [
    path.resolve(__dirname, '../.env'),           // Standard path
    path.resolve(__dirname, '../../.env'),        // One level up
    path.resolve(__dirname, './.env'),            // Same directory
    path.resolve(process.cwd(), '.env'),          // Current working directory
    path.resolve(process.cwd(), 'e2e-tests/.env') // From project root
  ];

  let envPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      envPath = p;
      console.log(`Found .env file at: ${p}`);
      break;
    }
  }

  if (envPath) {
    dotenv.config({ path: envPath });
  } else {
    console.warn('No .env file found. Using default values.');
    dotenv.config(); // Try default dotenv behavior
  }
  
  process.env.ENV = process.env.ENV || 'local';
  process.env.BASE_URL = process.env.BASE_URL || 'https://demo.owasp-juice.shop';
  process.env.HEADLESS = process.env.HEADLESS || 'false';
  process.env.SLOW_MO = process.env.SLOW_MO || '0';
  process.env.TIMEOUT = process.env.TIMEOUT || '30000';
  process.env.RETRIES = process.env.RETRIES || '0';
  process.env.WORKERS = process.env.WORKERS || '1';
}

/**
 * Get environment variable
 * @param key The environment variable key
 * @param defaultValue The default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

loadEnv();
