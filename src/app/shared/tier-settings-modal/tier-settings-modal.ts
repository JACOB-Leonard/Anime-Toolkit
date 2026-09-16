import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tier-settings-modal',
  imports: [],
  templateUrl: './tier-settings-modal.html',
  styleUrl: './tier-settings-modal.scss'
})
export class TierSettingsModal {

  readonly presetColors: string[] = [
    '#FF7F7F', '#FFBF7F', '#FFDF7F', '#FFFF7F',
    '#BFFF7F', '#7FFF7F', '#7FFFFF', '#7FBFFF',
    '#7F7FFF', '#FF7FFF', '#BF7FBF', '#3B3B3B',
    '#858585', '#CFCFCF', '#F7F7F7'
  ];

  readonly tier = input.required<string>();
  readonly label = input.required<string>();
  readonly color = input.required<string>();
  readonly index = input.required<number>();

  readonly addAbove = output<void>();
  readonly addBelow = output<void>();
  readonly colorChange = output<string>();
  readonly close = output<void>();
  readonly deleteTier = output<void>();
  readonly clearTier = output<void>();
}
