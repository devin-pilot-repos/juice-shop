/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/order-history'

  constructor (private readonly http: HttpClient) { }

  get () {
    return this.http.get<any>(this.host).pipe(map(response => response.data), catchError((err) => { throw err }))
  }

  getAll () {
    return this.http.get<any>(this.host + '/orders').pipe(map(response => response.data), catchError((err) => { throw err }))
  }

  toggleDeliveryStatus (id: number, params) {
    return this.http.put<any>(`${this.host}/${id}/delivery-status`, params).pipe(map(response => response.data), catchError((err) => { throw err }))
  }
}
