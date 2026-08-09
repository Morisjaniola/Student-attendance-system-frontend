import { Percent } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import type { AttendancePercentage } from '../../types/analytics'

const RADIUS = 56
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ringColor(rate: number) {
  if (rate >= 75) return '#10b981'
  if (rate >= 50) return '#f59e0b'
  return '#f43f5e'
}

function formatRate(rate: number) {
  return rate % 1 === 0 ? String(rate) : rate.toFixed(1)
}

export function AttendancePercentageCard({ percentage }: { percentage: AttendancePercentage }) {
  const { rate, present, total } = percentage
  const color = ringColor(rate)
  const offset = CIRCUMFERENCE * (1 - rate / 100)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance Rate</h2>
          <p className="mt-1 text-xs text-slate-400">Present records &divide; total records</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
          <Percent size={18} />
        </span>
      </div>

      <div className="relative mx-auto mt-6 size-40" aria-label={`Attendance rate ${formatRate(rate)} percent`}>
        <svg viewBox="0 0 140 140" className="size-full -rotate-90">
          <circle cx="70" cy="70" r={RADIUS} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-800" />
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            stroke={color}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset .6s ease, stroke .3s ease' }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatRate(rate)}
            <small className="text-lg text-slate-400">%</small>
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Present records</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{formatNumber(present)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total records</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{formatNumber(total)}</p>
        </div>
      </div>
    </section>
  )
}
