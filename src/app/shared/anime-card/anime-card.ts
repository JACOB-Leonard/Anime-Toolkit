import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Anime } from '../../core/models/anime.model';
import { AnimePicturesService } from '../../core/services/anime-pictures.service';

@Component({
  selector: 'app-anime-card',
  templateUrl: './anime-card.html',
  styleUrls: ['./anime-card.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AnimeCard {
  @Input() anime!: Anime;

  currentImage!: string;
  showPicker = false;
  pictures: string[] = [];
  loadingPictures = false;

  constructor(private picturesService: AnimePicturesService) {}

  ngOnInit() {
    this.currentImage =
      this.anime.selectedImage ??
      this.anime.images?.['jpg']?.image_url ??
      this.anime.images?.['webp']?.image_url;
  }

  togglePicker(event: MouseEvent) {
    event.stopPropagation();
    this.showPicker = !this.showPicker;

    if (this.showPicker && this.pictures.length === 0) {
      this.loadPictures();
    }
  }

  loadPictures() {
    this.loadingPictures = true;

    this.picturesService
      .getPictures(this.anime.mal_id)
      .subscribe(res => {
        this.pictures = res.data.map(p => p.jpg.image_url);
        this.loadingPictures = false;
      });
  }

  selectImage(url: string) {
    this.anime.selectedImage = url;
    this.currentImage = url;
    this.showPicker = false;
  }

}

