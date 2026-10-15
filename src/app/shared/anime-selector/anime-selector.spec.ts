import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimeSelector } from './anime-selector';

describe('AnimeSelector', () => {
  let component: AnimeSelector;
  let fixture: ComponentFixture<AnimeSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimeSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimeSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
