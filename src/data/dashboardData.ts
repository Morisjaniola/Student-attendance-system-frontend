import {
  BadgeCheck,
  CircleX,
  Clock3,
  GraduationCap,
  UserRoundCheck,
} from 'lucide-react'
import type { AttendanceTrendPoint, DashboardData } from '../types/dashboard'

// ---------------------------------------------------------------------------
// Attendance trend (60 school days: 30-day previous period + 30-day current
// period, Mon–Sat cadence like the original mock).
//
// Each point carries an ISO date so the dashboard chart can filter by period
// (Last 7 Days / Last 30 Days / This Month / This Semester) and compare against
// the previous equivalent period. The excused count is included so the
// attendance rate can be computed as (Present + Excused) / Total × 100.
// ---------------------------------------------------------------------------

const CURRENT_TREND_DATES = [
  '2026-07-09', '2026-07-10', '2026-07-11', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-21', '2026-07-22',
  '2026-07-23', '2026-07-24', '2026-07-25', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31', '2026-08-01', '2026-08-04', '2026-08-05',
  '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-18', '2026-08-19',
]

const TREND_PRESENT = [88, 90, 87, 91, 89, 92, 90, 86, 88, 91, 93, 90, 92, 89, 94, 91, 93, 88, 90, 92, 89, 94, 91, 93, 90, 92, 95, 93, 91, 94]
const TREND_ABSENT = [7, 5, 8, 5, 6, 4, 5, 9, 7, 5, 4, 6, 4, 7, 3, 5, 4, 8, 6, 5, 7, 3, 5, 4, 6, 4, 3, 4, 5, 3]
const TREND_LATE = [5, 5, 5, 4, 5, 4, 5, 5, 5, 4, 3, 4, 4, 4, 3, 4, 3, 4, 4, 3, 4, 3, 4, 3, 4, 4, 2, 3, 4, 3]
const TREND_EXCUSED = [3, 2, 4, 2, 3, 2, 3, 2, 3, 2, 3, 4, 2, 3, 2, 3, 4, 2, 3, 2, 4, 2, 3, 2, 3, 4, 2, 3, 2, 3]

