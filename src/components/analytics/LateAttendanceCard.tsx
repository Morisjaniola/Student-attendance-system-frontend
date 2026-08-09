import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import type { LateAttendanceAnalysis } from '../../types/analytics'

export function LateAttendanceCard({ analysis }: { analysis: LateAttendanceAnalysis }) {
  const { totalLate, latePercentage, trend } = analysis
  const data = trend.map((point) => ({ date: point.date, late: point.late }))

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Late Attendance Analysis</h2>
          <p className="mt-1 text-xs text-slate-400">Late Attendance Records over time</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <Clock size={18} />
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total late records</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{formatNumber(totalLate)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Late percentage</p>
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{latePercentage}%</p>
        </div>
      </div>

      <div className="mt-5 h-32" aria-label="Late attendance trend chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -26, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={16} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value) => [`${value} late`, '']}
            />
            <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
        Counts late attendance records — not unique late students.
      </p>
    </section>
  )
}
