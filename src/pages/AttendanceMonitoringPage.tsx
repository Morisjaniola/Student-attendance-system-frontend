import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, LoaderCircle, RefreshCw, UsersRound } from 'lucide-react'
import { AttendanceSummaryStats } from '../components/attendanceRecords/AttendanceSummaryStats'
import { AttendanceMethodBadge, AttendanceStatusBadge } from '../components/attendanceRecords/AttendanceBadges'
import { attendanceRecordsService } from '../services/attendanceRecordsService'
import type { AttendanceRecord } from '../types/attendance'
import type { AttendanceStatus } from '../types/dashboard'

/** Dashboard for viewing current attendance activity; capture happens in Live Scanning. */
export function AttendanceMonitoringPage() {
  const queryClient = useQueryClient()
  const { data: records = [], isPending, isError, isFetching } = useQuery({
    queryKey: ['attendance-records'],
    queryFn: attendanceRecordsService.list,
    staleTime: Infinity,
  })
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const todayRecords = records.filter((record) => record.date === today)
  const counts: Record<AttendanceStatus, number> = { Present: 0, Late: 0, Absent: 0, Excused: 0 }
  todayRecords.forEach((record) => { counts[record.status] += 1 })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['attendance-records'] })

  if (isPending) return <LoadingState />
  if (isError) return <ErrorState />

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Attendance overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Attendance Monitoring</h1>
          <p className="mt-1.5 text-sm text-slate-500">Review today’s attendance status and the latest activity across campus.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300"><CalendarDays size={13} />Today · {todayRecords.length} records</span>
          <button type="button" onClick={refresh} disabled={isFetching} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"><RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />Refresh</button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Today's attendance status">
        <MonitoringStat label="Total Present" value={counts.Present} icon={CheckCircle2} tone="emerald" />
        <MonitoringStat label="Total Late" value={counts.Late} icon={Clock3} tone="amber" />
        <MonitoringStat label="Total Absent" value={counts.Absent} icon={AlertCircle} tone="rose" />
        <MonitoringStat label="Total Excused" value={counts.Excused} icon={UsersRound} tone="blue" />
      </section>

      <AttendanceSummaryStats records={todayRecords} />

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent attendance activity</h2><p className="mt-1 text-xs text-slate-400">The latest records submitted by QR and RFID scanners.</p></div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{records.length} total</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.slice(0, 6).map((record) => <RecentAttendance key={record.id} record={record} />)}
          {!records.length && <div className="px-6 py-12 text-center text-sm text-slate-400">No attendance records are available yet.</div>}
        </div>
      </section>
    </div>
  )
}

function MonitoringStat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof CheckCircle2; tone: 'emerald' | 'amber' | 'rose' | 'blue' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
  }
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[28px]">{value}</p><p className="mt-1 text-[11px] text-slate-400">Recorded today</p></div><span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></span></div></article>
}

function RecentAttendance({ record }: { record: AttendanceRecord }) {
  return <article className="flex items-center gap-3 px-5 py-4 sm:px-6"><span className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-bold ${record.student.avatarColor}`}>{record.student.photo ? <img src={record.student.photo} alt="" className="size-full object-cover" /> : record.student.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{record.student.name}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{record.student.studentId} · {record.student.courseCode} · {record.student.section}</p></div><div className="hidden text-right sm:block"><p className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{record.time}</p><p className="mt-0.5 text-[10px] text-slate-400">{record.dateLabel}</p></div><div className="flex shrink-0 flex-col items-end gap-1.5"><AttendanceStatusBadge status={record.status} /><AttendanceMethodBadge method={record.method} /></div></article>
}

function LoadingState() {
  return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading attendance activity…</p></div>
}

function ErrorState() {
  return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Attendance activity could not be loaded. Please refresh and try again.</div></div>
}
