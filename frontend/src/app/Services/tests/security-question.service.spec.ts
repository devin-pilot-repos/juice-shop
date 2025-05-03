/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { SecurityQuestionService } from '../security-question.service'
import { environment } from '../../../environments/environment'

describe('SecurityQuestionService', () => {
  let service: SecurityQuestionService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SecurityQuestionService]
    })
    service = TestBed.inject(SecurityQuestionService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('find', () => {
    it('should return all security questions', () => {
      const mockResponse = { 
        data: [
          { id: 1, question: 'What was your childhood nickname?' }, 
          { id: 2, question: 'What is your favorite movie?' }
        ] 
      }
      const params = {}
      
      service.find(params).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/SecurityQuestions/`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should return security questions filtered by parameters', () => {
      const mockResponse = { 
        data: [
          { id: 1, question: 'What was your childhood nickname?' }
        ] 
      }
      const params = { id: 1 }
      
      service.find(params).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/SecurityQuestions/?id=1`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('findBy', () => {
    it('should find security question by email', () => {
      const mockResponse = { question: 'What was your childhood nickname?' }
      const email = 'test@example.com'
      
      service.findBy(email).subscribe(question => {
        expect(question).toEqual(mockResponse.question)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/user/security-question?email=${email}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should handle error when email not found', () => {
      const email = 'nonexistent@example.com'
      const errorResponse = { status: 404, statusText: 'Not Found' }
      
      service.findBy(email).subscribe(
        () => fail('Expected an error, not success'),
        error => {
          expect(error.status).toBe(404)
        }
      )

      const req = httpMock.expectOne(`${hostServer}/rest/user/security-question?email=${email}`)
      expect(req.request.method).toBe('GET')
      req.flush('Not Found', errorResponse)
    })
  })
})
