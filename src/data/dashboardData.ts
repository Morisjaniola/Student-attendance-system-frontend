import {
  BadgeCheck,
  CircleX,
  Clock3,
  GraduationCap,
  UserRoundCheck,
} from 'lucide-react'
import type { DashboardData } from '../types/dashboard'

const dates = [
  'Jul 09', 'Jul 10', 'Jul 11', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 21', 'Jul 22',
  'Jul 23', 'Jul 24', 'Jul 25', 'Jul 28', 'Jul 29', 'Jul 30', 'Jul 31', 'Aug 01', 'Aug 04', 'Aug 05',
  'Aug 06', 'Aug 07', 'Aug 08', 'Aug 11', 'Aug 12', 'Aug 13', 'Aug 14', 'Aug 15', 'Aug 18', 'Aug 19',
]

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
  trend: dates.map((date, index) => ({
    date,
    present: [88, 90, 87, 91, 89, 92, 90, 86, 88, 91, 93, 90, 92, 89, 94, 91, 93, 88, 90, 92, 89, 94, 91, 93, 90, 92, 95, 93, 91, 94][index],
    absent: [7, 5, 8, 5, 6, 4, 5, 9, 7, 5, 4, 6, 4, 7, 3, 5, 4, 8, 6, 5, 7, 3, 5, 4, 6, 4, 3, 4, 5, 3][index],
    late: [5, 5, 5, 4, 5, 4, 5, 5, 5, 4, 3, 4, 4, 4, 3, 4, 3, 4, 4, 3, 4, 3, 4, 3, 4, 4, 2, 3, 4, 3][index],
  })),
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
