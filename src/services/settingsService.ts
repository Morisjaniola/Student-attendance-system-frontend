import { defaultSystemSettings } from '../data/settingsData'
import type { AttendanceSettings, NotificationSettings, QrRfidSettings, SchoolInformation, SystemPreferences, SystemSettings } from '../types/settings'

const SETTINGS_STORAGE_KEY = 'attendance_system_settings'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function readStoredSettings(): SystemSettings {
  if (typeof window === 'undefined') return clone(defaultSystemSettings)
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return clone(defaultSystemSettings)
    return { ...clone(defaultSystemSettings), ...JSON.parse(stored) } as SystemSettings
  } catch {
    return clone(defaultSystemSettings)
  }
}

let settings = readStoredSettings()

function persist() {
  if (typeof window !== 'undefined') window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
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
    return clone(settings)
  },

  async saveSchoolInformation(values: SchoolInformation): Promise<SchoolInformation> {
    await delay()
    const error = validateSchoolInformation(values)
    if (error) throw new Error(error)
    settings = { ...settings, schoolInformation: { ...values, schoolName: values.schoolName.trim(), schoolAddress: values.schoolAddress.trim(), contactNumber: values.contactNumber.trim(), email: values.email.trim() } }
    persist()
    return clone(settings.schoolInformation)
  },

  async saveAttendance(values: AttendanceSettings): Promise<AttendanceSettings> {
    await delay()
    const error = validateAttendance(values)
    if (error) throw new Error(error)
    settings = { ...settings, attendance: { ...values } }
    persist()
    return clone(settings.attendance)
  },

  async saveQrRfid(values: QrRfidSettings): Promise<QrRfidSettings> {
    await delay()
    settings = { ...settings, qrRfid: { ...values } }
    persist()
    return clone(settings.qrRfid)
  },

  async saveNotifications(values: NotificationSettings): Promise<NotificationSettings> {
    await delay()
    settings = { ...settings, notifications: { ...values } }
    persist()
    return clone(settings.notifications)
  },

  async savePreferences(values: SystemPreferences): Promise<SystemPreferences> {
    await delay()
    settings = { ...settings, preferences: { ...values } }
    persist()
    return clone(settings.preferences)
  },
}
