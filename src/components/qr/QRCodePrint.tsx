import { GraduationCap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { StudentQRCode } from '../../types/qrCode'

const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    .qr-print-area { display: block !important; position: fixed !important; left: 0 !important; top: 0 !important; right: 0 !important; width: 100%; }
    .qr-print-area, .qr-print-area * { visibility: visible !important; }
    .qr-print-sheet { box-shadow: none !important; border-color: #000 !important; }
    @page { margin: 12mm; }
  }
`

interface QRCodePrintProps {
  student: StudentQRCode
  /** Called only after the QR image has finished rendering, so printing never shows a blank code. */
  onReady: () => void
  /** Called after the print dialog closes so the caller can unmount this sheet. */
  onPrinted: () => void
}

/** Hidden on screen; becomes the only visible content when window.print() runs. */
export function QRCodePrint({ student, onReady, onPrinted }: QRCodePrintProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const reportedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    if (student.qrValue) {
      QRCode.toDataURL(student.qrValue, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((url) => { if (!cancelled) setDataUrl(url) })
        .catch(() => {})
    }
    return () => { cancelled = true }
  }, [student.qrValue])

  useEffect(() => {
    if (!dataUrl || reportedRef.current) return
    reportedRef.current = true
    onReady()
  }, [dataUrl, onReady])

  useEffect(() => {
    const clear = () => onPrinted()
    window.addEventListener('afterprint', clear)
    return () => window.removeEventListener('afterprint', clear)
  }, [onPrinted])

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <div className="qr-print-area hidden" aria-hidden="true">
        <div className="qr-print-sheet mx-auto w-full max-w-2xl rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-2xl">
          <header className="flex items-center gap-3 border-b-2 border-slate-900 pb-4">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white">
              <GraduationCap size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Official document</p>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Student Attendance Monitoring System</h1>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className={`grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl text-base font-bold ${student.avatarColor}`}>
                  {student.photo ? <img src={student.photo} alt="" className="size-full object-cover" /> : student.initials}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student name</p>
                  <p className="text-base font-bold text-slate-900">{student.name}</p>
                </div>
              </div>
              <PrintRow label="Student ID" value={student.studentId} mono />
              <PrintRow label="Course" value={`${student.courseCode} · ${student.course.replace('BS ', '')}`} />
              <PrintRow label="Year level" value={student.yearLevel} />
              <PrintRow label="Section" value={student.section} />
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-3 text-center">
              {dataUrl ? <img src={dataUrl} alt={`QR code for ${student.name}`} width={168} height={168} /> : <span className="block size-42 bg-slate-50" />}
              <p className="mt-1.5 font-mono text-[10px] text-slate-500">{student.qrValue}</p>
            </div>
          </div>

          <footer className="mt-6 flex items-center justify-between border-t border-slate-300 pt-3 text-[10px] text-slate-400">
            <span>Present this QR code at campus scanners for attendance recording.</span>
            <span>{student.generatedAt ?? ''}</span>
          </footer>
        </div>
      </div>
    </>
  )
}

function PrintRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
