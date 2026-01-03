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
  season = 'winter';
  year = new Date().getFullYear();
  animeTypes = [
    { label: 'TV', value: 'TV', checked: true },
    { label: 'Movie', value: 'Movie', checked: false },
    { label: 'OVA', value: 'OVA', checked: false },
    { label: 'ONA', value: 'ONA', checked: false },
    { label: 'Special', value: 'Special', checked: false },
    { label: 'Music', value: 'Music', checked: false },
  ];

  @Output() search = new EventEmitter<{ season: string; year: number; filters: string[] }>();

  onSubmit() {
    const selectedFilters = this.animeTypes
      .filter(type => type.checked)
      .map(type => type.value);
    this.search.emit({ season: this.season, year: this.year, filters: selectedFilters });
  }
}
