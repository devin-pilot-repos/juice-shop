/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { UserService } from '../Services/user.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatDividerModule } from '@angular/material/divider'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { DomSanitizer } from '@angular/platform-browser'

import { FeedbackDetailsComponent } from './feedback-details.component'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('FeedbackDetailsComponent', () => {
  let component: FeedbackDetailsComponent
  let fixture: ComponentFixture<FeedbackDetailsComponent>
  let sanitizer: DomSanitizer

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        MatDividerModule,
        MatDialogModule,
        FeedbackDetailsComponent],
      providers: [
        UserService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { feedback: 'Test feedback', id: 1 } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackDetailsComponent)
    component = fixture.componentInstance
    sanitizer = TestBed.inject(DomSanitizer)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should sanitize HTML to prevent XSS', () => {
    const maliciousHtml = '<script>alert("XSS")</script>Harmless text'
    const sanitizedHtml = component.sanitizeHtml(maliciousHtml)
    
    expect(sanitizedHtml.toString()).not.toContain('<script>')
    
    expect(sanitizedHtml.toString()).toContain('Harmless text')
  })

  it('should handle null or undefined input', () => {
    expect(component.sanitizeHtml(null as any)).toBeFalsy()
    expect(component.sanitizeHtml(undefined as any)).toBeFalsy()
  })

  it('should properly initialize from dialog data', () => {
    expect(component.feedback).toBe('Test feedback')
    expect(component.id).toBe(1)
  })
})
