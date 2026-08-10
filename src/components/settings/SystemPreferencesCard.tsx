import { Languages, MonitorCog, Palette } from 'lucide-react'
import type { SystemPreferences } from '../../types/settings'
import { SettingsCard } from './SettingsCard'

import { fieldClass } from '../../utils/formStyles'

const selectClass = `${fieldClass} mt-1.5 appearance-none`

interface SystemPreferencesCardProps {
  value: SystemPreferences
  saving: boolean
  onChange: (value: SystemPreferences) => void
  onSave: () => void
}

export function SystemPreferencesCard({ value, saving, onChange, onSave }: SystemPreferencesCardProps) {
  const update = <K extends keyof SystemPreferences>(key: K, next: SystemPreferences[K]) => onChange({ ...value, [key]: next })
  return (
    <SettingsCard title="System Preferences" description="Choose display preferences for this browser. Theme changes apply after saving." icon={<MonitorCog size={19} />} saving={saving} onSave={onSave}>
      <div className="grid gap-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300"><span className="flex items-center gap-1.5"><Languages size={13} />Language</span><select value={value.language} onChange={(event) => update('language', event.target.value as SystemPreferences['language'])} className={selectClass}><option>English</option><option>Filipino</option></select></label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300"><span className="flex items-center gap-1.5"><Palette size={13} />Theme</span><select value={value.theme} onChange={(event) => update('theme', event.target.value as SystemPreferences['theme'])} className={selectClass}><option>Light</option><option>Dark</option><option>System</option></select></label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Time format<select value={value.timeFormat} onChange={(event) => update('timeFormat', event.target.value as SystemPreferences['timeFormat'])} className={selectClass}><option value="12-hour">12-hour</option><option value="24-hour">24-hour</option></select></label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Date format<select value={value.dateFormat} onChange={(event) => update('dateFormat', event.target.value as SystemPreferences['dateFormat'])} className={selectClass}><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></label>
      </div>
      <p className="pb-4 text-[10px] leading-4 text-slate-400">Language and formatting preferences are saved locally as UI preferences in this frontend phase.</p>
    </SettingsCard>
  )
}
