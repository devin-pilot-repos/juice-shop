/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import * as datacache from '../../data/datacache'

const expect = chai.expect

describe('datacache', () => {
  describe('challenges', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.challenges).to.be.an('object')
    })
  })

  describe('users', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.users).to.be.an('object')
    })
  })

  describe('products', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.products).to.be.an('object')
    })
  })

  describe('feedback', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.feedback).to.be.an('object')
    })
  })

  describe('baskets', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.baskets).to.be.an('object')
    })
  })

  describe('basketItems', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.basketItems).to.be.an('object')
    })
  })

  describe('complaints', () => {
    it('should be initialized as an empty object', () => {
      expect(datacache.complaints).to.be.an('object')
    })
  })

  describe('notifications', () => {
    it('should be initialized as an empty array', () => {
      expect(datacache.notifications).to.be.an('array').that.is.empty
    })
  })

  describe('retrieveBlueprintChallengeFile', () => {
    it('should be initialized as null', () => {
      expect(datacache.retrieveBlueprintChallengeFile).to.be.null
    })
  })

  describe('setRetrieveBlueprintChallengeFile', () => {
    it('should set the retrieveBlueprintChallengeFile value', () => {
      const originalValue = datacache.retrieveBlueprintChallengeFile
      
      datacache.setRetrieveBlueprintChallengeFile('test-file.md')
      expect(datacache.retrieveBlueprintChallengeFile).to.equal('test-file.md')
      
      datacache.setRetrieveBlueprintChallengeFile('another-file.pdf')
      expect(datacache.retrieveBlueprintChallengeFile).to.equal('another-file.pdf')
      
      if (originalValue === null) {
        datacache.setRetrieveBlueprintChallengeFile(null as any)
      } else {
        datacache.setRetrieveBlueprintChallengeFile(originalValue)
      }
    })
    
    it('should handle empty string value', () => {
      const originalValue = datacache.retrieveBlueprintChallengeFile
      
      datacache.setRetrieveBlueprintChallengeFile('')
      expect(datacache.retrieveBlueprintChallengeFile).to.equal('')
      
      if (originalValue === null) {
        datacache.setRetrieveBlueprintChallengeFile(null as any)
      } else {
        datacache.setRetrieveBlueprintChallengeFile(originalValue)
      }
    })
  })
})
