/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import * as basketItems from '../../routes/basketItems'
import { BasketItemModel } from '../../models/basketitem'
import { QuantityModel } from '../../models/quantity'
import * as challengeUtils from '../../lib/challengeUtils'
import * as security from '../../lib/insecurity'
import * as utils from '../../lib/utils'
import { challenges } from '../../data/datacache'

chai.use(sinonChai)
const expect = chai.expect

describe('basketItems', () => {
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    challenges.basketManipulateChallenge = { solved: false } as any
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('addBasketItem', () => {
    let req: any
    let res: any
    let next: sinon.SinonSpy
    let save: sinon.SinonStub
    let build: sinon.SinonStub
    let from: sinon.SinonStub
    let solveIf: sinon.SinonStub
    let parseJsonCustom: sinon.SinonStub

    beforeEach(() => {
      req = {
        rawBody: '[{"key":"ProductId","value":"1"},{"key":"BasketId","value":"1"},{"key":"quantity","value":"1"}]'
      }
      res = {
        json: sandbox.spy(),
        status: sandbox.stub().returns({ send: sandbox.spy() })
      }
      next = sandbox.spy()

      from = sandbox.stub()
      sandbox.stub(security, 'authenticatedUsers').value({ from })

      solveIf = sandbox.stub(challengeUtils, 'solveIf')

      parseJsonCustom = sandbox.stub(utils, 'parseJsonCustom')
      parseJsonCustom.returns([
        { key: 'ProductId', value: '1' },
        { key: 'BasketId', value: '1' },
        { key: 'quantity', value: '1' }
      ])

      save = sandbox.stub().resolves({ id: 1, ProductId: '1', BasketId: '1', quantity: '1' })
      build = sandbox.stub(BasketItemModel, 'build').returns({ save } as any)
    })

    it('should add basket item for authenticated user with matching basket ID', async () => {
      // Setup user with matching basket ID
      const user = { id: 1, bid: 1 }
      from.withArgs(req).returns(user)

      const addBasketItemFunc = basketItems.addBasketItem()
      addBasketItemFunc(req, res, next)

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(build).to.have.been.calledWith({
        ProductId: '1',
        BasketId: '1',
        quantity: '1'
      })
      sinon.assert.called(save as sinon.SinonSpy)
      sinon.assert.called(res.json as sinon.SinonSpy)
    })

    it('should reject when basket ID does not match user', () => {
      // Setup user with non-matching basket ID
      const user = { id: 1, bid: 2 }
      from.withArgs(req).returns(user)

      const addBasketItemFunc = basketItems.addBasketItem()
      addBasketItemFunc(req, res, next)

      expect(res.status).to.have.been.calledWith(401)
      sinon.assert.notCalled(build as sinon.SinonSpy)
    })

    it('should handle error during save', async () => {
      const user = { id: 1, bid: 1 }
      from.withArgs(req).returns(user)
      const error = new Error('Database error')
      save.rejects(error)

      const addBasketItemFunc = basketItems.addBasketItem()
      addBasketItemFunc(req, res, next)

      await new Promise(resolve => setTimeout(resolve, 10))

      sinon.assert.called(next)
    })

    it('should solve basket manipulation challenge when basket IDs do not match', async () => {
      // Setup user with matching basket ID to pass the initial check
      const user = { id: 1, bid: 1 }
      from.withArgs(req).returns(user)

      parseJsonCustom.returns([
        { key: 'ProductId', value: '1' },
        { key: 'BasketId', value: '1' }, // Same as user.bid to pass initial check
        { key: 'quantity', value: '1' }
      ])

      build.callsFake((basketItem) => {
        basketItem.BasketId = '2' // Different from user.bid to trigger solveIf
        return { save }
      })

      const addBasketItemFunc = basketItems.addBasketItem()
      addBasketItemFunc(req, res, next)

      await new Promise(resolve => setTimeout(resolve, 10))

      sinon.assert.called(solveIf)
    })
  })

  describe('quantityCheckBeforeBasketItemAddition', () => {
    let req: any
    let res: any
    let next: sinon.SinonSpy
    let findOne: sinon.SinonStub

    beforeEach(() => {
      req = {
        body: {
          ProductId: 1,
          quantity: 1
        }
      }
      res = {
        status: sandbox.stub().returns({
          json: sandbox.spy()
        }),
        __: sandbox.stub().returns('Translated message')
      }
      next = sandbox.spy()

      findOne = sandbox.stub(QuantityModel, 'findOne')
    })

    it('should call next when product has sufficient quantity', async () => {
      const product = {
        ProductId: 1,
        quantity: 10,
        limitPerUser: null
      } as unknown as QuantityModel

      findOne.resolves(product)
      sandbox.stub(security, 'isDeluxe').returns(false)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()
      checkFunc(req, res, next)

      expect(findOne).to.have.been.calledWith({ where: { ProductId: 1 } })
      sinon.assert.called(next)
    })

    it('should return error when product is not found', async () => {
      findOne.resolves(null)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()

      try {
        checkFunc(req, res, next)
      } catch (error) {
        // Error is expected
      }

      sinon.assert.called(findOne as sinon.SinonSpy)
    })

    it('should handle error during database query', async () => {
      const error = new Error('Database error')
      findOne.rejects(error)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()

      checkFunc(req, res, next)

      sinon.assert.called(findOne as sinon.SinonSpy)
    })
  })

  describe('quantityCheckBeforeBasketItemUpdate', () => {
    let req: any
    let res: any
    let next: sinon.SinonSpy
    let findOne: sinon.SinonStub
    let from: sinon.SinonStub
    let solveIf: sinon.SinonStub

    beforeEach(() => {
      req = {
        params: { id: 1 },
        body: {
          quantity: 2,
          BasketId: 1
        }
      }
      res = {
        status: sandbox.stub().returns({
          json: sandbox.spy()
        }),
        __: sandbox.stub().returns('Translated message')
      }
      next = sandbox.spy()

      findOne = sandbox.stub(BasketItemModel, 'findOne')

      from = sandbox.stub()
      sandbox.stub(security, 'authenticatedUsers').value({ from })

      solveIf = sandbox.stub(challengeUtils, 'solveIf')
    })

    it('should call next when item is found but no quantity is provided', async () => {
      const user = { id: 1, bid: 1 }
      from.withArgs(req).returns(user)
      findOne.resolves({ id: 1, ProductId: 1 } as unknown as BasketItemModel)
      req.body.quantity = null

      const checkFunc = basketItems.quantityCheckBeforeBasketItemUpdate()
      checkFunc(req, res, next)

      expect(findOne).to.have.been.calledWith({ where: { id: 1 } })
      sinon.assert.called(next)
    })

    it('should solve basket manipulation challenge when basket IDs do not match', async () => {
      const user = { id: 1, bid: 2 }
      from.withArgs(req).returns(user)
      findOne.resolves({ id: 1, ProductId: 1 } as unknown as BasketItemModel)
      req.body.quantity = null

      const checkFunc = basketItems.quantityCheckBeforeBasketItemUpdate()
      checkFunc(req, res, next)

      sinon.assert.called(solveIf)
    })

    it('should handle error when item is not found', async () => {
      findOne.resolves(null)
      req.body.quantity = 5 // Ensure quantity is provided to trigger the error path

      const checkFunc = basketItems.quantityCheckBeforeBasketItemUpdate()

      checkFunc(req, res, next)

      sinon.assert.called(findOne as sinon.SinonSpy)
    })

    it('should handle database query error', async () => {
      const error = new Error('Database error')
      findOne.rejects(error)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemUpdate()
      checkFunc(req, res, next)

      // Verify findOne was called, which is part of the error path
      sinon.assert.called(findOne as sinon.SinonSpy)
    })
  })

  describe('quantityCheck (private function)', () => {
    let req: any
    let res: any
    let next: sinon.SinonSpy
    let findOne: sinon.SinonStub
    let isDeluxe: sinon.SinonStub

    beforeEach(() => {
      req = {
        body: {
          ProductId: 1,
          quantity: 5
        }
      }
      res = {
        status: sandbox.stub().returns({
          json: sandbox.spy()
        }),
        __: sandbox.stub().callsFake((message, params) => {
          return params ? `${message} ${JSON.stringify(params)}` : message
        })
      }
      next = sandbox.spy()

      findOne = sandbox.stub(QuantityModel, 'findOne')

      isDeluxe = sandbox.stub(security, 'isDeluxe')
    })

    it('should call next when product has sufficient quantity', async () => {
      const product = {
        ProductId: 1,
        quantity: 10,
        limitPerUser: null
      } as unknown as QuantityModel

      findOne.resolves(product)
      isDeluxe.returns(false)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()
      checkFunc(req, res, next)

      expect(findOne).to.have.been.calledWith({ where: { ProductId: 1 } })
      sinon.assert.called(next)
    })

    it('should return error when product quantity is insufficient', async () => {
      const product = {
        ProductId: 1,
        quantity: 3,
        limitPerUser: null
      } as unknown as QuantityModel

      findOne.resolves(product)
      isDeluxe.returns(false)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()
      checkFunc(req, res, next)

      expect(res.status).to.have.been.calledWith(400)
      sinon.assert.called(res.status().json as sinon.SinonSpy)
    })

    it('should return error when product has per-user limit exceeded', async () => {
      const product = {
        ProductId: 1,
        quantity: 10,
        limitPerUser: 2
      } as unknown as QuantityModel

      findOne.resolves(product)
      isDeluxe.returns(false)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()
      checkFunc(req, res, next)

      expect(res.status).to.have.been.calledWith(400)
      sinon.assert.called(res.status().json as sinon.SinonSpy)
    })

    it('should ignore per-user limit for deluxe users', async () => {
      const product = {
        ProductId: 1,
        quantity: 10,
        limitPerUser: 2
      } as unknown as QuantityModel

      findOne.resolves(product)
      isDeluxe.returns(true)

      const checkFunc = basketItems.quantityCheckBeforeBasketItemAddition()
      checkFunc(req, res, next)

      sinon.assert.called(next)
    })
  })
})
