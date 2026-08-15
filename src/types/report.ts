import type { AttendanceRecord } from './attendance'
import type { AttendanceStatus } from './dashboard'

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'student' | 'course'

export interface ReportFilters {
  type: ReportType
  date: string
  dateFrom: string
  dateTo: string
  month: string
  studentId: string
  course: string
  section: string
  status: AttendanceStatus | 'All'
}

export interface ReportSummary {
  total: number
  students: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

export interface ReportOptions {
  students: { id: string; studentId: string; name: string }[]
  courses: string[]
  sections: string[]
}

export interface ReportResult {
  records: AttendanceRecord[]
  summary: ReportSummary
  options: ReportOptions
  /** A human-friendly period label for headings, exports, and printing. */
  periodLabel: string
  validDateRange: boolean
}

export const EMPTY_REPORT_FILTERS: ReportFilters = {
  type: 'daily',
  date: '',
  dateFrom: '',
  dateTo: '',
  month: '',
  studentId: 'All',
  course: 'All',
  section: 'All',
  status: 'All',
}
