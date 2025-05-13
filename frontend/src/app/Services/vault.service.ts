/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { environment } from '../../environments/environment'

export interface Secret {
  infuraApiKey: string
}

@Injectable({
  providedIn: 'root'
})
export class VaultService {
  private readonly host = environment.vaultServer || 'http://localhost:8200'
  private readonly vaultPath = 'secret/data/juice-shop'
  private cachedSecrets: Secret | null = null

  constructor (private readonly http: HttpClient) {}

  getSecrets (): Observable<Secret> {
    if (this.cachedSecrets) {
      return of(this.cachedSecrets)
    }

    if (!environment.production) {
      console.warn('Using development secrets. Do not use in production!')
      const devSecrets: Secret = {
        infuraApiKey: 'dev-placeholder-key' // Replace with actual key in production
      }
      this.cachedSecrets = devSecrets
      return of(devSecrets)
    }

    const token = environment.vaultToken
    if (!token) {
      console.error('Vault token not found in environment')
      return of({ infuraApiKey: '' })
    }

    return this.http.get<any>(`${this.host}/v1/${this.vaultPath}`, {
      headers: {
        'X-Vault-Token': token
      }
    }).pipe(
      map(response => {
        const secrets: Secret = response.data.data
        this.cachedSecrets = secrets
        return secrets
      }),
      catchError(error => {
        console.error('Error fetching secrets from Vault:', error)
        return of({ infuraApiKey: '' })
      })
    )
  }
}
