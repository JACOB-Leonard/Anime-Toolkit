import { Injectable } from '@angular/core';

export type TierLevel = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

@Injectable({ providedIn: 'root' })
export class TierListService {
  tierList: Record<TierLevel, any[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
  };

  getTierList(): Record<TierLevel, any[]> {
    return this.tierList;
  }

}
