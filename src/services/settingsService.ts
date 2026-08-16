import { defaultSystemSettings } from '../data/settingsData'
import type { AttendanceSettings, NotificationSettings, QrRfidSettings, SchoolInformation, SystemPreferences, SystemSettings } from '../types/settings'

const SETTINGS_STORAGE_KEY = 'attendance_system_settings'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/**
 * Single source of truth for persisted settings. The zustand settings store
 * (reactive state) and every service that needs current rules read from here,
 * so all modules always agree on the latest saved configuration.
 */
export function readStoredSettings(): SystemSettings {
  if (typeof window === 'undefined') return clone(defaultSystemSettings)
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return clone(defaultSystemSettings)
    return { ...clone(defaultSystemSettings), ...JSON.parse(stored) } as SystemSettings
  } catch {
    return clone(defaultSystemSettings)
  }
}

export function persistSystemSettings(next: SystemSettings): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
}

const delay = (milliseconds = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const asMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

function validateSchoolInformation(values: SchoolInformation): string | null {
  if (!values.schoolName.trim()) return 'School name is required.'
  if (!values.schoolAddress.trim()) return 'School address is required.'
  if (!values.contactNumber.trim()) return 'Contact number is required.'
  if (!values.email.trim()) return 'School email is required.'
  if (!EMAIL_PATTERN.test(values.email.trim())) return 'Enter a valid school email address.'
  return null
}

function validateAttendance(values: AttendanceSettings): string | null {
  const times = [values.attendanceStartTime, values.schoolStartTime, values.lateThreshold, values.attendanceEndTime]
  if (!times.every((time) => TIME_PATTERN.test(time))) return 'Enter all times in a valid 24-hour format.'
  const [attendanceStart, schoolStart, lateThreshold, attendanceEnd] = times.map(asMinutes)
  if (attendanceStart > schoolStart) return 'Attendance start time must be at or before school start time.'
  if (lateThreshold < schoolStart) return 'Late threshold must be at or after school start time.'
  if (lateThreshold >= attendanceEnd) return 'Late threshold must be before attendance end time.'
  return null
}

export const settingsService = {
  async get(): Promise<SystemSettings> {
    await delay()
    return clone(readStoredSettings())
  },

  async saveSchoolInformation(values: SchoolInformation): Promise<SchoolInformation> {
    await delay()
    const error = validateSchoolInformation(values)
    if (error) throw new Error(error)
    const next: SystemSettings = {
      ...readStoredSettings(),
      schoolInformation: { ...values, schoolName: values.schoolName.trim(), schoolAddress: values.schoolAddress.trim(), contactNumber: values.contactNumber.trim(), email: values.email.trim() },
    }
    persistSystemSettings(next)
    return clone(next.schoolInformation)
  },

  async saveAttendance(values: AttendanceSettings): Promise<AttendanceSettings> {
    await delay()
    const error = validateAttendance(values)
    if (error) throw new Error(error)
    const next: SystemSettings = { ...readStoredSettings(), attendance: { ...values } }
    persistSystemSettings(next)
    return clone(next.attendance)
  },

  async saveQrRfid(values: QrRfidSettings): Promise<QrRfidSettings> {
    await delay()
    const next: SystemSettings = { ...readStoredSettings(), qrRfid: { ...values } }
    persistSystemSettings(next)
    return clone(next.qrRfid)
  },

  async saveNotifications(values: NotificationSettings): Promise<NotificationSettings> {
    await delay()
    const next: SystemSettings = { ...readStoredSettings(), notifications: { ...values } }
    persistSystemSettings(next)
    return clone(next.notifications)
  },

  async savePreferences(values: SystemPreferences): Promise<SystemPreferences> {
    await delay()
    const next: SystemSettings = { ...readStoredSettings(), preferences: { ...values } }
    persistSystemSettings(next)
    return clone(next.preferences)
  },
}
