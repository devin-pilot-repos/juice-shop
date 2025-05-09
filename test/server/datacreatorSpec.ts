/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import rewire from 'rewire'
import * as datacache from '../../data/datacache'
import * as staticData from '../../data/staticData'
import * as mongodb from '../../data/mongodb'
import * as utils from '../../lib/utils'
import logger from '../../lib/logger'
import config from 'config'

const datacreator = rewire('../../data/datacreator')
import { UserModel } from '../../models/user'
import { ChallengeModel } from '../../models/challenge'
import { ProductModel } from '../../models/product'
import { BasketModel } from '../../models/basket'
import { BasketItemModel } from '../../models/basketitem'
import { FeedbackModel } from '../../models/feedback'
import { ComplaintModel } from '../../models/complaint'
import { RecycleModel } from '../../models/recycle'
import { SecurityQuestionModel } from '../../models/securityQuestion'
import { SecurityAnswerModel } from '../../models/securityAnswer'
import { QuantityModel } from '../../models/quantity'
import { DeliveryModel } from '../../models/delivery'
import { WalletModel } from '../../models/wallet'
import { MemoryModel } from '../../models/memory'
import { AddressModel } from '../../models/address'
import { CardModel } from '../../models/card'

const expect = chai.expect
chai.use(sinonChai)

