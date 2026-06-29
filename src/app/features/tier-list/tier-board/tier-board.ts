import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AnimeCard } from '../../../shared/anime-card/anime-card';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { TierSettingsModal } from '../../../shared/tier-settings-modal/tier-settings-modal';
import { Anime } from '../../../core/models/anime.model';
import * as htmlToImage from 'html-to-image';


@Component({
  selector: 'app-tier-board',
  templateUrl: './tier-board.html',
  styleUrls: ['./tier-board.scss'],
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, AnimeCard, TierSettingsModal],
})
export class TierBoard {
  tierList: Record<string, any[]> = {
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

  get tierNames(): string[] {
    return this.tierOrder;
  }

  get dropListIds(): string[] {
    return [
      ...this.unassignedTypeKeys.map(t => `unassigned-${t}`),
      ...this.tierNames.map(t => 'tier-' + t)
    ];
  }

  get nonEmptyUnassignedTypes() {
    return this.typeOrder.filter(type => this.unassignedTypes[type]?.length);
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

  ngOnInit() {
    this.tierOrder = Object.keys(this.tierList);

    this.tierOrder.forEach((tier,index) => {
      this.tierListLabels[tier] = tier;
    });
  }

  onDrop(event: CdkDragDrop<Anime[]>) {
    const prev = event.previousContainer;
    const curr = event.container;

    if (!prev || !curr) return;

    if (prev === curr) {
      moveItemInArray(curr.data, event.previousIndex, event.currentIndex);
      return;
    }

    const anime = prev.data[event.previousIndex];

    prev.data.splice(event.previousIndex, 1);

    if (curr.id.startsWith('tier-')) {
      curr.data.splice(event.currentIndex, 0, anime);
      return;
    }

    if (curr.id.startsWith('unassigned-')) {
      const type = anime.type || 'Other';

      if (!this.unassignedTypes[type]) {
        this.unassignedTypes[type] = [];
      }

      this.unassignedTypes[type].splice(event.currentIndex, 0, anime);
    }
  }


  //Modal management

  selectedTier: string | null = null;
  selectedTierIndex = -1;

  openSettings(tier: string, index: number) {
    this.selectedTier = tier;
    this.selectedTierIndex = index;
  }

  closeSettings() {
    this.selectedTier = null;
    this.selectedTierIndex = -1;
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

  updateTierColor(color: string) {
    if (!this.selectedTier) return;
    this.tierCustomColors[this.selectedTier] = color;
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
