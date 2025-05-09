/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import isWindows from '../../lib/is-windows'

const expect = chai.expect
chai.use(sinonChai)

describe('isWindows', () => {
  let originalPlatform: string
  
  beforeEach(() => {
    originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true
    })
  })
  
  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: false
    })
  })
  
  it('should return true when platform is win32', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      writable: true
    })
    
    const result = isWindows()
    
    expect(result).to.be.true
  })
  
  it('should return false when platform is linux', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      writable: true
    })
    
    const result = isWindows()
    
    expect(result).to.be.false
  })
  
  it('should return false when platform is darwin', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      writable: true
    })
    
    const result = isWindows()
    
    expect(result).to.be.false
  })
  
  it('should return false when platform is freebsd', () => {
    Object.defineProperty(process, 'platform', {
      value: 'freebsd',
      writable: true
    })
    
    const result = isWindows()
    
    expect(result).to.be.false
  })
})
