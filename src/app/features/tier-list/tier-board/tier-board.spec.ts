import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierBoard } from './tier-board';

describe('TierBoard', () => {
  let component: TierBoard;
  let fixture: ComponentFixture<TierBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
