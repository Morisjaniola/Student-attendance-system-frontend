import type { AttendanceMethod, AttendanceStatus } from './dashboard'

/** Student identity snapshot produced after a successful credential lookup. */
export interface ScannedStudent {
  id: string
  studentId: string
  name: string
  initials: string
  avatarColor: string
  photo?: string
  courseCode: string
  course: string
  yearLevel: string
  section: string
}

/** A successfully recorded attendance entry. */
export interface AttendanceRecord {
  id: string
  student: ScannedStudent
  method: AttendanceMethod
  /** ISO date, e.g. 2026-08-09. */
  date: string
  /** Human date label, e.g. August 9, 2026. */
  dateLabel: string
  /** Recorded time, e.g. 10:35 AM. */
  time: string
  status: AttendanceStatus
}

/** The earlier attendance entry that blocks a duplicate scan. */
export interface DuplicateRecord {
  student: ScannedStudent
  dateLabel: string
  time: string
  method: AttendanceMethod
}

export type AttendanceValidationResult =
  | { outcome: 'success'; record: AttendanceRecord }
  | { outcome: 'duplicate'; previous: DuplicateRecord }
  | { outcome: 'invalid'; message: string }
