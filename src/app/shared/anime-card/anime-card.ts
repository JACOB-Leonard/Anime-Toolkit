import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Anime } from '../../core/models/anime.model';
import { AnimePicturesService } from '../../core/services/anime-pictures.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-anime-card',
  templateUrl: './anime-card.html',
  styleUrls: ['./anime-card.scss'],
  imports: [DatePipe, TitleCasePipe, CdkDragHandle]
})
export class AnimeCard {
  anime = input.required<Anime>();

  showModal = signal(false);
  selectedImage = signal<string | undefined>(undefined);
  
  pictures = signal<string[]>([]);
  loadingPictures = signal(false);

  private picturesService = inject(AnimePicturesService);
  private sanitizer = inject(DomSanitizer);  

  currentImage = computed(() =>
    this.selectedImage() ??
    this.anime().selectedImage ??
    this.anime().images?.['jpg']?.large_image_url ??
    this.anime().images?.['webp']?.large_image_url ??
    ''
  );

  safeTrailerUrl = computed<SafeResourceUrl | undefined>(() => {
    const embedUrl = this.anime().trailer?.['embed_url'];

    if (!embedUrl) {
      return undefined;
    }

    let cleanUrl = embedUrl.replace('autoplay=1', 'autoplay=0');

    if (!cleanUrl.includes('autoplay=')) {
      const separator = cleanUrl.includes('?') ? '&' : '?';
      cleanUrl += `${separator}autoplay=0`;
    }

    cleanUrl += '&rel=0&modestbranding=1';

    return this.sanitizer.bypassSecurityTrustResourceUrl(cleanUrl);
  });

  toggleModal(event: MouseEvent) {
    event.stopPropagation();
    this.showModal.update(value => !value);

    if (this.showModal() && this.pictures().length === 0) {
      this.loadPictures();
    }
  }

  loadPictures(): void {
    this.loadingPictures.set(true);

    this.picturesService
      .getPictures(this.anime().mal_id)
      .subscribe(res => {
        this.pictures.set(res.data.map(p => p.jpg.large_image_url));
        this.loadingPictures.set(false);
      });
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
    this.anime().selectedImage = url;
  }

}

