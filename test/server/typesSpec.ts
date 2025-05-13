/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import * as types from '../../data/types'

const expect = chai.expect

describe('types', () => {
  describe('Review', () => {
    it('should define the Review interface with all required properties', () => {
      const review: types.Review = {
        text: 'Great product!',
        author: 'John Doe',
        liked: true,
        likedBy: ['user1', 'user2']
      }
      
      expect(review.text).to.be.a('string')
      expect(review.author).to.be.a('string')
      expect(review.liked).to.be.a('boolean')
      expect(review.likedBy).to.be.an('array')
      expect(review.likedBy.length).to.equal(2)
    })
    
    it('should allow empty likedBy array for reviews with no likes', () => {
      const review: types.Review = {
        text: 'Average product',
        author: 'Jane Smith',
        liked: false,
        likedBy: []
      }
      
      expect(review.text).to.be.a('string')
      expect(review.author).to.be.a('string')
      expect(review.liked).to.be.a('boolean')
      expect(review.likedBy).to.be.an('array')
      expect(review.likedBy.length).to.equal(0)
    })
  })
  
  describe('Type exports', () => {
    it('should export the Review interface', () => {
      const review: types.Review = {
        text: 'Test review',
        author: 'Test author',
        liked: false,
        likedBy: []
      }
      
      expect(review).to.be.an('object')
      expect(review.text).to.equal('Test review')
      expect(review.author).to.equal('Test author')
      expect(review.liked).to.be.false
      expect(review.likedBy).to.be.an('array').that.is.empty
    })
  })
})
