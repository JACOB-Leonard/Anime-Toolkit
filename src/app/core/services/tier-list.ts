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

  /**
   * Déplace un anime d'une tier à une autre.
   * @param anime L'objet anime à déplacer
   * @param from Le niveau de départ ('S', 'A', 'B', 'C')
   * @param to Le niveau de destination ('S', 'A', 'B', 'C')
   */
  moveAnime(anime: any, from: TierLevel, to: TierLevel) {
    const index = this.tierList[from].indexOf(anime);
    if (index !== -1) {
      this.tierList[from].splice(index, 1);
      this.tierList[to].push(anime);
    }
  }

  /**
   * Retourne la structure complète de la tier list
   */
  getTierList(): Record<TierLevel, any[]> {
    return this.tierList;
  }

  /**
   * Réinitialise complètement la tier list
   */
  resetTierList() {
    this.tierList = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
    };
  }
}
