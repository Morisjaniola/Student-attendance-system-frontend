// Demo scan cases for the Attendance Monitoring page.
//
// These are convenience shortcuts for testing every validation path without
// typing credentials by hand. The attendanceService still performs the real
// lookup and validation against the existing student / QR / RFID data.

export interface ScanCase {
  id: string
  /** Student or case name shown on the quick-pick chip. */
  label: string
  /** What this case is expected to demonstrate. */
  hint: string
  /** The credential value to "scan". */
  credential: string
}

export const qrScanCases: ScanCase[] = [
  { id: 'qr-valid', label: 'Camille Flores', hint: 'Valid scan', credential: 'ATD-26-00005' },
  { id: 'qr-not-generated', label: 'Sophia Herrera', hint: 'QR not generated', credential: 'ATD-26-00004' },
  { id: 'qr-inactive-student', label: 'Sophia Lim', hint: 'Inactive student', credential: 'ATD-26-00023' },
  { id: 'qr-unknown', label: 'Unknown code', hint: 'Student not found', credential: 'ATD-26-99999' },
]

export const rfidScanCases: ScanCase[] = [
  { id: 'rfid-valid', label: 'Miguel Garcia', hint: 'Valid card', credential: 'RFID-000002' },
  { id: 'rfid-unassigned', label: 'Unassigned card', hint: 'Card not assigned', credential: 'RFID-000016' },
  { id: 'rfid-inactive', label: 'Inactive card', hint: 'Card disabled', credential: 'RFID-000006' },
  { id: 'rfid-unknown', label: 'Unknown card', hint: 'Student not found', credential: 'RFID-999999' },
]
