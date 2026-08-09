// Mock attendance history for the Attendance Records module.
//
// Records are generated deterministically from the existing student dataset so
// every entry is consistent with Student Management, QR Codes, and RFID. The
// attendanceService additionally merges live records created by Attendance
// Monitoring into the history at read time (see attendanceRecordsService.list).
import { mockStudents } from './studentData'
import type { AttendanceMethod, AttendanceStatus } from '../types/dashboard'
import type { AttendanceRecord, ScannedStudent } from '../types/attendance'
import type { Student } from '../types/student'

/** Student indexes to draw records from (covers every course in the dataset). */
const STUDENT_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 23, 29, 35, 41, 47, 55, 61, 71]

const DATES = ['2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09']

const CHECK_INS: { time: string; status: AttendanceStatus }[] = [
  { time: '07:42 AM', status: 'Present' },
  { time: '07:55 AM', status: 'Present' },
  { time: '08:03 AM', status: 'Late' },
  { time: '07:36 AM', status: 'Present' },
  { time: '08:14 AM', status: 'Late' },
  { time: '07:58 AM', status: 'Present' },
  { time: '08:47 AM', status: 'Late' },
  { time: '07:29 AM', status: 'Present' },
]

/** Status rotation that also produces Absent and Excused records. */
const STATUS_POOL: AttendanceStatus[] = [
  'Present', 'Present', 'Late', 'Present', 'Present', 'Late', 'Absent', 'Present', 'Excused', 'Present',
]

export function dateLabelFromISO(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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

export function seedAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = []

  STUDENT_INDEXES.forEach((studentIndex, i) => {
    const student = mockStudents[studentIndex]
    const slotCount = i % 6 === 0 ? 2 : 1

    for (let slot = 0; slot < slotCount; slot += 1) {
      const date = DATES[(i + slot) % DATES.length]
      const status = STATUS_POOL[(i * 3 + slot) % STATUS_POOL.length]
      const isNoCheckIn = status === 'Absent' || status === 'Excused'
      const time = isNoCheckIn ? '—' : CHECK_INS[(i + slot) % CHECK_INS.length].time
      const method: AttendanceMethod = (i + slot) % 2 === 0 ? 'QR Code' : 'RFID'

      records.push({
        id: `rec-${student.id}-${slot}`,
        student: toScannedStudent(student),
        method,
        date,
        dateLabel: dateLabelFromISO(date),
        time,
        status,
      })
    }
  })

  return records
}
