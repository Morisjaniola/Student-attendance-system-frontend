import { Printer, QrCode, X } from 'lucide-react'
import type { StudentQRCode } from '../../types/qrCode'
import { QRCodeDownloadButton } from './QRCodeDownload'
import { QRCodeGenerator } from './QRCodeGenerator'

interface QRCodeViewerProps {
  student: StudentQRCode | null
  onClose: () => void
  onPrint: (student: StudentQRCode) => void
  onGenerate: (student: StudentQRCode) => void
  generating?: boolean
}

export function QRCodeViewer({ student, onClose, onPrint, onGenerate, generating }: QRCodeViewerProps) {
  if (!student) return null
  const generated = student.status === 'Generated' && Boolean(student.qrValue)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-viewer-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">QR Code Management</p>
            <h2 id="qr-viewer-title" className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">Student QR code</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close QR code viewer">
            <X size={19} />
          </button>
        </header>

        <div className="p-5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
            <span className={`grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl text-sm font-bold ${student.avatarColor}`}>
              {student.photo ? <img src={student.photo} alt="" className="size-full object-cover" /> : student.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-400">{student.studentId}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{student.courseCode} · {student.yearLevel} · {student.section}</p>
            </div>
          </div>

          <div className="mt-5 grid place-items-center rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700">
            {generated ? (
              <>
                <QRCodeGenerator value={student.qrValue!} size={196} ariaLabel={`QR code for ${student.name}`} />
                <p className="mt-2 font-mono text-[11px] text-slate-500">{student.qrValue}</p>
              </>
            ) : (
              <div className="grid min-h-52 place-items-center p-6 text-center">
                <div>
                  <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <QrCode size={24} aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No QR code generated</p>
                  <p className="mt-1 text-xs text-slate-400">Generate a unique QR code for this student to enable scanning.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            {generated ? (
              <>
                <button
                  type="button"
                  onClick={() => onPrint(student)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Printer size={15} aria-hidden="true" /> Print
                </button>
                <QRCodeDownloadButton student={student} onDownloaded={onClose} />
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => onGenerate(student)}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  <QrCode size={15} aria-hidden="true" /> {generating ? 'Generating…' : 'Generate QR code'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
