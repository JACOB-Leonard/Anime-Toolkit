import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {from, Observable, timer, toArray, map, mergeMap} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Anime } from '../models/anime.model';
import { AnimeResponse } from '../models/animeResponse.model';

@Injectable({ providedIn: 'root' })
export class AnimeService {
  private BASE_URL = environment.apiUrl;
  private seasons = ['winter', 'spring', 'summer', 'fall']; 

  private http = inject(HttpClient);

  getSeason(
    season: string,
    year: number,
    page = 1
  ): Observable<AnimeResponse> {
    let params = new HttpParams()
      .set('page', page.toString())

    return this.http.get<AnimeResponse>(`${this.BASE_URL}/seasons/${year}/${season.toLowerCase()}`, { params })
    .pipe(
      map(response => ({
        ...response,
        data: response.data.filter(
          anime => !anime.rating?.startsWith('Rx')
        )
      }))
    );
  }

  getSeasonByType(
    season: string,
    year: number,
    type: string,
    page = 1
  ): Observable<AnimeResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('filter', type);

    return this.http.get<AnimeResponse>(
      `${this.BASE_URL}/seasons/${year}/${season}`,
      { params }
    )
    .pipe(
      map(response => ({
        ...response,
        data: response.data.filter(
          anime => !anime.rating?.startsWith('Rx')
        )
      }))
    );
  }

   getYear(year: number, page: number = 1): Observable<AnimeResponse> {

    return from(this.seasons).pipe(
      mergeMap((season, i) =>
        timer(i * 250).pipe(
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

  getYearByType(year: number, type: string, page: number = 1): Observable<AnimeResponse> {

    return from(this.seasons).pipe(
      mergeMap((season, i) =>
        timer(i * 250).pipe(
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

  searchAnime(
    query: string,
  ): Observable<Anime[]> {
    let params = new HttpParams()
      .set('q', query)

    return this.http.get<AnimeResponse>(
      `${this.BASE_URL}/anime`,
      { params }
    ).pipe(
      map(response => response.data.filter(
        anime => !anime.rating?.startsWith('Rx')
      ))
    );
  }

}
