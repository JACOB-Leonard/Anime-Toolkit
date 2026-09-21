import { Component, effect, inject, output, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';

import { AnimeService } from '../../../../core/services/anime';
import { Anime } from '../../../../core/models/anime.model';
import { AnimeCharacter, CharacterService } from '../../../../core/services/character.service';
import { AnimeStaff, StaffService } from '../../../../core/services/staff.service';

@Component({
  selector: 'app-anime-selector',
  imports: [],
  templateUrl: './anime-selector.html',
  styleUrl: './anime-selector.scss'
})
export class AnimeSelector {

  private readonly animeService = inject(AnimeService);
  private readonly characterService = inject(CharacterService);
  private readonly staffService = inject(StaffService);


  readonly searchQuery = signal('');
  readonly selectedAnime = signal<Anime | null>(null);

  readonly animeSelected = output<Anime>();
  readonly charactersList = output<AnimeCharacter[]>();
  readonly staffList = output<AnimeStaff[]>();

  selectAnime(anime: Anime): void {
    this.selectedAnime.set(anime);
    this.animeSelected.emit(anime);
    this.searchQuery.set('');
  }

  readonly debouncedQuery = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  readonly searchResource = rxResource({
    params: () => ({
      query: this.debouncedQuery().trim()
    }),

    stream: ({ params }) => {
      if (!params.query) {
        return of([]);
      }

      return this.animeService.searchAnime(params.query);
    }
  });

  readonly charactersResource = rxResource({
    params: () => ({
      animeId: this.selectedAnime()?.mal_id ?? null
    }),

    stream: ({ params }) => {
      if (!params.animeId) {
        return of([] as AnimeCharacter[]);
      }

      return this.characterService.getByAnime(params.animeId)
    }
  });

  readonly staffResource = rxResource({
    params: () => ({
      animeId: this.selectedAnime()?.mal_id ?? null
    }),

    stream: ({ params }) => {
      if (!params.animeId) {
        return of([] as AnimeStaff[]);
      }

      return this.staffService.getByAnime(params.animeId)
    }
  });
  
  constructor() {
    effect(() => {
      const characters = this.charactersResource.value();
      const staff = this.staffResource.value();

      if (characters) {
        this.charactersList.emit(characters);
      }
      if (staff) {
        this.staffList.emit(staff);
      }
    });
  }

}