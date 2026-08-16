import { AlarmClock, CalendarClock, Clock3 } from 'lucide-react'
import type { AttendanceSettings } from '../../types/settings'
import { ToggleSwitch } from './SettingToggle'
import { SettingsCard } from './SettingsCard'

const timeInputClass = 'mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'

interface AttendanceSettingsCardProps {
  value: AttendanceSettings
  saving: boolean
  onChange: (value: AttendanceSettings) => void
  onSave: () => void
}

export function AttendanceSettingsCard({ value, saving, onChange, onSave }: AttendanceSettingsCardProps) {
  const update = <K extends keyof AttendanceSettings>(key: K, next: AttendanceSettings[K]) => onChange({ ...value, [key]: next })
  return (
    <SettingsCard title="Attendance Settings" description="Set the daily attendance window and rules for late arrivals." icon={<CalendarClock size={19} />} saving={saving} onSave={onSave}>
      <div className="grid gap-4 py-4 sm:grid-cols-2">
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300"><span className="flex items-center gap-1.5"><Clock3 size={13} />School start time</span><input type="time" value={value.schoolStartTime} onChange={(event) => update('schoolStartTime', event.target.value)} className={timeInputClass} /></label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Attendance start time<input type="time" value={value.attendanceStartTime} onChange={(event) => update('attendanceStartTime', event.target.value)} className={timeInputClass} /></label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300"><span className="flex items-center gap-1.5"><AlarmClock size={13} />Late threshold</span><input type="time" value={value.lateThreshold} onChange={(event) => update('lateThreshold', event.target.value)} className={timeInputClass} /></label>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Attendance end time<input type="time" value={value.attendanceEndTime} onChange={(event) => update('attendanceEndTime', event.target.value)} className={timeInputClass} /></label>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800"><ToggleSwitch id="allow-late-attendance" label="Allow late attendance" description="Record attendance after the late threshold and mark the entry as late." checked={value.allowLateAttendance} onChange={(checked) => update('allowLateAttendance', checked)} /></div>
      <p className="pb-4 text-[10px] leading-4 text-slate-400">Attendance start must be at or before school start. The late threshold must be after school start and before attendance end.</p>
    </SettingsCard>
  )
}
