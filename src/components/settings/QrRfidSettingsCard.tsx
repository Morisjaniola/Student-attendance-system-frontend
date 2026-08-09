import { Contact, QrCode } from 'lucide-react'
import type { QrRfidSettings } from '../../types/settings'
import { SettingToggle } from './SettingToggle'
import { SettingsCard } from './SettingsCard'

interface QrRfidSettingsCardProps {
  value: QrRfidSettings
  saving: boolean
  onChange: (value: QrRfidSettings) => void
  onSave: () => void
}

export function QrRfidSettingsCard({ value, saving, onChange, onSave }: QrRfidSettingsCardProps) {
  const update = <K extends keyof QrRfidSettings>(key: K, next: QrRfidSettings[K]) => onChange({ ...value, [key]: next })
  return (
    <SettingsCard title="QR / RFID Settings" description="Choose which attendance credentials can be used. No hardware integration is configured here." icon={<QrCode size={19} />} saving={saving} onSave={onSave}>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <SettingToggle id="qr-attendance" label="Enable QR Code attendance" description="Allow students to check in through a generated QR Code." checked={value.qrAttendanceEnabled} onChange={(checked) => update('qrAttendanceEnabled', checked)} />
        <SettingToggle id="rfid-attendance" label="Enable RFID attendance" description="Allow students to check in using registered RFID cards." checked={value.rfidAttendanceEnabled} onChange={(checked) => update('rfidAttendanceEnabled', checked)} />
        <SettingToggle id="qr-regeneration" label="Allow QR Code regeneration" description="Permit approved staff to regenerate a student's QR Code when needed." checked={value.allowQrRegeneration} disabled={!value.qrAttendanceEnabled} onChange={(checked) => update('allowQrRegeneration', checked)} />
        <SettingToggle id="rfid-validation" label="Validate RFID cards" description="Check that a scanned card is registered before recording attendance." checked={value.validateRfid} disabled={!value.rfidAttendanceEnabled} onChange={(checked) => update('validateRfid', checked)} />
      </div>
      <p className="flex items-center gap-1.5 pb-4 text-[10px] leading-4 text-slate-400"><Contact size={12} />These options only configure the frontend mock; they do not connect to QR scanners or RFID hardware.</p>
    </SettingsCard>
  )
}
