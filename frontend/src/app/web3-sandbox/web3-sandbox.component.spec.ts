/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'
import { Web3SandboxComponent } from './web3-sandbox.component'
import { KeysService } from '../Services/keys.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { EventEmitter } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CodemirrorModule } from '@ctrl/ngx-codemirror'

describe('Web3SandboxComponent', () => {
  let component: Web3SandboxComponent
  let fixture: ComponentFixture<Web3SandboxComponent>
  let keysService: any
  let snackBarHelperService: any
  let translateService: any

  beforeEach(waitForAsync(() => {
    keysService = jasmine.createSpyObj('KeysService', [''])
    snackBarHelperService = jasmine.createSpyObj('SnackBarHelperService', ['open'])
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()

    (window as any).ethereum = {
      isMetaMask: true,
      _events: {},
      on: jasmine.createSpy('on'),
      request: jasmine.createSpy('request').and.returnValue(Promise.resolve())
    }

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        CodemirrorModule,
        Web3SandboxComponent
      ],
      providers: [
        { provide: KeysService, useValue: keysService },
        { provide: SnackBarHelperService, useValue: snackBarHelperService },
        { provide: TranslateService, useValue: translateService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Web3SandboxComponent)
    component = fixture.componentInstance
    
    spyOn(component, 'handleAuth').and.returnValue(Promise.resolve())
    
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default code and compiler version', () => {
    expect(component.code).toContain('pragma solidity')
    expect(component.selectedCompilerVersion).toBe('0.8.21')
  })

  it('should call handleAuth on initialization', () => {
    expect(component.handleAuth).toHaveBeenCalled()
  })

  it('should set up ethereum chain changed event listener', () => {
    expect((window as any).ethereum.on).toHaveBeenCalledWith('chainChanged', jasmine.any(Function))
  })

  it('should show error message when trying to deploy contract without web3 session', () => {
    component.session = false
    component.deploySelectedContract()
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
  })

  it('should show error message when trying to invoke function without web3 session', () => {
    component.session = false
    component.invokeFunction({ name: 'test' })
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
  })

  it('should parse input values correctly', () => {
    expect(component.parseInputValue('true', 'bool')).toBe(true)
    expect(component.parseInputValue('false', 'bool')).toBe(false)
    expect(component.parseInputValue('123', 'uint')).toBe('123')
  })

  it('should format input hints correctly', () => {
    const inputs = [
      { name: 'value', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ]
    expect(component.getInputHints(inputs)).toBe('value: uint256, recipient: address')
  })
})
