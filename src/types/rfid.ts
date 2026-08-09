export type RFIDStatus = 'Active' | 'Inactive' | 'Unassigned'

export interface RFIDCard {
  id: string
  /** The number printed on the physical RFID card, e.g. RFID-000001. */
  cardNumber: string
  status: RFIDStatus
  registeredAt: string
  /** Assignment details — all null while the card is unassigned. */
  studentId: string | null
  studentName: string | null
  avatarColor: string | null
  photo?: string | null
  courseCode: string | null
  course: string | null
  yearLevel: string | null
  section: string | null
}

/** The student fields required when assigning a card (mirrors a student from the student directory). */
export interface RFIDAssignStudent {
  id: string
  studentId: string
  name: string
  avatarColor: string
  courseCode: string
  course: string
  yearLevel: string
  section: string
}

/** A pending Activate/Deactivate request for a specific card. */
export interface RFIDStatusChange {
  card: RFIDCard
  next: Exclude<RFIDStatus, 'Unassigned'>
}
