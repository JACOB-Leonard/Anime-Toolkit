import { Component, computed, effect, inject, signal } from '@angular/core';
import { AnimeSelector } from '../../../shared/anime-selector/anime-selector';
import { AnimeService } from '../../../core/services/anime';
import { ActivatedRoute, Router } from '@angular/router';
import { Anime } from '../../../core/models/anime.model';
import { VoiceActorExplorer } from '../components/voice-actor-explorer/voice-actor-explorer';

@Component({
  selector: 'app-staff-explorer-page',
  imports: [AnimeSelector, VoiceActorExplorer],
  templateUrl: './staff-explorer-page.html',
  styleUrl: './staff-explorer-page.scss'
})
export class StaffExplorerPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly animeService = inject(AnimeService);

  readonly selectedAnime = signal<Anime | null>(null);
  readonly selectedLanguage = signal<string | null>('Japanese');

  private readonly initialized = signal(false);
  readonly charactersLoading = signal(false);
  readonly staffLoading = signal(false);

  readonly Loading = computed(() =>
    this.charactersLoading() || this.staffLoading()
  );

  ngOnInit(): void {
    const Param = this.route.snapshot.paramMap.get('Id');
    this.route.queryParamMap.subscribe(params => {
      this.selectedLanguage.set(params.get('language'));
    });
    console.log('Selected Language:', this.selectedLanguage());

    if (Param === null) {
      this.initialized.set(true);
      return;
    }

    const Id = Number(Param);

    if (!Number.isInteger(Id) || Id <= 0) {
      this.redirectTo();
      return;
    }
    this.loadAnime(Id);
  }

  private loadAnime(Id: number): void {
    this.animeService.getAnimeById(Id).subscribe({
      next: (anime) => {
        this.selectedAnime.set(anime);
        this.initialized.set(true);
      },
      error: () => this.redirectTo()
    });
  }

  private readonly syncUrlEffect = effect(() => {
    if (!this.initialized()) return;

    const id = this.selectedAnime();

    if (!id) return;

    this.updateUrl(id.mal_id);
  });

  selectAnime(anime: Anime): void {
    this.selectedAnime.set(anime);
  }

  private updateUrl(Id: number): void {
    this.router.navigate(['/staff-explorer', Id], {
      queryParams: this.selectedLanguage() === 'Japanese' ? {} : { language: this.selectedLanguage() },
      replaceUrl: true
    });
  }

  private redirectTo(): void {
    this.router.navigate(['/staff-explorer'], {replaceUrl: true });
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage.set(language);
  }

}
