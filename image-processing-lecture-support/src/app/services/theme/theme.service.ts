import { Injectable } from '@angular/core';
import { Themes } from '../../static/enums';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private storageKey = 'app-theme';
  private themeChangedSource = new Subject<string>();
  themeChanged$ = this.themeChangedSource.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme) {
      this.setTheme(savedTheme as Themes);
    } else {
      // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // this.setTheme(prefersDark ? Themes.Dark : Themes.Light);
      this.setTheme(Themes.Light);
    }
  }

  setTheme(theme: Themes) {
    const body = document.body;
    body.classList.remove('light', 'dark');
    body.classList.add(`${theme}`);
    this.themeChangedSource.next(theme);
    localStorage.setItem(this.storageKey, theme);
  }

  getTheme(): Themes {
    return localStorage.getItem(this.storageKey) as Themes;
  }

  getThemeClass(): string {
    return `${this.getTheme()}`;
  }

  toggleTheme() {
    const current = this.getTheme();
    this.setTheme(current === Themes.Light ? Themes.Dark : Themes.Light);
  }
}
