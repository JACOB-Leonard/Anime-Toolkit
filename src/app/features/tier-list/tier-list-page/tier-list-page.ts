import { Component, inject, signal } from '@angular/core';
import { AnimeService } from '../../../core/services/anime';
import { ThemeService } from '../../../core/services/theme.service';
import { SearchBar } from '../search-bar/search-bar';
import { TierBoard } from '../tier-board/tier-board';
import { Anime } from '../../../core/models/anime.model';
import { AnimeSeasonResponse } from '../../../core/models/anime-season-response.model';

@Component({
  selector: 'app-tier-list-page',
  imports: [ SearchBar, TierBoard],
  templateUrl: './tier-list-page.html',
  styleUrls: ['./tier-list-page.scss'],
})
export class TierListPage {

  animes: Anime[] = [];
  unassignedByType: Record<string, Anime[]> = {};
  collapsedTypes = new Set<string>();

  readonly animeIds = new Set<number>();

  readonly currentPage = signal(0);
  readonly totalPages = signal(0);

  readonly loading = signal(false);
  readonly noResults = signal(false);

  readonly typeOrder = ['TV', 'Movie', 'OVA', 'ONA', 'TV Special', 'Music'];

  private readonly animeService = inject(AnimeService);
  readonly theme = inject(ThemeService);

  /* =======================
     SEARCH
     ======================= */

  onSearch(season: string, year: number, filters: string[]): void {
    this.resetState();
    this.loadPage(season, year, 1, filters);
  }

  private resetState() {
    this.animes = [];
    this.animeIds.clear();
    this.currentPage.set(0);
    this.totalPages.set(0);
    this.noResults.set(false);
    this.loading.set(true);
  }

  /* =======================
     PAGINATION
     ======================= */

  loadPage(season: string, year: number, page: number, filters: string[]) {
    this.getRequest(season, year, page, filters)
      .subscribe({
        next: (res: AnimeSeasonResponse) => {
          const unique = this.extractUniqueAnimes(res.data, filters);
          this.animes.push(...unique);
          this.regroupUnassigned();

          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_visible_page);

          if (!res.pagination.has_next_page) {
            this.loading.set(false);
            this.noResults.set(this.animes.length === 0);
            return;
          }

          setTimeout(() => {
            this.loadPage(season, year, page + 1, filters);
          }, 1000);
        },
        error: () => {
          this.loading.set(false);
          this.noResults.set(true);
        }
      });
  }

  /* =======================
     REQUEST SELECTION
     ======================= */

  private getRequest(
    season: string,
    year: number,
    page: number,
    filters: string[]
  ) {
    const isSingleFilter = filters.length === 1;
    const isFullYear = !season;

    if (isSingleFilter && isFullYear) {
      return this.animeService.getYearByType(year, filters[0], page);
    }

    if (isSingleFilter) {
      return this.animeService.getSeasonByType(season, year, filters[0], page);
    }

    if (isFullYear) {
      return this.animeService.getYear(year, page);
    }

    return this.animeService.getSeason(season, year, page);
  }

  /* =======================
     FILTER + DEDUP
     ======================= */

  private extractUniqueAnimes(data: Anime[], filters: string[]): Anime[] {
    return data.filter(anime => {

      if (filters.length > 1 && !filters.includes(anime.type)) {
        return false;
      }

      if (this.animeIds.has(anime.mal_id)) {
        return false;
      }

      this.animeIds.add(anime.mal_id);
      return true;
    });
  }

  private regroupUnassigned() {
    const temp: Record<string, Anime[]> = {};
    for (const anime of this.animes) {
      const type = anime.type || 'Other';
      if (!temp[type]) temp[type] = [];
      temp[type].push(anime);
    }

    this.unassignedByType = {};
    for (const type of this.typeOrder) {
      if (temp[type] && temp[type].length > 0) {
        this.unassignedByType[type] = temp[type];
      }
    }
  }

}
