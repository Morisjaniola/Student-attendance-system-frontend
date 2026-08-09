import { LoaderCircle, ScanQrCode, X } from 'lucide-react'
import { useState } from 'react'
import { qrScanCases } from '../../data/attendanceData'

type ScannerPhase = 'idle' | 'scanning' | 'validating'

const sleep = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

interface QRScannerProps {
  onScan: (credential: string) => Promise<void>
  disabled: boolean
}

export function QRScanner({ onScan, disabled }: QRScannerProps) {
  const [value, setValue] = useState('')
  const [phase, setPhase] = useState<ScannerPhase>('idle')

  const trigger = async (credential: string) => {
    const code = credential.trim()
    if (!code || disabled || phase !== 'idle') return
    setValue(code)
    setPhase('scanning')
    await sleep(900)
    setPhase('validating')
    try {
      await onScan(code)
    } finally {
      setPhase('idle')
    }
  }

  const scanning = phase !== 'idle'

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">QR Code Scanning</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${phase === 'idle' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300' : phase === 'scanning' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
          {phase === 'validating' ? <LoaderCircle size={12} className="animate-spin" /> : <span className={`size-1.5 rounded-full ${phase === 'idle' ? 'bg-slate-400' : 'animate-pulse bg-blue-500'}`} />}
          {phase === 'idle' ? 'Ready for QR Scan' : phase === 'scanning' ? 'Scanning…' : 'Validating…'}
        </span>
      </div>

      <div className="relative mx-auto mt-6 grid aspect-square w-full max-w-72 place-items-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60">
        <span className="absolute left-3 top-3 size-6 rounded-tl-lg border-l-2 border-t-2 border-blue-500" />
        <span className="absolute right-3 top-3 size-6 rounded-tr-lg border-r-2 border-t-2 border-blue-500" />
        <span className="absolute bottom-3 left-3 size-6 rounded-bl-lg border-b-2 border-l-2 border-blue-500" />
        <span className="absolute bottom-3 right-3 size-6 rounded-br-lg border-b-2 border-r-2 border-blue-500" />
        <ScanQrCode size={54} className={scanning ? 'animate-pulse text-blue-600' : 'text-slate-300'} />
        {phase === 'scanning' && <span className="absolute inset-x-5 h-0.5 rounded-full bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.9)]" style={{ animation: 'scanline 1.5s ease-in-out infinite' }} />}
      </div>

      <form className="mt-6 flex gap-2" onSubmit={(event) => { event.preventDefault(); trigger(value) }}>
        <label className="relative block min-w-0 flex-1">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Paste or type a QR code, e.g. ATD-26-00001"
            disabled={disabled}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          {value && (
            <button type="button" onClick={() => setValue('')} disabled={disabled} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800" aria-label="Clear QR code">
              <X size={14} />
            </button>
          )}
        </label>
        <button type="submit" disabled={disabled || !value.trim() || phase !== 'idle'} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {phase === 'validating' ? <LoaderCircle size={14} className="animate-spin" /> : <ScanQrCode size={15} />}Scan
        </button>
      </form>

      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo scans</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {qrScanCases.map((scanCase) => (
            <button
              key={scanCase.id}
              type="button"
              onClick={() => trigger(scanCase.credential)}
              disabled={disabled || phase !== 'idle'}
              title={scanCase.hint}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-blue-300"
            >
              {scanCase.label}
              <span className="font-medium text-slate-400">{scanCase.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[10px] leading-5 text-slate-400">Mock scanner — no camera required. A real QR scanner library can be wired to this input when hardware integration begins.</p>
    </div>
  )
}
