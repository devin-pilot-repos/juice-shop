/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ChallengeService } from '../challenge.service'
import { environment } from '../../../environments/environment'
import { type Challenge } from '../../Models/challenge.model'

describe('ChallengeService', () => {
  let service: ChallengeService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChallengeService]
    })
    service = TestBed.inject(ChallengeService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('find', () => {
    it('should return all challenges', () => {
      const mockChallenges: Challenge[] = [
        { name: 'Challenge 1', key: 'challenge1', category: 'category1', difficulty: 1 },
        { name: 'Challenge 2', key: 'challenge2', category: 'category2', difficulty: 2 }
      ]
      const mockResponse = { data: mockChallenges }
      
      service.find().subscribe(data => {
        expect(data).toEqual(mockChallenges)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Challenges/`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should return challenges filtered by difficulty', () => {
      const mockChallenges: Challenge[] = [
        { name: 'Challenge 1', key: 'challenge1', category: 'category1', difficulty: 1 }
      ]
      const mockResponse = { data: mockChallenges }
      const params = { difficulty: 1 }
      
      service.find(params).subscribe(data => {
        expect(data).toEqual(mockChallenges)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Challenges/?difficulty=1`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('continueCode', () => {
    it('should get continue code', () => {
      const mockResponse = { continueCode: 'abc123' }
      
      service.continueCode().subscribe(data => {
        expect(data).toEqual(mockResponse.continueCode)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/continue-code`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('continueCodeFindIt', () => {
    it('should get continue code for findIt challenges', () => {
      const mockResponse = { continueCode: 'def456' }
      
      service.continueCodeFindIt().subscribe(data => {
        expect(data).toEqual(mockResponse.continueCode)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/continue-code-findIt`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('continueCodeFixIt', () => {
    it('should get continue code for fixIt challenges', () => {
      const mockResponse = { continueCode: 'ghi789' }
      
      service.continueCodeFixIt().subscribe(data => {
        expect(data).toEqual(mockResponse.continueCode)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/continue-code-fixIt`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('restoreProgress', () => {
    it('should restore challenge progress with continue code', () => {
      const mockResponse = { data: { success: true } }
      const continueCode = 'abc123'
      
      service.restoreProgress(continueCode).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/continue-code/apply/${continueCode}`)
      expect(req.request.method).toBe('PUT')
      req.flush(mockResponse)
    })
  })

  describe('restoreProgressFindIt', () => {
    it('should restore findIt challenge progress with continue code', () => {
      const mockResponse = { data: { success: true } }
      const continueCode = 'def456'
      
      service.restoreProgressFindIt(continueCode).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/continue-code-findIt/apply/${continueCode}`)
      expect(req.request.method).toBe('PUT')
      req.flush(mockResponse)
    })
  })

  describe('restoreProgressFixIt', () => {
    it('should restore fixIt challenge progress with continue code', () => {
      const mockResponse = { data: { success: true } }
      const continueCode = 'ghi789'
      
      service.restoreProgressFixIt(continueCode).subscribe(data => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/continue-code-fixIt/apply/${continueCode}`)
      expect(req.request.method).toBe('PUT')
      req.flush(mockResponse)
    })
  })

  describe('repeatNotification', () => {
    it('should repeat notification for a challenge', () => {
      const mockResponse = 'Notification sent.'
      const challengeName = 'challenge1'
      
      service.repeatNotification(challengeName).subscribe(data => {
        expect(data).toBe(mockResponse)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/repeat-notification?challenge=challenge1`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })
})
