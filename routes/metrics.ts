/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { retrieveChallengesWithCodeSnippet } from './vulnCodeSnippet'
import { type Request, type Response, type NextFunction } from 'express'
import { ChallengeModel } from '../models/challenge'
import { UserModel } from '../models/user'
import { WalletModel } from '../models/wallet'
import { FeedbackModel } from '../models/feedback'
import { ComplaintModel } from '../models/complaint'
import { Op } from 'sequelize'
import * as challengeUtils from '../lib/challengeUtils'
import logger from '../lib/logger'
import config from 'config'
import * as utils from '../lib/utils'
import { totalCheatScore } from '../lib/antiCheat'
import * as accuracy from '../lib/accuracy'
import { reviewsCollection, ordersCollection } from '../data/mongodb'
import { challenges } from '../data/datacache'
import * as Prometheus from 'prom-client'
import onFinished from 'on-finished'

const register = Prometheus.register

const fileUploadsCountMetric = new Prometheus.Counter({
  name: 'file_uploads_count',
  help: 'Total number of successful file uploads grouped by file type.',
  labelNames: ['file_type']
})

const fileUploadErrorsMetric = new Prometheus.Counter({
  name: 'file_upload_errors',
  help: 'Total number of failed file uploads grouped by file type.',
  labelNames: ['file_type']
})

export function observeRequestMetricsMiddleware () {
  const httpRequestsMetric = new Prometheus.Counter({
    name: 'http_requests_count',
    help: 'Total HTTP request count grouped by status code.',
    labelNames: ['status_code']
  })

  return (req: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      const statusCode = `${Math.floor(res.statusCode / 100)}XX`
      httpRequestsMetric.labels(statusCode).inc()
    })
    next()
  }
}

export function observeFileUploadMetricsMiddleware () {
  return ({ file }: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      if (file != null) {
        res.statusCode < 400 ? fileUploadsCountMetric.labels(file.mimetype).inc() : fileUploadErrorsMetric.labels(file.mimetype).inc()
      }
    })
    next()
  }
}

