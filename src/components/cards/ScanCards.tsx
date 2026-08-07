import { CheckCircle2, CreditCard, QrCode, Wifi } from 'lucide-react'
import type { ScanMetric } from '../../types/dashboard'
import { formatNumber } from '../../utils/format'

function MiniTrend({ color }: { color: 'blue' | 'violet' }) {
  const stroke = color === 'blue' ? '#2563eb' : '#7c3aed'
  return <svg viewBox="0 0 104 34" className="h-9 w-28" fill="none" aria-label="Successful scan trend"><path d="M1 28C13 29 14 20 25 22c11 2 12-10 23-8 10 1 10 8 20 5 12-4 13-15 20-12 7 2 7 5 15-4" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" /><path d="M1 28C13 29 14 20 25 22c11 2 12-10 23-8 10 1 10 8 20 5 12-4 13-15 20-12 7 2 7 5 15-4V34H1Z" fill={stroke} fillOpacity=".08" /></svg>
}

function ScanCard({ type, scan, lastScan }: { type: 'QR' | 'RFID'; scan: ScanMetric; lastScan?: string }) {
  const isQr = type === 'QR'
  const Icon = isQr ? QrCode : CreditCard
  const color = isQr ? 'blue' : 'violet'
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><span className={`grid size-9 place-items-center rounded-xl ${isQr ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300'}`}><Icon size={19} /></span><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{type} scan overview</p></div><p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatNumber(scan.total)} <span className="text-xs font-medium text-slate-400">scans today</span></p></div><MiniTrend color={color} /></div><div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-3.5 dark:border-slate-800"><div><p className="text-xs text-slate-400">Successful</p><p className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={14} />{formatNumber(scan.successful)}</p></div><div className="border-l border-slate-100 pl-3 dark:border-slate-800"><p className="text-xs text-slate-400">Failed scans</p><p className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400">{formatNumber(scan.failed)}</p></div></div><div className="mt-4"><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-500">Success rate</span><span className="font-bold text-slate-700 dark:text-slate-200">{scan.successRate}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${isQr ? 'bg-blue-600' : 'bg-violet-600'}`} style={{ width: `${scan.successRate}%` }} /></div>{lastScan && <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400"><Wifi size={13} className="text-emerald-500" />Last scan at <span className="font-semibold text-slate-600 dark:text-slate-300">{lastScan}</span></p>}</div></section>
}

export function QRCard({ scan }: { scan: ScanMetric }) { return <ScanCard type="QR" scan={scan} /> }
export function RFIDCard({ scan, lastScan }: { scan: ScanMetric; lastScan: string }) { return <ScanCard type="RFID" scan={scan} lastScan={lastScan} /> }
