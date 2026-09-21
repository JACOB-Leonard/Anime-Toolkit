import { AnimeCharacter } from "../services/character.service";

export interface CommonVoiceActor {
  voiceActor: AnimeCharacter['voice_actors'][number]['person'];
  leftCharacters: AnimeCharacter[];
  rightCharacters: AnimeCharacter[];
  hiddenLeftCharacters: AnimeCharacter[];
  hiddenRightCharacters: AnimeCharacter[];
  popularity: number;
}