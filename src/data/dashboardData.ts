import {
  BadgeCheck,
  CircleX,
  Clock3,
  GraduationCap,
  UserRoundCheck,
} from 'lucide-react'
import { studentService } from '../services/studentService'
import { qrCodeService } from '../services/qrCodeService'
import { rfidService } from '../services/rfidService'
import { attendanceRecordsService } from '../services/attendanceRecordsService'
import type { AttendanceTrendPoint, CourseAttendance, DashboardData, ScanMetric, StatMetric } from '../types/dashboard'

// ---------------------------------------------------------------------------
// Events and announcements – kept as static data since no dedicated services
// exist for them. These represent school-level information that doesn't
// change with individual attendance records.
// ---------------------------------------------------------------------------

export const dashboardData: DashboardData = {
  attendanceStats: [],
  studentStats: { total: 0, active: 0, inactive: 0 },
  qr: { total: 0, successful: 0, failed: 0, successRate: 0 },
  rfid: { total: 0, successful: 0, failed: 0, successRate: 0, lastScan: '—' },
  activities: [],
  trend: [],
  distribution: [],
  courseAttendance: [],
  events: [
    { id: 'e-01', type: 'Seminar', title: 'Career Readiness Seminar', date: 'August 22, 2026', time: '1:00 PM – 4:00 PM', location: 'University Auditorium', countdown: 'in 2 days', purpose: 'Prepare students for future employment through career guidance, resume preparation, interview skills, professional communication, and workplace readiness.', status: 'Upcoming', details: [
      { label: 'Registered Attendees', value: '320' },
      { label: 'Checked-in Students', value: '0' },
      { label: 'Attendance Completion', value: 'Pending' },
    ] },
    { id: 'e-02', type: 'Holiday', title: 'National Heroes Day', date: 'August 31, 2026', time: 'All day', location: 'Campus-wide', countdown: 'in 11 days', purpose: 'Honor Philippine national heroes and promote patriotism, historical awareness, and appreciation of their contributions.', status: 'Holiday – No Regular Classes', details: [
      { label: 'Holiday Status', value: 'Official School Holiday' },
      { label: 'Attendance Requirement', value: 'None — no regular class attendance unless an official school activity is scheduled' },
    ] },
    { id: 'e-03', type: 'Examination', title: 'Preliminary Examinations', date: 'September 7–11, 2026', time: 'Per class schedule', location: 'Assigned rooms', countdown: 'in 18 days', purpose: 'Conduct the official preliminary examinations to evaluate students\' academic progress during the first grading period.', status: 'Upcoming', details: [
      { label: 'Present', value: '—' },
      { label: 'Late', value: '—' },
      { label: 'Absent', value: '—' },
      { label: 'Excused', value: '—' },
      { label: 'Total Students', value: '1,248' },
    ] },
    { id: 'e-04', type: 'Event', title: 'College Week Opening', date: 'September 14, 2026', time: '8:00 AM', location: 'Activity Center', countdown: 'in 25 days', purpose: 'Officially launch College Week through opening ceremonies, student activities, performances, and organization participation.', status: 'Upcoming', details: [
      { label: 'Participant Attendance', value: '0 / 1,248' },
      { label: 'Organization Participation', value: 'Pending' },
      { label: 'Event Check-in Records', value: '0' },
    ] },
  ],
  notifications: [],
  announcements: [
    { id: 'an-01', priority: 'High', title: 'Preliminary examination week reminder', date: 'Aug 19, 2026', description: 'Faculty must finalize attendance records for the preliminary period by September 5.' },
    { id: 'an-02', priority: 'Medium', title: 'New RFID reader at the library', date: 'Aug 18, 2026', description: 'Library access attendance is now captured through the new RFID station.' },
    { id: 'an-03', priority: 'Normal', title: 'Updated student ID validation process', date: 'Aug 16, 2026', description: 'Students with damaged IDs may request a temporary QR pass from Student Services.' },
  ],
}

// ---------------------------------------------------------------------------
// Student stats
// ---------------------------------------------------------------------------

function computeStudentStats(students: { status: string }[]) {
  const total = students.length
  const active = students.filter((s) => s.status === 'Active').length
  const inactive = total - active
  return { total, active, inactive }
}

