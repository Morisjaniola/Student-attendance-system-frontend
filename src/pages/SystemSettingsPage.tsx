import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, LoaderCircle, Settings2, ShieldAlert, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AttendanceSettingsCard } from '../components/settings/AttendanceSettingsCard'
import { NotificationSettingsCard } from '../components/settings/NotificationSettingsCard'
import { QrRfidSettingsCard } from '../components/settings/QrRfidSettingsCard'
import { SchoolInformationCard } from '../components/settings/SchoolInformationCard'
import { SystemPreferencesCard } from '../components/settings/SystemPreferencesCard'
import { settingsService } from '../services/settingsService'
import { useSettingsStore } from '../stores/settingsStore'
import type { AttendanceSettings, NotificationSettings, QrRfidSettings, SchoolInformation, SystemPreferences, SystemSettings } from '../types/settings'

type Notice = { tone: 'success' | 'error'; message: string }

export function SystemSettingsPage() {
  const queryClient = useQueryClient()
  const setThemePreference = useSettingsStore((state) => state.setThemePreference)
  const [draft, setDraft] = useState<SystemSettings | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const { data, isPending, isError } = useQuery({ queryKey: ['system-settings'], queryFn: settingsService.get, staleTime: Infinity })

  useEffect(() => { if (data) setDraft(data) }, [data])
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['system-settings'] }) }
  const showError = (error: unknown) => setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to save settings. Please try again.' })

  const schoolMutation = useMutation({ mutationFn: (value: SchoolInformation) => settingsService.saveSchoolInformation(value), onSuccess: async () => { await refresh(); setNotice({ tone: 'success', message: 'School information saved successfully.' }) }, onError: showError })
  const attendanceMutation = useMutation({ mutationFn: (value: AttendanceSettings) => settingsService.saveAttendance(value), onSuccess: async () => { await refresh(); setNotice({ tone: 'success', message: 'Attendance settings saved successfully.' }) }, onError: showError })
  const qrRfidMutation = useMutation({ mutationFn: (value: QrRfidSettings) => settingsService.saveQrRfid(value), onSuccess: async () => { await refresh(); setNotice({ tone: 'success', message: 'QR / RFID settings saved successfully.' }) }, onError: showError })
  const notificationsMutation = useMutation({ mutationFn: (value: NotificationSettings) => settingsService.saveNotifications(value), onSuccess: async () => { await refresh(); setNotice({ tone: 'success', message: 'Notification settings saved successfully.' }) }, onError: showError })
  const preferencesMutation = useMutation({ mutationFn: (value: SystemPreferences) => settingsService.savePreferences(value), onSuccess: async (preferences) => { setThemePreference(preferences.theme); await refresh(); setNotice({ tone: 'success', message: 'System preferences saved successfully.' }) }, onError: showError })

  if (isPending || !draft) return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading system settings…</p></div>
  if (isError) return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />System settings could not be loaded. Please refresh and try again.</div></div>

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Configuration</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">System Settings</h1>
          <p className="mt-1.5 text-sm text-slate-500">Configure school details, attendance rules, credential options, and system preferences.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Settings2 size={13} />Frontend mock settings</span>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SchoolInformationCard value={draft.schoolInformation} saving={schoolMutation.isPending} onChange={(schoolInformation) => setDraft((prev) => (prev ? { ...prev, schoolInformation } : prev))} onSave={() => schoolMutation.mutate(draft.schoolInformation)} />
        <AttendanceSettingsCard value={draft.attendance} saving={attendanceMutation.isPending} onChange={(attendance) => setDraft((prev) => (prev ? { ...prev, attendance } : prev))} onSave={() => attendanceMutation.mutate(draft.attendance)} />
        <QrRfidSettingsCard value={draft.qrRfid} saving={qrRfidMutation.isPending} onChange={(qrRfid) => setDraft((prev) => (prev ? { ...prev, qrRfid } : prev))} onSave={() => qrRfidMutation.mutate(draft.qrRfid)} />
        <NotificationSettingsCard value={draft.notifications} saving={notificationsMutation.isPending} onChange={(notifications) => setDraft((prev) => (prev ? { ...prev, notifications } : prev))} onSave={() => notificationsMutation.mutate(draft.notifications)} />
        <div className="xl:col-span-2"><SystemPreferencesCard value={draft.preferences} saving={preferencesMutation.isPending} onChange={(preferences) => setDraft((prev) => (prev ? { ...prev, preferences } : prev))} onSave={() => preferencesMutation.mutate(draft.preferences)} /></div>
      </div>

      {notice && <div className={`fixed bottom-5 right-5 z-80 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-2xl ${notice.tone === 'success' ? 'bg-slate-900 dark:bg-white dark:text-slate-900' : 'bg-rose-600'}`} role="status"><span className="shrink-0">{notice.tone === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <ShieldAlert size={18} />}</span><span className="flex-1">{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification" className="rounded p-1 hover:bg-white/10 dark:hover:bg-slate-100"><X size={15} /></button></div>}
    </div>
  )
}