/** '2026-07-09' -> 'Jul 09' (compact axis label). */
function trendDateLabel(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

/** Mon–Sat school days strictly before `beforeIso`, oldest first. */
function previousSchoolDays(beforeIso: string, count: number): string[] {
  const result: string[] = []
  const cursor = new Date(`${beforeIso}T00:00:00`)
  cursor.setDate(cursor.getDate() - 1)
  while (result.length < count) {
    if (cursor.getDay() !== 0) {
      result.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`)
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  return result.reverse()
}

/**
 * 60 school days (previous + current) with isoDate, label, and all four
 * statuses. The previous 30 days reuse the current values with a small
 * deterministic downward shift in the attendance rate (more absent/late,
 * fewer present) so the computed period comparison reflects a realistic
 * ~2-3pp improvement (mirrors the original mock narrative).
 */
function buildTrend(): AttendanceTrendPoint[] {
  const previousDates = previousSchoolDays('2026-07-09', 30)
  const previous = previousDates.map((isoDate, index) => {
    const src = (index + 12) % TREND_PRESENT.length
    return {
      isoDate,
      date: trendDateLabel(isoDate),
      present: Math.max(80, TREND_PRESENT[src] - 3),
      absent: Math.min(12, TREND_ABSENT[src] + 2),
      late: Math.max(2, TREND_LATE[src] + 1),
      excused: Math.max(1, TREND_EXCUSED[src] - 1),
    }
  })

  const current = CURRENT_TREND_DATES.map((isoDate, index) => ({
    isoDate,
    date: trendDateLabel(isoDate),
    present: TREND_PRESENT[index],
    absent: TREND_ABSENT[index],
    late: TREND_LATE[index],
    excused: TREND_EXCUSED[index],
  }))

  return [...previous, ...current]
}

export const dashboardData: DashboardData = {
  attendanceStats: [
    {
      id: 'students',
      title: 'Total Students',
      value: '1,248',
      description: 'Registered this semester',
      change: '4.6%',
      trend: 'up',
      color: 'blue',
      icon: GraduationCap,
    },
    {
      id: 'present',
      title: 'Present Today',
      value: '1,116',
      description: '89.4% of enrolled students',
      change: '3.2%',
      trend: 'up',
      color: 'green',
      icon: BadgeCheck,
    },
    {
      id: 'absent',
      title: 'Absent Today',
      value: '58',
      description: '4.6% of enrolled students',
      change: '0.8%',
      trend: 'down',
      color: 'red',
      icon: CircleX,
    },
    {
      id: 'late',
      title: 'Late Today',
      value: '43',
      description: 'Arrived after 8:00 AM',
      change: '1.4%',
      trend: 'down',
      color: 'orange',
      icon: Clock3,
    },
    {
      id: 'excused',
      title: 'Excused Today',
      value: '31',
      description: 'Approved attendance requests',
      change: '2.1%',
      trend: 'up',
      color: 'violet',
      icon: UserRoundCheck,
    },
  ],
  studentStats: { total: 1248, active: 1193, inactive: 55 },
  qr: { total: 892, successful: 871, failed: 21, successRate: 97.6 },
  rfid: { total: 308, successful: 302, failed: 6, successRate: 98.1, lastScan: '10:42 AM' },
  activities: [
    { id: 'a-01', studentId: '2024-01248', name: 'Maria S. Reyes', initials: 'MR', avatarColor: 'bg-blue-100 text-blue-700', course: 'BS Computer Science', year: '3rd Year', section: 'CS-3A', method: 'QR Code', timeIn: '10:42 AM', status: 'Present', device: 'Gate A Scanner' },
    { id: 'a-02', studentId: '2024-01183', name: 'John Paulo Cruz', initials: 'JC', avatarColor: 'bg-amber-100 text-amber-700', course: 'BS Information Tech.', year: '2nd Year', section: 'IT-2B', method: 'RFID', timeIn: '10:39 AM', status: 'Present', device: 'Main Entrance' },
    { id: 'a-03', studentId: '2024-00916', name: 'Angela D. Santos', initials: 'AS', avatarColor: 'bg-pink-100 text-pink-700', course: 'BS Accountancy', year: '4th Year', section: 'BSA-4A', method: 'QR Code', timeIn: '10:31 AM', status: 'Late', device: 'Gate A Scanner' },
    { id: 'a-04', studentId: '2024-00851', name: 'Jericho M. Tan', initials: 'JT', avatarColor: 'bg-violet-100 text-violet-700', course: 'BS Computer Science', year: '1st Year', section: 'CS-1C', method: 'RFID', timeIn: '10:28 AM', status: 'Present', device: 'Library Reader' },
    { id: 'a-05', studentId: '2024-01042', name: 'Kyla Mae Garcia', initials: 'KG', avatarColor: 'bg-cyan-100 text-cyan-700', course: 'BS Psychology', year: '3rd Year', section: 'PSY-3A', method: 'QR Code', timeIn: '10:21 AM', status: 'Excused', device: 'Student Services' },
    { id: 'a-06', studentId: '2024-00738', name: 'Rafael L. Mendoza', initials: 'RM', avatarColor: 'bg-orange-100 text-orange-700', course: 'BS Information Tech.', year: '4th Year', section: 'IT-4A', method: 'RFID', timeIn: '10:17 AM', status: 'Present', device: 'Main Entrance' },
    { id: 'a-07', studentId: '2024-01301', name: 'Sofia N. Villanueva', initials: 'SV', avatarColor: 'bg-rose-100 text-rose-700', course: 'BS Nursing', year: '2nd Year', section: 'NUR-2B', method: 'QR Code', timeIn: '10:04 AM', status: 'Late', device: 'Gate B Scanner' },
    { id: 'a-08', studentId: '2024-00626', name: 'Miguel A. Torres', initials: 'MT', avatarColor: 'bg-emerald-100 text-emerald-700', course: 'BS Computer Science', year: '2nd Year', section: 'CS-2A', method: 'RFID', timeIn: '9:58 AM', status: 'Present', device: 'Main Entrance' },
    { id: 'a-09', studentId: '2024-00964', name: 'Beatriz R. Lim', initials: 'BL', avatarColor: 'bg-indigo-100 text-indigo-700', course: 'BS Accountancy', year: '1st Year', section: 'BSA-1B', method: 'QR Code', timeIn: '9:45 AM', status: 'Present', device: 'Gate A Scanner' },
    { id: 'a-10', studentId: '2024-01090', name: 'Noel P. Aquino', initials: 'NA', avatarColor: 'bg-slate-200 text-slate-700', course: 'BS Psychology', year: '4th Year', section: 'PSY-4A', method: 'RFID', timeIn: '9:36 AM', status: 'Absent', device: 'Adviser record' },
  ],
  trend: buildTrend(),
  distribution: [
    { name: 'Present', value: 1116, color: '#22c55e' },
    { name: 'Absent', value: 58, color: '#ef4444' },
    { name: 'Late', value: 43, color: '#f59e0b' },
    { name: 'Excused', value: 31, color: '#2563eb' },
  ],
  courseAttendance: [
    { course: 'BSCS', rate: 94, students: 312 },
    { course: 'BSIT', rate: 91, students: 286 },
    { course: 'BSA', rate: 88, students: 204 },
    { course: 'BSN', rate: 86, students: 179 },
    { course: 'BS Psych', rate: 89, students: 167 },
  ],
  events: [
    { id: 'e-01', type: 'Seminar', title: 'Career Readiness Seminar', date: 'August 22, 2026', time: '1:00 PM – 4:00 PM', location: 'University Auditorium', countdown: 'in 2 days' },
    { id: 'e-02', type: 'Holiday', title: 'National Heroes Day', date: 'August 31, 2026', time: 'All day', location: 'Campus-wide', countdown: 'in 11 days' },
    { id: 'e-03', type: 'Examination', title: 'Preliminary Examinations', date: 'September 7–11, 2026', time: 'Per class schedule', location: 'Assigned rooms', countdown: 'in 18 days' },
    { id: 'e-04', type: 'Event', title: 'College Week Opening', date: 'September 14, 2026', time: '8:00 AM', location: 'Activity Center', countdown: 'in 25 days' },
  ],
  notifications: [
    { id: 'n-01', type: 'late', title: 'Late student detected', description: 'Angela Santos checked in 31 minutes after class start.', time: '3 min ago', unread: true },
    { id: 'n-02', type: 'failed', title: 'QR scan failed', description: 'Invalid QR code at Gate B Scanner. Please retry.', time: '12 min ago', unread: true },
    { id: 'n-03', type: 'connected', title: 'RFID reader connected', description: 'Main Entrance reader is online and ready to scan.', time: '28 min ago', unread: false },
    { id: 'n-04', type: 'recorded', title: 'Attendance recorded', description: 'Maria Reyes has been marked present via QR Code.', time: '34 min ago', unread: false },
  ],
  announcements: [
    { id: 'an-01', priority: 'High', title: 'Preliminary examination week reminder', date: 'Aug 19, 2026', description: 'Faculty must finalize attendance records for the preliminary period by September 5.' },
    { id: 'an-02', priority: 'Medium', title: 'New RFID reader at the library', date: 'Aug 18, 2026', description: 'Library access attendance is now captured through the new RFID station.' },
    { id: 'an-03', priority: 'Normal', title: 'Updated student ID validation process', date: 'Aug 16, 2026', description: 'Students with damaged IDs may request a temporary QR pass from Student Services.' },
  ],
}

export async function getDashboardData(): Promise<DashboardData> {
  // Mimics an API boundary so the view can be switched to real services later.
  return Promise.resolve(dashboardData)
}
