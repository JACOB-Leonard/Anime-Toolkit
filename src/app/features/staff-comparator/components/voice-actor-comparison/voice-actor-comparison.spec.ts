import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceActorComparison } from './voice-actor-comparison';

describe('VoiceActorComparison', () => {
  let component: VoiceActorComparison;
  let fixture: ComponentFixture<VoiceActorComparison>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceActorComparison]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoiceActorComparison);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
