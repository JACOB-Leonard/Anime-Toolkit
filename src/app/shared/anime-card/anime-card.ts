import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Anime } from '../../core/models/anime.model';
import { AnimePicturesService } from '../../core/services/anime-pictures.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-anime-card',
  templateUrl: './anime-card.html',
  styleUrls: ['./anime-card.scss'],
  standalone: true,
  imports: [CommonModule,]
})
export class AnimeCard {
  @Input() anime!: Anime;

  currentImage!: string;

  showModal = false;
  showThumbnails = false;
  
  pictures: string[] = [];
  loadingPictures = false;

  constructor(private picturesService: AnimePicturesService, private sanitizer: DomSanitizer) {}
  

  safeTrailerUrl?: SafeResourceUrl;

  ngOnInit() {
    this.currentImage =
      this.anime.selectedImage ??
      this.anime.images?.['jpg']?.large_image_url ??
      this.anime.images?.['webp']?.large_image_url;

    const embedUrl = this.anime.trailer?.['embed_url'];

    if (embedUrl) {

      let cleanUrl = embedUrl.replace('autoplay=1', 'autoplay=0');

      if (!cleanUrl.includes('autoplay=')) {
        const separator = cleanUrl.includes('?') ? '&' : '?';
        cleanUrl += `${separator}autoplay=0`;
      }

      cleanUrl += '&rel=0&modestbranding=1';

      this.safeTrailerUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(cleanUrl);
    }
  }

  toggleModal(event: MouseEvent) {
    event.stopPropagation();
    this.showModal = !this.showModal;

    if (this.showModal && this.pictures.length === 0) {
      this.loadPictures();
    }
  }

  loadPictures() {
    this.loadingPictures = true;

    this.picturesService
      .getPictures(this.anime.mal_id)
      .subscribe(res => {
        this.pictures = res.data.map(p => p.jpg.large_image_url);
        this.loadingPictures = false;
      });
  }

  toggleThumbnails() {
    this.showThumbnails = !this.showThumbnails;
  }

  selectImage(url: string) {
    this.anime.selectedImage = url;
    this.currentImage = url;
    this.showThumbnails = false;
  }

}