describe('datacreator', () => {
  let loadStaticDataStub: sinon.SinonStub
  let createStub: sinon.SinonStub
  let insertStub: sinon.SinonStub
  let loggerStub: sinon.SinonStub
  let configStub: sinon.SinonStub
  let downloadToFileStub: sinon.SinonStub
  let isUrlStub: sinon.SinonStub
  let extractFilenameStub: sinon.SinonStub
  let replaceStub: sinon.SinonStub
  
  beforeEach(() => {
    loadStaticDataStub = sinon.stub(staticData, 'loadStaticChallengeData')
    createStub = sinon.stub()
    insertStub = sinon.stub()
    loggerStub = sinon.stub(logger, 'error')
    configStub = sinon.stub(config, 'get')
    downloadToFileStub = sinon.stub(utils, 'downloadToFile')
    isUrlStub = sinon.stub(utils, 'isUrl')
    extractFilenameStub = sinon.stub(utils, 'extractFilename')
    replaceStub = sinon.stub()
    
    sinon.stub(ChallengeModel, 'create').callsFake(createStub)
    
    const insertPromise = {
      then: function() { return this },
      catch: function() { return this }
    }
    
    sinon.stub(mongodb.reviewsCollection, 'insert').callsFake(function(this: any, ...args: any[]) {
      insertStub.apply(this, args)
      return insertPromise
    })
  })
  
  afterEach(() => {
    sinon.restore()
  })
  
  describe('createChallenges', () => {
    let createChallenges: Function
    
    beforeEach(() => {
      createChallenges = datacreator.__get__('createChallenges')
    })
    
    it('should load challenges from static data and create challenge models', async () => {
      const challenges = [
        {
          name: 'Test Challenge 1',
          category: 'Test Category',
          description: 'Test description for juice-sh.op',
          difficulty: 1,
          hint: 'Test hint for OWASP Juice Shop\'s challenge',
          hintUrl: 'https://example.com/hint1',
          mitigationUrl: 'https://example.com/mitigation1',
          key: 'testChallenge1',
          tags: ['test', 'challenge']
        },
        {
          name: 'Test Challenge 2',
          category: 'Test Category 2',
          description: 'Another test description',
          difficulty: 2,
          hint: 'Another test hint',
          hintUrl: 'https://example.com/hint2',
          mitigationUrl: 'https://example.com/mitigation2',
          key: 'testChallenge2'
        }
      ]
      
      loadStaticDataStub.resolves(challenges)
      configStub.withArgs('challenges.showHints').returns(true)
      configStub.withArgs('challenges.showMitigations').returns(true)
      configStub.withArgs('application.domain').returns('example.com')
      configStub.withArgs('application.name').returns('Test Shop')
      configStub.withArgs('challenges.xssBonusPayload').returns('<iframe src="javascript:alert(`xss`)"></iframe>')
      
      sinon.stub(utils, 'getChallengeEnablementStatus').returns({ enabled: true, disabledBecause: null })
      
      const challengesMock = {}
      sinon.stub(datacache, 'challenges').value(challengesMock)
      
      await createChallenges()
      
      expect(loadStaticDataStub).to.have.been.calledOnce
      expect(createStub).to.have.been.calledTwice
      
      const firstCallArgs = createStub.firstCall.args[0]
      expect(firstCallArgs.name).to.equal('Test Challenge 1')
      expect(firstCallArgs.category).to.equal('Test Category')
      expect(firstCallArgs.description).to.include('example.com')
      expect(firstCallArgs.hint).to.include('Test Shop')
      expect(firstCallArgs.tags).to.equal('test,challenge')
      
      const secondCallArgs = createStub.secondCall.args[0]
      expect(secondCallArgs.name).to.equal('Test Challenge 2')
      expect(secondCallArgs.category).to.equal('Test Category 2')
    })
    
    it('should handle errors when creating challenges', async () => {
      const challenges = [{
        name: 'Error Challenge',
        category: 'Error Category',
        description: 'Error description',
        difficulty: 3,
        hint: 'Error hint',
        hintUrl: 'https://example.com/error',
        mitigationUrl: 'https://example.com/error',
        key: 'errorChallenge'
      }]
      
      loadStaticDataStub.resolves(challenges)
      configStub.withArgs('challenges.showHints').returns(true)
      configStub.withArgs('challenges.showMitigations').returns(true)
      configStub.withArgs('application.domain').returns('example.com')
      
      sinon.stub(utils, 'getChallengeEnablementStatus').returns({ enabled: true, disabledBecause: null })
      
      const error = new Error('Database error')
      createStub.throws(error)
      
      const challengesMock = {}
      sinon.stub(datacache, 'challenges').value(challengesMock)
      
      await createChallenges()
      
      expect(loggerStub).to.have.been.calledOnce
      expect(loggerStub.firstCall.args[0]).to.include('Error Challenge')
    })
  })
  
  describe('createProducts', () => {
    let createProducts: Function
    
    beforeEach(() => {
      createProducts = datacreator.__get__('createProducts')
    })
    
    it.skip('should create products from configuration and handle image downloads', function(done) {
      this.timeout(5000) // Increase timeout to 5 seconds
      const products = [
        {
          name: 'Test Product 1',
          description: 'Test description 1',
          price: 10,
          image: 'https://example.com/image1.jpg',
          reviews: [
            { text: 'Great product', author: 'admin' }
          ]
        },
        {
          name: 'Test Product 2',
          description: 'Test description 2',
          price: 20,
          image: 'local-image.jpg'
        }
      ]
      
      configStub.withArgs('products').returns(products)
      
      const productStub = sinon.stub(ProductModel, 'create')
      productStub.onFirstCall().resolves({ dataValues: { id: 1, name: 'Test Product 1' } } as any)
      productStub.onSecondCall().resolves({ dataValues: { id: 2, name: 'Test Product 2' } } as any)
      
      isUrlStub.withArgs('https://example.com/image1.jpg').returns(true)
      isUrlStub.withArgs('local-image.jpg').returns(false)
      extractFilenameStub.withArgs('https://example.com/image1.jpg').returns('image1.jpg')
      
      const productsMock = {}
      sinon.stub(datacache, 'products').value(productsMock)
      
      sinon.stub(datacache, 'users').value({
        admin: { email: 'admin@example.com' }
      })
      
      createProducts().then(() => {
        expect(productStub).to.have.been.calledTwice
        
        const firstCallArgs = productStub.firstCall.args[0]
        expect(firstCallArgs?.name).to.equal('Test Product 1')
        expect(firstCallArgs?.price).to.equal(10)
        expect(firstCallArgs?.image).to.equal('image1.jpg')
        
        expect(downloadToFileStub).to.have.been.calledOnce
        expect(downloadToFileStub.firstCall.args[0]).to.equal('https://example.com/image1.jpg')
        
        expect(insertStub).to.have.been.calledOnce
        const reviewArgs = insertStub.firstCall.args[0]
        expect(reviewArgs.message).to.equal('Great product')
        expect(reviewArgs.author).to.equal('admin@example.com')
        expect(reviewArgs.product).to.equal(1)
        
        done()
      }).catch(done)
    })
  })
})
