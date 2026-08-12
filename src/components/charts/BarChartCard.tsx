import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownUp, BarChart3, CalendarDays, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../../utils/format'
import type { CourseAttendance, CourseAttendanceByPeriod, CourseAttendancePeriod } from '../../types/dashboard'

// ---------------------------------------------------------------------------
// Attendance per course (Admin Dashboard)
//
// Average attendance rate by course across a selectable period, with sorting,
// per-bar percentage labels, a full tooltip, top/lowest/average summaries and
// a previous-period trend indicator. All metrics are computed from the
// existing per-period course data (see data/dashboardData.ts) — nothing is
// hardcoded.
// ---------------------------------------------------------------------------

const PERIOD_OPTIONS: { value: CourseAttendancePeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'semester', label: 'This semester' },
]

type SortMode = 'highest' | 'lowest' | 'name'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'highest', label: 'Highest attendance' },
  { value: 'lowest', label: 'Lowest attendance' },
  { value: 'name', label: 'Course name' },
]

/** Status interpretation for attendance rates (see requirements 6). */
const STATUS_RANGES = [
  { min: 90, label: 'Excellent', legend: '90%+', dot: 'bg-emerald-500' },
  { min: 80, label: 'Good', legend: '80–89%', dot: 'bg-blue-500' },
  { min: 70, label: 'Needs attention', legend: '70–79%', dot: 'bg-amber-500' },
  { min: 0, label: 'Low attendance', legend: '<70%', dot: 'bg-rose-500' },
] as const

function statusFor(rate: number) {
  return STATUS_RANGES.find((range) => rate >= range.min) ?? STATUS_RANGES[STATUS_RANGES.length - 1]
}

/** Mean attendance rate rounded to one decimal; null when there are no courses. */
function meanRate(courses: CourseAttendance[]): number | null {
  if (!courses.length) return null
  return Math.round((courses.reduce((sum, course) => sum + course.rate, 0) / courses.length) * 10) / 10
}

// ---------------------------------------------------------------------------
// Generic labelled dropdown (period / sort). Keyboard accessible: the trigger
// is a button, Escape closes the list, and every option is a focusable button.
// ---------------------------------------------------------------------------

