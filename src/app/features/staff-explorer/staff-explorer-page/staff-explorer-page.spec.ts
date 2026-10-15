import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffExplorerPage } from './staff-explorer-page';

describe('StaffExplorerPage', () => {
  let component: StaffExplorerPage;
  let fixture: ComponentFixture<StaffExplorerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffExplorerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffExplorerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
