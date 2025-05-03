/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { FeedbackService } from '../feedback.service'
import { environment } from '../../../environments/environment'

describe('FeedbackService', () => {
  let service: FeedbackService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FeedbackService]
    })
    service = TestBed.inject(FeedbackService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('find', () => {
    it('should return all feedback', () => {
      const mockResponse = { data: [{ id: 1, comment: 'Great service!' }, { id: 2, comment: 'Needs improvement' }] }
      
      service.find().subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Feedbacks/`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should return feedback filtered by parameters', () => {
      const mockResponse = { data: [{ id: 1, comment: 'Great service!' }] }
      const params = { userId: 1 }
      
      service.find(params).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Feedbacks/?userId=1`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('save', () => {
    it('should save new feedback', () => {
      const mockResponse = { data: { id: 3, comment: 'New feedback', rating: 5 } }
      const feedback = { comment: 'New feedback', rating: 5 }
      
      service.save(feedback).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Feedbacks/`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(feedback)
      req.flush(mockResponse)
    })
  })

  describe('del', () => {
    it('should delete feedback by id', () => {
      const mockResponse = { data: { success: true } }
      const feedbackId = 1
      
      service.del(feedbackId).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Feedbacks/${feedbackId}`)
      expect(req.request.method).toBe('DELETE')
      req.flush(mockResponse)
    })
  })
})
