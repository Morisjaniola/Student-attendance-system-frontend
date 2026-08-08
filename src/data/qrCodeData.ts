import { mockStudents } from './studentData'
import type { StudentQRCode } from '../types/qrCode'

// Every 4th student (1-based) starts without a generated QR code so the
// "Generate" flow can be demonstrated alongside the "Regenerate" flow.
const NOT_GENERATED_EVERY = 4

function initials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`
}

export const initialQRCodes: StudentQRCode[] = mockStudents.map((student, index) => {
  const generated = (index + 1) % NOT_GENERATED_EVERY !== 0
  return {
    id: student.id,
    studentId: student.studentId,
    name: `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`,
    initials: initials(student.firstName, student.lastName),
    avatarColor: student.avatarColor,
    photo: student.photo,
    course: student.course,
    courseCode: student.courseCode,
    yearLevel: student.yearLevel,
    section: student.section,
    status: generated ? 'Generated' : 'Not Generated',
    qrValue: generated ? student.qrCode : null,
    generatedAt: generated ? student.registeredAt : null,
  }
})
