import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  toggleDark() {
    document.documentElement.classList.toggle('dark');

    localStorage.setItem(
      'theme',
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  }

  initTheme() {
    const saved = localStorage.getItem('theme');

    if (saved) {
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } 
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }

  isDark(): boolean {
    return document.documentElement.classList.contains('dark');
  }
}
