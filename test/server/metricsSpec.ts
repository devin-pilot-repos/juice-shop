/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import * as metrics from '../../routes/metrics'
import * as prometheus from 'prom-client'
import { type Request, type Response, type NextFunction } from 'express'
import onFinished from 'on-finished'

const expect = chai.expect
chai.use(sinonChai)

describe('metrics', () => {
  beforeEach(() => {
    prometheus.register.clear()
  })

  describe('observeRequestMetricsMiddleware', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: sinon.SinonSpy

    beforeEach(() => {
      req = { }
      res = { 
        statusCode: 200,
        getHeader: sinon.stub().returns('application/json'),
        on: sinon.stub().callsArg(1) // Simulate 'finish' event
      }
      next = sinon.spy()
    })

    it('should call next after setting up response listener', () => {
      metrics.observeRequestMetricsMiddleware()(req as Request, res as Response, next as NextFunction)
      
      expect(next).to.have.been.calledOnce
    })

    it('should add event listener to response', () => {
      metrics.observeRequestMetricsMiddleware()(req as Request, res as Response, next as NextFunction)
      
      expect(res.on).to.have.been.calledWith('finish')
    })
  })

  describe('observeFileUploadMetricsMiddleware', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: sinon.SinonSpy

    beforeEach(() => {
      req = { 
        file: { 
          size: 1000, 
          mimetype: 'image/jpeg',
          fieldname: 'file',
          originalname: 'test.jpg',
          encoding: '7bit',
          destination: '/tmp',
          filename: 'test.jpg',
          path: '/tmp/test.jpg',
          buffer: Buffer.from('test')
        } as Express.Multer.File
      }
      res = { 
        statusCode: 200,
        on: sinon.stub().callsArg(1)
      }
      next = sinon.spy()
    })

    it('should call next after observing file size', () => {
      metrics.observeFileUploadMetricsMiddleware()(req as Request, res as Response, next as NextFunction)
      
      expect(next).to.have.been.calledOnce
    })

    it('should handle missing file object gracefully', () => {
      req.file = undefined
      metrics.observeFileUploadMetricsMiddleware()(req as Request, res as Response, next as NextFunction)
      
      expect(next).to.have.been.calledOnce
    })
  })

  describe('serveMetrics', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: sinon.SinonSpy
    let metricsStub: sinon.SinonStub

    beforeEach(() => {
      req = { 
        headers: { 'user-agent': 'Mozilla/5.0' }
      }
      res = { 
        set: sinon.spy(),
        end: sinon.spy()
      }
      next = sinon.spy()
      metricsStub = sinon.stub(prometheus.register, 'metrics').resolves('metrics data')
    })

    afterEach(() => {
      metricsStub.restore()
    })

    it('should set content type header', async () => {
      await metrics.serveMetrics()(req as Request, res as Response, next as NextFunction)
      
      expect(res.set).to.have.been.calledWith('Content-Type', prometheus.register.contentType)
    })

    it('should return metrics data', async () => {
      await metrics.serveMetrics()(req as Request, res as Response, next as NextFunction)
      
      expect(res.end).to.have.been.calledWith('metrics data')
    })
  })
})
