import { CalendarDays, ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import { AttendanceConfirmation } from '../components/attendance/AttendanceConfirmation'
import { AttendanceScanner } from '../components/attendance/AttendanceScanner'
import { DuplicateAttendanceDialog } from '../components/attendance/DuplicateAttendanceDialog'
import { attendanceService } from '../services/attendanceService'
import { useAttendanceStore } from '../stores/attendanceStore'
import type { AttendanceValidationResult } from '../types/attendance'
import type { AttendanceMethod } from '../types/dashboard'

export function AttendanceMonitoringPage() {
  const { activeMethod, setActiveMethod } = useAttendanceStore()
  const [result, setResult] = useState<AttendanceValidationResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [session, setSession] = useState(() => attendanceService.sessionStats())

  const handleScan = async (method: AttendanceMethod, credential: string) => {
    if (busy) return
    setBusy(true)
    const scanResult = await attendanceService.recordAttendance(method, credential)
    setResult(scanResult)
    setSession(attendanceService.sessionStats())
    if (scanResult.outcome === 'success') setConfirmOpen(true)
    else if (scanResult.outcome === 'duplicate') setDuplicateOpen(true)
    setBusy(false)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Live attendance capture</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Attendance Monitoring</h1>
          <p className="mt-1.5 text-sm text-slate-500">Record student attendance using QR Code or RFID.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <CalendarDays size={13} />Session · {session.dateLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <ClipboardCheck size={13} />{session.count} recorded
          </span>
        </div>
      </section>

      <AttendanceScanner
        activeMethod={activeMethod}
        onMethodChange={setActiveMethod}
        onScan={handleScan}
        busy={busy}
        result={result}
      />

      <AttendanceConfirmation
        record={result?.outcome === 'success' ? result.record : null}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />

      <DuplicateAttendanceDialog
        previous={result?.outcome === 'duplicate' ? result.previous : null}
        open={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
      />
    </div>
  )
}
