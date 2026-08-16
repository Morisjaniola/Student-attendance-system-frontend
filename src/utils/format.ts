import type { AttendanceStatus } from '../types/dashboard'
import type { DateFormat, TimeFormat } from '../types/settings'

// ---------------------------------------------------------------------------
// Centralized time/date display formatting.
//
// These helpers apply the Time Format / Date Format preferences configured in
// System Settings. They operate on the canonical storage formats used across
// the app ("07:54 AM" / "7:54 AM" / "—" for times, ISO "YYYY-MM-DD" for
// dates) and return the display string for the current preference.
// ---------------------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, '0')

/** "07:54 AM" | "7:54 AM" | "—" -> display string for the given time format. */
export function formatTime(value: string, timeFormat: TimeFormat): string {
  if (value === '—' || !value) return value
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value)
  if (!match) return value
  const rawHours = Number(match[1])
  const minutes = match[2]

  if (timeFormat === '24-hour') {
    const hours24 = match[3] ? (rawHours % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0) : rawHours
    return `${pad(hours24)}:${minutes}`
  }

  // 12-hour: normalize to "7:54 AM" (drop the leading zero for single digits).
  const hours12 = rawHours % 12 || 12
  const period = rawHours >= 12 ? 'PM' : 'AM'
  return `${hours12}:${minutes} ${period}`
}

/** ISO "YYYY-MM-DD" -> display string for the given date format. */
export function formatDate(iso: string, dateFormat: DateFormat): string {
  if (!iso) return iso
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  if (dateFormat === 'YYYY-MM-DD') return `${year}-${pad(month)}-${pad(day)}`
  if (dateFormat === 'DD/MM/YYYY') return `${pad(day)}/${pad(month)}/${year}`
  return `${pad(month)}/${pad(day)}/${year}`
}

export const statusStyles: Record<AttendanceStatus, string> = {
  Present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300',
  Late: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300',
  Excused: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-400/10 dark:text-blue-300',
  Absent: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-400/10 dark:text-rose-300',
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-PH').format(value)
}

export function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
}
