import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnimePicturesService {
  private BASE_URL = environment.apiUrl;

  private http = inject(HttpClient);

  getPictures(animeId: number) {
    return this.http.get<{ data: { jpg: { large_image_url: string } }[] }>(
      `${this.BASE_URL}/anime/${animeId}/pictures`
    );
  }
}
