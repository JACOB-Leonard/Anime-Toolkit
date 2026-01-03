import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tier-settings-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tier-settings-modal.html',
  styleUrl: './tier-settings-modal.scss'
})
export class TierSettingsModal {

  presetColors: string[] = [
    '#FF7F7F', '#FFBF7F', '#FFDF7F', '#FFFF7F',
    '#BFFF7F', '#7FFF7F', '#7FFFFF', '#7FBFFF',
    '#7F7FFF', '#FF7FFF', '#BF7FBF', '#3B3B3B',
    '#858585', '#CFCFCF', '#F7F7F7'
  ];

  @Input() tier!: string;
  @Input() label!: string;
  @Input() color!: string;
  @Input() index!: number;

  @Output() addAbove = new EventEmitter<void>();
  @Output() addBelow = new EventEmitter<void>();
  @Output() colorChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() deleteTier = new EventEmitter<void>();
  @Output() clearTier = new EventEmitter<void>();
}
