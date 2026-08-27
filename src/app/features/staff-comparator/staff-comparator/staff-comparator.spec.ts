import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffComparator } from './staff-comparator';

describe('StaffComparator', () => {
  let component: StaffComparator;
  let fixture: ComponentFixture<StaffComparator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffComparator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffComparator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
