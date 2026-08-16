import { Clock3, X } from 'lucide-react'
import { useFormatPreferences } from '../../hooks/useFormatting'
import type { DuplicateRecord } from '../../types/attendance'
import { formatTime } from '../../utils/format'

interface DuplicateAttendanceDialogProps {
  previous: DuplicateRecord | null
  open: boolean
  onClose: () => void
}

export function DuplicateAttendanceDialog({ previous, open, onClose }: DuplicateAttendanceDialogProps) {
  const { timeFormat } = useFormatPreferences()
  if (!open || !previous) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="duplicate-attendance-title" className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close duplicate dialog">
          <X size={18} />
        </button>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <Clock3 size={28} />
        </span>
        <h2 id="duplicate-attendance-title" className="mt-4 text-center text-lg font-bold text-slate-900 dark:text-white">Attendance already recorded for this session.</h2>
        <p className="mt-1 text-center text-xs text-slate-400">A student can only check in once per session. No duplicate record was created.</p>

        <div className="mt-5 rounded-xl bg-amber-50/70 p-4 text-xs dark:bg-amber-500/10">
          <p className="font-bold text-slate-800 dark:text-slate-100">Student: {previous.student.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-slate-400">Student ID: {previous.student.studentId}</p>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[10px] text-slate-400">Previous time</dt>
              <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{formatTime(previous.time, timeFormat)}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-400">Attendance method</dt>
              <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{previous.method}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10px] text-slate-400">Date</dt>
              <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{previous.dateLabel}</dd>
            </div>
          </dl>
        </div>

        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600">
          Got it
        </button>
      </section>
    </div>
  )
}
