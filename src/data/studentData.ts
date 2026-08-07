import type { Course, Student, StudentStatus } from '../types/student'

export const courses: Course[] = [
  { id: 'cs', code: 'BSCS', name: 'BS Computer Science', sections: ['CS-1A', 'CS-1B', 'CS-2A', 'CS-2B', 'CS-3A', 'CS-3B', 'CS-4A'] },
  { id: 'it', code: 'BSIT', name: 'BS Information Technology', sections: ['IT-1A', 'IT-1B', 'IT-2A', 'IT-2B', 'IT-3A', 'IT-4A'] },
  { id: 'acc', code: 'BSA', name: 'BS Accountancy', sections: ['BSA-1A', 'BSA-1B', 'BSA-2A', 'BSA-3A', 'BSA-4A'] },
  { id: 'nursing', code: 'BSN', name: 'BS Nursing', sections: ['NUR-1A', 'NUR-1B', 'NUR-2A', 'NUR-2B', 'NUR-3A', 'NUR-4A'] },
  { id: 'psych', code: 'BSP', name: 'BS Psychology', sections: ['PSY-1A', 'PSY-1B', 'PSY-2A', 'PSY-3A', 'PSY-4A'] },
  { id: 'educ', code: 'BSED', name: 'BS Secondary Education', sections: ['EDU-1A', 'EDU-2A', 'EDU-3A', 'EDU-4A'] },
  { id: 'eng', code: 'BSECE', name: 'BS Electronics Engineering', sections: ['ECE-1A', 'ECE-2A', 'ECE-3A', 'ECE-4A'] },
  { id: 'hm', code: 'BSHM', name: 'BS Hospitality Management', sections: ['HM-1A', 'HM-1B', 'HM-2A', 'HM-3A', 'HM-4A'] },
  { id: 'ba', code: 'BSBA', name: 'BS Business Administration', sections: ['BA-1A', 'BA-2A', 'BA-2B', 'BA-3A', 'BA-4A'] },
  { id: 'crim', code: 'BSCrim', name: 'BS Criminology', sections: ['CRIM-1A', 'CRIM-1B', 'CRIM-2A', 'CRIM-3A', 'CRIM-4A'] },
]

const firstNames = ['Andrea', 'Miguel', 'Sophia', 'Daniel', 'Camille', 'Joshua', 'Beatriz', 'Rafael', 'Isabela', 'Noah', 'Frances', 'Jericho', 'Alyssa', 'Paolo', 'Katrina', 'Lorenzo', 'Mikaela', 'Adrian', 'Bianca', 'Gabriel']
const middleNames = ['Santos', 'Garcia', 'Reyes', 'Cruz', 'Mendoza', 'Villanueva', 'Aquino', 'Torres', 'Ramos', 'Navarro']
const lastNames = ['Reyes', 'Cruz', 'Santos', 'Garcia', 'Mendoza', 'Tan', 'Lim', 'Villanueva', 'Torres', 'Aquino', 'Castillo', 'Domingo', 'Flores', 'Gonzales', 'Herrera', 'Lopez', 'Martinez', 'Pascual', 'Rivera', 'Valdez']
const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700']

function attendanceFor(index: number) {
  const present = 33 + (index % 9)
  const late = index % 4
  const absent = index % 5
  const excused = index % 3
  const total = present + late + absent + excused
  return {
    attendanceRate: Math.round(((present + late + excused) / total) * 100), present, late, absent, excused,
    recent: [
      { date: 'Aug 20, 2026', time: `${String(7 + (index % 3)).padStart(2, '0')}:${String(10 + (index * 7) % 45).padStart(2, '0')} AM`, method: index % 2 ? 'RFID' as const : 'QR Code' as const, status: index % 7 === 0 ? 'Late' as const : 'Present' as const, device: index % 2 ? 'Main Entrance' : 'Gate A Scanner' },
      { date: 'Aug 19, 2026', time: '07:54 AM', method: 'QR Code' as const, status: 'Present' as const, device: 'Gate A Scanner' },
      { date: 'Aug 18, 2026', time: '08:02 AM', method: 'RFID' as const, status: index % 8 === 0 ? 'Excused' as const : 'Present' as const, device: 'Main Entrance' },
    ],
  }
}

export const mockStudents: Student[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1
  const course = courses[index % courses.length]
  const gender = index % 2 === 0 ? 'Female' : 'Male'
  const status: StudentStatus = index % 23 === 0 ? 'Archived' : index % 17 === 0 ? 'Suspended' : index % 11 === 0 ? 'Inactive' : 'Active'
  const firstName = firstNames[index % firstNames.length]
  const middleName = middleNames[index % middleNames.length]
  const lastName = lastNames[(index * 3) % lastNames.length]
  const year = `${(index % 4) + 1}${['st', 'nd', 'rd', 'th'][index % 4]} Year`
  const section = course.sections[index % course.sections.length]
  const studentId = `2026-${String(1001 + index).padStart(5, '0')}`
  return {
    id: `student-${number}`, studentId, firstName, middleName, lastName, gender,
    birthdate: `200${2 + (index % 5)}-${String((index % 10) + 1).padStart(2, '0')}-${String((index % 26) + 1).padStart(2, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${number}@student.attendly.edu`,
    contactNumber: `+63 9${String(100000000 + index * 791).padStart(9, '0')}`,
    address: `${12 + index} ${['Mabini', 'Rizal', 'Quezon', 'Bonifacio', 'Luna'][index % 5]} Street, Quezon City`,
    course: course.name, courseCode: course.code, yearLevel: year, section,
    guardianName: `${firstNames[(index + 5) % firstNames.length]} ${lastName}`,
    guardianContact: `+63 9${String(200000000 + index * 547).padStart(9, '0')}`,
    rfidNumber: `04:A3:${String(10 + index).padStart(2, '0')}:B7:${String(80 + index).padStart(2, '0')}:9C`, qrCode: `ATD-26-${String(number).padStart(5, '0')}`,
    photo: `https://i.pravatar.cc/160?img=${(index % 70) + 1}`, avatarColor: colors[index % colors.length], status,
    registeredAt: `2026-${String((index % 7) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    deletedAt: status === 'Archived' ? '2026-08-12' : undefined, attendance: attendanceFor(index),
    timeline: [
      { id: `tl-a-${number}`, title: 'Attendance recorded', description: `Checked in via ${index % 2 ? 'RFID card' : 'QR code'} at the main entrance.`, date: 'Today, 8:02 AM', type: 'attendance' },
      { id: `tl-b-${number}`, title: 'RFID card assigned', description: `Card ${`04:A3:${String(10 + index).padStart(2, '0')}:B7` } linked to student profile.`, date: 'Aug 4, 2026', type: 'rfid' },
      { id: `tl-c-${number}`, title: 'Student registered', description: 'Profile completed and assigned to current semester.', date: `Jul ${10 + (index % 16)}, 2026`, type: 'registration' },
    ],
  }
})
