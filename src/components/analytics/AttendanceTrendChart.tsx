import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'
import type { AttendanceTrendPoint } from '../../types/dashboard'

const SERIES = [
  { key: 'present', label: 'Present', color: '#10b981' },
  { key: 'absent', label: 'Absent', color: '#f43f5e' },
  { key: 'late', label: 'Late', color: '#f59e0b' },
] as const

export function AttendanceTrendChart({ data }: { data: AttendanceTrendPoint[] }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance trends</h2>
          <p className="mt-1 text-xs text-slate-400">Daily Present, Absent, and Late records over time</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <LineChartIcon size={18} />
        </span>
      </div>
      <div className="mt-5 h-72" aria-label="Attendance trend line chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={20} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,.10)', fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            {SERIES.map(({ key, label, color }) => (
              <Line key={key} type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: color }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
