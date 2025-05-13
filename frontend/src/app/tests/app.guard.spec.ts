/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { LoginGuard, AdminGuard, AccountingGuard, DeluxeGuard } from '../app.guard'
import { NgZone } from '@angular/core'
import { roles } from '../roles'

describe('LoginGuard', () => {
  let guard: LoginGuard
  let router: jasmine.SpyObj<Router>
  let ngZone: jasmine.SpyObj<NgZone>

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    const ngZoneSpy = jasmine.createSpyObj('NgZone', ['run'])
    
    ngZoneSpy.run.and.callFake(callback => callback())

    TestBed.configureTestingModule({
      providers: [
        LoginGuard,
        { provide: Router, useValue: routerSpy },
        { provide: NgZone, useValue: ngZoneSpy }
      ]
    })
    
    guard = TestBed.inject(LoginGuard)
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>
    ngZone = TestBed.inject(NgZone) as jasmine.SpyObj<NgZone>
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  describe('canActivate', () => {
    it('should return true when token exists in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('valid-token')
      
      const result = guard.canActivate()
      
      expect(result).toBe(true)
    })

    it('should return false and redirect to 403 when token does not exist', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null)
      
      const result = guard.canActivate()
      
      expect(result).toBe(false)
      expect(ngZone.run).toHaveBeenCalled()
      expect(router.navigate).toHaveBeenCalledWith(['403'], {
        skipLocationChange: true,
        queryParams: { error: 'UNAUTHORIZED_ACCESS_ERROR' }
      })
    })
  })

  describe('forbidRoute', () => {
    it('should navigate to 403 with default error', () => {
      guard.forbidRoute()
      
      expect(ngZone.run).toHaveBeenCalled()
      expect(router.navigate).toHaveBeenCalledWith(['403'], {
        skipLocationChange: true,
        queryParams: { error: 'UNAUTHORIZED_PAGE_ACCESS_ERROR' }
      })
    })

    it('should navigate to 403 with custom error', () => {
      guard.forbidRoute('CUSTOM_ERROR')
      
      expect(ngZone.run).toHaveBeenCalled()
      expect(router.navigate).toHaveBeenCalledWith(['403'], {
        skipLocationChange: true,
        queryParams: { error: 'CUSTOM_ERROR' }
      })
    })
  })

  describe('tokenDecode', () => {
    it('should return null when token does not exist', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null)
      
      const result = guard.tokenDecode()
      
      expect(result).toBeNull()
    })

    it('should return decoded payload when token is valid', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      spyOn(localStorage, 'getItem').and.returnValue(validToken)
      
      const result = guard.tokenDecode()
      
      expect(result).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      })
    })

    it('should return null and log error when token is invalid', () => {
      spyOn(localStorage, 'getItem').and.returnValue('invalid-token')
      spyOn(console, 'log')
      
      const result = guard.tokenDecode()
      
      expect(result).toBeNull()
      expect(console.log).toHaveBeenCalled()
    })
  })
})

describe('AdminGuard', () => {
  let guard: AdminGuard
  let loginGuard: jasmine.SpyObj<LoginGuard>

  beforeEach(() => {
    const loginGuardSpy = jasmine.createSpyObj('LoginGuard', ['tokenDecode', 'forbidRoute'])
    
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: LoginGuard, useValue: loginGuardSpy }
      ]
    })
    
    guard = TestBed.inject(AdminGuard)
    loginGuard = TestBed.inject(LoginGuard) as jasmine.SpyObj<LoginGuard>
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  describe('canActivate', () => {
    it('should return true when user has admin role', () => {
      loginGuard.tokenDecode.and.returnValue({ data: { role: roles.admin } })
      
      const result = guard.canActivate()
      
      expect(result).toBe(true)
    })

    it('should return false and forbid route when user does not have admin role', () => {
      loginGuard.tokenDecode.and.returnValue({ data: { role: roles.customer } })
      
      const result = guard.canActivate()
      
      expect(result).toBe(false)
      expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })

    it('should return false and forbid route when token payload is null', () => {
      loginGuard.tokenDecode.and.returnValue(null)
      
      const result = guard.canActivate()
      
      expect(result).toBe(false)
      expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })
  })
})

describe('AccountingGuard', () => {
  let guard: AccountingGuard
  let loginGuard: jasmine.SpyObj<LoginGuard>

  beforeEach(() => {
    const loginGuardSpy = jasmine.createSpyObj('LoginGuard', ['tokenDecode', 'forbidRoute'])
    
    TestBed.configureTestingModule({
      providers: [
        AccountingGuard,
        { provide: LoginGuard, useValue: loginGuardSpy }
      ]
    })
    
    guard = TestBed.inject(AccountingGuard)
    loginGuard = TestBed.inject(LoginGuard) as jasmine.SpyObj<LoginGuard>
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  describe('canActivate', () => {
    it('should return true when user has accounting role', () => {
      loginGuard.tokenDecode.and.returnValue({ data: { role: roles.accounting } })
      
      const result = guard.canActivate()
      
      expect(result).toBe(true)
    })

    it('should return false and forbid route when user does not have accounting role', () => {
      loginGuard.tokenDecode.and.returnValue({ data: { role: roles.customer } })
      
      const result = guard.canActivate()
      
      expect(result).toBe(false)
      expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })

    it('should return false and forbid route when token payload is null', () => {
      loginGuard.tokenDecode.and.returnValue(null)
      
      const result = guard.canActivate()
      
      expect(result).toBe(false)
      expect(loginGuard.forbidRoute).toHaveBeenCalled()
    })
  })
})

describe('DeluxeGuard', () => {
  let guard: DeluxeGuard
  let loginGuard: jasmine.SpyObj<LoginGuard>

  beforeEach(() => {
    const loginGuardSpy = jasmine.createSpyObj('LoginGuard', ['tokenDecode'])
    
    TestBed.configureTestingModule({
      providers: [
        DeluxeGuard,
        { provide: LoginGuard, useValue: loginGuardSpy }
      ]
    })
    
    guard = TestBed.inject(DeluxeGuard)
    loginGuard = TestBed.inject(LoginGuard) as jasmine.SpyObj<LoginGuard>
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  describe('isDeluxe', () => {
    it('should return true when user has deluxe role', () => {
      loginGuard.tokenDecode.and.returnValue({ data: { role: roles.deluxe } })
      
      const result = guard.isDeluxe()
      
      expect(result).toBe(true)
    })

    it('should return false when user does not have deluxe role', () => {
      loginGuard.tokenDecode.and.returnValue({ data: { role: roles.customer } })
      
      const result = guard.isDeluxe()
      
      expect(result).toBe(false)
    })

    it('should return false when token payload is null', () => {
      loginGuard.tokenDecode.and.returnValue(null)
      
      const result = guard.isDeluxe()
      
      expect(result).toBe(false)
    })
  })
})
