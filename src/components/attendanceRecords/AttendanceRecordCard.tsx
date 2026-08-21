import { LoaderCircle, Pencil, Trash2 } from 'lucide-react'
import { useFormatPreferences } from '../../hooks/useFormatting'
import type { AttendanceRecord } from '../../types/attendanceRecord'
import { formatDate, formatTime, initials } from '../../utils/format'
import { AttendanceMethodBadge, AttendanceStatusBadge } from './AttendanceBadges'

interface AttendanceRecordCardProps {
  record: AttendanceRecord
  canEdit: boolean
  canDelete: boolean
  busy?: boolean
  onEdit: (record: AttendanceRecord) => void
  onDelete: (record: AttendanceRecord) => void
}

export function AttendanceRecordCard({ record, canEdit, canDelete, busy, onEdit, onDelete }: AttendanceRecordCardProps) {
  const { timeFormat, dateFormat } = useFormatPreferences()
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-bold ${record.student.avatarColor}`}>
            {record.student.photo ? <img src={record.student.photo} alt="" className="size-full object-cover" /> : initials(record.student.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{record.student.name}</p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">{record.student.studentId}</p>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{record.student.courseCode} · {record.student.yearLevel} · {record.student.section}</p>
          </div>
        </div>
        <AttendanceStatusBadge status={record.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-950/60">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Date</p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300">{formatDate(record.date, dateFormat)}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Time</p>
          <p className="mt-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">{formatTime(record.time, timeFormat)}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Method</p>
          <div className="mt-1 flex justify-center"><AttendanceMethodBadge method={record.method} /></div>
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="mt-3 flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(record)}
              disabled={busy}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:opacity-60 dark:bg-slate-950 dark:hover:bg-blue-500/10"
            >
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Pencil size={14} />}Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(record)}
              disabled={busy}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-60 dark:bg-slate-950 dark:hover:bg-rose-500/10"
            >
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
            </button>
          )}
        </div>
      )}
    </article>
  )
}
