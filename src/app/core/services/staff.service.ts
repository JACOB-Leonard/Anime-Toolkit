import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AnimeStaff {
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
  positions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getByAnime(animeId: number): Observable<AnimeStaff[]> {
    return this.http.get<{data :AnimeStaff[]}>(
      `${this.baseUrl}/anime/${animeId}/staff`
    ).pipe(map(response => response.data));
  }
}