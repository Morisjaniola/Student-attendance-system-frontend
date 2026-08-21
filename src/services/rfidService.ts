import { initialRFIDCards } from '../data/rfidData'
import { studentService } from './studentService'
import type { RFIDAssignStudent, RFIDCard, RFIDStatus } from '../types/rfid'

// ---------------------------------------------------------------------------
// RFID Management service (mock frontend implementation).
//
// Replace the in-memory store below with PHP API calls when the backend is
// ready. Keep the same method signatures so the view layer does not change:
//
//   React  →  rfidService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

let records: RFIDCard[] = initialRFIDCards.map((record) => ({ ...record }))

const delay = (milliseconds = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function clone(card: RFIDCard): RFIDCard {
  return { ...card }
}

function randomHex(): string {
  return Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
}

export const rfidService = {
  /** Generates a unique RFID card number in XX:XX:XX:XX:XX format. */
  async generateUniqueCardNumber(): Promise<string> {
    await delay()
    // Gather every card number already in use (across all statuses).
    const used = new Set(records.map((r) => r.cardNumber.toLowerCase()))

    // Also check the student directory so a freshly registered student's
    // rfidNumber that hasn't been saved to the RFID store yet is caught.
    const students = await studentService.list()
    for (const s of students) {
      if (s.rfidNumber) used.add(s.rfidNumber.toLowerCase())
    }

    // Retry until unique (astronomically unlikely to need more than one pass).
    let candidate: string
    let attempts = 0
    do {
      candidate = `${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`
      attempts++
    } while (used.has(candidate.toLowerCase()) && attempts < 50)

    if (attempts >= 50) throw new Error('Unable to generate a unique RFID number. Please try again.')
    return candidate
  },

  /** Returns a snapshot of every RFID card record. */
  async list(): Promise<RFIDCard[]> {
    await delay()

    // Sync student info on assigned cards so name / course / section changes
    // made in Student Management are reflected immediately.
    const students = await studentService.list()
    const studentById = new Map(students.map((s) => [s.id, s]))
    const studentByStudentId = new Map(students.map((s) => [s.studentId, s]))

    for (const card of records) {
      if (!card.studentId) continue
      // Try to match by the student's internal id stored in card (via assign)
      const student = studentById.get(card.studentId) ?? studentByStudentId.get(card.studentId)
      if (!student) continue
      const fullName = `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`
      card.studentName = fullName
      card.avatarColor = student.avatarColor
      card.photo = student.photo
      card.courseCode = student.courseCode
      card.course = student.course
      card.yearLevel = student.yearLevel
      card.section = student.section
      // Source of truth: always use the student's rfidNumber so both modules
      // display the same value.
      if (student.rfidNumber) {
        card.cardNumber = student.rfidNumber
      }
    }

    return records.map(clone)
  },

  /** Registers a brand-new RFID card. New cards start as Unassigned. */
  async register(cardNumber: string): Promise<RFIDCard> {
    await delay()
    const number = cardNumber.trim()
    if (!number) throw new Error('Enter an RFID card number.')
    if (records.some((record) => record.cardNumber.toLowerCase() === number.toLowerCase())) {
      throw new Error('This RFID card number is already registered.')
    }

    const created: RFIDCard = {
      id: crypto.randomUUID(),
      cardNumber: number,
      status: 'Unassigned',
      registeredAt: today(),
      studentId: null,
      studentName: null,
      avatarColor: null,
      photo: null,
      courseCode: null,
      course: null,
      yearLevel: null,
      section: null,
    }
    records = [created, ...records]
    return clone(created)
  },

  /** Assigns an unassigned card to a student. */
  async assign(cardId: string, student: RFIDAssignStudent): Promise<RFIDCard> {
    await delay()
    const current = records.find((record) => record.id === cardId)
    if (!current) throw new Error('RFID card record was not found.')
    if (current.status === 'Active') throw new Error('This RFID card is already assigned to a student.')
    if (current.status === 'Inactive') throw new Error('An inactive RFID card cannot be assigned. Activate the card first.')
    if (records.some((record) => record.status === 'Active' && record.studentId === student.studentId)) {
      throw new Error('This student already has an active RFID card.')
    }

    const updated: RFIDCard = {
      ...current,
      status: 'Active',
      studentId: student.studentId,
      studentName: student.name,
      avatarColor: student.avatarColor,
      courseCode: student.courseCode,
      course: student.course,
      yearLevel: student.yearLevel,
      section: student.section,
    }
    records = records.map((record) => (record.id === cardId ? updated : record))

    // Sync the student's rfidNumber so Student Management reflects the assignment.
    await studentService.updateRfid(student.id, current.cardNumber)

    return clone(updated)
  },

  /** Replaces a student's lost/damaged card: the old card is disabled and the new one takes over the assignment. */
  async replace(cardId: string, newCardNumber: string): Promise<RFIDCard> {
    await delay()
    const current = records.find((record) => record.id === cardId)
    if (!current) throw new Error('RFID card record was not found.')
    if (!current.studentId) throw new Error('Only cards assigned to a student can be replaced.')

    const number = newCardNumber.trim()
    if (!number) throw new Error('Enter the new RFID card number.')
    // Strict uniqueness across ALL records, including the card being replaced:
    // a new card must never share a number with any existing record.
    if (records.some((record) => record.cardNumber.toLowerCase() === number.toLowerCase())) {
      throw new Error('This RFID card number is already registered.')
    }

    const deactivated: RFIDCard = {
      ...current,
      status: 'Inactive',
      studentId: null,
      studentName: null,
      avatarColor: null,
      photo: null,
      courseCode: null,
      course: null,
      yearLevel: null,
      section: null,
    }
    const replacement: RFIDCard = {
      id: crypto.randomUUID(),
      cardNumber: number,
      status: 'Active',
      registeredAt: today(),
      studentId: current.studentId,
      studentName: current.studentName,
      avatarColor: current.avatarColor,
      photo: current.photo,
      courseCode: current.courseCode,
      course: current.course,
      yearLevel: current.yearLevel,
      section: current.section,
    }
    records = [...records.map((record) => (record.id === cardId ? deactivated : record)), replacement]

    // Sync the student's rfidNumber with the new card number.
    const students = await studentService.list()
    const studentRecord = students.find((s) => s.studentId === current.studentId)
    if (studentRecord) {
      await studentService.updateRfid(studentRecord.id, newCardNumber)
    }

    return clone(replacement)
  },

  /** Activates or deactivates an RFID card. */
  async setStatus(cardId: string, status: Exclude<RFIDStatus, 'Unassigned'>): Promise<RFIDCard> {
    await delay()
    const current = records.find((record) => record.id === cardId)
    if (!current) throw new Error('RFID card record was not found.')

    if (status === 'Inactive') {
      if (current.status === 'Inactive') throw new Error('This RFID card is already inactive.')
      const updated: RFIDCard = { ...current, status: 'Inactive' }
      records = records.map((record) => (record.id === cardId ? updated : record))
      return clone(updated)
    }

    // Activate.
    if (current.status === 'Active') throw new Error('This RFID card is already active.')
    if (current.status === 'Unassigned') throw new Error('This RFID card is already unassigned and enabled.')
    const updated: RFIDCard = { ...current, status: current.studentId ? 'Active' : 'Unassigned' }
    records = records.map((record) => (record.id === cardId ? updated : record))
    return clone(updated)
  },
}
