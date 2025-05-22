/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSearchBarComponent } from './mat-search-bar.component'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EventEmitter } from '@angular/core'
import { of } from 'rxjs'

describe('MatSearchBarComponent', () => {
  let component: MatSearchBarComponent
  let fixture: ComponentFixture<MatSearchBarComponent>
  let translateService: any

  beforeEach(waitForAsync(() => {
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()

    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatButtonModule,
        FormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        MatSearchBarComponent
      ],
      providers: [
        { provide: TranslateService, useValue: translateService }
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MatSearchBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit enter event when enter is triggered', () => {
    spyOn(component.onEnter, 'emit')
    component.value = 'test search'
    component.onEnterring('test search')
    expect(component.onEnter.emit).toHaveBeenCalledWith('test search')
  })

  it('should clear search value when close is triggered', () => {
    component.value = 'test search'
    component.close()
    expect(component.value).toBe('')
  })

  it('should emit focus event when input is focused', () => {
    spyOn(component.onFocus, 'emit')
    component.onFocussing('test search')
    expect(component.onFocus.emit).toHaveBeenCalledWith('test search')
  })

  it('should emit blur event when input is blurred', () => {
    spyOn(component.onBlur, 'emit')
    component.onBlurring('test search')
    expect(component.onBlur.emit).toHaveBeenCalledWith('test search')
  })
})
