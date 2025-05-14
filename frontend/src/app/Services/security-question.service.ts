/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/SecurityQuestions'

  constructor (private readonly http: HttpClient) { }

  find (params: any) {
    return this.http.get<any>(this.host + '/', { params }).pipe(map(response => response.data), catchError((err) => { throw err }))
  }

  findBy (email: string) {
    return this.http.get<any>(this.hostServer + '/' + 'rest/user/security-question?email=' + email).pipe(
      map(response => response.question),
      catchError((error) => { throw error })
    )
  }
}
