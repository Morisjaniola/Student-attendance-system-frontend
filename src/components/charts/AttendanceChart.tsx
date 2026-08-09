import { useId } from 'react'
import { BarChart3, MoreHorizontal } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AttendanceTrendPoint } from '../../types/dashboard'

export function AttendanceChart({ data }: { data: AttendanceTrendPoint[] }) {
  const gradientId = useId().replace(/:/g, '')
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between"><div><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance trend</h2><p className="mt-1 text-xs text-slate-400">Daily attendance rate for the last 30 school days</p></div><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="More attendance chart options"><MoreHorizontal size={20} /></button></div>
      <div className="mt-5 h-66.25" aria-label="Attendance trend chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 4, right: 2, left: -22, bottom: 0 }}><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={26} /><YAxis tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value: number) => `${value}%`} /><Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,.10)', fontSize: 12 }} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} /><Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2.5} fill={`url(#${gradientId})`} activeDot={{ r: 4 }} /><Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><BarChart3 size={15} /><span><strong>2.8% improvement</strong> in average attendance versus the previous 30 days.</span></div>
    </section>
  )
}
