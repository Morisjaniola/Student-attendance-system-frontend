export type QRCodeStatus = 'Generated' | 'Not Generated'

export interface StudentQRCode {
  id: string
  studentId: string
  name: string
  initials: string
  avatarColor: string
  photo?: string
  course: string
  courseCode: string
  yearLevel: string
  section: string
  status: QRCodeStatus
  /** The unique payload encoded inside the QR code, or null when not generated yet. */
  qrValue: string | null
  generatedAt: string | null
}
