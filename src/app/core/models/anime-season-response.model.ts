import { Anime } from './anime.model';

export interface AnimeSeasonResponse {
  data: Anime[];
  pagination: {
    current_page: number;
    last_visible_page: number;
    has_next_page: boolean;
  };
}