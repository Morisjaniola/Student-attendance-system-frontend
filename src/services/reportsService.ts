import { attendanceRecordsService } from './attendanceRecordsService'
import type { AttendanceRecord } from '../types/attendance'
import type { ReportFilters, ReportResult, ReportSummary, ReportType } from '../types/report'

function localDate(iso: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', options)
}

export function reportTypeLabel(type: ReportType) {
  return `${type[0].toUpperCase()}${type.slice(1)} Report`
}

export function periodForFilters(filters: ReportFilters) {
  if (filters.type === 'daily') return filters.date ? localDate(filters.date, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Selected date'
  if (filters.type === 'monthly') return filters.month ? localDate(`${filters.month}-01`, { month: 'long', year: 'numeric' }) : 'Selected month'
  if (filters.dateFrom && filters.dateTo) return `${localDate(filters.dateFrom, { month: 'short', day: 'numeric', year: 'numeric' })} – ${localDate(filters.dateTo, { month: 'short', day: 'numeric', year: 'numeric' })}`
  if (filters.dateFrom) return `From ${localDate(filters.dateFrom, { month: 'short', day: 'numeric', year: 'numeric' })}`
  if (filters.dateTo) return `Until ${localDate(filters.dateTo, { month: 'short', day: 'numeric', year: 'numeric' })}`
  return 'All available dates'
}

export function summarizeReport(records: AttendanceRecord[]): ReportSummary {
  const summary: ReportSummary = { total: records.length, students: new Set(records.map((record) => record.student.id)).size, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 0 }
  records.forEach((record) => {
    if (record.status === 'Present') summary.present += 1
    else if (record.status === 'Absent') summary.absent += 1
    else if (record.status === 'Late') summary.late += 1
    else if (record.status === 'Excused') summary.excused += 1
  })
  summary.attendanceRate = summary.total ? Math.round((summary.present / summary.total) * 100) : 0
  return summary
}

/** Builds reports exclusively from Attendance Records, including live QR/RFID scans. */
export function filterReportRecords(records: AttendanceRecord[], filters: ReportFilters): { records: AttendanceRecord[]; validDateRange: boolean } {
  const validDateRange = !(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)
  if (!validDateRange) return { records: [], validDateRange }

  const filtered = records.filter((record) => {
    if (filters.type === 'daily' && filters.date && record.date !== filters.date) return false
    if (filters.type === 'monthly' && filters.month && !record.date.startsWith(filters.month)) return false
    if ((filters.type === 'weekly' || filters.type === 'student' || filters.type === 'course') && filters.dateFrom && record.date < filters.dateFrom) return false
    if ((filters.type === 'weekly' || filters.type === 'student' || filters.type === 'course') && filters.dateTo && record.date > filters.dateTo) return false
    if (filters.type === 'student' && filters.studentId !== 'All' && record.student.id !== filters.studentId) return false
    if (filters.type === 'course' && filters.course !== 'All' && record.student.courseCode !== filters.course) return false
    if (filters.section !== 'All' && record.student.section !== filters.section) return false
    if (filters.status !== 'All' && record.status !== filters.status) return false
    return true
  })
  return { records: filtered, validDateRange }
}

export const reportsService = {
  async fetch(filters: ReportFilters): Promise<ReportResult> {
    const allRecords = await attendanceRecordsService.list()
    const { records, validDateRange } = filterReportRecords(allRecords, filters)
    const uniqueStudents = [...new Map(allRecords.map((record) => [record.student.id, { id: record.student.id, studentId: record.student.studentId, name: record.student.name }])).values()]
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      records,
      summary: summarizeReport(records),
      options: {
        students: uniqueStudents,
        courses: [...new Set(allRecords.map((record) => record.student.courseCode))].sort(),
        sections: [...new Set(allRecords.map((record) => record.student.section))].sort(),
      },
      periodLabel: periodForFilters(filters),
      validDateRange,
    }
  },
}

const exportHeaders = ['Student ID', 'Student', 'Course', 'Section', 'Date', 'Time', 'Status']
const exportRows = (records: AttendanceRecord[]) => records.map((record) => [record.student.studentId, record.student.name, record.student.courseCode, record.student.section, record.dateLabel, record.time, record.status])

export function reportFileName(filters: ReportFilters, records: AttendanceRecord[], extension: 'xlsx' | 'pdf') {
  const selectedStudent = records[0]?.student.studentId ?? 'student'
  const course = filters.course !== 'All' ? filters.course : records[0]?.student.courseCode ?? 'course'
  const suffix = filters.type === 'daily' ? filters.date || 'date' : filters.type === 'monthly' ? filters.month || 'month' : filters.type === 'student' ? selectedStudent : filters.type === 'course' ? course : filters.dateFrom || 'range'
  return `attendance-${filters.type}-${suffix}.${extension}`
}

export async function exportReportExcel(records: AttendanceRecord[], filters: ReportFilters, title: string) {
  const XLSX = await import('xlsx')
  const sheet = XLSX.utils.aoa_to_sheet([[title], exportHeaders, ...exportRows(records)])
  sheet['!cols'] = [16, 26, 14, 12, 24, 12, 12].map((wch) => ({ wch }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Attendance Report')
  XLSX.writeFile(workbook, reportFileName(filters, records, 'xlsx'))
}

export async function exportReportPDF(records: AttendanceRecord[], filters: ReportFilters, title: string, period: string, summary: ReportSummary) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape' })
  const width = doc.internal.pageSize.getWidth()
  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(15, 23, 42)
  doc.text('Student Attendance Monitoring System', 14, 15)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(71, 85, 105)
  doc.text(title, 14, 22); doc.text(period, 14, 28)
  doc.text(`Generated: ${new Date().toLocaleString()}`, width - 14, 22, { align: 'right' })
  doc.text(`Records: ${summary.total}  |  Present: ${summary.present}  |  Absent: ${summary.absent}  |  Late: ${summary.late}  |  Excused: ${summary.excused}  |  Rate: ${summary.attendanceRate}%`, 14, 35)
  autoTable(doc, { head: [exportHeaders], body: exportRows(records), startY: 41, theme: 'grid', headStyles: { fillColor: [29, 78, 216], fontSize: 8 }, styles: { fontSize: 8, cellPadding: 2.5 } })
  doc.save(reportFileName(filters, records, 'pdf'))
}
