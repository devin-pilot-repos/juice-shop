/**
 * Environment configuration for the Playwright tests
 */
import 'dotenv/config';

export type Environment = {
  name: string;
  baseUrl: string;
  credentials: {
    admin: { email: string; password: string };
    customer: { email: string; password: string };
  };
};

export const environments: Record<string, Environment> = {
  local: {
    name: 'Local Environment',
    baseUrl: process.env.LOCAL_BASE_URL || 'http://localhost:3000',
    credentials: {
      admin: { email: process.env.ADMIN_EMAIL || 'admin@juice-sh.op', password: process.env.ADMIN_PASSWORD || 'admin123' },
      customer: { email: process.env.CUSTOMER_EMAIL || 'demo@juice-sh.op', password: process.env.CUSTOMER_PASSWORD || 'demo' }
    }
  },
  tunnel: {
    name: 'Tunnel Environment',
    baseUrl: process.env.TUNNEL_BASE_URL || 'https://demo.owasp-juice.shop',
    credentials: {
      admin: { email: process.env.ADMIN_EMAIL || 'admin@juice-sh.op', password: process.env.ADMIN_PASSWORD || 'admin123' },
      customer: { email: process.env.CUSTOMER_EMAIL || 'demo@juice-sh.op', password: process.env.CUSTOMER_PASSWORD || 'demo' }
    }
  }
};

/**
 * Get the current environment configuration
 * @returns The environment configuration based on the ENV environment variable
 */
export function getCurrentEnvironment(): Environment {
  const envName = process.env.ENV || 'tunnel';
  const env = environments[envName];
  
  if (!env) {
    throw new Error(`Environment "${envName}" not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }
  
  console.log(`Using environment: ${env.name} with baseUrl: ${env.baseUrl}`);
  return env;
}
