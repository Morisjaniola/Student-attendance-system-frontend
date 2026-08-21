import { initialQRCodes } from '../data/qrCodeData'
import { readStoredSettings } from './settingsService'
import type { StudentQRCode } from '../types/qrCode'

// ---------------------------------------------------------------------------
// QR Code Management service (mock frontend implementation).
//
// Replace the in-memory store below with PHP API calls when the backend is
// ready. Keep the same method signatures so the view layer does not change:
//
//   React  →  qrCodeService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

let records: StudentQRCode[] = initialQRCodes.map((record) => ({ ...record }))

const delay = (milliseconds = 220) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_PREFIX = 'ATD-26-'

function generateUniqueValue(): string {
  const used = new Set(records.map((record) => record.qrValue).filter(Boolean))
  let value = ''
  do {
    const suffix = Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
    value = `${CODE_PREFIX}${suffix}`
  } while (used.has(value))
  return value
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export const qrCodeService = {
  /** Returns a snapshot of every student with their QR code state. */
  async list(): Promise<StudentQRCode[]> {
    await delay()
    return records.map((record) => ({ ...record }))
  },

  /** Generates a unique QR code payload for a student who does not have one yet. */
  async generate(studentId: string): Promise<StudentQRCode> {
    await delay()
    const current = records.find((record) => record.id === studentId)
    if (!current) throw new Error('Student record was not found.')

    const updated: StudentQRCode = {
      ...current,
      status: 'Generated',
      qrValue: generateUniqueValue(),
      generatedAt: today(),
    }
    records = records.map((record) => (record.id === studentId ? updated : record))
    return { ...updated }
  },

  /** Replaces an existing QR code with a brand-new unique payload. */
  async regenerate(studentId: string): Promise<StudentQRCode> {
    await delay()
    // Hard gate so users cannot bypass the System Settings preference.
    const { qrRfid } = readStoredSettings()
    if (!qrRfid.allowQrRegeneration) {
      throw new Error('QR Code regeneration is currently disabled in System Settings.')
    }
    const current = records.find((record) => record.id === studentId)
    if (!current) throw new Error('Student record was not found.')

    const updated: StudentQRCode = {
      ...current,
      qrValue: generateUniqueValue(),
      generatedAt: today(),
    }
    records = records.map((record) => (record.id === studentId ? updated : record))
    return { ...updated }
  },
}
