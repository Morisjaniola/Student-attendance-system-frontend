import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Scale } from 'lucide-react'
import { formatNumber } from '../../utils/format'
import type { PresentAbsentComparison } from '../../types/analytics'

export function AttendanceComparisonChart({ comparison }: { comparison: PresentAbsentComparison }) {
  const { present, absent } = comparison
  const total = present + absent
  const data = [
    { name: 'Present', value: present, fill: '#10b981' },
    { name: 'Absent', value: absent, fill: '#f43f5e' },
  ]

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Present vs Absent</h2>
          <p className="mt-1 text-xs text-slate-400">Comparison of present and absent attendance records</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Scale size={18} />
        </span>
      </div>

      <div className="mt-5 h-56" aria-label="Present vs absent bar chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value) => [`${formatNumber(Number(value))} records`, '']}
            />
            <Bar dataKey="value" name="Records" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
        <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
          <i className="size-2 rounded-full bg-emerald-500" />
          Present: <span className="font-bold text-slate-900 dark:text-white">{formatNumber(present)}</span>
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
          <i className="size-2 rounded-full bg-rose-500" />
          Absent: <span className="font-bold text-slate-900 dark:text-white">{formatNumber(absent)}</span>
        </span>
        <span className="ml-auto text-slate-400">
          {total > 0 ? `${Math.round((present / total) * 100)}% of records are present` : 'No present or absent records'}
        </span>
      </div>
    </section>
  )
}
