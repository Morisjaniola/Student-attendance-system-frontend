import { mockStudents } from '../data/studentData'
import type { Student, StudentFormValues, StudentStatus } from '../types/student'

let records = [...mockStudents]
const delay = (milliseconds = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

const fullName = (values: StudentFormValues) => `${values.firstName} ${values.lastName}`.toLowerCase().replace(/\s+/g, '.')

export const studentService = {
  async list(): Promise<Student[]> { await delay(); return records.map((student) => ({ ...student })) },
  async create(values: StudentFormValues): Promise<Student> {
    await delay()
    const course = values.course.split(' · ')
    const newStudent: Student = {
      id: crypto.randomUUID(), ...values, courseCode: course[0] ?? 'NEW', course: course[1] ?? values.course,
      photo: values.photo, avatarColor: 'bg-blue-100 text-blue-700', status: 'Active', registeredAt: new Date().toISOString().slice(0, 10),
      attendance: { attendanceRate: 0, present: 0, late: 0, absent: 0, excused: 0, recent: [] },
      timeline: [{ id: crypto.randomUUID(), title: 'Student registered', description: 'Profile created by the administrator.', date: 'Just now', type: 'registration' }],
    }
    newStudent.email = values.email || `${fullName(values)}@student.attendly.edu`
    records = [newStudent, ...records]
    return newStudent
  },
  async update(id: string, values: StudentFormValues): Promise<Student> {
    await delay()
    const current = records.find((student) => student.id === id)
    if (!current) throw new Error('Student record was not found.')
    const course = values.course.split(' · ')
    const updated: Student = { ...current, ...values, courseCode: course[0] ?? current.courseCode, course: course[1] ?? values.course, timeline: [{ id: crypto.randomUUID(), title: 'Information updated', description: 'Student profile details were updated by an administrator.', date: 'Just now', type: 'status' }, ...current.timeline] }
    records = records.map((student) => student.id === id ? updated : student)
    return updated
  },
  async setStatus(ids: string[], status: StudentStatus): Promise<void> {
    await delay()
    records = records.map((student) => ids.includes(student.id) ? { ...student, status, deletedAt: status === 'Archived' ? new Date().toISOString().slice(0, 10) : undefined, timeline: [{ id: crypto.randomUUID(), title: `Status changed to ${status}`, description: 'Status updated by an administrator.', date: 'Just now', type: 'status' }, ...student.timeline] } : student)
  },
  /** Updates the student's rfidNumber field to keep it in sync with RFID card assignments. */
  async updateRfid(id: string, rfidNumber: string): Promise<Student> {
    await delay()
    const current = records.find((student) => student.id === id)
    if (!current) throw new Error('Student record was not found.')
    const updated: Student = { ...current, rfidNumber }
    records = records.map((student) => (student.id === id ? updated : student))
    return updated
  },
}
