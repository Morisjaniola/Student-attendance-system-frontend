import { Nfc, QrCode } from 'lucide-react'
import type { AttendanceMethod, AttendanceStatus } from '../../types/dashboard'
import { statusStyles } from '../../utils/format'

const statusDot: Record<AttendanceStatus, string> = {
  Present: 'bg-emerald-500',
  Late: 'bg-amber-500',
  Excused: 'bg-blue-500',
  Absent: 'bg-rose-500',
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyles[status]}`}>
      <i className={`size-1.5 rounded-full ${statusDot[status]}`} />
      {status}
    </span>
  )
}

export function AttendanceMethodBadge({ method }: { method: AttendanceMethod }) {
  if (method === 'RFID') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 ring-1 ring-inset ring-violet-600/15 dark:bg-violet-400/10 dark:text-violet-300">
        <Nfc size={11} />RFID
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 ring-1 ring-inset ring-sky-600/15 dark:bg-sky-400/10 dark:text-sky-300">
      <QrCode size={11} />QR Code
    </span>
  )
}
