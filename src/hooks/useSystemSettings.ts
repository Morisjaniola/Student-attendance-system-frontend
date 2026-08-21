import type { SystemSettings } from '../types/settings'
import { useSettingsStore } from '../stores/settingsStore'

/**
 * Reactive access to the System Settings configuration. Components that call
 * this hook re-render automatically whenever a setting is saved, so modules
 * stay in sync with System Settings without a page refresh.
 *
 * Pass an optional selector to subscribe to a slice of the settings
 * (e.g. `useSystemSettings((settings) => settings.qrRfid)`).
 */
export function useSystemSettings<T = SystemSettings>(selector: (settings: SystemSettings) => T = (settings) => settings as T): T {
  return useSettingsStore((state) => selector(state.settings))
}
