// The export libraries (xlsx, jspdf) are imported dynamically inside the export
// functions so their ~1 MB of code only loads when the user actually exports.
import { attendanceService } from './attendanceService'
import { dateLabelFromISO, seedAttendanceRecords } from '../data/attendanceRecordsData'
import type { AttendanceMethod, AttendanceStatus } from '../types/dashboard'
import type { AttendanceRecord, ScannedStudent } from '../types/attendance'
import type { AuthUser, UserRole } from '../types/auth'
import type { Student } from '../types/student'
import type { jsPDF } from 'jspdf'

// ---------------------------------------------------------------------------
// Attendance Records service (mock frontend implementation).
//
// Replace the in-memory store and client-side file generation below with PHP
// API calls when the backend is ready. Keep the same method signatures so the
// view layer does not change:
//
//   React  →  attendanceRecordsService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

const VALID_STATUSES: AttendanceStatus[] = ['Present', 'Late', 'Excused', 'Absent']
const VALID_METHODS: AttendanceMethod[] = ['QR Code', 'RFID']

/** Editable fields of an attendance record (requirement 6.4). */
export interface AttendanceRecordUpdate {
  student: ScannedStudent
  date: string
  time: string
  status: AttendanceStatus
  method: AttendanceMethod
}

// In-memory history, seeded from mock data. Live records created by Live
// Scanning are merged in at read time so the modules stay connected.
let records: AttendanceRecord[] = seedAttendanceRecords()
const deletedIds = new Set<string>()

const delay = (milliseconds = 250) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

// ---------------------------------------------------------------------------
// Time / date helpers (also used by the edit form).
// ---------------------------------------------------------------------------

/** '07:54 AM' -> 474 minutes after midnight. '—' (no check-in) -> -1. */
export function timeToMinutes(time: string): number {
  if (time === '—' || !time) return -1
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(time)
  if (!match) return -1
  let hours = Number(match[1]) % 12
  if (match[3] === 'PM') hours += 12
  return hours * 60 + Number(match[2])
}

/** '07:54 AM' -> '07:54' (value for <input type="time">). */
export function toTimeInput(time: string): string {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(time)
  if (!match) return '07:30'
  let hours = Number(match[1]) % 12
  if (match[3] === 'PM') hours += 12
  return `${String(hours).padStart(2, '0')}:${match[2]}`
}

