/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { BasketService } from '../basket.service'
import { environment } from '../../../environments/environment'

describe('BasketService', () => {
  let service: BasketService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BasketService]
    })
    service = TestBed.inject(BasketService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('find', () => {
    it('should return basket by id', () => {
      const mockResponse = { data: { id: 1, Products: [] } }
      const basketId = 1
      
      service.find(basketId).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/basket/${basketId}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('get', () => {
    it('should return basket item by id', () => {
      const mockResponse = { data: { id: 1, quantity: 2, productId: 3 } }
      const basketItemId = 1
      
      service.get(basketItemId).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/BasketItems/${basketItemId}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('put', () => {
    it('should update basket item', () => {
      const mockResponse = { data: { id: 1, quantity: 3, productId: 3 } }
      const basketItemId = 1
      const updatedItem = { quantity: 3 }
      
      service.put(basketItemId, updatedItem).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/BasketItems/${basketItemId}`)
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(updatedItem)
      req.flush(mockResponse)
    })
  })

  describe('del', () => {
    it('should delete basket item', () => {
      const mockResponse = { data: { id: 1, quantity: 2, productId: 3 } }
      const basketItemId = 1
      
      service.del(basketItemId).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/BasketItems/${basketItemId}`)
      expect(req.request.method).toBe('DELETE')
      req.flush(mockResponse)
    })
  })

  describe('save', () => {
    it('should add item to basket', () => {
      const mockResponse = { data: { id: 1, quantity: 1, productId: 3 } }
      const newItem = { quantity: 1, productId: 3, BasketId: 1 }
      
      service.save(newItem).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/BasketItems/`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual(newItem)
      req.flush(mockResponse)
    })
  })

  describe('checkout', () => {
    it('should checkout basket', () => {
      const mockResponse = { orderConfirmation: { orderId: 'ABC123' } }
      const basketId = 1
      const couponData = 'COUPON123'
      const orderDetails = {
        paymentId: 'pay_123',
        addressId: 'addr_123',
        deliveryMethodId: 'del_123'
      }
      
      service.checkout(basketId, couponData, orderDetails).subscribe((data) => {
        expect(data).toEqual(mockResponse.orderConfirmation)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/basket/${basketId}/checkout`)
      expect(req.request.method).toBe('POST')
      expect(req.request.body).toEqual({ couponData, orderDetails })
      req.flush(mockResponse)
    })
  })

  describe('applyCoupon', () => {
    it('should apply coupon to basket', () => {
      const mockResponse = { discount: 10 }
      const basketId = 1
      const coupon = 'COUPON123'
      
      service.applyCoupon(basketId, coupon).subscribe((data) => {
        expect(data).toEqual(mockResponse.discount)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/basket/${basketId}/coupon/${coupon}`)
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual({})
      req.flush(mockResponse)
    })
  })

  describe('updateNumberOfCartItems', () => {
    it('should update item total subject', () => {
      const mockResponse = { data: { Products: [{ BasketItem: { quantity: 2 } }, { BasketItem: { quantity: 3 } }] } }
      spyOn(service.itemTotal, 'next')
      spyOn(sessionStorage, 'getItem').and.returnValue('1')
      
      service.updateNumberOfCartItems()

      const req = httpMock.expectOne(`${hostServer}/rest/basket/1`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
      
      expect(service.itemTotal.next).toHaveBeenCalledWith(5)
    })
    
    it('should handle errors when updating cart items', () => {
      spyOn(console, 'log')
      spyOn(sessionStorage, 'getItem').and.returnValue('1')
      
      service.updateNumberOfCartItems()

      const req = httpMock.expectOne(`${hostServer}/rest/basket/1`)
      req.error(new ErrorEvent('Network error'))
      
      expect(console.log).toHaveBeenCalled()
    })
  })

  describe('getItemTotal', () => {
    it('should return item total observable', (done) => {
      const testValue = 5
      
      service.getItemTotal().subscribe(value => {
        expect(value).toBe(testValue)
        done()
      })
      
      service.itemTotal.next(testValue)
    })
  })
})
