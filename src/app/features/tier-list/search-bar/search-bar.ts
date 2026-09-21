import { Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
})
export class SearchBar {
  
  readonly season = signal(this.getCurrentSeason());
  readonly year = signal(new Date().getFullYear());

  readonly animeTypes = signal([
    { label: 'TV', value: 'TV', checked: true },
    { label: 'Movie', value: 'Movie', checked: false },
    { label: 'OVA', value: 'OVA', checked: false },
    { label: 'ONA', value: 'ONA', checked: false },
    { label: 'TV Special', value: 'special', checked: false },
    { label: 'Music', value: 'Music', checked: false },
  ]);

  readonly allSelected = computed(() =>
    this.animeTypes().every(type => type.checked)
  );

  readonly search = output<{ season: string; year: number; filters: string[] }>();

  getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;

    if (month >= 1 && month <= 3) return 'winter';
    if (month >= 4 && month <= 6) return 'spring';
    if (month >= 7 && month <= 9) return 'summer';
    return 'fall';
  }

  toggleAll(): void {
    const newValue = !this.allSelected();
    
    this.animeTypes.update(types =>
      types.map(type => ({
        ...type,
        checked: newValue,
      })) 
    );
  }

  toggleType(value: string): void {
    this.animeTypes.update(types =>
      types.map(type =>
        type.value === value
          ? { ...type, checked: !type.checked }
          : type
      )
    );
  }

  onSubmit(): void {
    const selectedFilters = this.animeTypes()
      .filter(type => type.checked)
      .map(type => type.value);
    
      this.search.emit({
        season: this.season(),
        year: this.year(),
        filters: selectedFilters
      });
  }
}
