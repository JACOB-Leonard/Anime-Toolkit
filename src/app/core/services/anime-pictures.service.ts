import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AnimePicturesService {
  private BASE_URL = 'https://api.jikan.moe/v4';

  constructor(private http: HttpClient) {}

  getPictures(animeId: number) {
    return this.http.get<{ data: { jpg: { image_url: string } }[] }>(
      `${this.BASE_URL}/anime/${animeId}/pictures`
    );
  }
}
