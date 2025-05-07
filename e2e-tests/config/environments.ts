/**
 * Environment configurations for different test environments
 */

import { getEnv } from './dotenv.config.js';

export interface Environment {
  name: string;
  baseUrl: string;
  credentials: {
    admin: {
      email: string;
      password: string;
    };
    customer: {
      email: string;
      password: string;
    };
  };
}

export const environments: Record<string, Environment> = {
  local: {
    name: 'local',
    baseUrl: 'http://localhost:3000',
    credentials: {
      admin: {
        email: 'admin@juice-sh.op',
        password: 'admin123',
      },
      customer: {
        email: 'demo@juice-sh.op',
        password: 'demo',
      },
    },
  },
  dev: {
    name: 'development',
    baseUrl: 'https://demo.owasp-juice.shop',
    credentials: {
      admin: {
        email: 'admin@juice-sh.op',
        password: 'admin123',
      },
      customer: {
        email: 'demo@juice-sh.op',
        password: 'demo',
      },
    },
  },
  staging: {
    name: 'staging',
    baseUrl: 'https://juice-shop-staging.herokuapp.com',
    credentials: {
      admin: {
        email: 'admin@juice-sh.op',
        password: 'admin123',
      },
      customer: {
        email: 'demo@juice-sh.op',
        password: 'demo',
      },
    },
  },
  production: {
    name: 'production',
    baseUrl: 'https://demo.owasp-juice.shop',
    credentials: {
      admin: {
        email: 'admin@juice-sh.op',
        password: 'admin123',
      },
      customer: {
        email: 'demo@juice-sh.op',
        password: 'demo',
      },
    },
  },
};

/**
 * Get the current environment configuration
 * @returns The current environment configuration
 */
export function getCurrentEnvironment(): Environment {
  const envName = getEnv('ENV', 'local');
  return environments[envName] || environments.local;
}
