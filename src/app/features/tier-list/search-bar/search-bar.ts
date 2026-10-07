import { Component, computed, input, output, signal } from '@angular/core';
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
  readonly maxYear = new Date().getFullYear() + 1;

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

  readonly initialSearch = input<{ season: string; year: number; filters: string[] }>();
  readonly search = output<{ season: string; year: number; filters: string[] }>();

  ngOnInit(): void {
    const search = this.initialSearch();

    if (!search) return;

    this.season.set(search.season);
    this.year.set(search.year);

    this.animeTypes.update(types =>
      types.map(type => ({
        ...type,
        checked: search.filters.includes(type.value)
      }))
    );
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;

    if (month <= 3) return 'winter';
    if (month <= 6) return 'spring';
    if (month <= 9) return 'summer';
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
