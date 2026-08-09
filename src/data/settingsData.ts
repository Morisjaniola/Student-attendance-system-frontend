import type { SystemSettings } from '../types/settings'

export const defaultSystemSettings: SystemSettings = {
  schoolInformation: {
    schoolName: 'Attendly Academy',
    schoolAddress: '123 University Avenue, Quezon City, Metro Manila',
    contactNumber: '+63 2 8123 4567',
    email: 'info@attendly.edu',
    logoUrl: '',
  },
  attendance: {
    schoolStartTime: '07:30',
    attendanceStartTime: '06:30',
    lateThreshold: '07:45',
    attendanceEndTime: '17:00',
    allowLateAttendance: true,
  },
  qrRfid: {
    qrAttendanceEnabled: true,
    rfidAttendanceEnabled: true,
    allowQrRegeneration: true,
    validateRfid: true,
  },
  notifications: {
    notificationsEnabled: true,
    lateStudentAlerts: true,
    attendanceConfirmationNotifications: true,
  },
  preferences: {
    language: 'English',
    theme: 'System',
    timeFormat: '12-hour',
    dateFormat: 'MM/DD/YYYY',
  },
}
