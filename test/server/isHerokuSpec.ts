/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import isHeroku from '../../lib/is-heroku'

const expect = chai.expect
chai.use(sinonChai)

describe('isHeroku', () => {
  let originalEnv: NodeJS.ProcessEnv
  
  beforeEach(() => {
    originalEnv = process.env
    process.env = { ...originalEnv }
  })
  
  afterEach(() => {
    process.env = originalEnv
  })
  
  it('should return true when NODE_ENV is set to "heroku"', () => {
    process.env.HEROKU = 'true'
    
    const result = isHeroku()
    
    expect(result).to.be.true
    
    delete process.env.HEROKU
  })
  
  it('should return false when NODE_ENV is not set to "heroku"', () => {
    process.env.NODE_ENV = 'production'
    
    const result = isHeroku()
    
    expect(result).to.be.false
  })
  
  it('should return false when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV
    
    const result = isHeroku()
    
    expect(result).to.be.false
  })
  
  it('should return true when DYNO environment variable is set', () => {
    process.env.DYNO = 'web.1'
    process.env.HOME = '/app'
    
    const result = isHeroku()
    
    expect(result).to.be.true
    
    delete process.env.DYNO
    delete process.env.HOME
  })
  
  it('should return false when neither NODE_ENV is "heroku" nor DYNO is set', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.DYNO
    
    const result = isHeroku()
    
    expect(result).to.be.false
  })
})
