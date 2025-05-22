/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { KeysService } from '../Services/keys.service'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync, tick } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { EventEmitter, ChangeDetectorRef } from '@angular/core'
import { WalletWeb3Component } from './wallet-web3.component'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { MatIconModule } from '@angular/material/icon'
import { NgIf } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'

describe('WalletWeb3Component', () => {
  let component: WalletWeb3Component
  let fixture: ComponentFixture<WalletWeb3Component>
  let keysService: any
  let snackBarHelperService: any
  let changeDetectorRef: any
  let translateService: any

  beforeEach(waitForAsync(() => {
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()
    
    keysService = jasmine.createSpyObj('KeysService', ['walletAddressSend'])
    keysService.walletAddressSend.and.returnValue(of({ success: true, status: true }))
    
    snackBarHelperService = jasmine.createSpyObj('SnackBarHelperService', ['open'])
    
    changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])

    window.ethereum = {
      on: jasmine.createSpy('on'),
      request: jasmine.createSpy('request').and.returnValue(Promise.resolve())
    }

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        NgIf,
        WalletWeb3Component
      ],
      providers: [
        { provide: KeysService, useValue: keysService },
        { provide: SnackBarHelperService, useValue: snackBarHelperService },
        { provide: ChangeDetectorRef, useValue: changeDetectorRef },
        { provide: TranslateService, useValue: translateService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletWeb3Component)
    component = fixture.componentInstance
    
    spyOn(component, 'handleAuth').and.callFake(() => Promise.resolve())
    
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.session).toBe(false)
    expect(component.walletBalance).toBe('0')
    expect(component.myBEEBalance).toBe(0)
    expect(component.inputAmount).toBeNull()
    expect(component.successResponse).toBe(false)
    expect(component.mintButtonDisabled).toBe(true)
    expect(component.challengeSolved).toBe(false)
    expect(component.errorMessage).toBe('')
    expect(component.metamaskAddress).toBe('')
  })

  it('should call handleAuth on initialization', () => {
    component.ngOnInit()
    expect(component.handleAuth).toHaveBeenCalled()
  })

  it('should set up ethereum chain change listener on initialization', () => {
    component.ngOnInit()
    expect(window.ethereum.on).toHaveBeenCalledWith('chainChanged', jasmine.any(Function))
  })

  it('should call handleAuth when chain is changed', fakeAsync(() => {
    component.handleChainChanged('0x1')
    expect(component.handleAuth).toHaveBeenCalled()
  }))

  it('should handle errors during depositETH', fakeAsync(() => {
    const error = { message: 'Test error' }
    spyOn(component, 'getUserEthBalance').and.returnValue(Promise.resolve())
    
    const mockContract = {
      ethdeposit: jasmine.createSpy('ethdeposit').and.returnValue(Promise.reject(error))
    }
    
    spyOn(window, 'ethers').and.returnValue({
      providers: {
        Web3Provider: jasmine.createSpy('Web3Provider').and.returnValue({
          getSigner: jasmine.createSpy('getSigner').and.returnValue({})
        })
      },
      Contract: jasmine.createSpy('Contract').and.returnValue(mockContract),
      utils: {
        parseEther: jasmine.createSpy('parseEther').and.returnValue('1000000000000000000')
      }
    })
    
    component.inputAmount = 1
    component.depositETH()
    tick()
    
    expect(component.errorMessage).toBe('Test error')
  }))

  it('should handle errors during withdrawETH', fakeAsync(() => {
    const error = { message: 'Test error' }
    spyOn(component, 'getUserEthBalance').and.returnValue(Promise.resolve())
    
    const mockContract = {
      withdraw: jasmine.createSpy('withdraw').and.returnValue(Promise.reject(error))
    }
    
    spyOn(window, 'ethers').and.returnValue({
      providers: {
        Web3Provider: jasmine.createSpy('Web3Provider').and.returnValue({
          getSigner: jasmine.createSpy('getSigner').and.returnValue({})
        })
      },
      Contract: jasmine.createSpy('Contract').and.returnValue(mockContract),
      utils: {
        parseEther: jasmine.createSpy('parseEther').and.returnValue('1000000000000000000')
      }
    })
    
    component.inputAmount = 1
    component.withdrawETH()
    tick()
    
    expect(component.errorMessage).toBe('Test error')
  }))

  it('should handle errors during getUserEthBalance', fakeAsync(() => {
    const error = { message: 'Test error' }
    
    const mockContract = {
      balanceOf: jasmine.createSpy('balanceOf').and.returnValue(Promise.reject(error))
    }
    
    spyOn(window, 'ethers').and.returnValue({
      providers: {
        Web3Provider: jasmine.createSpy('Web3Provider').and.returnValue({
          getSigner: jasmine.createSpy('getSigner').and.returnValue({})
        })
      },
      Contract: jasmine.createSpy('Contract').and.returnValue(mockContract),
      utils: {
        formatEther: jasmine.createSpy('formatEther').and.returnValue('1.0')
      }
    })
    
    component.getUserEthBalance()
    tick()
    
    expect(component.errorMessage).toBe('Test error')
  }))

  it('should show error message when ethereum is not available', fakeAsync(() => {
    const originalEthereum = window.ethereum
    window.ethereum = undefined
    
    component.handleAuth = jasmine.createSpy('handleAuth').and.callThrough()
    
    spyOn(global, 'getAccount').and.returnValue({ isConnected: false })
    spyOn(global, 'disconnect').and.returnValue(Promise.resolve())
    
    component.handleAuth()
    tick()
    
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_INSTALL_WEB3_WALLET', 'errorBar')
    
    window.ethereum = originalEthereum
  }))

  it('should handle successful wallet connection', fakeAsync(() => {
    component.handleAuth = jasmine.createSpy('handleAuth').and.callThrough()
    
    spyOn(global, 'getAccount').and.returnValue({ isConnected: false })
    spyOn(global, 'disconnect').and.returnValue(Promise.resolve())
    spyOn(global, 'connect').and.returnValue(Promise.resolve({
      account: '0x123',
      chain: { id: '11155111' }
    }))
    
    spyOn(component, 'getUserEthBalance').and.returnValue(Promise.resolve())
    
    component.handleAuth()
    tick()
    
    expect(component.metamaskAddress).toBe('0x123')
    expect(component.session).toBe(true)
    expect(component.getUserEthBalance).toHaveBeenCalled()
    expect(changeDetectorRef.detectChanges).toHaveBeenCalled()
  }))

  it('should show error when connected to wrong network', fakeAsync(() => {
    component.handleAuth = jasmine.createSpy('handleAuth').and.callThrough()
    
    spyOn(global, 'getAccount').and.returnValue({ isConnected: false })
    spyOn(global, 'disconnect').and.returnValue(Promise.resolve())
    spyOn(global, 'connect').and.returnValue(Promise.resolve({
      account: '0x123',
      chain: { id: '1' } // Ethereum mainnet instead of Sepolia
    }))
    
    component.handleAuth()
    tick()
    
    expect(component.session).toBe(false)
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_TO_SEPOLIA_NETWORK', 'errorBar')
  }))
})
