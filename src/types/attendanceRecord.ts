import type { AttendanceRecord } from './attendance'
import type { AttendanceStatus } from './dashboard'

// Reuses the record structure created by Attendance Monitoring (5. Attendance
// Monitoring -> Record Attendance -> Attendance Records). The attendance
// records module deliberately does NOT define its own record shape.
export type { AttendanceRecord }

/** Filter state for the Attendance Records page. Every filter is 'All' or a concrete value. */
export interface AttendanceRecordFilters {
  /** ISO date (e.g. 2026-08-09) or 'All'. */
  date: string
  /** Section (e.g. IT-3A) or 'All'. */
  section: string
  /** Attendance status or 'All'. */
  status: AttendanceStatus | 'All'
  /** Course code (e.g. BSIT) or 'All'. */
  course: string
}

export const EMPTY_ATTENDANCE_FILTERS: AttendanceRecordFilters = {
  date: 'All',
  section: 'All',
  status: 'All',
  course: 'All',
}
