import { initialRFIDCards } from '../data/rfidData'
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

export const rfidService = {
  /** Returns a snapshot of every RFID card record. */
  async list(): Promise<RFIDCard[]> {
    await delay()
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
