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
      jpg: {
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

@Injectable({providedIn: 'root'})
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getByAnime(animeId: number): Observable<AnimeCharacter[]> {
    return this.http.get<{ data: AnimeCharacter[] }>(
      `${this.baseUrl}/anime/${animeId}/characters`
    ).pipe(map(response => response.data));
  }
}