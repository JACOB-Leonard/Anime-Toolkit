import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Anime } from '../../../../core/models/anime.model';
import {AniListCharacterEdge, AniListVoiceActor, CharacterService} from '../../../../core/services/character.service';
import {VoiceActorCharacter, VoiceActorRecentCharacter, VoiceActorService} from '../../../../core/services/voice-actor.service';
import { FormsModule } from '@angular/forms';

export interface CharacterVoiceActorPair {
  voiceActor: AniListVoiceActor;
  characters: {
    character: AniListCharacterEdge['node'];
    role: string;
  }[];
}

export interface VoiceActorExplorerState {
  characters: AniListCharacterEdge[];
  voiceActors: AniListVoiceActor[];
  characterVoiceActors: CharacterVoiceActorPair[];
  popularCharacters: VoiceActorCharacter[];
  recentCharacters: VoiceActorRecentCharacter[];
}

interface VoiceActorData {
  popular: VoiceActorCharacter[];
  recent: VoiceActorRecentCharacter[];
  loading: boolean;
}

@Component({
  selector: 'app-voice-actor-explorer',
  imports: [FormsModule],
  templateUrl: './voice-actor-explorer.html',
  styleUrl: './voice-actor-explorer.scss'
})
export class VoiceActorExplorer {
  readonly anime = input.required<Anime | null>();
  readonly languageOutput = output<string>();

  private readonly characterService = inject(CharacterService);
  private readonly voiceActorService = inject(VoiceActorService);

  readonly characters = signal<AniListCharacterEdge[]>([]);
  readonly voiceActors = signal<AniListVoiceActor[]>([]);
  readonly characterVoiceActors = signal<CharacterVoiceActorPair[]>([]);
  readonly selectedVoiceActor = signal<AniListVoiceActor | null>(null);

  readonly voiceActorData = signal(new Map<number, VoiceActorData>());

  readonly loadingCharacters = signal(false);

  readonly initialLanguage = input<string | null>(null);
  readonly selectedLanguage = signal('Japanese');

  readonly currentPage = signal(1);
  readonly hasNextPage = signal(false);
  readonly loadingMore = signal(false);
  readonly perPage = 50;

  readonly availableLanguages = computed(() => {
    const languages = new Set<string>();

    for (const edge of this.characters()) {
      for (const actor of edge.voiceActors) {
        if (actor.languageV2) {
          languages.add(actor.languageV2);
        }
      }
    }

    return [...languages].sort((a, b) => a.localeCompare(b));
  });

  readonly selectedVoiceActorId = computed(
    () => this.selectedVoiceActor()?.id ?? null
  );

  readonly filteredCharacterVoiceActors = computed(() =>
    this.characterVoiceActors()
      .map(group => ({
        ...group,
        characters: group.characters.filter(item =>
          this.characters().some(edge =>
            edge.node.id === item.character.id &&
            edge.voiceActors.some(
              actor =>
                actor.id === group.voiceActor.id &&
                actor.languageV2 === this.selectedLanguage()
            )
          )
        )
      }))
      .filter(group => group.characters.length > 0)
      .filter(group => group.voiceActor.languageV2 === this.selectedLanguage())
  );

  constructor() {
    effect(() => {
      const anime = this.anime();

      this.characters.set([]);
      this.voiceActors.set([]);
      this.characterVoiceActors.set([]);
      this.selectedVoiceActor.set(null);
      this.voiceActorData.set(new Map());

      if (!anime?.mal_id) {
        return;
      }

      this.loadAnimeCharacters(anime.mal_id);
    });
  }

  selectVoiceActor(actor: AniListVoiceActor): void {
    this.selectedVoiceActor.set(actor);

    const data = this.voiceActorData().get(actor.id);

    if (data) return;

    this.voiceActorData.update(current => {
      const next = new Map(current);

      next.set(actor.id, {
        popular: [],
        recent: [],
        loading: true
      });

      return next;
    });

    this.loadVoiceActorData(actor.id);
  }

