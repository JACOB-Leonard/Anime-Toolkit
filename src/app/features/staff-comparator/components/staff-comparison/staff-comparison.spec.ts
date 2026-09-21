import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffComparison } from './staff-comparison';

describe('StaffComparison', () => {
  let component: StaffComparison;
  let fixture: ComponentFixture<StaffComparison>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffComparison]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffComparison);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
