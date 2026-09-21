import { Anime } from './anime.model';

export interface AnimeResponse {
  data: Anime[];
  pagination: {
    current_page: number;
    last_visible_page: number;
    has_next_page: boolean;
  };
}