import type { AttendanceRecord } from './attendance'
import type { AttendanceTrendPoint } from './dashboard'

/**
 * Analytics module types (8. Analytics).
 *
 * Deliberately reuses the attendance record structure created by Attendance
 * Monitoring / Attendance Records — the analytics module does NOT define its
 * own record shape (section 7: QR/RFID -> Monitoring -> Records -> Analytics).
 */

/** Analytics-relevant filters only (section 6): date range, course, section. */
export interface AnalyticsFilters {
  /** ISO date (e.g. 2026-08-04) or '' for no lower bound. */
  dateFrom: string
  /** ISO date (e.g. 2026-08-09) or '' for no upper bound. */
  dateTo: string
  /** Course code (e.g. BSIT) or 'All'. */
  course: string
  /** Section (e.g. A) or 'All'. */
  section: string
}

export const EMPTY_ANALYTICS_FILTERS: AnalyticsFilters = {
  dateFrom: '',
  dateTo: '',
  course: 'All',
  section: 'All',
}

/** Quick date range presets for the Present vs Absent card. */
export type DatePreset = 'Today' | 'This Week' | 'This Month' | 'Custom'

/** Counts per attendance status (requirement 8.1). */
export interface AttendanceStatistics {
  total: number
  present: number
  absent: number
  late: number
  excused: number
}

/** Present vs Absent totals (requirement 8.3). */
export interface PresentAbsentComparison {
  present: number
  absent: number
}

/** Enhanced comparison detail with percentages and period comparison. */
export interface PresentAbsentDetail {
  present: number
  absent: number
  presentPercentage: number
  absentPercentage: number
  total: number
  /** Previous period change for present (percentage points). */
  presentDelta: number | null
  /** Previous period change for absent (percentage points). */
  absentDelta: number | null
}

/** Attendance health levels. */
export type AttendanceHealthLevel = 'Good' | 'Needs Attention' | 'Critical'

/** Attendance health indicator. */
export interface AttendanceHealth {
  level: AttendanceHealthLevel
  percentage: number
  /** Human-readable description of the health level. */
  description: string
}

/** Late attendance analysis (requirement 8.4) — based on records, not unique students. */
export interface LateAttendanceAnalysis {
  totalLate: number
  /** Late records / total records x 100 (0-100, never NaN/Infinity). */
  latePercentage: number
  /** Daily late counts, oldest first. Reuses the shared trend point shape. */
  trend: AttendanceTrendPoint[]
}

/** Overall attendance percentage (requirement 8.5). */
export interface AttendancePercentage {
  /** Present records / total records x 100 (0-100, never NaN/Infinity). */
  rate: number
  present: number
  total: number
}

/** Everything the Analytics page renders, computed from the filtered records. */
export interface AnalyticsData {
  statistics: AttendanceStatistics
  /** Daily Present/Absent/Late counts, oldest first (requirement 8.2). */
  trend: AttendanceTrendPoint[]
  comparison: PresentAbsentComparison
  /** Enhanced present vs absent detail with percentages and deltas. */
  comparisonDetail: PresentAbsentDetail
  /** Attendance health indicator. */
  health: AttendanceHealth
  late: LateAttendanceAnalysis
  percentage: AttendancePercentage
  /** Number of distinct school days in the filtered set. */
  days: number
  /** Course codes available in the dataset (unfiltered) — for filter options. */
  courses: string[]
  /** Section labels available in the dataset (unfiltered) — for filter options. */
  sections: string[]
  /** Filtered attendance records for drill-down and export. */
  records: AttendanceRecord[]
}
