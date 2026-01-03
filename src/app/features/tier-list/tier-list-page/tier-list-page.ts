import { Component } from '@angular/core';
import { AnimeService } from '../../../core/services/anime';
import { TierListService } from '../../../core/services/tier-list';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../search-bar/search-bar';
import { TierBoard } from '../tier-board/tier-board';
import { Anime } from '../../../core/models/anime.model';
import { AnimeSeasonResponse } from '../../../core/models/anime-season-response.model';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-tier-list-page',
  standalone: true,
  imports: [CommonModule, SearchBar, TierBoard],
  templateUrl: './tier-list-page.html',
  styleUrls: ['./tier-list-page.scss'],
})
export class TierListPage {
  animes: any[] = [];
  animeIds = new Set<number>();

  currentPage = 0;
  totalPages = 0;
  
  noResults = false;
  loading = false;

  constructor(
    private animeService: AnimeService,
    public tierListService: TierListService,
    public theme: ThemeService
  ) {}

  onSearch(season: string, year: number, filters: string[]) {

    this.animes = [];
    this.animeIds.clear();
    this.currentPage = 0;
    this.totalPages = 0;
    this.noResults = false;
    this.loading = true;

    this.loadPage(season, year, 1, filters);
  }

  loadPage(season: string, year: number, page: number, filters: string[]) {

    const isSingleFilter = filters.length === 1;

    const request$ = isSingleFilter
      ? this.animeService.getSeasonByType(season, year, filters[0], page)
      : this.animeService.getSeasonAll(season, year, page);

    request$.subscribe((res: AnimeSeasonResponse) => {
      console.log(`Page ${page} - Total reçus: ${res.data.length}`, res.data);

      let filtered: Anime[] = !isSingleFilter && filters.length > 0
        ? res.data.filter(anime =>
            filters.includes(anime.type)
          )
        : res.data;

      const unique: Anime[] = [];

      for (const anime of filtered) {
        if (!this.animeIds.has(anime.mal_id)) {
          this.animeIds.add(anime.mal_id);
          unique.push(anime);
        }
      }

      console.log(
        `Page ${page} - Après filtrage + déduplication: ${unique.length}`,
        unique
      );

      this.animes.push(...unique);

      this.currentPage = res.pagination.current_page;
      this.totalPages = res.pagination.last_visible_page;

      if (!res.pagination.has_next_page) {
        this.loading = false;
        this.noResults = this.animes.length === 0;
      }

      if (res.pagination.has_next_page) {
        setTimeout(() => {
          this.loadPage(season, year, page + 1, filters);
        }, 1000);
      }
    });
  }


}
