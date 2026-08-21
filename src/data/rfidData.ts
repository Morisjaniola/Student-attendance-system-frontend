import { mockStudents } from './studentData'
import type { RFIDCard, RFIDStatus } from '../types/rfid'

// Realistic RFID card records. Assigned cards use the student's rfidNumber
// as the cardNumber so Student Management and RFID Management always show
// the same value.  Additional unassigned cards are generated in the same
// XX:XX:XX:XX:XX format.

const ASSIGNED_COUNT = 15
const UNASSIGNED_COUNT = 6

function randomHex(): string {
  return Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
}

function generateCardNumber(): string {
  return `${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`
}

function fullName(student: (typeof mockStudents)[number]) {
  return `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`
}

// Collect all student RFID numbers already in use so unassigned cards never clash.
const usedRfidNumbers = new Set(mockStudents.filter((s) => s.rfidNumber).map((s) => s.rfidNumber))

function uniqueUnassignedCardNumber(): string {
  let candidate: string
  let attempts = 0
  do {
    candidate = generateCardNumber()
    attempts++
  } while (usedRfidNumbers.has(candidate) && attempts < 50)
  usedRfidNumbers.add(candidate)
  return candidate
}

export const initialRFIDCards: RFIDCard[] = [
  // Assigned cards — cardNumber matches the student's rfidNumber (source of truth).
  ...mockStudents.slice(0, ASSIGNED_COUNT).map((student, index) => {
    const status: RFIDStatus = (index + 1) % 6 === 0 ? 'Inactive' : 'Active'
    return {
      id: `rfid-${index + 1}`,
      cardNumber: student.rfidNumber,
      status,
      registeredAt: student.registeredAt,
      studentId: student.studentId,
      studentName: fullName(student),
      avatarColor: student.avatarColor,
      photo: student.photo,
      courseCode: student.courseCode,
      course: student.course,
      yearLevel: student.yearLevel,
      section: student.section,
    }
  }),
  // Unassigned cards — generated in the same format but unique.
  ...Array.from({ length: UNASSIGNED_COUNT }, (_, index) => ({
    id: `rfid-${ASSIGNED_COUNT + index + 1}`,
    cardNumber: uniqueUnassignedCardNumber(),
    status: 'Unassigned' as const,
    registeredAt: `2026-08-0${index + 1}`,
    studentId: null,
    studentName: null,
    avatarColor: null,
    photo: null,
    courseCode: null,
    course: null,
    yearLevel: null,
    section: null,
  })),
]
