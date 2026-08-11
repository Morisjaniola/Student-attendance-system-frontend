import type { LucideIcon } from 'lucide-react'

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent'
export type AttendanceMethod = 'QR Code' | 'RFID'

export interface StatMetric {
  id: string
  title: string
  value: string
  description: string
  change: string
  trend: 'up' | 'down'
  color: 'blue' | 'green' | 'orange' | 'red' | 'violet'
  icon: LucideIcon
}

export interface AttendanceActivity {
  id: string
  studentId: string
  name: string
  initials: string
  avatarColor: string
  course: string
  year: string
  section: string
  method: AttendanceMethod
  timeIn: string
  status: AttendanceStatus
  device: string
}

export interface AttendanceTrendPoint {
  /** ISO date (e.g. 2026-08-09) for period filtering; analytics trend points may omit it. */
  isoDate?: string
  date: string
  present: number
  absent: number
  late: number
  /** Excused records; analytics trend points may omit it. */
  excused?: number
}

export interface CourseAttendance {
  course: string
  rate: number
  students: number
}

export interface ScanMetric {
  total: number
  successful: number
  failed: number
  successRate: number
}

export interface SchoolEvent {
  id: string
  type: 'Event' | 'Holiday' | 'Examination' | 'Seminar' | 'Class Suspension'
  title: string
  date: string
  time: string
  location: string
  countdown: string
}

export interface NotificationItem {
  id: string
  type: 'late' | 'failed' | 'connected' | 'recorded'
  title: string
  description: string
  time: string
  unread: boolean
}

export interface Announcement {
  id: string
  priority: 'High' | 'Medium' | 'Normal'
  title: string
  date: string
  description: string
}

export interface DashboardData {
  attendanceStats: StatMetric[]
  studentStats: { total: number; active: number; inactive: number }
  qr: ScanMetric
  rfid: ScanMetric & { lastScan: string }
  activities: AttendanceActivity[]
  trend: AttendanceTrendPoint[]
  distribution: { name: AttendanceStatus; value: number; color: string }[]
  courseAttendance: CourseAttendance[]
  events: SchoolEvent[]
  notifications: NotificationItem[]
  announcements: Announcement[]
}
