/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { UserService } from '../user.service'
import { environment } from '../../../environments/environment'

describe('UserService', () => {
  let service: UserService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    })
    service = TestBed.inject(UserService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('find', () => {
    it('should return authentication details', () => {
      const mockResponse = { data: [{ id: 1, email: 'test@test.com' }] }
      
      service.find().subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/user/authentication-details/`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })

    it('should pass query parameters', () => {
      const mockResponse = { data: [{ id: 1, email: 'test@test.com' }] }
      const params = { email: 'test@test.com' }
      
      service.find(params).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/user/authentication-details/?email=test@test.com`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('get', () => {
    it('should return user by id', () => {
      const mockResponse = { data: { id: 1, email: 'test@test.com' } }
      const userId = 1
      
      service.get(userId).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Users/${userId}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('save', () => {
    it('should create new user', () => {
      const mockResponse = { data: { id: 1, email: 'new@test.com' } }
      const user = { email: 'new@test.com', password: 'password' }
      
      service.save(user).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Users/`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(user)
      req.flush(mockResponse)
    })
  })

  describe('login', () => {
    it('should authenticate user and update login state', () => {
      const mockResponse = { authentication: { token: 'token123', umail: 'test@test.com' } }
      const credentials = { email: 'test@test.com', password: 'password' }
      
      spyOn(service.isLoggedIn, 'next')
      
      service.login(credentials).subscribe((data) => {
        expect(data).toEqual(mockResponse.authentication)
      })

      expect(service.isLoggedIn.next).toHaveBeenCalledWith(true)
      
      const req = httpMock.expectOne(`${hostServer}/rest/user/login`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(credentials)
      req.flush(mockResponse)
    })
  })

  describe('getLoggedInState', () => {
    it('should return observable of login state', () => {
      service.isLoggedIn.next(true)
      
      service.getLoggedInState().subscribe((isLoggedIn) => {
        expect(isLoggedIn).toBe(true)
      })
    })
  })

  describe('changePassword', () => {
    it('should send password change request', () => {
      const mockResponse = { user: { id: 1, email: 'test@test.com' } }
      const passwords = { current: 'old', new: 'new', repeat: 'new' }
      
      service.changePassword(passwords).subscribe((data) => {
        expect(data).toEqual(mockResponse.user)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/user/change-password?current=${passwords.current}&new=${passwords.new}&repeat=${passwords.repeat}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('resetPassword', () => {
    it('should send password reset request', () => {
      const mockResponse = { user: { id: 1, email: 'test@test.com' } }
      const params = { email: 'test@test.com', securityAnswer: 'answer', newPassword: 'new' }
      
      service.resetPassword(params).subscribe((data) => {
        expect(data).toEqual(mockResponse.user)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/user/reset-password`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(params)
      req.flush(mockResponse)
    })
  })

  describe('whoAmI', () => {
    it('should return current user information', () => {
      const mockResponse = { user: { id: 1, email: 'test@test.com' } }
      
      service.whoAmI().subscribe((data) => {
        expect(data).toEqual(mockResponse.user)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/user/whoami`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('oauthLogin', () => {
    it('should retrieve user info from Google OAuth', () => {
      const mockResponse = { id: '123', email: 'test@test.com' }
      const accessToken = 'token123'
      
      service.oauthLogin(accessToken).subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('saveLastLoginIp', () => {
    it('should save last login IP', () => {
      const mockResponse = { success: true }
      
      service.saveLastLoginIp().subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/saveLoginIp`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('deluxeStatus', () => {
    it('should return deluxe membership status', () => {
      const mockResponse = { data: { membershipCost: 49 } }
      
      service.deluxeStatus().subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/deluxe-membership`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('upgradeToDeluxe', () => {
    it('should upgrade to deluxe membership', () => {
      const mockResponse = { data: { success: true } }
      const paymentMode = 'card'
      const paymentId = 'payment123'
      
      service.upgradeToDeluxe(paymentMode, paymentId).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/deluxe-membership`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ paymentMode, paymentId })
      req.flush(mockResponse)
    })
  })
})
