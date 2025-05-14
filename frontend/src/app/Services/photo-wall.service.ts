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
export class PhotoWallService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/memories'

  constructor (private readonly http: HttpClient) { }

  addMemory (caption: string, image: File) {
    const postData = new FormData()
    postData.append('image', image, caption)
    postData.append('caption', caption)
    return this.http.post<any>(this.host, postData).pipe(map(response => response.data), catchError((err) => { throw err }))
  }

  get () {
    return this.http.get<any>(this.host + '/').pipe(map(response => response.data), catchError((err) => { throw err }))
  }
}