function buildStudentStatMetrics(stats: { total: number; active: number; inactive: number }): StatMetric {
  return {
    id: 'students',
    title: 'Total Students',
    value: stats.total.toLocaleString(),
    description: 'Registered this semester',
    change: '',
    trend: 'up',
    color: 'blue',
    icon: GraduationCap,
  }
}

// ---------------------------------------------------------------------------
// Attendance stats from records
// ---------------------------------------------------------------------------

function computeAttendanceStats(records: { status: string }[]) {
  let present = 0
  let absent = 0
  let late = 0
  let excused = 0
  for (const record of records) {
    if (record.status === 'Present') present++
    else if (record.status === 'Absent') absent++
    else if (record.status === 'Late') late++
    else if (record.status === 'Excused') excused++
  }
  const total = present + absent + late + excused
  return { total, present, absent, late, excused }
}

function buildAttendanceStatMetrics(stats: { total: number; present: number; absent: number; late: number; excused: number }) {
  const pct = (value: number) => stats.total > 0 ? `${((value / stats.total) * 100).toFixed(1)}%` : '0%'
  return [
    {
      id: 'students',
      title: 'Total Students',
      value: stats.total.toLocaleString(),
      description: 'Registered this semester',
      change: '',
      trend: 'up' as const,
      color: 'blue' as const,
      icon: GraduationCap,
    },
    {
      id: 'present',
      title: 'Present Today',
      value: stats.present.toLocaleString(),
      description: `${pct(stats.present)} of enrolled students`,
      change: '',
      trend: 'up' as const,
      color: 'green' as const,
      icon: BadgeCheck,
    },
    {
      id: 'absent',
      title: 'Absent Today',
      value: stats.absent.toLocaleString(),
      description: `${pct(stats.absent)} of enrolled students`,
      change: '',
      trend: 'down' as const,
      color: 'red' as const,
      icon: CircleX,
    },
    {
      id: 'late',
      title: 'Late Today',
      value: stats.late.toLocaleString(),
      description: 'Arrived after 8:00 AM',
      change: '',
      trend: 'down' as const,
      color: 'orange' as const,
      icon: Clock3,
    },
    {
      id: 'excused',
      title: 'Excused Today',
      value: stats.excused.toLocaleString(),
      description: 'Approved attendance requests',
      change: '',
      trend: 'up' as const,
      color: 'violet' as const,
      icon: UserRoundCheck,
    },
  ]
}

// ---------------------------------------------------------------------------
// QR / RFID scan metrics
// ---------------------------------------------------------------------------

function computeQRScanMetrics(qrCodes: { status: string }[]): ScanMetric {
  const generated = qrCodes.filter((qr) => qr.status === 'Generated').length
  const notGenerated = qrCodes.filter((qr) => qr.status === 'Not Generated').length
  const total = qrCodes.length
  return {
    total,
    successful: generated,
    failed: notGenerated,
    successRate: total > 0 ? Math.round((generated / total) * 1000) / 10 : 0,
  }
}

function computeRFIDScanMetrics(rfidCards: { status: string; registeredAt: string }[]): ScanMetric & { lastScan: string } {
  const active = rfidCards.filter((c) => c.status === 'Active').length
  const inactive = rfidCards.filter((c) => c.status === 'Inactive').length
  const unassigned = rfidCards.filter((c) => c.status === 'Unassigned').length
  const total = rfidCards.length
  // Find the most recently registered card
  const sorted = [...rfidCards].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
  const lastRegistered = sorted[0]?.registeredAt ?? '—'
  return {
    total,
    successful: active,
    failed: inactive + unassigned,
    successRate: total > 0 ? Math.round((active / total) * 1000) / 10 : 0,
    lastScan: lastRegistered !== '—' ? new Date(lastRegistered).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
  }
}

// ---------------------------------------------------------------------------
// Activity table (recent attendance records)
// ---------------------------------------------------------------------------

interface ActivityRecord {
  id: string
  student: {
    id: string
    studentId: string
    name: string
    initials: string
    avatarColor: string
    courseCode: string
    course: string
    yearLevel: string
    section: string
  }
  method: string
  time: string
  status: string
  date: string
}

