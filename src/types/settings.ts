export type ThemePreference = 'Light' | 'Dark' | 'System'
export type Language = 'English' | 'Filipino'
export type TimeFormat = '12-hour' | '24-hour'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'

export interface SchoolInformation {
  schoolName: string
  schoolAddress: string
  contactNumber: string
  email: string
  /** Local image data or URL; no asset is sent to a backend in this frontend phase. */
  logoUrl: string
}

export interface AttendanceSettings {
  schoolStartTime: string
  attendanceStartTime: string
  lateThreshold: string
  attendanceEndTime: string
  allowLateAttendance: boolean
}

export interface QrRfidSettings {
  qrAttendanceEnabled: boolean
  rfidAttendanceEnabled: boolean
  allowQrRegeneration: boolean
  validateRfid: boolean
}

export interface NotificationSettings {
  notificationsEnabled: boolean
  lateStudentAlerts: boolean
  attendanceConfirmationNotifications: boolean
}

export interface SystemPreferences {
  language: Language
  theme: ThemePreference
  timeFormat: TimeFormat
  dateFormat: DateFormat
}

export interface SystemSettings {
  schoolInformation: SchoolInformation
  attendance: AttendanceSettings
  qrRfid: QrRfidSettings
  notifications: NotificationSettings
  preferences: SystemPreferences
}
