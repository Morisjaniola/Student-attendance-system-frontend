import { BellRing } from 'lucide-react'
import type { NotificationSettings } from '../../types/settings'
import { ToggleSwitch } from './SettingToggle'
import { SettingsCard } from './SettingsCard'

interface NotificationSettingsCardProps {
  value: NotificationSettings
  saving: boolean
  onChange: (value: NotificationSettings) => void
  onSave: () => void
}

export function NotificationSettingsCard({ value, saving, onChange, onSave }: NotificationSettingsCardProps) {
  const update = <K extends keyof NotificationSettings>(key: K, next: NotificationSettings[K]) => onChange({ ...value, [key]: next })
  return (
    <SettingsCard title="Notification Settings" description="Control attendance alerts while remaining compatible with the existing Notifications module." icon={<BellRing size={19} />} saving={saving} onSave={onSave}>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <ToggleSwitch id="system-notifications" label="Enable notifications" description="Show attendance-related notifications in the application." checked={value.notificationsEnabled} onChange={(checked) => update('notificationsEnabled', checked)} />
        <ToggleSwitch id="late-student-alerts" label="Late student alerts" description="Create an alert when a student is recorded after the late threshold." checked={value.lateStudentAlerts} disabled={!value.notificationsEnabled} onChange={(checked) => update('lateStudentAlerts', checked)} />
        <ToggleSwitch id="attendance-confirmations" label="Attendance confirmation notifications" description="Show a confirmation notification after an attendance entry is recorded." checked={value.attendanceConfirmationNotifications} disabled={!value.notificationsEnabled} onChange={(checked) => update('attendanceConfirmationNotifications', checked)} />
      </div>
      <p className="pb-4 text-[10px] leading-4 text-slate-400">These preferences are stored locally for now and do not alter existing notification records.</p>
    </SettingsCard>
  )
}
