import { create } from 'zustand'
import type { SystemSettings, ThemePreference } from '../types/settings'
import { persistSystemSettings, readStoredSettings } from '../services/settingsService'

/**
 * Reactive mirror of the persisted System Settings. This is the single source
 * of truth for the UI: every module reads current settings from here (usually
 * through useSystemSettings()) so changes propagate immediately without a
 * page refresh. Every update is persisted to localStorage, so settings
 * survive a page reload.
 */
const initial = readStoredSettings()

interface SettingsStore {
  /** Full application configuration, hydrated from localStorage on boot. */
  settings: SystemSettings
  /** Convenience selector for the active theme (kept for existing consumers). */
  themePreference: ThemePreference
  /** Replaces the whole configuration and persists it. */
  setSettings: (settings: SystemSettings) => void
  /** Updates only the theme preference and persists it. */
  setThemePreference: (theme: ThemePreference) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: initial,
  themePreference: initial.preferences.theme,
  setSettings: (settings) => {
    persistSystemSettings(settings)
    set({ settings, themePreference: settings.preferences.theme })
  },
  setThemePreference: (theme) =>
    set((state) => {
      const settings = { ...state.settings, preferences: { ...state.settings.preferences, theme } }
      persistSystemSettings(settings)
      return { settings, themePreference: theme }
    }),
}))
