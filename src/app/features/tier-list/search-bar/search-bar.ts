import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule, CommonModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
  standalone: true
})
export class SearchBar {
  season = this.getCurrentSeason();
  year = new Date().getFullYear();
  allSelected = false;

  animeTypes = [
    { label: 'TV', value: 'TV', checked: true },
    { label: 'Movie', value: 'Movie', checked: false },
    { label: 'OVA', value: 'OVA', checked: false },
    { label: 'ONA', value: 'ONA', checked: false },
    { label: 'Special', value: 'tv_special', checked: false },
    { label: 'Music', value: 'Music', checked: false },
  ];

  @Output() search = new EventEmitter<{ season: string; year: number; filters: string[] }>();

  getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;

    if (month >= 1 && month <= 3) return 'winter';
    if (month >= 4 && month <= 6) return 'spring';
    if (month >= 7 && month <= 9) return 'summer';
    return 'fall';
  }

  toggleAll() {
    this.allSelected = !this.allSelected;

    this.animeTypes.forEach(type => {
      type.checked = this.allSelected;
    });
  }

  updateAllState() {
    this.allSelected = this.animeTypes.every(t => t.checked);
  }

  onSubmit() {
    const selectedFilters = this.animeTypes
      .filter(type => type.checked)
      .map(type => type.value);
    this.search.emit({ season: this.season, year: this.year, filters: selectedFilters });
  }
}
