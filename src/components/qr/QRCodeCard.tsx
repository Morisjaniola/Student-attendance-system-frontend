import { Eye, LoaderCircle, Plus, Printer, QrCode, RefreshCw } from 'lucide-react'
import type { StudentQRCode } from '../../types/qrCode'
import { QRCodeDownloadButton } from './QRCodeDownload'
import { QRCodeGenerator } from './QRCodeGenerator'

const statusStyles = {
  Generated: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  'Not Generated': 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-300',
}

interface QRCodeCardProps {
  student: StudentQRCode
  onGenerate: (student: StudentQRCode) => void
  onView: (student: StudentQRCode) => void
  onPrint: (student: StudentQRCode) => void
  onRegenerate: (student: StudentQRCode) => void
  /** When false, regeneration is disabled by System Settings. */
  regenerateDisabled?: boolean
  busy?: boolean
}

export function QRCodeCard({ student, onGenerate, onView, onPrint, onRegenerate, regenerateDisabled = false, busy }: QRCodeCardProps) {
  const generated = student.status === 'Generated' && Boolean(student.qrValue)
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex gap-3">
        <span className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-bold ${student.avatarColor}`}>
          {student.photo ? <img src={student.photo} alt="" className="size-full object-cover" /> : student.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button onClick={() => onView(student)} className="truncate text-left text-sm font-bold text-slate-800 hover:text-blue-600 dark:text-slate-100">
                {student.name}
              </button>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">{student.studentId}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusStyles[student.status]}`}>{student.status}</span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">{student.courseCode} · {student.yearLevel}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{student.section}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
        {generated ? (
          <span className="inline-block overflow-hidden rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700">
            <QRCodeGenerator value={student.qrValue!} size={54} ariaLabel={`QR code preview for ${student.name}`} />
          </span>
        ) : (
          <span className="grid size-12 place-items-center rounded-lg bg-slate-100 text-slate-300 dark:bg-slate-800">
            <QrCode size={20} aria-hidden="true" />
          </span>
        )}
        <p className="max-w-36 truncate font-mono text-[10px] text-slate-400">{student.qrValue ?? 'No QR code yet'}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
        {generated ? (
          <>
            <button onClick={() => onView(student)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10" aria-label={`View ${student.name}'s QR code`}>
              <Eye size={15} />
            </button>
            <button onClick={() => onPrint(student)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label={`Print ${student.name}'s QR code`}>
              <Printer size={15} />
            </button>
            <QRCodeDownloadButton student={student} variant="icon" />
            <button onClick={() => onRegenerate(student)} disabled={busy || regenerateDisabled} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 dark:hover:bg-amber-500/10" aria-label={`Regenerate ${student.name}'s QR code`} title={regenerateDisabled ? 'QR Code regeneration is disabled in System Settings' : `Regenerate ${student.name}'s QR code`}>
              {busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            </button>
          </>
        ) : (
          <button onClick={() => onGenerate(student)} disabled={busy} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}Generate
          </button>
        )}
      </div>
    </article>
  )
}
