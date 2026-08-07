export type StudentStatus = 'Active' | 'Inactive' | 'Suspended' | 'Archived'
export type Gender = 'Male' | 'Female'

export interface Course {
  id: string
  code: string
  name: string
  sections: string[]
}

export interface AttendanceRecord {
  date: string
  time: string
  method: 'QR Code' | 'RFID'
  status: 'Present' | 'Late' | 'Excused' | 'Absent'
  device: string
}

export interface StudentTimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'registration' | 'attendance' | 'status' | 'rfid'
}

export interface AttendanceSummary {
  attendanceRate: number
  present: number
  late: number
  absent: number
  excused: number
  recent: AttendanceRecord[]
}

export interface Student {
  id: string
  studentId: string
  firstName: string
  middleName: string
  lastName: string
  gender: Gender
  birthdate: string
  email: string
  contactNumber: string
  address: string
  course: string
  courseCode: string
  yearLevel: string
  section: string
  guardianName: string
  guardianContact: string
  rfidNumber: string
  qrCode: string
  photo?: string
  avatarColor: string
  status: StudentStatus
  registeredAt: string
  deletedAt?: string
  attendance: AttendanceSummary
  timeline: StudentTimelineEvent[]
}

export interface StudentFormValues {
  studentId: string
  firstName: string
  middleName: string
  lastName: string
  gender: Gender
  birthdate: string
  email: string
  contactNumber: string
  address: string
  course: string
  yearLevel: string
  section: string
  guardianName: string
  guardianContact: string
  rfidNumber: string
  qrCode: string
  photo?: string
}

export interface StudentFiltersState {
  query: string
  course: string
  yearLevel: string
  section: string
  status: StudentStatus | 'All'
  gender: Gender | 'All'
  registeredFrom: string
  registeredTo: string
}
