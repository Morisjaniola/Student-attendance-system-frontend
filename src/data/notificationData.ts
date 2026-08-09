// Mock notifications for the Notifications module.
//
// Notifications are derived deterministically from the existing attendance
// records (Attendance Monitoring -> Attendance Record -> Notification, see
// section 15) — there is no separate attendance database:
//
//   - status === 'Late'    -> Late Student Alert (requirement 9.2)
//   - status === 'Present' -> Attendance Confirmation (requirement 9.3)
//
// Absent and Excused records are not scans, so they produce no notification.
// Records from the two most recent school days start unread so the page shows
// a realistic read/unread mix; everything older is read.
import { seedAttendanceRecords } from './attendanceRecordsData'
import type { AppNotification } from '../types/notification'
import type { AttendanceRecord } from '../types/attendance'

export function notificationFromRecord(record: AttendanceRecord, unread: boolean): AppNotification {
  const isLate = record.status === 'Late'
  return {
    id: `notif-${record.id}`,
    type: isLate ? 'Late Student' : 'Attendance Confirmation',
    title: isLate ? 'Late Student Alert' : 'Attendance Recorded',
    description: isLate
      ? `${record.student.name} arrived late at ${record.time}.`
      : `${record.student.name}'s attendance was successfully recorded.`,
    date: record.date,
    dateLabel: record.dateLabel,
    time: record.time,
    unread,
    student: record.student,
    method: record.method,
    status: record.status,
  }
}

export function seedNotifications(): AppNotification[] {
  const records = seedAttendanceRecords()
  const dates = [...new Set(records.map((record) => record.date))].sort().slice(-2)

  return records
    .filter((record) => record.status === 'Late' || record.status === 'Present')
    .map((record) => notificationFromRecord(record, dates.includes(record.date)))
}
