import { Component } from '@angular/core';
import { TierListPage } from './features/tier-list/tier-list-page/tier-list-page';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [TierListPage],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true,
})
export class App {
  constructor(public theme: ThemeService) {}

  ngOnInit() {
    this.theme.initTheme();
  }
}