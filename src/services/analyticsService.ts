import { attendanceRecordsService } from './attendanceRecordsService'
import type { AttendanceRecord } from '../types/attendance'
import type { AttendanceTrendPoint } from '../types/dashboard'
import type {
  AnalyticsData,
  AnalyticsFilters,
  AttendanceHealth,
  AttendanceHealthLevel,
  AttendancePercentage,
  AttendanceStatistics,
  LateAttendanceAnalysis,
  PresentAbsentComparison,
  PresentAbsentDetail,
} from '../types/analytics'

// ---------------------------------------------------------------------------
// Analytics service (mock frontend implementation).
//
// All analytics are computed from the existing attendance records (Attendance
// Monitoring -> Attendance Records -> Analytics). Replace the data source below
// with PHP API calls when the backend is ready; the pure functions stay:
//
//   React  →  analyticsService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

/** '2026-08-09' -> 'Aug 9' (compact axis label). */
export function shortDateLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Safe percentage: returns 0 instead of NaN/Infinity when total is 0. */
function percentage(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

// ---------------------------------------------------------------------------
// Pure computation functions (exported for deterministic testing).
// ---------------------------------------------------------------------------

/** Applies the analytics filters (date range, course, section) to records. */
export function filterRecords(records: AttendanceRecord[], filters: AnalyticsFilters): AttendanceRecord[] {
  const course = filters.course.trim()
  const section = filters.section.trim()
  return records.filter((record) => {
    if (filters.dateFrom && record.date < filters.dateFrom) return false
    if (filters.dateTo && record.date > filters.dateTo) return false
    if (course !== 'All' && record.student.courseCode !== course) return false
    if (section !== 'All' && record.student.section !== section) return false
    return true
  })
}

/** Requirement 8.1 — per-status counts. */
export function computeStatistics(records: AttendanceRecord[]): AttendanceStatistics {
  const statistics: AttendanceStatistics = { total: records.length, present: 0, absent: 0, late: 0, excused: 0 }
  for (const record of records) {
    if (record.status === 'Present') statistics.present += 1
    else if (record.status === 'Absent') statistics.absent += 1
    else if (record.status === 'Late') statistics.late += 1
    else statistics.excused += 1
  }
  return statistics
}

/** Requirement 8.2 — daily Present / Absent / Late counts, oldest first. */
export function computeTrend(records: AttendanceRecord[]): AttendanceTrendPoint[] {
  const dates = [...new Set(records.map((record) => record.date))].sort()
  return dates.map((date) => {
    const point: AttendanceTrendPoint = { date: shortDateLabel(date), present: 0, absent: 0, late: 0 }
    for (const record of records) {
      if (record.date !== date) continue
      if (record.status === 'Present') point.present += 1
      else if (record.status === 'Absent') point.absent += 1
      else if (record.status === 'Late') point.late += 1
    }
    return point
  })
}

/** Requirement 8.3 — Present vs Absent totals. */
export function computeComparison(records: AttendanceRecord[]): PresentAbsentComparison {
  let present = 0
  let absent = 0
  for (const record of records) {
    if (record.status === 'Present') present += 1
    else if (record.status === 'Absent') absent += 1
  }
  return { present, absent }
}

/** Requirement 8.4 — late records, late percentage, and the daily late trend. */
export function computeLateAnalysis(records: AttendanceRecord[], statistics: AttendanceStatistics): LateAttendanceAnalysis {
  return {
    totalLate: statistics.late,
    latePercentage: percentage(statistics.late, statistics.total),
    // Reuses the full daily trend; consumers read only the late field.
    trend: computeTrend(records),
  }
}

/** Requirement 8.5 — Present / Total x 100, zero-safe. */
export function computePercentage(records: AttendanceRecord[], statistics: AttendanceStatistics): AttendancePercentage {
  return {
    rate: percentage(statistics.present, statistics.total),
    present: statistics.present,
    total: statistics.total,
  }
}

/** Distinct section labels present in the records, sorted. */
export function sectionOptions(records: AttendanceRecord[]): string[] {
  return [...new Set(records.map((record) => record.student.section))].sort()
}

/** Distinct course codes present in the records, sorted. */
export function courseOptions(records: AttendanceRecord[]): string[] {
  return [...new Set(records.map((record) => record.student.courseCode))].sort()
}

// ---------------------------------------------------------------------------
// Enhanced Present vs Absent computations.
// ---------------------------------------------------------------------------

/** Compute the previous equivalent period date range from the given range. */
function previousPeriod(filters: AnalyticsFilters): { from: string; to: string } | null {
  if (!filters.dateFrom || !filters.dateTo) return null
  const from = new Date(filters.dateFrom + 'T00:00:00')
  const to = new Date(filters.dateTo + 'T00:00:00')
  const duration = to.getTime() - from.getTime()
  const prevTo = new Date(from.getTime() - 86400000) // day before the current range
  const prevFrom = new Date(prevTo.getTime() - duration)
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }
  return { from: fmt(prevFrom), to: fmt(prevTo) }
}