function buildActivities(records: ActivityRecord[]) {
  return records.slice(0, 10).map((record) => ({
    id: record.id,
    studentId: record.student.studentId,
    name: record.student.name,
    initials: record.student.initials,
    avatarColor: record.student.avatarColor,
    course: record.student.course,
    year: record.student.yearLevel,
    section: record.student.section,
    method: record.method as 'QR Code' | 'RFID',
    timeIn: record.time,
    status: record.status as 'Present' | 'Late' | 'Excused' | 'Absent',
    device: record.method === 'QR Code' ? 'QR Scanner' : 'RFID Reader',
  }))
}

// ---------------------------------------------------------------------------
// Trend data (daily attendance counts)
// ---------------------------------------------------------------------------

function buildTrend(records: ActivityRecord[]): AttendanceTrendPoint[] {
  const dateMap = new Map<string, { present: number; absent: number; late: number; excused: number }>()
  for (const record of records) {
    const entry = dateMap.get(record.date) ?? { present: 0, absent: 0, late: 0, excused: 0 }
    if (record.status === 'Present') entry.present++
    else if (record.status === 'Absent') entry.absent++
    else if (record.status === 'Late') entry.late++
    else if (record.status === 'Excused') entry.excused++
    dateMap.set(record.date, entry)
  }

  return [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => {
      const [year, month, day] = date.split('-').map(Number)
      const dateLabel = new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
      return {
        isoDate: date,
        date: dateLabel,
        ...counts,
      }
    })
}

// ---------------------------------------------------------------------------
// Course attendance
// ---------------------------------------------------------------------------

function buildCourseAttendance(records: ActivityRecord[]): CourseAttendance[] {
  const courseMap = new Map<string, { total: number; present: number; late: number; absent: number }>()
  for (const record of records) {
    const code = record.student.courseCode
    const entry = courseMap.get(code) ?? { total: 0, present: 0, late: 0, absent: 0 }
    entry.total++
    if (record.status === 'Present') entry.present++
    else if (record.status === 'Late') entry.late++
    else if (record.status === 'Absent') entry.absent++
    courseMap.set(code, entry)
  }

  return [...courseMap.entries()]
    .map(([course, data]) => ({
      course,
      rate: data.total > 0 ? Math.round(((data.present + data.late) / data.total) * 100) : 0,
      students: data.total,
      present: data.present,
      late: data.late,
      absent: data.absent,
      total: data.total,
    }))
    .sort((a, b) => b.rate - a.rate)
}

// ---------------------------------------------------------------------------
// Distribution (attendance status counts)
// ---------------------------------------------------------------------------

function buildDistribution(stats: { present: number; absent: number; late: number; excused: number }) {
  return [
    { name: 'Present' as const, value: stats.present, color: '#22c55e' },
    { name: 'Absent' as const, value: stats.absent, color: '#ef4444' },
    { name: 'Late' as const, value: stats.late, color: '#f59e0b' },
    { name: 'Excused' as const, value: stats.excused, color: '#2563eb' },
  ]
}

// ---------------------------------------------------------------------------
// Main dashboard data builder – uses existing services
// ---------------------------------------------------------------------------

export async function getDashboardData(): Promise<DashboardData> {
  const [students, qrCodes, rfidCards, attendanceRecords] = await Promise.all([
    studentService.list(),
    qrCodeService.list(),
    rfidService.list(),
    attendanceRecordsService.list(),
  ])

  const studentStats = computeStudentStats(students)
  const attendanceStats = computeAttendanceStats(attendanceRecords)
  const qrMetrics = computeQRScanMetrics(qrCodes)
  const rfidMetrics = computeRFIDScanMetrics(rfidCards)
  const activities = buildActivities(attendanceRecords)
  const trend = buildTrend(attendanceRecords)
  const courseAttendance = buildCourseAttendance(attendanceRecords)
  const distribution = buildDistribution(attendanceStats)

  return {
    attendanceStats: buildAttendanceStatMetrics(attendanceStats),
    studentStats,
    qr: qrMetrics,
    rfid: rfidMetrics,
    activities,
    trend,
    distribution,
    courseAttendance,
    events: dashboardData.events,
    notifications: dashboardData.notifications,
    announcements: dashboardData.announcements,
  }
}