export function serveMetrics () {
  return async (req: Request, res: Response, next: NextFunction) => {
    challengeUtils.solveIf(challenges.exposedMetricsChallenge, () => {
      const userAgent = String(req.headers['user-agent'] ?? '').replace(/[\r\n]/g, '')
      return !userAgent.includes('Prometheus')
    })
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
}

export function observeMetrics () {
  const app = config.get<string>('application.customMetricsPrefix')
  Prometheus.collectDefaultMetrics({})
  register.setDefaultLabels({ app })

  const versionMetrics = new Prometheus.Gauge({
    name: `${app}_version_info`,
    help: `Release version of ${config.get<string>('application.name')}.`,
    labelNames: ['version', 'major', 'minor', 'patch']
  })

  const challengeSolvedMetrics = new Prometheus.Gauge({
    name: `${app}_challenges_solved`,
    help: 'Number of solved challenges grouped by difficulty and category.',
    labelNames: ['difficulty', 'category']
  })

  const challengeTotalMetrics = new Prometheus.Gauge({
    name: `${app}_challenges_total`,
    help: 'Total number of challenges grouped by difficulty and category.',
    labelNames: ['difficulty', 'category']
  })

  const codingChallengesProgressMetrics = new Prometheus.Gauge({
    name: `${app}_coding_challenges_progress`,
    help: 'Number of coding challenges grouped by progression phase.',
    labelNames: ['phase']
  })

  const cheatScoreMetrics = new Prometheus.Gauge({
    name: `${app}_cheat_score`,
    help: 'Overall probability that any hacking or coding challenges were solved by cheating.'
  })

  const accuracyMetrics = new Prometheus.Gauge({
    name: `${app}_coding_challenges_accuracy`,
    help: 'Overall accuracy while solving coding challenges grouped by phase.',
    labelNames: ['phase']
  })

  const orderMetrics = new Prometheus.Gauge({
    name: `${app}_orders_placed_total`,
    help: `Number of orders placed in ${config.get<string>('application.name')}.`
  })

  const userMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered`,
    help: 'Number of registered users grouped by customer type.',
    labelNames: ['type']
  })

  const userTotalMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered_total`,
    help: 'Total number of registered users.'
  })

  const walletMetrics = new Prometheus.Gauge({
    name: `${app}_wallet_balance_total`,
    help: 'Total balance of all users\' digital wallets.'
  })

  const interactionsMetrics = new Prometheus.Gauge({
    name: `${app}_user_social_interactions`,
    help: 'Number of social interactions with users grouped by type.',
    labelNames: ['type']
  })

  async function updateCodingChallengeMetrics (challenges: any[], metricsGauge: Prometheus.Gauge) {
    try {
      const findItCount = await ChallengeModel.count({ where: { codingChallengeStatus: { [Op.eq]: 1 } } })
      metricsGauge.set({ phase: 'find it' }, findItCount)
      const fixItCount = await ChallengeModel.count({ where: { codingChallengeStatus: { [Op.eq]: 2 } } })
      metricsGauge.set({ phase: 'fix it' }, fixItCount)

      const nonZeroCount = await ChallengeModel.count({ where: { codingChallengeStatus: { [Op.ne]: 0 } } })
      metricsGauge.set({ phase: 'unsolved' }, challenges.length - nonZeroCount)
    } catch (error) {
      logger.warn('Error updating coding challenge metrics: ' + utils.getErrorMessage(error))
    }
  }

  function updateOrderMetrics(orderCount: number, metrics: Prometheus.Gauge) {
    if (orderCount) metrics.set(orderCount)
  }

  function updateInteractionMetrics(count: number, type: string, metrics: Prometheus.Gauge) {
    if (count) metrics.set({ type }, count)
  }

  function updateUserMetrics(count: number, type: string, metrics: Prometheus.Gauge) {
    if (count) metrics.set({ type }, count)
  }

  function updateTotalMetrics(count: number, metrics: Prometheus.Gauge) {
    if (count) metrics.set(count)
  }

  const updateLoop = () => setInterval(() => {
    try {
      const version = utils.version()
      const { major, minor, patch } = version.match(/(?<major>\d+).(?<minor>\d+).(?<patch>\d+)/).groups
      versionMetrics.set({ version, major, minor, patch }, 1)

      const challengeStatuses = new Map()
      const challengeCount = new Map()

      for (const { difficulty, category, solved } of Object.values<ChallengeModel>(challenges)) {
        const key = `${difficulty}:${category}`

        // Increment by one if solved, when not solved increment by 0. This ensures that even unsolved challenges are set to , instead of not being set at all
        challengeStatuses.set(key, (challengeStatuses.get(key) || 0) + (solved ? 1 : 0))
        challengeCount.set(key, (challengeCount.get(key) || 0) + 1)
      }

      for (const key of challengeStatuses.keys()) {
        const [difficulty, category] = key.split(':', 2)

        challengeSolvedMetrics.set({ difficulty, category }, challengeStatuses.get(key))
        challengeTotalMetrics.set({ difficulty, category }, challengeCount.get(key))
      }

      void retrieveChallengesWithCodeSnippet().then(
        challenges => void updateCodingChallengeMetrics(challenges, codingChallengesProgressMetrics)
      )

      cheatScoreMetrics.set(totalCheatScore())
      accuracyMetrics.set({ phase: 'find it' }, accuracy.totalFindItAccuracy())
      accuracyMetrics.set({ phase: 'fix it' }, accuracy.totalFixItAccuracy())

      ordersCollection.count({}).then(
        (orderCount: number) => updateOrderMetrics(orderCount, orderMetrics)
      )

      reviewsCollection.count({}).then(
        (reviewCount: number) => updateInteractionMetrics(reviewCount, 'review', interactionsMetrics)
      )

      void UserModel.count({ where: { role: { [Op.eq]: 'customer' } } }).then(
        count => updateUserMetrics(count, 'standard', userMetrics)
      )

      void UserModel.count({ where: { role: { [Op.eq]: 'deluxe' } } }).then(
        count => updateUserMetrics(count, 'deluxe', userMetrics)
      )

      void UserModel.count().then(
        count => updateTotalMetrics(count, userTotalMetrics)
      )

      void WalletModel.sum('balance').then(
        totalBalance => updateTotalMetrics(totalBalance, walletMetrics)
      )

      void FeedbackModel.count().then(
        count => updateInteractionMetrics(count, 'feedback', interactionsMetrics)
      )

      void ComplaintModel.count().then(
        count => updateInteractionMetrics(count, 'complaint', interactionsMetrics)
      )
    } catch (e: unknown) {
      logger.warn('Error during metrics update loop: + ' + utils.getErrorMessage(e))
    }
  }, 5000)

  return {
    register,
    updateLoop
  }
}
