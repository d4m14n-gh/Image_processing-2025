import { Injectable } from '@angular/core';
import { Themes } from '../../static/enums';
import { Subject } from 'rxjs/internal/Subject';

/** Service to manage application themes (light/dark). */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /** Key for storing the theme in local storage. */
  private readonly storageKey = 'app-theme';
  /** Observable to notify subscribers of theme changes. */
  private themeChangedSource = new Subject<string>();
  /** Observable stream for theme changes. */
  themeChanged = this.themeChangedSource.asObservable();
  
  /** Initializes the theme service, setting the theme based on local storage or defaulting to light theme. */
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

  /** Sets the application theme and updates local storage.
   * @param theme The theme to set (light or dark).
   * @see Themes
   */
  setTheme(theme: Themes): void {
    const body = document.body;
    body.classList.remove('light', 'dark');
    body.classList.add(`${theme}`);
    this.themeChangedSource.next(theme);
    localStorage.setItem(this.storageKey, theme);
  }

  /** Retrieves the current application theme.
   * @returns The current theme (light or dark).
   * @see Themes
   */
  getTheme(): Themes {
    return localStorage.getItem(this.storageKey) as Themes;
  }

  /** Retrieves the CSS class corresponding to the current theme.
   * @returns The CSS class for the current theme.
   */
  getThemeClass(): string {
    return `${this.getTheme()}`;
  }

  /** Toggles between light and dark themes. */
  toggleTheme(): void {
    const current = this.getTheme();
    this.setTheme(current === Themes.Light ? Themes.Dark : Themes.Light);
  }
}
