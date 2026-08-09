import { Nfc, ScanQrCode } from 'lucide-react'
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
  const scannerProps = {
    onScan: (credential: string) => onScan(activeMethod, credential),
    disabled: busy,
  }

  return (
    <section className="space-y-5">
      <style>{`@keyframes scanline { 0% { top: 10%; } 50% { top: 88%; } 100% { top: 10%; } }`}</style>

      <div role="tablist" aria-label="Scanning method" className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
        <button
          role="tab"
          aria-selected={activeMethod === 'QR Code'}
          onClick={() => onMethodChange('QR Code')}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${activeMethod === 'QR Code' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-950 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <ScanQrCode size={16} />QR Code Scanning
        </button>
        <button
          role="tab"
          aria-selected={activeMethod === 'RFID'}
          onClick={() => onMethodChange('RFID')}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${activeMethod === 'RFID' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-950 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <Nfc size={16} />RFID Scanning
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>{activeMethod === 'QR Code' ? <QRScanner {...scannerProps} /> : <RFIDScanner {...scannerProps} />}</div>
        <aside className="space-y-4">
          <StudentValidationCard result={result} busy={busy} />
          <ScanResultCard record={result?.outcome === 'success' ? result.record : null} />
        </aside>
      </div>
    </section>
  )
}
