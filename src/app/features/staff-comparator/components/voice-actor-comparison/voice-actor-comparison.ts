import { Component, computed, input, signal } from '@angular/core';
import { AnimeCharacter } from '../../../../core/services/character.service';
import { CommonVoiceActor } from '../../../../core/models/commonVoiceActor.model';

@Component({
  selector: 'app-voice-actor-comparison',
  imports: [],
  templateUrl: './voice-actor-comparison.html',
  styleUrl: './voice-actor-comparison.scss'
})
export class VoiceActorComparison {

  readonly leftCharacters = input.required<AnimeCharacter[]>();
  readonly rightCharacters = input.required<AnimeCharacter[]>();
  readonly language = input.required<string>();

  readonly collapsed = signal(false);

  toggleCollapsed(): void {
    this.collapsed.update(value => !value);
  }

  readonly commonVoiceActors = computed<CommonVoiceActor[]>(() => {
    const left = this.leftCharacters();
    const right = this.rightCharacters();

    const leftMap = new Map<number, AnimeCharacter[]>();
    const rightMap = new Map<number, AnimeCharacter[]>();
    const voiceActors = new Map<number, AnimeCharacter['voice_actors'][number]['person']>();

    const roleScore: Record<string, number> = {
      Main: 50000,
      Supporting: 1,
    };

    for (const character of left) {
      for (const va of character.voice_actors) {
        if (va.language !== this.language()) continue;

        const characters = leftMap.get(va.person.mal_id) ?? [];
        characters.push(character);

        leftMap.set(
          va.person.mal_id,
          characters.sort((a, b) => b.favorites - a.favorites)
        );

        voiceActors.set(va.person.mal_id, va.person);
      }
    }

    for (const character of right) {
      for (const va of character.voice_actors) {
        if (va.language !== this.language()) continue;

        const characters = rightMap.get(va.person.mal_id) ?? [];
        characters.push(character);

        rightMap.set(
          va.person.mal_id,
          characters.sort((a, b) => b.favorites - a.favorites)
        );
      }
    }

    const threshold = 20;

    return [...leftMap.entries()]
      .filter(([vaId]) => rightMap.has(vaId))
      .map(([vaId, leftCharacters]) => {
        const rightCharacters = rightMap.get(vaId)!;

        const leftMain = leftCharacters
          .filter(character => character.role === 'Main').length;

        const leftSupporting = leftCharacters
          .filter(character => character.role === 'Supporting')
          .reduce((total, character) => total + character.favorites, 0);

        const leftScore = leftMain * roleScore['Main'] + leftSupporting;

        const rightMain = rightCharacters
          .filter(character => character.role === 'Main').length;

        const rightSupporting = rightCharacters
          .filter(character => character.role === 'Supporting')
          .reduce((total, character) => total + character.favorites, 0);

        const rightScore = rightMain * roleScore['Main'] + rightSupporting;

        const visibleLeftCharacters = leftCharacters.filter(
          character => character.favorites > threshold
        );

        const visibleRightCharacters = rightCharacters.filter(
          character => character.favorites > threshold
        );

        if (visibleLeftCharacters.length === 0 && leftCharacters.length > 0) {
          visibleLeftCharacters.push(leftCharacters[0]);
        }

        if (visibleRightCharacters.length === 0 && rightCharacters.length > 0) {
          visibleRightCharacters.push(rightCharacters[0]);
        }

        const hiddenLeftCharacters = leftCharacters.filter(
          character => !visibleLeftCharacters.includes(character)
        );

        const hiddenRightCharacters = rightCharacters.filter(
          character => !visibleRightCharacters.includes(character)
        );

        return {
          voiceActor: voiceActors.get(vaId)!,
          leftCharacters: visibleLeftCharacters,
          rightCharacters: visibleRightCharacters,
          hiddenLeftCharacters,
          hiddenRightCharacters,
          popularity: leftScore + rightScore
        };
      })
      .sort((a, b) => b.popularity - a.popularity);
  });

  readonly expandedLeftVoiceActors = signal<Set<number>>(new Set());
  readonly expandedRightVoiceActors = signal<Set<number>>(new Set());

  toggleLeftCharacters(vaId: number): void {
    this.expandedLeftVoiceActors.update(set => {
      const next = new Set(set);
      next.has(vaId) ? next.delete(vaId) : next.add(vaId);
      return next;
    });
  }

  toggleRightCharacters(vaId: number): void {
    this.expandedRightVoiceActors.update(set => {
      const next = new Set(set);
      next.has(vaId) ? next.delete(vaId) : next.add(vaId);
      return next;
    });
  }

}
