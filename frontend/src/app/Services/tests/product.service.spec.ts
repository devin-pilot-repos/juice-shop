/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ProductService } from '../product.service'
import { environment } from '../../../environments/environment'

describe('ProductService', () => {
  let service: ProductService
  let httpMock: HttpTestingController
  const hostServer = environment.hostServer

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    })
    service = TestBed.inject(ProductService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('search', () => {
    it('should return search results', () => {
      const mockResponse = { data: [{ id: 1, name: 'Apple Juice' }] }
      const searchTerm = 'apple'
      
      service.search(searchTerm).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/rest/products/search?q=${searchTerm}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('find', () => {
    it('should return products based on criteria', () => {
      const mockResponse = { data: [{ id: 1, name: 'Apple Juice' }] }
      const params = { q: 'apple' }
      
      service.find(params).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Products/?q=apple`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('get', () => {
    it('should return product by id', () => {
      const mockResponse = { data: { id: 1, name: 'Apple Juice' } }
      const productId = 1
      
      const fixedDate = new Date('2023-01-01')
      jasmine.clock().mockDate(fixedDate)
      
      service.get(productId).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const encodedDate = encodeURIComponent(fixedDate.toDateString())
      const req = httpMock.expectOne(`${hostServer}/api/Products/${productId}?d=${encodedDate}`)
      expect(req.request.method).toBe('GET')
      req.flush(mockResponse)
    })
  })

  describe('put', () => {
    it('should update product', () => {
      const mockResponse = { data: { id: 1, name: 'Updated Juice' } }
      const productId = 1
      const updatedProduct = { name: 'Updated Juice' }
      
      service.put(productId, updatedProduct).subscribe((data) => {
        expect(data).toEqual(mockResponse.data)
      })

      const req = httpMock.expectOne(`${hostServer}/api/Products/${productId}`)
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(updatedProduct)
      req.flush(mockResponse)
    })
  })
})
