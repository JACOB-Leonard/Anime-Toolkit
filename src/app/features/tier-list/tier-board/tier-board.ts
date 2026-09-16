import { Component, ElementRef, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AnimeCard } from '../../../shared/anime-card/anime-card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { TierSettingsModal } from '../../../shared/tier-settings-modal/tier-settings-modal';
import { Anime } from '../../../core/models/anime.model';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'app-tier-board',
  templateUrl: './tier-board.html',
  styleUrls: ['./tier-board.scss'],
  imports: [DragDropModule, FormsModule, AnimeCard, TierSettingsModal],
})
export class TierBoard implements OnInit {
  tierList: Record<string, Anime[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
    };
  @Input() unassignedTypes: Record<string, Anime[]> = {};

  tierListLabels: Record<string, string> = {};
  tierOrder: string[] = [];

  tierColors: Record<string, string> = {};
  tierCustomColors: Record<string, string | null> = {};

  readonly typeOrder = ['TV', 'Movie', 'OVA', 'ONA', 'TV Special', 'Music'];

  @ViewChild('tierBoard', { static: false })
  tierBoardRef!: ElementRef<HTMLDivElement>;

  serviceAvailable = false;

  get dropListIds(): string[] {
    return [
      ...this.unassignedTypeKeys.map(t => `unassigned-${t}`),
      ...this.tierOrder.map(t => 'tier-' + t)
    ];
  }

  get nonEmptyUnassignedTypes(): string[] {
    return this.typeOrder.filter(type => (this.unassignedTypes[type]?.length ?? 0) > 0);
  }

  get connectedUnassignedIds(): string[] {
    return this.nonEmptyUnassignedTypes.map(type => 'unassigned-' + type);
  }

  moveTierUp(index: number) {
    if (index === 0) return;
    [this.tierOrder[index - 1], this.tierOrder[index]] =
    [this.tierOrder[index], this.tierOrder[index - 1]];
  }

  moveTierDown(index: number) {
    if (index === this.tierOrder.length - 1) return;
    [this.tierOrder[index + 1], this.tierOrder[index]] =
    [this.tierOrder[index], this.tierOrder[index + 1]];
  }

  ngOnInit(): void {
    this.tierOrder = Object.keys(this.tierList);

    this.tierOrder.forEach((tier,index) => {
      this.tierListLabels[tier] = tier;
    });
  }

  onDrop(event: CdkDragDrop<Anime[]>): void {
    const previousList = event.previousContainer.data;
    const currentList = event.container.data;

    if (!previousList || !currentList) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        currentList,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    const anime = previousList[event.previousIndex];

    if (!anime) {
      console.error('Anime introuvable lors du déplacement', {
        previousIndex: event.previousIndex,
        previousList
      });
      return;
    }

    previousList.splice(event.previousIndex, 1);

    if (event.container.id.startsWith('tier-')) {
      currentList.splice(event.currentIndex, 0, anime);
      return;
    }

    if (event.container.id.startsWith('unassigned-')) {
      const type = anime.type || 'Other';

      if (!this.unassignedTypes[type]) {
        this.unassignedTypes[type] = [];
      }

      this.unassignedTypes[type].splice(
        event.currentIndex,
        0,
        anime
      );
    }
  }


  //Modal management

  selectedTier = signal<string | null>(null);
  selectedTierIndex = signal(-1);

  openSettings(tier: string, index: number): void {
    this.selectedTier.set(tier);
    this.selectedTierIndex.set(index);
  }

  closeSettings(): void {
    this.selectedTier.set(null);
    this.selectedTierIndex.set(-1);
  }

  private generateTierId(): string {
    return 'tier-' + crypto.randomUUID().slice(0, 8);
  }

  private initializeTier(tier: string) {
    this.tierList[tier] = [];
    this.tierListLabels[tier] = 'New';
  }

  addTierAbove(index: number) {
    const newTier = this.generateTierId();

    this.tierOrder.splice(index, 0, newTier);
    this.initializeTier(newTier);
    this.selectedTierIndex.update((value) => value + 1);
  }

  addTierBelow(index: number) {
    const newTier = this.generateTierId();

    this.tierOrder.splice(index + 1, 0, newTier);
    this.initializeTier(newTier);
  }

  private returnToUnassigned(animes: Anime[]) {
    for (const anime of animes) {
      const type = anime.type || 'Other';

      if (!this.unassignedTypes[type]) {
        this.unassignedTypes[type] = [];
      }

      this.unassignedTypes[type].push(anime);
    }
  }

  removeTier(index: number) {
    const tier = this.tierOrder[index];
    if (!tier) return;

    const items = this.tierList[tier] ?? [];

    this.returnToUnassigned(items);

    this.tierOrder.splice(index, 1);
    delete this.tierList[tier];
    delete this.tierListLabels[tier];
    delete this.tierColors[tier];
    delete this.tierCustomColors[tier];

    this.closeSettings();
  }


  clearTier(tier: string) {
    const items = this.tierList[tier];
    if (!items || items.length === 0) return;

    this.returnToUnassigned(items);

    this.tierList[tier] = [];
  }


  // Color

  getAutoColor(index: number, total: number): string {
    const startHue = 0;
    const endHue = 180;
    const hue = startHue + (index / (total - 1)) * (endHue - startHue);

    const saturation = 75;
    const lightness = 60;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  getTierColor(tier: string, index: number): string {
    const custom = this.tierCustomColors[tier];
    return custom ?? this.getAutoColor(index, this.tierOrder.length);
  }

  // Modal Color

  updateTierColor(color: string): void {
    const tier = this.selectedTier();

    if (!tier) return;

    this.tierCustomColors[tier] = color;
  }

  // Collapsed Types

  get unassignedTypeKeys(): string[] {
    return Object.keys(this.unassignedTypes);
  }

  collapsedTypes = new Set<string>();

  toggleType(type: string) {
    if (this.collapsedTypes.has(type)) {
      this.collapsedTypes.delete(type);
    } else {
      this.collapsedTypes.add(type);
    }
  }

  isCollapsed(type: string): boolean {
    return this.collapsedTypes.has(type);
  }

  // Export as Image

  exportAsImage() {
    if (!this.tierBoardRef) return;

    const clone = this.tierBoardRef.nativeElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-export').forEach(el => el.remove());
    clone.classList.add('export-zoom');

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.opacity = '0';
    container.appendChild(clone);
    document.body.appendChild(container);

    htmlToImage.toJpeg(clone,{
      quality: 1,
      pixelRatio: 2
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `tier-list.jpg`;
        link.href = dataUrl;
        link.click();

        document.body.removeChild(container);
      });
  }

}
