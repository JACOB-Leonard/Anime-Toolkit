import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { AnimeSelector } from '../components/anime-selector/anime-selector';
import { Anime } from '../../../core/models/anime.model';
import { AnimeCharacter } from '../../../core/services/character.service';
import { FormsModule } from '@angular/forms';
import { AnimeStaff } from '../../../core/services/staff.service';
import { VoiceActorComparison } from '../components/voice-actor-comparison/voice-actor-comparison';
import { StaffComparison } from '../components/staff-comparison/staff-comparison';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnimeService } from '../../../core/services/anime';

@Component({
  selector: 'app-staff-comparator-page',
  imports: [AnimeSelector, FormsModule, StaffComparison, VoiceActorComparison],
  templateUrl: './staff-comparator-page.html',
  styleUrl: './staff-comparator-page.scss'
})
export class StaffComparatorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly animeService = inject(AnimeService);

  readonly leftSelectedAnime = signal<Anime | null>(null);
  readonly rightSelectedAnime = signal<Anime | null>(null);

  readonly leftCharactersList = signal<AnimeCharacter[]>([]);
  readonly rightCharactersList = signal<AnimeCharacter[]>([]);

  readonly leftStaffList = signal<AnimeStaff[]>([]);
  readonly rightStaffList = signal<AnimeStaff[]>([]);
  readonly selectedLanguage = signal('Japanese');

  private readonly routeLanguage = signal<string | null>(null);
  private readonly initialized = signal(false);

  readonly leftCharactersLoading = signal(false);
  readonly rightCharactersLoading = signal(false);
  readonly leftStaffLoading = signal(false);
  readonly rightStaffLoading = signal(false);

  readonly comparisonLoading = computed(() =>
    this.leftCharactersLoading() ||
    this.rightCharactersLoading() ||
    this.leftStaffLoading() ||
    this.rightStaffLoading()
  );

  readonly availableLanguages = computed(() => {
    const left = this.leftCharactersList();
    const right = this.rightCharactersList();

    const leftVoiceActors = new Set<string>();
    const rightVoiceActors = new Set<string>();

    for (const character of left) {
      for (const va of character.voice_actors) {
        leftVoiceActors.add(`${va.person.mal_id}:${va.language}`);
      }
    }

    for (const character of right) {
      for (const va of character.voice_actors) {
        rightVoiceActors.add(`${va.person.mal_id}:${va.language}`);
      }
    }

    const commonLanguages = new Set<string>();

    for (const key of leftVoiceActors) {
      if (!rightVoiceActors.has(key)) continue;

      const [, language] = key.split(':');
      commonLanguages.add(language);
    }
    return [...commonLanguages].sort();
  });

  ngOnInit(): void {
    const leftParam = this.route.snapshot.paramMap.get('leftId');
    const rightParam = this.route.snapshot.paramMap.get('rightId');
    this.routeLanguage.set(this.route.snapshot.queryParamMap.get('language'));

    if (leftParam === null && rightParam === null) {
      this.initialized.set(true);
      return;
    }

    const leftId = Number(leftParam);
    const rightId = Number(rightParam);

    if (!Number.isInteger(leftId) || !Number.isInteger(rightId) || leftId <= 0 || rightId <= 0) {
      this.redirectToEmptyComparator();
      return;
    }

    this.loadComparison(leftId, rightId);
  }

  private loadComparison(leftId: number, rightId: number): void {
    forkJoin({
      left: this.animeService.getAnimeById(leftId),
      right: this.animeService.getAnimeById(rightId)
    }).subscribe({
      next: ({ left, right }) => {
        this.leftSelectedAnime.set(left);
        this.rightSelectedAnime.set(right);
        this.initialized.set(true);
      },
      error: () => this.redirectToEmptyComparator()
    });
  }

  private readonly syncUrlEffect = effect(() => {
    if (!this.initialized()) return;

    const left = this.leftSelectedAnime();
    const right = this.rightSelectedAnime();
    const languages = this.availableLanguages();

    if (!left || !right || languages.length === 0) return;

    const urlLanguage = this.routeLanguage();
    const language = urlLanguage && languages.includes(urlLanguage)
      ? urlLanguage
      : languages.includes('Japanese')
        ? 'Japanese'
        : languages[0];

    if (this.selectedLanguage() !== language) {
      this.selectedLanguage.set(language);
    }

    this.updateUrl(left.mal_id, right.mal_id, language);
  });

  selectLeftAnime(anime: Anime): void {
    this.leftSelectedAnime.set(anime);
  }

  selectRightAnime(anime: Anime): void {
    this.rightSelectedAnime.set(anime);
  }

  selectLanguage(language: string): void {
    this.selectedLanguage.set(language);
    this.routeLanguage.set(language);
  }

  private updateUrl(leftId: number, rightId: number, language: string): void {
    this.router.navigate(['/staff-comparator', leftId, rightId], {
      queryParams: language === 'Japanese' ? {} : { language },
      replaceUrl: true
    });
  }

  private redirectToEmptyComparator(): void {
    this.router.navigate(['/staff-comparator'], { replaceUrl: true });
  }
}