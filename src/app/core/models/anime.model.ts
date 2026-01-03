export interface Anime {
  mal_id: number;
  url: string;
  images: Record<string, any>;
  trailer?: Record<string, any>;
  approved: boolean;

  titles: { type: string; title: string }[];
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms: string[];

  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;

  aired?: Record<string, any>;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background?: string;

  season: string;
  year: number;

  broadcast?: Record<string, any>;
  producers: { mal_id: number; type: string; name: string; url: string }[];
  licensors: { mal_id: number; type: string; name: string; url: string }[];
  studios: { mal_id: number; type: string; name: string; url: string }[];
  genres: { mal_id: number; type: string; name: string; url: string }[];
  explicit_genres: { mal_id: number; type: string; name: string; url: string }[];
  themes: { mal_id: number; type: string; name: string; url: string }[];
  demographics: { mal_id: number; type: string; name: string; url: string }[];
}
