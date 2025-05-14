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
export class FeedbackService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Feedbacks'

  constructor (private readonly http: HttpClient) { }

  find (params?: any) {
    return this.http.get<any>(this.host + '/', {
      params
    }).pipe(map(response => response.data), catchError((err) => { throw err }))
  }

  save (params: any) {
    return this.http.post<any>(this.host + '/', params).pipe(map(response => response.data), catchError((err) => { throw err }))
  }

  del (id: number) {
    return this.http.delete<any>(`${this.host}/${id}`).pipe(map(response => response.data), catchError((err) => { throw err }))
  }
}
