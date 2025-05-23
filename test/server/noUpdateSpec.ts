/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { makeKeyNonUpdatable } from '../../lib/noUpdate'
// @ts-expect-error FIXME due to non-existing type definitions for sequelize/lib/errors
import { ValidationError } from 'sequelize/lib/errors'

chai.use(sinonChai)
const expect = chai.expect

describe('noUpdate', () => {
  describe('makeKeyNonUpdatable', () => {
    let model: any
    let addHookStub: sinon.SinonStub
    let beforeValidateCallback: (instance: any, options: any) => void

    beforeEach(() => {
      addHookStub = sinon.stub()
      model = {
        addHook: addHookStub
      }
      // Call the function being tested
      makeKeyNonUpdatable(model, 'email')

      // Extract the callback function more safely
      sinon.assert.calledOnce(addHookStub)
      expect(addHookStub.firstCall.args[0]).to.equal('beforeValidate')
      beforeValidateCallback = addHookStub.firstCall.args[1]
    })

    it('should add a beforeValidate hook to the model', () => {
      expect(addHookStub).to.have.been.calledOnceWith('beforeValidate', sinon.match.func)
    })

    it('should pass validation when validate option is explicitly set to false', () => {
      // Create a mock instance
      const instance = {
        isNewRecord: false,
        _changed: ['email'],
        _previousDataValues: { email: 'old@example.com' },
        rawAttributes: { email: { fieldName: 'email' } }
      }

      // No error should be thrown
      const callFunction = () => {
        beforeValidateCallback(instance, { validate: false })
      }

      expect(callFunction).to.not.throw()
    })

    it('should pass validation for new records', () => {
      // Create a mock instance
      const instance = {
        isNewRecord: true,
        _changed: ['email'],
        _previousDataValues: { email: 'old@example.com' },
        rawAttributes: { email: { fieldName: 'email' } }
      }

      // No error should be thrown
      const callFunction = () => {
        beforeValidateCallback(instance, { validate: true })
      }

      expect(callFunction).to.not.throw()
    })

    it('should pass validation when no fields are changed', () => {
      // Create a mock instance
      const instance = {
        isNewRecord: false,
        _changed: [],
        _previousDataValues: { email: 'old@example.com' },
        rawAttributes: { email: { fieldName: 'email' } }
      }

      // No error should be thrown
      const callFunction = () => {
        beforeValidateCallback(instance, { validate: true })
      }

      expect(callFunction).to.not.throw()
    })

    it('should throw validation error when trying to update a non-updatable field', () => {
      // Create a mock instance
      const instance = {
        isNewRecord: false,
        _changed: ['email'],
        _previousDataValues: { email: 'old@example.com' },
        rawAttributes: { email: { fieldName: 'email' } }
      }

      // Should throw ValidationError
      expect(() => {
        beforeValidateCallback(instance, { validate: true })
      }).to.throw(ValidationError)
    })
  })
})
