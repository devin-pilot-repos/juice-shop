/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

const expect = chai.expect
chai.use(sinonChai)

describe('isDocker', () => {
  let isDocker: any
  let mockFs: any
  let isDockerCached: boolean | undefined
  
  beforeEach(() => {
    // Clear module cache to get a fresh instance for each test
    delete require.cache[require.resolve('../../lib/is-docker')]
    
    // Create mock fs module
    mockFs = {
      statSync: sinon.stub(),
      readFileSync: sinon.stub()
    }
    
    // Use proxyquire to inject our mocks
    const proxyquire = require('proxyquire').noCallThru()
    isDocker = proxyquire('../../lib/is-docker', {
      'node:fs': mockFs
    })
    
    // Reset isDockerCached for each test
    isDockerCached = undefined
    Object.defineProperty(isDocker, 'isDockerCached', { 
      get: () => isDockerCached,
      set: (val) => { isDockerCached = val },
      configurable: true
    })
  })
  
  it('should return true when /.dockerenv file exists', () => {
    mockFs.statSync.withArgs('/.dockerenv').returns({})
    
    const result = isDocker.default()
    
    expect(result).to.be.true
    expect(mockFs.statSync).to.have.been.calledWith('/.dockerenv')
    expect(mockFs.readFileSync).not.to.have.been.called
  })
  
  it('should return false when /.dockerenv file does not exist and cgroup does not contain docker', () => {
    mockFs.statSync.withArgs('/.dockerenv').throws(new Error('File not found'))
    mockFs.readFileSync.withArgs('/proc/self/cgroup', 'utf8').returns('0::/system.slice/some-service.service')
    
    const result = isDocker.default()
    
    expect(result).to.be.false
    expect(mockFs.statSync).to.have.been.calledWith('/.dockerenv')
    expect(mockFs.readFileSync).to.have.been.calledWith('/proc/self/cgroup', 'utf8')
  })
  
  it('should return true when cgroup contains docker', () => {
    mockFs.statSync.withArgs('/.dockerenv').throws(new Error('File not found'))
    mockFs.readFileSync.withArgs('/proc/self/cgroup', 'utf8').returns('0::/system.slice/docker-abcdef.scope')
    
    const result = isDocker.default()
    
    expect(result).to.be.true
    expect(mockFs.statSync).to.have.been.calledWith('/.dockerenv')
    expect(mockFs.readFileSync).to.have.been.calledWith('/proc/self/cgroup', 'utf8')
  })
  
  it('should return false when cgroup file does not exist', () => {
    mockFs.statSync.withArgs('/.dockerenv').throws(new Error('File not found'))
    mockFs.readFileSync.withArgs('/proc/self/cgroup', 'utf8').throws(new Error('File not found'))
    
    const result = isDocker.default()
    
    expect(result).to.be.false
    expect(mockFs.statSync).to.have.been.calledWith('/.dockerenv')
    expect(mockFs.readFileSync).to.have.been.calledWith('/proc/self/cgroup', 'utf8')
  })
  
  it('should handle errors when reading cgroup file', () => {
    mockFs.statSync.withArgs('/.dockerenv').throws(new Error('File not found'))
    mockFs.readFileSync.withArgs('/proc/self/cgroup', 'utf8').throws(new Error('File read error'))
    
    const result = isDocker.default()
    
    expect(result).to.be.false
    expect(mockFs.statSync).to.have.been.calledWith('/.dockerenv')
    expect(mockFs.readFileSync).to.have.been.calledWith('/proc/self/cgroup', 'utf8')
  })
  
  it('should use cached result on subsequent calls', () => {
    mockFs.statSync.withArgs('/.dockerenv').returns({})
    
    const result1 = isDocker.default()
    expect(result1).to.be.true
    expect(mockFs.statSync).to.have.been.calledOnce
    
    mockFs.statSync.reset()
    
    const result2 = isDocker.default()
    expect(result2).to.be.true
    expect(mockFs.statSync).not.to.have.been.called
  })
})