/** Compute enhanced present/absent detail with percentages and period comparison. */
export function computeComparisonDetail(
  current: AttendanceRecord[],
  previous: AttendanceRecord[] | null,
): PresentAbsentDetail {
  const present = current.filter((r) => r.status === 'Present').length
  const absent = current.filter((r) => r.status === 'Absent').length
  const total = present + absent
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0
  const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0

  let presentDelta: number | null = null
  let absentDelta: number | null = null

  if (previous && previous.length > 0) {
    const prevPresent = previous.filter((r) => r.status === 'Present').length
    const prevAbsent = previous.filter((r) => r.status === 'Absent').length
    const prevTotal = prevPresent + prevAbsent
    if (prevTotal > 0) {
      const prevPresentPct = Math.round((prevPresent / prevTotal) * 100)
      const prevAbsentPct = Math.round((prevAbsent / prevTotal) * 100)
      presentDelta = presentPercentage - prevPresentPct
      absentDelta = absentPercentage - prevAbsentPct
    }
  }

  return { present, absent, presentPercentage, absentPercentage, total, presentDelta, absentDelta }
}

/** Compute attendance health indicator. Uses 80% as the Good threshold and 60% as Critical. */
export function computeHealth(presentPercentage: number): AttendanceHealth {
  let level: AttendanceHealthLevel
  let description: string
  if (presentPercentage >= 80) {
    level = 'Good'
    description = 'Attendance rate is healthy'
  } else if (presentPercentage >= 60) {
    level = 'Needs Attention'
    description = 'Attendance rate needs improvement'
  } else {
    level = 'Critical'
    description = 'Attendance rate is critically low'
  }
  return { level, percentage: presentPercentage, description }
}

// ---------------------------------------------------------------------------
// Service entry point (used by the page via react-query).
// ---------------------------------------------------------------------------

export const analyticsService = {
  async fetch(filters: AnalyticsFilters): Promise<AnalyticsData> {
    // Consumes the records produced by Attendance Monitoring / Attendance
    // Records (which already merge live scans into history).
    const all = await attendanceRecordsService.list()
    const records = filterRecords(all, filters)
    const statistics = computeStatistics(records)

    // Previous period records for delta comparison.
    const prevRange = previousPeriod(filters)
    const previousRecords = prevRange ? filterRecords(all, { dateFrom: prevRange.from, dateTo: prevRange.to, course: filters.course, section: filters.section }) : null

    const comparisonDetail = computeComparisonDetail(records, previousRecords)
    const comparison: PresentAbsentComparison = { present: comparisonDetail.present, absent: comparisonDetail.absent }

    return {
      statistics,
      trend: computeTrend(records),
      comparison,
      comparisonDetail,
      health: computeHealth(comparisonDetail.presentPercentage),
      late: computeLateAnalysis(records, statistics),
      percentage: computePercentage(records, statistics),
      days: new Set(records.map((record) => record.date)).size,
      // Filter options always come from the full dataset so they stay
      // selectable even while a filter is active.
      courses: courseOptions(all),
      sections: sectionOptions(all),
      records,
    }
  },
}
