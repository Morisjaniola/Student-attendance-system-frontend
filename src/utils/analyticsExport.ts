// ---------------------------------------------------------------------------
// Analytics export utilities — reuses the same xlsx / jspdf dynamic import
// pattern already used in attendanceRecordsService and reportsService.
// ---------------------------------------------------------------------------

import type { AttendanceRecord } from '../types/attendance'
import type { jsPDF } from 'jspdf'

const HEADERS = ['Student ID', 'Student Name', 'Course', 'Section', 'Date', 'Time', 'Status']

function rows(records: AttendanceRecord[]): string[][] {
  return records.map((record) => [
    record.student.studentId,
    record.student.name,
    record.student.courseCode,
    record.student.section,
    record.dateLabel,
    record.time,
    record.status,
  ])
}

function fileName(label: string, extension: string): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `analytics-${slug}-${yyyy}${mm}${dd}.${extension}`
}

// ---------------------------------------------------------------------------
// Excel export (xlsx) — mirrors attendanceRecordsService.exportAttendanceExcel.
// ---------------------------------------------------------------------------

export async function exportAnalyticsExcel(records: AttendanceRecord[], label: string): Promise<void> {
  if (!records.length) return
  const XLSX = await import('xlsx')
  const data = rows(records)
  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data])
  worksheet['!cols'] = HEADERS.map((header, index) => ({ wch: index === 1 ? 26 : Math.max(header.length + 2, 12) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, label)
  XLSX.writeFile(workbook, fileName(label, 'xlsx'))
}

// ---------------------------------------------------------------------------
// PDF export (jspdf) — mirrors attendanceRecordsService.exportAttendancePDF.
// ---------------------------------------------------------------------------

function lastTableY(doc: jsPDF) {
  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 30
}

export async function exportAnalyticsPDF(records: AttendanceRecord[], label: string): Promise<void> {
  if (!records.length) return
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const exportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(15, 23, 42)
  doc.text('Student Attendance Monitoring System', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)
  doc.text(`Attendance Analytics — ${label}`, 14, 23)

  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text(`Export Date: ${exportDate}`, pageWidth - 14, 23, { align: 'right' })

  autoTable(doc, {
    head: [HEADERS],
    body: rows(records),
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [29, 78, 216], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
  })

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(`Total records: ${records.length}`, 14, lastTableY(doc) + 8)
  doc.save(fileName(label, 'pdf'))
}

// ---------------------------------------------------------------------------
// CSV export — lightweight, no external library.
// ---------------------------------------------------------------------------

export function exportAnalyticsCSV(records: AttendanceRecord[], label: string): void {
  if (!records.length) return
  const data = rows(records)
  const csv = [HEADERS.join(','), ...data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName(label, 'csv')
  link.click()
  URL.revokeObjectURL(url)
}
