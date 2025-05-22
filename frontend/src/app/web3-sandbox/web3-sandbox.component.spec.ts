/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { KeysService } from '../Services/keys.service'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { Web3SandboxComponent } from './web3-sandbox.component'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { of } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { MatIconModule } from '@angular/material/icon'
import { NgIf } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { ChangeDetectorRef } from '@angular/core'
import { MatSelectModule } from '@angular/material/select'
import { MatTabsModule } from '@angular/material/tabs'
import { CodemirrorModule } from '@ctrl/ngx-codemirror'

describe('Web3SandboxComponent', () => {
  let component: Web3SandboxComponent
  let fixture: ComponentFixture<Web3SandboxComponent>
  let keysService
  let snackBarHelperService
  let changeDetectorRef
  let translateService

  beforeEach(async () => {
    keysService = jasmine.createSpyObj('KeysService', ['verifySolidity', 'verifyContract'])
    snackBarHelperService = jasmine.createSpyObj('SnackBarHelperService', ['open'])
    changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
    translateService = jasmine.createSpyObj('TranslateService', ['get'])

    keysService.verifySolidity.and.returnValue(of({ success: true }))
    keysService.verifyContract.and.returnValue(of({ success: true }))
    translateService.get.and.returnValue(of(''))

    window.ethereum = {
      on: jasmine.createSpy('on'),
      request: jasmine.createSpy('request').and.returnValue(Promise.resolve()),
      isMetaMask: true,
      _events: {}
    }
    
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatTabsModule,
        CodemirrorModule,
        NgIf,
        Web3SandboxComponent
      ],
      providers: [
        { provide: KeysService, useValue: keysService },
        { provide: SnackBarHelperService, useValue: snackBarHelperService },
        { provide: ChangeDetectorRef, useValue: changeDetectorRef },
        { provide: TranslateService, useValue: translateService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(Web3SandboxComponent)
    component = fixture.componentInstance
    
    spyOn(component, 'handleAuth').and.returnValue(Promise.resolve())
    
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.session).toBeFalse()
    expect(component.session).toBeFalse()
    expect(component.selectedContractName).toBe(undefined)
    expect(component.deployedContractAddress).toBe('')
    expect(component.metamaskAddress).toBe('')
    expect(component.code).toContain('pragma solidity')
    expect(component.contractNames.length).toBe(0)
  })

  it('should call handleAuth on initialization', () => {
    component.ngOnInit()
    expect(component.handleAuth).toHaveBeenCalled()
  })

  it('should set up ethereum chain change listener on initialization', () => {
    component.ngOnInit()
    expect(window.ethereum.on).toHaveBeenCalledWith('chainChanged', jasmine.any(Function))
  })

  it('should call handleAuth when chain is changed', () => {
    component.handleChainChanged('0x1')
    expect(component.handleAuth).toHaveBeenCalled()
  })

  it('should show error message when ethereum is not available', () => {
    const originalEthereum = window.ethereum
    window.ethereum = undefined
    
    component.handleAuth = jasmine.createSpy('handleAuth').and.callThrough()
    
    component.handleAuth()
    
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_INSTALL_WEB3_WALLET', 'errorBar')
    
    window.ethereum = originalEthereum
  })

  it('should call verifySolidity when compiling contracts', () => {
    component.code = 'pragma solidity ^0.8.0; contract Test {}'
    component.compileAndFetchContracts('Test.sol')
    expect(keysService.verifySolidity).toHaveBeenCalledWith(component.code)
  })

  it('should update contracts array when compilation is successful', () => {
    component.code = 'pragma solidity ^0.8.0; contract Test {}'
    keysService.verifySolidity.and.returnValue(of({
      success: true,
      data: {
        contracts: {
          'Test.sol': {
            Test: {
              abi: [],
              evm: { bytecode: { object: '0x123' } }
            }
          }
        }
      }
    }))
    
    component.compileAndFetchContracts('Test.sol')
    
    expect(component.contractNames.length).toBeGreaterThan(0)
    expect(component.selectedContractName).toBe('Test')
  })

  it('should show error message when compilation fails', () => {
    component.code = 'invalid solidity code'
    keysService.verifySolidity.and.returnValue(of({
      success: false,
      error: 'Compilation error'
    }))
    
    component.compileAndFetchContracts('Test.sol')
    
    expect(snackBarHelperService.open).toHaveBeenCalled()
  })

  it('should show error message when trying to deploy without connecting wallet', () => {
    component.session = false
    component.deploySelectedContract()
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
  })

  it('should show error message when trying to deploy without selecting a contract', () => {
    component.session = true
    component.selectedContractName = ''
    component.deploySelectedContract()
    expect(snackBarHelperService.open).toHaveBeenCalled()
  })

  it('should call verifyContract when a contract is deployed', () => {
    component.session = true
    component.selectedContractName = 'Test'
    component.metamaskAddress = '0x123'
    component.deployedContractAddress = '0x456'
    
    spyOn(component, 'deploySelectedContract').and.callFake(() => {
      component.deployedContractAddress = '0x456';
      return Promise.resolve();
    }))
    
    component.deploySelectedContract()
    
    expect(keysService.verifyContract).toHaveBeenCalledWith(component.metamaskAddress, component.deployedContractAddress)
  })
})
