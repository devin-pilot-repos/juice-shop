/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { DifficultyStarsComponent } from './difficulty-stars.component'
import { MatIconModule } from '@angular/material/icon'

describe('DifficultyStarsComponent', () => {
  let component: DifficultyStarsComponent
  let fixture: ComponentFixture<DifficultyStarsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        DifficultyStarsComponent
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DifficultyStarsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display correct number of stars based on difficulty', () => {
    component.difficulty = 3
    fixture.detectChanges()
    
    const stars = fixture.nativeElement.querySelectorAll('mat-icon')
    expect(stars.length).toBe(3)
  })

  it('should display one star when difficulty is 1', () => {
    component.difficulty = 1
    fixture.detectChanges()
    
    const stars = fixture.nativeElement.querySelectorAll('mat-icon')
    expect(stars.length).toBe(1)
  })

  it('should display maximum of 6 stars for highest difficulty', () => {
    component.difficulty = 6
    fixture.detectChanges()
    
    const stars = fixture.nativeElement.querySelectorAll('mat-icon')
    expect(stars.length).toBe(6)
  })
})
