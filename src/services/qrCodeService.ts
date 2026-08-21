import { studentService } from './studentService'
import type { StudentQRCode } from '../types/qrCode'

// ---------------------------------------------------------------------------
// QR Code Management service (mock frontend implementation).
//
// Replace the in-memory store below with PHP API calls when the backend is
// ready. Keep the same method signatures so the view layer does not change:
//
//   React  →  qrCodeService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

/**
 * QR code records keyed by student id.  Initially seeded from the static
 * mock data, but kept in sync with the student service so that newly
 * registered students automatically appear here.
 */
let records: StudentQRCode[] = []

const delay = (milliseconds = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_PREFIX = 'ATD-26-'

function generateUniqueValue(): string {
  const used = new Set(records.map((record) => record.qrValue).filter(Boolean))
  let value = ''
  do {
    const suffix = Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
    value = `${CODE_PREFIX}${suffix}`
  } while (used.has(value))
  return value
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export const qrCodeService = {
  /** Returns a snapshot of every student with their QR code state. */
  async list(): Promise<StudentQRCode[]> {
    await delay()

    // Fetch the current student list from the single source of truth.
    const students = await studentService.list()

    // Index existing QR records by student id so we preserve generated state.
    const qrByStudentId = new Map(records.map((record) => [record.id, record]))

    // Build the merged list — one entry per student, preserving any QR data
    // that was previously generated for that student.
    const merged: StudentQRCode[] = students.map((student) => {
      const existing = qrByStudentId.get(student.id)
      if (existing) {
        // Student already had a QR record — keep it and refresh display fields.
        return { ...existing, name: `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}` }
      }
      // Newly registered student with no QR record yet.
      return {
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`,
        initials: `${student.firstName[0]}${student.lastName[0]}`,
        avatarColor: student.avatarColor,
        photo: student.photo,
        course: student.course,
        courseCode: student.courseCode,
        yearLevel: student.yearLevel,
        section: student.section,
        status: 'Not Generated' as const,
        qrValue: null,
        generatedAt: null,
      }
    })

    // Sync the internal records cache so generate/regenerate stay consistent.
    records = merged.map((record) => ({ ...record }))

    return records.map((record) => ({ ...record }))
  },

  /** Generates a unique QR code payload for a student who does not have one yet. */
  async generate(studentId: string): Promise<StudentQRCode> {
    await delay()
    const current = records.find((record) => record.id === studentId)
    if (!current) throw new Error('Student record was not found.')

    const updated: StudentQRCode = {
      ...current,
      status: 'Generated',
      qrValue: generateUniqueValue(),
      generatedAt: today(),
    }
    records = records.map((record) => (record.id === studentId ? updated : record))
    return { ...updated }
  },

  /** Replaces an existing QR code with a brand-new unique payload. */
  async regenerate(studentId: string): Promise<StudentQRCode> {
    await delay()
    const current = records.find((record) => record.id === studentId)
    if (!current) throw new Error('Student record was not found.')

    const updated: StudentQRCode = {
      ...current,
      qrValue: generateUniqueValue(),
      generatedAt: today(),
    }
    records = records.map((record) => (record.id === studentId ? updated : record))
    return { ...updated }
  },
}
