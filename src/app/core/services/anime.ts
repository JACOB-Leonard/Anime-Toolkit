import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {from, map, mergeMap, Observable, timer, toArray} from 'rxjs';
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
  private seasons = ['winter', 'spring', 'summer', 'fall']; 

  constructor(private http: HttpClient) {}

  getSeason(
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

   getYear(year: number, page: number = 1): Observable<AnimeSeasonResponse> {

    return from(this.seasons).pipe(
      mergeMap((season, i) =>
        timer(i * 1000).pipe(
          mergeMap(() => this.getSeason(season, year, page))
        )
      ),
      toArray(),
      map(responses => {
        const mergedData = responses.flatMap(r => r.data);
        const lastPage = Math.max(...responses.map(r => r.pagination.last_visible_page));
        const hasNext = responses.some(r => r.pagination.has_next_page);

        return {
          data: mergedData,
          pagination: {
            current_page: page,
            last_visible_page: lastPage,
            has_next_page: hasNext
          }
        };
      })
    );
  }

  getYearByType(year: number, type: string, page: number = 1): Observable<AnimeSeasonResponse> {

    return from(this.seasons).pipe(
      mergeMap((season, i) =>
        timer(i * 1000).pipe(
          mergeMap(() => this.getSeasonByType(season, year, type, page))
        )
      ),
      toArray(),
      map(responses => {
        const mergedData = responses.flatMap(r => r.data);
        const lastPage = Math.max(...responses.map(r => r.pagination.last_visible_page));
        const hasNext = responses.some(r => r.pagination.has_next_page);

        return {
          data: mergedData,
          pagination: {
            current_page: page,
            last_visible_page: lastPage,
            has_next_page: hasNext
          }
        };
      })
    );
  }

}
