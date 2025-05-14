/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import path from 'node:path'
import config from 'config'
import PDFDocument from 'pdfkit'
import { type Request, type Response, type NextFunction } from 'express'

import { challenges, products } from '../data/datacache'
import * as challengeUtils from '../lib/challengeUtils'
import { BasketItemModel } from '../models/basketitem'
import { DeliveryModel } from '../models/delivery'
import { QuantityModel } from '../models/quantity'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import { WalletModel } from '../models/wallet'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'
import * as db from '../data/mongodb'

interface Product {
  quantity: number
  id?: number
  name: string
  price: number
  total: number
  bonus: number
}

function updateProductQuantity (productId: number, quantity: number, next: NextFunction) {
  QuantityModel.findOne({ where: { ProductId: productId } })
    .then((product: any) => {
      if (product) {
        const newQuantity = product.quantity - quantity
        QuantityModel.update(
          { quantity: newQuantity },
          { where: { ProductId: productId } }
        ).catch((error: unknown) => {
          next(error)
        })
      }
    })
    .catch((error: unknown) => {
      next(error)
    })
}

function decrementWalletBalance (userId: number, amount: number, next: NextFunction) {
  WalletModel.decrement({ balance: amount }, { where: { UserId: userId } })
    .catch((error: unknown) => {
      next(error)
    })
}

function incrementWalletBalance (userId: number, amount: number, next: NextFunction) {
  WalletModel.increment({ balance: amount }, { where: { UserId: userId } })
    .catch((error: unknown) => {
      next(error)
    })
}

function processBasketProducts(basket: BasketModel, req: Request, doc: PDFKit.PDFDocument, next: NextFunction) {
  let totalPrice = 0
  const basketProducts: Product[] = []
  let totalPoints = 0
  
  basket.Products?.forEach(({ BasketItem, price, deluxePrice, name, id }) => {
    if (BasketItem != null) {
      challengeUtils.solveIf(challenges.christmasSpecialChallenge, () => { return BasketItem.ProductId === products.christmasSpecial.id })
      updateProductQuantity(BasketItem.ProductId, BasketItem.quantity, next)
      
      const itemPrice = security.isDeluxe(req) ? deluxePrice : price
      const itemTotal = itemPrice * BasketItem.quantity
      const itemBonus = Math.round(itemPrice / 10) * BasketItem.quantity
      
      const product = {
        quantity: BasketItem.quantity,
        id,
        name: req.__(name),
        price: itemPrice,
        total: itemTotal,
        bonus: itemBonus
      }
      
      basketProducts.push(product)
      doc.text(`${BasketItem.quantity}x ${req.__(name)} ${req.__('ea.')} ${itemPrice} = ${itemTotal}¤`)
      doc.moveDown()
      totalPrice += itemTotal
      totalPoints += itemBonus
    }
  })
  
  return { totalPrice, basketProducts, totalPoints }
}

function createOrderPdf(req: Request, orderId: string, email: string) {
  const pdfFile = `order_${orderId}.pdf`
  const doc = new PDFDocument()
  const date = new Date().toJSON().slice(0, 10)
  const fileWriter = doc.pipe(fs.createWriteStream(path.join('ftp/', path.basename(pdfFile))))
  
  doc.font('Times-Roman').fontSize(40).text(config.get<string>('application.name'), { align: 'center' })
  doc.moveTo(70, 115).lineTo(540, 115).stroke()
  doc.moveTo(70, 120).lineTo(540, 120).stroke()
  doc.fontSize(20).moveDown()
  doc.font('Times-Roman').fontSize(20).text(req.__('Order Confirmation'), { align: 'center' })
  doc.fontSize(20).moveDown()
  
  doc.font('Times-Roman').fontSize(15).text(`${req.__('Customer')}: ${email}`, { align: 'left' })
  doc.font('Times-Roman').fontSize(15).text(`${req.__('Order')} #: ${orderId}`, { align: 'left' })
  doc.moveDown()
  doc.font('Times-Roman').fontSize(15).text(`${req.__('Date')}: ${date}`, { align: 'left' })
  doc.moveDown()
  doc.moveDown()
  
  return { doc, fileWriter }
}

