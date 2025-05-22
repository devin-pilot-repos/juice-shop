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
import { FaucetComponent } from './faucet.component'
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

describe('FaucetComponent', () => {
  let component: FaucetComponent
  let fixture: ComponentFixture<FaucetComponent>
  let keysService
  let snackBarHelperService
  let changeDetectorRef
  let translateService

  beforeEach(async () => {
    keysService = jasmine.createSpyObj('KeysService', ['nftMintListen', 'checkNftMinted', 'verifyNFTWallet'])
    snackBarHelperService = jasmine.createSpyObj('SnackBarHelperService', ['open'])
    changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
    translateService = jasmine.createSpyObj('TranslateService', ['get'])

    keysService.nftMintListen.and.returnValue(of({}))
    keysService.checkNftMinted.and.returnValue(of({ data: [{ solved: false }] }))
    keysService.verifyNFTWallet.and.returnValue(of({ success: true, status: true }))
    translateService.get.and.returnValue(of('NFT_MINT_TEXT_INTRO'))

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
        NgIf,
        FaucetComponent
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

    fixture = TestBed.createComponent(FaucetComponent)
    component = fixture.componentInstance
    
    spyOn(component, 'handleAuth').and.returnValue(Promise.resolve())
    spyOn(component, 'fetchBeeBalance').and.returnValue(Promise.resolve())
    spyOn(component, 'fetchMyBeeBalance').and.returnValue(Promise.resolve())
    
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.session).toBeFalse()
    expect(component.BEEBalance).toBe(0)
    expect(component.myBEEBalance).toBe(0)
    expect(component.withdrawAmount).toBeNull()
    expect(component.successResponse).toBeFalse()
    expect(component.mintButtonDisabled).toBeTrue()
    expect(component.challengeSolved).toBeFalse()
    expect(component.errorMessage).toBe('')
    expect(component.metamaskAddress).toBe('')
  })

  it('should call handleAuth, checkNftMinted, and nftMintListener on initialization', () => {
    spyOn(component, 'checkNftMinted')
    spyOn(component, 'nftMintListener')
    
    component.ngOnInit()
    
    expect(component.handleAuth).toHaveBeenCalled()
    expect(component.checkNftMinted).toHaveBeenCalled()
    expect(component.nftMintListener).toHaveBeenCalled()
  })

  it('should set up ethereum chain change listener on initialization', () => {
    component.ngOnInit()
    expect(window.ethereum.on).toHaveBeenCalledWith('chainChanged', jasmine.any(Function))
  })

  it('should call handleAuth when chain is changed', () => {
    component.handleChainChanged('0x1')
    expect(component.handleAuth).toHaveBeenCalled()
  })

  it('should call nftMintListen from KeysService', () => {
    component.nftMintListener()
    expect(keysService.nftMintListen).toHaveBeenCalled()
  })

  it('should call checkNftMinted from KeysService', () => {
    component.checkNftMinted()
    expect(keysService.checkNftMinted).toHaveBeenCalled()
  })

  it('should update mintButtonDisabled and challengeSolved when checkNftMinted returns solved status', () => {
    keysService.checkNftMinted.and.returnValue(of({ data: [{ solved: true }] }))
    
    component.checkNftMinted()
    
    expect(component.mintButtonDisabled).toBeTrue()
    expect(component.challengeSolved).toBeTrue()
    expect(translateService.get).toHaveBeenCalledWith('NFT_MINT_TEXT_SUCCESS')
  })

  it('should show error message when ethereum is not available', () => {
    const originalEthereum = window.ethereum
    window.ethereum = undefined
    
    component.handleAuth = jasmine.createSpy('handleAuth').and.callThrough()
    
    component.handleAuth()
    
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_INSTALL_WEB3_WALLET', 'errorBar')
    
    window.ethereum = originalEthereum
  })

  it('should show error message when trying to extract BEE tokens without connecting wallet', () => {
    component.session = false
    component.extractBEETokens()
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
  })

  it('should show error message when trying to mint NFT without connecting wallet', () => {
    component.session = false
    component.mintNFT()
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
  })

  it('should set session to false when signing out', async () => {
    component.session = true
    await component.signOut()
    expect(component.session).toBeFalse()
  })
})
