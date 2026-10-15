import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceActorExplorer } from './voice-actor-explorer';

describe('VoiceActorExplorer', () => {
  let component: VoiceActorExplorer;
  let fixture: ComponentFixture<VoiceActorExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceActorExplorer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoiceActorExplorer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