function SelectMenu<T extends string>({
  value,
  onChange,
  options,
  icon: Icon,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  icon: LucideIcon
  label: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Icon size={14} className="text-blue-600 dark:text-blue-400" />
        <span className="whitespace-nowrap">{selected?.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                  {isSelected && <span className="size-1.5 rounded-full bg-blue-600" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tooltip — Course, Attendance Rate, Present / Late / Absent breakdown (when
// the data supports it) and Total Records.
// ---------------------------------------------------------------------------

function CourseTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: CourseAttendance }> }) {
  if (!active || !payload?.length) return null
  const datum = payload[0]?.payload
  if (!datum) return null

  const status = statusFor(datum.rate)
  const hasBreakdown = datum.present != null && datum.absent != null && datum.late != null

  return (
    <div className="min-w-48 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-3 text-xs shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Course</span>
        <span className="flex items-center gap-1.5">
          <span className="font-bold text-slate-800 dark:text-slate-100">{datum.course}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
            <i className={`size-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-6 border-b border-slate-100 pb-2 dark:border-slate-700">
        <span className="text-slate-400">Attendance Rate</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{datum.rate}%</span>
      </div>
      {hasBreakdown && (
        <ul className="mt-2 space-y-1.5">
          <li className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <i className="size-2 rounded-full bg-emerald-500" />
              Present
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(datum.present ?? 0)}</span>
          </li>
          <li className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <i className="size-2 rounded-full bg-amber-500" />
              Late
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(datum.late ?? 0)}</span>
          </li>
          <li className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <i className="size-2 rounded-full bg-rose-500" />
              Absent
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(datum.absent ?? 0)}</span>
          </li>
        </ul>
      )}
      <div className="mt-2 flex items-center justify-between gap-6 border-t border-slate-100 pt-2 dark:border-slate-700">
        <span className="text-slate-400">Total Records</span>
        <span className="font-bold text-slate-800 dark:text-slate-100">{formatNumber(datum.students)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main card.
// ---------------------------------------------------------------------------

export function BarChartCard({ data, isLoading = false }: { data: CourseAttendanceByPeriod; isLoading?: boolean }) {
  const [period, setPeriod] = useState<CourseAttendancePeriod>('week')
  const [sortMode, setSortMode] = useState<SortMode>('highest')

  const periodData = useMemo(() => data[period] ?? [], [data, period])
  const hasData = periodData.length > 0

  const sorted = useMemo(() => {
    const list = [...periodData]
    if (sortMode === 'highest') list.sort((a, b) => b.rate - a.rate)
    else if (sortMode === 'lowest') list.sort((a, b) => a.rate - b.rate)
    else list.sort((a, b) => a.course.localeCompare(b.course))
    return list
  }, [periodData, sortMode])

  const average = useMemo(() => meanRate(periodData), [periodData])
  const top = useMemo(
    () => periodData.reduce<CourseAttendance | null>((best, course) => (best === null || course.rate > best.rate ? course : best), null),
    [periodData],
  )
  const lowest = useMemo(
    () => periodData.reduce<CourseAttendance | null>((best, course) => (best === null || course.rate < best.rate ? course : best), null),
    [periodData],
  )

  // Previous equivalent period -> trend indicator (null when no comparison exists).
  const delta = useMemo(() => {
    const previous = data.previous?.[period] ?? null
    const previousAverage = meanRate(previous ?? [])
    if (average === null || previousAverage === null) return null
    return Math.round((average - previousAverage) * 10) / 10
  }, [data, period, average])

  if (isLoading) {
    return (
      <section
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        aria-busy="true"
        aria-label="Loading attendance per course"
      >
        <div className="flex animate-pulse items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-52 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
        <div className="mt-5 grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-72" />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance per course</h2>
          <p className="mt-1 text-xs text-slate-400">Average attendance rate by course</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelectMenu icon={CalendarDays} label="Attendance period" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
          <SelectMenu icon={ArrowDownUp} label="Sort courses" value={sortMode} onChange={setSortMode} options={SORT_OPTIONS} />
        </div>
      </div>

      {!hasData ? (
        <div className="mt-5 grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-200 px-5 text-center dark:border-slate-700">
          <div>
            <BarChart3 className="mx-auto mb-3 text-slate-300" size={28} />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No course attendance data available</p>
            <p className="mt-1 text-xs text-slate-400">Course attendance rates will appear once records are available.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary metrics — computed from the selected period. */}
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 xl:grid-cols-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Average attendance</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{average?.toFixed(1)}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Top performing course</p>
              <p className="mt-1 truncate text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {top?.course} <span className="font-semibold">· {top?.rate}%</span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Needs attention</p>
              <p className="mt-1 truncate text-sm font-bold text-amber-600 dark:text-amber-400">
                {lowest?.course} <span className="font-semibold">· {lowest?.rate}%</span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Trend</p>
              {delta === null ? (
                <p className="mt-1.5 text-xs font-medium text-slate-400">No previous-period comparison</p>
              ) : (
                <>
                  <p
                    className={`mt-1 flex items-center gap-1 text-sm font-bold tracking-tight ${
                      delta > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : delta < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {delta > 0 ? <TrendingUp size={15} /> : delta < 0 ? <TrendingDown size={15} /> : null}
                    {Math.abs(delta).toFixed(1)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">vs previous period</p>
                </>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="mt-5 h-64 sm:h-72" role="img" aria-label="Bar chart of average attendance rate by course">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} margin={{ top: 24, right: 4, left: 0, bottom: 0 }} barCategoryGap="26%" barSize={30}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="course" tickLine={false} axisLine={false} interval={0} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip content={<CourseTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="rate" name="Attendance rate" fill="#2563eb" radius={[6, 6, 0, 0]} animationDuration={600}>
                  <LabelList
                    dataKey="rate"
                    position="top"
                    offset={8}
                    formatter={(label) => `${label}%`}
                    fill="#64748b"
                    fontSize={11}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status legend */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
            {STATUS_RANGES.map((range) => (
              <span key={range.label} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <i className={`size-2 rounded-full ${range.dot}`} />
                {range.label} · {range.legend}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
