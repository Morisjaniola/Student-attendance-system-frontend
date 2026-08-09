import type { AttendanceMethod, AttendanceStatus } from './dashboard'
import type { ScannedStudent } from './attendance'

/**
 * Notifications module types (9. Notifications).
 *
 * A notification is derived from an attendance record (section 15):
 *   QR/RFID scan -> Attendance Monitoring -> Attendance Record -> Notification.
 * It deliberately reuses the ScannedStudent identity snapshot so the student
 * context (name, ID, course, section) matches every other module.
 */

export type AppNotificationType = 'Late Student' | 'Attendance Confirmation'

/** Simple filter allowed by section 11 (no advanced search). */
export type NotificationFilter = 'All' | 'Unread' | AppNotificationType

export interface AppNotification {
  id: string
  type: AppNotificationType
  title: string
  description: string
  /** ISO date (e.g. 2026-08-09) used for sorting. */
  date: string
  /** Human date label, e.g. August 9, 2026. */
  dateLabel: string
  /** Arrival / recording time, e.g. 8:15 AM. */
  time: string
  /** Read state as generated; the store overlays local read/unread toggles. */
  unread: boolean
  /** Student identity snapshot (name, studentId, courseCode, section, avatar…). */
  student: ScannedStudent
  /** How the attendance was recorded (Attendance Confirmation only). */
  method?: AttendanceMethod
  /** Recorded status (Attendance Confirmation only; Present or Late). */
  status?: AttendanceStatus
}
