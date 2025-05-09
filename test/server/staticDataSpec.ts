/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import logger from '../../lib/logger'

const expect = chai.expect
chai.use(sinonChai)

describe('staticData', () => {
  let readFileStub: sinon.SinonStub
  let safeLoadStub: sinon.SinonStub
  let loggerStub: sinon.SinonStub
  let staticData: any
  
  beforeEach(() => {
    Object.keys(require.cache).forEach(key => {
      if (key.includes('staticData') || key.includes('js-yaml') || key.includes('fs/promises')) {
        delete require.cache[key]
      }
    })
    
    const fsPromises = require('node:fs/promises')
    readFileStub = sinon.stub(fsPromises, 'readFile')
    
    const jsYaml = require('js-yaml')
    safeLoadStub = sinon.stub(jsYaml, 'safeLoad')
    
    safeLoadStub.callsFake((data) => {
      return data ? data : {}
    })
    
    loggerStub = sinon.stub(logger, 'error')
    
    staticData = require('../../data/staticData')
  })
  
  afterEach(() => {
    readFileStub.restore()
    safeLoadStub.restore()
    loggerStub.restore()
  })
  
  describe('loadStaticData', () => {
    it('should load and parse YAML data from the specified file', async () => {
      const fileContent = 'key: value'
      const parsedData = { key: 'value' }
      
      readFileStub.resolves(fileContent)
      safeLoadStub.returns(parsedData)
      
      const result = await staticData.loadStaticData('testFile')
      
      expect(readFileStub).to.have.been.called
      const readFileArgs = readFileStub.getCall(0).args
      expect(readFileArgs[0].toString()).to.include('testFile.yml')
      expect(readFileArgs[1]).to.equal('utf8')
      
      expect(safeLoadStub).to.have.been.calledWith(fileContent)
      expect(result).to.equal(parsedData)
    })
    
    it('should log an error and return undefined if the file cannot be read', async () => {
      const error = new Error('File not found')
      readFileStub.rejects(error)
      
      const result = await staticData.loadStaticData('nonExistentFile')
      
      expect(loggerStub).to.have.been.called
      expect(loggerStub.firstCall.args[0]).to.include('nonExistentFile.yml')
      expect(result).to.be.undefined
    })
  })
  
  describe('loadStaticUserData', () => {
    it('should call loadStaticData with "users" and return the result', async () => {
      const userData = [
        { email: 'user1@example.com', password: 'password1', key: 'user1', role: 'customer' },
        { email: 'user2@example.com', password: 'password2', key: 'user2', role: 'admin' }
      ]
      
      readFileStub.resolves('user data yaml')
      safeLoadStub.withArgs('user data yaml').returns(userData)
      
      const result = await staticData.loadStaticUserData()
      
      expect(readFileStub).to.have.been.called
      expect(safeLoadStub).to.have.been.calledWith('user data yaml')
      expect(result).to.deep.equal(userData)
    })
  })
  
  describe('loadStaticChallengeData', () => {
    it('should call loadStaticData with "challenges" and return the result', async () => {
      const challengeData = [
        { name: 'Challenge 1', category: 'Category 1', description: 'Description 1', difficulty: 1, hint: 'Hint 1', hintUrl: 'url1', mitigationUrl: 'mitigation1', key: 'key1' },
        { name: 'Challenge 2', category: 'Category 2', description: 'Description 2', difficulty: 2, hint: 'Hint 2', hintUrl: 'url2', mitigationUrl: 'mitigation2', key: 'key2' }
      ]
      
      readFileStub.resetHistory()
      safeLoadStub.resetHistory()
      
      readFileStub.resolves('challenge data yaml')
      safeLoadStub.withArgs('challenge data yaml').returns(challengeData)
      
      const result = await staticData.loadStaticChallengeData()
      
      expect(readFileStub).to.have.been.called
      expect(safeLoadStub).to.have.been.calledWith('challenge data yaml')
      expect(result).to.deep.equal(challengeData)
    })
  })
  
  describe('loadStaticDeliveryData', () => {
    it('should call loadStaticData with "deliveries" and return the result', async () => {
      const deliveryData = [
        { name: 'Delivery 1', price: 10, deluxePrice: 5, eta: 1, icon: 'icon1' },
        { name: 'Delivery 2', price: 20, deluxePrice: 15, eta: 2, icon: 'icon2' }
      ]
      
      readFileStub.resetHistory()
      safeLoadStub.resetHistory()
      
      readFileStub.resolves('delivery data yaml')
      safeLoadStub.withArgs('delivery data yaml').returns(deliveryData)
      
      const result = await staticData.loadStaticDeliveryData()
      
      expect(readFileStub).to.have.been.called
      expect(safeLoadStub).to.have.been.calledWith('delivery data yaml')
      expect(result).to.deep.equal(deliveryData)
    })
  })
  
  describe('loadStaticSecurityQuestionsData', () => {
    it('should call loadStaticData with "securityQuestions" and return the result', async () => {
      const securityQuestionsData = [
        { question: 'What is your mother\'s maiden name?' },
        { question: 'What was your first pet\'s name?' }
      ]
      
      readFileStub.resetHistory()
      safeLoadStub.resetHistory()
      
      readFileStub.resolves('security questions data yaml')
      safeLoadStub.withArgs('security questions data yaml').returns(securityQuestionsData)
      
      const result = await staticData.loadStaticSecurityQuestionsData()
      
      expect(readFileStub).to.have.been.called
      expect(safeLoadStub).to.have.been.calledWith('security questions data yaml')
      expect(result).to.deep.equal(securityQuestionsData)
    })
  })
})
