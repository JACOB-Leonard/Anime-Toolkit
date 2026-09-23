import { Component, computed, effect, signal } from '@angular/core';
import { AnimeSelector } from '../components/anime-selector/anime-selector';
import { Anime } from '../../../core/models/anime.model';
import { AnimeCharacter } from '../../../core/services/character.service';
import { FormsModule } from '@angular/forms';
import { AnimeStaff } from '../../../core/services/staff.service';
import { VoiceActorComparison } from '../components/voice-actor-comparison/voice-actor-comparison';
import { StaffComparison } from '../components/staff-comparison/staff-comparison';

@Component({
  selector: 'app-staff-comparator-page',
  imports: [AnimeSelector, FormsModule, StaffComparison, VoiceActorComparison],
  templateUrl: './staff-comparator-page.html',
  styleUrl: './staff-comparator-page.scss'
})
export class StaffComparatorPage {
  readonly leftSelectedAnime = signal<Anime | null>(null);
  readonly rightSelectedAnime = signal<Anime | null>(null);

  readonly leftCharactersList = signal<AnimeCharacter[]>([]);
  readonly rightCharactersList = signal<AnimeCharacter[]>([]);

  readonly leftStaffList = signal<AnimeStaff[]>([]);
  readonly rightStaffList = signal<AnimeStaff[]>([]);


  readonly selectedLanguage = signal('Japanese');

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

  constructor() {
    effect(() => {
      const languages = this.availableLanguages();

      if (languages.length === 0) {
        return;
      }

      if (languages.includes(this.selectedLanguage())) {
        return;
      }

      this.selectedLanguage.set(
        languages.includes('Japanese')
          ? 'Japanese'
          : languages[0]
      );
    });
  }
}