/** '07:54' -> '07:54 AM' (display format used across the app). */
export function fromTimeInput(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match) return '07:30 AM'
  let hours = Number(match[1]) % 24
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${match[2]} ${period}`
}

/** Converts a Student profile into the identity snapshot stored in a record. */
export function toScannedStudent(student: Student): ScannedStudent {
  const name = `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`
  return {
    id: student.id,
    studentId: student.studentId,
    name,
    initials: `${student.firstName[0]}${student.lastName[0]}`,
    avatarColor: student.avatarColor,
    photo: student.photo,
    courseCode: student.courseCode,
    course: student.course,
    yearLevel: student.yearLevel,
    section: student.section,
  }
}

// ---------------------------------------------------------------------------
// Authorization (requirement 8).
//
// Kept as a small role -> capability map until the backend RBAC system is
// available; the same function will then consult the API instead.
// ---------------------------------------------------------------------------

export type AttendanceAction = 'edit' | 'delete' | 'export'

const ROLE_CAPABILITIES: Record<UserRole, AttendanceAction[]> = {
  Administrator: ['edit', 'delete', 'export'],
  Faculty: ['edit', 'export'],
  Staff: ['export'],
}

export function canPerformAttendanceAction(user: AuthUser | null, action: AttendanceAction): boolean {
  return Boolean(user && ROLE_CAPABILITIES[user.role]?.includes(action))
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
}

function validatePatch(patch: AttendanceRecordUpdate): string | null {
  if (!patch.student?.studentId || !patch.student?.name) return 'Select a student.'
  if (!isValidISODate(patch.date)) return 'Select a valid date.'
  if (patch.time !== '—' && !/^(0?[1-9]|1[0-2]):[0-5]\d\s(AM|PM)$/.test(patch.time)) return 'Select a valid time.'
  if (!VALID_STATUSES.includes(patch.status)) return 'Select a valid status.'
  if (!VALID_METHODS.includes(patch.method)) return 'Select a valid attendance method.'
  return null
}

export const attendanceRecordsService = {
  /** All history: seeded records plus live records from Live Scanning. */
  async list(): Promise<AttendanceRecord[]> {
    await delay()
    const merged = [...records]
    for (const live of attendanceService.sessionRecordsList()) {
      if (!deletedIds.has(live.id) && !records.some((record) => record.id === live.id)) {
        merged.push(live)
      }
    }
    return merged.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return timeToMinutes(b.time) - timeToMinutes(a.time)
    })
  },

  /** Updates an attendance record (requirement 6.4). Throws on invalid data. */
  async update(id: string, patch: AttendanceRecordUpdate): Promise<AttendanceRecord> {
    await delay()
    const existing = records.find((record) => record.id === id) ?? attendanceService.sessionRecordsList().find((record) => record.id === id)
    if (!existing) throw new Error('Attendance record not found.')

    const error = validatePatch(patch)
    if (error) throw new Error(error)

    const updated: AttendanceRecord = {
      ...existing,
      student: patch.student,
      date: patch.date,
      dateLabel: dateLabelFromISO(patch.date),
      time: patch.time,
      status: patch.status,
      method: patch.method,
    }

    const index = records.findIndex((record) => record.id === id)
    records = index === -1 ? [...records, updated] : records.map((record) => (record.id === id ? updated : record))
    return updated
  },

  /** Deletes an attendance record (requirement 6.5). */
  async remove(id: string): Promise<void> {
    await delay()
    if (!records.some((record) => record.id === id) && !attendanceService.sessionRecordsList().some((record) => record.id === id)) {
      throw new Error('Attendance record not found.')
    }
    records = records.filter((record) => record.id !== id)
    deletedIds.add(id)
  },
}

// ---------------------------------------------------------------------------
// Export (requirement 6.6) — exports the filtered records passed by the page.
// ---------------------------------------------------------------------------

const EXPORT_HEADERS = ['Student ID', 'Student Name', 'Course', 'Year', 'Section', 'Date', 'Time', 'Method', 'Status']

function exportRows(records: AttendanceRecord[]) {
  return records.map((record) => [
    record.student.studentId,
    record.student.name,
    record.student.courseCode,
    record.student.yearLevel,
    record.student.section,
    record.dateLabel,
    record.time,
    record.method,
    record.status,
  ])
}

function exportFileName(extension: 'xlsx' | 'pdf') {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `attendance-records-${yyyy}-${mm}-${dd}.${extension}`
}

export async function exportAttendanceExcel(records: AttendanceRecord[]) {
  const XLSX = await import('xlsx')
  const rows = exportRows(records)
  const worksheet = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...rows])
  worksheet['!cols'] = EXPORT_HEADERS.map((header, index) => ({ wch: index === 1 ? 26 : Math.max(header.length + 2, 12) }))

  // Bold, white-on-blue header row.
  EXPORT_HEADERS.forEach((_, column) => {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: column })]
    if (cell) cell.s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1D4ED8' } } }
  })

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records')
  XLSX.writeFile(workbook, exportFileName('xlsx'))
}

function lastTableY(doc: jsPDF) {
  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 30
}

export async function exportAttendancePDF(records: AttendanceRecord[]) {
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
  doc.text('Attendance Records', 14, 23)

  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text(`Export Date: ${exportDate}`, pageWidth - 14, 23, { align: 'right' })

  autoTable(doc, {
    head: [EXPORT_HEADERS],
    body: exportRows(records),
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [29, 78, 216], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
  })

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(`Total records: ${records.length}`, 14, lastTableY(doc) + 8)
  doc.save(exportFileName('pdf'))
}
