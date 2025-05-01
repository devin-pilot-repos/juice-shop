import * as dotenv from 'dotenv';
import path from 'path';

/**
 * Load environment variables from .env file
 */
export function loadEnv(): void {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  
  process.env.ENV = process.env.ENV || 'local';
  process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
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
