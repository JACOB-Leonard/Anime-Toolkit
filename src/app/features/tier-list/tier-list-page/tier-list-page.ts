import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AnimeService } from '../../../core/services/anime';
import { SearchBar } from '../search-bar/search-bar';
import { TierBoard } from '../tier-board/tier-board';
import { Anime } from '../../../core/models/anime.model';
import { AnimeResponse } from '../../../core/models/animeResponse.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tier-list-page',
  imports: [ SearchBar, TierBoard],
  templateUrl: './tier-list-page.html',
  styleUrls: ['./tier-list-page.scss'],
})
export class TierListPage implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly animeService = inject(AnimeService);

  animes: Anime[] = [];
  unassignedByType: Record<string, Anime[]> = {};
  collapsedTypes = new Set<string>();

  readonly animeIds = new Set<number>();

  readonly currentPage = signal(0);
  readonly totalPages = signal(0);

  readonly loading = signal(false);
  readonly noResults = signal(false);

  readonly typeOrder = ['TV', 'Movie', 'OVA', 'ONA', 'TV Special', 'Music'];
  private readonly validSeasons = ['winter', 'spring', 'summer', 'fall'];
  private readonly validTypes = ['TV', 'Movie', 'OVA', 'ONA', 'special', 'Music'];

  readonly selectedSeason = signal('');
  readonly selectedYear = signal(new Date().getFullYear());
  readonly selectedFilters = signal<string[]>([]);

  private readonly initialized = signal(false);

  ngOnInit(): void {
    const search = this.parseUrlSearch();

    if (!search) {
      this.router.navigate(['/tier-list'], {
        replaceUrl: true
      });
      return;
    }

    this.selectedSeason.set(search.season);
    this.selectedYear.set(search.year);
    this.selectedFilters.set(search.filters);
    this.initialized.set(true);

    this.resetState();
    this.loadPage(search.season, search.year, 1, search.filters);
  }

  private parseUrlSearch(): { season: string; year: number; filters: string[] } | null {
    const params = this.route.snapshot.queryParamMap;
    const allowedParams = new Set(['year', 'season', 'types']);

    for (const key of params.keys) {
      if (!allowedParams.has(key)) {
        return null;
      }
    }

    const yearParam = params.get('year');
    const seasonParam = params.get('season');
    const typesParam = params.get('types');

    if (!yearParam) return null;

    const year = Number(yearParam);

    if (!Number.isInteger(year) || year < 1917 || year > new Date().getFullYear()+1) {
      return null;
    }

    const season = seasonParam ?? '';

    if (season && !this.validSeasons.includes(season)) {
      return null;
    }

    const filters = typesParam
      ? typesParam.split(',').filter(Boolean)
      : [...this.validTypes];

    if (filters.length === 0 || filters.some(type => !this.validTypes.includes(type))) {
      return null;
    }

    return { season, year, filters };
  }

  readonly searchState = computed(() => ({
    season: this.selectedSeason(),
    year: this.selectedYear(),
    filters: this.selectedFilters()
  }));

  onSearch(season: string, year: number, filters: string[]): void {
    this.selectedSeason.set(season);
    this.selectedYear.set(year);
    this.selectedFilters.set(filters);

    this.resetState();
    this.loadPage(season, year, 1, filters);
  }

  private readonly syncUrlEffect = effect(() => {
    if (!this.initialized()) return;

    const season = this.selectedSeason();
    const year = this.selectedYear();
    const filters = this.selectedFilters();

    if (!year) return;

    const isAllTypes =
      filters.length === this.validTypes.length &&
      this.validTypes.every(type => filters.includes(type));

    this.router.navigate(['/tier-list'], {
      queryParams: {
        year,
        ...(season ? { season } : {}),
        ...(isAllTypes || filters.length === 0 ? {} : { types: filters.join(',') })
      },
      replaceUrl: true
    });
  });

  private resetState() {
    this.animes = [];
    this.unassignedByType = {};
    this.animeIds.clear();
    this.currentPage.set(0);
    this.totalPages.set(0);
    this.noResults.set(false);
    this.loading.set(true);
  }

  loadPage(season: string, year: number, page: number, filters: string[]) {
    this.getRequest(season, year, page, filters)
      .subscribe({
        next: (res: AnimeResponse) => {
          const unique = this.extractUniqueAnimes(res.data, filters);
          this.animes.push(...unique);
          this.addToGroups(unique);

          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_visible_page);

          if (res.pagination.has_next_page) {
            setTimeout(() => {
              this.loadPage(season, year, page + 1, filters);
            }, 250);
            return;
          }
          
          this.loading.set(false);
          this.noResults.set(this.animes.length === 0);
        },
        error: () => {
          this.loading.set(false);
          this.noResults.set(this.animes.length === 0);
        }
      });
  }

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

  private extractUniqueAnimes(data: Anime[], filters: string[]): Anime[] {
    return data.filter(anime => {

      if (filters.length > 1) {
        const matchesFilter = filters.some(filter =>
          filter === 'special'
            ? anime.type === 'TV Special' || anime.type === 'Special'
            : anime.type === filter
        );

        if (!matchesFilter) {
          return false;
        }
      }

      if (this.animeIds.has(anime.mal_id)) {
        return false;
      }

      this.animeIds.add(anime.mal_id);
      return true;
    });
  }

  private addToGroups(animes: Anime[]): void {
    for (const anime of animes) {
      let type = anime.type || 'Other';

      if (type === 'Special') {
        type = 'TV Special';
      }

      if (!this.unassignedByType[type]) {
        this.unassignedByType[type] = [];
      }

      this.unassignedByType[type].push(anime);
    }
  }
}
