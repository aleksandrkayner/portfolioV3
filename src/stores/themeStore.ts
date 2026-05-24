import { makeAutoObservable } from 'mobx'
import { THEME_MODES, type ThemeMode } from '../types/theme'

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme)
}

export class ThemeStore {
  theme: ThemeMode = getSystemTheme()

  constructor() {
    makeAutoObservable(this)
    applyTheme(this.theme)
  }

  setTheme(next: ThemeMode) {
    this.theme = next
    applyTheme(next)
  }

  cycleTheme() {
    const index = THEME_MODES.indexOf(this.theme)
    this.setTheme(THEME_MODES[(index + 1) % THEME_MODES.length])
  }

  syncWithSystemPreference() {
    this.setTheme(getSystemTheme())
  }
}
