import { create } from 'zustand'
import type { ThemePreference } from '../types/settings'

const SETTINGS_STORAGE_KEY = 'attendance_system_settings'

function readThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'System'
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    const theme = stored ? (JSON.parse(stored) as { preferences?: { theme?: ThemePreference } }).preferences?.theme : undefined
    return theme === 'Light' || theme === 'Dark' || theme === 'System' ? theme : 'System'
  } catch {
    return 'System'
  }
}

interface SettingsStore {
  themePreference: ThemePreference
  setThemePreference: (themePreference: ThemePreference) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  themePreference: readThemePreference(),
  setThemePreference: (themePreference) => set({ themePreference }),
}))
