/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MatCardModule } from '@angular/material/card'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { MatFormFieldModule } from '@angular/material/form-field'
import { throwError } from 'rxjs/internal/observable/throwError'
import { NFTUnlockComponent } from './nft-unlock.component'
import { KeysService } from '../Services/keys.service'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { FlexModule } from '@angular/flex-layout/flex'
import { EventEmitter } from '@angular/core'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('NFTUnlockComponent', () => {
  let component: NFTUnlockComponent
  let fixture: ComponentFixture<NFTUnlockComponent>
  let keysService: any
  let translateService: any

  beforeEach(waitForAsync(() => {
    keysService = jasmine.createSpyObj('KeysService', ['nftUnlocked', 'submitKey'])
    keysService.nftUnlocked.and.returnValue(of({ status: false }))
    keysService.submitKey.and.returnValue(of({ success: true, message: 'Success' }))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatDividerModule,
        MatCardModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        FlexModule,
        NFTUnlockComponent
      ],
      providers: [
        { provide: KeysService, useValue: keysService },
        { provide: TranslateService, useValue: translateService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NFTUnlockComponent)
    component = fixture.componentInstance
    component.ngOnInit()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should check challenge status on init', () => {
    expect(keysService.nftUnlocked).toHaveBeenCalled()
    expect(component.successResponse).toBe(false)
  })

  it('should set successResponse to true when nftUnlocked returns true status', () => {
    keysService.nftUnlocked.and.returnValue(of({ status: true }))
    component.checkChallengeStatus()
    expect(component.successResponse).toBe(true)
  })

  it('should handle error in nftUnlocked', fakeAsync(() => {
    keysService.nftUnlocked.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.checkChallengeStatus()
    expect(console.log).toHaveBeenCalled()
    expect(component.successResponse).toBe(false)
  }))

  it('should submit form with private key', () => {
    component.privateKey = 'test-key'
    component.submitForm()
    expect(keysService.submitKey).toHaveBeenCalledWith('test-key')
    expect(component.formSubmitted).toBe(true)
    expect(component.successResponse).toBe(true)
    expect(component.errorMessage).toBe('Success')
  })

  it('should handle unsuccessful key submission', () => {
    keysService.submitKey.and.returnValue(of({ success: false }))
    component.privateKey = 'wrong-key'
    component.submitForm()
    expect(keysService.submitKey).toHaveBeenCalledWith('wrong-key')
    expect(component.formSubmitted).toBe(true)
    expect(component.successResponse).toBe(false)
  })

  it('should handle error in submitKey', fakeAsync(() => {
    keysService.submitKey.and.returnValue(throwError({ error: { message: 'Error message' } }))
    component.privateKey = 'test-key'
    component.submitForm()
    expect(component.successResponse).toBe(false)
    expect(component.errorMessage).toBe('Error message')
  }))
})
