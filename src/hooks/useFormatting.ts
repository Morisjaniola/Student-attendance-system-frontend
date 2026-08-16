import { useSettingsStore } from '../stores/settingsStore'
import type { SystemPreferences } from '../types/settings'

/**
 * Reactive access to the display preferences (time format, date format).
 * Used by display components so a format change in System Settings is
 * reflected immediately wherever times/dates are rendered.
 */
export function useFormatPreferences(): SystemPreferences {
  return useSettingsStore((state) => state.settings.preferences)
}
