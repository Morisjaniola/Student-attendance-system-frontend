import { CalendarDays, Clock3, ScanLine } from 'lucide-react'
import { useFormatPreferences } from '../../hooks/useFormatting'
import type { AttendanceRecord } from '../../types/attendance'
import { formatDate, formatTime, statusStyles } from '../../utils/format'

interface ScanResultCardProps {
  record: AttendanceRecord | null
}

export function ScanResultCard({ record }: ScanResultCardProps) {
  const { timeFormat, dateFormat } = useFormatPreferences()
  if (!record) return null

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Attendance Recorded</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyles[record.status]}`}>
          {record.status}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <div>
          <dt className="flex items-center gap-1 text-[10px] text-emerald-700/70 dark:text-emerald-300/70"><ScanLine size={11} />Method</dt>
          <dd className="mt-0.5 font-semibold text-emerald-900 dark:text-emerald-100">{record.method}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[10px] text-emerald-700/70 dark:text-emerald-300/70"><Clock3 size={11} />Time</dt>
          <dd className="mt-0.5 font-semibold text-emerald-900 dark:text-emerald-100">{formatTime(record.time, timeFormat)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="flex items-center gap-1 text-[10px] text-emerald-700/70 dark:text-emerald-300/70"><CalendarDays size={11} />Date</dt>
          <dd className="mt-0.5 font-semibold text-emerald-900 dark:text-emerald-100">{formatDate(record.date, dateFormat)}</dd>
        </div>
      </dl>
    </section>
  )
}
