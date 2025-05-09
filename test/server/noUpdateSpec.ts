/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { makeKeyNonUpdatable } from '../../lib/noUpdate'
import { ValidationError } from 'sequelize'

const expect = chai.expect
chai.use(sinonChai)

describe('noUpdate', () => {
  describe('makeKeyNonUpdatable', () => {
    let modelMock: any
    let instanceMock: any
    let hookCallback: Function
    
    beforeEach(() => {
      modelMock = {
        addHook: sinon.stub().callsFake((hookName, callback) => {
          hookCallback = callback
          return modelMock
        })
      }
      
      instanceMock = {
        isNewRecord: false,
        _changed: [],
        _previousDataValues: {},
        rawAttributes: {}
      }
      
      makeKeyNonUpdatable(modelMock, 'email')
    })
    
    it('should add a beforeValidate hook to the model', () => {
      expect(modelMock.addHook).to.have.been.calledWith('beforeValidate')
    })
    
    it('should do nothing if validate option is false', () => {
      const options = { validate: false }
      const result = hookCallback(instanceMock, options)
      expect(result).to.be.undefined
    })
    
    it('should do nothing if instance is a new record', () => {
      instanceMock.isNewRecord = true
      const options = { validate: true }
      const result = hookCallback(instanceMock, options)
      expect(result).to.be.undefined
    })
    
    it('should do nothing if no keys have changed', () => {
      instanceMock._changed = []
      const options = { validate: true }
      const result = hookCallback(instanceMock, options)
      expect(result).to.be.undefined
    })
    
    it('should not throw error if changed field is not the protected one', () => {
      instanceMock._changed = ['username']
      instanceMock.rawAttributes = {
        username: { fieldName: 'username' },
        email: { fieldName: 'email' }
      }
      instanceMock._previousDataValues = {
        username: 'oldUsername',
        email: 'test@example.com'
      }
      
      const options = { validate: true }
      expect(() => hookCallback(instanceMock, options)).to.not.throw()
    })
    
    it('should throw ValidationError if protected field is changed', () => {
      instanceMock._changed = ['email']
      instanceMock.rawAttributes = {
        email: { fieldName: 'email' }
      }
      instanceMock._previousDataValues = {
        email: 'test@example.com'
      }
      
      const options = { validate: true }
      expect(() => hookCallback(instanceMock, options)).to.throw(ValidationError)
    })
    
    it('should include field name in validation error message', () => {
      instanceMock._changed = ['email']
      instanceMock.rawAttributes = {
        email: { fieldName: 'email' }
      }
      instanceMock._previousDataValues = {
        email: 'test@example.com'
      }
      
      const options = { validate: true }
      try {
        hookCallback(instanceMock, options)
        expect.fail('Should have thrown an error')
      } catch (error) {
        const validationError = error as ValidationError
        expect(validationError.errors[0].message).to.include('`email` cannot be updated')
      }
    })
  })
})
