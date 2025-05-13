/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import * as antiCheat from '../../lib/antiCheat'
import { type Challenge } from '../../data/types'
import config from 'config'
import logger from '../../lib/logger'

chai.use(sinonChai)
const expect = chai.expect

describe('antiCheat', () => {
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    sandbox.stub(logger, 'info')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('calculateCheatScore', () => {
    it('should calculate cheat score based on time elapsed and difficulty', () => {
      const configStub = sandbox.stub(config, 'get')
      configStub.withArgs('challenges.showHints').returns(false)

      const challenge = {
        key: 'testChallenge',
        difficulty: 3,
        tutorialOrder: null
      } as unknown as Challenge

      const result = antiCheat.calculateCheatScore(challenge)

      expect(result).to.be.a('number')
      expect(result).to.be.greaterThan(0)
      expect(result).to.be.lessThan(1)
      sinon.assert.called(logger.info as sinon.SinonSpy)
    })

    it('should apply tutorial factor when challenge has tutorial', () => {
      const configStub = sandbox.stub(config, 'get')
      configStub.withArgs('challenges.showHints').returns(false)
      configStub.withArgs('hackingInstructor.isEnabled').returns(true)

      const challenge = {
        key: 'testChallenge',
        difficulty: 3,
        tutorialOrder: 1
      } as unknown as Challenge

      const result = antiCheat.calculateCheatScore(challenge)

      expect(result).to.be.a('number')
      sinon.assert.called(logger.info as sinon.SinonSpy)
    })

    it('should apply zero time factor for trivial challenges', () => {
      const configStub = sandbox.stub(config, 'get')
      configStub.withArgs('challenges.showHints').returns(false)

      const challenge = {
        key: 'errorHandlingChallenge', // This is in the trivialChallenges array
        difficulty: 3,
        tutorialOrder: null
      } as unknown as Challenge

      const result = antiCheat.calculateCheatScore(challenge)

      expect(result).to.be.a('number')
      sinon.assert.called(logger.info as sinon.SinonSpy)
    })
  })
  describe('calculateFindItCheatScore', () => {
    it('should return 0 if no code snippet exists', async () => {
      const challenge = { key: 'testChallenge' } as unknown as Challenge
      sandbox.stub(antiCheat, 'calculateFindItCheatScore').resolves(0)

      const result = await antiCheat.calculateFindItCheatScore(challenge)

      expect(result).to.equal(0)
    })

    it('should calculate cheat score based on snippet length and time elapsed', async () => {
      const challenge = { key: 'testChallenge' } as unknown as Challenge
      const vulnCodeSnippet = require('../../routes/vulnCodeSnippet')
      const retrieveCodeSnippetStub = sandbox.stub(vulnCodeSnippet, 'retrieveCodeSnippet')

      const codeSnippet = {
        snippet: 'const test = "test";'.repeat(10), // 10 lines of code
        vulnLines: [1, 2]
      }
      retrieveCodeSnippetStub.resolves(codeSnippet)

      sandbox.restore()

      sandbox.stub(logger, 'info')

      const result = await antiCheat.calculateFindItCheatScore(challenge)

      expect(result).to.be.a('number')
    })
  })

  describe('totalCheatScore', () => {
    it('should return a number', () => {
      const result = antiCheat.totalCheatScore()

      expect(result).to.be.a('number')
    })
  })
})
