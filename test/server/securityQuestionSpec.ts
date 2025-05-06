/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import { securityQuestion as securityQuestionFunction } from '../../routes/securityQuestion'
import { SecurityAnswerModel } from '../../models/securityAnswer'
import { UserModel } from '../../models/user'
import { SecurityQuestionModel } from '../../models/securityQuestion'
import { type Request, type Response, type NextFunction } from 'express'

const expect = chai.expect
chai.use(sinonChai)

describe('securityQuestion', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: sinon.SinonSpy
  let findOneStub: sinon.SinonStub
  let findByPkStub: sinon.SinonStub

  beforeEach(() => {
    req = { query: { email: 'user@juice-sh.op' } }
    res = { json: sinon.spy() }
    next = sinon.spy()
    
    findOneStub = sinon.stub(SecurityAnswerModel, 'findOne')
    findByPkStub = sinon.stub(SecurityQuestionModel, 'findByPk')
  })

  afterEach(() => {
    findOneStub.restore()
    findByPkStub.restore()
  })

  it('should return security question for a user', () => {
    const securityAnswer = { SecurityQuestionId: 1 }
    const securityQuestion = { id: 1, question: 'Your first pet?' }
    
    findOneStub.resolves(securityAnswer)
    findByPkStub.resolves(securityQuestion)
    
    securityQuestionFunction()(req as Request, res as Response, next as NextFunction)
    
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(findOneStub).to.have.been.calledWith({
          include: [{
            model: UserModel,
            where: { email: 'user@juice-sh.op' }
          }]
        })
        expect(findByPkStub).to.have.been.calledWith(1)
        expect(res.json).to.have.been.calledWith({ question: securityQuestion })
        expect(next).not.to.have.been.called
        resolve()
      }, 0)
    })
  })

  it('should return empty object when no security answer exists for user', () => {
    findOneStub.resolves(null)
    
    securityQuestionFunction()(req as Request, res as Response, next as NextFunction)
    
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(findOneStub).to.have.been.called
        expect(findByPkStub).not.to.have.been.called
        expect(res.json).to.have.been.calledWith({})
        expect(next).not.to.have.been.called
        resolve()
      }, 0)
    })
  })

  it('should call next with error when security answer query fails', () => {
    const error = new Error('Database error')
    findOneStub.rejects(error)
    
    securityQuestionFunction()(req as Request, res as Response, next as NextFunction)
    
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(findOneStub).to.have.been.called
        expect(res.json).not.to.have.been.called
        expect(next).to.have.been.calledWith(error)
        resolve()
      }, 0)
    })
  })

  it('should call next with error when security question query fails', () => {
    const securityAnswer = { SecurityQuestionId: 1 }
    const error = new Error('Database error')
    
    findOneStub.resolves(securityAnswer)
    findByPkStub.rejects(error)
    
    securityQuestionFunction()(req as Request, res as Response, next as NextFunction)
    
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(findOneStub).to.have.been.called
        expect(findByPkStub).to.have.been.called
        expect(res.json).not.to.have.been.called
        expect(next).to.have.been.calledWith(error)
        resolve()
      }, 0)
    })
  })
})
