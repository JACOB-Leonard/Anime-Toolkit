import { TestBed } from '@angular/core/testing';

import { TierListService } from './tier-list';

describe('TierList', () => {
  let service: TierListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TierListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
