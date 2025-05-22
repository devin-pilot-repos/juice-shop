/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { WarningCardComponent } from './warning-card.component'

describe('WarningCardComponent', () => {
  let component: WarningCardComponent
  let fixture: ComponentFixture<WarningCardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WarningCardComponent]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
