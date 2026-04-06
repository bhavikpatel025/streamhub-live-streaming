import { Injectable } from '@angular/core';

export type ThemeName = 'dark-theme' | 'light-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'streamhub-theme';
  private currentTheme: ThemeName = 'dark-theme';

  get theme(): ThemeName {
    return this.currentTheme;
  }

  get isDark(): boolean {
    return this.currentTheme === 'dark-theme';
  }

  initializeTheme(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeName | null;
    this.currentTheme = saved === 'light-theme' ? 'light-theme' : 'dark-theme';
    this.applyTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.isDark ? 'light-theme' : 'dark-theme';
    localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
    this.applyTheme();
  }

  setTheme(theme: ThemeName): void {
    this.currentTheme = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme();
  }

  getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  private applyTheme(): void {
    const body = document.body;
    body.classList.remove('dark-theme', 'light-theme');
    body.classList.add(this.currentTheme);
  }
}
