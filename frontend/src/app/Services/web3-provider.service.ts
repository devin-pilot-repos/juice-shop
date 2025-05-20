/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { ethers } from 'ethers'
import { VaultService } from './vault.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class Web3ProviderService {
  constructor (private readonly vaultService: VaultService) {}

  getProvider (): Observable<ethers.providers.BaseProvider> {
    return this.vaultService.getSecrets().pipe(
      map(secrets => {
        if (!secrets.infuraApiKey) {
          console.warn('No Infura API key found, using default provider')
          return ethers.getDefaultProvider()
        }

        return new ethers.providers.InfuraProvider('sepolia', secrets.infuraApiKey)
      })
    )
  }
}
