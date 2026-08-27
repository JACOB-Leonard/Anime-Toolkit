import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffComparatorPage } from './staff-comparator-page';

describe('StaffComparatorPage', () => {
  let component: StaffComparatorPage;
  let fixture: ComponentFixture<StaffComparatorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffComparatorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffComparatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
