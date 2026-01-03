import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-anime-card',
  templateUrl: './anime-card.html',
  styleUrls: ['./anime-card.scss'],
  standalone: true
})
export class AnimeCard {
  @Input() anime: any;
}
