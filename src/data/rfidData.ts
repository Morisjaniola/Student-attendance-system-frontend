import { mockStudents } from './studentData'
import type { RFIDCard, RFIDStatus } from '../types/rfid'

// Realistic RFID card records. Assigned cards are derived from the existing
// student directory so student details always match; additional cards are
// registered but still unassigned. The mix includes assigned, unassigned,
// active, and inactive cards.

const ASSIGNED_COUNT = 15
const UNASSIGNED_COUNT = 6

function cardNumber(index: number) {
  return `RFID-${String(index).padStart(6, '0')}`
}

function fullName(student: (typeof mockStudents)[number]) {
  return `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`
}

export const initialRFIDCards: RFIDCard[] = [
  ...mockStudents.slice(0, ASSIGNED_COUNT).map((student, index) => {
    // Every 6th assigned card starts deactivated so the Activate flow is visible.
    const status: RFIDStatus = (index + 1) % 6 === 0 ? 'Inactive' : 'Active'
    return {
      id: `rfid-${index + 1}`,
      cardNumber: cardNumber(index + 1),
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
  ...Array.from({ length: UNASSIGNED_COUNT }, (_, index) => ({
    id: `rfid-${ASSIGNED_COUNT + index + 1}`,
    cardNumber: cardNumber(ASSIGNED_COUNT + index + 1),
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
