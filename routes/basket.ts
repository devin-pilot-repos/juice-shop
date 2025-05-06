/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import * as challengeUtils from '../lib/challengeUtils'

import * as utils from '../lib/utils'
import * as security from '../lib/insecurity'
import { challenges } from '../data/datacache'

export function retrieveBasket () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const user = security.authenticatedUsers.from(req)
    if (!user || !id || id === 'undefined' || id === 'null' || id === 'NaN') {
      return res.status(403).json({ error: 'Unauthorized access to basket' })
    }
    const parsedId = parseInt(id, 10)
    if (user.bid !== parsedId) {
      challengeUtils.solveIf(challenges.basketAccessChallenge, () => { return true })
      return res.status(403).json({ error: 'Unauthorized access to basket' })
    }
    BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false, as: 'Products' }] })
      .then((basket: BasketModel | null) => {
        if (((basket?.Products) != null) && basket.Products.length > 0) {
          for (let i = 0; i < basket.Products.length; i++) {
            basket.Products[i].name = req.__(basket.Products[i].name)
          }
        }

        res.json(utils.queryResultToJson(basket))
      }).catch((error: Error) => {
        next(error)
      })
  }
}
