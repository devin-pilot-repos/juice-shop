/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
const MarsDB = require('marsdb')
import * as mongodb from '../../data/mongodb'

const expect = chai.expect
chai.use(sinonChai)

describe('mongodb', () => {
  let collectionStub: sinon.SinonStub
  
  beforeEach(() => {
    collectionStub = sinon.stub(MarsDB, 'Collection')
  })
  
  afterEach(() => {
    collectionStub.restore()
  })
  
  it('should create a reviews collection', () => {
    delete require.cache[require.resolve('../../data/mongodb')]
    const mongodb = require('../../data/mongodb')
    expect(mongodb.reviewsCollection).to.exist
    expect(collectionStub).to.have.been.calledWith('posts')
  })
  
  it('should create an orders collection', () => {
    delete require.cache[require.resolve('../../data/mongodb')]
    const mongodb = require('../../data/mongodb')
    expect(mongodb.ordersCollection).to.exist
    expect(collectionStub).to.have.been.calledWith('orders')
  })
  
  it('should export both collections', () => {
    const exportedProperties = Object.keys(mongodb)
    expect(exportedProperties).to.include('reviewsCollection')
    expect(exportedProperties).to.include('ordersCollection')
    expect(exportedProperties.length).to.equal(2)
  })
})
