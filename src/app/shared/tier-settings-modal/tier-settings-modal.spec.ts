import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierSettingsModal } from './tier-settings-modal';

describe('TierSettingsModal', () => {
  let component: TierSettingsModal;
  let fixture: ComponentFixture<TierSettingsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierSettingsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierSettingsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
