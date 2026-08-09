import { CircleCheck, X } from 'lucide-react'
import type { AttendanceRecord } from '../../types/attendance'
import { statusStyles } from '../../utils/format'

interface AttendanceConfirmationProps {
  record: AttendanceRecord | null
  open: boolean
  onClose: () => void
}

export function AttendanceConfirmation({ record, open, onClose }: AttendanceConfirmationProps) {
  if (!open || !record) return null
  const { student } = record

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="attendance-confirmation-title" className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close confirmation">
          <X size={18} />
        </button>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CircleCheck size={30} />
        </span>
        <h2 id="attendance-confirmation-title" className="mt-4 text-center text-lg font-bold text-slate-900 dark:text-white">Attendance Recorded Successfully</h2>
        <p className="mt-1 text-center text-xs text-slate-400">This student has been marked present for today's session.</p>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
          <span className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-bold ${student.avatarColor}`}>
            {student.photo ? <img src={student.photo} alt="" className="size-full object-cover" /> : student.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">Student: {student.name}</p>
            <p className="font-mono text-[11px] text-slate-400">Student ID: {student.studentId}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <dt className="text-[10px] text-slate-400">Method</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{record.method}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-slate-400">Date</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{record.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-slate-400">Time</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{record.time}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-slate-400">Status</dt>
            <dd className="mt-0.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyles[record.status]}`}>{record.status}</span></dd>
          </div>
        </dl>

        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
          Done
        </button>
      </section>
    </div>
  )
}
