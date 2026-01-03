import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  toggleDark() {
    document.body.classList.toggle('dark');

    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  }

  initTheme() {
    const saved = localStorage.getItem('theme');

    if (saved) {
      document.body.classList.toggle('dark', saved === 'dark');
    } 
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    }
  }

  isDark(): boolean {
    return document.body.classList.contains('dark');
  }
}
