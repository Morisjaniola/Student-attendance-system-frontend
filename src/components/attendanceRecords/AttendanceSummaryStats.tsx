import { CalendarCheck, CircleCheck, CircleX, Clock, GraduationCap, Nfc, QrCode } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { AttendanceStatus } from '../../types/dashboard'
import type { AttendanceRecord } from '../../types/attendanceRecord'
import { statusStyles } from '../../utils/format'

interface StatusMeta {
  status: AttendanceStatus
  icon: LucideIcon
  bar: string
  dot: string
}

const STATUS_META: StatusMeta[] = [
  { status: 'Present', icon: CircleCheck, bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { status: 'Late', icon: Clock, bar: 'bg-amber-500', dot: 'bg-amber-500' },
  { status: 'Excused', icon: CalendarCheck, bar: 'bg-blue-500', dot: 'bg-blue-500' },
  { status: 'Absent', icon: CircleX, bar: 'bg-rose-500', dot: 'bg-rose-500' },
]

function percentageOf(count: number, total: number) {
  return total ? Math.round((count / total) * 100) : 0
}

interface AttendanceSummaryStatsProps {
  /** The currently filtered/search results to summarize. */
  records: AttendanceRecord[]
}

export function AttendanceSummaryStats({ records }: AttendanceSummaryStatsProps) {
  const stats = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = { Present: 0, Late: 0, Excused: 0, Absent: 0 }
    const courses = new Map<string, number>()
    let qrCount = 0
    let rfidCount = 0

    for (const record of records) {
      counts[record.status] += 1
      courses.set(record.student.courseCode, (courses.get(record.student.courseCode) ?? 0) + 1)
      if (record.method === 'QR Code') qrCount += 1
      else rfidCount += 1
    }

    const total = records.length
    const rate = total ? Math.round(((counts.Present + counts.Late + counts.Excused) / total) * 100) : 0
    const topCourses = [...courses.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([course, count]) => ({ course, count }))
    const maxCourseCount = Math.max(1, ...topCourses.map((entry) => entry.count))

    return { counts, total, rate, qrCount, rfidCount, topCourses, maxCourseCount }
  }, [records])

  const percentage = (count: number) => percentageOf(count, stats.total)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5" aria-label="Attendance summary">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status distribution */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Attendance summary</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Based on the <span className="font-bold text-slate-500 dark:text-slate-300">{stats.total}</span> record{stats.total === 1 ? '' : 's'} shown · {stats.rate}% attendance rate
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATUS_META.map(({ status, icon: Icon }) => {
              const count = stats.counts[status]
              return (
                <div key={status} className={`rounded-xl p-3 ring-1 ring-inset ${statusStyles[status]}`}>
                  <div className="flex items-center justify-between">
                    <Icon size={17} strokeWidth={2.2} />
                    <span className="text-lg font-bold leading-none">{count}</span>
                  </div>
                  <p className="mt-2 text-[11px] font-bold">{status}</p>
                  <p className="mt-0.5 text-[10px] opacity-75">{percentage(count)}% of records</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="img"
              aria-label={`Attendance status distribution: ${STATUS_META.map(({ status }) => `${status} ${stats.counts[status]}`).join(', ')}`}
            >
              {STATUS_META.map(({ status, bar }, index) => {
                const pct = percentage(stats.counts[status])
                const fillsRemainder = index === STATUS_META.length - 1 && pct > 0
                return (
                  <div
                    key={status}
                    className={`${bar} transition-all duration-500 ${fillsRemainder ? 'flex-1' : ''}`}
                    style={fillsRemainder ? undefined : { width: `${pct}%` }}
                    title={`${status}: ${stats.counts[status]} (${pct}%)`}
                  />
                )
              })}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {STATUS_META.map(({ status, dot }) => (
                <span key={status} className="flex items-center gap-1.5">
                  <i className={`size-1.5 rounded-full ${dot}`} />
                  {status} <span className="font-bold text-slate-700 dark:text-slate-200">{stats.counts[status]}</span>
                </span>
              ))}
              <span className="ml-auto flex items-center gap-3">
                <span className="flex items-center gap-1"><QrCode size={11} /> QR {stats.qrCount}</span>
                <span className="flex items-center gap-1"><Nfc size={11} /> RFID {stats.rfidCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Per-course breakdown */}
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <GraduationCap size={15} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">By course</h3>
          </div>
          <ul className="mt-3 space-y-3">
            {stats.topCourses.map(({ course, count }) => (
              <li key={course}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-300">{course}</span>
                  <span className="font-mono text-slate-400">{count}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.round((count / stats.maxCourseCount) * 100)}%` }} />
                </div>
              </li>
            ))}
            {stats.topCourses.length === 0 && <li className="text-[11px] text-slate-400">No course data to show.</li>}
          </ul>
          {stats.topCourses.length > 0 && (
            <p className="mt-4 text-[10px] text-slate-400">Showing the top {stats.topCourses.length} courses in the current results.</p>
          )}
        </div>
      </div>
    </section>
  )
}