async function handleWalletOperations(req: Request, userId: number, totalPrice: number, totalPoints: number, next: NextFunction) {
  if (req.body.orderDetails && req.body.orderDetails.paymentId === 'wallet') {
    const wallet = await WalletModel.findOne({ where: { UserId: userId } })
    if ((wallet != null) && wallet.balance >= totalPrice) {
      decrementWalletBalance(userId, totalPrice, next)
    } else {
      throw new Error('Insufficient wallet balance.')
    }
  }
  incrementWalletBalance(userId, totalPoints, next)
}

function applyDiscountToPrice(req: Request, doc: PDFKit.PDFDocument, discount: number, totalPrice: number): { discountAmount: string, adjustedPrice: number } {
  const discountAmount = discount > 0 ? (totalPrice * (discount / 100)).toFixed(2) : '0'
  let adjustedPrice = totalPrice
  
  if (discount > 0) {
    doc.text(discount + '% discount from coupon: -' + discountAmount + '¤')
    doc.moveDown()
    adjustedPrice -= parseFloat(discountAmount)
  }
  
  return { discountAmount, adjustedPrice }
}

async function getDeliveryMethod(req: Request): Promise<{ deluxePrice: number, price: number, eta: number }> {
  const deliveryMethod = {
    deluxePrice: 0,
    price: 0,
    eta: 5
  }
  
  if (req.body.orderDetails?.deliveryMethodId) {
    const deliveryMethodFromModel = await DeliveryModel.findOne({ 
      where: { id: req.body.orderDetails.deliveryMethodId } 
    })
    if (deliveryMethodFromModel != null) {
      deliveryMethod.deluxePrice = deliveryMethodFromModel.deluxePrice
      deliveryMethod.price = deliveryMethodFromModel.price
      deliveryMethod.eta = deliveryMethodFromModel.eta
    }
  }
  
  return deliveryMethod
}

function addDeliveryAndFinalizeDocument(req: Request, doc: PDFKit.PDFDocument, deliveryMethod: { deluxePrice: number, price: number, eta: number }, 
                                        adjustedPrice: number, totalPoints: number): number {
  const deliveryAmount = security.isDeluxe(req) ? deliveryMethod.deluxePrice : deliveryMethod.price
  adjustedPrice += deliveryAmount
  
  doc.text(`${req.__('Delivery Price')}: ${deliveryAmount.toFixed(2)}¤`)
  doc.moveDown()
  doc.font('Helvetica-Bold').fontSize(20).text(`${req.__('Total Price')}: ${adjustedPrice.toFixed(2)}¤`)
  doc.moveDown()
  doc.font('Helvetica-Bold').fontSize(15).text(`${req.__('Bonus Points Earned')}: ${totalPoints}`)
  doc.font('Times-Roman').fontSize(15).text(`(${req.__('The bonus points from this order will be added 1:1 to your wallet ¤-fund for future purchases!')}`)
  doc.moveDown()
  doc.moveDown()
  doc.font('Times-Roman').fontSize(15).text(req.__('Thank you for your order!'))
  
  return deliveryAmount
}

function sanitizeOrderData(req: Request, email: string, deliveryMethod: { eta: number }): { 
  sanitizedPaymentId: string | null, 
  sanitizedAddressId: string | null, 
  sanitizedEmail: string | undefined, 
  sanitizedEta: string 
} {
  const sanitizedPaymentId = req.body.orderDetails?.paymentId ? String(req.body.orderDetails.paymentId).replace(/[\r\n]/g, '') : null
  const sanitizedAddressId = req.body.orderDetails?.addressId ? String(req.body.orderDetails.addressId).replace(/[\r\n]/g, '') : null
  const sanitizedEmail = email ? String(email).replace(/[aeiou]/gi, '*').replace(/[\r\n]/g, '') : undefined
  const sanitizedEta = String(deliveryMethod.eta).replace(/[\r\n]/g, '')
  
  return { sanitizedPaymentId, sanitizedAddressId, sanitizedEmail, sanitizedEta }
}

