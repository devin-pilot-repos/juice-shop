/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { errorHandler } from '../../routes/errorHandler'
import { type Request, type Response, type NextFunction } from 'express'
import fs from 'node:fs/promises'
import pug from 'pug'

const expect = chai.expect
chai.use(sinonChai)

describe('errorHandler', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: sinon.SinonSpy
  let fsStub: sinon.SinonStub
  let pugStub: sinon.SinonStub
  
  beforeEach(() => {
    req = {}
    res = { 
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
      send: sinon.spy(),
      headersSent: false
    }
    next = sinon.spy()
    
    fsStub = sinon.stub(fs, 'readFile').resolves('template content')
    pugStub = sinon.stub(pug, 'compile').returns(() => 'compiled template')
  })

  afterEach(() => {
    fsStub.restore()
    pugStub.restore()
  })

  it('should call next if headers are already sent', async () => {
    const err = new Error('Test error')
    res.headersSent = true
    
    await errorHandler()(err, req as Request, res as Response, next as NextFunction)
    
    expect(next).to.have.been.calledWith(err)
    expect(res.status).not.to.have.been.called
    expect(res.json).not.to.have.been.called
    expect(res.send).not.to.have.been.called
  })

  it('should return JSON error for JSON requests', async () => {
    const err = new Error('Test error')
    req.headers = { accept: 'application/json' }
    
    await errorHandler()(err, req as Request, res as Response, next as NextFunction)
    
    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.called
    expect(next).not.to.have.been.called
  })

  it('should return HTML error page for non-JSON requests', async () => {
    const err = new Error('Test error')
    
    await errorHandler()(err, req as Request, res as Response, next as NextFunction)
    
    expect(fsStub).to.have.been.calledWith('views/errorPage.pug', { encoding: 'utf-8' })
    expect(pugStub).to.have.been.calledWith('template content')
    expect(res.status).to.have.been.calledWith(500)
    expect(res.send).to.have.been.calledWith('compiled template')
    expect(next).not.to.have.been.called
  })

  it('should handle errors without message property', async () => {
    const err = {}
    req.headers = { accept: 'application/json' }
    
    await errorHandler()(err, req as Request, res as Response, next as NextFunction)
    
    expect(res.status).to.have.been.calledWith(500)
    expect(res.json).to.have.been.called
    expect(next).not.to.have.been.called
  })
})
