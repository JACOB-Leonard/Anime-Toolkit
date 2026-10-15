import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AnimeCharacter {
  character: {
    mal_id: number;
    url: string;
    name: string;
    images: {
      webp: {
        image_url: string;
      };
    };
  };
  role: string;
  favorites: number;
  voice_actors: {
    person: {
      mal_id: number;
      url: string;
      name: string;
      images: {
        jpg: {
          image_url: string;
        };
      };
    };
    language: string;
  }[];
}

export interface AniListCharacter {
  id: number;
  name: {
    full: string;
    native: string | null;
  };
  image?: {
    large: string | null;
    medium: string | null;
  };
  favourites: number;
}

export interface AniListVoiceActor {
  id: number;
  name: {
    full: string;
    native: string | null;
  };
  languageV2: string | null;
  image?: {
    large: string | null;
    medium: string | null;
  };
}

export interface AniListCharacterEdge {
  node: AniListCharacter;
  role: string;
  voiceActors: AniListVoiceActor[];
}

export interface AniListAnimeCharacters {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  characters: {
    edges: AniListCharacterEdge[];
    pageInfo: {
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
  };
}

interface AniListResponse<T> {
  data: T;
}

@Injectable({providedIn: 'root'})
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly anilistAPI = environment.anilistApiUrl;

  getByAnime(animeId: number): Observable<AnimeCharacter[]> {
    return this.http.get<{ data: AnimeCharacter[] }>(
      `${this.baseUrl}/anime/${animeId}/characters`
    ).pipe(map(response => response.data));
  }

  getByAnimeFromAniList(malId: number, page: number, perPage: number): Observable<AniListAnimeCharacters> {
    const query = `
      query ($malId: Int!, $page: Int!, $perPage: Int!) {
        Media(idMal: $malId, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          characters(page: $page, perPage: $perPage, sort: FAVOURITES_DESC) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
                favourites
              }
              voiceActors {
                id
                name {
                  full
                  native
                }
                languageV2
                image {
                  large
                  medium
                }
              }
            }
            pageInfo {
              currentPage
              lastPage
              hasNextPage
            }
          }
        }
      }
    `;

    return this.http.post<AniListResponse<{ Media: AniListAnimeCharacters }>>(
      this.anilistAPI,
      {
        query,
        variables: { malId, page, perPage }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    ).pipe(
      map(response => response.data.Media)
    );
  }
}