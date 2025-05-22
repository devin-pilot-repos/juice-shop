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
import { NFTUnlockComponent } from './nft-unlock.component'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { of, throwError } from 'rxjs'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { MatIconModule } from '@angular/material/icon'
import { NgIf } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { ChangeDetectorRef } from '@angular/core'

describe('NFTUnlockComponent', () => {
  let component: NFTUnlockComponent
  let fixture: ComponentFixture<NFTUnlockComponent>
  let keysService
  let snackBarHelperService
  let changeDetectorRef
  let translateService

  beforeEach(async () => {
    keysService = jasmine.createSpyObj('KeysService', ['nftUnlocked', 'submitKey'])
    snackBarHelperService = jasmine.createSpyObj('SnackBarHelperService', ['open'])
    changeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
    translateService = jasmine.createSpyObj('TranslateService', ['get'])

    keysService.nftUnlocked.and.returnValue(of({ status: false }))
    keysService.submitKey.and.returnValue(of({ success: true, message: 'Success' }))
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
        NgIf,
        NFTUnlockComponent
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

    fixture = TestBed.createComponent(NFTUnlockComponent)
    component = fixture.componentInstance
    
    
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.privateKey).toBeUndefined()
    expect(component.formSubmitted).toBeFalse()
    expect(component.successResponse).toBeFalse()
    expect(component.errorMessage).toBe('')
  })

  it('should call checkChallengeStatus on initialization', () => {
    spyOn(component, 'checkChallengeStatus')
    component.ngOnInit()
    expect(component.checkChallengeStatus).toHaveBeenCalled()
  })

  it('should call nftUnlocked service method when checking challenge status', () => {
    component.checkChallengeStatus()
    expect(keysService.nftUnlocked).toHaveBeenCalled()
  })

  it('should update successResponse when challenge status check is successful', () => {
    keysService.nftUnlocked.and.returnValue(of({ status: true }))
    component.checkChallengeStatus()
    expect(component.successResponse).toBeTrue()
  })

  it('should handle error when nftUnlocked service call fails', () => {
    keysService.nftUnlocked.and.returnValue(throwError({ error: 'Test error' }))
    component.checkChallengeStatus()
    expect(component.successResponse).toBeFalse()
  })

  it('should set formSubmitted to true when submitting form', () => {
    component.submitForm()
    expect(component.formSubmitted).toBeTrue()
  })

  it('should call submitKey service method when submitting form', () => {
    component.privateKey = 'test-key'
    component.submitForm()
    expect(keysService.submitKey).toHaveBeenCalledWith('test-key')
  })

  it('should update successResponse when form submission is successful', () => {
    component.privateKey = 'test-key'
    keysService.submitKey.and.returnValue(of({ success: true, message: 'Success' }))
    
    component.submitForm()
    
    expect(component.successResponse).toBeTrue()
    expect(component.errorMessage).toBe('Success')
  })

  it('should handle error when form submission fails', () => {
    component.privateKey = 'invalid-key'
    keysService.submitKey.and.returnValue(throwError({ error: { message: 'Invalid key' } }))
    
    component.submitForm()
    
    expect(component.successResponse).toBeFalse()
    expect(component.errorMessage).toBe('Invalid key')
  })
})
