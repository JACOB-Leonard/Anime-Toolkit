import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Anime } from '../models/anime.model';

interface AnimeSeasonResponse {
  data: Anime[];
  pagination: {
    current_page: number;
    last_visible_page: number;
    has_next_page: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private BASE_URL = 'https://api.jikan.moe/v4';

  constructor(private http: HttpClient) {}

  getSeasonAll(
    season: string,
    year: number,
    page = 1
  ): Observable<AnimeSeasonResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('sfw', 'true');

    return this.http.get<AnimeSeasonResponse>(`${this.BASE_URL}/seasons/${year}/${season.toLowerCase()}`, { params });
  }

  getSeasonByType(
    season: string,
    year: number,
    type: string,
    page = 1
  ): Observable<AnimeSeasonResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('sfw', 'true')
      .set('filter', type);

    return this.http.get<AnimeSeasonResponse>(
      `${this.BASE_URL}/seasons/${year}/${season}`,
      { params }
    );
  }

}