export function placeOrder () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id
      const basket = await BasketModel.findOne({ 
        where: { id }, 
        include: [{ model: ProductModel, paranoid: false, as: 'Products' }] 
      })
      
      if (basket == null) {
        throw new Error(`Basket with id=${id} does not exist.`)
      }
      
      const customer = security.authenticatedUsers.from(req)
      const email = customer?.data?.email || ''
      const orderId = security.hash(email).slice(0, 4) + '-' + utils.randomHexString(16)
      
      const { doc, fileWriter } = createOrderPdf(req, orderId, email)
      const { totalPrice, basketProducts, totalPoints } = processBasketProducts(basket, req, doc, next)
      
      const discount = calculateApplicableDiscount(basket, req) ?? 0
      const { discountAmount, adjustedPrice } = applyDiscountToPrice(req, doc, discount, totalPrice)
      
      const deliveryMethod = await getDeliveryMethod(req)
      const deliveryAmount = addDeliveryAndFinalizeDocument(req, doc, deliveryMethod, adjustedPrice, totalPoints)
      
      challengeUtils.solveIf(challenges.negativeOrderChallenge, () => { return adjustedPrice < 0 })
      
      if (req.body.UserId) {
        await handleWalletOperations(req, req.body.UserId, adjustedPrice, totalPoints, next)
      }
      
      const { sanitizedPaymentId, sanitizedAddressId, sanitizedEmail, sanitizedEta } = 
        sanitizeOrderData(req, email, deliveryMethod)
      
      await db.ordersCollection.insert({
        promotionalAmount: discountAmount,
        paymentId: sanitizedPaymentId,
        addressId: sanitizedAddressId,
        orderId,
        delivered: false,
        email: sanitizedEmail,
        totalPrice: adjustedPrice,
        products: basketProducts,
        bonus: totalPoints,
        deliveryPrice: deliveryAmount,
        eta: sanitizedEta
      })
      
      doc.end()
      
      fileWriter.on('finish', async () => {
        void basket.update({ coupon: null })
        await BasketItemModel.destroy({ where: { BasketId: id } })
        res.json({ orderConfirmation: orderId })
      })
      
    } catch (error: unknown) {
      next(error)
    }
  }
}

function calculateApplicableDiscount (basket: BasketModel, req: Request) {
  if (security.discountFromCoupon(basket.coupon ?? undefined)) {
    const discount = security.discountFromCoupon(basket.coupon ?? undefined)
    challengeUtils.solveIf(challenges.forgedCouponChallenge, () => { return discount ?? 0 >= 80 })
    return discount
  } else if (req.body.couponData) {
    const couponData = Buffer.from(req.body.couponData, 'base64').toString().split('-')
    const couponCode = couponData[0]
    const couponDate = Number(couponData[1])
    const campaign = campaigns[couponCode as keyof typeof campaigns]

    if (campaign && couponDate == campaign.validOn) { // eslint-disable-line eqeqeq
      challengeUtils.solveIf(challenges.manipulateClockChallenge, () => { return campaign.validOn < new Date().getTime() })
      return campaign.discount
    }
  }
  return 0
}

const campaigns = {
  WMNSDY2019: { validOn: new Date('Mar 08, 2019 00:00:00 GMT+0100').getTime(), discount: 75 },
  WMNSDY2020: { validOn: new Date('Mar 08, 2020 00:00:00 GMT+0100').getTime(), discount: 60 },
  WMNSDY2021: { validOn: new Date('Mar 08, 2021 00:00:00 GMT+0100').getTime(), discount: 60 },
  WMNSDY2022: { validOn: new Date('Mar 08, 2022 00:00:00 GMT+0100').getTime(), discount: 60 },
  WMNSDY2023: { validOn: new Date('Mar 08, 2023 00:00:00 GMT+0100').getTime(), discount: 60 },
  ORANGE2020: { validOn: new Date('May 04, 2020 00:00:00 GMT+0100').getTime(), discount: 50 },
  ORANGE2021: { validOn: new Date('May 04, 2021 00:00:00 GMT+0100').getTime(), discount: 40 },
  ORANGE2022: { validOn: new Date('May 04, 2022 00:00:00 GMT+0100').getTime(), discount: 40 },
  ORANGE2023: { validOn: new Date('May 04, 2023 00:00:00 GMT+0100').getTime(), discount: 40 }
}
