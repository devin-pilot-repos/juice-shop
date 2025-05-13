/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export const environment = {
  production: true,
  hostServer: '.',
  vaultServer: process.env.VAULT_ADDR || 'http://vault:8200',
  vaultToken: process.env.VAULT_TOKEN || ''
}