  private loadAnimeCharacters(malId: number): void {
    this.loadingCharacters.set(true);
    this.currentPage.set(1);
    this.hasNextPage.set(false);

    this.characterService.getByAnimeFromAniList(malId, 1, this.perPage).subscribe({
      next: result => {
        const edges = result.characters.edges;

        this.characters.set(edges);
        this.mergeVoiceActors(edges, true);

        this.currentPage.set(result.characters.pageInfo.currentPage);
        this.hasNextPage.set(result.characters.pageInfo.hasNextPage);

        const requestedLanguage = this.initialLanguage()?.trim();
        const languages = this.availableLanguages();

        const defaultLanguage =
          languages.find(
            language =>
              language.toLowerCase() === requestedLanguage?.toLowerCase()
          ) ??
          languages.find(language => language.toLowerCase() === 'japanese') ??
          languages[0] ??
          '';

        this.onLanguageChange(defaultLanguage);
        this.loadingCharacters.set(false);
      },
      error: error => {
        console.error('Erreur de chargement des personnages', error);
        this.characters.set([]);
        this.voiceActors.set([]);
        this.characterVoiceActors.set([]);
        this.selectedVoiceActor.set(null);
        this.voiceActorData.set(new Map());
        this.loadingCharacters.set(false);
      }
    });
  }

  private mergeVoiceActors(edges: AniListCharacterEdge[], reset = false): void {
    const grouped = new Map<number, CharacterVoiceActorPair>();

    if (!reset) {
      for (const group of this.characterVoiceActors()) {
        grouped.set(group.voiceActor.id, {
          voiceActor: group.voiceActor,
          characters: [...group.characters]
        });
      }
    }

    for (const edge of edges) {
      for (const actor of edge.voiceActors) {
        const existing = grouped.get(actor.id);

        const characterEntry = {
          character: edge.node,
          role: edge.role
        };

        if (existing) {
          const alreadyExists = existing.characters.some(
            item => item.character.id === edge.node.id
          );

          if (!alreadyExists) {
            existing.characters.push(characterEntry);
          }
        } else {
          grouped.set(actor.id, {
            voiceActor: actor,
            characters: [characterEntry]
          });
        }
      }
    }

    const groups = [...grouped.values()];

    for (const group of groups) {
      group.characters.sort(
        (a, b) =>
          (b.character.favourites ?? 0) -
          (a.character.favourites ?? 0)
      );
    }

    this.characterVoiceActors.set(groups);
    this.voiceActors.set(groups.map(group => group.voiceActor));
  }

  loadMoreCharacters(): void {
    if (this.loadingMore() || !this.hasNextPage() || !this.anime()?.mal_id) return;

    const malId = this.anime()!.mal_id;
    const nextPage = this.currentPage() + 1;

    this.loadingMore.set(true);

    this.characterService
      .getByAnimeFromAniList(malId, nextPage, this.perPage)
      .subscribe({
        next: result => {
          const newEdges = result.characters.edges;

          this.characters.update(existing => [
            ...existing,
            ...newEdges.filter(
              edge => !existing.some(item => item.node.id === edge.node.id)
            )
          ]);

          this.mergeVoiceActors(newEdges);

          this.currentPage.set(result.characters.pageInfo.currentPage);
          this.hasNextPage.set(result.characters.pageInfo.hasNextPage);
          this.loadingMore.set(false);
        },
        error: error => {
          console.error('Erreur lors du chargement de la page suivante', error);
          this.loadingMore.set(false);
        }
      });
  }

  private loadVoiceActorData(staffId: number): void {
    const currentAnimeCharacterIds = new Set(
      this.characters().map(edge => edge.node.id)
    );
    const listSize = 10;

    forkJoin({
      popular: this.voiceActorService.getPopularCharacters(staffId, 1, 20),
      recent: this.voiceActorService.getRecentCharacters(staffId, 1, 20)
    }).subscribe({
      next: ({ popular, recent }) => {
        const filteredPopular = popular.nodes
          .filter(
            character =>
              !currentAnimeCharacterIds.has(character.id)
          )
          .slice(0, listSize);

        const filteredRecent = recent.items
          .filter(
            result =>
              !currentAnimeCharacterIds.has(
                result.character.id
              )
          )
          .slice(0, listSize);

        this.voiceActorData.update(current => {
          const next = new Map(current);

          next.set(staffId, {
            popular: filteredPopular,
            recent: filteredRecent,
            loading: false
          });

          return next;
        });
      },

      error: () => {
        this.voiceActorData.update(current => {
          const next = new Map(current);

          next.set(staffId, {
            popular: [],
            recent: [],
            loading: false
          });

          return next;
        });
      }
    });
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage.set(language);
    this.languageOutput.emit(language);
  }
}
