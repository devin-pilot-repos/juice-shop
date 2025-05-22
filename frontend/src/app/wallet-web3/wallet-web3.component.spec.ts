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
import { WalletWeb3Component } from './wallet-web3.component'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { EventEmitter } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'

describe('WalletWeb3Component', () => {
  let component: WalletWeb3Component
  let fixture: ComponentFixture<WalletWeb3Component>
  let snackBarHelperService: any
  let translateService: any

  beforeEach(waitForAsync(() => {
    snackBarHelperService = jasmine.createSpyObj('SnackBarHelperService', ['open'])
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter<any>()
    translateService.onTranslationChange = new EventEmitter<any>()
    translateService.onDefaultLangChange = new EventEmitter<any>()

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
        MatCardModule,
        MatTableModule,
        WalletWeb3Component
      ],
      providers: [
        { provide: SnackBarHelperService, useValue: snackBarHelperService },
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
    
    spyOn(component, 'handleAuth').and.returnValue(Promise.resolve())
    
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call handleAuth on initialization', () => {
    expect(component.handleAuth).toHaveBeenCalled()
  })

  it('should set up ethereum chain changed event listener', () => {
    expect((window as any).ethereum.on).toHaveBeenCalledWith('chainChanged', jasmine.any(Function))
  })

  it('should show error message when trying to deposit ETH without web3 session', () => {
    component.session = false
    component.depositETH()
    expect(snackBarHelperService.open).toHaveBeenCalledWith('PLEASE_CONNECT_WEB3_WALLET', 'errorBar')
  })
})
