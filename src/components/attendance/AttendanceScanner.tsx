import { Nfc, ScanQrCode, TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { useSystemSettings } from '../../hooks/useSystemSettings'
import type { AttendanceMethod } from '../../types/dashboard'
import type { AttendanceValidationResult } from '../../types/attendance'
import { QRScanner } from './QRScanner'
import { RFIDScanner } from './RFIDScanner'
import { StudentValidationCard } from './StudentValidationCard'
import { ScanResultCard } from './ScanResultCard'

interface AttendanceScannerProps {
  activeMethod: AttendanceMethod
  onMethodChange: (method: AttendanceMethod) => void
  onScan: (method: AttendanceMethod, credential: string) => Promise<void>
  busy: boolean
  result: AttendanceValidationResult | null
}

export function AttendanceScanner({ activeMethod, onMethodChange, onScan, busy, result }: AttendanceScannerProps) {
  const { qrRfid } = useSystemSettings()
  const qrDisabled = !qrRfid.qrAttendanceEnabled
  const rfidDisabled = !qrRfid.rfidAttendanceEnabled
  const bothDisabled = qrDisabled && rfidDisabled

  // If the currently active method was just disabled in System Settings,
  // switch to the remaining enabled method automatically.
  useEffect(() => {
    if (bothDisabled) return
    if (qrDisabled && activeMethod === 'QR Code') onMethodChange('RFID')
    else if (rfidDisabled && activeMethod === 'RFID') onMethodChange('QR Code')
  }, [bothDisabled, qrDisabled, rfidDisabled, activeMethod, onMethodChange])

  const methodDisabled = (method: AttendanceMethod) => (method === 'QR Code' ? qrDisabled : rfidDisabled)
  const active = methodDisabled(activeMethod) ? (qrDisabled ? 'RFID' : 'QR Code') : activeMethod
  const scannerProps = {
    onScan: (credential: string) => onScan(active, credential),
    disabled: busy,
  }

  return (
    <section className="space-y-5">
      <style>{`@keyframes scanline { 0% { top: 10%; } 50% { top: 88%; } 100% { top: 10%; } }`}</style>

      {qrDisabled && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          <TriangleAlert size={15} className="mt-0.5 shrink-0" />
          <span>QR Code attendance is currently disabled in System Settings.</span>
        </div>
      )}
      {rfidDisabled && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          <TriangleAlert size={15} className="mt-0.5 shrink-0" />
          <span>RFID attendance is currently disabled in System Settings.</span>
        </div>
      )}

      <div role="tablist" aria-label="Scanning method" className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
        <button
          role="tab"
          aria-selected={active === 'QR Code'}
          aria-disabled={qrDisabled}
          disabled={qrDisabled}
          onClick={() => onMethodChange('QR Code')}
          title={qrDisabled ? 'QR Code attendance is currently disabled in System Settings.' : undefined}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${active === 'QR Code' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-950 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} ${qrDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <ScanQrCode size={16} />QR Code Scanning{qrDisabled && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">Off</span>}
        </button>
        <button
          role="tab"
          aria-selected={active === 'RFID'}
          aria-disabled={rfidDisabled}
          disabled={rfidDisabled}
          onClick={() => onMethodChange('RFID')}
          title={rfidDisabled ? 'RFID attendance is currently disabled in System Settings.' : undefined}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${active === 'RFID' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-950 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} ${rfidDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <Nfc size={16} />RFID Scanning{rfidDisabled && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">Off</span>}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {bothDisabled ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="max-w-sm">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  <TriangleAlert size={24} />
                </span>
                <h2 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Scanning is disabled</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Both QR Code and RFID attendance are currently disabled in System Settings. Enable at least one credential in System Settings to record attendance.</p>
              </div>
            </div>
          ) : active === 'QR Code' ? (
            <QRScanner {...scannerProps} />
          ) : (
            <RFIDScanner {...scannerProps} />
          )}
        </div>
        <aside className="space-y-4">
          <StudentValidationCard result={result} busy={busy} />
          <ScanResultCard record={result?.outcome === 'success' ? result.record : null} />
        </aside>
      </div>
    </section>
  )
}
