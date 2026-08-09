import { initialQRCodes } from '../data/qrCodeData'
import { initialRFIDCards } from '../data/rfidData'
import { mockStudents } from '../data/studentData'
import type { AttendanceMethod, AttendanceStatus } from '../types/dashboard'
import type { AttendanceRecord, AttendanceValidationResult, DuplicateRecord, ScannedStudent } from '../types/attendance'
import type { Student } from '../types/student'

// ---------------------------------------------------------------------------
// Attendance Monitoring service (mock frontend implementation).
//
// Replace the in-memory session store below with PHP API calls when the
// backend is ready. Keep the same method signatures so the view layer does
// not change:
//
//   React  →  attendanceService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

/** Minutes past midnight after which a scan is marked Late (project rule: after 8:00 AM). */
const LATE_CUTOFF_MINUTES = 8 * 60

/** One attendance record per student for the current session (day). */
let sessionRecords = new Map<string, AttendanceRecord>()

const delay = (milliseconds = 350) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function toScannedStudent(student: Student): ScannedStudent {
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

type ResolvedCredential = { ok: true; student: Student } | { ok: false; message: string }

function resolveQR(qrValue: string): ResolvedCredential {
  const code = initialQRCodes.find((record) => record.qrValue === qrValue)
  if (!code) {
    // The value belongs to a student whose QR code has not been generated yet.
    if (mockStudents.some((student) => student.qrCode === qrValue)) {
      return { ok: false, message: 'QR Code is invalid.' }
    }
    return { ok: false, message: 'Student not found.' }
  }

  const student = mockStudents.find((record) => record.id === code.id)
  if (!student) return { ok: false, message: 'Student not found.' }
  if (student.status !== 'Active') return { ok: false, message: 'Student account is inactive.' }
  return { ok: true, student }
}

function resolveRFID(cardNumber: string): ResolvedCredential {
  const card = initialRFIDCards.find((record) => record.cardNumber === cardNumber)
  if (!card) return { ok: false, message: 'Student not found.' }
  if (!card.studentId) return { ok: false, message: 'RFID card is not assigned.' }
  if (card.status === 'Inactive') return { ok: false, message: 'RFID card is inactive.' }

  const student = mockStudents.find((record) => record.studentId === card.studentId)
  if (!student) return { ok: false, message: 'Student not found.' }
  if (student.status !== 'Active') return { ok: false, message: 'Student account is inactive.' }
  return { ok: true, student }
}

export const attendanceService = {
  /**
   * Validates a scanned credential and records attendance when valid.
   * Returns a discriminated result: success, duplicate, or invalid.
   */
  async recordAttendance(method: AttendanceMethod, credential: string): Promise<AttendanceValidationResult> {
    await delay()

    const value = credential.trim()
    if (!value) return { outcome: 'invalid', message: 'Nothing to scan. Enter a QR code or RFID card number.' }

    const resolved = method === 'RFID' ? resolveRFID(value) : resolveQR(value)
    if (!resolved.ok) return { outcome: 'invalid', message: resolved.message }

    // Prevent duplicate attendance: one record per student per session (day).
    const now = new Date()
    const today = isoDate(now)
    const existing = sessionRecords.get(resolved.student.studentId)
    if (existing && existing.date === today) {
      const previous: DuplicateRecord = {
        student: existing.student,
        dateLabel: existing.dateLabel,
        time: existing.time,
        method: existing.method,
      }
      return { outcome: 'duplicate', previous }
    }

    const minutes = now.getHours() * 60 + now.getMinutes()
    const status: AttendanceStatus = minutes > LATE_CUTOFF_MINUTES ? 'Late' : 'Present'
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      student: toScannedStudent(resolved.student),
      method,
      date: today,
      dateLabel: formatDateLabel(now),
      time: formatTime(now),
      status,
    }
    sessionRecords.set(resolved.student.studentId, record)
    return { outcome: 'success', record }
  },

  /** Counts of today's session, used by the page header. */
  sessionStats(): { dateLabel: string; count: number } {
    const now = new Date()
    const today = isoDate(now)
    const count = [...sessionRecords.values()].filter((record) => record.date === today).length
    return { dateLabel: formatDateLabel(now), count }
  },

  /**
   * Read-only view of the records created in the current session.
   * Consumed by the Attendance Records module so that freshly scanned
   * attendance appears in the records history (see section 16).
   */
  sessionRecordsList(): AttendanceRecord[] {
    return [...sessionRecords.values()]
  },
}
